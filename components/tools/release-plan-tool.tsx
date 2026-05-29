'use client';

import { useMemo, useState } from 'react';

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function ReleasePlanTool() {
  const [releaseDate, setReleaseDate] = useState(() => addDays(new Date(), 35).toISOString().slice(0, 10));
  const [aiAssisted, setAiAssisted] = useState(true);
  const tasks = useMemo(() => {
    const date = new Date(`${releaseDate}T12:00:00`);
    const base = [
      [-42, 'Finalize mix/master direction and reference playlist lane'],
      [-35, 'Confirm metadata, artwork, distributor plan, and release date'],
      [-28, 'Prepare Spotify for Artists editorial pitch if eligible'],
      [-21, 'Build curator target list and remove obvious risk targets'],
      [-14, 'Write 2–3 short curator pitch variants'],
      [-7, 'Start priority outreach and log every pitch'],
      [0, 'Release day: post context, update links, track first responses'],
      [7, 'Follow up with strong-fit targets and review campaign notes'],
      [21, 'Write a post-mortem: what fit, what failed, what to do next']
    ];
    const ai = aiAssisted ? [[-36, 'AI check: verify tool/distributor terms, disclosure language, and source documentation']] : [];
    return [...base, ...ai].sort((a, b) => Number(a[0]) - Number(b[0])).map(([offset, task]) => ({
      date: addDays(date, Number(offset)).toISOString().slice(0, 10),
      task
    }));
  }, [releaseDate, aiAssisted]);

  return (
    <div className="card p-6">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <label className="grid gap-2 text-sm font-bold text-slate-700">Release date<input className="input" type="date" value={releaseDate} onChange={(event) => setReleaseDate(event.target.value)} /></label>
        <label className="flex items-center gap-2 rounded-2xl border border-line p-4 text-sm font-semibold"><input type="checkbox" checked={aiAssisted} onChange={(event) => setAiAssisted(event.target.checked)} /> AI-assisted release</label>
      </div>
      <div className="mt-6 grid gap-3">
        {tasks.map((item) => <div key={`${item.date}-${item.task}`} className="rounded-2xl border border-line bg-slate-50 p-4 text-sm"><span className="font-black text-ink">{item.date}</span><span className="text-slate-500"> — {item.task}</span></div>)}
      </div>
    </div>
  );
}
