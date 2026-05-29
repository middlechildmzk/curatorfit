import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-lg font-black">CuratorFit</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            The honest music pitching OS for independent and AI-assisted artists. Start with playlist fit, scam checks, release guides, and campaign tracking. No bots. No guaranteed streams. No paid placement.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Link href="/waitlist" className="btn-secondary">Join beta</Link>
            <Link href="/no-paid-placement" className="btn-secondary">Trust policy</Link>
          </div>
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          <p className="font-bold text-ink">Public launch</p>
          <Link className="block" href="/blog">Blog</Link>
          <Link className="block" href="/tools">Free tools</Link>
          <Link className="block" href="/ai-music">AI music hub</Link>
          <Link className="block" href="/targets">Promotion targets</Link>
          <Link className="block" href="/claim">Claim profile</Link>
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          <p className="font-bold text-ink">Trust + SEO</p>
          <Link className="block" href="/alternatives">Alternatives</Link>
          <Link className="block" href="/genres">Genre pages</Link>
          <Link className="block" href="/no-paid-placement">No paid placement</Link>
          <Link className="block" href="/methodology">Scoring methodology</Link>
          <Link className="block" href="/roadmap">Roadmap</Link>
        </div>
      </div>
    </footer>
  );
}
