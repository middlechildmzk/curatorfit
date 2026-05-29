import Link from 'next/link';
import { articles } from '@/data/content';
import { ContentCard } from '@/components/content-card';

export const metadata = {
  title: 'AI Music Release Hub for Suno and Udio creators | CuratorFit',
  description: 'Guides, checklists, and tools for releasing and promoting Suno, Udio, and AI-assisted music responsibly.'
};

export default function AIMusicHubPage() {
  const aiArticles = articles.filter((article) => article.category === 'AI Music');
  return (
    <main>
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <span className="pill">AI music release hub</span>
          <h1 className="mt-5 max-w-5xl text-5xl font-black tracking-tight text-ink md:text-6xl">Release AI-assisted music without losing trust.</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">Suno, Udio, and AI-assisted creators need more than prompts. They need release readiness, policy awareness, honest disclosure, and safer promotion workflows.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/tools/ai-music-release-checklist" className="btn-primary">Open AI release checklist</Link>
            <Link href="/blog/can-you-release-suno-music-on-spotify" className="btn-secondary">Read Suno guide</Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {aiArticles.map((article) => <ContentCard key={article.slug} href={`/blog/${article.slug}`} title={article.title} description={article.description} eyebrow="AI music" />)}
        </div>
      </section>
      <section className="border-t border-line bg-amber-50">
        <div className="mx-auto max-w-7xl px-5 py-10 text-sm leading-7 text-amber-950">
          <strong>Important:</strong> AI music rules can change. CuratorFit content is educational and not legal advice. Always verify current terms from the AI tool, distributor, and platform before uploading or monetizing music.
        </div>
      </section>
    </main>
  );
}
