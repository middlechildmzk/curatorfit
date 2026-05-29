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
  blog: 'Blogs',
  radio: 'Radio',
  label: 'Labels',
  sync_library: 'Sync'
};

export function TargetsDirectoryClient({ targets }: { targets: PromotionTarget[] }) {
  const [query, setQuery] = useState('');
  const [channel, setChannel] = useState('all');
  const [trust, setTrust] = useState('all');

  const channels = useMemo(() => ['all', ...Array.from(new Set(targets.map((target) => target.type)))], [targets]);
  const filtered = useMemo(() => targets.filter((target) => {
    const haystack = [target.name, target.owner, target.channelLabel, target.fitNotes, target.riskNotes, target.genres.join(' '), target.moods.join(' ')].join(' ').toLowerCase();
    const matchesQuery = !query.trim() || haystack.includes(query.toLowerCase());
    const matchesChannel = channel === 'all' || target.type === channel;
    const matchesTrust = trust === 'all' || (trust === 'high' ? target.trustScore >= 75 : trust === 'medium' ? target.trustScore >= 55 && target.trustScore < 75 : target.trustScore < 55);
    return matchesQuery && matchesChannel && matchesTrust;
  }), [targets, query, channel, trust]);

  return (
    <section>
      <div className="card mb-8 grid gap-4 p-5 md:grid-cols-[1fr_220px_220px]">
        <div>
          <label className="label">Search targets</label>
          <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="lo-fi, Christian, future bass, blog, radio..." />
        </div>
        <div>
          <label className="label">Channel</label>
          <select className="input" value={channel} onChange={(event) => setChannel(event.target.value)}>
            {channels.map((item) => <option key={item} value={item}>{channelLabels[item] || item.replaceAll('_', ' ')}</option>)}
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
      </div>
      <div className="mb-4 text-sm font-semibold text-slate-500">Showing {filtered.length} of {targets.length} targets</div>
      <div className="grid gap-5 lg:grid-cols-3">
        {filtered.map((target) => <TargetCard key={target.slug} target={target} />)}
      </div>
      {!filtered.length ? <p className="rounded-2xl bg-panel p-6 text-sm text-slate-600">No targets match those filters yet. Try a broader channel or search term.</p> : null}
    </section>
  );
}
