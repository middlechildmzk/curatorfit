import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { cleanText, requireAdmin } from '@/lib/server-auth';

const rowSchema = z.object({
  name: z.string().min(1),
  type: z.string().default('spotify_playlist'),
  url: z.string().url(),
  source_url: z.string().optional().default(''),
  genre: z.string().optional().default(''),
  genres: z.string().optional().default(''),
  moods: z.string().optional().default(''),
  audience_size_label: z.string().optional().default(''),
  owner_name: z.string().optional().default(''),
  submission_rules: z.string().optional().default(''),
  risk_notes: z.string().optional().default(''),
  trust_tier: z.string().optional().default('seed'),
  status: z.string().optional().default('seed')
});

function parseCsv(text: string) {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') { field += '"'; i++; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (char === ',' && !quoted) { row.push(field); field = ''; continue; }
    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i++;
      row.push(field); field = '';
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      continue;
    }
    field += char;
  }
  row.push(field);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

function slugify(name: string, url: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 64) || 'target';
  const suffix = Buffer.from(url).toString('hex').slice(0, 6);
  return `${base}-${suffix}`;
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return admin.response;
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: false, error: 'Supabase admin client is not configured.' }, { status: 500 });

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: 'Upload a CSV file.' }, { status: 400 });
  const text = await file.text();
  const rows = parseCsv(text);
  const headers = (rows.shift() || []).map((h) => h.trim().toLowerCase());
  const objects = rows.map((cells) => Object.fromEntries(headers.map((h, i) => [h, cells[i] || ''])));

  const { data: batch, error: batchError } = await supabase.from('import_batches').insert({
    file_name: file.name,
    row_count: objects.length,
    status: 'processing',
    created_by: admin.auth.user.id
  }).select('id').single();
  if (batchError) return NextResponse.json({ ok: false, error: batchError.message }, { status: 500 });

  const inserts = objects.map((obj) => {
    const parsed = rowSchema.safeParse(obj);
    if (!parsed.success) return null;
    const row = parsed.data;
    const genres = row.genres ? row.genres.split('|').map((x) => cleanText(x, 80)).filter(Boolean) : (row.genre ? [cleanText(row.genre, 80)] : []);
    const moods = row.moods ? row.moods.split('|').map((x) => cleanText(x, 80)).filter(Boolean) : [];
    return {
      import_batch_id: batch.id,
      type: row.type,
      url: row.url,
      source_url: row.source_url || null,
      slug: slugify(row.name, row.url),
      name: cleanText(row.name, 160),
      genre: cleanText(row.genre, 80) || genres[0] || null,
      genres,
      moods,
      audience_size_label: cleanText(row.audience_size_label, 120) || null,
      contact_method: cleanText(row.owner_name, 180) || null,
      submission_rules: cleanText(row.submission_rules, 1000) || 'Needs manual verification before artist routing.',
      risk_notes: cleanText(row.risk_notes, 1000) || 'Seed listing. Not claimed, not affiliated, and not verified yet.',
      status: row.status || 'seed',
      risk_level: row.trust_tier.includes('verified') ? 'medium' : 'review',
      trust_score: row.trust_tier.includes('premium') ? 70 : row.trust_tier.includes('verified') ? 62 : 45,
      verification_notes: 'Imported from CSV as candidate seed target. Manual review required before verification.'
    };
  }).filter(Boolean);

  const { error } = await supabase.from('promotion_targets').upsert(inserts, { onConflict: 'slug' });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  await supabase.from('import_batches').update({ status: 'complete' }).eq('id', batch.id);
  return NextResponse.json({ ok: true, imported: inserts.length, batchId: batch.id });
}
