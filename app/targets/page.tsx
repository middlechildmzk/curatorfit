import Link from 'next/link';
import { getPromotionTargets } from '@/lib/data';
import { TargetsDirectoryClient } from '@/components/targets-directory-client';

export const metadata = {
  title: 'Promotion Target Directory | CuratorFit',
  description: 'Browse Spotify playlists, SoundCloud channels, YouTube music channels, TikTok creators, blogs, radio shows, labels, and sync targets.'
};

export default async function TargetsPage() {
  const targets = await getPromotionTargets();
  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-brand">Promotion target directory</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Browse music promotion targets</h1>
          <p className="mt-4 max-w-3xl text-slate-600">Spotify playlists are the first wedge, but every listing uses the same target model: channel type, fit notes, trust score, risk notes, submission rules, and claim status.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/saved" className="btn-secondary">Saved targets</Link>
          <Link href="/submit-target" className="btn-primary">Suggest target</Link>
        </div>
      </div>
      <TargetsDirectoryClient targets={targets} />
    </main>
  );
}
