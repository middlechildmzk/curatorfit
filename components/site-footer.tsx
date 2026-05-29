import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-lg font-black">CuratorFit</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Playlist discovery, fit scoring, and pitch tracking for independent artists. Curators are never paid for playlist adds. No guaranteed streams. No fake hype.
          </p>
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          <p className="font-bold text-ink">Product</p>
          <Link className="block" href="/browse">Browse playlists</Link>
          <Link className="block" href="/targets">Promotion targets</Link>
          <Link className="block" href="/saved">Saved targets</Link>
          <Link className="block" href="/artist">Artist tracker</Link>
          <Link className="block" href="/tools">Free tools</Link>
          <Link className="block" href="/claim">Claim playlist</Link>
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          <p className="font-bold text-ink">Trust</p>
          <Link className="block" href="/blog">Blog</Link>
          <Link className="block" href="/ai-music">AI music hub</Link>
          <Link className="block" href="/alternatives">Alternatives</Link>
          <Link className="block" href="/no-paid-placement">No paid placement</Link>
          <Link className="block" href="/methodology">Scoring methodology</Link>
          <Link className="block" href="/policy">Platform policy</Link>
        </div>
      </div>
    </footer>
  );
}
