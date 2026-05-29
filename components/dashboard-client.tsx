'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowser, hasSupabaseBrowserConfig } from '@/lib/supabase-browser';
import { dashboardCards, roleLabels } from '@/lib/auth-copy';

type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: string | null;
};

type CampaignTarget = {
  id: string;
  pitch_status: string;
  notes: string | null;
  created_at: string;
  promotion_targets?: { name: string; slug: string; type: string } | null;
};

export function DashboardClient() {
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [targets, setTargets] = useState<CampaignTarget[]>([]);
  const [message, setMessage] = useState('Loading account...');

  const supabaseReady = hasSupabaseBrowserConfig();

  useEffect(() => {
    async function load() {
      if (!supabaseReady) {
        setMessage('Supabase is not configured yet. Add your URL and anon key to .env.local to enable real accounts.');
        return;
      }
      const supabase = getSupabaseBrowser()!;
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        setMessage('You are not logged in yet.');
        return;
      }
      setEmail(user.email || null);
      const role = (user.user_metadata?.role as string) || 'artist';
      const displayName = (user.user_metadata?.display_name as string) || user.email?.split('@')[0] || 'CuratorFit user';
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, email: user.email, role, displayName })
      });
      const { data: profileRow } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      setProfile(profileRow || { id: user.id, email: user.email || null, display_name: displayName, role });
      const { data: savedRows } = await supabase
        .from('campaign_targets')
        .select('id,pitch_status,notes,created_at,promotion_targets(name,slug,type)')
        .order('created_at', { ascending: false })
        .limit(8);
      setTargets(((savedRows || []) as unknown) as CampaignTarget[]);
      setMessage('');
    }
    load();
  }, [supabaseReady]);

  const role = useMemo(() => profile?.role || 'artist', [profile]);

  if (!supabaseReady) {
    return (
      <div className="card p-8">
        <h2 className="text-2xl font-black">Local preview mode</h2>
        <p className="mt-3 text-slate-600">The public site works without Supabase. To enable login, dashboards, and persistence, create a Supabase project and add the keys from <code>.env.example</code>.</p>
        <Link className="btn-primary mt-6" href="/artist">Use demo artist tracker</Link>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="card p-8">
        <h2 className="text-2xl font-black">Sign in required</h2>
        <p className="mt-3 text-slate-600">Log in to save campaigns, claim profiles, and manage curator workflows.</p>
        <Link className="btn-primary mt-6" href="/login">Log in with magic link</Link>
        {message ? <p className="mt-4 text-sm text-slate-500">{message}</p> : null}
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-5">
        <div className="card p-6">
          <p className="text-sm font-bold uppercase tracking-widest text-brand">Signed in</p>
          <h2 className="mt-2 text-2xl font-black">{profile?.display_name || email}</h2>
          <p className="mt-1 text-sm text-slate-500">{email}</p>
          <span className="pill mt-4">{roleLabels[role] || role}</span>
        </div>
        <div className="card p-6">
          <h3 className="font-black">Workspace links</h3>
          <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">
            <Link href="/artist">Artist tracker</Link>
            <Link href="/campaigns">Campaign planner</Link>
            <Link href="/saved">Saved targets</Link>
            <Link href="/targets">Target directory</Link>
            <Link href="/profile">Edit profile</Link>
            <Link href="/curator/dashboard">Curator dashboard</Link>
            <Link href="/submit-target">Suggest target</Link>
            <Link href="/claim">Claim profile</Link>
            <Link href="/admin">Admin ops</Link>
          </div>
        </div>
      </aside>
      <section className="space-y-5">
        <div className="card p-6">
          <p className="text-sm font-bold uppercase tracking-widest text-brand">V1.6 artist workspace</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Your music pitch workspace</h1>
          <p className="mt-4 max-w-3xl text-slate-600">This dashboard is the bridge between the public directory and the future paid-review marketplace. It now supports user-owned campaigns, saved target shortlists, profile editing, target review workflows, and curator claim operations under one account.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {dashboardCards.map((card) => <div className="card p-5" key={card.title}><h3 className="font-black">{card.title}</h3><p className="mt-2 text-sm text-slate-600">{card.text}</p></div>)}
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between gap-4">
            <div><h2 className="text-xl font-black">Recent campaign target activity</h2><p className="mt-1 text-sm text-slate-500">Pulled from Supabase when configured.</p></div>
            <Link className="btn-secondary" href="/artist">Add targets</Link>
          </div>
          <div className="mt-5 space-y-3">
            {targets.length ? targets.map((target) => (
              <div className="rounded-2xl border border-line bg-panel p-4" key={target.id}>
                <p className="font-bold">{target.promotion_targets?.name || 'Saved target'}</p>
                <p className="text-sm text-slate-500">{target.promotion_targets?.type || 'channel'} · {target.pitch_status}</p>
                {target.notes ? <p className="mt-2 text-sm text-slate-600">{target.notes}</p> : null}
              </div>
            )) : <p className="rounded-2xl bg-panel p-4 text-sm text-slate-600">No campaign targets saved yet. Use the artist tracker to save a playlist or channel.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
