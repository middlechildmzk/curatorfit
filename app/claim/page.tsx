export const metadata = { title: 'Claim your curator profile | CuratorFit' };

const benefits = [
  'Only receive pitches that match the genres and formats you actually accept.',
  'Set hard no rules artists must see before they pitch you.',
  'Control your public profile, pause submissions, or opt out at any time.'
];

export default function ClaimPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
        <section className="card p-8 md:p-10">
          <p className="text-sm font-bold uppercase tracking-widest text-brand">Curator claim flow</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Your playlist. Your rules. Your inbox.</h1>
          <p className="mt-4 text-slate-600 leading-7">
            Claim your CuratorFit profile to control how artists find you, update submission preferences, and reduce bad-fit pitches. Claiming does not obligate you to review or add music.
          </p>
          <div className="mt-6 grid gap-3">
            {benefits.map((benefit) => <div key={benefit} className="rounded-2xl border border-line bg-panel p-4 text-sm font-semibold text-slate-700">{benefit}</div>)}
          </div>
          <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            CuratorFit does not sell playlist placement, guarantee streams, or require curators to add songs. Future paid-review features, if enabled, compensate listening and feedback time only, never placement.
          </p>
        </section>

        <section className="card p-8 md:p-10">
          <h2 className="text-2xl font-black">Claim, update, pause, or opt out</h2>
          <form className="mt-6 grid gap-5" action="/api/claim" method="post">
            <div><label className="label" htmlFor="name">Your name</label><input className="input" id="name" name="name" placeholder="Jane Curator" required /></div>
            <div><label className="label" htmlFor="email">Email</label><input className="input" id="email" name="email" type="email" placeholder="you@example.com" required /></div>
            <div><label className="label" htmlFor="playlistUrl">Playlist, channel, blog, or profile URL</label><input className="input" id="playlistUrl" name="playlistUrl" placeholder="https://open.spotify.com/playlist/..." required /></div>
            <div>
              <label className="label" htmlFor="intent">What do you want to do?</label>
              <select className="input" id="intent" name="intent">
                <option>Claim this profile</option>
                <option>Update genre/submission preferences</option>
                <option>Pause submissions</option>
                <option>Opt out / remove listing</option>
                <option>Join as an early curator partner</option>
              </select>
            </div>
            <div><label className="label" htmlFor="notes">Submission preferences or notes</label><textarea className="input min-h-32" id="notes" name="notes" placeholder="Genres accepted, hard no's, submission link, contact preferences..." /></div>
            <button className="btn-primary w-full" type="submit">Submit request</button>
          </form>
        </section>
      </div>
    </main>
  );
}
