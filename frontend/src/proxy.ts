import { type NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/session';

// Optimistic check only: is there a session cookie? The DAL verifies the token
// with the backend. The cookie expires together with the token, so an expired
// session lands here without one.
export default function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isLoginPage = request.nextUrl.pathname === '/login';

  if (!hasSession && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }
  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
