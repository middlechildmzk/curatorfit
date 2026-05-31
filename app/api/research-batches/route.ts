import { NextResponse } from 'next/server';
import { testImportCsv, testImportBatchName } from '@/data/test-import-25';
import { batch2ElectronicCsv, batch2ElectronicName, batch2ElectronicSummary } from '@/data/batch-2-electronic';
import { allAiTeamBatchCsv, allAiTeamBatchName, allAiTeamBatchSummary } from '@/data/all-ai-team-batch';
import { buildImportBatchSummary, parsePromotionTargetCsv } from '@/data/import-schema';

export const dynamic = 'force-dynamic';

type BatchRecord = {
  id: string;
  name: string;
  csv: string;
  summary?: Record<string, unknown>;
};

const BATCHES: BatchRecord[] = [
  {
    id: 'test-25',
    name: testImportBatchName,
    csv: testImportCsv,
    summary: { source: 'CuratorFit internal 25-row test import' }
  },
  {
    id: 'batch-2-electronic',
    name: batch2ElectronicName,
    csv: batch2ElectronicCsv,
    summary: batch2ElectronicSummary
  },
  {
    id: 'ai-team-consolidated',
    name: allAiTeamBatchName,
    csv: allAiTeamBatchCsv,
    summary: allAiTeamBatchSummary
  }
];

function toPayload(batch: BatchRecord, includeRows: boolean, includeCsv: boolean) {
  const parsed = parsePromotionTargetCsv(batch.csv);
  const schemaSummary = buildImportBatchSummary(parsed.rows);

  return {
    id: batch.id,
    name: batch.name,
    rowCount: parsed.rows.length,
    schemaSummary,
    researchSummary: batch.summary || {},
    errors: parsed.errors,
    rows: includeRows ? parsed.rows : undefined,
    csv: includeCsv ? batch.csv : undefined
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const format = url.searchParams.get('format') || 'json';
  const includeRows = url.searchParams.get('rows') === '1' || url.searchParams.get('rows') === 'true';
  const includeCsv = url.searchParams.get('csv') === '1' || url.searchParams.get('csv') === 'true';

  const batch = id ? BATCHES.find((item) => item.id === id) : null;

  if (format === 'csv') {
    const csvBatch = batch || BATCHES.find((item) => item.id === 'ai-team-consolidated') || BATCHES[0];
    return new NextResponse(csvBatch.csv, {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="curatorfit-${csvBatch.id}.csv"`
      }
    });
  }

  if (batch) {
    return NextResponse.json(toPayload(batch, includeRows, includeCsv));
  }

  return NextResponse.json({
    service: 'CuratorFit research batch REST endpoint',
    usage: {
      list: '/api/research-batches',
      oneBatch: '/api/research-batches?id=ai-team-consolidated&rows=1',
      csv: '/api/research-batches?id=ai-team-consolidated&format=csv',
      options: ['id', 'rows=1', 'csv=1', 'format=csv']
    },
    batches: BATCHES.map((item) => {
      const parsed = parsePromotionTargetCsv(item.csv);
      return {
        id: item.id,
        name: item.name,
        rowCount: parsed.rows.length,
        schemaSummary: buildImportBatchSummary(parsed.rows),
        researchSummary: item.summary || {},
        errors: parsed.errors
      };
    })
  });
}
