import Link from 'next/link';

export const metadata = {
  title: 'CuratorFit V2 SaaS Mode',
  description: 'The V2 path for turning CuratorFit from a public resource hub into a real music pitching SaaS.'
};

const phases = [
  ['1. Database', 'Create Supabase project, run schema, seed promotion targets, enable RLS policies.'],
  ['2. Auth', 'Enable magic-link login, create profiles, assign admin emails, protect admin routes.'],
  ['3. User workspaces', 'Persist saved targets, campaigns, campaign statuses, pitch drafts, and profile settings.'],
  ['4. Admin operations', 'Review imported targets, curator claims, applications, opt-outs, and verification notes.'],
  ['5. Workflow tools', 'Save pitch generator output to campaigns and convert release checklists into campaign tasks.'],
  ['6. Monetization later', 'Only after trust and workflow are proven: paid reviews, Stripe, Stripe Connect, refunds, and payout logs.']
];

export default function V2Page() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-16">
      <span className="pill">V2 scaffold</span>
      <h1 className="mt-5 text-5xl font-black tracking-tight">CuratorFit V2: SaaS Mode</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">V2 turns the public launch site into a real authenticated app with Supabase-backed campaigns, saved targets, admin review queues, curator claims, and import workflows.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {phases.map(([title, body]) => <div key={title} className="card p-5 shadow-none"><h2 className="font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></div>)}
      </div>
      <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
        V2 still stays away from pay-for-placement language. Curators may be compensated for review time only in a later release. Placement decisions remain independent.
      </div>
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/waitlist" className="btn-primary">Join beta</Link><Link href="/launch" className="btn-secondary">Public launch checklist</Link></div>
    </main>
  );
}
