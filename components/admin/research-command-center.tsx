import Link from 'next/link';
import { promotionTargets } from '@/data/seed';
import { testImportRows } from '@/data/test-import-25';
import { RISK_FLAGS, TRUST_TIER_DESCRIPTIONS } from '@/data/target-review-types';

function CommandCard({ title, value, caption }: { title: string; value: string | number; caption: string }) {
  return (
    <div className="rounded-3xl border border-emerald-400/20 bg-black/40 p-5">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-slate-500">{title}</p>
      <p className="mt-2 font-mono text-4xl font-black text-emerald-300">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{caption}</p>
    </div>
  );
}

const channelTargets = [
  { label: 'Spotify', current: 100, goal: 250 },
  { label: 'SoundCloud', current: 35, goal: 150 },
  { label: 'YouTube', current: 65, goal: 150 },
  { label: 'TikTok / IG', current: 20, goal: 125 },
  { label: 'Blogs / Newsletters', current: 50, goal: 150 },
  { label: 'Radio', current: 25, goal: 75 },
  { label: 'Labels', current: 20, goal: 50 },
  { label: 'Sync / Licensing', current: 20, goal: 50 }
];

const nextActions = [
  'Import 25-row test batch and validate all fields.',
  'Wire import queue to database table once Supabase schema is approved.',
  'Run duplicate detection on target_name + platform + primary_url.',
  'Verify Christian vertical public submission pages first.',
  'Separate TikTok/Instagram placeholders from real individual accounts.',
  'Never upgrade a target beyond candidate without live evidence.'
];

export function ResearchCommandCenter() {
  const combinedCount = promotionTargets.length + testImportRows.length;
  const blockedCount = testImportRows.filter((row) => row.review_status === 'blocked' || row.do_not_contact === 'yes').length;
  const aiFriendlyCount = testImportRows.filter((row) => ['yes', 'partial'].includes(row.allows_ai_assisted_music)).length;

  return (
    <main className="min-h-screen bg-[#05070a] text-slate-100">
      <div className="mx-auto max-w-7xl px-5 py-10">
        <section className="mb-8 border-b border-emerald-400/20 pb-8">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-emerald-300">A&R Command Center</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">CuratorFit Research OS</h1>
          <p className="mt-4 max-w-4xl text-slate-400">Dense admin workspace for growing from a few dozen targets to a 2,000 to 5,000 record promotion intelligence database. Public-facing pages stay simple. This command center stays operational.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/admin/imports" className="rounded-full bg-emerald-300 px-5 py-3 text-sm font-black text-black">Open import console</Link><Link href="/targets" className="rounded-full border border-emerald-400/30 px-5 py-3 text-sm font-bold text-emerald-100">View public directory</Link></div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <CommandCard title="Current foundation" value={combinedCount} caption="Seed targets plus 25-row test batch." />
          <CommandCard title="Near-term goal" value="2,000" caption="Reviewable multi-channel targets." />
          <CommandCard title="Long-term goal" value="5,000" caption="Living directory with refresh cycles." />
          <CommandCard title="AI-compatible test rows" value={aiFriendlyCount} caption="Explicit yes or partial policy in test batch." />
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-emerald-400/20 bg-[#07100c] p-5">
            <h2 className="font-mono text-sm uppercase tracking-widest text-emerald-300">Database build map</h2>
            <div className="mt-5 grid gap-3">
              {channelTargets.map((item) => {
                const pct = Math.round((item.current / item.goal) * 100);
                return (
                  <div key={item.label} className="rounded-2xl border border-emerald-400/10 bg-black/30 p-4">
                    <div className="flex items-center justify-between gap-3 font-mono text-sm"><span>{item.label}</span><span className="text-emerald-300">{item.current}/{item.goal}</span></div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-emerald-300" style={{ width: `${Math.min(100, pct)}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-400/20 bg-[#07100c] p-5">
            <h2 className="font-mono text-sm uppercase tracking-widest text-emerald-300">Immediate next actions</h2>
            <div className="mt-5 grid gap-3">
              {nextActions.map((action, index) => <div key={action} className="rounded-2xl border border-emerald-400/10 bg-black/30 p-4 text-sm leading-6 text-slate-300"><span className="font-mono text-emerald-300">{String(index + 1).padStart(2, '0')} </span>{action}</div>)}
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-emerald-400/20 bg-[#07100c] p-5">
            <h2 className="font-mono text-sm uppercase tracking-widest text-emerald-300">Trust tiers</h2>
            <div className="mt-5 grid gap-3">
              {Object.entries(TRUST_TIER_DESCRIPTIONS).map(([tier, description]) => <div key={tier} className="rounded-2xl bg-black/30 p-4"><p className="font-mono text-emerald-200">{tier}</p><p className="mt-1 text-sm text-slate-400">{description}</p></div>)}
            </div>
          </div>
          <div className="rounded-3xl border border-emerald-400/20 bg-[#07100c] p-5">
            <h2 className="font-mono text-sm uppercase tracking-widest text-emerald-300">Risk flag library</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {RISK_FLAGS.map((flag) => <span key={flag} className="rounded-full border border-emerald-400/20 bg-black/40 px-3 py-1 font-mono text-xs text-slate-300">{flag}</span>)}
            </div>
            <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-950/20 p-4 text-sm leading-6 text-amber-100">Any target with guaranteed streams, guaranteed placement, paid slot language, fake engagement, or opt-out status should be blocked from normal recommendations.</div>
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-400/20 bg-[#07100c] p-5">
          <h2 className="font-mono text-sm uppercase tracking-widest text-emerald-300">Test import preview</h2>
          <div className="mt-4 overflow-auto rounded-2xl border border-emerald-400/10">
            <table className="min-w-full border-collapse font-mono text-xs">
              <thead className="bg-black text-slate-500"><tr><th className="px-3 py-3 text-left">Target</th><th className="px-3 py-3 text-left">Type</th><th className="px-3 py-3 text-left">Genre</th><th className="px-3 py-3 text-left">Risk</th><th className="px-3 py-3 text-left">AI</th><th className="px-3 py-3 text-left">Status</th></tr></thead>
              <tbody>
                {testImportRows.map((row) => <tr key={row.id} className="border-t border-emerald-400/10"><td className="px-3 py-3 text-emerald-100">{row.target_name}</td><td className="px-3 py-3 text-slate-300">{row.target_type}</td><td className="px-3 py-3 text-slate-300">{row.primary_genre}</td><td className="px-3 py-3 text-slate-300">{row.risk_level}</td><td className="px-3 py-3 text-slate-300">{row.allows_ai_assisted_music}</td><td className="px-3 py-3 text-slate-300">{row.review_status}</td></tr>)}
              </tbody>
            </table>
          </div>
          {blockedCount ? <p className="mt-4 text-sm text-amber-100">{blockedCount} rows are blocked or do-not-contact in the test batch.</p> : null}
        </section>
      </div>
    </main>
  );
}
