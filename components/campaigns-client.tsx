'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabaseBrowser, hasSupabaseBrowserConfig } from '@/lib/supabase-browser';

type Target = { slug: string; name: string; type: string; channelLabel: string; fitNotes: string; trustScore: number };
type CampaignRow = { id: string; name: string; status: string; tracks?: { title: string | null; track_url: string | null } | null; campaign_targets?: Array<{ id: string; pitch_status: string; notes: string | null; response_notes?: string | null; follow_up_at?: string | null; promotion_targets?: { name: string; slug: string; type: string } | null }> };

export function CampaignsClient({ targets }: { targets: Target[] }) {
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [selectedTarget, setSelectedTarget] = useState(targets[0]?.slug || '');
  const ready = hasSupabaseBrowserConfig();

  async function loadCampaigns(uid: string) {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const { data } = await supabase
      .from('campaigns')
      .select('id,name,status,tracks(title,track_url),campaign_targets(id,pitch_status,notes,promotion_targets(name,slug,type))')
      .order('created_at', { ascending: false })
      .limit(10);
    setCampaigns(((data || []) as unknown) as CampaignRow[]);
  }

  useEffect(() => {
    async function boot() {
      if (!ready) return;
      const supabase = getSupabaseBrowser()!;
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
        await loadCampaigns(data.user.id);
      }
    }
    boot();
  }, [ready]);

  async function createCampaign(formData: FormData) {
    setMessage('Saving campaign...');
    const token = await getAccessToken();
    const res = await fetch('/api/campaigns', { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : undefined, body: formData });
    const json = await res.json();
    setMessage(json.ok ? 'Campaign saved.' : `Error: ${json.error || 'Could not save campaign.'}`);
    if (json.ok && userId) await loadCampaigns(userId);
  }

  async function getAccessToken() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }

  async function updateTargetStatus(campaignTargetId: string, pitchStatus: string) {
    const token = await getAccessToken();
    if (!token) return setMessage('Log in before updating campaign target status.');
    const res = await fetch('/api/campaign-target-status', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignTargetId, pitchStatus })
    });
    const json = await res.json();
    setMessage(json.ok ? 'Status updated.' : json.error || 'Could not update status.');
    if (json.ok && userId) await loadCampaigns(userId);
  }

  const statusOptions = ['saved', 'researching', 'pitch_drafted', 'pitched', 'follow_up', 'passed', 'added', 'not_a_fit', 'do_not_contact'];

  return (
    <section className="mt-12 grid gap-8 lg:grid-cols-[420px_1fr]">
      <form action={createCampaign} className="card p-6">
        <p className="text-sm font-bold uppercase tracking-widest text-brand">V1.6 campaign save</p>
        <h2 className="mt-2 text-2xl font-black">Create a release campaign</h2>
        <p className="mt-2 text-sm text-slate-600">Save a track, campaign, and first promotion target under your logged-in artist profile.</p>
        {!ready ? <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">Supabase is not configured; this will run in demo validation mode.</p> : null}
        {ready && !userId ? <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">Log in first to save campaigns to your account.</p> : null}
        <div className="mt-5 grid gap-4">
          <div><label className="label">Campaign name</label><input className="input" name="campaignName" defaultValue="New release pitch campaign" /></div>
          <div><label className="label">Artist name</label><input className="input" name="artistName" placeholder="Middle Child" /></div>
          <div><label className="label">Track title</label><input className="input" name="trackTitle" placeholder="Still Here" /></div>
          <div><label className="label">Track URL</label><input className="input" name="trackUrl" placeholder="Spotify, SoundCloud, private link, or landing page" /></div>
          <div><label className="label">Goal</label><select className="input" name="goal"><option value="playlist_pitching">Playlist pitching</option><option value="multi_channel_release">Multi-channel release</option><option value="feedback_only">Feedback only</option><option value="relationship_crm">Relationship CRM</option></select></div>
          <div><label className="label">First target</label><select className="input" name="targetSlug" value={selectedTarget} onChange={(e) => setSelectedTarget(e.target.value)}>{targets.map((target) => <option key={target.slug} value={target.slug}>{target.channelLabel}: {target.name}</option>)}</select></div>
          <div><label className="label">Pitch notes</label><textarea className="input min-h-28" name="notes" placeholder="What makes this track a fit? What hook timestamp should the curator hear?" /></div>
          <button className="btn-primary" type="submit" disabled={ready && !userId}>Save campaign</button>
          {message ? <p className="text-sm font-semibold text-slate-600">{message}</p> : null}
        </div>
      </form>

      <div className="space-y-5">
        <div className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-2xl font-black">Your saved campaigns</h2><p className="mt-1 text-sm text-slate-600">Real Supabase rows when configured; empty until you create your first campaign.</p></div>
            <Link className="btn-secondary" href="/profile">Edit profile</Link>
          </div>
        </div>
        {campaigns.length ? campaigns.map((campaign) => (
          <div className="card p-6" key={campaign.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><h3 className="text-xl font-black">{campaign.name}</h3><p className="mt-1 text-sm text-slate-500">{campaign.tracks?.title || 'Untitled track'} · {campaign.status}</p></div>
              <span className="pill">{campaign.campaign_targets?.length || 0} targets</span>
            </div>
            <div className="mt-4 grid gap-3">
              {(campaign.campaign_targets || []).map((target) => <div className="rounded-2xl border border-line bg-panel p-4" key={target.id}><p className="font-bold">{target.promotion_targets?.name || 'Saved target'}</p><p className="text-sm text-slate-500">{target.promotion_targets?.type || 'channel'} · {target.pitch_status}</p>{target.notes ? <p className="mt-2 text-sm text-slate-600">{target.notes}</p> : null}<div className="mt-3 flex flex-wrap gap-2">{statusOptions.map((status) => <button key={status} className="rounded-full border border-line bg-white px-3 py-1 text-xs font-bold text-slate-700" onClick={() => updateTargetStatus(target.id, status)}>{status.replaceAll('_', ' ')}</button>)}</div></div>)}
            </div>
          </div>
        )) : <div className="card p-6"><p className="text-sm text-slate-600">No saved campaigns yet. Create one on the left. In local/demo mode, use this as the review-ready UI shell.</p></div>}
      </div>
    </section>
  );
}
