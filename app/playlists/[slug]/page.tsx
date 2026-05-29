import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertTriangle, ExternalLink, Heart, ShieldCheck } from 'lucide-react';
import { playlists } from '@/data/seed';
import { getPlaylistBySlug } from '@/lib/data';
import { scoreLabel } from '@/lib/scoring';

export function generateStaticParams() {
  return playlists.map((playlist) => ({ slug: playlist.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const playlist = await getPlaylistBySlug(slug);
  return { title: playlist ? `${playlist.name} | CuratorFit` : 'Playlist | CuratorFit' };
}

export default async function PlaylistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const playlist = await getPlaylistBySlug(slug);
  if (!playlist) notFound();
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="card p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="pill">{playlist.genre}</span>
            <span className="pill capitalize">{playlist.status}</span>
            <span className="pill">{playlist.followers.toLocaleString()} followers</span>
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">{playlist.name}</h1>
          <p className="mt-3 text-slate-500">Curator: {playlist.curator}</p>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{playlist.description}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-panel p-5">
              <p className="text-sm font-bold text-slate-500">Trust score</p>
              <p className="mt-1 text-3xl font-black">{playlist.trustScore}</p>
              <p className="text-sm text-slate-600">{scoreLabel(playlist.trustScore)}</p>
            </div>
            <div className="rounded-3xl bg-panel p-5">
              <p className="text-sm font-bold text-slate-500">Risk level</p>
              <p className="mt-1 text-3xl font-black">{playlist.riskLevel}</p>
              <p className="text-sm text-slate-600">Manual review before premium pitches</p>
            </div>
            <div className="rounded-3xl bg-panel p-5">
              <p className="text-sm font-bold text-slate-500">Update signal</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{playlist.updateSignal}</p>
            </div>
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-black">Best-fit tags</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {playlist.fitTags.map((tag) => <span className="pill" key={tag}>{tag}</span>)}
            </div>
          </div>
        </section>
        <aside className="space-y-5">
          <div className="card p-6">
            <h2 className="text-xl font-black">Artist actions</h2>
            <div className="mt-5 grid gap-3">
              <Link href="/artist" className="btn-primary"><Heart size={16} /> Save to campaign</Link>
              <a href={playlist.spotifyUrl} className="btn-secondary" target="_blank" rel="noreferrer"><ExternalLink size={16} /> Open Spotify</a>
            </div>
          </div>
          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-xl font-black"><ShieldCheck className="h-5 w-5 text-brand2" /> Claim this profile</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Own this playlist? Claim the profile for free, update submission rules, or request removal.</p>
            <Link href="/claim" className="btn-secondary mt-5 w-full">Start claim</Link>
          </div>
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
            <h2 className="flex items-center gap-2 font-black"><AlertTriangle size={18} /> Compliance note</h2>
            <p className="mt-2 text-sm leading-6">This is a discovery profile, not a paid placement offer. Curators independently decide whether to review, add, pass, or opt out.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
