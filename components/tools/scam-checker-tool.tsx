'use client';

import { useMemo, useState } from 'react';

export function ScamCheckerTool() {
  const [guarantees, setGuarantees] = useState(false);
  const [curatorIdentity, setCuratorIdentity] = useState(true);
  const [genreFocus, setGenreFocus] = useState(true);
  const [pressure, setPressure] = useState(false);
  const [recentActivity, setRecentActivity] = useState(true);

  const result = useMemo(() => {
    let score = 20;
    if (guarantees) score += 35;
    if (!curatorIdentity) score += 20;
    if (!genreFocus) score += 15;
    if (pressure) score += 20;
    if (!recentActivity) score += 10;
    if (score >= 70) return { label: 'High risk', note: 'Avoid for now. Too many trust signals are missing or risky.' };
    if (score >= 40) return { label: 'Needs manual review', note: 'Do not pay or pitch yet. Verify identity, activity, and submission terms.' };
    return { label: 'Lower visible risk', note: 'Still verify before submitting. This quick check is not a guarantee of safety.' };
  }, [guarantees, curatorIdentity, genreFocus, pressure, recentActivity]);

  return (
    <div className="card p-6 shadow-none">
      <div className="grid gap-3">
        <Toggle label="The service promises guaranteed streams or placement" checked={guarantees} setChecked={setGuarantees} />
        <Toggle label="The curator identity or owner is visible" checked={curatorIdentity} setChecked={setCuratorIdentity} />
        <Toggle label="The playlist has a clear genre or mood focus" checked={genreFocus} setChecked={setGenreFocus} />
        <Toggle label="The pitch page uses pressure, urgency, or huge claims" checked={pressure} setChecked={setPressure} />
        <Toggle label="The playlist appears recently maintained" checked={recentActivity} setChecked={setRecentActivity} />
      </div>
      <div className="mt-6 rounded-3xl bg-slate-950 p-6 text-white">
        <p className="text-sm font-black uppercase tracking-widest text-teal-200">Quick risk readout</p>
        <h3 className="mt-2 text-3xl font-black">{result.label}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-200">{result.note}</p>
      </div>
    </div>
  );
}

function Toggle({ label, checked, setChecked }: { label: string; checked: boolean; setChecked: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white p-4 text-sm font-semibold text-slate-700">
      {label}
      <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="h-5 w-5" />
    </label>
  );
}
