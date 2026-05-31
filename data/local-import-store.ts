import type { PromotionTargetImportRow } from './import-schema';
import { buildImportBatchSummary } from './import-schema';

export const LOCAL_IMPORT_BATCHES_KEY = 'curatorfit.localImportBatches.v1';

export type LocalImportBatch = {
  id: string;
  name: string;
  createdAt: string;
  rowCount: number;
  summary: ReturnType<typeof buildImportBatchSummary>;
  rows: PromotionTargetImportRow[];
};

function makeBatchId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `batch-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function readLocalImportBatches(): LocalImportBatch[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_IMPORT_BATCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLocalImportBatches(batches: LocalImportBatch[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_IMPORT_BATCHES_KEY, JSON.stringify(batches));
}

export function createLocalImportBatch(name: string, rows: PromotionTargetImportRow[]): LocalImportBatch {
  return {
    id: makeBatchId(),
    name: name.trim() || 'Untitled CuratorFit import batch',
    createdAt: new Date().toISOString(),
    rowCount: rows.length,
    summary: buildImportBatchSummary(rows),
    rows
  };
}

export function saveLocalImportBatch(name: string, rows: PromotionTargetImportRow[]) {
  const batch = createLocalImportBatch(name, rows);
  const existing = readLocalImportBatches();
  const next = [batch, ...existing];
  writeLocalImportBatches(next);
  return next;
}

export function deleteLocalImportBatch(batchId: string) {
  const next = readLocalImportBatches().filter((batch) => batch.id !== batchId);
  writeLocalImportBatches(next);
  return next;
}

export function clearLocalImportBatches() {
  writeLocalImportBatches([]);
  return [];
}

export function exportLocalImportBatchesJson(batches: LocalImportBatch[]) {
  return JSON.stringify({ exportedAt: new Date().toISOString(), batches }, null, 2);
}
