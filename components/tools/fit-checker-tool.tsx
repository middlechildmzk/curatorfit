'use client';

import { useMemo, useState } from 'react';

const goodWords = ['lofi','lo-fi','chill','future bass','melodic','worship','christian','indie','sad','ambient','cinematic','study','instrumental'];
const riskWords = ['guaranteed','placement','streams','pay','viral','bot','boost','followers','top hits'];

export function FitCheckerTool() {
  const [song, setSong] = useState('emotional future bass with female vocal and guitar');
  const [playlist, setPlaylist] = useState('cinematic electronic playlist for emotional melodic bass and indie vocals');
  const result = useMemo(() => {
    const text = `${song} ${playlist}`.toLowerCase();
    const songTokens = new Set(song.toLowerCase().split(/[^a-z0-9-]+/).filter(Boolean));
    const playlistTokens = new Set(playlist.toLowerCase().split(/[^a-z0-9-]+/).filter(Boolean));
    let overlap = 0;
    songTokens.forEach((token) => { if (playlistTokens.has(token)) overlap += 1; });
    const positive = goodWords.filter((word) => text.includes(word)).length;
    const risk = riskWords.filter((word) => playlist.toLowerCase().includes(word)).length;
    const score = Math.max(10, Math.min(96, 44 + overlap * 9 + positive * 5 - risk * 13));
    const label = score >= 78 ? 'Strong potential fit' : score >= 58 ? 'Possible fit, pitch carefully' : 'Weak fit, save your energy';
    return { score, label, overlap, positive, risk };
  }, [song, playlist]);

  return (
    <div className="card grid gap-5 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-slate-700">Song description<textarea className="input min-h-32" value={song} onChange={(event) => setSong(event.target.value)} /></label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">Playlist description<textarea className="input min-h-32" value={playlist} onChange={(event) => setPlaylist(event.target.value)} /></label>
      </div>
      <div className="rounded-3xl bg-slate-950 p-6 text-white">
        <p className="text-sm font-bold text-teal-200">Fit preview</p>
        <div className="mt-3 flex items-end gap-4"><span className="text-6xl font-black">{result.score}</span><span className="pb-2 text-sm text-slate-300">/ 100</span></div>
        <h2 className="mt-4 text-2xl font-black">{result.label}</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-4 text-sm">Keyword overlap: {result.overlap}</div>
          <div className="rounded-2xl bg-white/10 p-4 text-sm">Positive fit signals: {result.positive}</div>
          <div className="rounded-2xl bg-white/10 p-4 text-sm">Risk words: {result.risk}</div>
        </div>
        <p className="mt-5 text-xs leading-5 text-slate-300">This is an educational preview, not a guarantee of acceptance. Curators make independent decisions.</p>
      </div>
    </div>
  );
}
