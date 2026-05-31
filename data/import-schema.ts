import { z } from 'zod';
import { AI_POLICIES, RISK_FLAGS, RISK_LEVELS, REVIEW_STATUSES, TARGET_TYPES, TRUST_TIERS, normalizeDuplicateKey } from './target-review-types';

const csvBoolean = z.union([z.boolean(), z.string()]).optional().transform((value) => {
  if (typeof value === 'boolean') return value;
  if (!value) return false;
  return ['true', 'yes', '1', 'y'].includes(value.toLowerCase().trim());
});

const csvList = z.union([z.array(z.string()), z.string()]).optional().transform((value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean);
  return value.split(/[;,|]/).map((item) => item.trim()).filter(Boolean);
});

const optionalString = z.string().optional().default('');

export const promotionTargetImportRowSchema = z.object({
  id: optionalString,
  target_name: z.string().min(1, 'target_name is required'),
  target_type: z.enum(TARGET_TYPES).catch('other'),
  platform: optionalString,
  primary_url: optionalString,
  submission_url: optionalString,
  public_contact_url: optionalString,
  public_contact_email: optionalString,
  owner_or_brand_name: optionalString,
  country_or_region: optionalString,
  language: optionalString,
  audience_size: optionalString,
  audience_size_type: optionalString,
  last_activity_signal: optionalString,
  primary_genre: optionalString,
  secondary_genres: csvList,
  subgenres: csvList,
  moods: csvList,
  energy_level: optionalString,
  vocal_preference: optionalString,
  explicit_allowed: optionalString,
  accepted_formats: csvList,
  best_fit_artist_stage: optionalString,
  submission_method: optionalString,
  submission_rules_summary: optionalString,
  free_or_paid: optionalString,
  response_expectation: optionalString,
  allows_ai_assisted_music: z.enum(AI_POLICIES).catch('unclear'),
  ai_music_notes: optionalString,
  trust_tier: z.enum(TRUST_TIERS).catch('candidate'),
  risk_level: z.enum(RISK_LEVELS).catch('review'),
  risk_notes: optionalString,
  risk_flags: csvList,
  verification_notes: optionalString,
  reason_for_inclusion: optionalString,
  do_not_contact: csvBoolean,
  opt_out_required: csvBoolean,
  fit_tags: csvList,
  hard_no_tags: csvList,
  recommended_pitch_angle: optionalString,
  sample_pitch_note: optionalString,
  source_url: optionalString,
  source_type: optionalString,
  source_retrieved_at: optionalString,
  last_verified_at: optionalString,
  verified_by: optionalString,
  policy_last_checked_at: optionalString,
  import_batch_id: optionalString,
  review_status: z.enum(REVIEW_STATUSES).catch('new_import'),
  duplicate_key: optionalString,
  is_placeholder: csvBoolean
}).transform((row) => {
  const riskFlags = row.risk_flags.filter((flag): flag is typeof RISK_FLAGS[number] => (RISK_FLAGS as readonly string[]).includes(flag));
  const duplicateKey = row.duplicate_key || normalizeDuplicateKey(row);
  const shouldBlock = row.do_not_contact || riskFlags.includes('guaranteed_streams_language') || riskFlags.includes('guaranteed_placement_language') || row.risk_level === 'high';
  return {
    ...row,
    risk_flags: riskFlags,
    duplicate_key: duplicateKey,
    review_status: shouldBlock ? 'blocked' as const : row.review_status,
    trust_tier: shouldBlock ? 'blocked' as const : row.trust_tier
  };
});

export type PromotionTargetImportRow = z.infer<typeof promotionTargetImportRowSchema>;

export const promotionTargetImportColumns = [
  'id',
  'target_name',
  'target_type',
  'platform',
  'primary_url',
  'submission_url',
  'public_contact_url',
  'public_contact_email',
  'owner_or_brand_name',
  'country_or_region',
  'language',
  'audience_size',
  'audience_size_type',
  'last_activity_signal',
  'primary_genre',
  'secondary_genres',
  'subgenres',
  'moods',
  'energy_level',
  'vocal_preference',
  'explicit_allowed',
  'accepted_formats',
  'best_fit_artist_stage',
  'submission_method',
  'submission_rules_summary',
  'free_or_paid',
  'response_expectation',
  'allows_ai_assisted_music',
  'ai_music_notes',
  'trust_tier',
  'risk_level',
  'risk_notes',
  'risk_flags',
  'verification_notes',
  'reason_for_inclusion',
  'do_not_contact',
  'opt_out_required',
  'fit_tags',
  'hard_no_tags',
  'recommended_pitch_angle',
  'sample_pitch_note',
  'source_url',
  'source_type',
  'source_retrieved_at',
  'last_verified_at',
  'verified_by',
  'policy_last_checked_at',
  'import_batch_id',
  'review_status',
  'duplicate_key',
  'is_placeholder'
] as const;

export function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === ',' && !quoted) {
      result.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  result.push(current);
  return result.map((item) => item.trim());
}

export function parsePromotionTargetCsv(csvText: string) {
  const lines = csvText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return { rows: [], errors: ['No CSV rows found.'] };
  const headers = parseCsvLine(lines[0]);
  const rows: PromotionTargetImportRow[] = [];
  const errors: string[] = [];

  lines.slice(1).forEach((line, index) => {
    const values = parseCsvLine(line);
    const raw = Object.fromEntries(headers.map((header, headerIndex) => [header, values[headerIndex] || '']));
    const parsed = promotionTargetImportRowSchema.safeParse(raw);
    if (parsed.success) {
      rows.push(parsed.data);
    } else {
      errors.push(`Row ${index + 2}: ${parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`);
    }
  });

  return { rows, errors };
}

export function buildImportBatchSummary(rows: PromotionTargetImportRow[]) {
  const byType = new Map<string, number>();
  const byRisk = new Map<string, number>();
  const byStatus = new Map<string, number>();
  const duplicates = new Set<string>();
  const seen = new Set<string>();

  rows.forEach((row) => {
    byType.set(row.target_type, (byType.get(row.target_type) || 0) + 1);
    byRisk.set(row.risk_level, (byRisk.get(row.risk_level) || 0) + 1);
    byStatus.set(row.review_status, (byStatus.get(row.review_status) || 0) + 1);
    if (seen.has(row.duplicate_key)) duplicates.add(row.duplicate_key);
    seen.add(row.duplicate_key);
  });

  return {
    total: rows.length,
    byType: Object.fromEntries(byType),
    byRisk: Object.fromEntries(byRisk),
    byStatus: Object.fromEntries(byStatus),
    duplicateCount: duplicates.size
  };
}
