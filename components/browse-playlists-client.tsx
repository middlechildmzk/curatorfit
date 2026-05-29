'use client';

import { useMemo, useState } from 'react';
import { PlaylistCard } from '@/components/playlist-card';
import type { Playlist } from '@/data/seed';

export function BrowsePlaylistsClient({ playlists, genres }: { playlists: Playlist[]; genres: string[] }) {
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('all');
  const [risk, setRisk] = useState('all');
  const [sort, setSort] = useState('trust');

  const filtered = useMemo(() => {
    const rows = playlists.filter((playlist) => {
      const haystack = [playlist.name, playlist.curator, playlist.genre, playlist.description, playlist.fitTags.join(' '), playlist.moods.join(' ')].join(' ').toLowerCase();
      const matchesQuery = !query.trim() || haystack.includes(query.toLowerCase());
      const matchesGenre = genre === 'all' || playlist.genre === genre;
      const matchesRisk = risk === 'all' || playlist.riskLevel.toLowerCase() === risk;
      return matchesQuery && matchesGenre && matchesRisk;
    });
    return rows.sort((a, b) => sort === 'followers' ? b.followers - a.followers : sort === 'name' ? a.name.localeCompare(b.name) : b.trustScore - a.trustScore);
  }, [playlists, query, genre, risk, sort]);

  return (
    <section>
      <div className="card mb-8 grid gap-4 p-5 lg:grid-cols-[1fr_220px_180px_180px]">
        <div><label className="label">Search playlists</label><input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="future bass, lo-fi, Christian, cinematic..." /></div>
        <div><label className="label">Genre</label><select className="input" value={genre} onChange={(event) => setGenre(event.target.value)}><option value="all">All genres</option>{genres.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
        <div><label className="label">Risk</label><select className="input" value={risk} onChange={(event) => setRisk(event.target.value)}><option value="all">All risks</option><option value="low">Low</option><option value="medium">Medium</option><option value="review">Review</option></select></div>
        <div><label className="label">Sort</label><select className="input" value={sort} onChange={(event) => setSort(event.target.value)}><option value="trust">Trust score</option><option value="followers">Followers</option><option value="name">Name</option></select></div>
      </div>
      <div className="mb-4 text-sm font-semibold text-slate-500">Showing {filtered.length} of {playlists.length} playlists</div>
      <div className="grid gap-5 lg:grid-cols-2">
        {filtered.map((playlist) => <PlaylistCard key={playlist.slug} playlist={playlist} />)}
      </div>
      {!filtered.length ? <p className="rounded-2xl bg-panel p-6 text-sm text-slate-600">No playlists match those filters yet.</p> : null}
    </section>
  );
}
