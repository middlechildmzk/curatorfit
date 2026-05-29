import { toolCards } from '@/data/content';
import { ContentCard } from '@/components/content-card';

export const metadata = {
  title: 'Free music promotion tools | CuratorFit',
  description: 'Free tools for playlist scam checks, curator pitches, AI music release readiness, and submission tracking.'
};

export default function ToolsPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-16">
      <section className="mb-10 max-w-4xl">
        <span className="pill">Trust tools hub</span>
        <h1 className="mt-5 text-5xl font-black tracking-tight text-ink">Free tools for safer music promotion.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">Turn CuratorFit’s trust-first content into action with lightweight tools for pitches, scam checks, release readiness, and campaign tracking.</p>
      </section>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {toolCards.map((tool) => <ContentCard key={tool.slug} href={tool.href} title={tool.title} description={tool.description} eyebrow="Free tool" />)}
      </div>
    </main>
  );
}
