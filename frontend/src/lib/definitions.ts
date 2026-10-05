import * as z from 'zod';

// Login only requires both fields to be filled in; no format or strength rules.
export const LoginFormSchema = z.object({
  email: z
    .string({ error: 'Email is required.' })
    .trim()
    .min(1, { error: 'Email is required.' }),
  password: z
    .string({ error: 'Password is required.' })
    .min(1, { error: 'Password is required.' }),
});

export type LoginFormState =
  | {
      // Echoed back so the form keeps the typed email after a failed attempt.
      email?: string;
      errors?: { email?: string[]; password?: string[] };
      message?: string;
    }
  | undefined;
