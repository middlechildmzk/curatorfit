import { NextResponse, type NextRequest } from 'next/server';

const protectedPrefixes = ['/admin'];

export function middleware(request: NextRequest) {
  const mode = process.env.NEXT_PUBLIC_CURATORFIT_MODE || 'public';
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
  matcher: ['/admin/:path*']
};
