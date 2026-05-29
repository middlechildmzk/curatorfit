import Link from 'next/link';
import { ArrowRight, BadgeCheck, Globe2, ShieldAlert } from 'lucide-react';
import type { PromotionTarget } from '@/data/seed';

export function TargetCard({ target }: { target: PromotionTarget }) {
  const riskClass = target.trustScore >= 75 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : target.trustScore >= 60 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-slate-700 bg-slate-50 border-slate-200';

  return (
    <Link href={`/targets/${target.slug}`} className="card group block p-5 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="pill mb-3">{target.channelLabel}</span>
          <h3 className="text-xl font-black tracking-tight text-ink group-hover:text-brand">{target.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{target.owner}</p>
        </div>
        <div className={`rounded-full border px-3 py-1 text-xs font-bold ${riskClass}`}>{target.trustScore}/100</div>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{target.fitNotes}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {target.genres.slice(0, 3).map((genre) => <span key={genre} className="pill">{genre}</span>)}
      </div>

      <div className="mt-5 grid gap-2 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-2"><Globe2 size={14} /> {target.audienceSize}</div>
        <div className="flex items-center gap-2"><BadgeCheck size={14} /> {target.status === 'seed' ? 'Seed profile' : target.status}</div>
        <div className="flex items-center gap-2"><ShieldAlert size={14} /> {target.riskNotes}</div>
      </div>

      <div className="mt-5 flex items-center text-sm font-bold text-brand">View target <ArrowRight className="ml-2 h-4 w-4" /></div>
    </Link>
  );
}
