import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';
import DashboardClient from '../verify/DashboardClient';

export default async function DashboardPage() {
  const { isAuthenticated, getUser } = getKindeServerSession();

  if (!(await isAuthenticated())) {
    redirect('/');
  }

  const user = await getUser();

  return <DashboardClient user={user} />;
}
