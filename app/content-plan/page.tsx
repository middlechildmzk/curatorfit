import Link from 'next/link';
import { articles } from '@/data/content';

export const metadata = {
  title: 'CuratorFit 90-Day Content Plan',
  description: 'The public content roadmap for CuratorFit SEO, tools, AI music, and playlist pitching.'
};

export default function ContentPlanPage() {
  const p0 = articles.filter((article) => article.priority === 'P0');
  return (
    <main className="mx-auto max-w-6xl px-5 py-16">
      <span className="pill">V1.9 SEO system</span>
      <h1 className="mt-5 text-5xl font-black tracking-tight">90-day content plan</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">CuratorFit’s content system starts with trust-first playlist pitching, AI music release guidance, beginner promotion, comparison pages, and free tools.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {[
          ['Weeks 1–4', 'Playlist pitching, scam prevention, paid review vs paid placement, beginner release basics.'],
          ['Weeks 5–8', 'Suno/Udio release checklists, AI disclosure, AI promotion, and curator rejection guidance.'],
          ['Weeks 9–12', 'Alternatives pages, genre pages, comparison hubs, and deeper tool pages.']
        ].map(([title, body]) => <div key={title} className="card p-5 shadow-none"><h2 className="font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></div>)}
      </div>
      <h2 className="mt-12 text-3xl font-black">P0 seeded articles</h2>
      <div className="mt-5 grid gap-3">
        {p0.map((article) => <Link key={article.slug} href={`/blog/${article.slug}`} className="rounded-2xl border border-line bg-white p-4 text-sm font-semibold hover:border-brand">{article.title}</Link>)}
      </div>
    </main>
  );
}
