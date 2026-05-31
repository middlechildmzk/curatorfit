import Link from 'next/link';

export const metadata = {
  title: 'CuratorFit Pricing',
  description: 'CuratorFit pricing concepts for free discovery, Pro campaign tools, Studio workflows, and future paid review marketplace.'
};

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'For artists learning where to pitch and how to avoid bad-fit promotion.',
    features: ['Public directory', 'Free tools', 'Basic match preview', 'AI music release guides', 'Waitlist access']
  },
  {
    name: 'Pro',
    price: '$29/mo',
    description: 'For independent artists actively planning releases and tracking outreach.',
    features: ['Advanced matching', 'Saved targets', 'Pitch CRM', 'Follow-up reminders', 'Campaign reports', 'Advanced filters']
  },
  {
    name: 'Studio',
    price: '$79/mo',
    description: 'For managers, high-output creators, and small labels managing multiple artists.',
    features: ['Multi-artist workspace', 'Bulk target lists', 'Sync/radio tracking', 'Team-ready reports', 'Reusable pitch templates']
  },
  {
    name: 'Marketplace later',
    price: 'Review fees',
    description: 'Curators may eventually be paid for review time and feedback, never guaranteed placement.',
    features: ['Paid review only', 'No paid placement', 'Review deadlines', 'Refund logic', 'CuratorFit platform fee']
  }
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-16">
      <section className="mb-10 max-w-4xl">
        <span className="pill">Monetization roadmap</span>
        <h1 className="mt-5 text-5xl font-black tracking-tight">Pricing that sells workflow, not fake hype.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">CuratorFit monetizes discovery, matching, campaign tracking, and review workflows. It does not sell guaranteed streams, guaranteed uploads, guaranteed reposts, or paid playlist placement.</p>
      </section>
      <div className="grid gap-5 lg:grid-cols-4">
        {tiers.map((tier) => (
          <div key={tier.name} className="card p-6">
            <h2 className="text-2xl font-black">{tier.name}</h2>
            <p className="mt-3 text-4xl font-black text-brand">{tier.price}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{tier.description}</p>
            <div className="mt-6 grid gap-2 text-sm text-slate-600">
              {tier.features.map((feature) => <div key={feature}>✓ {feature}</div>)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 rounded-3xl border border-line bg-white p-6 text-sm leading-6 text-slate-700">
        Future marketplace language should always say submit for review, curator feedback, pitch consideration, campaign tracking, and target discovery. Never frame purchases as buying placement or streams.
      </div>
      <div className="mt-8"><Link href="/waitlist" className="btn-primary">Join beta</Link></div>
    </main>
  );
}
