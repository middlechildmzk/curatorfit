import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createReleaseSlug } from '@/lib/artistos';
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
  campaignGoal: z.string().max(120).default('multi_channel_release')
});

const demoRelease = {
  id: 'demo-release',
  title: 'Never Alone',
  artistName: 'Middle Child',
  releaseDate: '2026-07-31',
  status: 'scheduled',
  isrc: null,
  upc: '882877618355',
  sourceUrl: null,
  smartLink: { id: 'demo-link', slug: 'middle-child-never-alone', mode: 'presave', isActive: true },
  campaign: { id: 'demo-campaign', name: 'Never Alone release campaign', status: 'planning' },
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
  return date.getTime() > today.getTime() ? 'scheduled' : 'live';
}

export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo', releases: [demoRelease] });

  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in to open ArtistOS.' }, { status: 401 });

  const { data: artistProfile } = await supabase
    .from('artist_profiles')
    .select('id,artist_name')
    .eq('user_id', auth.user.id)
    .maybeSingle();

  if (!artistProfile?.id) return NextResponse.json({ ok: true, releases: [] });

  const { data: releases, error } = await supabase
    .from('releases')
    .select('id,title,primary_artist_name,release_date,status,isrc,upc,source_url,created_at')
    .eq('artist_profile_id', artistProfile.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    const migrationMissing = error.message.toLowerCase().includes('releases');
    return NextResponse.json(
      { ok: false, error: migrationMissing ? 'ArtistOS database migration has not been applied yet.' : error.message },
      { status: 500 }
    );
  }

  const releaseIds = (releases || []).map((release) => release.id);
  if (!releaseIds.length) return NextResponse.json({ ok: true, releases: [] });

  const [{ data: links }, { data: campaigns }, { data: evidence }] = await Promise.all([
    supabase.from('smart_links').select('id,release_id,slug,mode,is_active').in('release_id', releaseIds),
    supabase.from('campaigns').select('id,release_id,name,status').in('release_id', releaseIds),
    supabase.from('evidence_records').select('release_id').in('release_id', releaseIds)
  ]);

  const payload = (releases || []).map((release) => ({
    id: release.id,
    title: release.title,
    artistName: release.primary_artist_name || artistProfile.artist_name,
    releaseDate: release.release_date,
    status: release.status,
    isrc: release.isrc,
    upc: release.upc,
    sourceUrl: release.source_url,
    smartLink: links?.find((link) => link.release_id === release.id)
      ? {
          id: links.find((link) => link.release_id === release.id)!.id,
          slug: links.find((link) => link.release_id === release.id)!.slug,
          mode: links.find((link) => link.release_id === release.id)!.mode,
          isActive: links.find((link) => link.release_id === release.id)!.is_active
        }
      : null,
    campaign: campaigns?.find((campaign) => campaign.release_id === release.id)
      ? {
          id: campaigns.find((campaign) => campaign.release_id === release.id)!.id,
          name: campaigns.find((campaign) => campaign.release_id === release.id)!.name,
          status: campaigns.find((campaign) => campaign.release_id === release.id)!.status
        }
      : null,
    evidenceCount: evidence?.filter((record) => record.release_id === release.id).length || 0,
    createdAt: release.created_at
  }));

  return NextResponse.json({ ok: true, releases: payload });
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo', release: demoRelease });

  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in before creating a release.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = createReleaseSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Check the release details and try again.' }, { status: 400 });

  const input = parsed.data;
  await supabase.from('profiles').upsert(
    {
      id: auth.user.id,
      email: auth.user.email,
      display_name: cleanText(input.artistName, 160),
      role: 'artist',
      updated_at: new Date().toISOString()
    },
    { onConflict: 'id' }
  );

  let artistProfileId: string;
  const { data: existingArtist } = await supabase
    .from('artist_profiles')
    .select('id')
    .eq('user_id', auth.user.id)
    .maybeSingle();

  if (existingArtist?.id) {
    artistProfileId = existingArtist.id;
    await supabase.from('artist_profiles').update({ artist_name: cleanText(input.artistName, 160) }).eq('id', artistProfileId);
  } else {
    const { data: artist, error: artistError } = await supabase
      .from('artist_profiles')
      .insert({ user_id: auth.user.id, artist_name: cleanText(input.artistName, 160) })
      .select('id')
      .single();
    if (artistError || !artist) return NextResponse.json({ ok: false, error: artistError?.message || 'Could not create artist profile.' }, { status: 500 });
    artistProfileId = artist.id;
  }

  const slug = createReleaseSlug(input.artistName, input.title);
  const status = releaseStatus(input.releaseDate || undefined);
  const { data: release, error: releaseError } = await supabase
    .from('releases')
    .insert({
      artist_profile_id: artistProfileId,
      title: cleanText(input.title, 160),
      slug,
      primary_artist_name: cleanText(input.artistName, 160),
      release_type: input.releaseType,
      status,
      isrc: cleanText(input.isrc, 40) || null,
      upc: cleanText(input.upc, 40) || null,
      release_date: input.releaseDate || null,
      source_url: input.sourceUrl || null,
      metadata_source: input.sourceUrl ? 'artist_url' : 'manual'
    })
    .select('id,title,primary_artist_name,release_date,status,isrc,upc,source_url,created_at')
    .single();

  if (releaseError || !release) {
    return NextResponse.json({ ok: false, error: releaseError?.message || 'Could not create release.' }, { status: 500 });
  }

  const { data: track } = await supabase
    .from('tracks')
    .insert({
      artist_profile_id: artistProfileId,
      release_id: release.id,
      title: cleanText(input.title, 160),
      track_url: input.sourceUrl || null,
      release_date: input.releaseDate || null
    })
    .select('id')
    .single();

  const linkMode = status === 'scheduled' ? 'presave' : 'live';
  const { data: smartLink, error: linkError } = await supabase
    .from('smart_links')
    .insert({
      release_id: release.id,
      slug,
      mode: linkMode,
      headline: `${input.artistName} — ${input.title}`,
      description: status === 'scheduled' ? 'Presave the release and get notified when it is live.' : 'Choose where to listen.',
      capture_email: true,
      is_active: true
    })
    .select('id,slug,mode,is_active')
    .single();

  if (linkError || !smartLink) return NextResponse.json({ ok: false, error: linkError?.message || 'Release saved, but smart link creation failed.' }, { status: 500 });

  if (input.sourceUrl) {
    await supabase.from('smart_link_destinations').insert({
      smart_link_id: smartLink.id,
      service: inferService(input.sourceUrl),
      url: input.sourceUrl,
      position: 0
    });
  }

  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .insert({
      artist_profile_id: artistProfileId,
      track_id: track?.id || null,
      release_id: release.id,
      name: `${cleanText(input.title, 160)} release campaign`,
      goal: cleanText(input.campaignGoal, 120),
      status: 'planning'
    })
    .select('id,name,status')
    .single();

  if (campaignError || !campaign) return NextResponse.json({ ok: false, error: campaignError?.message || 'Release saved, but campaign creation failed.' }, { status: 500 });

  await supabase.from('audit_logs').insert({
    actor_id: auth.user.id,
    action: 'artistos.release.created',
    entity_type: 'release',
    entity_id: release.id,
    metadata: { smart_link_id: smartLink.id, campaign_id: campaign.id, release_status: status }
  });

  return NextResponse.json({
    ok: true,
    release: {
      id: release.id,
      title: release.title,
      artistName: release.primary_artist_name,
      releaseDate: release.release_date,
      status: release.status,
      isrc: release.isrc,
      upc: release.upc,
      sourceUrl: release.source_url,
      smartLink: { id: smartLink.id, slug: smartLink.slug, mode: smartLink.mode, isActive: smartLink.is_active },
      campaign: { id: campaign.id, name: campaign.name, status: campaign.status },
      evidenceCount: 0,
      createdAt: release.created_at
    }
  });
}
