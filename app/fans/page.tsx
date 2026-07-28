import type { Metadata } from 'next';
import { FansWorkspace } from '@/components/fans-workspace';

export const metadata: Metadata = {
  title: 'Fans | ArtistOS',
  description: 'Consent-backed first-party fan records attributed to release campaigns and smart links.'
};

export default function FansPage() {
  return <FansWorkspace />;
}
