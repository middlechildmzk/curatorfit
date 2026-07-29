import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getWorkspaceContext } from '@/lib/artistos-workspace';
import { cleanText, getRequestUser } from '@/lib/server-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const manualSchema = z.object({
  action: z.literal('manual_profile'),
  platformSlug: z.string().min(1).max(80),
  artistName: z.string().min(1).max(160),
  profileUrl: z.string().url(),
  externalArtistId: z.string().max(200).optional().or(z.literal(''))
});

const disconnectSchema = z.object({
  action: z.literal('disconnect_manual'),
  profileId: z.string().uuid()
});

const requestSchema = z.discriminatedUnion('action', [manualSchema, disconnectSchema]);

const providerConfig: Record<string, { oauthProvider?: string; configured: () => boolean; metrics: string[]; connectionType: string }> = {
  spotify: { oauthProvider: 'spotify', configured: () => Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET), metrics: ['catalog identity','artist profile','authorized listening context'], connectionType: 'OAuth + platform approval' },
  youtube: { oauthProvider: 'google', configured: () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET), metrics: ['views','watch time','average view duration','subscribers','geography'], connectionType: 'Google OAuth' },
  instagram: { oauthProvider: 'meta', configured: () => Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET), metrics: ['content reach','engagement','audience insights','link attribution'], connectionType: 'Meta Business OAuth' },
  tiktok: { oauthProvider: 'tiktok', configured: () => Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET), metrics: ['video metadata','views','engagement','creator identity'], connectionType: 'TikTok OAuth / partner access' },
  soundcloud: { oauthProvider: 'soundcloud', configured: () => Boolean(process.env.SOUNDCLOUD_CLIENT_ID && process.env.SOUNDCLOUD_CLIENT_SECRET), metrics: ['profile','tracks','playlists','engagement'], connectionType: 'OAuth 2.1 PKCE' },
  'apple-music': { configured: () => Boolean(process.env.APPLE_MUSIC_KEY_ID && process.env.APPLE_MUSIC_TEAM_ID), metrics: ['catalog identity','library actions','destination resolution'], connectionType: 'MusicKit + artist-supplied analytics' },
  bandcamp: { configured: () => false, metrics: ['profile destination','purchase links','manual revenue attribution'], connectionType: 'Verified profile URL' },
  deezer: { configured: () => false, metrics: ['catalog identity','artist profile','destination resolution'], connectionType: 'Catalog API / profile URL' },
  tidal: { configured: () => false, metrics: ['catalog identity','destination resolution'], connectionType: 'Catalog partner / profile URL' },
  'amazon-music': { configured: () => false, metrics: ['catalog identity','destination resolution'], connectionType: 'Catalog partner / profile URL' }
};

export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo', platforms: [] });
  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in to manage platform connections.' }, { status: 401 });
  const workspace = await getWorkspaceContext(supabase, auth.user.id);
  if (!workspace) return NextResponse.json({ ok: false, error: 'Finish onboarding before connecting platforms.' }, { status: 403 });

  const [platformResult, profileResult, oauthResult] = await Promise.all([
    supabase.from('music_platforms').select('id,slug,name,category').order('category').order('name'),
    supabase.from('artist_platform_profiles').select('id,platform_id,artist_name,external_artist_id,profile_url,connection_state,source_type,last_synced_at,last_verified_at,freshness_status,metadata').eq('workspace_id', workspace.workspaceId).eq('owner_id', auth.user.id),
    supabase.from('oauth_connections').select('id,provider,provider_account_id,account_email,expires_at,scopes,last_success_at,last_error,updated_at').eq('user_id', auth.user.id).eq('workspace_id', workspace.workspaceId)
  ]);

  const manualProfiles = profileResult.data || [];
  const oauthConnections = oauthResult.data || [];
  const platforms = (platformResult.data || []).map((platform) => {
    const config = providerConfig[platform.slug] || { configured: () => false, metrics: ['catalog identity','destination resolution'], connectionType: 'Verified profile URL' };
    const manual = manualProfiles.filter((profile) => profile.platform_id === platform.id);
    const oauth = config.oauthProvider ? oauthConnections.find((connection) => connection.provider === config.oauthProvider) || null : null;
    return {
      ...platform,
      oauthConfigured: config.configured(),
      connectionType: config.connectionType,
      metrics: config.metrics,
      oauthConnection: oauth,
      profiles: manual,
      status: oauth ? 'authorized' : manual.length ? 'profile_linked' : config.configured() ? 'ready_to_connect' : 'setup_required'
    };
  });

  return NextResponse.json({ ok: true, platforms });
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo' });
  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in before changing connections.' }, { status: 401 });
  const workspace = await getWorkspaceContext(supabase, auth.user.id);
  if (!workspace) return NextResponse.json({ ok: false, error: 'Finish onboarding before connecting platforms.' }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid platform connection request.' }, { status: 400 });
  const input = parsed.data;

  if (input.action === 'disconnect_manual') {
    const { error } = await supabase.from('artist_platform_profiles').delete().eq('id', input.profileId).eq('owner_id', auth.user.id).eq('workspace_id', workspace.workspaceId);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const { data: platform } = await supabase.from('music_platforms').select('id,slug,name').eq('slug', input.platformSlug).maybeSingle();
  if (!platform) return NextResponse.json({ ok: false, error: 'Platform not found.' }, { status: 404 });
  const artistName = cleanText(input.artistName, 160);
  const { data, error } = await supabase.from('artist_platform_profiles').upsert({
    owner_id: auth.user.id,
    workspace_id: workspace.workspaceId,
    platform_id: platform.id,
    artist_name: artistName,
    external_artist_id: cleanText(input.externalArtistId, 200) || null,
    profile_url: input.profileUrl,
    connection_state: 'linked',
    source_type: 'manual',
    freshness_status: 'unverified',
    metadata: { provenance: 'user_supplied', verification_level: 'self_reported', platform_slug: platform.slug }
  }, { onConflict: 'owner_id,platform_id,artist_name' }).select('id,artist_name,profile_url,connection_state,source_type,freshness_status').single();
  if (error || !data) return NextResponse.json({ ok: false, error: error?.message || 'Could not save the platform profile.' }, { status: 500 });
  return NextResponse.json({ ok: true, profile: data });
}
