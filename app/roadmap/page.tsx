import { CheckCircle2, CircleDashed } from 'lucide-react';

const roadmap = [
  ['V1', 'Safe playlist directory', 'Public pages, seed playlists, claim flow, artist tracker, no-paid-placement policy.', true],
  ['V1.1', 'Multi-channel promotion target graph', 'Promotion targets can now represent Spotify, SoundCloud, YouTube, TikTok, blogs, radio, labels, and sync libraries.', true],
  ['V1.2', 'Supabase persistence', 'Save claim forms, campaigns, targets, artist notes, and admin verification states.', false],
  ['V1.3', 'AI pitch generator', 'Generate short, emotional, professional, and curator-safe pitch variations per channel.', false],
  ['V2', 'Curator inbox', 'Claimed curators can receive, review, pass, save, or accept submissions with structured feedback.', false],
  ['V3', 'Paid review credits', 'Stripe credits, refunds for missed reviews, Stripe Connect payouts, and curator earnings.', false],
  ['V4', 'Trust and risk engine', 'Playlist health snapshots, feedback quality scores, bot-risk warnings, and source provenance.', false]
];

export const metadata = { title: 'Roadmap | CuratorFit' };

export default function RoadmapPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-14">
      <span className="pill mb-4">Build roadmap</span>
      <h1 className="text-4xl font-black tracking-tight text-ink md:text-6xl">From playlist directory to Music Pitch OS.</h1>
      <p className="mt-5 text-lg leading-8 text-slate-600">This roadmap keeps the product compliant and useful before adding payments. The order matters: trust, data, workflow, then monetization.</p>
      <div className="mt-10 grid gap-4">
        {roadmap.map(([version, title, body, done]) => (
          <div key={version as string} className="card flex gap-4 p-6">
            {done ? <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-brand2" /> : <CircleDashed className="mt-1 h-6 w-6 shrink-0 text-slate-400" />}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand">{version}</p>
              <h2 className="mt-1 text-xl font-black">{title}</h2>
              <p className="mt-2 leading-7 text-slate-600">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
