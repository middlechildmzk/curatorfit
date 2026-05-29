import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const schema = z.object({
  userId: z.string().uuid(),
  email: z.string().email().optional().or(z.literal('')),
  displayName: z.string().min(1),
  role: z.enum(['artist', 'curator', 'admin']).default('artist'),
  artistName: z.string().optional().or(z.literal('')),
  spotifyArtistUrl: z.string().optional().or(z.literal('')),
  soundcloudUrl: z.string().optional().or(z.literal('')),
  youtubeUrl: z.string().optional().or(z.literal('')),
  tiktokUrl: z.string().optional().or(z.literal('')),
  websiteUrl: z.string().optional().or(z.literal('')),
  primaryGenres: z.string().optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal('')),
  acceptedGenres: z.string().optional().or(z.literal('')),
  hardNos: z.string().optional().or(z.literal(''))
});

const split = (value?: string) => (value || '').split(',').map((item) => item.trim()).filter(Boolean);

export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = schema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid profile form.' }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo', message: 'Profile validated. Add Supabase service key to persist.' });

  const p = parsed.data;
  const now = new Date().toISOString();
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: p.userId,
    email: p.email || null,
    display_name: p.displayName,
    role: p.role,
    updated_at: now
  }, { onConflict: 'id' });
  if (profileError) return NextResponse.json({ ok: false, error: profileError.message }, { status: 500 });

  if (p.artistName) {
    const { data: existing } = await supabase.from('artist_profiles').select('id').eq('user_id', p.userId).maybeSingle();
    const payload = {
      user_id: p.userId,
      artist_name: p.artistName,
      spotify_artist_url: p.spotifyArtistUrl || null,
      soundcloud_url: p.soundcloudUrl || null,
      youtube_url: p.youtubeUrl || null,
      tiktok_url: p.tiktokUrl || null,
      website_url: p.websiteUrl || null,
      primary_genres: split(p.primaryGenres)
    };
    const { error } = existing?.id
      ? await supabase.from('artist_profiles').update(payload).eq('id', existing.id)
      : await supabase.from('artist_profiles').insert(payload);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  if (p.role === 'curator' || p.acceptedGenres || p.bio || p.hardNos) {
    const { data: existing } = await supabase.from('curator_profiles').select('id').eq('user_id', p.userId).maybeSingle();
    const payload = {
      user_id: p.userId,
      display_name: p.displayName,
      bio: p.bio || null,
      website_url: p.websiteUrl || null,
      accepted_genres: split(p.acceptedGenres),
      hard_nos: split(p.hardNos),
      status: 'claimed',
      updated_at: now
    };
    const { error } = existing?.id
      ? await supabase.from('curator_profiles').update(payload).eq('id', existing.id)
      : await supabase.from('curator_profiles').insert(payload);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  await supabase.from('audit_logs').insert({ actor_id: p.userId, action: 'profile.updated', entity_type: 'profile', entity_id: p.userId, metadata: { role: p.role } });
  return NextResponse.json({ ok: true, message: 'Profile saved.' });
}
