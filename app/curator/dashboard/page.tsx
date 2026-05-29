import Link from 'next/link';
import { getPromotionTargets } from '@/lib/data';

export const metadata = { title: 'Curator dashboard | CuratorFit' };

export default async function CuratorDashboardPage() {
  const targets = await getPromotionTargets();
  const seedTargets = targets.slice(0, 6);
  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <p className="text-sm font-bold uppercase tracking-widest text-brand">Curator workspace V1.3</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Claim, verify, and prepare your profile.</h1>
      <p className="mt-4 max-w-3xl text-slate-600">This is the pre-marketplace curator dashboard. It is built for profile claiming and preference setup now, then review queues and payout logic later.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <div className="card p-6"><h2 className="font-black">1. Claim profiles</h2><p className="mt-2 text-sm text-slate-600">Connect your playlist or channel to a real owner account.</p><Link className="btn-secondary mt-5" href="/claim">Claim listing</Link></div>
        <div className="card p-6"><h2 className="font-black">2. Set rules</h2><p className="mt-2 text-sm text-slate-600">Define accepted genres, hard no’s, contact preferences, and pitch windows.</p><Link className="btn-secondary mt-5" href="/apply">Apply as curator</Link></div>
        <div className="card p-6"><h2 className="font-black">3. Future review queue</h2><p className="mt-2 text-sm text-slate-600">V2 will add structured reviews, response deadlines, feedback quality, and optional paid review credits.</p><Link className="btn-secondary mt-5" href="/roadmap">View roadmap</Link></div>
      </div>
      <section className="mt-10 card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h2 className="text-2xl font-black">Potential profiles to claim</h2><p className="mt-1 text-sm text-slate-500">Demo list from public seed data/Supabase targets.</p></div>
          <Link href="/browse" className="btn-secondary">Browse all</Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {seedTargets.map((target) => (
            <div className="rounded-3xl border border-line bg-panel p-5" key={target.slug}>
              <p className="text-xs font-bold uppercase tracking-widest text-brand">{target.channelLabel}</p>
              <h3 className="mt-2 text-lg font-black">{target.name}</h3>
              <p className="mt-2 text-sm text-slate-600 line-clamp-3">{target.fitNotes}</p>
              <div className="mt-4 flex gap-2"><Link className="btn-secondary py-2" href={`/targets/${target.slug}`}>View</Link><Link className="btn-primary py-2" href={`/claim?target=${target.slug}`}>Claim</Link></div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
