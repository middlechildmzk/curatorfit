'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSupabaseBrowser, hasSupabaseBrowserConfig } from '@/lib/supabase-browser';

type SavedTarget = {
  id: string;
  created_at: string;
  promotion_targets?: {
    slug: string;
    name: string;
    type: string;
    status: string;
    trust_score: number;
    risk_level: string;
    genres: string[] | null;
    fit_notes: string | null;
    risk_notes: string | null;
    url: string | null;
  } | null;
};

async function getToken() {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

export function SavedTargetsClient() {
  const [rows, setRows] = useState<SavedTarget[]>([]);
  const [message, setMessage] = useState('Loading saved targets...');
  const ready = hasSupabaseBrowserConfig();

  async function load() {
    if (!ready) {
      setMessage('Supabase is not configured yet. Saved targets will appear here after setup.');
      return;
    }
    const token = await getToken();
    if (!token) {
      setMessage('Log in to view your saved targets.');
      return;
    }
    const res = await fetch('/api/saved-targets', { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    if (!json.ok) {
      setMessage(json.error || 'Could not load saved targets.');
      return;
    }
    setRows(json.savedTargets || []);
    setMessage('');
  }

  async function remove(savedTargetId: string) {
    const token = await getToken();
    if (!token) return setMessage('Log in before removing targets.');
    const res = await fetch('/api/saved-targets', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ savedTargetId })
    });
    const json = await res.json();
    setMessage(json.ok ? 'Target removed.' : json.error || 'Could not remove target.');
    if (json.ok) await load();
  }

  useEffect(() => { load(); }, [ready]);

  return (
    <section className="space-y-5">
      {message ? <p className="rounded-2xl bg-panel p-4 text-sm font-semibold text-slate-600">{message}</p> : null}
      {rows.length ? rows.map((row) => {
        const target = row.promotion_targets;
        return (
          <div key={row.id} className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-brand">{target?.type?.replaceAll('_', ' ') || 'Promotion target'}</p>
                <h2 className="mt-1 text-2xl font-black">{target?.name || 'Saved target'}</h2>
                <p className="mt-1 text-sm text-slate-500">{target?.status || 'seed'} · Trust {target?.trust_score || 0}/100 · Risk {target?.risk_level || 'review'}</p>
              </div>
              <div className="flex gap-2">
                {target?.slug ? <Link href={`/targets/${target.slug}`} className="btn-secondary py-2">View</Link> : null}
                <button className="btn-secondary py-2" onClick={() => remove(row.id)}>Remove</button>
              </div>
            </div>
            {target?.fit_notes ? <p className="mt-4 text-sm leading-6 text-slate-600">{target.fit_notes}</p> : null}
            {target?.risk_notes ? <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">{target.risk_notes}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">{(target?.genres || []).slice(0, 6).map((genre) => <span className="pill" key={genre}>{genre}</span>)}</div>
          </div>
        );
      }) : !message ? <p className="rounded-2xl bg-panel p-4 text-sm text-slate-600">No saved targets yet. Browse the target directory and save the best-fit opportunities.</p> : null}
    </section>
  );
}
