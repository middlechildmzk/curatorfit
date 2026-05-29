import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin, normalizeIntent } from '@/lib/supabase-admin';
import { cleanText } from '@/lib/server-auth';

const schema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  primaryUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  channels: z.string().optional(),
  acceptedChannels: z.string().optional(),
  genres: z.string().optional(),
  acceptedGenres: z.string().optional(),
  hardNos: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal(''))
});

export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = schema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.redirect(new URL('/claim/success?mode=demo&type=application', request.url));

  const p = parsed.data;
  const { error } = await supabase.from('curator_applications').insert({
    display_name: cleanText(p.displayName, 160),
    email: p.email,
    primary_url: p.primaryUrl || p.websiteUrl || '',
    channels: (p.channels || p.acceptedChannels || '').split(',').map((x) => cleanText(x, 80)).filter(Boolean),
    genres: (p.genres || p.acceptedGenres || '').split(',').map((x) => cleanText(x, 80)).filter(Boolean),
    hard_nos: p.hardNos ? p.hardNos.split(',').map((x) => cleanText(x, 80)).filter(Boolean) : [],
    notes: cleanText(p.notes || p.bio, 1500),
    status: 'new'
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.redirect(new URL('/claim/success?type=application', request.url));
}
