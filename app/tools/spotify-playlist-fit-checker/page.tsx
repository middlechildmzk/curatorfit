import { FitCheckerTool } from '@/components/tools/fit-checker-tool';
import Link from 'next/link';

export const metadata = {
  title: 'Spotify Playlist Fit Checker | CuratorFit',
  description: 'Preview whether your song and a playlist appear aligned before you waste a pitch.'
};

export default function FitCheckerPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-16">
      <span className="pill">Free tool</span>
      <h1 className="mt-5 text-5xl font-black tracking-tight">Spotify Playlist Fit Checker</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">Paste a song description and playlist description to get an educational fit preview. This does not guarantee acceptance. It helps you decide whether a pitch is worth preparing.</p>
      <div className="mt-8"><FitCheckerTool /></div>
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/tools/playlist-pitch-generator" className="btn-primary">Generate pitch copy</Link><Link href="/waitlist" className="btn-secondary">Save fits in beta</Link></div>
    </main>
  );
}
