export const metadata = { title: 'Scoring methodology | CuratorFit' };

const rows = [
  ['Fit score', 'Genre, mood, vocal type, energy, curator rules, playlist theme, and historical outcomes.'],
  ['Trust score', 'Claim status, playlist clarity, update signals, response history, feedback quality, and risk review.'],
  ['Risk notes', 'Suspicious descriptions, weak ownership proof, spammy claims, inactive playlists, or unverifiable contact paths.'],
  ['Human review', 'V1 intentionally keeps premium status manual. Automation can flag, not approve blindly.']
];

export default function MethodologyPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="text-4xl font-black tracking-tight md:text-5xl">How CuratorFit evaluates playlists</h1>
      <p className="mt-5 text-lg leading-8 text-slate-600">CuratorFit is designed to reduce bad-fit submissions, not sell access. Scores are guidance for artists and review queues for admins.</p>
      <div className="mt-8 grid gap-4">
        {rows.map(([title, body]) => (
          <div key={title} className="card p-6">
            <h2 className="text-xl font-black">{title}</h2>
            <p className="mt-2 text-slate-600">{body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
