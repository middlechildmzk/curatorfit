import { AdminClient } from '@/components/admin-client';

export const metadata = { title: 'Admin | CuratorFit' };

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <AdminClient />
    </main>
  );
}
