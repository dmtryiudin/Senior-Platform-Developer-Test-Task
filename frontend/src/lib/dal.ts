import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { ApiError, apiFetch } from '@/lib/api';
import { getSessionToken } from '@/lib/session';

// Data Access Layer: the only place that reads the session and calls protected
// backend endpoints. Use it from Server Components and Server Actions; client
// components can't call protected endpoints (the token is in an httpOnly cookie).

export type User = { id: string; email: string };

export const verifySession = cache(async (): Promise<{ token: string }> => {
  const token = await getSessionToken();
  if (!token) {
    redirect('/login');
  }
  return { token };
});

// Calls a protected backend endpoint with the session's token. A 401 means the
// token expired or is invalid, so the user is logged out and has to log in again.
export async function authFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const { token } = await verifySession();
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token}`);

  try {
    return await apiFetch<T>(path, { ...init, headers });
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 401)) {
      throw error;
    }
  }
  // Outside the try/catch: redirect() works by throwing.
  redirect('/logout');
}

export const getCurrentUser = cache(() => authFetch<User>('/api/auth/me'));
