import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from './schemas';

const isProduction = process.env.NODE_ENV !== 'development';

export const database: ReturnType<typeof drizzle<typeof schema>> = drizzle({
  connection: {
    host: process.env.DATABASE_HOST!,
    port: parseInt(process.env.DATABASE_PORT!),
    user: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,
    ssl: isProduction
      ? {
        ca: process.env.DATABASE_CA_CERT!,
        checkServerIdentity: () => { return undefined; },
      }
      : false,
  },
  schema,
  logger: true,
});
