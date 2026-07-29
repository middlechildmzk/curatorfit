import type { Metadata } from 'next';
import { ProfessionalInbox } from '@/components/professional-inbox';

export const metadata: Metadata = {
  title: 'Professional inbox',
  description: 'Review AI-matched music submissions, provide feedback and propose disclosed promotional deliverables.'
};

export default function InboxPage() {
  return <ProfessionalInbox />;
}
