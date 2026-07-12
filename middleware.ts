import { NextResponse, type NextRequest } from 'next/server';

const protectedPrefixes = ['/admin'];

export function middleware(request: NextRequest) {
  // ArtistOS is currently a private single-user MVP. Default to SaaS/private mode
  // so the operational dashboard and importer remain reachable unless the
  // deployment explicitly opts back into public-only CuratorFit mode.
  const mode = process.env.NEXT_PUBLIC_CURATORFIT_MODE || 'saas';
  const pathname = request.nextUrl.pathname;

  if (mode !== 'saas' && protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    const url = request.nextUrl.clone();
    url.pathname = '/waitlist';
    url.searchParams.set('reason', 'admin-requires-saas-mode');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
