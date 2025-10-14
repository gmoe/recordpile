'use server';

import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { database } from '@/app/db';

export default async function Migrate() {
  await migrate(database, {
    migrationsFolder: 'drizzle',
    migrationsSchema: 'public',
  });

  return (
    <div>
      Next.js? Trash. DigitalOcean? Getting on my nerves.
    </div>
  );
}
