'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, BriefcaseBusiness, ExternalLink, Inbox, Loader2, RadioTower, Save, ShieldCheck } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

const professionalOptions = [
  ['playlist_curator', 'Playlist curator'], ['youtube_channel', 'YouTube channel'], ['blogger_journalist', 'Blog / journalist'],
  ['creator_influencer', 'Creator / influencer'], ['dj', 'DJ'], ['radio', 'Radio'], ['podcast_newsletter', 'Podcast / newsletter'],
  ['label_manager', 'Label / manager'], ['sync_professional', 'Sync professional']
] as const;

type ProfessionalProfile = {
  id: string;
  public_slug: string;
  display_name: string;
  professional_types: string[];
  bio: string | null;
  location: string | null;
  website: string | null;
  review_mode: string;
  review_fee_cents: number;
  currency: string;
  turnaround_days: number | null;
  capacity_status: string;
  verification_status: string;
  is_public: boolean;
};

type Claim = {
  id: string;
  status: string;
  verification_method: string;
  evidence_url: string | null;
  created_at: string;
  property: { id: string; name: string; property_type: string | null; platform: string | null; platform_url: string | null; verification_status: string | null } | null;
};

export function ProfessionalWorkspace() {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [metrics, setMetrics] = useState({ submissions: 0, pending: 0, properties: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [propertySlug, setPropertySlug] = useState('');
  const [claimMethod, setClaimMethod] = useState('social_profile');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');

  async function accessToken() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }

  async function load() {
    setLoading(true);
    const token = await accessToken();
    const response = await fetch('/api/professional', { headers: token ? { Authorization: `Bearer ${token}` } : undefined, cache: 'no-store' });
    const json = await response.json().catch(() => ({ ok: false, error: 'Could not load the professional workspace.' }));
    if (json.ok) {
      if (json.needsOnboarding) setMessage('Create a professional or hybrid account first.');
      setProfile(json.profile || null);
      setClaims(json.claims || []);
      setMetrics(json.metrics || { submissions: 0, pending: 0, properties: 0 });
    } else setMessage(json.error || 'Could not load the professional workspace.');
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function patch<K extends keyof ProfessionalProfile>(key: K, value: ProfessionalProfile[K]) {
    setProfile((current) => current ? { ...current, [key]: value } : current);
  }

  function toggleType(value: string) {
    if (!profile) return;
    patch('professional_types', profile.professional_types.includes(value) ? profile.professional_types.filter((item) => item !== value) : [...profile.professional_types, value]);
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage('');
    const token = await accessToken();
    const response = await fetch('/api/professional', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({
        displayName: profile.display_name,
        professionalTypes: profile.professional_types,
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        reviewMode: profile.review_mode,
        reviewFeeDollars: profile.review_fee_cents / 100,
        turnaroundDays: profile.turnaround_days || 14,
        capacityStatus: profile.capacity_status,
        isPublic: profile.is_public
      })
    });
    const json = await response.json().catch(() => ({ ok: false, error: 'Could not save the profile.' }));
    setMessage(json.ok ? 'Professional profile saved.' : json.error || 'Could not save the profile.');
    if (json.ok) setProfile(json.profile);
    setSaving(false);
  }

  async function submitClaim(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    const token = await accessToken();
    const response = await fetch('/api/professional/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ propertySlug, verificationMethod: claimMethod, evidenceUrl, evidenceNotes })
    });
    const json = await response.json().catch(() => ({ ok: false, error: 'Could not submit the claim.' }));
    setMessage(json.ok ? json.message || 'Claim submitted.' : json.error || 'Could not submit the claim.');
    if (json.ok) {
      setPropertySlug(''); setEvidenceUrl(''); setEvidenceNotes('');
      await load();
    }
    setSaving(false);
  }

  if (loading) return <main className="min-h-screen bg-[#f4f5f1] p-16 text-center"><Loader2 className="mx-auto animate-spin" /><p className="mt-3 text-sm text-slate-500">Loading professional workspace...</p></main>;

  if (!profile) return <main className="min-h-screen bg-[#f4f5f1] px-5 py-16"><div className="mx-auto max-w-xl rounded-3xl border border-black/10 bg-white p-10 text-center"><BriefcaseBusiness className="mx-auto text-slate-300" size={34} /><h1 className="mt-5 text-3xl font-black">Create your professional profile</h1><p className="mt-3 text-sm leading-6 text-slate-500">Choose Professional or Both during onboarding to manage channels and receive campaign submissions.</p><Link className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-black text-[#c8ff00]" href="/onboarding">Open onboarding</Link></div></main>;

  return (
    <main className="min-h-screen bg-[#f4f5f1] pb-20">
      <section className="border-b border-black/10 bg-[#0b0b0b] text-white">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8ff00]">Professional workspace</p><h1 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">Manage your channels and review queue.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-white/55">Control availability, claim properties, receive AI-matched music and preserve feedback and deliverable proof.</p></div>
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:min-w-[420px]">{[[metrics.pending,'Pending'],[metrics.submissions,'Submissions'],[metrics.properties,'Verified properties']].map(([value,label]) => <div className="bg-[#111] p-4" key={label}><p className="text-2xl font-black text-[#c8ff00]">{value}</p><p className="mt-1 text-xs text-white/40">{label}</p></div>)}</div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-7 px-5 py-8 lg:grid-cols-[1fr_390px]">
        <form className="rounded-3xl border border-black/10 bg-white p-6 md:p-8" onSubmit={saveProfile}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#667000]">Public identity</p><h2 className="mt-2 text-2xl font-black">{profile.display_name}</h2><p className="mt-2 text-sm text-slate-500">Verification: {profile.verification_status.replaceAll('_',' ')}</p></div><Link className="btn-secondary gap-2" href="/inbox"><Inbox size={15} /> Open inbox</Link></div>
          <div className="mt-7 grid gap-5">
            <div><label className="label" htmlFor="professionalName">Display name</label><input className="input" id="professionalName" value={profile.display_name} onChange={(event) => patch('display_name', event.target.value)} /></div>
            <fieldset><legend className="label">Professional types</legend><div className="grid gap-2 sm:grid-cols-3">{professionalOptions.map(([value,label]) => <label className={`cursor-pointer rounded-xl border px-3 py-2.5 text-xs font-bold ${profile.professional_types.includes(value) ? 'border-black bg-black text-white' : 'border-slate-200 text-slate-600'}`} key={value}><input className="sr-only" type="checkbox" checked={profile.professional_types.includes(value)} onChange={() => toggleType(value)} />{label}</label>)}</div></fieldset>
            <div className="grid gap-4 sm:grid-cols-2"><div><label className="label" htmlFor="professionalLocation">Location</label><input className="input" id="professionalLocation" value={profile.location || ''} onChange={(event) => patch('location', event.target.value)} /></div><div><label className="label" htmlFor="professionalWebsite">Website</label><input className="input" id="professionalWebsite" type="url" value={profile.website || ''} onChange={(event) => patch('website', event.target.value)} /></div></div>
            <div><label className="label" htmlFor="professionalBio">Bio and submission context</label><textarea className="input min-h-28" id="professionalBio" value={profile.bio || ''} onChange={(event) => patch('bio', event.target.value)} /></div>
            <div className="grid gap-4 sm:grid-cols-3"><div><label className="label" htmlFor="reviewModel">Review model</label><select className="input" id="reviewModel" value={profile.review_mode} onChange={(event) => patch('review_mode', event.target.value)}><option value="editorial_only">Editorial only</option><option value="free_feedback">Free feedback</option><option value="paid_review">Paid review</option><option value="sponsored_services">Sponsored services</option></select></div><div><label className="label" htmlFor="reviewFee">Review fee</label><input className="input" id="reviewFee" min="0" type="number" value={profile.review_fee_cents / 100} onChange={(event) => patch('review_fee_cents', Math.round(Number(event.target.value || 0) * 100))} /></div><div><label className="label" htmlFor="turnaround">Turnaround days</label><input className="input" id="turnaround" min="1" max="90" type="number" value={profile.turnaround_days || 14} onChange={(event) => patch('turnaround_days', Number(event.target.value || 14))} /></div></div>
            <div className="grid gap-4 sm:grid-cols-2"><div><label className="label" htmlFor="capacity">Capacity</label><select className="input" id="capacity" value={profile.capacity_status} onChange={(event) => patch('capacity_status', event.target.value)}><option value="open">Open</option><option value="limited">Limited</option><option value="paused">Paused</option></select></div><label className="flex items-center gap-3 rounded-2xl bg-[#f7f8f4] p-4 text-sm font-bold"><input type="checkbox" checked={profile.is_public} onChange={(event) => patch('is_public', event.target.checked)} />Publish profile in CuratorFit</label></div>
          </div>
          <button className="mt-7 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-black text-[#c8ff00] disabled:opacity-40" disabled={saving} type="submit">{saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save profile</button>
        </form>

        <aside className="space-y-5 self-start lg:sticky lg:top-24">
          <form className="rounded-3xl border border-black/10 bg-white p-5" onSubmit={submitClaim}>
            <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#667000]">Property ownership</p><h2 className="mt-2 text-xl font-black">Claim a channel</h2></div><span className="grid h-10 w-10 place-items-center rounded-full bg-[#c8ff00]"><ShieldCheck size={18} /></span></div>
            <p className="mt-3 text-sm leading-6 text-slate-500">Use the `property-...` slug shown on a CuratorFit target page and provide public ownership evidence.</p>
            <div className="mt-5 grid gap-4"><div><label className="label" htmlFor="propertySlug">Property slug</label><input className="input" id="propertySlug" value={propertySlug} onChange={(event) => setPropertySlug(event.target.value)} placeholder="property-uuid" required /></div><div><label className="label" htmlFor="claimMethod">Verification method</label><select className="input" id="claimMethod" value={claimMethod} onChange={(event) => setClaimMethod(event.target.value)}><option value="social_profile">Official social profile</option><option value="domain_email">Domain email</option><option value="website_token">Website token</option><option value="oauth">OAuth connection</option><option value="manual">Manual review</option></select></div><div><label className="label" htmlFor="evidenceUrl">Evidence URL</label><input className="input" id="evidenceUrl" type="url" value={evidenceUrl} onChange={(event) => setEvidenceUrl(event.target.value)} placeholder="https://..." /></div><div><label className="label" htmlFor="evidenceNotes">Evidence notes</label><textarea className="input min-h-20" id="evidenceNotes" value={evidenceNotes} onChange={(event) => setEvidenceNotes(event.target.value)} /></div></div>
            <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-black text-white disabled:opacity-40" disabled={saving} type="submit"><BadgeCheck size={15} /> Submit claim</button>
            <Link className="mt-3 flex items-center justify-between rounded-2xl bg-[#e8ff91] p-4 text-sm font-black" href="/targets">Browse properties <ExternalLink size={14} /></Link>
          </form>

          <div className="rounded-3xl border border-black/10 bg-white p-5"><div className="flex items-center gap-3"><RadioTower size={18} /><h2 className="font-black">Property claims</h2></div><div className="mt-4 space-y-3">{claims.length ? claims.map((claim) => <div className="rounded-2xl border border-slate-200 p-4" key={claim.id}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black">{claim.property?.name || 'Property'}</p><p className="mt-1 text-xs text-slate-500">{claim.property?.property_type || claim.property?.platform || 'Music property'}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${claim.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : claim.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{claim.status}</span></div></div>) : <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">No property claims yet.</p>}</div></div>
          {message ? <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm font-semibold text-slate-700">{message}</div> : null}
        </aside>
      </div>
    </main>
  );
}
