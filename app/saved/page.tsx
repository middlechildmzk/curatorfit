import Link from 'next/link';
import { SavedTargetsClient } from '@/components/saved-targets-client';

export const metadata = { title: 'Saved Targets | CuratorFit' };

export default function SavedTargetsPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-brand">Artist workspace</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Saved promotion targets</h1>
          <p className="mt-4 max-w-3xl text-slate-600">Use this as the shortlist before you create or update a release campaign. Saving a target does not contact the curator, it only keeps the opportunity in your workspace.</p>
        </div>
        <Link href="/targets" className="btn-primary">Browse targets</Link>
      </div>
      <SavedTargetsClient />
    </main>
  );
}
