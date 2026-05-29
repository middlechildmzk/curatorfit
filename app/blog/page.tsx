import { articles, contentCategories } from '@/data/content';
import { ContentCard } from '@/components/content-card';

export const metadata = {
  title: 'CuratorFit Blog - Honest playlist pitching and AI music release guides',
  description: 'Trust-first guides for Spotify playlist pitching, AI music releases, scam prevention, and beginner artist promotion.'
};

export default function BlogPage() {
  const p0 = articles.filter((article) => article.priority === 'P0');
  return (
    <main className="mx-auto max-w-7xl px-5 py-16">
      <section className="mb-12 max-w-4xl">
        <span className="pill">SEO content engine</span>
        <h1 className="mt-5 text-5xl font-black tracking-tight text-ink md:text-6xl">Honest music promotion guides for modern artists.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Playlist pitching, scam prevention, AI music release checklists, and campaign workflows built for independent and AI-assisted artists.
        </p>
      </section>
      <div className="mb-10 flex flex-wrap gap-2">
        {contentCategories.map((category) => <span key={category} className="pill">{category}</span>)}
      </div>
      <section>
        <h2 className="mb-5 text-2xl font-black tracking-tight">Priority articles</h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {p0.map((article) => (
            <ContentCard key={article.slug} href={`/blog/${article.slug}`} title={article.title} description={article.description} eyebrow={`${article.category} · ${article.priority}`} />
          ))}
        </div>
      </section>
    </main>
  );
}
