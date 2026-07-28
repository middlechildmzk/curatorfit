import { NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/artistos-workspace';
import { getRequestUser } from '@/lib/server-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const pageLimit = 500;

export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({
      ok: true,
      mode: 'demo',
      total: 1,
      limit: pageLimit,
      fans: [
        {
          id: 'demo-fan',
          email: 'listener@example.com',
          firstName: 'Listener',
          sourceChannel: 'artistos_smart_link',
          sourceCampaign: 'middle-child-never-alone',
          firstSeenAt: new Date().toISOString(),
          consentCount: 2
        }
      ]
    });
  }

  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in to view fan records.' }, { status: 401 });

  const workspace = await getWorkspaceContext(supabase, auth.user.id);
  if (!workspace) return NextResponse.json({ ok: false, error: 'No ArtistOS workspace is assigned to this account.' }, { status: 403 });

  const { data: fans, error, count } = await supabase
    .from('fans')
    .select('id,email,first_name,consent_source,first_seen,created_at,last_seen_at,source_smart_link_id', { count: 'exact' })
    .eq('workspace_id', workspace.workspaceId)
    .is('archived_at', null)
    .order('created_at', { ascending: false })
    .limit(pageLimit);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  const ids = (fans || []).map((fan) => fan.id);
  const smartLinkIds = [...new Set((fans || []).map((fan) => fan.source_smart_link_id).filter(Boolean))] as string[];

  const [consentResult, linkResult] = await Promise.all([
    ids.length
      ? supabase.from('fan_consents').select('fan_id,granted').eq('workspace_id', workspace.workspaceId).in('fan_id', ids).eq('granted', true)
      : Promise.resolve({ data: [] as Array<{ fan_id: string; granted: boolean }> }),
    smartLinkIds.length
      ? supabase.from('smart_links').select('id,slug').eq('workspace_id', workspace.workspaceId).in('id', smartLinkIds)
      : Promise.resolve({ data: [] as Array<{ id: string; slug: string }> })
  ]);

  const consents = consentResult.data || [];
  const links = linkResult.data || [];

  return NextResponse.json({
    ok: true,
    total: count || 0,
    limit: pageLimit,
    fans: (fans || []).map((fan) => ({
      id: fan.id,
      email: fan.email,
      firstName: fan.first_name,
      sourceChannel: fan.consent_source || 'imported_or_unknown',
      sourceCampaign: links.find((link) => link.id === fan.source_smart_link_id)?.slug || null,
      firstSeenAt: fan.first_seen || fan.created_at,
      lastSeenAt: fan.last_seen_at,
      consentCount: consents.filter((consent) => consent.fan_id === fan.id).length
    }))
  });
}
