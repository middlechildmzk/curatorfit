import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleCTA, TrustCallout } from '@/components/content-card';
import { alternatives, buildMetadata, getAlternative } from '@/data/content';

export function generateStaticParams() {
  return alternatives.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getAlternative(slug);
  if (!page) return {};
  return buildMetadata(page.title, page.description, `/alternatives/${page.slug}`);
}

export default async function AlternativePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getAlternative(slug);
  if (!page) notFound();
  return (
    <main className="mx-auto max-w-4xl px-5 py-16">
      <Link href="/alternatives" className="text-sm font-bold text-brand">Back to alternatives</Link>
      <span className="pill mt-6">{page.competitor}</span>
      <h1 className="mt-5 text-5xl font-black tracking-tight text-ink">{page.title}</h1>
      <p className="mt-5 text-lg leading-8 text-slate-600">{page.description}</p>
      <ArticleCTA label="Compare and track campaigns" />
      <section className="card p-7 shadow-none">
        <h2 className="text-2xl font-black">CuratorFit angle</h2>
        <p className="mt-4 leading-8 text-slate-700">{page.angle}</p>
        <ul className="mt-5 grid gap-3">
          {page.bullets.map((bullet) => <li key={bullet} className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">{bullet}</li>)}
        </ul>
      </section>
      <div className="mt-8"><TrustCallout /></div>
    </main>
  );
}
