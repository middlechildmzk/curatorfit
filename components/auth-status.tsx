'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSupabaseBrowser, hasSupabaseBrowserConfig } from '@/lib/supabase-browser';

export function AuthStatus() {
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [onboarded, setOnboarded] = useState(false);

  async function hydrate(accessToken?: string | null) {
    if (!accessToken) {
      setEmail(null); setRole(null); setOnboarded(false);
      return;
    }
    const response = await fetch('/api/onboarding', { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' });
    const json = await response.json().catch(() => null);
    if (json?.ok) {
      setRole(json.profile?.primary_role || 'artist');
      setOnboarded(Boolean(json.profile?.onboarding_completed));
    }
  }

  useEffect(() => {
    if (!hasSupabaseBrowserConfig()) return;
    const supabase = getSupabaseBrowser();
    supabase!.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email || null);
      hydrate(data.session?.access_token);
    });
    const { data: listener } = supabase!.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email || null);
      hydrate(session?.access_token);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = getSupabaseBrowser();
    await supabase?.auth.signOut();
    setEmail(null); setRole(null); setOnboarded(false);
    window.location.href = '/';
  }

  if (!hasSupabaseBrowserConfig()) return <Link href="/login" className="btn-primary hidden sm:inline-flex">Set up auth</Link>;
  if (!email) return <Link href="/login" className="btn-primary hidden sm:inline-flex">Log in</Link>;
  if (!onboarded) return <Link href="/onboarding" className="rounded-full bg-[#c8ff00] px-4 py-2.5 text-sm font-black text-black">Finish setup</Link>;

  return (
    <div className="hidden items-center gap-3 sm:flex">
      {role === 'professional' ? <Link href="/inbox" className="text-sm font-bold text-slate-700">Inbox</Link> : <Link href="/dashboard" className="text-sm font-bold text-slate-700">Dashboard</Link>}
      {role === 'hybrid' ? <Link href="/professional" className="text-sm font-bold text-slate-500">Professional</Link> : null}
      <button className="btn-secondary py-2" onClick={signOut}>Sign out</button>
    </div>
  );
}
