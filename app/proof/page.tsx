import type { Metadata } from 'next';
import { ProofWorkspace } from '@/components/proof-workspace';

export const metadata: Metadata = {
  title: 'Proof Ledger | ArtistOS',
  description: 'Record and review evidence with transparent verification levels, confidence and freshness.'
};

export default function ProofPage() {
  return <ProofWorkspace />;
}
