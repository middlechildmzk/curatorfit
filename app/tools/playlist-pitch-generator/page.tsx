import Link from 'next/link';
import { PlaylistPitchTool } from '@/components/tools/playlist-pitch-tool';

export const metadata = {
  title: 'Playlist Pitch Generator | CuratorFit',
  description: 'Generate a short, curator-safe playlist pitch based on your genre, mood, song, and target type.'
};

export default function PitchGeneratorPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-16">
      <Link href="/tools" className="text-sm font-bold text-brand">Back to tools</Link>
      <span className="pill mt-6">Free tool</span>
      <h1 className="mt-5 text-5xl font-black tracking-tight text-ink">Playlist Pitch Generator</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">Create a respectful pitch that explains fit without promising placement or sounding like spam.</p>
      <div className="mt-8"><PlaylistPitchTool /></div>
    </main>
  );
}
