'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSupabaseBrowser, hasSupabaseBrowserConfig } from '@/lib/supabase-browser';

export function AuthStatus() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!hasSupabaseBrowserConfig()) return;
    const supabase = getSupabaseBrowser();
    supabase!.auth.getUser().then(({ data }) => setEmail(data.user?.email || null));
    const { data: listener } = supabase!.auth.onAuthStateChange((_event, session) => setEmail(session?.user?.email || null));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = getSupabaseBrowser();
    await supabase?.auth.signOut();
    setEmail(null);
    window.location.href = '/';
  }

  if (!hasSupabaseBrowserConfig()) {
    return <Link href="/login" className="btn-primary hidden sm:inline-flex">Set up auth</Link>;
  }

  return email ? (
    <div className="hidden items-center gap-3 sm:flex">
      <Link href="/dashboard" className="text-sm font-bold text-slate-700">Dashboard</Link>
      <button className="btn-secondary py-2" onClick={signOut}>Sign out</button>
    </div>
  ) : (
    <Link href="/login" className="btn-primary hidden sm:inline-flex">Log in</Link>
  );
}
