import { ProfileEditorClient } from '@/components/profile-editor-client';

export const metadata = { title: 'Profile | CuratorFit' };

export default function ProfilePage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <ProfileEditorClient />
    </main>
  );
}
