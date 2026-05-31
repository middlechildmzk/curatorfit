import type { PromotionTarget } from '@/data/seed';

export type SongProfile = {
  genre: string;
  subgenres: string[];
  moods: string[];
  energyLevel: string;
  vocalType: string;
  explicit: boolean;
  aiAssisted: boolean;
  artistStage: string;
  goal: string;
};

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function overlapScore(source: string[], target: string[]) {
  if (!source.length || !target.length) return 0;
  const sourceSet = new Set(source.map(normalize));
  const targetSet = new Set(target.map(normalize));
  let matches = 0;
  sourceSet.forEach((item) => {
    if (targetSet.has(item)) matches += 1;
    targetSet.forEach((targetItem) => {
      if (targetItem.includes(item) || item.includes(targetItem)) matches += 0.5;
    });
  });
  return Math.min(100, Math.round((matches / Math.max(sourceSet.size, 1)) * 100));
}

function scoreTrust(target: PromotionTarget) {
  if (target.status === 'blocked' || target.riskLevel === 'high') return 0;
  const tierScore: Record<string, number> = {
    claimed: 100,
    manually_reviewed: 95,
    verified: 90,
    partner: 90,
    verified_candidate: 82,
    candidate: 65,
    seed: 45,
    blocked: 0
  };
  const riskPenalty: Record<string, number> = { low: 0, medium: 15, review: 25, high: 100 };
  return Math.max(0, Math.min(100, (tierScore[target.status] ?? 50) - (riskPenalty[target.riskLevel || 'review'] ?? 20)));
}

function scoreSubmission(target: PromotionTarget) {
  const methodScore: Record<string, number> = {
    'direct form': 100,
    'platform submission': 90,
    'SubmitHub/Groover/etc.': 85,
    email: 70,
    DM: 55,
    'invite only': 10,
    unknown: 25
  };
  return methodScore[target.submissionMethod || 'unknown'] ?? 25;
}

function scoreAiPolicy(song: SongProfile, target: PromotionTarget) {
  if (!song.aiAssisted) return 100;
  const policy = target.allowsAiAssistedMusic || 'not_mentioned';
  if (policy === 'yes') return 100;
  if (policy === 'partial') return 80;
  if (policy === 'unclear' || policy === 'not_mentioned') return 55;
  return 0;
}

function scoreResponse(target: PromotionTarget) {
  const responseScore: Record<string, number> = {
    'likely responds': 100,
    'may respond': 55,
    'no response expected': 15,
    unknown: 30
  };
  return responseScore[target.responseExpectation || 'unknown'] ?? 30;
}

function scoreStage(song: SongProfile, target: PromotionTarget) {
  if (!target.bestFitArtistStage || target.bestFitArtistStage === 'unknown') return 70;
  if (target.bestFitArtistStage === song.artistStage) return 100;
  if (song.artistStage === 'brand new' && target.bestFitArtistStage === 'emerging') return 80;
  if (song.artistStage === 'emerging' && target.bestFitArtistStage === 'brand new') return 75;
  return 55;
}

function scoreChannel(song: SongProfile, target: PromotionTarget) {
  const goal = normalize(song.goal);
  if (goal.includes('playlist') && target.type === 'spotify_playlist') return 100;
  if (goal.includes('youtube') && target.type === 'youtube_channel') return 100;
  if (goal.includes('blog') && (target.type === 'blog' || target.type === 'newsletter')) return 100;
  if (goal.includes('radio') && target.type === 'radio') return 100;
  if (goal.includes('sync') && target.type === 'sync_library') return 100;
  if (goal.includes('creator') && (target.type === 'tiktok_creator' || target.type === 'instagram_creator')) return 100;
  if (goal.includes('all') || goal.includes('multi')) return 85;
  return 70;
}

export function scoreTargetMatch(song: SongProfile, target: PromotionTarget) {
  const genreScore = Math.max(
    overlapScore([song.genre, ...song.subgenres], [...target.genres, ...(target.subgenres || []), ...(target.fitTags || [])]),
    overlapScore(song.subgenres, target.fitTags || [])
  );
  const moodScore = Math.round((overlapScore(song.moods, target.moods) * 0.7) + ((song.energyLevel && target.energyLevel === song.energyLevel) ? 30 : 0));
  const channelScore = scoreChannel(song, target);
  const trustScore = scoreTrust(target);
  const submitScore = scoreSubmission(target);
  const aiScore = scoreAiPolicy(song, target);
  const responseScore = scoreResponse(target);
  const stageScore = scoreStage(song, target);

  const total = Math.round(
    genreScore * 0.25 +
    moodScore * 0.20 +
    channelScore * 0.15 +
    trustScore * 0.15 +
    submitScore * 0.10 +
    aiScore * 0.05 +
    responseScore * 0.05 +
    stageScore * 0.05
  );

  const warnings: string[] = [];
  if (target.status === 'blocked' || target.riskLevel === 'high') warnings.push('High-risk or blocked target. Avoid pitching.');
  if (song.aiAssisted && target.allowsAiAssistedMusic === 'no') warnings.push('AI-assisted track conflict. This target appears to reject AI-assisted music.');
  if (target.riskLevel === 'medium' || target.riskLevel === 'review') warnings.push('Needs manual review before serious outreach.');
  if (target.freeOrPaid === 'paid review') warnings.push('Paid review only. Do not treat this as paid placement.');

  const reasons = [
    genreScore >= 60 ? 'Genre/subgenre alignment is strong.' : 'Genre fit needs manual judgment.',
    moodScore >= 60 ? 'Mood and energy appear aligned.' : 'Mood/energy may be weaker.',
    trustScore >= 70 ? 'Trust/risk profile is acceptable for discovery.' : 'Trust level is still early-stage or needs review.',
    aiScore >= 80 ? 'AI policy appears compatible.' : song.aiAssisted ? 'AI policy requires caution.' : 'AI policy is not a major issue for this song.'
  ];

  return { total, genreScore, moodScore, channelScore, trustScore, submitScore, aiScore, responseScore, stageScore, warnings, reasons };
}
