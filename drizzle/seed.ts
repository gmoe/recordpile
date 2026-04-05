import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { generateNKeysBetween } from 'fractional-indexing';
import { pileItems, PileItemStatus } from '../app/db/schemas/pileItems';

const pool = new pg.Pool({
  host: process.env.DATABASE_HOST!,
  port: parseInt(process.env.DATABASE_PORT!),
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE_NAME!,
  ssl: false,
});

const db = drizzle(pool);

const seeds = [
  { artistName: 'Aphex Twin', albumName: 'Selected Ambient Works 85-92', status: PileItemStatus.FINISHED, owned: true },
  { artistName: 'Talk Talk', albumName: 'Spirit of Eden', status: PileItemStatus.FINISHED, owned: true },
  { artistName: 'Grouper', albumName: 'Dragging a Dead Deer Up a Hill', status: PileItemStatus.QUEUED, owned: false },
  { artistName: 'Arthur Russell', albumName: 'World of Echo', status: PileItemStatus.QUEUED, owned: true },
  { artistName: 'The Microphones', albumName: 'The Glow Pt. 2', status: PileItemStatus.DID_NOT_FINISH, owned: false },
  { artistName: 'Burial', albumName: 'Untrue', status: PileItemStatus.FINISHED, owned: true },
  { artistName: 'Four Tet', albumName: 'Rounds', status: PileItemStatus.QUEUED, owned: false },
  { artistName: 'William Basinski', albumName: 'Disintegration Loops', status: PileItemStatus.QUEUED, owned: false },
];

const positions = generateNKeysBetween(null, null, seeds.length);

const rows = seeds.map((seed, i) => ({
  ...seed,
  position: positions[i],
  addedAt: new Date(),
  ...(seed.status === PileItemStatus.FINISHED ? { finishedAt: new Date() } : {}),
  ...(seed.status === PileItemStatus.DID_NOT_FINISH ? { didNotFinishAt: new Date() } : {}),
}));

console.log(`Seeding ${rows.length} pile items...`);
await db.insert(pileItems).values(rows);
console.log('Seed complete.');

await pool.end();
