import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schemas';

const isProduction = process.env.NODE_ENV !== 'development';

export const database: ReturnType<typeof drizzle<typeof schema>> = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL!,
    ssl: isProduction
      ? { ca: process.env.DATABASE_CA_CERT! }
      : false,
  },
  schema,
});
