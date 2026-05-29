import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { cleanText, getRequestUser } from '@/lib/server-auth';

const schema = z.object({
  campaignName: z.string().min(2),
  artistName: z.string().min(1),
  trackTitle: z.string().min(1),
  trackUrl: z.string().optional().or(z.literal('')),
  goal: z.string().default('pitch_tracking'),
  targetSlug: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal(''))
});

export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = schema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid campaign form.' }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo', message: 'Campaign validated. Add Supabase to persist.' });

  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in before saving a campaign.' }, { status: 401 });

  const p = parsed.data;
  await supabase.from('profiles').upsert({ id: auth.user.id, email: auth.user.email, display_name: cleanText(p.artistName, 140), role: 'artist', updated_at: new Date().toISOString() }, { onConflict: 'id' });

  let artistProfileId: string | null = null;
  const { data: existingArtist } = await supabase.from('artist_profiles').select('id').eq('user_id', auth.user.id).maybeSingle();
  if (existingArtist?.id) {
    artistProfileId = existingArtist.id;
    await supabase.from('artist_profiles').update({ artist_name: cleanText(p.artistName, 160) }).eq('id', artistProfileId);
  } else {
    const { data: artist, error: artistError } = await supabase.from('artist_profiles').insert({ user_id: auth.user.id, artist_name: cleanText(p.artistName, 160) }).select('id').single();
    if (artistError) return NextResponse.json({ ok: false, error: artistError.message }, { status: 500 });
    artistProfileId = artist.id;
  }

  const { data: track, error: trackError } = await supabase.from('tracks').insert({ artist_profile_id: artistProfileId, title: cleanText(p.trackTitle, 160), track_url: p.trackUrl || null, notes: cleanText(p.notes, 1000) || null }).select('id').single();
  if (trackError) return NextResponse.json({ ok: false, error: trackError.message }, { status: 500 });

  const { data: campaign, error: campaignError } = await supabase.from('campaigns').insert({ artist_profile_id: artistProfileId, track_id: track.id, name: cleanText(p.campaignName, 160), goal: cleanText(p.goal, 80), status: 'planning' }).select('id').single();
  if (campaignError) return NextResponse.json({ ok: false, error: campaignError.message }, { status: 500 });

  if (p.targetSlug) {
    const { data: target } = await supabase.from('promotion_targets').select('id,type').eq('slug', p.targetSlug).maybeSingle();
    if (target?.id) await supabase.from('campaign_targets').insert({ campaign_id: campaign.id, promotion_target_id: target.id, channel: target.type, pitch_status: 'saved', notes: cleanText(p.notes, 1000) || null });
  }

  await supabase.from('audit_logs').insert({ actor_id: auth.user.id, action: 'campaign.created', entity_type: 'campaign', entity_id: campaign.id, metadata: { target_slug: p.targetSlug || null } });
  return NextResponse.json({ ok: true, campaignId: campaign.id });
}
