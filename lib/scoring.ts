import type { Playlist } from '@/data/seed';

export function scoreLabel(score: number) {
  if (score >= 80) return 'Strong trust';
  if (score >= 65) return 'Good candidate';
  if (score >= 50) return 'Needs review';
  return 'Avoid for now';
}

export function estimateFit(playlist: Playlist, artistTags: string[]) {
  const normalized = artistTags.map((tag) => tag.toLowerCase().trim());
  const overlaps = playlist.fitTags.filter((tag) => normalized.includes(tag.toLowerCase()));
  const base = overlaps.length * 18;
  const trustBoost = Math.round(playlist.trustScore * 0.35);
  const riskPenalty = playlist.riskLevel === 'Low' ? 0 : playlist.riskLevel === 'Medium' ? 8 : 14;
  const score = Math.max(0, Math.min(100, base + trustBoost - riskPenalty));
  return { score, overlaps };
}
