import type { Metadata } from 'next';
import { ReleaseCommandCenter } from '@/components/release-command-center';

export const metadata: Metadata = {
  title: 'Release Command Center | ArtistOS',
  description: 'Create a release, fan link, multi-channel campaign and proof-ready workspace in ArtistOS.'
};

export default function DashboardPage() {
  return <ReleaseCommandCenter />;
}
