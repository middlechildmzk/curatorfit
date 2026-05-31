'use client';

import { useMemo, useState } from 'react';
import { TargetCard } from '@/components/target-card';
import type { PromotionTarget } from '@/data/seed';

const channelLabels: Record<string, string> = {
  all: 'All channels',
  spotify_playlist: 'Spotify',
  soundcloud_channel: 'SoundCloud',
  youtube_channel: 'YouTube',
  tiktok_creator: 'TikTok',
  instagram_creator: 'Instagram',
  blog: 'Blogs',
  newsletter: 'Newsletters',
  radio: 'Radio',
  label: 'Labels',
  sync_library: 'Sync',
  community: 'Communities',
  other: 'Other'
};

export function TargetsDirectoryClient({ targets }: { targets: PromotionTarget[] }) {
  const [query, setQuery] = useState('');
  const [channel, setChannel] = useState('all');
  const [trust, setTrust] = useState('all');
  const [genre, setGenre] = useState('all');
  const [energy, setEnergy] = useState('all');
  const [aiPolicy, setAiPolicy] = useState('all');
  const [cost, setCost] = useState('all');
  const [risk, setRisk] = useState('all');

  const channels = useMemo(() => ['all', ...Array.from(new Set(targets.map((target) => target.type)))], [targets]);
  const genres = useMemo(() => ['all', ...Array.from(new Set(targets.flatMap((target) => target.genres)))], [targets]);
  const energies = useMemo(() => ['all', ...Array.from(new Set(targets.map((target) => target.energyLevel).filter(Boolean) as string[]))], [targets]);
  const costs = useMemo(() => ['all', ...Array.from(new Set(targets.map((target) => target.freeOrPaid).filter(Boolean) as string[]))], [targets]);
  const aiPolicies = ['all', 'yes', 'partial', 'unclear', 'not_mentioned', 'no'];
  const risks = ['all', 'low', 'medium', 'review', 'high'];

  const filtered = useMemo(() => targets.filter((target) => {
    const haystack = [
      target.name,
      target.owner,
      target.channelLabel,
      target.fitNotes,
      target.riskNotes,
      target.submissionRules,
      target.recommendedPitchAngle,
      target.genres.join(' '),
      target.moods.join(' '),
      target.subgenres?.join(' '),
      target.fitTags?.join(' '),
      target.hardNoTags?.join(' ')
    ].join(' ').toLowerCase();
    const matchesQuery = !query.trim() || haystack.includes(query.toLowerCase());
    const matchesChannel = channel === 'all' || target.type === channel;
    const matchesTrust = trust === 'all' || (trust === 'high' ? target.trustScore >= 75 : trust === 'medium' ? target.trustScore >= 55 && target.trustScore < 75 : target.trustScore < 55);
    const matchesGenre = genre === 'all' || target.genres.includes(genre);
    const matchesEnergy = energy === 'all' || target.energyLevel === energy;
    const matchesAi = aiPolicy === 'all' || target.allowsAiAssistedMusic === aiPolicy;
    const matchesCost = cost === 'all' || target.freeOrPaid === cost;
    const matchesRisk = risk === 'all' || target.riskLevel === risk;
    return matchesQuery && matchesChannel && matchesTrust && matchesGenre && matchesEnergy && matchesAi && matchesCost && matchesRisk;
  }), [targets, query, channel, trust, genre, energy, aiPolicy, cost, risk]);

  return (
    <section>
      <div className="card mb-8 grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-2">
          <label className="label">Search targets</label>
          <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="lo-fi, Christian, future bass, blog, radio, AI-friendly..." />
        </div>
        <div>
          <label className="label">Channel</label>
          <select className="input" value={channel} onChange={(event) => setChannel(event.target.value)}>
            {channels.map((item) => <option key={item} value={item}>{channelLabels[item] || item.replaceAll('_', ' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Genre lane</label>
          <select className="input" value={genre} onChange={(event) => setGenre(event.target.value)}>
            {genres.map((item) => <option key={item} value={item}>{item === 'all' ? 'All genres' : item}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Trust band</label>
          <select className="input" value={trust} onChange={(event) => setTrust(event.target.value)}>
            <option value="all">All trust levels</option>
            <option value="high">75+ stronger candidates</option>
            <option value="medium">55-74 needs review</option>
            <option value="low">Below 55 avoid for now</option>
          </select>
        </div>
        <div>
          <label className="label">Risk</label>
          <select className="input" value={risk} onChange={(event) => setRisk(event.target.value)}>
            {risks.map((item) => <option key={item} value={item}>{item === 'all' ? 'All risk levels' : item}</option>)}
          </select>
        </div>
        <div>
          <label className="label">AI policy</label>
          <select className="input" value={aiPolicy} onChange={(event) => setAiPolicy(event.target.value)}>
            {aiPolicies.map((item) => <option key={item} value={item}>{item === 'all' ? 'All AI policies' : item.replaceAll('_', ' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Cost basis</label>
          <select className="input" value={cost} onChange={(event) => setCost(event.target.value)}>
            {costs.map((item) => <option key={item} value={item}>{item === 'all' ? 'All costs' : item}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Energy</label>
          <select className="input" value={energy} onChange={(event) => setEnergy(event.target.value)}>
            {energies.map((item) => <option key={item} value={item}>{item === 'all' ? 'All energy levels' : item}</option>)}
          </select>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-slate-500">
        <span>Showing {filtered.length} of {targets.length} targets</span>
        <span>Search by channel, genre, mood, AI policy, cost, risk, or submission style.</span>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {filtered.map((target) => <TargetCard key={target.slug} target={target} />)}
      </div>
      {!filtered.length ? <p className="rounded-2xl bg-panel p-6 text-sm text-slate-600">No targets match those filters yet. Try a broader channel, genre, or risk setting.</p> : null}
    </section>
  );
}
