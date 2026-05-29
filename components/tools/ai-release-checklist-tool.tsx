'use client';

import { useMemo, useState } from 'react';

const items = [
  'Checked the AI tool plan and current commercial-use terms',
  'Reviewed distributor policy for AI-assisted music',
  'Verified metadata, artist name, writers, and release title',
  'Checked for impersonation, unauthorized samples, or confusing voice/style claims',
  'Cleaned arrangement, mix, master, intro, and ending',
  'Prepared honest disclosure or process notes where appropriate',
  'Built a pitch list based on fit, not volume',
  'Saved a record of release decisions and promotion targets'
];

export function AIReleaseChecklistTool() {
  const [checked, setChecked] = useState<string[]>([]);
  const progress = useMemo(() => Math.round((checked.length / items.length) * 100), [checked]);
  return (
    <div className="card p-6 shadow-none">
      <div className="mb-5 rounded-3xl bg-indigo-50 p-5">
        <p className="text-sm font-black uppercase tracking-widest text-indigo-700">Release readiness</p>
        <h3 className="mt-2 text-3xl font-black text-ink">{progress}% complete</h3>
        <p className="mt-2 text-sm leading-6 text-indigo-900">Educational checklist only. Verify current platform and distributor policies before release.</p>
      </div>
      <div className="grid gap-3">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 text-sm font-semibold text-slate-700">
            <input type="checkbox" className="h-5 w-5" checked={checked.includes(item)} onChange={(e) => setChecked(e.target.checked ? [...checked, item] : checked.filter((x) => x !== item))} />
            {item}
          </label>
        ))}
      </div>
    </div>
  );
}
