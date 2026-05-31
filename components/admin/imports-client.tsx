'use client';

import { useEffect, useMemo, useState } from 'react';
import { buildImportBatchSummary, parsePromotionTargetCsv, promotionTargetImportColumns } from '@/data/import-schema';
import { testImportCsv, testImportBatchName } from '@/data/test-import-25';
import { clearLocalImportBatches, deleteLocalImportBatch, exportLocalImportBatchesJson, readLocalImportBatches, saveLocalImportBatch, type LocalImportBatch } from '@/data/local-import-store';

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl border border-emerald-400/20 bg-black/40 p-4"><div className="font-mono text-2xl font-black text-emerald-300">{value}</div><div className="mt-1 text-xs uppercase tracking-widest text-slate-400">{label}</div></div>;
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ImportsClient() {
  const [csvText, setCsvText] = useState(testImportCsv);
  const [batchName, setBatchName] = useState(testImportBatchName);
  const [savedBatches, setSavedBatches] = useState<LocalImportBatch[]>([]);
  const [notice, setNotice] = useState('');
  const parsed = useMemo(() => parsePromotionTargetCsv(csvText), [csvText]);
  const summary = useMemo(() => buildImportBatchSummary(parsed.rows), [parsed.rows]);

  useEffect(() => {
    setSavedBatches(readLocalImportBatches());
  }, []);

  const savedTotalRows = savedBatches.reduce((sum, batch) => sum + batch.rowCount, 0);
  const firstRows = parsed.rows.slice(0, 8);

  function handleSaveBatch() {
    if (parsed.errors.length) {
      setNotice('Fix validation errors before saving this batch.');
      return;
    }
    if (!parsed.rows.length) {
      setNotice('No rows to save. Paste a CSV or reload the test batch.');
      return;
    }
    const next = saveLocalImportBatch(batchName, parsed.rows);
    setSavedBatches(next);
    setNotice(`Saved ${parsed.rows.length} rows locally. This did not require Supabase.`);
  }

  function handleDeleteBatch(batchId: string) {
    const next = deleteLocalImportBatch(batchId);
    setSavedBatches(next);
    setNotice('Deleted local batch.');
  }

  function handleClearAll() {
    const next = clearLocalImportBatches();
    setSavedBatches(next);
    setNotice('Cleared all local import batches.');
  }

  function handleExportJson() {
    downloadText('curatorfit-local-import-batches.json', exportLocalImportBatchesJson(savedBatches));
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100">
      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8 border-b border-emerald-400/20 pb-6">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-emerald-300">CuratorFit V2.2b Local Import Queue</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Target ingestion console</h1>
          <p className="mt-4 max-w-4xl text-slate-400">Paste a research CSV, validate it against the promotion target schema, save batches locally in your browser, and keep everything in candidate/review status before anything becomes public. No Supabase required for this stage.</p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-5">
          <Stat label="Rows parsed" value={summary.total} />
          <Stat label="Duplicate keys" value={summary.duplicateCount} />
          <Stat label="Errors" value={parsed.errors.length} />
          <Stat label="Saved local rows" value={savedTotalRows} />
          <Stat label="Target goal" value="2,000+" />
        </div>

        {notice ? <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-950/30 p-4 text-sm text-emerald-100">{notice}</div> : null}

        <div className="grid gap-6 lg:grid-cols-[460px_1fr]">
          <section className="rounded-3xl border border-emerald-400/20 bg-[#07100c] p-5 shadow-2xl shadow-emerald-950/20">
            <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-emerald-300">Import batch name</label>
            <input value={batchName} onChange={(event) => setBatchName(event.target.value)} className="mb-4 w-full rounded-xl border border-emerald-400/20 bg-black px-4 py-3 font-mono text-sm text-emerald-100 outline-none focus:ring-2 focus:ring-emerald-400/40" />
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <label className="block font-mono text-xs uppercase tracking-widest text-emerald-300">CSV payload</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setCsvText(testImportCsv)} className="rounded-full border border-emerald-400/30 px-3 py-1 font-mono text-xs text-emerald-200 hover:bg-emerald-400/10">reload test</button>
                <button onClick={() => setCsvText([promotionTargetImportColumns.join(','), ''].join('\n'))} className="rounded-full border border-emerald-400/30 px-3 py-1 font-mono text-xs text-emerald-200 hover:bg-emerald-400/10">clear</button>
              </div>
            </div>
            <textarea value={csvText} onChange={(event) => setCsvText(event.target.value)} className="h-[560px] w-full rounded-2xl border border-emerald-400/20 bg-black p-4 font-mono text-xs leading-5 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-400/40" spellCheck={false} />
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button onClick={handleSaveBatch} className="rounded-full bg-emerald-300 px-5 py-3 text-sm font-black text-black hover:bg-emerald-200">Save batch locally</button>
              <button onClick={handleExportJson} disabled={!savedBatches.length} className="rounded-full border border-emerald-400/30 px-5 py-3 text-sm font-bold text-emerald-100 hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-40">Export saved JSON</button>
            </div>
          </section>

          <section className="grid gap-5">
            <div className="rounded-3xl border border-emerald-400/20 bg-[#07100c] p-5">
              <h2 className="font-mono text-sm uppercase tracking-widest text-emerald-300">Validation report</h2>
              {parsed.errors.length ? (
                <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-950/40 p-4 text-sm text-red-100">
                  {parsed.errors.slice(0, 6).map((error) => <p key={error}>{error}</p>)}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-950/30 p-4 text-sm text-emerald-100">Schema check passed. Rows are still candidate research until manually reviewed.</div>
              )}
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div><p className="font-mono text-xs text-slate-500">By type</p><pre className="mt-2 overflow-auto rounded-2xl bg-black p-3 text-xs text-slate-300">{JSON.stringify(summary.byType, null, 2)}</pre></div>
                <div><p className="font-mono text-xs text-slate-500">By risk</p><pre className="mt-2 overflow-auto rounded-2xl bg-black p-3 text-xs text-slate-300">{JSON.stringify(summary.byRisk, null, 2)}</pre></div>
                <div><p className="font-mono text-xs text-slate-500">By review status</p><pre className="mt-2 overflow-auto rounded-2xl bg-black p-3 text-xs text-slate-300">{JSON.stringify(summary.byStatus, null, 2)}</pre></div>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-400/20 bg-[#07100c] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-mono text-sm uppercase tracking-widest text-emerald-300">Saved local batches</h2>
                <button onClick={handleClearAll} disabled={!savedBatches.length} className="rounded-full border border-red-400/30 px-3 py-1 font-mono text-xs text-red-100 hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-40">clear all</button>
              </div>
              <div className="mt-4 grid gap-3">
                {savedBatches.length ? savedBatches.map((batch) => (
                  <div key={batch.id} className="rounded-2xl border border-emerald-400/10 bg-black/30 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div><p className="font-mono text-emerald-100">{batch.name}</p><p className="mt-1 text-xs text-slate-500">{new Date(batch.createdAt).toLocaleString()} · {batch.rowCount} rows · {batch.summary.duplicateCount} duplicate keys</p></div>
                      <button onClick={() => handleDeleteBatch(batch.id)} className="rounded-full border border-red-400/30 px-3 py-1 font-mono text-xs text-red-100 hover:bg-red-400/10">delete</button>
                    </div>
                    <pre className="mt-3 overflow-auto rounded-xl bg-black p-3 text-xs text-slate-400">{JSON.stringify({ byType: batch.summary.byType, byRisk: batch.summary.byRisk, byStatus: batch.summary.byStatus }, null, 2)}</pre>
                  </div>
                )) : <div className="rounded-2xl border border-slate-700 bg-black/30 p-4 text-sm text-slate-400">No saved batches yet. Validate the CSV and click Save batch locally.</div>}
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-400/20 bg-[#07100c] p-5">
              <h2 className="font-mono text-sm uppercase tracking-widest text-emerald-300">Preview rows</h2>
              <div className="mt-4 overflow-auto rounded-2xl border border-emerald-400/10">
                <table className="min-w-full border-collapse font-mono text-xs">
                  <thead className="bg-black text-slate-400">
                    <tr><th className="px-3 py-3 text-left">Target</th><th className="px-3 py-3 text-left">Type</th><th className="px-3 py-3 text-left">Genre</th><th className="px-3 py-3 text-left">Risk</th><th className="px-3 py-3 text-left">Review</th><th className="px-3 py-3 text-left">AI</th></tr>
                  </thead>
                  <tbody>
                    {firstRows.map((row) => (
                      <tr key={row.id || row.duplicate_key} className="border-t border-emerald-400/10 hover:bg-emerald-400/5">
                        <td className="px-3 py-3 text-emerald-100">{row.target_name}</td>
                        <td className="px-3 py-3 text-slate-300">{row.target_type}</td>
                        <td className="px-3 py-3 text-slate-300">{row.primary_genre}</td>
                        <td className="px-3 py-3 text-slate-300">{row.risk_level}</td>
                        <td className="px-3 py-3 text-slate-300">{row.review_status}</td>
                        <td className="px-3 py-3 text-slate-300">{row.allows_ai_assisted_music}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-950/20 p-4 text-sm leading-6 text-amber-100">This is local-first storage. It proves the workflow before we add Supabase, Postgres, Neon, Turso, Firebase, or any other hosted database.</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
