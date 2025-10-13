import { readFileSync } from 'node:fs';
import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from './schemas';

const isProduction = process.env.NODE_ENV !== 'development';

export const database: ReturnType<typeof drizzle<typeof schema>> = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL!,
    ssl: isProduction
      ? { ca: readFileSync(process.env.DATABASE_CA_CERT!).toString() }
      : false,
  },
  schema,
});
