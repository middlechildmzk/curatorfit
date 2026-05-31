import { ResearchCommandCenter } from '@/components/admin/research-command-center';

export const metadata = {
  title: 'Research Command Center | CuratorFit',
  description: 'Industrial A&R command center for CuratorFit research batches, trust tiers, risk flags, and target growth tracking.'
};

export default function AdminResearchPage() {
  return <ResearchCommandCenter />;
}
