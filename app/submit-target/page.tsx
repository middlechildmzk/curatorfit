export const metadata = { title: 'Submit a promotion target | CuratorFit' };

export default function SubmitTargetPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <div className="card p-8 md:p-10">
        <p className="text-sm font-bold uppercase tracking-widest text-brand">Seed the directory</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Suggest a playlist, channel, creator, blog, or radio target</h1>
        <p className="mt-4 text-slate-600">Use this for manual, compliant research. Submitted targets enter review status and should be verified before outreach or premium routing.</p>
        <form className="mt-8 grid gap-5" action="/api/targets" method="post">
          <div>
            <label className="label" htmlFor="name">Target name</label>
            <input className="input" id="name" name="name" placeholder="Melodic Bass Afterglow" required />
          </div>
          <div>
            <label className="label" htmlFor="url">Public URL</label>
            <input className="input" id="url" name="url" placeholder="https://open.spotify.com/playlist/..." required />
          </div>
          <div>
            <label className="label" htmlFor="type">Channel type</label>
            <select className="input" id="type" name="type" defaultValue="spotify_playlist">
              <option value="spotify_playlist">Spotify playlist</option>
              <option value="soundcloud_channel">SoundCloud / repost channel</option>
              <option value="youtube_channel">YouTube music channel</option>
              <option value="tiktok_creator">TikTok creator</option>
              <option value="blog">Blog / editorial</option>
              <option value="radio">Radio / show</option>
              <option value="label">Label / A&amp;R</option>
              <option value="sync_library">Sync library</option>
            </select>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="genres">Genres</label>
              <input className="input" id="genres" name="genres" placeholder="future bass, melodic bass, EDM" />
            </div>
            <div>
              <label className="label" htmlFor="moods">Moods</label>
              <input className="input" id="moods" name="moods" placeholder="emotional, cinematic, hopeful" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="contactMethod">Contact or submission method</label>
            <input className="input" id="contactMethod" name="contactMethod" placeholder="Claim profile first / public submission link / manual review" />
          </div>
          <div>
            <label className="label" htmlFor="notes">Fit notes and risk notes</label>
            <textarea className="input min-h-32" id="notes" name="notes" placeholder="Who it fits, who it does not fit, and any verification concerns..." />
          </div>
          <button className="btn-primary w-full" type="submit">Submit for admin review</button>
        </form>
      </div>
    </main>
  );
}
