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
      setMessage('Supabase browser keys are not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.');
      return;
    }
    setLoading(true);
    const supabase = getSupabaseBrowser();
    const redirectTo = `${window.location.origin}/dashboard`;
    const { error } = await supabase!.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        data: { role, display_name: displayName }
      }
    });
    setLoading(false);
    setMessage(error ? error.message : 'Magic link sent. Check your email, then return to the dashboard.');
  }

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-black">Log in or create account</h2>
      <p className="mt-2 text-sm text-slate-600">Use your email. Supabase will send a secure magic link.</p>
      <form className="mt-6 grid gap-4" onSubmit={sendMagicLink}>
        <div>
          <label className="label" htmlFor="displayName">Display name</label>
          <input className="input" id="displayName" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Dan / Curator name" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" />
        </div>
        <div>
          <label className="label" htmlFor="role">Default role</label>
          <select className="input" id="role" value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="artist">Artist</option>
            <option value="curator">Curator</option>
          </select>
        </div>
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send magic link'}</button>
      </form>
      {message ? <p className="mt-4 rounded-2xl bg-panel p-4 text-sm text-slate-700">{message}</p> : null}
    </div>
  );
}
