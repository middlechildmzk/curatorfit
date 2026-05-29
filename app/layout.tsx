import './globals.css';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'CuratorFit — Honest playlist pitching OS',
  description: 'Find playlists your song actually fits. Track pitches, avoid risky curators, and get real feedback without guaranteed placement hype.',
  metadataBase: new URL('https://curatorfit.com')
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
