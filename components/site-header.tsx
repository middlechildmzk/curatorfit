import Link from 'next/link';
import { Music2 } from 'lucide-react';
import { AuthStatus } from '@/components/auth-status';

const primaryLinks = [
  { href: '/targets', label: 'Targets' },
  { href: '/match', label: 'Match' },
  { href: '/tools', label: 'Tools' },
  { href: '/blog', label: 'Blog' },
  { href: '/ai-music', label: 'AI Music' },
  { href: '/genres', label: 'Genres' },
  { href: '/pricing', label: 'Pricing' }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-black tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-ink text-white"><Music2 size={18} /></span>
          <span>CuratorFit</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-semibold text-slate-600 lg:flex">
          {primaryLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/waitlist" className="btn-secondary hidden sm:inline-flex">Join beta</Link>
          <Link href="/match" className="btn-primary hidden sm:inline-flex">Match song</Link>
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}
