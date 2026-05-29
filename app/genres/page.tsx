import { genrePages } from '@/data/content';
import { ContentCard } from '@/components/content-card';

export const metadata = {
  title: 'Genre playlist pitching guides | CuratorFit',
  description: 'Genre-specific playlist pitching guides for future bass, lo-fi, Christian, indie pop, ambient, and cinematic artists.'
};

export default function GenresPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-16">
      <section className="mb-10 max-w-4xl">
        <span className="pill">Genre SEO pages</span>
        <h1 className="mt-5 text-5xl font-black tracking-tight text-ink">Pitch by fit, not just genre tags.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">Each genre page explains fit signals, risky mismatches, and how to track better submission decisions.</p>
      </section>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {genrePages.map((page) => <ContentCard key={page.slug} href={`/genres/${page.slug}`} title={page.title} description={page.description} eyebrow={page.genre} />)}
      </div>
    </main>
  );
}
