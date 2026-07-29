import type { Metadata } from 'next';
import { ConnectionsWorkspace } from '@/components/connections-workspace';

export const metadata: Metadata = {
  title: 'Platform connections',
  description: 'Connect music and social profiles and prepare authorized analytics integrations.'
};

export default function ConnectionsPage() {
  return <ConnectionsWorkspace />;
}
