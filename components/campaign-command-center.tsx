'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  FileCheck2,
  Loader2,
  Megaphone,
  MessageSquareText,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
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

type Submission = {
  id: string;
  campaign_target_id: string;
  status: string;
  submission_mode: string;
  match_score: number;
  match_reasons: string[];
  response_due_at: string | null;
  feedback: { decision: string; feedback_text: string; rating: number | null; promotion_intent: boolean } | null;
};

const targetStatuses = ['queued', 'pitched', 'replied', 'accepted', 'declined', 'placed'] as const;

export function CampaignCommandCenter({ directoryTargets }: { directoryTargets: DirectoryTarget[] }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState('');
  const [message, setMessage] = useState('');
  const [pitchNotes, setPitchNotes] = useState<Record<string, string>>({});

  async function token() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }

  async function load() {
    setLoading(true);
    const accessToken = await token();
    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
    const [campaignResponse, submissionResponse] = await Promise.all([
      fetch('/api/campaigns', { headers, cache: 'no-store' }),
      fetch('/api/submissions?scope=artist', { headers, cache: 'no-store' })
    ]);
    const campaignJson = await campaignResponse.json().catch(() => ({ ok: false, error: 'Could not load campaigns.' }));
    const submissionJson = await submissionResponse.json().catch(() => ({ ok: false, submissions: [] }));
    if (campaignJson.ok) {
      const next = campaignJson.campaigns || [];
      setCampaigns(next);
      setSelectedCampaignId((current) => current || next[0]?.id || '');
    } else setMessage(campaignJson.error || 'Could not load campaigns.');
    setSubmissions(submissionJson.ok ? submissionJson.submissions || [] : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const selectedCampaign = campaigns.find((campaign) => campaign.id === selectedCampaignId) || campaigns[0] || null;
  const selectedNames = useMemo(() => new Set(selectedCampaign?.targets.map((target) => target.name.toLowerCase()) || []), [selectedCampaign]);
  const submissionsByTarget = useMemo(() => new Map(submissions.map((submission) => [submission.campaign_target_id, submission])), [submissions]);
  const filteredTargets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return directoryTargets
      .filter((target) => !selectedNames.has(target.name.toLowerCase()))
      .filter((target) => !normalized || `${target.name} ${target.channelLabel} ${target.owner} ${target.genres.join(' ')}`.toLowerCase().includes(normalized))
      .slice(0, 30);
  }, [directoryTargets, query, selectedNames]);

  const totals = useMemo(() => ({
    targets: campaigns.reduce((sum, campaign) => sum + campaign.targets.length, 0),
    evidence: campaigns.reduce((sum, campaign) => sum + campaign.evidenceCount, 0),
    sent: submissions.length
  }), [campaigns, submissions]);

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

  async function sendSubmission(target: CampaignTarget) {
    setSavingKey(`${target.id}:send`);
    setMessage('');
    const accessToken = await token();
    const response = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify({ action: 'send', campaignTargetId: target.id, artistMessage: pitchNotes[target.id] || '', responseDays: 14 })
    });
    const json = await response.json().catch(() => ({ ok: false, error: 'Could not send the submission.' }));
    setMessage(json.ok ? (json.submission.submission_mode === 'marketplace' ? `${target.name} received the submission in ArtistOS.` : `${target.name} is prepared for approved outreach.`) : json.error || 'Could not send the submission.');
    if (json.ok) await load();
    setSavingKey('');
  }

  return (
    <main className="min-h-screen bg-[#f4f5f1] pb-20">
      <section className="border-b border-black/10 bg-[#0b0b0b] text-white">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8ff00]">ArtistOS Campaigns</p><h1 className="mt-4 text-4xl font-black tracking-[-0.045em] md:text-6xl">Match, approve and route every pitch.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-white/55">Build a target list from CuratorFit, review the match context, then send through the ArtistOS marketplace or an artist-approved outreach route.</p></div>
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:min-w-[420px]">{[[campaigns.length,'Campaigns'],[totals.targets,'Targets'],[totals.sent,'Sent']].map(([value,label]) => <div className="bg-[#111] p-4" key={String(label)}><p className="text-2xl font-black text-[#c8ff00]">{value}</p><p className="mt-1 text-xs text-white/40">{label}</p></div>)}</div>
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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#667000]">{campaign.release?.artistName || 'ArtistOS release'}</p><h2 className="mt-2 text-2xl font-black">{campaign.name}</h2><p className="mt-2 text-sm text-slate-500">{campaign.release?.title || 'Unlinked release'} · {humanize(campaign.status)}</p></div><div className="flex gap-2"><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{campaign.targets.length} targets</span><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{campaign.evidenceCount} proof</span></div></div>
                {campaign.goals ? <p className="mt-5 rounded-2xl bg-[#f7f8f4] p-4 text-sm leading-6 text-slate-600">{campaign.goals}</p> : null}
              </button>

              <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                {campaign.targets.length ? campaign.targets.map((target) => {
                  const submission = submissionsByTarget.get(target.id);
                  return (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4" key={target.id}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-black">{target.name}</p><p className="mt-1 text-xs text-slate-500">{humanize(target.channel)} · {humanize(target.verificationStatus)} · evidence {target.evidenceStrength}/5</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${submission ? 'bg-[#e8ff91] text-[#526000]' : target.status === 'declined' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{submission ? humanize(submission.status) : humanize(target.status)}</span></div>
                      {submission ? <div className="mt-4 rounded-2xl bg-[#f7f8f4] p-4"><div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1 rounded-full bg-black px-3 py-1 text-xs font-black text-[#c8ff00]"><Sparkles size={12} /> Match {submission.match_score}%</span><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">{humanize(submission.submission_mode)}</span>{submission.response_due_at ? <span className="text-xs text-slate-400">Due {new Date(submission.response_due_at).toLocaleDateString()}</span> : null}</div><div className="mt-3 flex flex-wrap gap-2">{(submission.match_reasons || []).slice(0, 3).map((reason) => <span className="rounded-full bg-white px-2.5 py-1 text-[11px] text-slate-500" key={reason}>{reason}</span>)}</div>{submission.feedback ? <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"><strong>{humanize(submission.feedback.decision)}</strong><p className="mt-1 leading-6 text-emerald-800/75">{submission.feedback.feedback_text}</p></div> : null}</div> : <div className="mt-4 grid gap-3"><label className="sr-only" htmlFor={`pitch-${target.id}`}>Personal note for {target.name}</label><textarea className="input min-h-20" id={`pitch-${target.id}`} value={pitchNotes[target.id] || ''} onChange={(event) => setPitchNotes((current) => ({ ...current, [target.id]: event.target.value }))} placeholder="Add a short, specific note explaining why this release fits." /><button className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-black text-white disabled:opacity-40" disabled={Boolean(savingKey)} onClick={() => sendSubmission(target)}>{savingKey === `${target.id}:send` ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />} Route submission</button></div>}
                      <div className="mt-3 flex flex-wrap gap-1.5">{targetStatuses.map((status) => <button className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${status === target.status ? 'border-black bg-black text-white' : 'border-slate-200 bg-white text-slate-500'}`} disabled={Boolean(savingKey)} key={status} onClick={() => updateTarget(target.id, status)}>{savingKey === `${target.id}:${status}` ? 'Saving…' : humanize(status)}</button>)}</div>
                    </div>
                  );
                }) : <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">Choose this campaign, then add qualified targets from the network panel.</div>}
              </div>
            </article>
          ))}
        </section>

        <aside className="self-start lg:sticky lg:top-24">
          <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#667000]">CuratorFit Network</p><h2 className="mt-2 text-xl font-black">Add campaign targets</h2></div><span className="grid h-10 w-10 place-items-center rounded-full bg-[#c8ff00]"><Target size={18} /></span></div>
            <p className="mt-3 text-sm leading-6 text-slate-500">{selectedCampaign ? `Adding to ${selectedCampaign.name}.` : 'Select a campaign first.'}</p>
            <div className="relative mt-4"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className="input pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search channel, owner or genre" /></div>
            <div className="mt-4 max-h-[620px] space-y-2 overflow-y-auto pr-1">{filteredTargets.map((target) => <div className="rounded-2xl border border-slate-200 p-3" key={target.slug}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-black">{target.name}</p><p className="mt-1 text-[11px] text-slate-500">{target.channelLabel} · trust {target.trustScore}</p></div><ShieldCheck className="h-4 w-4 shrink-0 text-[#667000]" /></div>{target.genres.length ? <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-slate-400">{target.genres.slice(0, 4).join(' · ')}</p> : null}<button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-3 py-2 text-xs font-bold text-white disabled:opacity-40" disabled={!selectedCampaign || Boolean(savingKey)} onClick={() => attachTarget(target)}>{savingKey === target.slug ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Add target</button></div>)}</div>
            <Link className="mt-4 flex items-center justify-between rounded-2xl bg-[#e8ff91] p-4 text-sm font-black" href="/targets">Explore full network <ArrowUpRight size={15} /></Link>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">{[['Match', Sparkles],['Relationships', Users2],['Feedback', MessageSquareText]].map(([label,Icon]) => { const Component = Icon as typeof ShieldCheck; return <div className="rounded-2xl border border-black/10 bg-white p-3 text-center" key={String(label)}><Component className="mx-auto h-4 w-4" /><p className="mt-2 text-[10px] font-bold text-slate-500">{String(label)}</p></div>; })}</div>
          <Link className="mt-4 flex items-center justify-between rounded-2xl border border-black/10 bg-white p-4 text-sm font-black" href="/proof">Open Proof ledger <FileCheck2 size={15} /></Link>
        </aside>
      </div>
    </main>
  );
}
