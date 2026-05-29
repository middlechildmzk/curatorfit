import Link from 'next/link';
import { AIReleaseChecklistTool } from '@/components/tools/ai-release-checklist-tool';

export const metadata = {
  title: 'AI Music Release Checklist | CuratorFit',
  description: 'A release readiness checklist for Suno, Udio, and AI-assisted music creators.'
};

export default function AIReleaseChecklistPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-16">
      <Link href="/tools" className="text-sm font-bold text-brand">Back to tools</Link>
      <span className="pill mt-6">AI music tool</span>
      <h1 className="mt-5 text-5xl font-black tracking-tight text-ink">AI Music Release Checklist</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">Review rights, distributor policy, metadata, disclosure, and promotion readiness before you upload. This is educational, not legal advice.</p>
      <div className="mt-8"><AIReleaseChecklistTool /></div>
    </main>
  );
}
