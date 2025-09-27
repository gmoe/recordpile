import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { database } from '@/app/db';
import { user } from '@/app/db/schemas/user';
import { account } from '@/app/db/schemas/account';
import { verification } from '@/app/db/schemas/verification';
import { session } from '@/app/db/schemas/session';

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(database, {
    provider: 'pg',
    schema: {
      user,
      account,
      verification,
      session,
    },
  }),
  plugins: [nextCookies()],
});

export const getSessionOrRedirect = async () => {
  'use server';
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  return session;
}

export default auth;
