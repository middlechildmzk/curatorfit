import { articles } from '@/data/content';
import { ContentCard, TrustCallout } from '@/components/content-card';

export const metadata = {
  title: 'CuratorFit Guides - playlist pitching, release planning, and AI music',
  description: 'Practical guides for safer playlist pitching, beginner music promotion, AI music release readiness, and campaign tracking.'
};

export default function GuidesPage() {
  const guides = articles.filter((article) => ['Playlist Pitching', 'Scam Prevention', 'Beginner Promotion'].includes(article.category));
  return (
    <main className="mx-auto max-w-7xl px-5 py-16">
      <section className="mb-10 max-w-4xl">
        <span className="pill">Guides</span>
        <h1 className="mt-5 text-5xl font-black tracking-tight text-ink">Build a safer release campaign.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">Start with the highest-intent CuratorFit guides, then turn your reading into saved targets, pitch drafts, and tracked outcomes.</p>
      </section>
      <div className="mb-10"><TrustCallout /></div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {guides.map((article) => <ContentCard key={article.slug} href={`/blog/${article.slug}`} title={article.title} description={article.description} eyebrow={article.category} />)}
      </div>
    </main>
  );
}
