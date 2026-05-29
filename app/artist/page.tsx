import { getPlaylists } from '@/lib/data';
import { estimateFit } from '@/lib/scoring';

export const metadata = { title: 'Artist pitch tracker | CuratorFit' };

const demoTags = ['future bass', 'melodic bass', 'emotional edm', 'female vocal'];

export default async function ArtistPage() {
  const playlists = await getPlaylists();
  const ranked = playlists
    .map((playlist) => ({ playlist, fit: estimateFit(playlist, demoTags) }))
    .sort((a, b) => b.fit.score - a.fit.score);

  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-widest text-brand">Artist dashboard V1</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Plan your next playlist campaign</h1>
        <p className="mt-4 max-w-3xl text-slate-600">Paste a track, generate a pitch, save playlists, and track submissions. V1.2 can read from Supabase when configured, while falling back to seed data locally.</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <aside className="card p-6">
          <h2 className="text-xl font-black">Track setup</h2>
          <form className="mt-5 grid gap-4" action="/api/pitch" method="post">
            <div>
              <label className="label" htmlFor="trackUrl">Spotify or private track URL</label>
              <input className="input" id="trackUrl" name="trackUrl" placeholder="https://open.spotify.com/track/..." />
            </div>
            <div>
              <label className="label" htmlFor="artistName">Artist name</label>
              <input className="input" id="artistName" name="artistName" placeholder="Middle Child" />
            </div>
            <div>
              <label className="label" htmlFor="tags">Sound tags</label>
              <input className="input" id="tags" name="tags" defaultValue={demoTags.join(', ')} />
            </div>
            <div>
              <label className="label" htmlFor="notes">Pitch notes</label>
              <textarea className="input min-h-28" id="notes" name="notes" placeholder="Emotional future bass with guitar warmth and a cinematic drop..." />
            </div>
            <button className="btn-primary" type="submit">Generate pitch draft</button>
          </form>
        </aside>
        <section className="space-y-5">
          <div className="card p-6">
            <h2 className="text-xl font-black">Recommended playlist matches</h2>
            <p className="mt-2 text-sm text-slate-600">Demo ranking based on tag overlap, trust score, and risk level. Later this connects to real track metadata and curator feedback loops.</p>
          </div>
          {ranked.map(({ playlist, fit }) => (
            <div key={playlist.slug} className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-brand">{playlist.genre}</p>
                  <h3 className="mt-1 text-2xl font-black">{playlist.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{playlist.followers.toLocaleString()} followers · {playlist.status}</p>
                </div>
                <div className="rounded-2xl bg-panel px-5 py-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Fit</p>
                  <p className="text-3xl font-black">{fit.score}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {fit.overlaps.length ? fit.overlaps.map((tag) => <span className="pill" key={tag}>match: {tag}</span>) : <span className="pill">no direct tag match</span>}
              </div>
              <form className="mt-5 grid gap-3 sm:grid-cols-3" action="/api/campaign-target" method="post">
                <input type="hidden" name="campaignName" value="Demo release campaign" />
                <input type="hidden" name="artistName" value="Demo Artist" />
                <input type="hidden" name="trackTitle" value="Untitled track" />
                <input type="hidden" name="targetSlug" value={playlist.slug} />
                <input type="hidden" name="channel" value="spotify_playlist" />
                <input type="hidden" name="notes" value={`Fit score: ${fit.score}`} />
                <button className="btn-secondary" name="pitchStatus" value="saved" type="submit">Save</button>
                <button className="btn-secondary" name="pitchStatus" value="pitched" type="submit">Mark pitched</button>
                <button className="btn-secondary" name="pitchStatus" value="follow_up" type="submit">Follow up later</button>
              </form>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
