export const verificationLevels = {
  L1: { label: 'Publicly verified', confidence: 0.95 },
  L2: { label: 'Account-authorized', confidence: 0.92 },
  L3: { label: 'Artist-authorized', confidence: 0.9 },
  L4: { label: 'Professional-authorized', confidence: 0.88 },
  L5: { label: 'Independently reviewed', confidence: 0.8 },
  L6: { label: 'Third-party estimated', confidence: 0.65 },
  L7: { label: 'Self-reported', confidence: 0.5 },
  L8: { label: 'Inferred', confidence: 0.4 },
  L9: { label: 'Unverified', confidence: 0.25 },
  L10: { label: 'Conflicting', confidence: 0.15 },
  L11: { label: 'Stale', confidence: 0.1 }
} as const;

export type VerificationLevel = keyof typeof verificationLevels;

export type ArtistOSRelease = {
  id: string;
  title: string;
  artistName: string;
  releaseDate: string | null;
  status: string;
  isrc: string | null;
  upc: string | null;
  sourceUrl: string | null;
  smartLink: { id: string; slug: string; mode: string; isActive: boolean } | null;
  campaign: { id: string; name: string; status: string } | null;
  evidenceCount: number;
  createdAt: string;
};

export const releaseStages = [
  { key: 'release', label: 'Release', description: 'Canonical metadata and assets' },
  { key: 'link', label: 'Link', description: 'Smart link and fan capture' },
  { key: 'campaign', label: 'Campaign', description: 'Targets, outreach and follow-up' },
  { key: 'proof', label: 'Proof', description: 'Evidence, confidence and freshness' },
  { key: 'fans', label: 'Fans', description: 'Consent-backed audience records' }
] as const;

export const supportedLinkServices = [
  'spotify',
  'apple_music',
  'youtube_music',
  'amazon_music',
  'soundcloud',
  'bandcamp',
  'deezer',
  'tidal'
] as const;

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function createReleaseSlug(artistName: string, title: string) {
  const base = slugify(`${artistName}-${title}`) || 'release';
  return `${base}-${Date.now().toString(36)}`;
}

export function humanize(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}
