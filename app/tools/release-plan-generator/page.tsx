import { ReleasePlanTool } from '@/components/tools/release-plan-tool';
import Link from 'next/link';

export const metadata = {
  title: 'Release Plan Generator | CuratorFit',
  description: 'Turn a release date into a practical music promotion timeline.'
};

export default function ReleasePlanPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-16">
      <span className="pill">Free checklist</span>
      <h1 className="mt-5 text-5xl font-black tracking-tight">Release Plan Generator</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">Choose a release date and generate a simple campaign timeline for metadata, pitch prep, curator outreach, launch day, and follow-up.</p>
      <div className="mt-8"><ReleasePlanTool /></div>
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/campaigns" className="btn-primary">Open campaign tracker</Link><Link href="/blog/music-release-day-checklist" className="btn-secondary">Read release checklist</Link></div>
    </main>
  );
}
