import 'server-only';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'session';

// The session is the backend's access token, kept in an httpOnly cookie so
// browser JS can't read it. Cookies can only be changed in Server Actions,
// Route Handlers and the proxy, not in Server Components.
export async function createSession(
  accessToken: string,
  expiresIn: number,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // Expires together with the token: an expired session simply disappears.
    maxAge: expiresIn,
  });
}

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export async function deleteSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
