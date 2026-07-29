'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, BadgeCheck, CircleAlert, ExternalLink, Link2, Loader2, Music2, PlugZap, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

type Platform = {
  id: string;
  slug: string;
  name: string;
  category: string;
  oauthConfigured: boolean;
  connectionType: string;
  metrics: string[];
  status: string;
  oauthConnection: { id: string; account_email: string | null; last_success_at: string | null; last_error: string | null } | null;
  profiles: Array<{ id: string; artist_name: string; profile_url: string | null; connection_state: string; freshness_status: string; last_synced_at: string | null }>;
};

const priority = ['spotify','youtube','instagram','tiktok','soundcloud','apple-music','bandcamp','amazon-music','deezer','tidal'];

function humanize(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function ConnectionsWorkspace() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('spotify');
  const [artistName, setArtistName] = useState('Middle Child');
  const [profileUrl, setProfileUrl] = useState('');
  const [externalArtistId, setExternalArtistId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    const response = await fetch('/api/connections', { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined, cache: 'no-store' });
    const json = await response.json().catch(() => ({ ok: false, error: 'Could not load platform connections.' }));
    if (json.ok) setPlatforms(json.platforms || []);
    else setMessage(json.error || 'Could not load platform connections.');
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const sorted = useMemo(() => [...platforms].sort((a, b) => {
    const aIndex = priority.indexOf(a.slug);
    const bIndex = priority.indexOf(b.slug);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex) || a.name.localeCompare(b.name);
  }), [platforms]);
  const selected = platforms.find((platform) => platform.slug === selectedSlug) || sorted[0] || null;
  const connected = platforms.filter((platform) => ['authorized','profile_linked'].includes(platform.status)).length;
  const authorized = platforms.filter((platform) => platform.status === 'authorized').length;

  async function saveManual(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    setMessage('');
    const accessToken = await token();
    const response = await fetch('/api/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify({ action: 'manual_profile', platformSlug: selected.slug, artistName, profileUrl, externalArtistId })
    });
    const json = await response.json().catch(() => ({ ok: false, error: 'Could not save the platform profile.' }));
    setMessage(json.ok ? `${selected.name} profile linked as user-supplied data.` : json.error || 'Could not save the platform profile.');
    if (json.ok) { setProfileUrl(''); setExternalArtistId(''); await load(); }
    setSaving(false);
  }

  async function disconnect(profileId: string) {
    setSaving(true);
    const accessToken = await token();
    const response = await fetch('/api/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify({ action: 'disconnect_manual', profileId })
    });
    const json = await response.json().catch(() => ({ ok: false, error: 'Could not disconnect profile.' }));
    setMessage(json.ok ? 'Profile disconnected.' : json.error || 'Could not disconnect profile.');
    if (json.ok) await load();
    setSaving(false);
  }

  return (
    <main className="min-h-screen bg-[#f4f5f1] pb-20">
      <section className="border-b border-black/10 bg-[#0b0b0b] text-white">
        <div className="mx-auto max-w-7xl px-5 py-12"><div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8ff00]">Connections center</p><h1 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">Bring release progress into one view.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-white/55">Connect authorized artist accounts where APIs permit it. Use verified profile links where they do not. Every metric remains labeled by source and authorization level.</p></div><div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:min-w-[420px]">{[[connected,'Connected'],[authorized,'Authorized'],[platforms.length,'Platforms']].map(([value,label]) => <div className="bg-[#111] p-4" key={label}><p className="text-2xl font-black text-[#c8ff00]">{value}</p><p className="mt-1 text-xs text-white/40">{label}</p></div>)}</div></div></div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-7 px-5 py-8 lg:grid-cols-[1fr_400px]">
        <section className="rounded-3xl border border-black/10 bg-white p-5 md:p-7">
          <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#667000]">Provider catalog</p><h2 className="mt-2 text-2xl font-black">Music and social accounts</h2></div><button aria-label="Refresh connections" className="grid h-10 w-10 place-items-center rounded-full bg-slate-100" onClick={load}><RefreshCw size={16} /></button></div>
          {loading ? <div className="p-16 text-center"><Loader2 className="mx-auto animate-spin" /></div> : <div className="mt-6 grid gap-3 md:grid-cols-2">{sorted.map((platform) => <button className={`rounded-2xl border p-4 text-left transition ${selected?.slug === platform.slug ? 'border-black bg-black text-white' : 'border-slate-200 bg-white hover:border-black/30'}`} key={platform.id} onClick={() => setSelectedSlug(platform.slug)}><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl ${selected?.slug === platform.slug ? 'bg-[#c8ff00] text-black' : 'bg-slate-100 text-slate-600'}`}><Music2 size={17} /></span><div><p className="font-black">{platform.name}</p><p className={`mt-1 text-xs ${selected?.slug === platform.slug ? 'text-white/45' : 'text-slate-400'}`}>{platform.category}</p></div></div>{platform.status === 'authorized' ? <BadgeCheck className="text-emerald-500" size={18} /> : platform.status === 'profile_linked' ? <Link2 className="text-[#7c8c00]" size={18} /> : <CircleAlert className={selected?.slug === platform.slug ? 'text-white/30' : 'text-slate-300'} size={18} />}</div><div className="mt-4 flex items-center justify-between"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${selected?.slug === platform.slug ? 'bg-white/10 text-white/60' : platform.status === 'authorized' ? 'bg-emerald-50 text-emerald-700' : platform.status === 'profile_linked' ? 'bg-[#e8ff91] text-[#526000]' : 'bg-slate-100 text-slate-500'}`}>{humanize(platform.status)}</span><span className={`text-[10px] ${selected?.slug === platform.slug ? 'text-white/35' : 'text-slate-400'}`}>{platform.profiles.length} profile{platform.profiles.length === 1 ? '' : 's'}</span></div></button>)}</div>}
        </section>

        <aside className="space-y-5 self-start lg:sticky lg:top-24">
          {selected ? <div className="rounded-3xl border border-black/10 bg-white p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#667000]">{selected.category}</p><h2 className="mt-2 text-2xl font-black">{selected.name}</h2></div><span className="grid h-11 w-11 place-items-center rounded-full bg-[#c8ff00]"><PlugZap size={18} /></span></div><p className="mt-3 text-sm leading-6 text-slate-500">{selected.connectionType}</p><div className="mt-5 rounded-2xl bg-[#f7f8f4] p-4"><p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Available evidence</p><div className="mt-3 flex flex-wrap gap-2">{selected.metrics.map((metric) => <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500" key={metric}>{metric}</span>)}</div></div>{selected.oauthConnection ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-center gap-2 font-black text-emerald-800"><ShieldCheck size={16} /> Authorized account</div><p className="mt-2 text-xs text-emerald-800/65">{selected.oauthConnection.account_email || 'Connected account'} · Last success {selected.oauthConnection.last_success_at ? new Date(selected.oauthConnection.last_success_at).toLocaleDateString() : 'pending first sync'}</p></div> : <div className={`mt-4 rounded-2xl p-4 text-sm ${selected.oauthConfigured ? 'bg-blue-50 text-blue-800' : 'bg-amber-50 text-amber-800'}`}><strong className="block">{selected.oauthConfigured ? 'OAuth credentials configured' : 'OAuth setup still required'}</strong><span className="mt-1 block leading-6 opacity-70">{selected.oauthConfigured ? 'The provider authorization route can be activated next.' : 'ArtistOS can store a verified profile URL now. Authorized analytics require provider app approval and credentials.'}</span></div>}

            <form className="mt-5 grid gap-4 border-t border-slate-100 pt-5" onSubmit={saveManual}><div><label className="label" htmlFor="connectionArtist">Artist name</label><input className="input" id="connectionArtist" value={artistName} onChange={(event) => setArtistName(event.target.value)} required /></div><div><label className="label" htmlFor="connectionUrl">Official profile URL</label><input className="input" id="connectionUrl" type="url" value={profileUrl} onChange={(event) => setProfileUrl(event.target.value)} placeholder="https://..." required /></div><div><label className="label" htmlFor="externalId">External artist ID</label><input className="input" id="externalId" value={externalArtistId} onChange={(event) => setExternalArtistId(event.target.value)} placeholder="Optional" /></div><button className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-black text-white disabled:opacity-40" disabled={saving} type="submit">{saving ? <Loader2 className="animate-spin" size={15} /> : <Link2 size={15} />} Link official profile</button></form>

            {selected.profiles.length ? <div className="mt-5 space-y-2 border-t border-slate-100 pt-5"><p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Linked profiles</p>{selected.profiles.map((profile) => <div className="rounded-2xl border border-slate-200 p-3" key={profile.id}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-black">{profile.artist_name}</p><p className="mt-1 text-[11px] text-slate-400">{humanize(profile.freshness_status)}</p></div><button aria-label={`Disconnect ${profile.artist_name}`} className="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-red-600" disabled={saving} onClick={() => disconnect(profile.id)}><Trash2 size={13} /></button></div>{profile.profile_url ? <a className="mt-3 inline-flex items-center gap-1 text-xs font-bold underline" href={profile.profile_url} target="_blank" rel="noreferrer">Open profile <ExternalLink size={12} /></a> : null}</div>)}</div> : null}</div> : null}

          <div className="rounded-3xl bg-[#c8ff00] p-5"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5" size={19} /><div><p className="font-black">Provenance before dashboards</p><p className="mt-2 text-sm font-semibold leading-6 opacity-65">Profile links are self-reported. Authorized API metrics will be labeled separately and never blended with estimates.</p></div></div><a className="mt-4 inline-flex items-center gap-2 text-sm font-black underline" href="/proof">View Proof taxonomy <ArrowUpRight size={14} /></a></div>
          {message ? <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm font-semibold text-slate-700">{message}</div> : null}
        </aside>
      </div>
    </main>
  );
}
