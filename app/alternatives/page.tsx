import { alternatives } from '@/data/content';
import { ContentCard } from '@/components/content-card';

export const metadata = {
  title: 'Playlist promotion alternatives | CuratorFit',
  description: 'Trust-first comparison pages for Playlist Push, SubmitHub, Groover, DailyPlaylists, and AI music promotion options.'
};

export default function AlternativesPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-16">
      <section className="mb-10 max-w-4xl">
        <span className="pill">Comparison hub</span>
        <h1 className="mt-5 text-5xl font-black tracking-tight text-ink">Playlist promotion alternatives without fake hype.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">Compare popular submission services through the lens of fit, transparency, trust, and campaign workflow.</p>
      </section>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {alternatives.map((page) => <ContentCard key={page.slug} href={`/alternatives/${page.slug}`} title={page.title} description={page.description} eyebrow="Alternative page" />)}
      </div>
    </main>
  );
}
