import './globals.css';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: {
    default: 'ArtistOS — Release, promote and prove your music',
    template: '%s | ArtistOS'
  },
  description: 'The release operating system for smart links, multi-channel campaigns, CuratorFit targeting, proof records and artist-owned fan data.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://curatorfit.vercel.app'),
  openGraph: {
    title: 'ArtistOS — Release, promote and prove your music',
    description: 'One release workspace connecting links, campaigns, verified promotion evidence and first-party fans.',
    type: 'website',
    siteName: 'ArtistOS'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ArtistOS — Release, promote and prove your music',
    description: 'One release workspace connecting links, campaigns, verified promotion evidence and first-party fans.'
  }
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
