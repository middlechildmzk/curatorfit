import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ExternalLink, ShieldAlert } from 'lucide-react';
import { promotionTargets } from '@/data/seed';
import { SaveTargetButton } from '@/components/save-target-button';
import { getPromotionTargetBySlug } from '@/lib/data';

export function generateStaticParams() {
  return promotionTargets.map((target) => ({ slug: target.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const target = await getPromotionTargetBySlug(slug);
  return { title: target ? `${target.name} | CuratorFit` : 'Promotion Target | CuratorFit' };
}

export default async function TargetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const target = await getPromotionTargetBySlug(slug);
  if (!target) return notFound();

  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <Link href="/channels" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand"><ArrowLeft size={16} /> Back to channels</Link>
      <section className="card overflow-hidden">
        <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-teal-900 p-8 text-white md:p-10">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-100">{target.channelLabel}</span>
          <h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">{target.name}</h1>
          <p className="mt-3 text-slate-200">{target.owner} · {target.audienceSize}</p>
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_300px] md:p-8">
          <div>
            <h2 className="text-2xl font-black">Fit notes</h2>
            <p className="mt-3 leading-7 text-slate-600">{target.fitNotes}</p>
            <h2 className="mt-8 text-2xl font-black">Submission rules</h2>
            <p className="mt-3 leading-7 text-slate-600">{target.submissionRules}</p>
            <h2 className="mt-8 text-2xl font-black">Risk notes</h2>
            <p className="mt-3 flex gap-3 leading-7 text-slate-600"><ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-amber-600" /> {target.riskNotes}</p>
          </div>
          <aside className="rounded-3xl border border-line bg-slate-50 p-5">
            <div className="text-sm font-bold uppercase tracking-wider text-slate-400">Trust score</div>
            <div className="mt-2 text-5xl font-black text-ink">{target.trustScore}</div>
            <div className="mt-1 text-sm text-slate-500">out of 100</div>
            <div className="mt-5 flex flex-wrap gap-2">
              {target.genres.map((genre) => <span key={genre} className="pill">{genre}</span>)}
            </div>
            <div className="mt-5 grid gap-3 text-sm text-slate-600">
              <div className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand2" /> {target.contactMethod}</div>
              <div className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand2" /> Status: {target.status}</div>
            </div>
            <a href={target.url} target="_blank" rel="noreferrer" className="btn-primary mt-6 w-full">Open channel <ExternalLink size={16} /></a>
            <SaveTargetButton targetSlug={target.slug} />
            <Link href="/claim" className="btn-secondary mt-3 w-full">Claim or update</Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
