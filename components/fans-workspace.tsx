'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Download, Loader2, MailCheck, Users2 } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

type FanRow = {
  id: string;
  email: string;
  firstName: string | null;
  sourceChannel: string | null;
  sourceCampaign: string | null;
  firstSeenAt: string;
  lastSeenAt?: string | null;
  consentCount: number;
};

export function FansWorkspace() {
  const [fans, setFans] = useState<FanRow[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(500);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowser();
      const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const token = data.session?.access_token;
      const response = await fetch('/api/fans', { headers: token ? { Authorization: `Bearer ${token}` } : undefined, cache: 'no-store' });
      const json = await response.json().catch(() => ({ ok: false, error: 'Could not load fan records.' }));
      if (json.ok) {
        setFans(json.fans || []);
        setTotal(json.total || json.fans?.length || 0);
        setLimit(json.limit || 500);
      } else setMessage(json.error || 'Could not load fan records.');
      setLoading(false);
    }
    load();
  }, []);

  const sources = useMemo(() => new Set(fans.map((fan) => fan.sourceChannel || 'unknown')).size, [fans]);
  const consented = useMemo(() => fans.filter((fan) => fan.consentCount > 0).length, [fans]);

  function exportCsv() {
    const rows = [
      ['email', 'first_name', 'source_channel', 'source_campaign', 'first_seen_at', 'consent_records'],
      ...fans.map((fan) => [fan.email, fan.firstName || '', fan.sourceChannel || '', fan.sourceCampaign || '', fan.firstSeenAt, String(fan.consentCount)])
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `artistos-fans-latest-${fans.length}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#f4f5f1] px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[32px] bg-[#0b0b0b] p-7 text-white md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8ff00]">ArtistOS Fans</p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] md:text-5xl">Own the audience your campaigns create.</h1>
              <p className="mt-4 text-base leading-7 text-white/55">Every signup carries its source, campaign context and consent evidence. ArtistOS does not turn anonymous traffic into a fan without an explicit action.</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full bg-[#c8ff00] px-5 py-3 text-sm font-black text-black disabled:opacity-40" onClick={exportCsv} disabled={!fans.length}><Download size={15} /> Export loaded {fans.length}</button>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
            {[[String(total), 'Known fan records'], [String(consented), `Consent proof in latest ${fans.length}`], [String(sources), `Sources in latest ${fans.length}`]].map(([value, label]) => <div className="bg-[#111] p-4" key={label}><p className="text-2xl font-black text-[#c8ff00]">{value}</p><p className="mt-1 text-xs text-white/40">{label}</p></div>)}
          </div>
        </section>

        <section className="mt-7 overflow-hidden rounded-3xl border border-black/10 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#e8ff91]"><Users2 size={18} /></span><div><h2 className="text-xl font-black">Fan records</h2><p className="mt-1 text-sm text-slate-500">Showing the latest {Math.min(limit, fans.length)} of {total.toLocaleString()} records. The CSV exports only the loaded page.</p></div></div>
            <Link className="btn-secondary gap-2" href="/dashboard">Manage releases <ArrowUpRight size={14} /></Link>
          </div>

          {loading ? <div className="p-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div> : null}
          {message ? <div className="m-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">{message}</div> : null}
          {!loading && !fans.length ? <div className="p-12 text-center"><MailCheck className="mx-auto h-8 w-8 text-slate-300" /><h3 className="mt-4 font-black">No fan signups yet</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Open a release’s public fan link and submit the consent-backed form to create the first record.</p></div> : null}

          {fans.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-400"><tr><th className="px-5 py-3">Fan</th><th className="px-5 py-3">Source</th><th className="px-5 py-3">Campaign</th><th className="px-5 py-3">Consent</th><th className="px-5 py-3">First seen</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {fans.map((fan) => <tr key={fan.id}><td className="px-5 py-4"><p className="font-bold text-slate-900">{fan.firstName || 'Unnamed fan'}</p><p className="mt-1 text-xs text-slate-500">{fan.email}</p></td><td className="px-5 py-4 text-slate-600">{fan.sourceChannel || 'Unknown'}</td><td className="px-5 py-4 text-slate-600">{fan.sourceCampaign || 'Direct'}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${fan.consentCount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{fan.consentCount} record{fan.consentCount === 1 ? '' : 's'}</span></td><td className="px-5 py-4 text-slate-500">{new Date(fan.firstSeenAt).toLocaleDateString()}</td></tr>)}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
