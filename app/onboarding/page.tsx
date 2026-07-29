import type { Metadata } from 'next';
import { OnboardingWorkspace } from '@/components/onboarding-workspace';

export const metadata: Metadata = {
  title: 'Set up your account',
  description: 'Create an artist, professional or hybrid ArtistOS workspace.'
};

export default function OnboardingPage() {
  return <OnboardingWorkspace />;
}
