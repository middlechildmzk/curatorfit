export const TRUST_TIERS = [
  'seed',
  'candidate',
  'manually_reviewed',
  'verified_candidate',
  'claimed',
  'blocked'
] as const;

export type TargetTrustTier = typeof TRUST_TIERS[number];

export const REVIEW_STATUSES = [
  'new_import',
  'needs_review',
  'in_review',
  'approved_candidate',
  'manually_reviewed',
  'needs_owner_claim',
  'blocked',
  'duplicate',
  'opted_out'
] as const;

export type TargetReviewStatus = typeof REVIEW_STATUSES[number];

export const RISK_LEVELS = ['low', 'medium', 'review', 'high'] as const;
export type TargetRiskLevel = typeof RISK_LEVELS[number];

export const AI_POLICIES = ['yes', 'partial', 'unclear', 'not_mentioned', 'no'] as const;
export type TargetAiPolicy = typeof AI_POLICIES[number];

export const TARGET_TYPES = [
  'spotify_playlist',
  'soundcloud_channel',
  'youtube_channel',
  'tiktok_creator',
  'instagram_creator',
  'blog',
  'newsletter',
  'radio',
  'label',
  'sync_library',
  'community',
  'other'
] as const;

export type TargetType = typeof TARGET_TYPES[number];

export const RISK_FLAGS = [
  'guaranteed_placement_language',
  'guaranteed_streams_language',
  'pay_for_slot_language',
  'bot_or_fake_stream_claims',
  'broken_submission_url',
  'stale_activity',
  'unclear_rights_terms',
  'exclusive_sync_terms',
  'ai_policy_rejects_ai',
  'ai_policy_unclear',
  'direct_dm_only',
  'weak_identity',
  'follower_engagement_mismatch',
  'missing_owner_info',
  'unverifiable_audience_size',
  'category_placeholder'
] as const;

export type TargetRiskFlag = typeof RISK_FLAGS[number];

export const TRUST_TIER_DESCRIPTIONS: Record<TargetTrustTier, string> = {
  seed: 'Discovered lead, not manually reviewed yet.',
  candidate: 'Public page or public submission route found, still needs human review.',
  manually_reviewed: 'Reviewed by CuratorFit admin or trusted researcher.',
  verified_candidate: 'Live submission path verified, safe language checked, no obvious payola or bot red flags.',
  claimed: 'Owner or curator claimed and can manage the profile.',
  blocked: 'Do not show as a normal target because of opt-out, fake stream claims, payola language, legal risk, or other safety issue.'
};

export const REVIEW_STATUS_DESCRIPTIONS: Record<TargetReviewStatus, string> = {
  new_import: 'Freshly imported from research data.',
  needs_review: 'Needs a human to check links, policy, fit tags, and safety language.',
  in_review: 'Currently being reviewed by an admin or researcher.',
  approved_candidate: 'Approved for candidate-level display, not verified.',
  manually_reviewed: 'Human-reviewed and ready to be used in matching with caution notes.',
  needs_owner_claim: 'Useful target, but the owner should claim or confirm profile details.',
  blocked: 'Excluded from recommendations.',
  duplicate: 'Likely duplicate of another target.',
  opted_out: 'Target owner opted out or asked not to be listed.'
};

export const REVIEW_TRANSITIONS: Record<TargetReviewStatus, TargetReviewStatus[]> = {
  new_import: ['needs_review', 'duplicate', 'blocked'],
  needs_review: ['in_review', 'approved_candidate', 'blocked', 'duplicate'],
  in_review: ['approved_candidate', 'manually_reviewed', 'needs_owner_claim', 'blocked', 'duplicate'],
  approved_candidate: ['manually_reviewed', 'needs_owner_claim', 'blocked'],
  manually_reviewed: ['verified_candidate' as TargetReviewStatus, 'needs_owner_claim', 'blocked'].filter(Boolean) as TargetReviewStatus[],
  needs_owner_claim: ['manually_reviewed', 'blocked', 'opted_out'],
  blocked: ['needs_review'],
  duplicate: ['needs_review'],
  opted_out: []
};

export function normalizeDuplicateKey(input: { target_name?: string; platform?: string; primary_url?: string; submission_url?: string }) {
  const url = input.primary_url || input.submission_url || '';
  return [input.target_name, input.platform, url]
    .filter(Boolean)
    .join('|')
    .toLowerCase()
    .replace(/https?:\/\/(www\.)?/g, '')
    .replace(/[^a-z0-9|]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}
