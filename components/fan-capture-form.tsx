'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';

export function FanCaptureForm({ smartLinkId, policyVersion }: { smartLinkId: string; policyVersion: string }) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const query = new URLSearchParams(window.location.search);
    const response = await fetch('/api/fans/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        smartLinkId,
        email,
        firstName,
        emailConsent: consent,
        policyVersion,
        sourceUrl: window.location.href,
        utmSource: query.get('utm_source') || '',
        utmMedium: query.get('utm_medium') || '',
        utmCampaign: query.get('utm_campaign') || ''
      })
    });
    const json = await response.json().catch(() => ({ ok: false, error: 'Could not save your signup.' }));
    if (json.ok) setComplete(true);
    else setError(json.error || 'Could not save your signup.');
    setSaving(false);
  }

  if (complete) {
    return (
      <div className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-4 text-left">
        <CheckCircle2 className="h-5 w-5 text-emerald-300" />
        <p className="mt-3 font-bold">Your signup was recorded.</p>
        <p className="mt-1 text-sm leading-6 text-white/60">We saved your request for updates at {email}. The address remains unverified until an email-confirmation workflow succeeds.</p>
      </div>
    );
  }

  return (
    <form className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-left" onSubmit={submit}>
      <div className="flex items-center gap-2 text-sm font-bold"><Mail className="h-4 w-4 text-[#c8ff00]" /> Get the release update</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#c8ff00]/60" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="First name" />
        <input className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#c8ff00]/60" value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email address" required />
      </div>
      <label className="mt-3 flex items-start gap-3 text-xs leading-5 text-white/50">
        <input className="mt-1" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required />
        <span>I agree to receive release and artist updates by email. My consent record includes this policy version and can be withdrawn at any time.</span>
      </label>
      <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#c8ff00] px-5 py-3 text-sm font-black text-black disabled:opacity-50" disabled={saving || !consent} type="submit">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Notify me
      </button>
      {error ? <p className="mt-3 text-xs font-semibold text-red-300">{error}</p> : null}
    </form>
  );
}
