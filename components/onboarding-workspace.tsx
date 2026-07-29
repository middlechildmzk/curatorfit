'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BadgeCheck, BriefcaseBusiness, CircleDollarSign, Loader2, Music2, RadioTower, Sparkles, UsersRound } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

const professionalOptions = [
  ['playlist_curator', 'Playlist curator'],
  ['youtube_channel', 'YouTube channel'],
  ['blogger_journalist', 'Blog / journalist'],
  ['creator_influencer', 'Creator / influencer'],
  ['dj', 'DJ'],
  ['radio', 'Radio'],
  ['podcast_newsletter', 'Podcast / newsletter'],
  ['label_manager', 'Label / manager'],
  ['sync_professional', 'Sync professional']
] as const;

type Role = 'artist' | 'professional' | 'hybrid';

export function OnboardingWorkspace() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('artist');
  const [displayName, setDisplayName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [types, setTypes] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [reviewMode, setReviewMode] = useState('editorial_only');
  const [reviewFee, setReviewFee] = useState('0');
  const [turnaroundDays, setTurnaroundDays] = useState('14');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowser();
      const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const token = data.session?.access_token;
      if (!token) return;
      const response = await fetch('/api/onboarding', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
      const json = await response.json().catch(() => null);
      if (!json?.ok) return;
      if (json.profile?.primary_role) setRole(json.profile.primary_role);
      if (json.profile?.display_name) setDisplayName(json.profile.display_name);
      if (json.artists?.[0]?.name) setArtistName(json.artists[0].name);
      if (json.professionalProfile) {
        setTypes(json.professionalProfile.professional_types || []);
        setBio(json.professionalProfile.bio || json.profile?.bio || '');
        setLocation(json.professionalProfile.location || json.profile?.location || '');
        setWebsite(json.professionalProfile.website || '');
        setReviewMode(json.professionalProfile.review_mode || 'editorial_only');
        setReviewFee(String((json.professionalProfile.review_fee_cents || 0) / 100));
        setTurnaroundDays(String(json.professionalProfile.turnaround_days || 14));
        setIsPublic(Boolean(json.professionalProfile.is_public));
      }
    }
    load();
  }, []);

  function toggleType(value: string) {
    setTypes((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const supabase = getSupabaseBrowser();
    const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
    const token = data.session?.access_token;
    if (!token) {
      setMessage('Log in first so ArtistOS can create your secure workspace.');
      setLoading(false);
      return;
    }

    const response = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        primaryRole: role,
        displayName,
        artistName,
        professionalTypes: types,
        bio,
        location,
        website,
        reviewMode,
        reviewFeeDollars: Number(reviewFee || 0),
        turnaroundDays: Number(turnaroundDays || 14),
        isPublic
      })
    });
    const json = await response.json().catch(() => ({ ok: false, error: 'Could not finish onboarding.' }));
    if (!json.ok) {
      setMessage(json.error || 'Could not finish onboarding.');
      setLoading(false);
      return;
    }
    router.push(json.redirect || '/dashboard');
    router.refresh();
  }

  const professionalEnabled = role !== 'artist';
  const artistEnabled = role !== 'professional';

  return (
    <main className="min-h-screen bg-[#f4f5f1] pb-20">
      <section className="border-b border-black/10 bg-[#0b0b0b] text-white">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8ff00]">ArtistOS account setup</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.05em] md:text-6xl">Choose how you participate in the music economy.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/55">Artists build releases and campaigns. Professionals review music and manage channels. Hybrid accounts can do both without maintaining separate identities.</p>
        </div>
      </section>

      <form className="mx-auto max-w-6xl space-y-7 px-5 py-8" onSubmit={submit}>
        <section className="grid gap-4 md:grid-cols-3">
          {[
            { value: 'artist' as Role, title: 'Artist', body: 'Release music, fund campaigns, own fan data and track results.', Icon: Music2 },
            { value: 'professional' as Role, title: 'Music professional', body: 'Review submissions, manage properties and deliver verified work.', Icon: BriefcaseBusiness },
            { value: 'hybrid' as Role, title: 'Both', body: 'Operate as an artist and a curator, creator, DJ, label or media professional.', Icon: UsersRound }
          ].map(({ value, title, body, Icon }) => (
            <button aria-pressed={role === value} className={`rounded-3xl border p-6 text-left transition ${role === value ? 'border-black bg-black text-white shadow-xl' : 'border-black/10 bg-white hover:border-black/30'}`} key={value} onClick={() => setRole(value)} type="button">
              <Icon className={role === value ? 'text-[#c8ff00]' : 'text-slate-500'} size={22} />
              <h2 className="mt-6 text-xl font-black">{title}</h2>
              <p className={`mt-2 text-sm leading-6 ${role === value ? 'text-white/55' : 'text-slate-500'}`}>{body}</p>
            </button>
          ))}
        </section>

        <section className="grid gap-7 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#e8ff91]"><Sparkles size={18} /></span><div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#667000]">Identity</p><h2 className="mt-1 text-2xl font-black">Your ArtistOS profile</h2></div></div>
            <div className="mt-6 grid gap-4">
              <div><label className="label" htmlFor="displayName">Display name</label><input className="input" id="displayName" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required /></div>
              {artistEnabled ? <div><label className="label" htmlFor="artistName">Artist or label name</label><input className="input" id="artistName" value={artistName} onChange={(event) => setArtistName(event.target.value)} required={artistEnabled} placeholder="Middle Child" /></div> : null}
              <div><label className="label" htmlFor="location">Location</label><input className="input" id="location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Minneapolis, Minnesota" /></div>
              <div><label className="label" htmlFor="bio">Short bio</label><textarea className="input min-h-28" id="bio" value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Describe your music, channel, publication or professional work." /></div>
            </div>
          </div>

          <div className={`rounded-3xl border p-6 md:p-8 ${professionalEnabled ? 'border-black/10 bg-white' : 'border-dashed border-black/15 bg-white/40'}`}>
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#e8ff91]"><RadioTower size={18} /></span><div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#667000]">Professional profile</p><h2 className="mt-1 text-2xl font-black">How you review and promote</h2></div></div>
            {!professionalEnabled ? <p className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-500">Choose Music professional or Both to create a review inbox and claim channels.</p> : (
              <div className="mt-6 grid gap-5">
                <fieldset><legend className="label">Professional types</legend><div className="grid grid-cols-2 gap-2">{professionalOptions.map(([value, label]) => <label className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold ${types.includes(value) ? 'border-black bg-black text-white' : 'border-slate-200 bg-white text-slate-600'}`} key={value}><input className="sr-only" type="checkbox" checked={types.includes(value)} onChange={() => toggleType(value)} />{label}</label>)}</div></fieldset>
                <div><label className="label" htmlFor="website">Website</label><input className="input" id="website" type="url" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://yourchannel.com" /></div>
                <div><label className="label" htmlFor="reviewMode">Review model</label><select className="input" id="reviewMode" value={reviewMode} onChange={(event) => setReviewMode(event.target.value)}><option value="editorial_only">Editorial consideration only</option><option value="free_feedback">Free feedback</option><option value="paid_review">Paid review and feedback</option><option value="sponsored_services">Sponsored services</option></select></div>
                <div className="grid grid-cols-2 gap-3"><div><label className="label" htmlFor="reviewFee">Review fee</label><div className="relative"><CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="input pl-9" id="reviewFee" min="0" step="1" type="number" value={reviewFee} onChange={(event) => setReviewFee(event.target.value)} /></div></div><div><label className="label" htmlFor="turnaround">Turnaround days</label><input className="input" id="turnaround" min="1" max="90" type="number" value={turnaroundDays} onChange={(event) => setTurnaroundDays(event.target.value)} /></div></div>
                <label className="flex items-start gap-3 rounded-2xl bg-[#f7f8f4] p-4 text-sm leading-6"><input className="mt-1" type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} /><span><strong className="block text-slate-900">Publish my professional profile</strong><span className="text-slate-500">Artists can discover it, but your property claims remain pending until verified.</span></span></label>
              </div>
            )}
          </div>
        </section>

        {message ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{message}</div> : null}
        <div className="flex flex-col gap-4 rounded-3xl bg-[#c8ff00] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3"><BadgeCheck className="mt-1" size={20} /><div><p className="font-black">No placement promises</p><p className="mt-1 text-sm font-semibold opacity-65">Professional payments cover legitimate review or disclosed services, never guaranteed Spotify placement or streams.</p></div></div>
          <button className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-black px-6 py-3.5 text-sm font-black text-[#c8ff00] disabled:opacity-40" disabled={loading} type="submit">{loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} Create my workspace</button>
        </div>
      </form>
    </main>
  );
}
