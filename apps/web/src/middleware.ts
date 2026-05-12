import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/app', '/merchant', '/admin'];

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Better Auth stocke un cookie de session ; M1 implémentera la vérif côté edge.
  const hasSession = req.cookies.has('better-auth.session_token');
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/merchant/:path*', '/admin/:path*'],
};
