import Link from 'next/link';
import { ArrowRight, CheckCircle2, Shield, Sparkles, Workflow, Radio } from 'lucide-react';
import { PlaylistCard } from '@/components/playlist-card';
import { getPlaylists } from '@/lib/data';
import { articles, toolCards } from '@/data/content';
import { ContentCard } from '@/components/content-card';

const features = [
  ['Fit before access', 'See whether a song belongs on a playlist before wasting a pitch or credit.'],
  ['Trust-first directory', 'Seed listings, claimed profiles, and verification notes keep the marketplace honest.'],
  ['Pitch tracker', 'Artists can organize release campaigns, saved targets, and submission history across channels.'],
  ['Channel expansion', 'Start with Spotify, then add SoundCloud, YouTube, TikTok, blogs, radio, labels, and sync libraries.']
];

export default async function HomePage() {
  const playlists = await getPlaylists();
  return (
    <main>
      <section className="relative overflow-hidden border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:py-28">
          <div>
            <span className="pill mb-5">Playlist pitching without the fake hype</span>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight text-ink md:text-7xl">
              Find playlists your song actually fits.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              CuratorFit helps independent artists discover safer, better-fit playlist opportunities, track every pitch, and avoid sketchy “guaranteed placement” services. Spotify is the beachhead; the platform is built to expand into SoundCloud, YouTube, TikTok, blogs, radio, and labels.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/browse" className="btn-primary">Browse seed directory <ArrowRight size={16} /></Link>
              <Link href="/tools" className="btn-secondary">Use free tools</Link>
              <Link href="/ai-music" className="btn-secondary">AI music hub</Link>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              {['No guaranteed streams', 'No paid placement language', 'Curator claim flow', 'Multi-channel campaign tracker'].map((item) => (
                <div key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand2" />{item}</div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-teal-900 p-6 text-white">
              <p className="text-sm font-bold text-teal-200">Demo fit readout</p>
              <h2 className="mt-4 text-3xl font-black">Strong fit candidate</h2>
              <p className="mt-3 text-sm leading-6 text-slate-200">Emotional future bass · female vocal · guitar warmth · cinematic drop</p>
              <div className="mt-8 grid gap-3">
                {['Genre overlap: high', 'Curator trust: good candidate', 'Risk signal: manual review', 'Recommended action: pitch carefully'].map((row) => (
                  <div key={row} className="rounded-2xl bg-white/10 p-4 text-sm backdrop-blur">{row}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand">V1 seed directory</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">Starter playlists</h2>
          </div>
          <Link href="/browse" className="btn-secondary">View all</Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {playlists.slice(0, 3).map((playlist) => <PlaylistCard key={playlist.slug} playlist={playlist} />)}
        </div>
      </section>


      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-brand">V1.7 content engine</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">Guides and tools that turn search traffic into campaigns</h2>
            </div>
            <Link href="/blog" className="btn-secondary">Read the blog</Link>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {articles.slice(0, 3).map((article) => <ContentCard key={article.slug} href={`/blog/${article.slug}`} title={article.title} description={article.description} eyebrow={article.category} />)}
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-4">
            {toolCards.map((tool) => <ContentCard key={tool.slug} href={tool.href} title={tool.title} description={tool.description} eyebrow="Free tool" />)}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-16 md:grid-cols-4">
          {features.map(([title, body], i) => {
            const icons = [Sparkles, Shield, Workflow, Radio];
            const Icon = icons[i];
            return (
              <div key={title} className="card p-6 shadow-none">
                <Icon className="h-6 w-6 text-brand" />
                <h3 className="mt-4 font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
