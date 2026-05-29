import Link from 'next/link';
import { Music2 } from 'lucide-react';
import { AuthStatus } from '@/components/auth-status';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-ink text-white"><Music2 size={18} /></span>
          <span>CuratorFit</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
          <Link href="/browse">Playlists</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/tools">Tools</Link>
          <Link href="/ai-music">AI Music</Link>
          <Link href="/channels">Channels</Link>
          <Link href="/targets">Targets</Link>
          <Link href="/saved">Saved</Link>
          <Link href="/campaigns">Campaigns</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/profile">Profile</Link>
          <Link href="/curators">Curators</Link>
          <Link href="/genres">Genres</Link>
          <Link href="/alternatives">Alternatives</Link>
          <Link href="/submit-target">Suggest target</Link>
          <Link href="/apply">Apply</Link>
          <Link href="/claim">Claim</Link>
        </nav>
        <AuthStatus />
      </div>
    </header>
  );
}
