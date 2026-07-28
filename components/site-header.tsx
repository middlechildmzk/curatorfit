import Link from 'next/link';
import { Disc3 } from 'lucide-react';
import { AuthStatus } from '@/components/auth-status';

const primaryLinks = [
  { href: '/dashboard', label: 'Releases' },
  { href: '/campaigns', label: 'Campaigns' },
  { href: '/targets', label: 'CuratorFit Network' },
  { href: '/proof', label: 'Proof' },
  { href: '/fans', label: 'Fans' },
  { href: '/tools', label: 'Tools' }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5">
        <Link href="/" className="flex shrink-0 items-center gap-3 font-black tracking-tight">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-black text-[#c8ff00]"><Disc3 size={19} /></span>
          <span className="leading-none">
            <span className="block text-base">ArtistOS</span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Release operating system</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-semibold text-slate-600 xl:flex">
          {primaryLinks.map((link) => <Link className="transition hover:text-black" key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="hidden rounded-full bg-[#c8ff00] px-4 py-2.5 text-sm font-black text-black transition hover:bg-[#d7ff3b] sm:inline-flex">New release</Link>
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}
