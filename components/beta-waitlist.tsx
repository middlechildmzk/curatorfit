'use client';

import { useState } from 'react';

export function BetaWaitlist({ source = 'unknown' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-3xl border border-brand2/30 bg-brand2/10 p-5 text-sm leading-6 text-slate-700">
        You are on the beta interest list locally. Wire this component to ConvertKit, Beehiiv, Resend, Supabase, or Tally when you are ready to collect real emails.
      </div>
    );
  }

  return (
    <form
      className="card flex flex-col gap-3 p-4 shadow-none sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        if (email.trim()) setSubmitted(true);
      }}
    >
      <input type="hidden" name="source" value={source} />
      <input
        className="min-h-[44px] flex-1 rounded-2xl border border-line px-4 text-sm outline-none focus:border-brand"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <button className="btn-primary" type="submit">Join beta</button>
    </form>
  );
}
