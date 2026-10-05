'use client';

import { cn } from 'cn';
import { useActionState } from 'react';
import { login } from '@/app/actions/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

const toFieldErrors = (messages?: string[]) =>
  messages?.map((message) => ({ message }));

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [state, action, pending] = useActionState(login, undefined);
  const emailErrors = state?.errors?.email;
  const passwordErrors = state?.errors?.password;

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Log in to your account</CardTitle>
          <CardDescription>Enter your email and password</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action}>
            <FieldGroup>
              {state?.message && (
                <Alert variant="destructive">
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}
              <Field data-invalid={!!emailErrors}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                {/* Keeps the typed email after a failed attempt. Base UI doesn't allow
                    changing defaultValue after mount, so a new email remounts the input. */}
                <Input
                  key={state?.email ?? ''}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={state?.email ?? ''}
                  aria-invalid={!!emailErrors}
                  required
                />
                <FieldError errors={toFieldErrors(emailErrors)} />
              </Field>
              <Field data-invalid={!!passwordErrors}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={!!passwordErrors}
                  required
                />
                <FieldError errors={toFieldErrors(passwordErrors)} />
              </Field>
              <Field>
                <Button type="submit" disabled={pending}>
                  {pending ? 'Logging in…' : 'Log in'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
