import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const targetTypes = ['spotify_playlist', 'soundcloud_channel', 'youtube_channel', 'tiktok_creator', 'blog', 'radio', 'label', 'sync_library'] as const;

const schema = z.object({
  name: z.string().min(2),
  url: z.string().url(),
  type: z.enum(targetTypes),
  genres: z.string().optional(),
  moods: z.string().optional(),
  owner: z.string().optional(),
  contactMethod: z.string().optional(),
  notes: z.string().optional()
});

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || `target-${Date.now()}`;
}

function splitTags(value?: string) {
  return (value || '').split(',').map((item) => item.trim()).filter(Boolean);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = schema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });

  const payload = {
    name: parsed.data.name,
    url: parsed.data.url,
    slug: slugify(parsed.data.name),
    type: parsed.data.type,
    genres: splitTags(parsed.data.genres),
    moods: splitTags(parsed.data.moods),
    contact_method: parsed.data.contactMethod || 'Manual review before outreach',
    fit_notes: parsed.data.notes || 'Community-submitted target. Needs admin review before premium routing.',
    risk_notes: 'Submitted through target suggestion form. Verify before outreach.',
    status: 'seed',
    risk_level: 'review',
    trust_score: 50
  };

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ ok: true, mode: 'demo', message: 'Target validated. Add Supabase env vars to save it.', data: payload });
  }

  const { error } = await supabase.from('promotion_targets').insert(payload);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  await supabase.from('audit_logs').insert({ action: 'promotion_target_suggested', entity_type: 'promotion_targets', metadata: payload });
  return NextResponse.json({ ok: true, message: 'Promotion target submitted for review', data: payload });
}
