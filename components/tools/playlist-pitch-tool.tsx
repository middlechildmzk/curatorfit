'use client';

import { useMemo, useState } from 'react';

export function PlaylistPitchTool() {
  const [artist, setArtist] = useState('');
  const [song, setSong] = useState('');
  const [genre, setGenre] = useState('melodic bass');
  const [mood, setMood] = useState('emotional and cinematic');
  const [target, setTarget] = useState('an independent Spotify playlist');
  const pitch = useMemo(() => {
    const artistName = artist || 'my project';
    const songName = song || 'my new single';
    return `Hi, I’m reaching out about ${songName} by ${artistName}. It sits in a ${genre} lane with a ${mood} feel, so I thought it may be a thoughtful fit for ${target}. No pressure at all if it is not right for the playlist, but I’d be grateful if you gave it a quick listen and considered it for future curation.`;
  }, [artist, song, genre, mood, target]);

  return (
    <div className="card p-6 shadow-none">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block"><span className="label">Artist/project</span><input className="input" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Middle Child" /></label>
        <label className="block"><span className="label">Song title</span><input className="input" value={song} onChange={(e) => setSong(e.target.value)} placeholder="Still Here" /></label>
        <label className="block"><span className="label">Genre lane</span><input className="input" value={genre} onChange={(e) => setGenre(e.target.value)} /></label>
        <label className="block"><span className="label">Mood/use case</span><input className="input" value={mood} onChange={(e) => setMood(e.target.value)} /></label>
        <label className="block md:col-span-2"><span className="label">Target type</span><input className="input" value={target} onChange={(e) => setTarget(e.target.value)} /></label>
      </div>
      <div className="mt-6 rounded-3xl bg-slate-50 p-5">
        <p className="text-xs font-black uppercase tracking-widest text-brand">Generated curator-safe pitch</p>
        <p className="mt-3 leading-7 text-slate-700">{pitch}</p>
      </div>
    </div>
  );
}
