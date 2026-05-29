export type ChannelType = 'spotify_playlist' | 'soundcloud_channel' | 'youtube_channel' | 'tiktok_creator' | 'blog' | 'radio' | 'label' | 'sync_library';

export type Playlist = {
  slug: string;
  name: string;
  curator: string;
  status: 'claimed' | 'unclaimed' | 'verified';
  genre: string;
  moods: string[];
  followers: number;
  updateSignal: string;
  description: string;
  fitTags: string[];
  riskLevel: 'Low' | 'Medium' | 'Review';
  trustScore: number;
  spotifyUrl: string;
};

export type PromotionTarget = {
  slug: string;
  name: string;
  type: ChannelType;
  channelLabel: string;
  owner: string;
  status: 'seed' | 'claimed' | 'verified' | 'partner';
  audienceSize: string;
  genres: string[];
  moods: string[];
  contactMethod: string;
  submissionRules: string;
  trustScore: number;
  fitNotes: string;
  riskNotes: string;
  url: string;
};

export const playlists: Playlist[] = [
  {
    slug: 'melodic-bass-afterglow',
    name: 'Melodic Bass Afterglow',
    curator: 'Unclaimed curator',
    status: 'unclaimed',
    genre: 'Melodic Bass',
    moods: ['emotional', 'cinematic', 'guitar warmth'],
    followers: 8200,
    updateSignal: 'Needs curator verification',
    description: 'Seed profile for emotional future bass, melodic bass, cinematic drops, and guitar-driven electronic records.',
    fitTags: ['future bass', 'melodic bass', 'emotional edm', 'female vocal'],
    riskLevel: 'Review',
    trustScore: 62,
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXcfZ6moR6J0G'
  },
  {
    slug: 'quiet-room-lofi',
    name: 'Quiet Room Lo-fi',
    curator: 'Founding curator candidate',
    status: 'unclaimed',
    genre: 'Lo-fi / Chill',
    moods: ['soft', 'study', 'night drive'],
    followers: 5400,
    updateSignal: 'Seed listing — manually review before outreach',
    description: 'For warm instrumental loops, soft drums, sleepy piano, ambient guitar, and low-pressure background music.',
    fitTags: ['lo-fi', 'study beats', 'ambient', 'instrumental'],
    riskLevel: 'Low',
    trustScore: 71,
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX889U0CL85jj'
  },
  {
    slug: 'faith-and-heavy-days',
    name: 'Faith for Heavy Days',
    curator: 'Unclaimed curator',
    status: 'unclaimed',
    genre: 'Christian / Inspirational',
    moods: ['hopeful', 'gentle', 'reflective'],
    followers: 3100,
    updateSignal: 'Needs owner claim',
    description: 'For worship-adjacent, inspirational, soft Christian, and faith-friendly songs that feel honest and low-pressure.',
    fitTags: ['christian', 'worship adjacent', 'inspirational', 'soft pop'],
    riskLevel: 'Low',
    trustScore: 68,
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX5nERjWj1zmg'
  },
  {
    slug: 'sad-pop-signal',
    name: 'Sad Pop Signal',
    curator: 'Verified demo curator',
    status: 'verified',
    genre: 'Indie Pop / Sad Pop',
    moods: ['heartbreak', 'reflective', 'late night'],
    followers: 12400,
    updateSignal: 'Demo verified profile',
    description: 'Indie pop, sad pop, intimate vocals, emotional hooks, and clean production with a human center.',
    fitTags: ['indie pop', 'sad pop', 'bedroom pop', 'vocal'],
    riskLevel: 'Low',
    trustScore: 84,
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX3YSRoSdA634'
  },
  {
    slug: 'cinematic-instrumental-light',
    name: 'Cinematic Instrumental Light',
    curator: 'Unclaimed curator',
    status: 'unclaimed',
    genre: 'Cinematic / Ambient',
    moods: ['ambient', 'film', 'prayerful'],
    followers: 6700,
    updateSignal: 'Seed listing — verify before premium status',
    description: 'Cinematic instrumentals, ambient guitar, soft piano, prayer/sleep loops, and emotional soundtrack textures.',
    fitTags: ['cinematic', 'ambient', 'instrumental', 'sleep'],
    riskLevel: 'Review',
    trustScore: 65,
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWZwtERXCS82H'
  }
];

export const promotionTargets: PromotionTarget[] = [
  {
    slug: 'melodic-bass-afterglow',
    name: 'Melodic Bass Afterglow',
    type: 'spotify_playlist',
    channelLabel: 'Spotify Playlist',
    owner: 'Unclaimed curator',
    status: 'seed',
    audienceSize: '8.2K playlist followers',
    genres: ['Melodic Bass', 'Future Bass', 'Emotional EDM'],
    moods: ['cinematic', 'hopeful', 'drop-focused'],
    contactMethod: 'Claim profile before accepting pitches',
    submissionRules: 'No guaranteed placement. Review fit before outreach.',
    trustScore: 62,
    fitNotes: 'Best for emotional electronic tracks with strong melodic drop payoff, guitar warmth, or female vocal hooks.',
    riskNotes: 'Seed listing. Needs owner verification and recent-update check before premium review routing.',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DXcfZ6moR6J0G'
  },
  {
    slug: 'quiet-room-soundcloud-reposts',
    name: 'Quiet Room Reposts',
    type: 'soundcloud_channel',
    channelLabel: 'SoundCloud / Repost Channel',
    owner: 'Founding channel candidate',
    status: 'seed',
    audienceSize: 'Seed profile',
    genres: ['Lo-fi', 'Ambient', 'Instrumental'],
    moods: ['sleepy', 'soft', 'low pressure'],
    contactMethod: 'Manual outreach / claim profile',
    submissionRules: 'Accepts private links and finished public uploads only. No paid repost guarantees.',
    trustScore: 58,
    fitNotes: 'Designed for future SoundCloud repost collectives, curator accounts, and micro-label channels.',
    riskNotes: 'Do not automate repost promises. Track as discovery target until channel owner claims.',
    url: 'https://soundcloud.com/quiet-room-reposts-seed'
  },
  {
    slug: 'late-night-visualizer-youtube',
    name: 'Late Night Visualizer Channel',
    type: 'youtube_channel',
    channelLabel: 'YouTube Music Channel',
    owner: 'Unclaimed video curator',
    status: 'seed',
    audienceSize: 'Seed profile',
    genres: ['Cinematic', 'Emotional Electronic', 'Indie Pop'],
    moods: ['late night', 'visualizer-friendly', 'story-driven'],
    contactMethod: 'Public submission/contact link when verified',
    submissionRules: 'Needs artwork/visualizer rights and explicit permission before uploads.',
    trustScore: 61,
    fitNotes: 'For lyric videos, visualizer channels, music discovery uploads, mixes, and genre-specific YouTube curators.',
    riskNotes: 'Rights and upload permissions are critical. Never assume permission from a submission alone.',
    url: 'https://www.youtube.com/@latenightvisualizerseed'
  },
  {
    slug: 'hook-first-tiktok-creators',
    name: 'Hook-First TikTok Creators',
    type: 'tiktok_creator',
    channelLabel: 'TikTok Creator',
    owner: 'Creator network seed',
    status: 'seed',
    audienceSize: 'Seed profile',
    genres: ['Pop', 'EDM', 'AI-assisted Music'],
    moods: ['hooky', 'emotional', 'short-form ready'],
    contactMethod: 'Manual creator outreach / invite only',
    submissionRules: 'Creator consideration only. No fake engagement, bot views, or undisclosed paid endorsement.',
    trustScore: 55,
    fitNotes: 'For songs with strong first-5-second hooks, quotable lyrics, dance/meme potential, or emotional POV clips.',
    riskNotes: 'Requires sponsorship disclosure workflow and creator approval before paid campaigns.',
    url: 'https://www.tiktok.com/@hookfirstseed'
  },
  {
    slug: 'faith-heavy-days-blog',
    name: 'Faith & Heavy Days Blog',
    type: 'blog',
    channelLabel: 'Music Blog',
    owner: 'Editorial seed profile',
    status: 'seed',
    audienceSize: 'Seed profile',
    genres: ['Christian', 'Inspirational', 'Singer-songwriter'],
    moods: ['honest', 'gentle', 'hopeful'],
    contactMethod: 'Editorial pitch / claim profile',
    submissionRules: 'Faith-friendly, non-preachy, story-driven releases. Editorial coverage not guaranteed.',
    trustScore: 64,
    fitNotes: 'For future blog/radio/editorial expansion where story and mission matter as much as sonic fit.',
    riskNotes: 'Separate editorial review from playlist adds. Avoid pay-for-coverage claims.',
    url: 'https://example.com/faith-heavy-days-blog-seed'
  }
];

export const channelTypes = [
  { type: 'spotify_playlist', label: 'Spotify Playlists', promise: 'Playlist discovery, curator claim flow, fit scoring, and pitch tracking.' },
  { type: 'soundcloud_channel', label: 'SoundCloud', promise: 'Repost channels, collectives, labels, and independent curator accounts.' },
  { type: 'youtube_channel', label: 'YouTube', promise: 'Music channels, lyric video curators, visualizer uploaders, and mix channels.' },
  { type: 'tiktok_creator', label: 'TikTok', promise: 'Creator discovery, short-form hook testing, usage rights, and sponsored consideration.' },
  { type: 'blog', label: 'Blogs / Editorial', promise: 'Writers, newsletters, music blogs, faith/music publications, and niche media.' },
  { type: 'radio', label: 'Radio', promise: 'Internet radio, college radio, specialist shows, and niche radio contacts.' },
  { type: 'label', label: 'Labels / A&R', promise: 'Small labels, curators, A&R scouts, and community-led collectives.' }
];

export const genres = ['Melodic Bass', 'Lo-fi / Chill', 'Christian / Inspirational', 'Indie Pop / Sad Pop', 'Cinematic / Ambient'];
