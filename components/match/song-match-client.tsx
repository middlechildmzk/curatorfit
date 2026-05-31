'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { PromotionTarget } from '@/data/seed';
import { scoreTargetMatch, type SongProfile } from '@/lib/matching';

const moodOptions = ['emotional', 'cinematic', 'uplifting', 'dark', 'relaxed', 'study', 'hopeful', 'melancholy', 'aesthetic', 'atmospheric'];
const subgenreOptions = ['future bass', 'melodic bass', 'melodic dubstep', 'lo-fi', 'chillhop', 'study beats', 'Christian electronic', 'worship-adjacent', 'indie pop', 'bedroom pop', 'ambient', 'sync'];

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function SongMatchClient({ targets }: { targets: PromotionTarget[] }) {
  const [profile, setProfile] = useState<SongProfile>({
    genre: 'Electronic / Melodic',
    subgenres: ['future bass', 'melodic bass'],
    moods: ['emotional', 'cinematic'],
    energyLevel: 'medium',
    vocalType: 'female vocal',
    explicit: false,
    aiAssisted: true,
    artistStage: 'emerging',
    goal: 'multi-channel release campaign'
  });

  const matches = useMemo(() => targets
    .map((target) => ({ target, score: scoreTargetMatch(profile, target) }))
    .filter((item) => item.score.total >= 45)
    .sort((a, b) => b.score.total - a.score.total)
    .slice(0, 18), [targets, profile]);

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <aside className="card h-fit p-5">
        <h2 className="text-xl font-black">Song profile</h2>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-slate-700">Primary genre
            <select className="input" value={profile.genre} onChange={(event) => setProfile({ ...profile, genre: event.target.value })}>
              {['Electronic / Melodic', 'Lo-fi / Chill', 'Christian / Inspirational', 'Indie / Pop', 'Cinematic / Ambient', 'AI-assisted / Creator-first'].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">Campaign goal
            <select className="input" value={profile.goal} onChange={(event) => setProfile({ ...profile, goal: event.target.value })}>
              {['multi-channel release campaign', 'Spotify playlist pitching', 'YouTube channel upload consideration', 'blog coverage', 'radio consideration', 'sync/library consideration', 'creator/short-form campaign'].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <div>
            <p className="label">Subgenres</p>
            <div className="flex flex-wrap gap-2">
              {subgenreOptions.map((item) => <button type="button" key={item} onClick={() => setProfile({ ...profile, subgenres: toggle(profile.subgenres, item) })} className={`pill ${profile.subgenres.includes(item) ? 'bg-ink text-white' : ''}`}>{item}</button>)}
            </div>
          </div>
          <div>
            <p className="label">Moods</p>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((item) => <button type="button" key={item} onClick={() => setProfile({ ...profile, moods: toggle(profile.moods, item) })} className={`pill ${profile.moods.includes(item) ? 'bg-ink text-white' : ''}`}>{item}</button>)}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-700">Energy
              <select className="input" value={profile.energyLevel} onChange={(event) => setProfile({ ...profile, energyLevel: event.target.value })}>
                {['low', 'medium', 'high', 'mixed'].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">Artist stage
              <select className="input" value={profile.artistStage} onChange={(event) => setProfile({ ...profile, artistStage: event.target.value })}>
                {['brand new', 'emerging', 'established indie', 'label-backed'].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <label className="flex items-center gap-2 rounded-2xl border border-line p-4 text-sm font-semibold"><input type="checkbox" checked={profile.aiAssisted} onChange={(event) => setProfile({ ...profile, aiAssisted: event.target.checked })} /> AI-assisted song</label>
          <label className="flex items-center gap-2 rounded-2xl border border-line p-4 text-sm font-semibold"><input type="checkbox" checked={profile.explicit} onChange={(event) => setProfile({ ...profile, explicit: event.target.checked })} /> Explicit lyrics</label>
        </div>
      </aside>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black">Top target matches</h2>
          <p className="text-sm font-semibold text-slate-500">Showing {matches.length} matches from {targets.length} targets</p>
        </div>
        <div className="grid gap-5">
          {matches.map(({ target, score }) => (
            <div key={target.slug} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="pill mb-3">{target.channelLabel}</span>
                  <h3 className="text-2xl font-black"><Link href={`/targets/${target.slug}`} className="hover:text-brand">{target.name}</Link></h3>
                  <p className="mt-1 text-sm text-slate-500">{target.owner} · {target.audienceSize}</p>
                </div>
                <div className="rounded-3xl bg-slate-950 px-5 py-4 text-center text-white"><div className="text-3xl font-black">{score.total}</div><div className="text-xs font-bold text-slate-300">match</div></div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{target.fitNotes}</p>
              <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                {score.reasons.map((reason) => <div key={reason} className="rounded-2xl bg-slate-50 p-3">{reason}</div>)}
              </div>
              {score.warnings.length ? <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">{score.warnings.join(' ')}</div> : null}
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="pill">Genre {score.genreScore}</span><span className="pill">Mood {score.moodScore}</span><span className="pill">Trust {score.trustScore}</span><span className="pill">Submit {score.submitScore}</span><span className="pill">AI {score.aiScore}</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-3"><Link href={`/targets/${target.slug}`} className="btn-primary">View target</Link><Link href="/waitlist" className="btn-secondary">Save matches in beta</Link></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
