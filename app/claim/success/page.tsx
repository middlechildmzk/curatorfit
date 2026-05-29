import Link from 'next/link';

export const metadata = { title: 'Request received | CuratorFit' };

type SearchParams = Promise<{ type?: string; mode?: string }>;

export default async function ClaimSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const label = params.type === 'application' ? 'curator application' : 'claim request';
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <div className="card p-8 md:p-10">
        <p className="text-sm font-bold uppercase tracking-widest text-brand">Request received</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">We received your {label}.</h1>
        <p className="mt-4 text-slate-600 leading-7">
          Thanks. CuratorFit reviews claim and application requests before changing public profiles. This keeps the directory accurate and prevents false affiliation claims.
        </p>
        {params.mode === 'demo' ? <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">Demo mode: Supabase is not configured, so this request was validated but not saved.</p> : null}
        <div className="mt-7 flex flex-wrap gap-3"><Link className="btn-primary" href="/browse">Browse targets</Link><Link className="btn-secondary" href="/no-paid-placement">Read trust policy</Link></div>
      </div>
    </main>
  );
}
