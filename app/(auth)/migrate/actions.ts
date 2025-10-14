'use server';

import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { database } from '@/app/db';

export async function startMigration() {
  await migrate(database, {
    migrationsFolder: 'drizzle',
    migrationsSchema: 'public',
  });
  return true;
}
