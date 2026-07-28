'use client';

import { useState } from 'react';
import { FileCheck2, Loader2 } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export function ProofAttachmentForm({ releaseId, onSaved }: { releaseId: string; onSaved: () => void }) {
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    const supabase = getSupabaseBrowser();
    const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
    const token = data.session?.access_token;
    const response = await fetch('/api/evidence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        releaseId,
        evidenceUrl: url,
        verificationLevel: 'L5',
        method: 'live_url'
      })
    });
    const json = await response.json().catch(() => ({ ok: false, error: 'Could not record proof.' }));
    if (json.ok) {
      setUrl('');
      setMessage(json.mode === 'demo' ? 'Demo proof accepted.' : 'Evidence appended for independent review.');
      onSaved();
    } else {
      setMessage(json.error || 'Could not record proof.');
    }
    setSaving(false);
  }

  return (
    <form className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3" onSubmit={submit}>
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500"><FileCheck2 className="h-4 w-4" /> Append proof</div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400" type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Live article, video, playlist or post URL" required />
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50" disabled={saving} type="submit">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Record
        </button>
      </div>
      {message ? <p className="mt-2 text-xs font-semibold text-slate-600">{message}</p> : <p className="mt-2 text-[11px] leading-5 text-slate-400">Live URLs enter at L5 independently reviewed/pending. Only API or authorized checks can become L1–L4.</p>}
    </form>
  );
}
