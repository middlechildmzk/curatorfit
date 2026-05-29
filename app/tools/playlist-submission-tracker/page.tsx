import Link from 'next/link';
import { SubmissionTrackerTool } from '@/components/tools/submission-tracker-tool';

export const metadata = {
  title: 'Playlist Submission Tracker | CuratorFit',
  description: 'Preview a simple tracker for saved, drafted, pitched, follow-up, passed, added, and do-not-contact statuses.'
};

export default function SubmissionTrackerPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-16">
      <Link href="/tools" className="text-sm font-bold text-brand">Back to tools</Link>
      <span className="pill mt-6">Tracker preview</span>
      <h1 className="mt-5 text-5xl font-black tracking-tight text-ink">Playlist Submission Tracker</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">Organize targets, pitch status, and notes before your campaign turns into a mess of DMs, forms, and forgotten follow-ups.</p>
      <div className="mt-8"><SubmissionTrackerTool /></div>
    </main>
  );
}
