import type { Metadata } from 'next';
import { CampaignCommandCenter } from '@/components/campaign-command-center';
import { getPromotionTargets } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Campaign Command Center | ArtistOS',
  description: 'Build and manage multi-channel release campaigns from the verified CuratorFit network.'
};

export default async function CampaignsPage() {
  const targets = await getPromotionTargets();
  return (
    <CampaignCommandCenter
      directoryTargets={targets.map((target) => ({
        slug: target.slug,
        name: target.name,
        channelLabel: target.channelLabel,
        owner: target.owner,
        trustScore: target.trustScore,
        status: target.status,
        genres: target.genres
      }))}
    />
  );
}
