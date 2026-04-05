import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { generateNKeysBetween } from 'fractional-indexing';
import { asc, isNull, sql } from 'drizzle-orm';

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

// Find items without a position, ordered by their legacy orderIndex
const rows = await db.execute(
  sql`SELECT id FROM "pileItems" WHERE position IS NULL ORDER BY "orderIndex" ASC NULLS LAST`
);

const items = rows.rows as { id: string }[];

if (items.length === 0) {
  console.log('Position backfill: nothing to do.');
  await pool.end();
  process.exit(0);
}

console.log(`Position backfill: generating keys for ${items.length} items...`);

const keys = generateNKeysBetween(null, null, items.length);

for (let i = 0; i < items.length; i++) {
  await db.execute(
    sql`UPDATE "pileItems" SET position = ${keys[i]} WHERE id = ${items[i].id}`
  );
}

console.log(`Position backfill: done.`);

await pool.end();
