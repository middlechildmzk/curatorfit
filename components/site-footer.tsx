import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-lg font-black">ArtistOS</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            The operating system for releases, smart links, multi-channel campaigns, CuratorFit targeting, verified promotion evidence and artist-owned fan data.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Link href="/onboarding" className="btn-secondary">Create account</Link>
            <Link href="/no-paid-placement" className="btn-secondary">Trust policy</Link>
          </div>
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          <p className="font-bold text-ink">Artist workspace</p>
          <Link className="block" href="/dashboard">Releases</Link>
          <Link className="block" href="/campaigns">Campaigns</Link>
          <Link className="block" href="/connections">Connections</Link>
          <Link className="block" href="/proof">Proof</Link>
          <Link className="block" href="/fans">Fans</Link>
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          <p className="font-bold text-ink">CuratorFit network</p>
          <Link className="block" href="/targets">Browse properties</Link>
          <Link className="block" href="/professional">Professional profile</Link>
          <Link className="block" href="/inbox">Review inbox</Link>
          <Link className="block" href="/methodology">Scoring methodology</Link>
          <Link className="block" href="/no-paid-placement">No paid placement</Link>
        </div>
      </div>
    </footer>
  );
}
