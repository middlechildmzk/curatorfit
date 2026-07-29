import Link from 'next/link';
import { LoginForm } from '@/components/login-form';

export const metadata = { title: 'Log in' };

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f4f5f1] px-5 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_430px] lg:items-start">
        <section className="rounded-[32px] bg-[#0b0b0b] p-8 text-white md:p-12">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8ff00]">ArtistOS account access</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">One identity. Two sides of the music ecosystem.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/55">Artists manage releases, campaigns, proof and fans. Curators, creators, blogs, DJs, radio and other professionals manage properties and review submissions.</p>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><p className="font-black text-[#c8ff00]">Artists</p><p className="mt-2 text-sm leading-6 text-white/50">Build release campaigns and approve every target.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><p className="font-black text-[#c8ff00]">Professionals</p><p className="mt-2 text-sm leading-6 text-white/50">Claim channels, review music and submit transparent feedback.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><p className="font-black text-[#c8ff00]">Hybrid</p><p className="mt-2 text-sm leading-6 text-white/50">Switch between artist and professional workspaces.</p></div>
          </div>
        </section>
        <LoginForm />
      </div>
      <div className="mx-auto mt-8 max-w-6xl rounded-3xl border border-black/10 bg-white p-6 text-sm leading-6 text-slate-600"><strong className="text-slate-900">Policy boundary:</strong> payments may cover legitimate review, feedback or disclosed services. ArtistOS never sells guaranteed Spotify placement, streams or algorithmic outcomes. <Link className="font-black underline" href="/no-paid-placement">Read the policy</Link>.</div>
    </main>
  );
}
