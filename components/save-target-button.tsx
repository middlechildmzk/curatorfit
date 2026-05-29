'use client';

import { useState } from 'react';
import { Bookmark, CheckCircle2 } from 'lucide-react';
import { getSupabaseBrowser, hasSupabaseBrowserConfig } from '@/lib/supabase-browser';

export function SaveTargetButton({ targetSlug, className = 'btn-secondary mt-3 w-full' }: { targetSlug: string; className?: string }) {
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);

  async function saveTarget() {
    if (!hasSupabaseBrowserConfig()) {
      setMessage('Supabase is not configured yet. This target is saved in demo mode only.');
      setSaved(true);
      return;
    }
    const supabase = getSupabaseBrowser();
    const { data } = await supabase!.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setMessage('Log in to save targets to your workspace.');
      return;
    }
    const res = await fetch('/api/saved-targets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetSlug })
    });
    const json = await res.json();
    setSaved(Boolean(json.ok));
    setMessage(json.ok ? 'Saved to your target list.' : json.error || 'Could not save target.');
  }

  return (
    <div>
      <button type="button" onClick={saveTarget} className={className}>
        {saved ? <CheckCircle2 size={16} /> : <Bookmark size={16} />} {saved ? 'Saved' : 'Save target'}
      </button>
      {message ? <p className="mt-2 text-xs font-semibold text-slate-500">{message}</p> : null}
    </div>
  );
}
