import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { betterAuth } from 'better-auth';
import { typeormAdapter } from '@hedystia/better-auth-typeorm';

import dataSource from '@/app/db/dataSource';

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: typeormAdapter(dataSource),
});

export const getSessionOrRedirect = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  return session;
}

export default auth;
