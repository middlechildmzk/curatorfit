import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleCTA, TrustCallout } from '@/components/content-card';
import { articles, buildMetadata, getArticle } from '@/data/content';

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return buildMetadata(article.title, article.description, `/blog/${article.slug}`);
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: { '@type': 'Organization', name: 'CuratorFit' },
    publisher: { '@type': 'Organization', name: 'CuratorFit' },
    mainEntityOfPage: `/blog/${article.slug}`
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="mx-auto max-w-3xl px-5 py-16">
        <Link href="/blog" className="text-sm font-bold text-brand">Back to blog</Link>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="pill">{article.category}</span>
          <span className="pill">{article.priority}</span>
          <span className="pill">Keyword: {article.primaryKeyword}</span>
        </div>
        <h1 className="mt-5 text-5xl font-black tracking-tight text-ink">{article.title}</h1>
        <p className="mt-5 text-xl leading-8 text-slate-600">{article.description}</p>
        {article.category === 'AI Music' && (
          <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            This guide is educational, not legal advice. Always verify current platform, distributor, and AI tool terms before uploading or monetizing music.
          </div>
        )}
        <ArticleCTA label={article.cta} />
        <div className="space-y-10">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-black tracking-tight text-ink">{section.heading}</h2>
              <div className="mt-4 space-y-4 text-base leading-8 text-slate-700">
                {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>
        <div className="mt-10">
          <TrustCallout />
        </div>
        <section className="mt-10 border-t border-line pt-8">
          <h2 className="text-xl font-black">Related reading</h2>
          <div className="mt-4 grid gap-3">
            {article.related.map((slug) => {
              const related = getArticle(slug);
              return related ? <Link className="rounded-2xl border border-line bg-white p-4 text-sm font-bold" href={`/blog/${related.slug}`} key={slug}>{related.title}</Link> : null;
            })}
          </div>
        </section>
      </article>
    </main>
  );
}
