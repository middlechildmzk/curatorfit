import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileCheck2,
  Link2,
  Megaphone,
  Music2,
  ShieldCheck,
  Users2
} from 'lucide-react';
import { getPromotionTargets } from '@/lib/data';

const modules = [
  { name: 'Releases', detail: 'Canonical metadata, assets, dates and campaign readiness.', icon: Music2, href: '/dashboard' },
  { name: 'Links', detail: 'Smart fan links, presave mode, attribution and consent capture.', icon: Link2, href: '/dashboard' },
  { name: 'Campaigns', detail: 'Coordinate targets, outreach, status and follow-up across channels.', icon: Megaphone, href: '/campaigns' },
  { name: 'CuratorFit Network', detail: 'Search playlists, channels, blogs, creators, radio and professionals.', icon: ShieldCheck, href: '/targets' },
  { name: 'Proof', detail: 'Preserve evidence source, method, confidence, freshness and contradictions.', icon: FileCheck2, href: '/proof' },
  { name: 'Fans', detail: 'Own consent-backed audience records and campaign attribution.', icon: Users2, href: '/fans' }
];

export default async function HomePage() {
  const targets = await getPromotionTargets();

  return (
    <main className="bg-[#f4f5f1]">
      <section className="overflow-hidden border-b border-black/10 bg-[#0b0b0b] text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c8ff00]/30 bg-[#c8ff00]/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#c8ff00]">
              <ShieldCheck size={13} /> Music promotion with provenance
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.055em] md:text-7xl">
              Release it. Promote it. Prove what worked.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/58">
              ArtistOS connects release setup, smart links, CuratorFit targeting, multi-channel campaigns, evidence records and first-party fans in one operating system.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-[#c8ff00] px-6 py-3.5 text-sm font-black text-black">Build a release <ArrowRight size={16} /></Link>
              <Link href="/targets" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-white">Explore CuratorFit Network</Link>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-white/55 sm:grid-cols-2">
              {['No guaranteed streams or placement', 'Evidence levels instead of fake certainty', 'Consent-backed fan ownership', 'Human-approved campaign execution'].map((item) => <div className="flex items-center gap-2" key={item}><CheckCircle2 className="h-4 w-4 text-[#c8ff00]" />{item}</div>)}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.035] p-4 shadow-2xl">
            <div className="rounded-3xl bg-[#111] p-6">
              <div className="flex items-center justify-between"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8ff00]">Release graph</p><BarChart3 className="h-5 w-5 text-white/35" /></div>
              <h2 className="mt-5 text-3xl font-black tracking-tight">One release becomes a learning system.</h2>
              <div className="mt-6 grid gap-2">
                {['Release metadata and assets', 'Fan link and consent capture', 'Three-channel campaign', 'Target and relationship history', 'Proof ledger with confidence', 'Actionable next-release learning'].map((item, index) => <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.035] p-3" key={item}><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#c8ff00] text-xs font-black text-black">{index + 1}</span><span className="text-sm font-semibold text-white/70">{item}</span></div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#667000]">The operating system</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] md:text-5xl">Six connected modules. One shared data foundation.</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">Every module writes to the same graph: release → link → campaign → target → evidence → fan. No disconnected spreadsheets, link tools or opaque campaign reports.</p>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map(({ name, detail, icon: Icon, href }) => (
            <Link className="group rounded-3xl border border-black/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl" href={href} key={name}>
              <div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-[#c8ff00]"><Icon size={20} /></span><ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-black" /></div>
              <h3 className="mt-6 text-xl font-black">{name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#667000]">CuratorFit Network</p><h2 className="mt-3 text-3xl font-black tracking-tight">Multi-channel opportunities, not a playlist-only database.</h2></div>
            <Link href="/targets" className="btn-secondary">View all targets</Link>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {targets.slice(0, 3).map((target) => (
              <Link className="rounded-3xl border border-black/10 bg-[#f7f8f4] p-6" href={`/targets/${target.slug}`} key={target.slug}>
                <div className="flex items-center justify-between"><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">{target.channelLabel}</span><span className="text-xs font-black text-[#667000]">Trust {target.trustScore}</span></div>
                <h3 className="mt-5 text-xl font-black">{target.name}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{target.fitNotes}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:py-20">
        <div className="rounded-[32px] bg-[#c8ff00] p-8 text-black md:p-12">
          <p className="text-xs font-black uppercase tracking-[0.18em] opacity-60">Smallest coherent product</p>
          <h2 className="mt-3 max-w-4xl text-4xl font-black leading-tight tracking-[-0.04em] md:text-5xl">Release → Link → Campaign → Proof → Fans.</h2>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 opacity-70">Start with the release command center. ArtistOS creates the connected records the larger promotion, CRM and intelligence platform will build upon.</p>
          <Link className="mt-7 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3.5 text-sm font-black text-[#c8ff00]" href="/dashboard">Open ArtistOS <ArrowRight size={16} /></Link>
        </div>
      </section>
    </main>
  );
}
