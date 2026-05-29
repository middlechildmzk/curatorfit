import Link from 'next/link';

export const metadata = {
  title: 'CuratorFit Public Launch Checklist',
  description: 'A launch-readiness overview for the CuratorFit public resource hub.'
};

const checks = [
  'Public homepage, blog, tools, AI music hub, alternatives, genres, and target directory are available without Supabase.',
  'SaaS/account features remain beta-positioned until Supabase is connected.',
  'No guaranteed streams, paid placement, or bot-growth promises are used in launch copy.',
  'Waitlist is local-preview only until wired to an email platform or backend.',
  'Seed targets are candidate/unverified until manually reviewed.'
];

export default function LaunchPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-16">
      <span className="pill">V1.8 launch polish</span>
      <h1 className="mt-5 text-5xl font-black tracking-tight">Public launch checklist</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">Use this page as an internal checklist before sharing CuratorFit broadly.</p>
      <div className="mt-8 grid gap-4">
        {checks.map((check) => <div key={check} className="card p-5 text-sm leading-6 text-slate-700 shadow-none">✓ {check}</div>)}
      </div>
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/waitlist" className="btn-primary">Join beta</Link><Link href="/no-paid-placement" className="btn-secondary">Review trust policy</Link></div>
    </main>
  );
}
