import Link from 'next/link';
import { playlists } from '@/data/seed';

export const metadata = { title: 'Curators | CuratorFit' };

export default function CuratorsPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-widest text-brand">Curator network</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Founding curator profiles</h1>
        <p className="mt-4 max-w-3xl text-slate-600">V1 supports claimed, unclaimed, and verified curator states so the directory can grow safely without pretending every profile is active.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {playlists.map((playlist) => (
          <Link key={playlist.slug} href={`/playlists/${playlist.slug}`} className="card block p-6 transition hover:-translate-y-1 hover:border-brand">
            <span className="pill capitalize">{playlist.status}</span>
            <h2 className="mt-4 text-xl font-black">{playlist.curator}</h2>
            <p className="mt-2 text-sm text-slate-600">Primary playlist: {playlist.name}</p>
            <p className="mt-4 text-sm font-semibold text-brand">{playlist.genre}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
