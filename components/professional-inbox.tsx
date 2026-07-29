'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, Clock3, FileText, Inbox, Loader2, MessageSquareText, Music2, PlayCircle, Send, ShieldCheck, Sparkles, Star, XCircle } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

const statusFilters = ['all','pending_review','in_review','feedback_submitted','accepted','promotion_committed','declined'] as const;

type Submission = {
  id: string;
  status: string;
  submission_mode: string;
  match_score: number;
  match_reasons: string[];
  artist_message: string | null;
  response_due_at: string | null;
  submitted_at: string | null;
  release: { id: string; title: string; artistName: string; artistGenres: string[]; release_date: string | null; spotify_url: string | null; status: string } | null;
  property: { id: string; name: string; property_type: string | null; platform: string | null; platform_url: string | null; verification_status: string | null } | null;
  campaign: { id: string; name: string; goals: string | null } | null;
  feedback: { decision: string; rating: number | null; feedback_text: string; promotion_intent: boolean; proposed_deliverable: Record<string, string>; disclosure_required: boolean } | null;
  messages: Array<{ id: string; sender_user_id: string; body: string; created_at: string }>;
};

function humanize(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function ProfessionalInbox() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<(typeof statusFilters)[number]>('all');
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState('');
  const [decision, setDecision] = useState('feedback_only');
  const [rating, setRating] = useState('4');
  const [feedbackText, setFeedbackText] = useState('');
  const [promotionIntent, setPromotionIntent] = useState(false);
  const [deliverableType, setDeliverableType] = useState('');
  const [deliverableDetails, setDeliverableDetails] = useState('');
  const [disclosureRequired, setDisclosureRequired] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  async function token() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }

  async function load() {
    setLoading(true);
    const accessToken = await token();
    const response = await fetch('/api/submissions?scope=professional', { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined, cache: 'no-store' });
    const json = await response.json().catch(() => ({ ok: false, error: 'Could not load submissions.' }));
    if (json.ok) {
      const next = json.submissions || [];
      setSubmissions(next);
      setSelectedId((current) => current || next[0]?.id || '');
    } else setMessage(json.error || 'Could not load submissions.');
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => filter === 'all' ? submissions : submissions.filter((submission) => submission.status === filter), [filter, submissions]);
  const selected = submissions.find((submission) => submission.id === selectedId) || filtered[0] || null;
  const pendingCount = submissions.filter((submission) => ['pending_review','in_review'].includes(submission.status)).length;

  async function action(body: Record<string, unknown>, success: string) {
    setSaving(String(body.action || 'saving'));
    setMessage('');
    const accessToken = await token();
    const response = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify(body)
    });
    const json = await response.json().catch(() => ({ ok: false, error: 'Could not update the submission.' }));
    setMessage(json.ok ? success : json.error || 'Could not update the submission.');
    if (json.ok) await load();
    setSaving('');
    return json.ok;
  }

  async function startReview() {
    if (!selected) return;
    await action({ action: 'start_review', submissionId: selected.id }, 'Review started.');
  }

  async function submitFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const ok = await action({
      action: 'submit_feedback',
      submissionId: selected.id,
      decision,
      rating: Number(rating),
      feedbackText,
      promotionIntent,
      deliverableType,
      deliverableDetails,
      disclosureRequired
    }, 'Feedback submitted to the artist.');
    if (ok) {
      setFeedbackText(''); setDeliverableType(''); setDeliverableDetails(''); setPromotionIntent(false); setDisclosureRequired(false);
    }
  }

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !newMessage.trim()) return;
    const ok = await action({ action: 'message', submissionId: selected.id, body: newMessage }, 'Message sent.');
    if (ok) setNewMessage('');
  }

  return (
    <main className="min-h-screen bg-[#f4f5f1] pb-20">
      <section className="border-b border-black/10 bg-[#0b0b0b] text-white">
        <div className="mx-auto max-w-7xl px-5 py-12"><div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8ff00]">Professional inbox</p><h1 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">Review music without losing context.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-white/55">Every submission includes the release, campaign objective, match rationale, response deadline and permanent feedback history.</p></div><div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:min-w-[420px]">{[[pendingCount,'Needs review'],[submissions.length,'All submissions'],[submissions.filter((item) => item.feedback).length,'Feedback sent']].map(([value,label]) => <div className="bg-[#111] p-4" key={label}><p className="text-2xl font-black text-[#c8ff00]">{value}</p><p className="mt-1 text-xs text-white/40">{label}</p></div>)}</div></div></div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[390px_1fr]">
        <aside className="self-start lg:sticky lg:top-24">
          <div className="rounded-3xl border border-black/10 bg-white p-4">
            <div className="flex items-center justify-between px-2 py-2"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#667000]">Queue</p><h2 className="mt-1 text-xl font-black">Submissions</h2></div><Inbox size={20} /></div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">{statusFilters.map((status) => <button className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black ${filter === status ? 'bg-black text-white' : 'bg-slate-100 text-slate-500'}`} key={status} onClick={() => setFilter(status)}>{humanize(status)}</button>)}</div>
            <div className="mt-3 max-h-[680px] space-y-2 overflow-y-auto pr-1">{loading ? <div className="p-10 text-center"><Loader2 className="mx-auto animate-spin" /></div> : null}{!loading && !filtered.length ? <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">No submissions in this view.</div> : null}{filtered.map((submission) => <button className={`w-full rounded-2xl border p-4 text-left transition ${selected?.id === submission.id ? 'border-black bg-black text-white' : 'border-slate-200 bg-white hover:border-black/30'}`} key={submission.id} onClick={() => setSelectedId(submission.id)}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-black">{submission.release?.title || 'Untitled release'}</p><p className={`mt-1 truncate text-xs ${selected?.id === submission.id ? 'text-white/50' : 'text-slate-500'}`}>{submission.release?.artistName || 'Unknown artist'}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-black ${selected?.id === submission.id ? 'bg-[#c8ff00] text-black' : 'bg-[#e8ff91] text-[#526000]'}`}>{submission.match_score}%</span></div><p className={`mt-3 text-[11px] ${selected?.id === submission.id ? 'text-white/45' : 'text-slate-400'}`}>{submission.property?.name || 'Property'} · {humanize(submission.status)}</p></button>)}</div>
          </div>
          <Link className="mt-4 flex items-center justify-between rounded-2xl bg-[#e8ff91] p-4 text-sm font-black" href="/professional">Manage professional profile <ArrowUpRight size={15} /></Link>
        </aside>

        <section className="space-y-5">
          {message ? <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm font-semibold text-slate-700">{message}</div> : null}
          {!selected ? <div className="rounded-3xl border border-dashed border-black/20 bg-white p-16 text-center"><Music2 className="mx-auto text-slate-300" size={34} /><h2 className="mt-4 text-xl font-black">Choose a submission</h2></div> : (
            <>
              <article className="overflow-hidden rounded-3xl border border-black/10 bg-white">
                <div className="border-b border-slate-100 p-6 md:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#667000]">{selected.release?.artistName}</p><h2 className="mt-2 text-3xl font-black tracking-tight">{selected.release?.title}</h2><p className="mt-2 text-sm text-slate-500">For {selected.property?.name} · {humanize(selected.status)}</p></div><div className="flex gap-2"><span className="rounded-full bg-[#e8ff91] px-3 py-2 text-xs font-black">Match {selected.match_score}%</span>{selected.property?.verification_status === 'verified' ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700"><ShieldCheck size={13} /> Verified</span> : null}</div></div></div>
                <div className="grid gap-px bg-slate-100 md:grid-cols-3"><div className="bg-white p-5"><Clock3 size={17} /><p className="mt-4 text-xs font-bold text-slate-400">Response due</p><p className="mt-1 font-black">{selected.response_due_at ? new Date(selected.response_due_at).toLocaleDateString() : 'No deadline'}</p></div><div className="bg-white p-5"><FileText size={17} /><p className="mt-4 text-xs font-bold text-slate-400">Campaign</p><p className="mt-1 font-black">{selected.campaign?.name || 'Release campaign'}</p></div><div className="bg-white p-5"><PlayCircle size={17} /><p className="mt-4 text-xs font-bold text-slate-400">Review route</p><p className="mt-1 font-black">{humanize(selected.submission_mode)}</p></div></div>
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8"><div><h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-400">Why ArtistOS matched it</h3><div className="mt-4 space-y-2">{(selected.match_reasons || []).map((reason) => <div className="flex items-start gap-2 rounded-xl bg-[#f7f8f4] p-3 text-sm text-slate-600" key={reason}><Sparkles className="mt-0.5 shrink-0 text-[#667000]" size={14} />{reason}</div>)}</div></div><div><h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-400">Artist note</h3><p className="mt-4 rounded-2xl bg-[#f7f8f4] p-5 text-sm leading-7 text-slate-600">{selected.artist_message || 'No additional artist note was included.'}</p>{selected.release?.spotify_url ? <a className="mt-3 inline-flex items-center gap-2 text-sm font-black underline" href={selected.release.spotify_url} target="_blank" rel="noreferrer">Open track <ArrowUpRight size={14} /></a> : null}</div></div>
                {['pending_review','invited'].includes(selected.status) ? <div className="border-t border-slate-100 p-6 md:p-8"><button className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-black text-[#c8ff00] disabled:opacity-40" disabled={Boolean(saving)} onClick={startReview}>{saving ? <Loader2 className="animate-spin" size={16} /> : <PlayCircle size={16} />} Start review</button></div> : null}
              </article>

              <form className="rounded-3xl border border-black/10 bg-white p-6 md:p-8" onSubmit={submitFeedback}><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#e8ff91]"><MessageSquareText size={18} /></span><div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#667000]">Structured response</p><h2 className="mt-1 text-2xl font-black">Feedback and decision</h2></div></div><div className="mt-6 grid gap-5"><div className="grid gap-4 sm:grid-cols-2"><div><label className="label" htmlFor="decision">Decision</label><select className="input" id="decision" value={decision} onChange={(event) => setDecision(event.target.value)}><option value="not_a_fit">Not a fit</option><option value="feedback_only">Feedback only</option><option value="considering">Considering</option><option value="accepted">Accepted editorially</option><option value="promotion_offered">Promotional service offered</option></select></div><div><label className="label" htmlFor="rating">Fit rating</label><select className="input" id="rating" value={rating} onChange={(event) => setRating(event.target.value)}>{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select></div></div><div><label className="label" htmlFor="feedbackText">Meaningful feedback</label><textarea className="input min-h-32" id="feedbackText" required minLength={10} value={feedbackText} onChange={(event) => setFeedbackText(event.target.value)} placeholder="Explain fit, strengths, concerns and next steps." /></div><label className="flex items-start gap-3 rounded-2xl bg-[#f7f8f4] p-4 text-sm"><input className="mt-1" type="checkbox" checked={promotionIntent} onChange={(event) => setPromotionIntent(event.target.checked)} /><span><strong className="block">I may promote or feature this release</strong><span className="mt-1 block text-slate-500">This does not create a placement guarantee. Define the proposed deliverable below.</span></span></label>{promotionIntent ? <div className="grid gap-4 sm:grid-cols-2"><div><label className="label" htmlFor="deliverableType">Proposed deliverable</label><input className="input" id="deliverableType" value={deliverableType} onChange={(event) => setDeliverableType(event.target.value)} placeholder="YouTube upload, article, creator post..." /></div><div><label className="label" htmlFor="deliverableDetails">Terms and timing</label><input className="input" id="deliverableDetails" value={deliverableDetails} onChange={(event) => setDeliverableDetails(event.target.value)} placeholder="Expected date and scope" /></div></div> : null}<label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={disclosureRequired} onChange={(event) => setDisclosureRequired(event.target.checked)} />This deliverable requires sponsorship or paid-promotion disclosure.</label></div><button className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-black text-white disabled:opacity-40" disabled={Boolean(saving) || !feedbackText.trim()} type="submit">{saving === 'submit_feedback' ? <Loader2 className="animate-spin" size={16} /> : decision === 'not_a_fit' ? <XCircle size={16} /> : <CheckCircle2 size={16} />} Submit response</button>{selected.feedback ? <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><div className="flex items-center gap-2 font-black text-emerald-800"><CheckCircle2 size={17} /> Latest submitted response</div><p className="mt-3 text-sm leading-6 text-emerald-900/70">{selected.feedback.feedback_text}</p><div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-700"><Star size={13} /> {selected.feedback.rating || 'No'} fit rating · {humanize(selected.feedback.decision)}</div></div> : null}</form>

              <section className="rounded-3xl border border-black/10 bg-white p-6 md:p-8"><div className="flex items-center gap-3"><MessageSquareText size={18} /><h2 className="text-xl font-black">Campaign conversation</h2></div><div className="mt-5 space-y-3">{selected.messages.length ? selected.messages.map((item) => <div className="rounded-2xl bg-slate-50 p-4" key={item.id}><p className="text-sm leading-6 text-slate-700">{item.body}</p><p className="mt-2 text-[11px] text-slate-400">{new Date(item.created_at).toLocaleString()}</p></div>) : <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No messages yet.</p>}</div><form className="mt-4 flex gap-2" onSubmit={sendMessage}><input className="input" value={newMessage} onChange={(event) => setNewMessage(event.target.value)} placeholder="Ask for context or clarify a deliverable" /><button aria-label="Send message" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-black text-white disabled:opacity-40" disabled={!newMessage.trim() || Boolean(saving)} type="submit"><Send size={16} /></button></form></section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
