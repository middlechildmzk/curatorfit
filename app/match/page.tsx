import { getPromotionTargets } from '@/lib/data';
import { SongMatchClient } from '@/components/match/song-match-client';

export const metadata = {
  title: 'Song-to-Target Matching | CuratorFit',
  description: 'Match a song profile to Spotify playlists, blogs, YouTube channels, SoundCloud reposts, TikTok creators, radio, labels, and sync targets.'
};

export default async function MatchPage() {
  const targets = await getPromotionTargets();
  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <section className="mb-8 max-w-4xl">
        <span className="pill">V2.1 matching foundation</span>
        <h1 className="mt-5 text-5xl font-black tracking-tight text-ink">Match your song to the right promotion targets.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">Enter a song profile and CuratorFit previews which playlists, blogs, YouTube channels, SoundCloud repost channels, creators, radio shows, labels, sync libraries, and communities may fit. This is discovery guidance only, not guaranteed placement.</p>
      </section>
      <SongMatchClient targets={targets} />
    </main>
  );
}
