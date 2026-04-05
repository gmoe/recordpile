import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const isProduction = process.env.NODE_ENV !== 'development';

const pool = new pg.Pool({
  host: process.env.DATABASE_HOST!,
  port: parseInt(process.env.DATABASE_PORT!),
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE_NAME!,
  ssl: isProduction
    ? {
        ca: process.env.DATABASE_CA_CERT!,
        checkServerIdentity: () => undefined,
      }
    : false,
});

const db = drizzle(pool);

console.log('Running migrations...');
await migrate(db, { migrationsFolder: './drizzle' });
console.log('Migrations complete.');

await pool.end();
