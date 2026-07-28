import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/server-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({
      ok: true,
      mode: 'demo',
      fans: [
        {
          id: 'demo-fan',
          email: 'listener@example.com',
          firstName: 'Listener',
          sourceChannel: 'smart_link',
          sourceCampaign: 'never-alone-presave',
          firstSeenAt: new Date().toISOString(),
          consentCount: 2
        }
      ]
    });
  }

  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in to view fan records.' }, { status: 401 });

  const { data: fans, error } = await supabase
    .from('fans')
    .select('id,email,first_name,source_channel,source_campaign,first_seen_at,last_seen_at,created_at')
    .eq('owner_user_id', auth.user.id)
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  const ids = (fans || []).map((fan) => fan.id);
  const { data: consents } = ids.length
    ? await supabase.from('fan_consents').select('fan_id,granted').in('fan_id', ids).eq('granted', true)
    : { data: [] };

  return NextResponse.json({
    ok: true,
    fans: (fans || []).map((fan) => ({
      id: fan.id,
      email: fan.email,
      firstName: fan.first_name,
      sourceChannel: fan.source_channel,
      sourceCampaign: fan.source_campaign,
      firstSeenAt: fan.first_seen_at,
      lastSeenAt: fan.last_seen_at,
      consentCount: consents?.filter((consent) => consent.fan_id === fan.id).length || 0
    }))
  });
}
