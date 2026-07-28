import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verificationLevels } from '@/lib/artistos';
import { getRequestUser } from '@/lib/server-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const schema = z.object({
  releaseId: z.string().uuid(),
  evidenceUrl: z.string().url(),
  verificationLevel: z.enum(['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'L11']).default('L5'),
  method: z.enum(['public_api', 'account_oauth', 'artist_oauth', 'professional_oauth', 'live_url', 'screenshot', 'third_party', 'self_reported', 'inference']).default('live_url')
});

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo' });

  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in before recording proof.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Provide a valid evidence URL and verification method.' }, { status: 400 });

  const input = parsed.data;
  const { data: release } = await supabase
    .from('releases')
    .select('id,artist_profile_id')
    .eq('id', input.releaseId)
    .maybeSingle();

  if (!release) return NextResponse.json({ ok: false, error: 'Release not found.' }, { status: 404 });

  const { data: artistProfile } = await supabase
    .from('artist_profiles')
    .select('user_id')
    .eq('id', release.artist_profile_id)
    .maybeSingle();

  if (artistProfile?.user_id !== auth.user.id) return NextResponse.json({ ok: false, error: 'You do not own this release.' }, { status: 403 });

  const confidence = verificationLevels[input.verificationLevel].confidence;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (input.verificationLevel === 'L1' ? 60 : 24 * 60) * 60 * 1000);
  const contentHash = createHash('sha256').update(`${input.releaseId}:${input.evidenceUrl}:${now.toISOString()}`).digest('hex');

  const { data: evidence, error } = await supabase
    .from('evidence_records')
    .insert({
      release_id: input.releaseId,
      verification_level: input.verificationLevel,
      method: input.method,
      status: input.verificationLevel === 'L1' && input.method === 'public_api' ? 'verified' : 'pending',
      evidence_url: input.evidenceUrl,
      content_hash: contentHash,
      raw_payload: { submitted_by: 'artist', source: 'release_command_center' },
      confidence_score: confidence,
      contradiction: 'clear',
      observed_at: now.toISOString(),
      verified_at: input.verificationLevel === 'L1' && input.method === 'public_api' ? now.toISOString() : null,
      expires_at: expiresAt.toISOString(),
      created_by: auth.user.id
    })
    .select('id,verification_level,method,status,confidence_score,observed_at,expires_at')
    .single();

  if (error || !evidence) return NextResponse.json({ ok: false, error: error?.message || 'Could not record evidence.' }, { status: 500 });

  await supabase.from('audit_logs').insert({
    actor_id: auth.user.id,
    action: 'artistos.evidence.appended',
    entity_type: 'evidence_record',
    entity_id: evidence.id,
    metadata: { release_id: input.releaseId, verification_level: input.verificationLevel, method: input.method }
  });

  return NextResponse.json({ ok: true, evidence });
}
