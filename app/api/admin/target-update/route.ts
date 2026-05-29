import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { cleanText, requireAdmin } from '@/lib/server-auth';

const schema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).optional(),
  status: z.enum(['seed', 'unclaimed', 'claimed', 'verified', 'partner', 'paused', 'opted_out', 'removed', 'rejected']).optional(),
  riskLevel: z.enum(['low', 'medium', 'review', 'high']).optional(),
  trustScore: z.coerce.number().min(0).max(100).optional(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  verificationNotes: z.string().optional().default(''),
  riskNotes: z.string().optional().default(''),
  fitNotes: z.string().optional().default(''),
  submissionRules: z.string().optional().default('')
});

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return admin.response;
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: false, error: 'Supabase admin client is not configured.' }, { status: 500 });

  const p = parsed.data;
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString(), last_reviewed_at: new Date().toISOString() };
  if (p.name) payload.name = cleanText(p.name, 160);
  if (p.status) payload.status = p.status;
  if (p.riskLevel) payload.risk_level = p.riskLevel;
  if (typeof p.trustScore === 'number') payload.trust_score = p.trustScore;
  if (typeof p.sourceUrl === 'string') payload.source_url = p.sourceUrl || null;
  if (p.verificationNotes) payload.verification_notes = cleanText(p.verificationNotes, 1500);
  if (p.riskNotes) payload.risk_notes = cleanText(p.riskNotes, 1500);
  if (p.fitNotes) payload.fit_notes = cleanText(p.fitNotes, 1500);
  if (p.submissionRules) payload.submission_rules = cleanText(p.submissionRules, 1500);

  const { error } = await supabase.from('promotion_targets').update(payload).eq('id', p.id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  await supabase.from('audit_logs').insert({
    actor_id: admin.auth.user.id,
    action: 'admin.target_updated',
    entity_type: 'promotion_targets',
    entity_id: p.id,
    metadata: payload
  });
  return NextResponse.json({ ok: true, update: payload });
}
