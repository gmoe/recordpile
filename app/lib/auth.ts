import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { typeormAdapter } from '@hedystia/better-auth-typeorm';

import dataSource from '@/app/db/dataSource';
import { dbSource } from '@/app/db';

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: typeormAdapter(dataSource),
  plugins: [nextCookies()],
});

export const getSessionOrRedirect = async () => {
  'use server';
  await dbSource();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  return session;
}

export default auth;
