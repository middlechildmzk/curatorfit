import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verificationLevels } from '@/lib/artistos';
import { getWorkspaceContext } from '@/lib/artistos-workspace';
import { getRequestUser } from '@/lib/server-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const schema = z.object({
  releaseId: z.string().uuid(),
  evidenceUrl: z.string().url(),
  verificationLevel: z.enum(['L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'L11']).default('L5'),
  method: z.enum(['live_url', 'screenshot', 'self_reported', 'inference']).default('live_url')
});

function confidenceLabel(level: keyof typeof verificationLevels) {
  if (['L1', 'L2'].includes(level)) return 'verified';
  if (['L3', 'L4', 'L5'].includes(level)) return 'supported';
  if (['L6', 'L7', 'L8'].includes(level)) return 'weak';
  return 'unknown';
}

function sourceType(method: string) {
  if (method === 'screenshot') return 'uploaded_file';
  if (method === 'self_reported') return 'human_attestation';
  if (method === 'inference') return 'system_observation';
  return 'url';
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo' });

  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in before recording proof.' }, { status: 401 });

  const workspace = await getWorkspaceContext(supabase, auth.user.id);
  if (!workspace) return NextResponse.json({ ok: false, error: 'No ArtistOS workspace is assigned to this account.' }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Provide a valid evidence URL. Manual evidence cannot be labeled L1-L4.' }, { status: 400 });

  const input = parsed.data;
  const { data: release } = await supabase
    .from('releases')
    .select('id,artist_id,title')
    .eq('id', input.releaseId)
    .eq('workspace_id', workspace.workspaceId)
    .maybeSingle();

  if (!release) return NextResponse.json({ ok: false, error: 'Release not found in your workspace.' }, { status: 404 });

  const confidenceScore = verificationLevels[input.verificationLevel].confidence;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const contentHash = createHash('sha256').update(`${input.releaseId}:${input.evidenceUrl}:${now.toISOString()}`).digest('hex');

  const { data: evidence, error } = await supabase
    .from('evidence_records')
    .insert({
      workspace_id: workspace.workspaceId,
      artist_id: release.artist_id,
      release_id: release.id,
      evidence_type: 'release_promotion_proof',
      source_type: sourceType(input.method),
      source_uri: input.evidenceUrl,
      summary: `Submitted promotion evidence for ${release.title}`,
      confidence: confidenceLabel(input.verificationLevel),
      observed_at: now.toISOString(),
      captured_by: auth.user.id,
      content_hash: contentHash,
      metadata: { submitted_by: 'artist', source: 'release_command_center' },
      verification_level: input.verificationLevel,
      verification_method: input.method,
      verification_status: 'pending',
      confidence_score: confidenceScore,
      contradiction_state: 'clear',
      expires_at: expiresAt.toISOString()
    })
    .select('id,verification_level,verification_method,verification_status,confidence_score,observed_at,expires_at')
    .single();

  if (error || !evidence) return NextResponse.json({ ok: false, error: error?.message || 'Could not record evidence.' }, { status: 500 });
  return NextResponse.json({ ok: true, evidence });
}
