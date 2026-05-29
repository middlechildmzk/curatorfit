export type CuratorFitMode = 'public' | 'saas';

export function getCuratorFitMode(): CuratorFitMode {
  return process.env.NEXT_PUBLIC_CURATORFIT_MODE === 'saas' ? 'saas' : 'public';
}

export function isSaasMode() {
  return getCuratorFitMode() === 'saas';
}
