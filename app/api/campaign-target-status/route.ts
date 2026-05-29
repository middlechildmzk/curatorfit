import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { cleanText, getRequestUser } from '@/lib/server-auth';

const schema = z.object({
  campaignTargetId: z.string().uuid(),
  pitchStatus: z.enum(['saved', 'researching', 'pitch_drafted', 'pitched', 'follow_up', 'passed', 'added', 'not_a_fit', 'do_not_contact']),
  responseNotes: z.string().optional().default(''),
  followUpAt: z.string().optional().default('')
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo', message: 'Status validated.' });
  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in before updating campaign targets.' }, { status: 401 });

  const { data: owned } = await supabase
    .from('campaign_targets')
    .select('id,campaigns(artist_profiles(user_id))')
    .eq('id', parsed.data.campaignTargetId)
    .maybeSingle();

  const ownerId = (owned as any)?.campaigns?.artist_profiles?.user_id;
  if (ownerId !== auth.user.id) return NextResponse.json({ ok: false, error: 'You can only update your own campaign targets.' }, { status: 403 });

  const { error } = await supabase.from('campaign_targets').update({
    pitch_status: parsed.data.pitchStatus,
    response_notes: cleanText(parsed.data.responseNotes, 1500) || null,
    follow_up_at: parsed.data.followUpAt || null
  }).eq('id', parsed.data.campaignTargetId);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
