import Link from 'next/link';
import { ScamCheckerTool } from '@/components/tools/scam-checker-tool';

export const metadata = {
  title: 'Spotify Playlist Scam Checker | CuratorFit',
  description: 'A quick trust-first checklist for spotting risky playlist promotion claims before you pitch or pay.'
};

export default function ScamCheckerPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-16">
      <Link href="/tools" className="text-sm font-bold text-brand">Back to tools</Link>
      <span className="pill mt-6">Free tool</span>
      <h1 className="mt-5 text-5xl font-black tracking-tight text-ink">Spotify Playlist Scam Checker</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">Check visible risk signals before you submit or pay. This is a guide, not a guarantee of playlist quality or safety.</p>
      <div className="mt-8"><ScamCheckerTool /></div>
    </main>
  );
}
