export const metadata = { title: 'Apply as a curator | CuratorFit' };

export default function ApplyPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <div className="card p-8 md:p-10">
        <p className="text-sm font-bold uppercase tracking-widest text-brand">Founding curator application</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Control how artists find you</h1>
        <p className="mt-4 text-slate-600">Join as an early curator partner to set your accepted genres, hard no rules, and submission preferences. You stay independent. CuratorFit does not sell placement or require you to add songs.</p>
        <form className="mt-8 grid gap-5" action="/api/curator-application" method="post">
          <div>
            <label className="label" htmlFor="displayName">Display name</label>
            <input className="input" id="displayName" name="displayName" placeholder="Jane Curator" required />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="label" htmlFor="websiteUrl">Website or main profile URL</label>
            <input className="input" id="websiteUrl" name="websiteUrl" placeholder="https://..." required />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="acceptedGenres">Accepted genres</label>
              <input className="input" id="acceptedGenres" name="acceptedGenres" placeholder="lo-fi, melodic bass, indie pop" />
            </div>
            <div>
              <label className="label" htmlFor="acceptedChannels">Accepted channel types</label>
              <input className="input" id="acceptedChannels" name="acceptedChannels" placeholder="spotify_playlist, blog, youtube_channel" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="hardNos">Hard no&apos;s</label>
            <input className="input" id="hardNos" name="hardNos" placeholder="no explicit, no AI vocals, no rap, no unreleased demos..." />
          </div>
          <div>
            <label className="label" htmlFor="bio">Bio and submission preferences</label>
            <textarea className="input min-h-32" id="bio" name="bio" placeholder="Tell artists what fits, what does not, and how you prefer to review music..." />
          </div>
          <button className="btn-primary w-full" type="submit">Apply as early curator partner</button>
        </form>
      </div>
    </main>
  );
}
