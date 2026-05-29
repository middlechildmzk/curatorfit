'use client';

import { useState } from 'react';

const starterRows = [
  { target: 'Melodic Bass Afterglow', status: 'saved', note: 'Strong genre fit, verify owner first' },
  { target: 'Quiet Room Lo-fi', status: 'pitch drafted', note: 'Good for instrumental version' },
  { target: 'Faith & Heavy Days Blog', status: 'researching', note: 'Story-driven pitch needed' }
];

export function SubmissionTrackerTool() {
  const [rows, setRows] = useState(starterRows);
  return (
    <div className="card overflow-hidden shadow-none">
      <div className="border-b border-line bg-slate-50 p-5">
        <p className="text-sm font-black uppercase tracking-widest text-brand">Tracker preview</p>
        <h3 className="mt-2 text-2xl font-black">Submission status board</h3>
      </div>
      <div className="divide-y divide-line">
        {rows.map((row, index) => (
          <div key={row.target} className="grid gap-3 p-5 md:grid-cols-[1fr_180px_1.2fr]">
            <input className="input" value={row.target} onChange={(e) => setRows(rows.map((r, i) => i === index ? { ...r, target: e.target.value } : r))} />
            <select className="input" value={row.status} onChange={(e) => setRows(rows.map((r, i) => i === index ? { ...r, status: e.target.value } : r))}>
              {['saved', 'researching', 'pitch drafted', 'pitched', 'follow up', 'passed', 'added', 'not a fit', 'do not contact'].map((status) => <option key={status}>{status}</option>)}
            </select>
            <input className="input" value={row.note} onChange={(e) => setRows(rows.map((r, i) => i === index ? { ...r, note: e.target.value } : r))} />
          </div>
        ))}
      </div>
      <div className="p-5">
        <button className="btn-secondary" onClick={() => setRows([...rows, { target: 'New target', status: 'saved', note: 'Add fit notes' }])}>Add row</button>
      </div>
    </div>
  );
}
