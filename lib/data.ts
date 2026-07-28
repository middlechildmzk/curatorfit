import { playlists, promotionTargets, type ChannelType, type Playlist, type PromotionTarget, type TrustTier } from '@/data/seed';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

function mapDbPlaylist(row: any): Playlist {
  return {
    slug: row.slug,
    name: row.name,
    curator: row.curator_profiles?.display_name || 'Unclaimed curator',
    status: row.status === 'verified' ? 'verified' : row.status === 'claimed' ? 'claimed' : 'unclaimed',
    genre: row.genre || 'Uncategorized',
    moods: row.moods || [],
    followers: row.followers || 0,
    updateSignal: row.update_signal || 'Needs review',
    description: row.description || '',
    fitTags: row.fit_tags || [],
    riskLevel: row.risk_level === 'low' ? 'Low' : row.risk_level === 'medium' ? 'Medium' : 'Review',
    trustScore: row.trust_score || 50,
    spotifyUrl: row.spotify_url || row.url || '#'
  };
}

function labelForType(type: string) {
  const labelMap: Record<string, string> = {
    spotify_playlist: 'Spotify Playlist',
    soundcloud_channel: 'SoundCloud / Repost Channel',
    youtube_channel: 'YouTube Music Channel',
    tiktok_creator: 'TikTok Creator',
    instagram_creator: 'Instagram Creator',
    blog: 'Music Blog / Publication',
    newsletter: 'Music Newsletter',
    radio: 'Radio / Station',
    label: 'Label / A&R',
    sync_library: 'Sync Library',
    community: 'Music Community',
    other: 'Music Opportunity'
  };
  return labelMap[type] || type;
}

function mapDbTarget(row: any): PromotionTarget {
  return {
    slug: row.slug,
    name: row.name,
    type: row.type,
    channelLabel: labelForType(row.type),
    owner: row.curator_profiles?.display_name || 'Unclaimed owner',
    status: row.status || 'seed',
    audienceSize: row.audience_size_label || (row.audience_count ? `${row.audience_count.toLocaleString()} audience` : 'Seed profile'),
    genres: row.genres || (row.genre ? [row.genre] : []),
    moods: row.moods || [],
    contactMethod: row.contact_method || 'Claim profile before accepting pitches',
    submissionRules: row.submission_rules || 'No guaranteed placement. Review fit before outreach.',
    trustScore: row.trust_score || 50,
    fitNotes: row.fit_notes || row.description || '',
    riskNotes: row.risk_notes || 'Needs verification before premium routing.',
    url: row.url || '#'
  };
}

function coreChannelType(property: any): ChannelType {
  const source = `${property.property_type || ''} ${property.platform || ''}`.toLowerCase();
  if (source.includes('spotify') || source.includes('playlist')) return 'spotify_playlist';
  if (source.includes('youtube')) return 'youtube_channel';
  if (source.includes('tiktok')) return 'tiktok_creator';
  if (source.includes('instagram')) return 'instagram_creator';
  if (source.includes('soundcloud')) return 'soundcloud_channel';
  if (source.includes('radio')) return 'radio';
  if (source.includes('newsletter')) return 'newsletter';
  if (source.includes('blog') || source.includes('publication') || source.includes('press') || source.includes('website')) return 'blog';
  if (source.includes('label')) return 'label';
  if (source.includes('sync')) return 'sync_library';
  if (source.includes('community') || source.includes('discord')) return 'community';
  return 'other';
}

function coreTrustTier(property: any): TrustTier {
  const verification = String(property.verification_status || '').toLowerCase();
  const activity = String(property.activity_status || '').toLowerCase();
  const strength = Number(property.evidence_strength || 0);
  if (verification === 'verified' && strength >= 4) return 'verified';
  if (verification === 'verified') return 'verified_candidate';
  if (strength >= 3 && activity !== 'inactive') return 'manually_reviewed';
  if (strength >= 1) return 'candidate';
  return 'seed';
}

function coreTrustScore(property: any) {
  const strength = Math.max(0, Math.min(5, Number(property.evidence_strength || 0)));
  const verifiedBonus = String(property.verification_status || '').toLowerCase() === 'verified' ? 20 : 0;
  const activeBonus = ['active', 'current', 'recent'].includes(String(property.activity_status || '').toLowerCase()) ? 10 : 0;
  return Math.max(35, Math.min(95, 35 + strength * 10 + verifiedBonus + activeBonus));
}

function splitLegacyGenres(value: unknown) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value !== 'string') return [];
  return value.split(/[,;|]/).map((item) => item.trim()).filter(Boolean).slice(0, 12);
}

function mapCoreProperty(row: any): PromotionTarget {
  const type = coreChannelType(row);
  const organization = row.organizations;
  const owner = row.owner_or_operator || organization?.display_name || organization?.canonical_name || 'Owner not yet confirmed';
  const genres = row.genre_tags?.length ? row.genre_tags : splitLegacyGenres(row.genres);
  const audienceSize = row.followers_estimate || row.followers_legacy || 'Audience not yet verified';
  const verification = row.verification_status || 'unverified';
  const activity = row.activity_status || 'unknown';

  return {
    slug: `property-${row.id}`,
    name: row.name || 'Unnamed music property',
    type,
    channelLabel: labelForType(type),
    owner,
    status: coreTrustTier(row),
    audienceSize,
    genres,
    moods: [],
    contactMethod: row.contact_emails ? 'Verified contact data requires workspace access' : 'Research the official submission route before outreach',
    submissionRules: 'Editorial consideration only. No guaranteed placement, streams, coverage, or response.',
    trustScore: coreTrustScore(row),
    fitNotes: row.notes || `${labelForType(type)} on ${row.platform || 'an identified music channel'}. Review genre and activity evidence before pitching.`,
    riskNotes: `Verification: ${verification}. Activity: ${activity}. Evidence strength: ${row.evidence_strength || 0}/5.`,
    url: row.platform_url || row.url || organization?.website || '#',
    platform: row.platform || undefined,
    lastActivitySignal: activity === 'active' ? 'updated recently' : activity === 'inactive' ? 'stale' : 'unknown',
    verificationNotes: `ArtistOS core record. Verification ${verification}; evidence strength ${row.evidence_strength || 0}/5.`,
    riskLevel: verification === 'verified' ? 'low' : activity === 'inactive' ? 'high' : 'review',
    fitTags: genres
  };
}

async function getCoreProperties(limit = 500) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('properties')
    .select('id,name,property_type,platform,url,platform_url,genre_tags,genres,followers_estimate,followers_legacy,activity_status,verification_status,evidence_strength,notes,owner_or_operator,contact_emails,organizations(display_name,canonical_name,website,trust_tier,risk_tier)')
    .is('archived_at', null)
    .order('evidence_strength', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data?.length) return [];
  return data.map(mapCoreProperty);
}

export async function getPlaylists(): Promise<Playlist[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return playlists;
  const { data, error } = await supabase
    .from('playlists')
    .select('*, curator_profiles(display_name)')
    .order('created_at', { ascending: false });
  if (!error && data?.length) return data.map(mapDbPlaylist);

  const core = await getCoreProperties(250);
  const corePlaylists = core.filter((target) => target.type === 'spotify_playlist').map((target) => ({
    slug: target.slug,
    name: target.name,
    curator: target.owner,
    status: target.status === 'verified' ? 'verified' as const : 'unclaimed' as const,
    genre: target.genres[0] || 'Uncategorized',
    moods: target.moods,
    followers: target.audienceCount || 0,
    updateSignal: target.lastActivitySignal || 'unknown',
    description: target.fitNotes,
    fitTags: target.fitTags || target.genres,
    riskLevel: target.riskLevel === 'low' ? 'Low' as const : target.riskLevel === 'medium' ? 'Medium' as const : 'Review' as const,
    trustScore: target.trustScore,
    spotifyUrl: target.url
  }));
  return corePlaylists.length ? corePlaylists : playlists;
}

export async function getPlaylistBySlug(slug: string): Promise<Playlist | undefined> {
  const all = await getPlaylists();
  return all.find((playlist) => playlist.slug === slug);
}

export async function getPromotionTargets(): Promise<PromotionTarget[]> {
  const core = await getCoreProperties(500);
  if (core.length) return core;

  const supabase = getSupabaseAdmin();
  if (!supabase) return promotionTargets;
  const { data, error } = await supabase
    .from('promotion_targets')
    .select('*, curator_profiles(display_name)')
    .order('created_at', { ascending: false });
  if (error || !data?.length) return promotionTargets;
  return data.map(mapDbTarget);
}

export async function getPromotionTargetBySlug(slug: string): Promise<PromotionTarget | undefined> {
  const supabase = getSupabaseAdmin();
  if (supabase && slug.startsWith('property-')) {
    const id = slug.slice('property-'.length);
    const { data } = await supabase
      .from('properties')
      .select('id,name,property_type,platform,url,platform_url,genre_tags,genres,followers_estimate,followers_legacy,activity_status,verification_status,evidence_strength,notes,owner_or_operator,contact_emails,organizations(display_name,canonical_name,website,trust_tier,risk_tier)')
      .eq('id', id)
      .is('archived_at', null)
      .maybeSingle();
    if (data) return mapCoreProperty(data);
  }

  if (!supabase) return promotionTargets.find((target) => target.slug === slug);
  const { data, error } = await supabase
    .from('promotion_targets')
    .select('*, curator_profiles(display_name)')
    .eq('slug', slug)
    .single();
  if (error || !data) return promotionTargets.find((target) => target.slug === slug);
  return mapDbTarget(data);
}

export async function getAdminTables() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      mode: 'demo' as const,
      targets: promotionTargets.map((target, index) => ({ id: `demo-target-${index}`, name: target.name, type: target.type, status: target.status, trust_score: target.trustScore, risk_level: 'review', slug: target.slug })),
      playlists: playlists.map((playlist, index) => ({ id: `demo-playlist-${index}`, name: playlist.name, status: playlist.status, trust_score: playlist.trustScore, risk_level: playlist.riskLevel.toLowerCase(), slug: playlist.slug })),
      claims: [] as any[]
    };
  }

  const coreTargets = await getCoreProperties(50);
  if (coreTargets.length) {
    return {
      mode: 'supabase' as const,
      targets: coreTargets.map((target) => ({ id: target.slug, name: target.name, type: target.type, status: target.status, trust_score: target.trustScore, risk_level: target.riskLevel || 'review', slug: target.slug })),
      playlists: coreTargets.filter((target) => target.type === 'spotify_playlist').map((target) => ({ id: target.slug, name: target.name, status: target.status, trust_score: target.trustScore, risk_level: target.riskLevel || 'review', slug: target.slug })),
      claims: [] as any[]
    };
  }

  const [targetsResult, playlistsResult, claimsResult] = await Promise.all([
    supabase.from('promotion_targets').select('id,name,type,status,trust_score,risk_level,slug,created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('playlists').select('id,name,status,trust_score,risk_level,slug,created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('target_claims').select('id,name,email,target_url,intent,status,created_at').order('created_at', { ascending: false }).limit(50)
  ]);
  return {
    mode: 'supabase' as const,
    targets: targetsResult.data || [],
    playlists: playlistsResult.data || [],
    claims: claimsResult.data || []
  };
}
