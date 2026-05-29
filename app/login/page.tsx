import Link from 'next/link';
import { LoginForm } from '@/components/login-form';

export const metadata = { title: 'Log in | CuratorFit' };

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
        <section>
          <p className="text-sm font-bold uppercase tracking-widest text-brand">Account access</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">Sign in to your pitch workspace.</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">V1.3 adds the authentication layer for artists, curators, and admins. Supabase Auth uses a magic link, so there is no password to manage.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="card p-5"><p className="font-black">Artists</p><p className="mt-2 text-sm text-slate-600">Save targets, plan releases, and track outreach.</p></div>
            <div className="card p-5"><p className="font-black">Curators</p><p className="mt-2 text-sm text-slate-600">Claim profiles and prepare for future review queues.</p></div>
            <div className="card p-5"><p className="font-black">Admins</p><p className="mt-2 text-sm text-slate-600">Review claims, verify listings, and protect the directory.</p></div>
          </div>
          <p className="mt-6 text-sm text-slate-500">No Supabase keys yet? The public app still works with seed data. Add keys later in <code>.env.local</code>.</p>
        </section>
        <LoginForm />
      </div>
      <div className="mt-10 rounded-3xl border border-line bg-panel p-6 text-sm text-slate-600">
        <strong className="text-ink">Compliance note:</strong> CuratorFit accounts are for discovery, review, feedback, and relationship tracking. Paid placement and guaranteed streams are not part of the product model. Read the <Link className="font-bold text-brand" href="/no-paid-placement">No Paid Placement policy</Link>.
      </div>
    </main>
  );
}
