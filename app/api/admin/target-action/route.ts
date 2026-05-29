import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { cleanText, requireAdmin } from '@/lib/server-auth';

const schema = z.object({
  entity: z.enum(['promotion_targets', 'playlists', 'target_claims', 'curator_applications']),
  id: z.string().uuid(),
  action: z.enum(['verify', 'claim', 'reject', 'remove', 'flag_review', 'mark_seed', 'approve_claim', 'needs_info', 'pause', 'opt_out']),
  adminNotes: z.string().optional().default('')
});

const statusByAction: Record<string, string> = {
  verify: 'verified',
  claim: 'claimed',
  reject: 'rejected',
  remove: 'removed',
  flag_review: 'seed',
  mark_seed: 'seed',
  approve_claim: 'approved',
  needs_info: 'needs_info',
  pause: 'paused',
  opt_out: 'opted_out'
};

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return admin.response;

  const contentType = request.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await request.json()
    : Object.fromEntries((await request.formData()).entries());
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: false, error: 'Supabase admin client is not configured.' }, { status: 500 });

  const status = statusByAction[parsed.data.action] || parsed.data.action;
  const updatePayload = parsed.data.entity === 'target_claims'
    ? { status, admin_notes: cleanText(parsed.data.adminNotes), reviewed_at: new Date().toISOString() }
    : parsed.data.entity === 'curator_applications'
      ? { status, admin_notes: cleanText(parsed.data.adminNotes), reviewed_at: new Date().toISOString() }
      : { status, verification_notes: cleanText(parsed.data.adminNotes), last_reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() };

  const { error } = await supabase.from(parsed.data.entity).update(updatePayload).eq('id', parsed.data.id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  await supabase.from('audit_logs').insert({
    actor_id: admin.auth.user.id,
    action: `admin.${parsed.data.action}`,
    entity_type: parsed.data.entity,
    entity_id: parsed.data.id,
    metadata: updatePayload
  });

  return NextResponse.json({ ok: true, message: `${parsed.data.entity} updated`, update: updatePayload });
}
