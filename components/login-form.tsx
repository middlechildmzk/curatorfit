'use client';

import { useState } from 'react';
import { getSupabaseBrowser, hasSupabaseBrowserConfig } from '@/lib/supabase-browser';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('artist');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    if (!hasSupabaseBrowserConfig()) {
      setMessage('Supabase browser keys are not configured in this environment yet.');
      return;
    }
    setLoading(true);
    const supabase = getSupabaseBrowser();
    const redirectTo = `${window.location.origin}/onboarding`;
    const { error } = await supabase!.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        data: { role, display_name: displayName }
      }
    });
    setLoading(false);
    setMessage(error ? error.message : 'Magic link sent. Open it to finish your ArtistOS account setup.');
  }

  return (
    <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
      <h2 className="text-2xl font-black">Log in or create account</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Use your email. ArtistOS sends a secure passwordless link.</p>
      <form className="mt-6 grid gap-4" onSubmit={sendMagicLink}>
        <div><label className="label" htmlFor="displayName">Display name</label><input className="input" id="displayName" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Artist, curator or company name" /></div>
        <div><label className="label" htmlFor="email">Email</label><input className="input" id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" /></div>
        <div><label className="label" htmlFor="role">How will you use ArtistOS?</label><select className="input" id="role" value={role} onChange={(event) => setRole(event.target.value)}><option value="artist">Artist, manager or label</option><option value="professional">Curator, creator, media or music professional</option><option value="hybrid">Both artist and professional</option></select></div>
        <button className="rounded-full bg-black px-5 py-3 text-sm font-black text-[#c8ff00] disabled:opacity-40" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send secure login link'}</button>
      </form>
      {message ? <p className="mt-4 rounded-2xl bg-[#f7f8f4] p-4 text-sm text-slate-700">{message}</p> : null}
    </div>
  );
}
