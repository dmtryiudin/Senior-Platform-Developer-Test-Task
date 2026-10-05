import { logout } from '@/app/actions/auth';
import { HealthStatus } from '@/components/health-status';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/dal';

export default async function Home() {
  // Verifies the session with the backend; redirects to /login if it's gone or invalid.
  const user = await getCurrentUser();

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Test Task</h1>
        <form action={logout}>
          <Button type="submit" variant="outline">
            Log out
          </Button>
        </form>
      </div>
      <p>
        Signed in as <span className="font-medium">{user.email}</span>
      </p>
      <HealthStatus />
    </main>
  );
}
