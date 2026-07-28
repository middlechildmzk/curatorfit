'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  CheckCircle2,
  CircleDashed,
  FileCheck2,
  Loader2,
  Megaphone,
  Plus,
  Search,
  ShieldCheck,
  Target,
  Users2
} from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { humanize } from '@/lib/artistos';

type DirectoryTarget = {
  slug: string;
  name: string;
  channelLabel: string;
  owner: string;
  trustScore: number;
  status: string;
  genres: string[];
};

type CampaignTarget = {
  id: string;
  name: string;
  channel: string;
  status: string;
  notes: string | null;
  verificationStatus: string;
  evidenceStrength: number;
  activityStatus: string;
};

type Campaign = {
  id: string;
  name: string;
  status: string;
  goals: string | null;
  startDate: string | null;
  endDate: string | null;
  release: { id: string; title: string; status: string; releaseDate: string | null; artistName: string } | null;
  targets: CampaignTarget[];
  deliverableCount: number;
  verifiedDeliverableCount: number;
  evidenceCount: number;
};

const targetStatuses = ['queued', 'pitched', 'replied', 'accepted', 'declined', 'placed'] as const;

export function CampaignCommandCenter({ directoryTargets }: { directoryTargets: DirectoryTarget[] }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState('');
  const [message, setMessage] = useState('');

  async function token() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }

  async function load() {
    setLoading(true);
    const accessToken = await token();
    const response = await fetch('/api/campaigns', { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined, cache: 'no-store' });
    const json = await response.json().catch(() => ({ ok: false, error: 'Could not load campaigns.' }));
    if (json.ok) {
      const next = json.campaigns || [];
      setCampaigns(next);
      setSelectedCampaignId((current) => current || next[0]?.id || '');
    } else setMessage(json.error || 'Could not load campaigns.');
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const selectedCampaign = campaigns.find((campaign) => campaign.id === selectedCampaignId) || campaigns[0] || null;
  const selectedSlugs = useMemo(() => new Set(selectedCampaign?.targets.map((target) => target.name.toLowerCase()) || []), [selectedCampaign]);
  const filteredTargets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return directoryTargets
      .filter((target) => !selectedSlugs.has(target.name.toLowerCase()))
      .filter((target) => !normalized || `${target.name} ${target.channelLabel} ${target.owner} ${target.genres.join(' ')}`.toLowerCase().includes(normalized))
      .slice(0, 30);
  }, [directoryTargets, query, selectedSlugs]);

  const totals = useMemo(() => ({
    targets: campaigns.reduce((sum, campaign) => sum + campaign.targets.length, 0),
    evidence: campaigns.reduce((sum, campaign) => sum + campaign.evidenceCount, 0),
    verified: campaigns.reduce((sum, campaign) => sum + campaign.verifiedDeliverableCount, 0)
  }), [campaigns]);

  async function attachTarget(target: DirectoryTarget) {
    if (!selectedCampaign) return;
    setSavingKey(target.slug);
    setMessage('');
    const accessToken = await token();
    const response = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify({ action: 'attach_target', campaignId: selectedCampaign.id, targetSlug: target.slug })
    });
    const json = await response.json().catch(() => ({ ok: false, error: 'Could not attach target.' }));
    setMessage(json.ok ? `${target.name} added to ${selectedCampaign.name}.` : json.error || 'Could not attach target.');
    if (json.ok) await load();
    setSavingKey('');
  }

  async function updateTarget(campaignTargetId: string, status: string) {
    setSavingKey(`${campaignTargetId}:${status}`);
    const accessToken = await token();
    const response = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify({ action: 'update_target', campaignTargetId, status })
    });
    const json = await response.json().catch(() => ({ ok: false, error: 'Could not update target.' }));
    setMessage(json.ok ? 'Campaign status updated.' : json.error || 'Could not update target.');
    if (json.ok) await load();
    setSavingKey('');
  }

  return (
    <main className="min-h-screen bg-[#f4f5f1] pb-20">
      <section className="border-b border-black/10 bg-[#0b0b0b] text-white">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8ff00]">ArtistOS Campaigns</p>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.045em] md:text-6xl">One release. Every target. One command center.</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/55">Build a multi-channel target list from the real CuratorFit network, preserve every relationship state, and connect accepted work to deliverables and evidence.</p>
            </div>
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:min-w-[420px]">
              {[[campaigns.length, 'Campaigns'], [totals.targets, 'Targets'], [totals.evidence, 'Proof records']].map(([value, label]) => <div className="bg-[#111] p-4" key={String(label)}><p className="text-2xl font-black text-[#c8ff00]">{value}</p><p className="mt-1 text-xs text-white/40">{label}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-7 px-5 py-8 lg:grid-cols-[1fr_380px]">
        <section className="space-y-5">
          {loading ? <div className="rounded-3xl border border-black/10 bg-white p-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div> : null}
          {message ? <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm font-semibold text-slate-700">{message}</div> : null}
          {!loading && !campaigns.length ? <div className="rounded-3xl border border-dashed border-black/20 bg-white p-12 text-center"><Megaphone className="mx-auto h-8 w-8 text-slate-300" /><h2 className="mt-4 text-xl font-black">Create a release campaign first</h2><Link className="mt-4 inline-flex font-bold underline" href="/dashboard">Open the Release Command Center</Link></div> : null}

          {campaigns.map((campaign) => (
            <article className={`rounded-3xl border bg-white p-5 transition md:p-6 ${selectedCampaign?.id === campaign.id ? 'border-black shadow-xl' : 'border-black/10'}`} key={campaign.id}>
              <button className="w-full text-left" onClick={() => setSelectedCampaignId(campaign.id)}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#667000]">{campaign.release?.artistName || 'ArtistOS release'}</p><h2 className="mt-2 text-2xl font-black">{campaign.name}</h2><p className="mt-2 text-sm text-slate-500">{campaign.release?.title || 'Unlinked release'} · {humanize(campaign.status)}</p></div>
                  <div className="flex gap-2"><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{campaign.targets.length} targets</span><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{campaign.evidenceCount} proof</span></div>
                </div>
                {campaign.goals ? <p className="mt-5 rounded-2xl bg-[#f7f8f4] p-4 text-sm leading-6 text-slate-600">{campaign.goals}</p> : null}
              </button>

              <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                {campaign.targets.length ? campaign.targets.map((target) => (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4" key={target.id}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div><p className="font-black">{target.name}</p><p className="mt-1 text-xs text-slate-500">{humanize(target.channel)} · {humanize(target.verificationStatus)} · evidence {target.evidenceStrength}/5</p></div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${target.status === 'placed' ? 'bg-emerald-50 text-emerald-700' : target.status === 'declined' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{humanize(target.status)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {targetStatuses.map((status) => <button className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${status === target.status ? 'border-black bg-black text-white' : 'border-slate-200 bg-white text-slate-500'}`} disabled={Boolean(savingKey)} key={status} onClick={() => updateTarget(target.id, status)}>{savingKey === `${target.id}:${status}` ? 'Saving…' : humanize(status)}</button>)}
                    </div>
                  </div>
                )) : <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">Choose this campaign, then add qualified targets from the network panel.</div>}
              </div>
            </article>
          ))}
        </section>

        <aside className="self-start lg:sticky lg:top-24">
          <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#667000]">CuratorFit Network</p><h2 className="mt-2 text-xl font-black">Add campaign targets</h2></div><span className="grid h-10 w-10 place-items-center rounded-full bg-[#c8ff00]"><Target size={18} /></span></div>
            <p className="mt-3 text-sm leading-6 text-slate-500">{selectedCampaign ? `Adding to ${selectedCampaign.name}.` : 'Select a campaign first.'}</p>
            <div className="relative mt-4"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className="input pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search channel, owner or genre" /></div>

            <div className="mt-4 max-h-[620px] space-y-2 overflow-y-auto pr-1">
              {filteredTargets.map((target) => (
                <div className="rounded-2xl border border-slate-200 p-3" key={target.slug}>
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-black">{target.name}</p><p className="mt-1 text-[11px] text-slate-500">{target.channelLabel} · trust {target.trustScore}</p></div><ShieldCheck className="h-4 w-4 shrink-0 text-[#667000]" /></div>
                  {target.genres.length ? <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-slate-400">{target.genres.slice(0, 4).join(' · ')}</p> : null}
                  <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-3 py-2 text-xs font-bold text-white disabled:opacity-40" disabled={!selectedCampaign || Boolean(savingKey)} onClick={() => attachTarget(target)}>{savingKey === target.slug ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Add target</button>
                </div>
              ))}
            </div>
            <Link className="mt-4 flex items-center justify-between rounded-2xl bg-[#e8ff91] p-4 text-sm font-black" href="/targets">Explore full network <ArrowUpRight size={15} /></Link>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[['Qualified', ShieldCheck], ['Relationships', Users2], ['Proof', FileCheck2]].map(([label, Icon]) => {
              const Component = Icon as typeof ShieldCheck;
              return <div className="rounded-2xl border border-black/10 bg-white p-3 text-center" key={String(label)}><Component className="mx-auto h-4 w-4" /><p className="mt-2 text-[10px] font-bold text-slate-500">{String(label)}</p></div>;
            })}
          </div>
        </aside>
      </div>
    </main>
  );
}
