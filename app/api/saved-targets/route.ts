import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getRequestUser } from '@/lib/server-auth';

const saveSchema = z.object({ targetSlug: z.string().min(1) });
const deleteSchema = z.object({ savedTargetId: z.string().uuid().optional(), targetSlug: z.string().optional() });

export async function GET(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in to view saved targets.' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo', savedTargets: [] });

  const { data, error } = await supabase
    .from('saved_targets')
    .select('id,created_at,promotion_targets(id,slug,name,type,status,trust_score,risk_level,genres,moods,fit_notes,risk_notes,url,audience_size_label)')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, savedTargets: data || [] });
}

export async function POST(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in to save targets.' }, { status: 401 });
  const parsed = saveSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo' });

  const { data: target, error: targetError } = await supabase.from('promotion_targets').select('id').eq('slug', parsed.data.targetSlug).maybeSingle();
  if (targetError) return NextResponse.json({ ok: false, error: targetError.message }, { status: 500 });
  if (!target?.id) return NextResponse.json({ ok: false, error: 'Target not found.' }, { status: 404 });

  const { error } = await supabase.from('saved_targets').upsert({ user_id: auth.user.id, promotion_target_id: target.id }, { onConflict: 'user_id,promotion_target_id' });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  await supabase.from('audit_logs').insert({ actor_id: auth.user.id, action: 'target.saved', entity_type: 'promotion_targets', entity_id: target.id });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in to remove saved targets.' }, { status: 401 });
  const parsed = deleteSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo' });

  let query = supabase.from('saved_targets').delete().eq('user_id', auth.user.id);
  if (parsed.data.savedTargetId) query = query.eq('id', parsed.data.savedTargetId);
  if (parsed.data.targetSlug) {
    const { data: target } = await supabase.from('promotion_targets').select('id').eq('slug', parsed.data.targetSlug).maybeSingle();
    if (target?.id) query = query.eq('promotion_target_id', target.id);
  }
  const { error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
