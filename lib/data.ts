import { playlists, promotionTargets, type Playlist, type PromotionTarget } from '@/data/seed';
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

function mapDbTarget(row: any): PromotionTarget {
  const labelMap: Record<string, string> = {
    spotify_playlist: 'Spotify Playlist',
    soundcloud_channel: 'SoundCloud / Repost Channel',
    youtube_channel: 'YouTube Music Channel',
    tiktok_creator: 'TikTok Creator',
    blog: 'Music Blog',
    radio: 'Radio / Station',
    label: 'Label / A&R',
    sync_library: 'Sync Library'
  };

  return {
    slug: row.slug,
    name: row.name,
    type: row.type,
    channelLabel: labelMap[row.type] || row.type,
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

export async function getPlaylists(): Promise<Playlist[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return playlists;
  const { data, error } = await supabase
    .from('playlists')
    .select('*, curator_profiles(display_name)')
    .order('created_at', { ascending: false });
  if (error || !data?.length) return playlists;
  return data.map(mapDbPlaylist);
}

export async function getPlaylistBySlug(slug: string): Promise<Playlist | undefined> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return playlists.find((playlist) => playlist.slug === slug);
  const { data, error } = await supabase
    .from('playlists')
    .select('*, curator_profiles(display_name)')
    .eq('slug', slug)
    .single();
  if (error || !data) return playlists.find((playlist) => playlist.slug === slug);
  return mapDbPlaylist(data);
}

export async function getPromotionTargets(): Promise<PromotionTarget[]> {
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
