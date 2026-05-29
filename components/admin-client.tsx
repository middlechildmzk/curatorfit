'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowser, hasSupabaseBrowserConfig } from '@/lib/supabase-browser';

type AdminData = {
  targets: any[];
  playlists: any[];
  claims: any[];
  applications: any[];
  imports: any[];
};

const emptyData: AdminData = { targets: [], playlists: [], claims: [], applications: [], imports: [] };

const actions = [
  ['verify', 'Verify'],
  ['mark_seed', 'Mark seed'],
  ['flag_review', 'Needs review'],
  ['pause', 'Pause'],
  ['opt_out', 'Opt out'],
  ['remove', 'Remove']
];

async function getAccessToken() {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

export function AdminClient() {
  const [data, setData] = useState<AdminData>(emptyData);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [editing, setEditing] = useState<any | null>(null);
  const ready = hasSupabaseBrowserConfig();
  const pendingCount = useMemo(() => data.claims.filter((claim) => ['new', 'needs_info'].includes(claim.status)).length + data.applications.filter((app) => ['new', 'needs_info'].includes(app.status)).length, [data]);

  async function load() {
    setLoading(true);
    setMessage('');
    const token = await getAccessToken();
    if (!token) {
      setLoading(false);
      setMessage('Log in with an admin account to view operations.');
      return;
    }
    const res = await fetch('/api/admin/tables', { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    setLoading(false);
    if (!json.ok) {
      setMessage(json.error || 'Admin access required.');
      setData(emptyData);
      return;
    }
    setData({ targets: json.targets || [], playlists: json.playlists || [], claims: json.claims || [], applications: json.applications || [], imports: json.imports || [] });
  }

  useEffect(() => {
    async function boot() {
      if (!ready) return;
      const supabase = getSupabaseBrowser();
      const { data: userData } = await supabase!.auth.getUser();
      setEmail(userData.user?.email || '');
      await load();
    }
    boot();
  }, [ready]);

  async function runAction(entity: string, id: string, action: string) {
    const token = await getAccessToken();
    if (!token) return setMessage('Log in before running admin actions.');
    const res = await fetch('/api/admin/target-action', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity, id, action, adminNotes: notes })
    });
    const json = await res.json();
    setMessage(json.ok ? 'Admin action saved.' : json.error || 'Action failed.');
    if (json.ok) await load();
  }

  async function importCsv(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = await getAccessToken();
    if (!token) return setMessage('Log in before importing.');
    const form = event.currentTarget;
    const formData = new FormData(form);
    setMessage('Importing CSV...');
    const res = await fetch('/api/admin/import-targets', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
    const json = await res.json();
    setMessage(json.ok ? `Imported ${json.imported} targets.` : json.error || 'Import failed.');
    if (json.ok) {
      form.reset();
      await load();
    }
  }

  async function updateTarget(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = await getAccessToken();
    if (!token) return setMessage('Log in before editing targets.');
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    const res = await fetch('/api/admin/target-update', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    setMessage(json.ok ? 'Target details updated.' : json.error || 'Update failed.');
    if (json.ok) {
      setEditing(null);
      await load();
    }
  }

  if (!ready) {
    return <div className="card p-8"><h1 className="text-3xl font-black">Admin locked</h1><p className="mt-3 text-slate-600">Configure Supabase browser and service-role env vars before admin operations are available.</p></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-widest text-brand">Internal V1.6 admin</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Review, import, and clean the target graph</h1>
        <p className="mt-4 max-w-3xl text-slate-600">V1.6 adds target editing on top of the protected review queue, so seed data can move from raw research to beta-quality listings without touching SQL.</p>
        <div className="mt-4 flex flex-wrap gap-3"><span className="pill">Signed in: {email || 'not detected'}</span><span className="pill">Pending review: {pendingCount}</span><button className="btn-secondary py-2" onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button></div>
        {message ? <p className="mt-4 rounded-2xl bg-panel p-4 text-sm font-semibold text-slate-700">{message}</p> : null}
      </div>

      <div className="grid gap-5 md:grid-cols-5">
        <div className="card p-5"><p className="text-sm text-slate-500">Targets</p><p className="mt-2 text-4xl font-black">{data.targets.length}</p></div>
        <div className="card p-5"><p className="text-sm text-slate-500">Playlists</p><p className="mt-2 text-4xl font-black">{data.playlists.length}</p></div>
        <div className="card p-5"><p className="text-sm text-slate-500">Claims</p><p className="mt-2 text-4xl font-black">{data.claims.length}</p></div>
        <div className="card p-5"><p className="text-sm text-slate-500">Applications</p><p className="mt-2 text-4xl font-black">{data.applications.length}</p></div>
        <div className="card p-5"><p className="text-sm text-slate-500">Imports</p><p className="mt-2 text-4xl font-black">{data.imports.length}</p></div>
      </div>

      <section className="mt-8 card p-6">
        <h2 className="text-2xl font-black">CSV seed import</h2>
        <p className="mt-2 text-sm text-slate-600">Import manually reviewed seed targets as candidate listings. Imported rows are not affiliated, claimed, or verified until reviewed.</p>
        <form onSubmit={importCsv} className="mt-5 flex flex-wrap gap-3"><input className="input max-w-md" type="file" name="file" accept=".csv" required /><button className="btn-primary" type="submit">Import CSV</button></form>
      </section>

      <section className="mt-8 card p-6">
        <h2 className="text-2xl font-black">Admin notes for next action</h2>
        <textarea className="input mt-4 min-h-24" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Verification notes, risk notes, claim evidence, or reason for rejection..." />
      </section>

      {editing ? (
        <section className="mt-8 card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-sm font-bold uppercase tracking-widest text-brand">Target editor</p><h2 className="mt-2 text-2xl font-black">Edit {editing.name}</h2></div>
            <button className="btn-secondary py-2" onClick={() => setEditing(null)}>Close</button>
          </div>
          <form onSubmit={updateTarget} className="mt-6 grid gap-4 md:grid-cols-2">
            <input type="hidden" name="id" value={editing.id} />
            <div><label className="label">Name</label><input className="input" name="name" defaultValue={editing.name || ''} /></div>
            <div><label className="label">Source URL</label><input className="input" name="sourceUrl" defaultValue={editing.source_url || ''} /></div>
            <div><label className="label">Status</label><select className="input" name="status" defaultValue={editing.status || 'seed'}>{['seed','unclaimed','claimed','verified','partner','paused','opted_out','removed','rejected'].map((status) => <option key={status} value={status}>{status}</option>)}</select></div>
            <div><label className="label">Risk level</label><select className="input" name="riskLevel" defaultValue={editing.risk_level || 'review'}>{['low','medium','review','high'].map((risk) => <option key={risk} value={risk}>{risk}</option>)}</select></div>
            <div><label className="label">Trust score</label><input className="input" type="number" min="0" max="100" name="trustScore" defaultValue={editing.trust_score || 50} /></div>
            <div className="md:col-span-2"><label className="label">Fit notes</label><textarea className="input min-h-24" name="fitNotes" defaultValue={editing.fit_notes || ''} /></div>
            <div className="md:col-span-2"><label className="label">Risk notes</label><textarea className="input min-h-24" name="riskNotes" defaultValue={editing.risk_notes || ''} /></div>
            <div className="md:col-span-2"><label className="label">Submission rules</label><textarea className="input min-h-24" name="submissionRules" defaultValue={editing.submission_rules || ''} /></div>
            <div className="md:col-span-2"><label className="label">Verification notes</label><textarea className="input min-h-24" name="verificationNotes" defaultValue={editing.verification_notes || ''} /></div>
            <button className="btn-primary md:col-span-2" type="submit">Save target edits</button>
          </form>
        </section>
      ) : null}

      <section className="mt-8 card overflow-hidden">
        <div className="border-b border-line p-5"><h2 className="text-xl font-black">Promotion target review queue</h2></div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-panel text-slate-500"><tr><th className="p-4">Target</th><th>Type</th><th>Status</th><th>Risk</th><th>Trust</th><th>Source</th><th>Actions</th></tr></thead><tbody>
          {data.targets.map((target) => <tr key={target.id} className="border-t border-line"><td className="p-4 font-bold">{target.name}</td><td>{target.type}</td><td className="capitalize">{target.status}</td><td>{target.risk_level}</td><td>{target.trust_score}</td><td className="max-w-[160px] truncate text-slate-500">{target.source_url || 'manual/seed'}</td><td className="flex flex-wrap gap-2 py-3"><button className="rounded-full border border-line bg-white px-3 py-1 text-xs font-bold text-slate-700" onClick={() => setEditing(target)}>Edit</button>{actions.map(([action,label]) => <button key={action} className="rounded-full border border-line bg-white px-3 py-1 text-xs font-bold text-slate-700" onClick={() => runAction('promotion_targets', target.id, action)}>{label}</button>)}</td></tr>)}
        </tbody></table></div>
        {!data.targets.length ? <p className="p-6 text-sm text-slate-600">No targets loaded yet.</p> : null}
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="card overflow-hidden"><div className="border-b border-line p-5"><h2 className="text-xl font-black">Claim requests</h2></div>{data.claims.length ? <div className="divide-y divide-line">{data.claims.map((claim) => <div key={claim.id} className="p-5"><p className="font-black">{claim.name}</p><p className="text-sm text-slate-500">{claim.email} · {claim.intent} · {claim.status}</p><p className="mt-2 break-all text-sm text-slate-600">{claim.target_url}</p><div className="mt-4 flex gap-2"><button className="btn-secondary py-2" onClick={() => runAction('target_claims', claim.id, 'approve_claim')}>Approve</button><button className="btn-secondary py-2" onClick={() => runAction('target_claims', claim.id, 'needs_info')}>Needs info</button><button className="btn-secondary py-2" onClick={() => runAction('target_claims', claim.id, 'reject')}>Reject</button></div></div>)}</div> : <p className="p-6 text-sm text-slate-600">No claim requests yet.</p>}</div>
        <div className="card overflow-hidden"><div className="border-b border-line p-5"><h2 className="text-xl font-black">Curator applications</h2></div>{data.applications.length ? <div className="divide-y divide-line">{data.applications.map((app) => <div key={app.id} className="p-5"><p className="font-black">{app.display_name}</p><p className="text-sm text-slate-500">{app.email} · {app.status}</p><p className="mt-2 break-all text-sm text-slate-600">{app.primary_url}</p><div className="mt-4 flex gap-2"><button className="btn-secondary py-2" onClick={() => runAction('curator_applications', app.id, 'approve_claim')}>Approve</button><button className="btn-secondary py-2" onClick={() => runAction('curator_applications', app.id, 'needs_info')}>Needs info</button><button className="btn-secondary py-2" onClick={() => runAction('curator_applications', app.id, 'reject')}>Reject</button></div></div>)}</div> : <p className="p-6 text-sm text-slate-600">No curator applications yet.</p>}</div>
      </section>
    </div>
  );
}
