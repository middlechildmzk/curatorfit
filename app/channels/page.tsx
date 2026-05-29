import Link from 'next/link';
import { ArrowRight, Radio, ShieldCheck, Workflow } from 'lucide-react';
import { channelTypes } from '@/data/seed';
import { getPromotionTargets } from '@/lib/data';
import { TargetCard } from '@/components/target-card';

export const metadata = {
  title: 'Promotion Channels | CuratorFit',
  description: 'CuratorFit is built as a multi-channel music pitching OS starting with Spotify playlists, then expanding to SoundCloud, YouTube, TikTok, blogs, radio, and labels.'
};

export default async function ChannelsPage() {
  const promotionTargets = await getPromotionTargets();
  return (
    <main className="mx-auto max-w-7xl px-5 py-14">
      <div className="max-w-3xl">
        <span className="pill mb-4">Multi-channel foundation</span>
        <h1 className="text-4xl font-black tracking-tight text-ink md:text-6xl">Spotify first. Music promotion OS next.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          CuratorFit starts with Spotify playlist discovery because artists already search for it, but the underlying model is broader: every playlist, channel, creator, blog, radio show, label, or curator becomes a promotion target with rules, fit notes, trust signals, and campaign history.
        </p>
      </div>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        <div className="card p-6"><Workflow className="h-6 w-6 text-brand" /><h2 className="mt-4 font-black">One campaign model</h2><p className="mt-2 text-sm leading-6 text-slate-600">Every release can track outreach across Spotify, SoundCloud, YouTube, TikTok, blogs, radio, and labels.</p></div>
        <div className="card p-6"><ShieldCheck className="h-6 w-6 text-brand" /><h2 className="mt-4 font-black">Channel-specific safety</h2><p className="mt-2 text-sm leading-6 text-slate-600">Spotify needs no paid placement language. YouTube needs rights checks. TikTok needs disclosure rules.</p></div>
        <div className="card p-6"><Radio className="h-6 w-6 text-brand" /><h2 className="mt-4 font-black">Expandable target graph</h2><p className="mt-2 text-sm leading-6 text-slate-600">Start with playlists, then add creators, channels, publications, and curated communities.</p></div>
      </section>

      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand">Channel roadmap</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">Promotion target types</h2>
          </div>
          <Link href="/roadmap" className="btn-secondary">View roadmap</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {channelTypes.map((channel) => (
            <div key={channel.type} className="card p-6 shadow-none">
              <h3 className="font-black">{channel.label}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{channel.promise}</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Type: {channel.type}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-black tracking-tight">Seed promotion targets</h2>
          <Link href="/campaigns" className="btn-primary">Plan campaign <ArrowRight size={16} /></Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {promotionTargets.map((target) => <TargetCard key={target.slug} target={target} />)}
        </div>
      </section>
    </main>
  );
}
