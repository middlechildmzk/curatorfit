import Link from 'next/link';
import { ArrowRight, CheckCircle2, ClipboardList, Send, Sparkles } from 'lucide-react';
import { getPromotionTargets } from '@/lib/data';
import { CampaignsClient } from '@/components/campaigns-client';

const sampleCampaign = [
  { step: 'Release prep', detail: 'Check track link, release date, clean/explicit status, hook timestamp, and pitch angle.', icon: ClipboardList },
  { step: 'Target mapping', detail: 'Pick Spotify playlists first, then add SoundCloud, YouTube, TikTok, blog, and radio targets.', icon: Sparkles },
  { step: 'Pitch tracking', detail: 'Track sent date, response, outcome, follow-up date, and relationship notes per target.', icon: Send }
];

export const metadata = {
  title: 'Campaign Planner | CuratorFit',
  description: 'Plan a multi-channel song campaign across playlists, creators, channels, blogs, radio, and labels.'
};

export default async function CampaignsPage() {
  const promotionTargets = await getPromotionTargets();
  return (
    <main className="mx-auto max-w-7xl px-5 py-14">
      <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr]">
        <section>
          <span className="pill mb-4">Artist campaign tracker</span>
          <h1 className="text-4xl font-black tracking-tight text-ink md:text-6xl">One release. Every pitch. One clean dashboard.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            V1.6 turns the campaign workflow into a real logged-in workspace. Artists can save releases, attach first targets, and build a reusable relationship history across Spotify, SoundCloud, YouTube, TikTok, blogs, radio, and labels.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/channels" className="btn-primary">Browse targets <ArrowRight size={16} /></Link>
            <Link href="/artist" className="btn-secondary">Open artist tracker</Link>
          </div>
        </section>

        <section className="card p-5">
          <div className="rounded-3xl bg-slate-950 p-6 text-white">
            <p className="text-sm font-bold text-teal-200">Demo campaign</p>
            <h2 className="mt-3 text-3xl font-black">Still Here — Release Pitch Plan</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Emotional future bass · cinematic · guitar warmth · hopeful drop</p>
            <div className="mt-6 grid gap-3">
              {sampleCampaign.map(({ step, detail, icon: Icon }) => (
                <div key={step} className="rounded-2xl bg-white/10 p-4">
                  <div className="flex items-center gap-2 font-bold"><Icon size={16} /> {step}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <CampaignsClient targets={promotionTargets.map((target) => ({ slug: target.slug, name: target.name, type: target.type, channelLabel: target.channelLabel, fitNotes: target.fitNotes, trustScore: target.trustScore }))} />

      <section className="mt-14 grid gap-5 lg:grid-cols-3">
        {promotionTargets.slice(0, 3).map((target) => (
          <div key={target.slug} className="card p-6">
            <span className="pill mb-3">{target.channelLabel}</span>
            <h3 className="text-xl font-black">{target.name}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{target.fitNotes}</p>
            <div className="mt-5 flex items-center gap-2 text-sm font-bold text-brand"><CheckCircle2 size={16} /> Add to campaign target list</div>
          </div>
        ))}
      </section>
    </main>
  );
}
