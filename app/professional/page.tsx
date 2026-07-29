import type { Metadata } from 'next';
import { ProfessionalWorkspace } from '@/components/professional-workspace';

export const metadata: Metadata = {
  title: 'Professional workspace',
  description: 'Manage music properties, availability, ownership claims and review settings.'
};

export default function ProfessionalPage() {
  return <ProfessionalWorkspace />;
}
