import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin, normalizeIntent } from '@/lib/supabase-admin';
import { cleanText } from '@/lib/server-auth';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  playlistUrl: z.string().url(),
  intent: z.string().min(2),
  notes: z.string().optional().or(z.literal(''))
});

export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = schema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.redirect(new URL('/claim/success?mode=demo&type=claim', request.url));

  const { error } = await supabase.from('target_claims').insert({
    name: cleanText(parsed.data.name, 160),
    email: parsed.data.email,
    target_url: parsed.data.playlistUrl,
    intent: normalizeIntent(parsed.data.intent),
    notes: cleanText(parsed.data.notes, 2000) || null,
    status: 'new'
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.redirect(new URL('/claim/success?type=claim', request.url));
}
