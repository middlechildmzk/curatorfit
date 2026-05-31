import Link from 'next/link';
import { getPromotionTargets } from '@/lib/data';
import { TargetsDirectoryClient } from '@/components/targets-directory-client';

export const metadata = {
  title: 'Music Promotion Target Directory | CuratorFit',
  description: 'Search Spotify playlists, SoundCloud channels, YouTube music channels, TikTok creators, blogs, radio shows, labels, sync targets, and AI music communities.'
};

export default async function TargetsPage() {
  const targets = await getPromotionTargets();
  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-brand">V2.1 multi-channel directory</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Browse music promotion targets</h1>
          <p className="mt-4 max-w-3xl text-slate-600">Search playlists, blogs, YouTube channels, TikTok creators, SoundCloud repost channels, radio shows, labels, sync libraries, and AI-friendly communities. Every listing is treated as a candidate until manually reviewed or claimed.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/match" className="btn-primary">Match a song</Link>
          <Link href="/submit-target" className="btn-secondary">Suggest target</Link>
        </div>
      </div>
      <TargetsDirectoryClient targets={targets} />
    </main>
  );
}
