import { resolve } from 'node:path';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { database } from '@/app/db';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV === 'production') {
    console.log('Running migrations');
    console.log(__dirname);
    console.log(resolve(__dirname, 'drizzle'));
    await migrate(database, {
      migrationsFolder: resolve(__dirname, 'drizzle'),
      migrationsSchema: 'public',
    });
  }
}
