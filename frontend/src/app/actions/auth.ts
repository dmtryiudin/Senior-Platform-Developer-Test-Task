'use server';

import { redirect } from 'next/navigation';
import * as z from 'zod';
import { ApiError, apiFetch } from '@/lib/api';
import { LoginFormSchema, type LoginFormState } from '@/lib/definitions';
import { createSession, deleteSession } from '@/lib/session';

type LoginResponse = { accessToken: string; expiresIn: number };

export async function login(
  _state: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const fields = {
    email: formData.get('email'),
    password: formData.get('password'),
  };
  const email = typeof fields.email === 'string' ? fields.email : '';

  const result = LoginFormSchema.safeParse(fields);
  if (!result.success) {
    return { email, errors: z.flattenError(result.error).fieldErrors };
  }

  // Runs on the Next server, so this goes to the backend over the Docker network.
  let session: LoginResponse;
  try {
    session = await apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.data),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { email, message: 'Invalid email or password.' };
    }
    return { email, message: 'Something went wrong. Please try again.' };
  }

  await createSession(session.accessToken, session.expiresIn);
  redirect('/');
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect('/login');
}
