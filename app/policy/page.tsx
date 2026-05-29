export const metadata = { title: 'Platform policy | CuratorFit' };

export default function PolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="text-4xl font-black tracking-tight">Platform policy draft</h1>
      <div className="mt-8 grid gap-4">
        {[
          ['Curators', 'No guaranteed placement, no off-platform pay-to-add offers, no fake feedback, no bot-driven playlists.'],
          ['Artists', 'No spam submissions, no misleading genre tags, no harassment after a pass, no attempts to buy placement.'],
          ['Listings', 'Unclaimed profiles are public research profiles until verified. Owners may claim, update, or opt out.'],
          ['Paid reviews', 'Future paid review features compensate listening and feedback time only.']
        ].map(([title, body]) => (
          <div className="card p-6" key={title}><h2 className="text-xl font-black">{title}</h2><p className="mt-2 text-slate-600">{body}</p></div>
        ))}
      </div>
    </main>
  );
}
