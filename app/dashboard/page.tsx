import { redirect } from 'next/navigation';

export const metadata = { title: 'Dashboard | CuratorFit' };

export default function DashboardPage() {
  redirect('/campaigns');
}
