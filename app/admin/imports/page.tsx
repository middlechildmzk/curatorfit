import { ImportsClient } from '@/components/admin/imports-client';

export const metadata = {
  title: 'Admin Imports | CuratorFit',
  description: 'Mock import console for validating CuratorFit target CSV batches before review.'
};

export default function AdminImportsPage() {
  return <ImportsClient />;
}
