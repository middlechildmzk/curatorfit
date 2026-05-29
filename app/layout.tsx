import './globals.css';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'CuratorFit — Honest Music Pitch OS',
  description: 'Find better-fit playlists, avoid fake promotion, track every pitch, and release smarter. Built for independent and AI-assisted artists.',
  metadataBase: new URL('https://curatorfit.vercel.app'),
  openGraph: {
    title: 'CuratorFit — Honest Music Pitch OS',
    description: 'Find better-fit playlists, avoid fake promotion, track every pitch, and release smarter.',
    url: 'https://curatorfit.vercel.app',
    siteName: 'CuratorFit',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CuratorFit — Honest Music Pitch OS',
    description: 'Find better-fit playlists, avoid fake promotion, track every pitch, and release smarter.'
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
