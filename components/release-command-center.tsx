'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  ExternalLink,
  FileCheck2,
  Link2,
  Loader2,
  Megaphone,
  Music2,
  Plus,
  ShieldCheck,
  Sparkles,
  Users2
} from 'lucide-react';
import { type ArtistOSRelease, humanize, releaseStages } from '@/lib/artistos';
import { getSupabaseBrowser, hasSupabaseBrowserConfig } from '@/lib/supabase-browser';

const emptyForm = {
  artistName: 'Middle Child',
  title: '',
  releaseDate: '',
  isrc: '',
  upc: '',
  sourceUrl: '',
  releaseType: 'single',
  campaignGoal: 'multi_channel_release'
};

export function ReleaseCommandCenter() {
  const [releases, setReleases] = useState<ArtistOSRelease[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const configured = hasSupabaseBrowserConfig();

  async function getToken() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }

  async function loadReleases() {
    setLoading(true);
    const token = await getToken();
    setLoggedIn(Boolean(token));
    const response = await fetch('/api/releases', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: 'no-store'
    });
    const json = await response.json().catch(() => ({ ok: false, error: 'Could not read release data.' }));
    if (json.ok) setReleases(json.releases || []);
    else setMessage(json.error || 'Could not load releases.');
    setLoading(false);
  }

  useEffect(() => {
    loadReleases();
  }, []);

  async function createRelease(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('Creating the release graph...');
    const token = await getToken();
    const response = await fetch('/api/releases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(form)
    });
    const json = await response.json().catch(() => ({ ok: false, error: 'Could not create release.' }));
    if (json.ok && json.release) {
      setReleases((current) => [json.release, ...current.filter((release) => release.id !== json.release.id)]);
      setForm((current) => ({ ...emptyForm, artistName: current.artistName }));
      setMessage(json.mode === 'demo' ? 'Demo release created. Connect Supabase to persist it.' : 'Release, link and campaign created.');
    } else {
      setMessage(json.error || 'Could not create release.');
    }
    setSaving(false);
  }

  const metrics = useMemo(() => {
    const links = releases.filter((release) => release.smartLink?.isActive).length;
    const campaigns = releases.filter((release) => release.campaign).length;
    const evidence = releases.reduce((total, release) => total + release.evidenceCount, 0);
    return { releases: releases.length, links, campaigns, evidence };
  }, [releases]);

  const metricCards = [
    { label: 'Releases', value: metrics.releases, icon: Music2 },
    { label: 'Live links', value: metrics.links, icon: Link2 },
    { label: 'Campaigns', value: metrics.campaigns, icon: Megaphone },
    { label: 'Proof records', value: metrics.evidence, icon: FileCheck2 }
  ];

  return (
    <main className="min-h-screen bg-[#f4f5f1] pb-20">
      <section className="border-b border-black/10 bg-[#0b0b0b] text-white">
        <div className="mx-auto max-w-7xl px-5 py-10 md:py-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#c8ff00]/30 bg-[#c8ff00]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#c8ff00]">
                <Sparkles size={13} /> Release Command Center
              </div>
              <h1 className="text-4xl font-black tracking-[-0.045em] md:text-6xl">
                One release. Every channel. Verifiable work.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/60 md:text-lg">
                ArtistOS connects canonical release data, fan links, CuratorFit campaigns, proof records and consent-backed audience growth in one operating workspace.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4 lg:min-w-[520px]">
              {metricCards.map(({ label, value, icon: Icon }) => (
                <div className="bg-[#111] p-4" key={label}>
                  <Icon className="h-4 w-4 text-[#c8ff00]" />
                  <p className="mt-5 text-2xl font-black">{value}</p>
                  <p className="mt-1 text-xs font-medium text-white/45">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-2 md:grid-cols-5">
            {releaseStages.map((stage, index) => {
              const icons = [Music2, Link2, Megaphone, ShieldCheck, Users2];
              const Icon = icons[index];
              return (
                <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3" key={stage.key}>
                  <div className="flex items-center justify-between">
                    <Icon className="h-4 w-4 text-[#c8ff00]" />
                    <span className="font-mono text-[10px] text-white/25">0{index + 1}</span>
                  </div>
                  <p className="mt-4 text-sm font-bold">{stage.label}</p>
                  <p className="mt-1 text-xs leading-5 text-white/40">{stage.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-7 px-5 py-8 lg:grid-cols-[390px_1fr]">
        <aside className="self-start lg:sticky lg:top-24">
          <form onSubmit={createRelease} className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#667000]">New release graph</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">Start with the song</h2>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#c8ff00]"><Plus size={18} /></span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">This creates the release, public fan link and campaign together so data cannot fragment later.</p>

            <div className="mt-6 grid gap-4">
              <div>
                <label className="label" htmlFor="artistName">Artist name</label>
                <input id="artistName" className="input" value={form.artistName} onChange={(event) => setForm({ ...form, artistName: event.target.value })} required />
              </div>
              <div>
                <label className="label" htmlFor="title">Release title</label>
                <input id="title" className="input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Your next single" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="releaseType">Type</label>
                  <select id="releaseType" className="input" value={form.releaseType} onChange={(event) => setForm({ ...form, releaseType: event.target.value })}>
                    <option value="single">Single</option>
                    <option value="ep">EP</option>
                    <option value="album">Album</option>
                    <option value="remix">Remix</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="releaseDate">Release date</label>
                  <input id="releaseDate" className="input" type="date" value={form.releaseDate} onChange={(event) => setForm({ ...form, releaseDate: event.target.value })} />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="sourceUrl">Song or private-listening URL</label>
                <input id="sourceUrl" className="input" type="url" value={form.sourceUrl} onChange={(event) => setForm({ ...form, sourceUrl: event.target.value })} placeholder="https://open.spotify.com/track/..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="isrc">ISRC</label>
                  <input id="isrc" className="input" value={form.isrc} onChange={(event) => setForm({ ...form, isrc: event.target.value })} placeholder="Optional" />
                </div>
                <div>
                  <label className="label" htmlFor="upc">UPC</label>
                  <input id="upc" className="input" value={form.upc} onChange={(event) => setForm({ ...form, upc: event.target.value })} placeholder="Optional" />
                </div>
              </div>
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#252525] disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={saving || (configured && !loggedIn)}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-[#c8ff00]" />}
                Build release workspace
              </button>
              {configured && !loggedIn ? <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Log in before creating a persistent release. <Link className="font-bold underline" href="/login">Open login</Link></p> : null}
              {message ? <p className="rounded-xl border border-black/10 bg-[#f7f8f4] p-3 text-sm font-medium text-slate-700">{message}</p> : null}
            </div>
          </form>

          <div className="mt-5 rounded-3xl border border-black/10 bg-[#e8ff91] p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em]">Policy boundary</p>
            <p className="mt-3 text-sm font-bold leading-6">ArtistOS verifies delivery and feedback. It never sells guaranteed Spotify placement, streams or algorithmic outcomes.</p>
          </div>
        </aside>

        <section className="space-y-5">
          <div className="flex flex-col gap-3 rounded-3xl border border-black/10 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Active catalog</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">Release workspaces</h2>
              <p className="mt-1 text-sm text-slate-500">Each workspace owns its link, campaign, evidence and fan records.</p>
            </div>
            <Link href="/targets" className="btn-secondary gap-2">Open CuratorFit Network <ArrowUpRight size={15} /></Link>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-black/10 bg-white p-12 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin" />
              <p className="mt-3 text-sm text-slate-500">Loading release graph...</p>
            </div>
          ) : releases.length ? releases.map((release) => (
            <article className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.04)]" key={release.id}>
              <div className="grid gap-0 md:grid-cols-[190px_1fr]">
                <div className="flex min-h-48 flex-col justify-between bg-gradient-to-br from-[#181818] via-[#292929] to-[#0b0b0b] p-5 text-white">
                  <div className="flex items-center justify-between">
                    <Music2 className="h-5 w-5 text-[#c8ff00]" />
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/60">{humanize(release.status)}</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white/45">{release.artistName}</p>
                    <h3 className="mt-2 text-2xl font-black leading-tight tracking-tight">{release.title}</h3>
                  </div>
                </div>
                <div className="p-5 md:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="grid gap-2 text-sm text-slate-500 sm:grid-cols-2 sm:gap-x-8">
                      <p className="flex items-center gap-2"><CalendarDays size={15} /> {release.releaseDate || 'Date not set'}</p>
                      <p className="flex items-center gap-2"><ShieldCheck size={15} /> {release.evidenceCount} proof records</p>
                      <p>ISRC: <span className="font-semibold text-slate-800">{release.isrc || 'Pending'}</span></p>
                      <p>UPC: <span className="font-semibold text-slate-800">{release.upc || 'Pending'}</span></p>
                    </div>
                    {release.smartLink ? (
                      <Link className="inline-flex items-center gap-2 rounded-full bg-[#c8ff00] px-4 py-2.5 text-sm font-black text-black" href={`/l/${release.smartLink.slug}`} target="_blank">
                        Open fan link <ExternalLink size={14} />
                      </Link>
                    ) : null}
                  </div>

                  <div className="mt-6 grid gap-2 sm:grid-cols-5">
                    {releaseStages.map((stage) => {
                      const complete = stage.key === 'release' || (stage.key === 'link' && release.smartLink) || (stage.key === 'campaign' && release.campaign) || (stage.key === 'proof' && release.evidenceCount > 0);
                      return (
                        <div className={`rounded-xl border p-3 ${complete ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`} key={stage.key}>
                          {complete ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <CircleDashed className="h-4 w-4 text-slate-400" />}
                          <p className="mt-3 text-xs font-bold">{stage.label}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5 text-xs">
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-600">Campaign: {release.campaign ? humanize(release.campaign.status) : 'Not created'}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-600">Link: {release.smartLink ? humanize(release.smartLink.mode) : 'Not created'}</span>
                    <Link className="ml-auto inline-flex items-center gap-1 font-bold text-slate-700" href="/campaigns">Manage campaign <ArrowUpRight size={13} /></Link>
                  </div>
                </div>
              </div>
            </article>
          )) : (
            <div className="rounded-3xl border border-dashed border-black/20 bg-white p-12 text-center">
              <Music2 className="mx-auto h-8 w-8 text-slate-300" />
              <h3 className="mt-4 text-xl font-black">Create the first release workspace</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">The command center will connect its smart link, CuratorFit campaign, proof ledger and fan audience automatically.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
