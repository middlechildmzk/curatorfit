import Link from 'next/link';
import { ShieldCheck, AlertTriangle, CircleDot } from 'lucide-react';
import { scoreLabel } from '@/lib/scoring';
import type { Playlist } from '@/data/seed';

export function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const Icon = playlist.riskLevel === 'Low' ? ShieldCheck : playlist.riskLevel === 'Medium' ? CircleDot : AlertTriangle;
  return (
    <article className="card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand">{playlist.genre}</p>
          <Link href={`/playlists/${playlist.slug}`} className="mt-2 block text-xl font-black tracking-tight hover:text-brand">{playlist.name}</Link>
          <p className="mt-1 text-sm text-slate-500">{playlist.curator} · {playlist.followers.toLocaleString()} followers</p>
        </div>
        <span className="pill capitalize">{playlist.status}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{playlist.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {playlist.fitTags.map((tag) => <span key={tag} className="pill">{tag}</span>)}
      </div>
      <div className="mt-5 grid gap-3 rounded-2xl bg-panel p-4 text-sm sm:grid-cols-2">
        <div>
          <p className="font-bold text-ink">Trust score</p>
          <p className="text-slate-600">{playlist.trustScore}/100 · {scoreLabel(playlist.trustScore)}</p>
        </div>
        <div className="flex gap-2">
          <Icon className="mt-0.5 h-4 w-4 text-slate-500" />
          <div>
            <p className="font-bold text-ink">Risk level</p>
            <p className="text-slate-600">{playlist.riskLevel}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
