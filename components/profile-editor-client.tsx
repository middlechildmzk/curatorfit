'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowser, hasSupabaseBrowserConfig } from '@/lib/supabase-browser';

type UserState = { id: string; email: string | null } | null;

export function ProfileEditorClient() {
  const [user, setUser] = useState<UserState>(null);
  const [message, setMessage] = useState('Loading account...');
  const [artistName, setArtistName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('artist');
  const [spotifyArtistUrl, setSpotifyArtistUrl] = useState('');
  const [soundcloudUrl, setSoundcloudUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [primaryGenres, setPrimaryGenres] = useState('');
  const [bio, setBio] = useState('');
  const [acceptedGenres, setAcceptedGenres] = useState('');
  const [hardNos, setHardNos] = useState('');

  const ready = hasSupabaseBrowserConfig();

  useEffect(() => {
    async function load() {
      if (!ready) {
        setMessage('Supabase is not configured. This editor is available after adding env vars.');
        return;
      }
      const supabase = getSupabaseBrowser()!;
      const { data } = await supabase.auth.getUser();
      const currentUser = data.user;
      if (!currentUser) {
        setMessage('Log in to edit your artist and curator profile.');
        return;
      }
      setUser({ id: currentUser.id, email: currentUser.email || null });
      const fallbackName = currentUser.user_metadata?.display_name || currentUser.email?.split('@')[0] || '';
      setDisplayName(String(fallbackName));
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUser.id).maybeSingle();
      if (profile) {
        setDisplayName(profile.display_name || fallbackName);
        setRole(profile.role || 'artist');
      }
      const { data: artist } = await supabase.from('artist_profiles').select('*').eq('user_id', currentUser.id).maybeSingle();
      if (artist) {
        setArtistName(artist.artist_name || '');
        setSpotifyArtistUrl(artist.spotify_artist_url || '');
        setSoundcloudUrl(artist.soundcloud_url || '');
        setYoutubeUrl(artist.youtube_url || '');
        setTiktokUrl(artist.tiktok_url || '');
        setWebsiteUrl(artist.website_url || '');
        setPrimaryGenres((artist.primary_genres || []).join(', '));
      }
      const { data: curator } = await supabase.from('curator_profiles').select('*').eq('user_id', currentUser.id).maybeSingle();
      if (curator) {
        setBio(curator.bio || '');
        setAcceptedGenres((curator.accepted_genres || []).join(', '));
        setHardNos((curator.hard_nos || []).join(', '));
      }
      setMessage('');
    }
    load();
  }, [ready]);

  async function saveProfile(formData: FormData) {
    setMessage('Saving...');
    const res = await fetch('/api/profile/details', { method: 'POST', body: formData });
    const json = await res.json();
    setMessage(json.ok ? 'Profile saved.' : `Error: ${json.error || 'Could not save profile.'}`);
  }

  if (!ready) return <div className="card p-6"><h2 className="text-xl font-black">Profile editor</h2><p className="mt-2 text-sm text-slate-600">Add Supabase env vars to enable real profiles.</p></div>;
  if (!user) return <div className="card p-6"><h2 className="text-xl font-black">Profile editor</h2><p className="mt-2 text-sm text-slate-600">{message}</p></div>;

  return (
    <form action={saveProfile} className="card p-6">
      <input type="hidden" name="userId" value={user.id} />
      <input type="hidden" name="email" value={user.email || ''} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-brand">V1.6 profile editor</p>
          <h2 className="mt-2 text-2xl font-black">Artist + curator profile</h2>
          <p className="mt-2 text-sm text-slate-600">Save the account details that campaigns, claims, and future paid-review workflows will use.</p>
        </div>
        <button className="btn-primary" type="submit">Save profile</button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div><label className="label">Display name</label><input className="input" name="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></div>
        <div><label className="label">Primary role</label><select className="input" name="role" value={role} onChange={(e) => setRole(e.target.value)}><option value="artist">Artist</option><option value="curator">Curator</option><option value="admin">Admin</option></select></div>
        <div><label className="label">Artist name</label><input className="input" name="artistName" value={artistName} onChange={(e) => setArtistName(e.target.value)} placeholder="Middle Child" /></div>
        <div><label className="label">Primary genres</label><input className="input" name="primaryGenres" value={primaryGenres} onChange={(e) => setPrimaryGenres(e.target.value)} placeholder="future bass, melodic bass, cinematic" /></div>
        <div><label className="label">Spotify artist URL</label><input className="input" name="spotifyArtistUrl" value={spotifyArtistUrl} onChange={(e) => setSpotifyArtistUrl(e.target.value)} /></div>
        <div><label className="label">SoundCloud URL</label><input className="input" name="soundcloudUrl" value={soundcloudUrl} onChange={(e) => setSoundcloudUrl(e.target.value)} /></div>
        <div><label className="label">YouTube URL</label><input className="input" name="youtubeUrl" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} /></div>
        <div><label className="label">TikTok URL</label><input className="input" name="tiktokUrl" value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} /></div>
        <div className="md:col-span-2"><label className="label">Website</label><input className="input" name="websiteUrl" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} /></div>
      </div>

      <div className="mt-8 rounded-3xl border border-line bg-panel p-5">
        <h3 className="font-black">Curator settings</h3>
        <p className="mt-1 text-sm text-slate-600">Optional now, but important for profile claims and founding curator reviews.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div><label className="label">Accepted genres</label><input className="input" name="acceptedGenres" value={acceptedGenres} onChange={(e) => setAcceptedGenres(e.target.value)} placeholder="lo-fi, indie pop, melodic bass" /></div>
          <div><label className="label">Hard no's</label><input className="input" name="hardNos" value={hardNos} onChange={(e) => setHardNos(e.target.value)} placeholder="no explicit, no AI vocals, no rap" /></div>
          <div className="md:col-span-2"><label className="label">Curator bio / rules</label><textarea className="input min-h-28" name="bio" value={bio} onChange={(e) => setBio(e.target.value)} /></div>
        </div>
      </div>
      {message ? <p className="mt-4 text-sm font-semibold text-slate-600">{message}</p> : null}
    </form>
  );
}
