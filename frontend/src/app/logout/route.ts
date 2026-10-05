import { redirect } from 'next/navigation';
import { deleteSession } from '@/lib/session';

// Where the DAL sends the user when the backend rejects their token: Server
// Components can't delete cookies, Route Handlers can.
export async function GET(): Promise<never> {
  await deleteSession();
  redirect('/login');
}
