import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleCTA, TrustCallout } from '@/components/content-card';
import { buildMetadata, genrePages, getGenrePage } from '@/data/content';

export function generateStaticParams() {
  return genrePages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getGenrePage(slug);
  if (!page) return {};
  return buildMetadata(page.title, page.description, `/genres/${page.slug}`);
}

export default async function GenrePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getGenrePage(slug);
  if (!page) notFound();
  return (
    <main className="mx-auto max-w-5xl px-5 py-16">
      <Link href="/genres" className="text-sm font-bold text-brand">Back to genres</Link>
      <span className="pill mt-6">{page.genre}</span>
      <h1 className="mt-5 text-5xl font-black tracking-tight text-ink">{page.title}</h1>
      <p className="mt-5 text-lg leading-8 text-slate-600">{page.description}</p>
      <ArticleCTA label="Find and save matching targets" />
      <div className="grid gap-5 md:grid-cols-2">
        <section className="card p-7 shadow-none">
          <h2 className="text-2xl font-black">Good fit signals</h2>
          <ul className="mt-5 space-y-3">
            {page.fitSignals.map((item) => <li key={item} className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">{item}</li>)}
          </ul>
        </section>
        <section className="card p-7 shadow-none">
          <h2 className="text-2xl font-black">Avoid these mistakes</h2>
          <ul className="mt-5 space-y-3">
            {page.avoid.map((item) => <li key={item} className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">{item}</li>)}
          </ul>
        </section>
      </div>
      <div className="mt-8"><TrustCallout /></div>
    </main>
  );
}
