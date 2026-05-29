import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function ContentCard({ href, title, description, eyebrow }: { href: string; title: string; description: string; eyebrow?: string }) {
  return (
    <Link href={href} className="card group block p-6 shadow-none transition hover:-translate-y-1 hover:shadow-soft">
      {eyebrow && <p className="text-xs font-black uppercase tracking-widest text-brand">{eyebrow}</p>}
      <h3 className="mt-2 text-xl font-black tracking-tight text-ink">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-ink">Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
    </Link>
  );
}

export function TrustCallout() {
  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
      <p className="text-sm font-black uppercase tracking-widest text-emerald-700">Trust-first policy</p>
      <h3 className="mt-2 text-2xl font-black text-ink">No paid placement. No guaranteed streams.</h3>
      <p className="mt-3 text-sm leading-6 text-emerald-900">
        CuratorFit is built around playlist fit, campaign organization, curator independence, and safer decision-making. Any future paid-review feature must compensate review time only, never playlist adds.
      </p>
    </div>
  );
}

export function ArticleCTA({ label = 'Start a free CuratorFit campaign' }: { label?: string }) {
  return (
    <div className="my-10 rounded-3xl bg-ink p-7 text-white">
      <p className="text-sm font-bold uppercase tracking-widest text-teal-200">Turn the guide into action</p>
      <h3 className="mt-2 text-3xl font-black tracking-tight">Track every pitch before your next release.</h3>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
        Save targets, write better pitches, avoid risky lists, and keep your campaign history in one place.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/campaigns" className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-ink">{label}</Link>
        <Link href="/tools" className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white">Explore free tools</Link>
      </div>
    </div>
  );
}
