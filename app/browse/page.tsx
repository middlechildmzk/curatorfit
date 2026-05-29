import Link from 'next/link';
import { genres } from '@/data/seed';
import { getPlaylists } from '@/lib/data';
import { BrowsePlaylistsClient } from '@/components/browse-playlists-client';

export const metadata = { title: 'Browse Spotify playlist opportunities | CuratorFit' };

export default async function BrowsePage() {
  const playlists = await getPlaylists();
  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-brand">Playlist directory</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Browse better-fit playlist opportunities</h1>
          <p className="mt-4 max-w-3xl text-slate-600">Seed listings are research profiles until claimed and verified. Use them to plan pitches, shortlist targets, and avoid risky guaranteed-placement services.</p>
        </div>
        <Link href="/targets" className="btn-secondary">View all channels</Link>
      </div>
      <BrowsePlaylistsClient playlists={playlists} genres={genres} />
    </main>
  );
}
