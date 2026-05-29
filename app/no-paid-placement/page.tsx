export const metadata = { title: 'No paid placement policy | CuratorFit' };

const rules = [
  ['No guaranteed streams', 'CuratorFit never promises stream counts, follower growth, algorithmic boosts, or playlist adds.'],
  ['Review is not placement', 'Future paid-review tools, if enabled, compensate curator time reviewing submissions and giving feedback. They do not buy playlist placement.'],
  ['Curators stay independent', 'Curators decide what they listen to, review, pass on, save for later, or add. Artists cannot purchase a required outcome.'],
  ['Risk notes are guidance', 'Trust and fit scores are research aids, not safety guarantees. Artists should review each target before pitching.']
];

export default function NoPaidPlacementPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <div className="card p-8 md:p-10">
        <p className="text-sm font-bold uppercase tracking-widest text-brand">Trust policy</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">No paid placement. No guaranteed streams.</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
          CuratorFit is a discovery, campaign tracking, and review workflow platform. It helps independent artists find better-fit promotion targets and organize outreach without drifting into fake-stream or pay-for-placement behavior.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {rules.map(([title, body]) => <div key={title} className="rounded-3xl border border-line bg-panel p-5"><h2 className="text-lg font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></div>)}
        </div>
        <div className="mt-8 rounded-3xl bg-slate-950 p-6 text-white">
          <h2 className="text-2xl font-black">Plain-English difference</h2>
          <p className="mt-3 leading-7 text-slate-300"><strong>Paid review</strong> means a curator may be compensated for listening, evaluating fit, and giving feedback. <strong>Paid placement</strong> means an artist pays for a playlist add, stream result, or guaranteed exposure. CuratorFit is built for review, discovery, and organization, not paid placement.</p>
        </div>
      </div>
    </main>
  );
}
