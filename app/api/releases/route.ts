import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createReleaseSlug } from '@/lib/artistos';
import { canManageWorkspace, findOrCreateArtist, getWorkspaceContext } from '@/lib/artistos-workspace';
import { cleanText, getRequestUser } from '@/lib/server-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const createReleaseSchema = z.object({
  artistName: z.string().min(1).max(160),
  title: z.string().min(1).max(160),
  releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  isrc: z.string().max(40).optional().or(z.literal('')),
  upc: z.string().max(40).optional().or(z.literal('')),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  releaseType: z.enum(['single', 'ep', 'album', 'remix', 'other']).default('single'),
  campaignGoal: z.string().max(500).default('multi_channel_release')
});

const demoRelease = {
  id: 'demo-release',
  title: 'Never Alone',
  artistName: 'Middle Child',
  releaseDate: '2026-07-31',
  status: 'upcoming',
  isrc: null,
  upc: '882877618355',
  sourceUrl: null,
  smartLink: { id: 'demo-link', slug: 'middle-child-never-alone', mode: 'presave', isActive: true },
  campaign: { id: 'demo-campaign', name: 'Never Alone Release Campaign', status: 'active' },
  evidenceCount: 0,
  createdAt: new Date().toISOString()
};

function inferService(url: string) {
  if (url.includes('spotify.com')) return 'spotify';
  if (url.includes('music.apple.com')) return 'apple_music';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube_music';
  if (url.includes('soundcloud.com')) return 'soundcloud';
  if (url.includes('bandcamp.com')) return 'bandcamp';
  if (url.includes('deezer.com')) return 'deezer';
  if (url.includes('tidal.com')) return 'tidal';
  if (url.includes('amazon.')) return 'amazon_music';
  return 'source';
}

function releaseStatus(releaseDate?: string) {
  if (!releaseDate) return 'draft';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(`${releaseDate}T00:00:00`);
  return date.getTime() > today.getTime() ? 'upcoming' : 'released';
}

export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo', releases: [demoRelease] });

  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in to open ArtistOS.' }, { status: 401 });

  const workspace = await getWorkspaceContext(supabase, auth.user.id);
  if (!workspace) return NextResponse.json({ ok: false, error: 'No ArtistOS workspace is assigned to this account.' }, { status: 403 });

  const { data: releases, error } = await supabase
    .from('releases')
    .select('id,artist_id,title,release_date,status,isrc,upc,spotify_url,created_at')
    .eq('workspace_id', workspace.workspaceId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  const releaseIds = (releases || []).map((release) => release.id);
  const artistIds = [...new Set((releases || []).map((release) => release.artist_id))];

  const [artistsResult, linksResult, campaignsResult, evidenceResult] = await Promise.all([
    artistIds.length
      ? supabase.from('artists').select('id,name').in('id', artistIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
    releaseIds.length
      ? supabase.from('smart_links').select('id,release_id,slug,mode,is_active').eq('workspace_id', workspace.workspaceId).in('release_id', releaseIds)
      : Promise.resolve({ data: [] as Array<{ id: string; release_id: string; slug: string; mode: string; is_active: boolean }> }),
    releaseIds.length
      ? supabase.from('campaigns').select('id,release_id,name,status').eq('workspace_id', workspace.workspaceId).in('release_id', releaseIds)
      : Promise.resolve({ data: [] as Array<{ id: string; release_id: string; name: string; status: string }> }),
    releaseIds.length
      ? supabase.from('evidence_records').select('release_id').eq('workspace_id', workspace.workspaceId).in('release_id', releaseIds).is('revoked_at', null)
      : Promise.resolve({ data: [] as Array<{ release_id: string }> })
  ]);

  const artists = artistsResult.data || [];
  const links = linksResult.data || [];
  const campaigns = campaignsResult.data || [];
  const evidence = evidenceResult.data || [];

  return NextResponse.json({
    ok: true,
    releases: (releases || []).map((release) => {
      const link = links.find((item) => item.release_id === release.id) || null;
      const campaign = campaigns.find((item) => item.release_id === release.id) || null;
      return {
        id: release.id,
        title: release.title,
        artistName: artists.find((artist) => artist.id === release.artist_id)?.name || 'Unknown artist',
        releaseDate: release.release_date,
        status: release.status,
        isrc: release.isrc,
        upc: release.upc,
        sourceUrl: release.spotify_url,
        smartLink: link ? { id: link.id, slug: link.slug, mode: link.mode, isActive: link.is_active } : null,
        campaign: campaign ? { id: campaign.id, name: campaign.name, status: campaign.status } : null,
        evidenceCount: evidence.filter((record) => record.release_id === release.id).length,
        createdAt: release.created_at
      };
    })
  });
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo', release: demoRelease });

  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in before creating a release.' }, { status: 401 });

  const workspace = await getWorkspaceContext(supabase, auth.user.id);
  if (!workspace || !canManageWorkspace(workspace.role)) {
    return NextResponse.json({ ok: false, error: 'Editor access is required to create releases.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createReleaseSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Check the release details and try again.' }, { status: 400 });

  const input = parsed.data;
  const artistName = cleanText(input.artistName, 160);
  const title = cleanText(input.title, 160);
  const artist = await findOrCreateArtist(supabase, workspace.workspaceId, artistName);
  if (!artist) return NextResponse.json({ ok: false, error: 'Could not resolve the artist profile.' }, { status: 500 });

  const status = releaseStatus(input.releaseDate || undefined);
  const sourceUrl = input.sourceUrl || '';
  const { data: release, error: releaseError } = await supabase
    .from('releases')
    .insert({
      workspace_id: workspace.workspaceId,
      artist_id: artist.id,
      title,
      release_date: input.releaseDate || null,
      status,
      isrc: cleanText(input.isrc, 40) || null,
      upc: cleanText(input.upc, 40) || null,
      spotify_url: sourceUrl.includes('spotify.com') ? sourceUrl : null,
      notes: `Release type: ${input.releaseType}. Created through ArtistOS Release Command Center.`
    })
    .select('id,artist_id,title,release_date,status,isrc,upc,spotify_url,created_at')
    .single();

  if (releaseError || !release) return NextResponse.json({ ok: false, error: releaseError?.message || 'Could not create release.' }, { status: 500 });

  const slug = createReleaseSlug(artistName, title);
  const linkMode = status === 'upcoming' ? 'presave' : 'live';
  const { data: smartLink, error: linkError } = await supabase
    .from('smart_links')
    .insert({
      workspace_id: workspace.workspaceId,
      owner_id: auth.user.id,
      release_id: release.id,
      slug,
      mode: linkMode,
      headline: `${artistName} — ${title}`,
      description: status === 'upcoming' ? 'Get notified when the release goes live.' : 'Choose where to listen.',
      capture_email: true,
      is_active: true
    })
    .select('id,slug,mode,is_active')
    .single();

  if (linkError || !smartLink) {
    await supabase.from('releases').delete().eq('id', release.id);
    return NextResponse.json({ ok: false, error: linkError?.message || 'Could not create the fan link.' }, { status: 500 });
  }

  if (sourceUrl) {
    await supabase.from('smart_link_destinations').insert({
      workspace_id: workspace.workspaceId,
      smart_link_id: smartLink.id,
      service: inferService(sourceUrl),
      url: sourceUrl,
      position: 0
    });
  }

  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .insert({
      workspace_id: workspace.workspaceId,
      release_id: release.id,
      name: `${title} Release Campaign`,
      status: 'active',
      start_date: new Date().toISOString().slice(0, 10),
      goals: cleanText(input.campaignGoal, 500)
    })
    .select('id,name,status')
    .single();

  if (campaignError || !campaign) {
    await supabase.from('releases').delete().eq('id', release.id);
    return NextResponse.json({ ok: false, error: campaignError?.message || 'Could not create the campaign.' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    release: {
      id: release.id,
      title: release.title,
      artistName: artist.name,
      releaseDate: release.release_date,
      status: release.status,
      isrc: release.isrc,
      upc: release.upc,
      sourceUrl: release.spotify_url || sourceUrl || null,
      smartLink: { id: smartLink.id, slug: smartLink.slug, mode: smartLink.mode, isActive: smartLink.is_active },
      campaign: { id: campaign.id, name: campaign.name, status: campaign.status },
      evidenceCount: 0,
      createdAt: release.created_at
    }
  });
}
