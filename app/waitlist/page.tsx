import { BetaWaitlist } from '@/components/beta-waitlist';
import Link from 'next/link';

export const metadata = {
  title: 'Join the CuratorFit Beta',
  description: 'Join the CuratorFit beta for honest playlist pitching tools, AI music release checklists, and campaign tracking.'
};

export default function WaitlistPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-16">
      <span className="pill">Public launch mode</span>
      <h1 className="mt-5 text-5xl font-black tracking-tight">Join the CuratorFit beta.</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
        CuratorFit is live as a public resource hub first. The beta will add real saved targets, campaign history, curator claims, and verified review workflows.
      </p>
      <div className="mt-8"><BetaWaitlist source="waitlist-page" /></div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {[
          ['Artists', 'Get better-fit playlist targets, pitch templates, scam checks, and a place to track every submission.'],
          ['Curators', 'Claim your profile, set your rules, and control what artists know before pitching you.'],
          ['AI creators', 'Use release checklists for Suno/Udio workflows without fake legal certainty or promotion hype.']
        ].map(([title, body]) => <div key={title} className="card p-5 shadow-none"><h2 className="font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></div>)}
      </div>
      <div className="mt-10"><Link className="btn-secondary" href="/tools">Try the free tools first</Link></div>
    </main>
  );
}
