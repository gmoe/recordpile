import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { database } from '@/app/db';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV === 'production') {
    await migrate(database, {
      migrationsFolder: 'drizzle',
      migrationsSchema: 'public',
    });
  }
}
