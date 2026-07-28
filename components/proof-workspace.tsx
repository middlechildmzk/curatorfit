'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, FileCheck2, Loader2, ShieldCheck } from 'lucide-react';
import type { ArtistOSRelease } from '@/lib/artistos';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { ProofAttachmentForm } from '@/components/proof-attachment-form';

export function ProofWorkspace() {
  const [releases, setReleases] = useState<ArtistOSRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    const supabase = getSupabaseBrowser();
    const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
    const token = data.session?.access_token;
    const response = await fetch('/api/releases', { headers: token ? { Authorization: `Bearer ${token}` } : undefined, cache: 'no-store' });
    const json = await response.json().catch(() => ({ ok: false, error: 'Could not load releases.' }));
    if (json.ok) setReleases(json.releases || []);
    else setMessage(json.error || 'Could not load releases.');
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f5f1] px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[32px] bg-[#0b0b0b] p-7 text-white md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8ff00]">ArtistOS Proof</p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] md:text-5xl">Evidence is a record, not a marketing claim.</h1>
              <p className="mt-4 text-base leading-7 text-white/55">Append live evidence to a release, preserve its source and observation time, then promote it to stronger verification levels only when API or authorized-account checks support it.</p>
            </div>
            <Link className="inline-flex items-center gap-2 rounded-full bg-[#c8ff00] px-5 py-3 text-sm font-black text-black" href="/dashboard">Release center <ArrowUpRight size={15} /></Link>
          </div>
          <div className="mt-8 grid gap-2 sm:grid-cols-3">
            {[
              ['L1–L4', 'API or account-authorized'],
              ['L5', 'Independently reviewed'],
              ['L6–L11', 'Estimated, reported, conflicting or stale']
            ].map(([level, detail]) => <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={level}><p className="text-sm font-black text-[#c8ff00]">{level}</p><p className="mt-2 text-xs leading-5 text-white/45">{detail}</p></div>)}
          </div>
        </section>

        <section className="mt-7 space-y-4">
          <div className="rounded-3xl border border-black/10 bg-white p-6">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#e8ff91]"><ShieldCheck size={18} /></span><div><h2 className="text-xl font-black">Release evidence ledger</h2><p className="mt-1 text-sm text-slate-500">Manual URLs enter pending review. They are never mislabeled as public API verification.</p></div></div>
          </div>

          {loading ? <div className="rounded-3xl border border-black/10 bg-white p-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div> : null}
          {message ? <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">{message}</div> : null}
          {!loading && !releases.length ? <div className="rounded-3xl border border-dashed border-black/20 bg-white p-10 text-center"><FileCheck2 className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-3 font-black">Create a release first</p><Link className="mt-4 inline-flex font-bold underline" href="/dashboard">Open Release Command Center</Link></div> : null}

          {releases.map((release) => (
            <article className="rounded-3xl border border-black/10 bg-white p-5 md:p-6" key={release.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{release.artistName}</p><h3 className="mt-2 text-2xl font-black">{release.title}</h3><p className="mt-2 text-sm text-slate-500">{release.evidenceCount} evidence record{release.evidenceCount === 1 ? '' : 's'} currently attached.</p></div>
                {release.smartLink ? <Link className="btn-secondary gap-2" href={`/l/${release.smartLink.slug}`} target="_blank">View public link <ArrowUpRight size={14} /></Link> : null}
              </div>
              <ProofAttachmentForm releaseId={release.id} onSaved={() => setReleases((current) => current.map((item) => item.id === release.id ? { ...item, evidenceCount: item.evidenceCount + 1 } : item))} />
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
