import { pgTable, pgEnum, customType } from 'drizzle-orm/pg-core';

export enum PileItemStatus {
  QUEUED = 'queued',
  FINISHED = 'finished',
  DID_NOT_FINISH = 'dnf',
}

export const PileItemStatusLabels: Record<PileItemStatus, string> = {
  [PileItemStatus.QUEUED]: 'Queued',
  [PileItemStatus.FINISHED]: 'Finished',
  [PileItemStatus.DID_NOT_FINISH]: 'DNF',
};

const bytea = customType<{ data: Buffer; notNull: false; default: false }>({
  dataType() {
    return 'bytea';
  },
});

export const pileItemStatusEnum = pgEnum('status', PileItemStatus);

export const pileItems = pgTable('pileItems', (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  status: pileItemStatusEnum().notNull().default(PileItemStatus.QUEUED),
  artistName: t.text().notNull(),
  albumName: t.text().notNull(),
  owned: t.boolean().notNull().default(false),
  discogsReleaseId: t.varchar({ length: 255 }).unique(),
  musicBrainzReleaseGroupId: t.varchar({ length: 255 }).unique(),
  coverImage: bytea(),
  addedAt: t.timestamp({ mode: 'date' }).defaultNow(),
  finishedAt: t.timestamp({ mode: 'date' }),
  didNotFinishAt: t.timestamp({ mode: 'date' }),
  notes: t.text(),
  position: t.text().notNull().default('a0'),
  positionUpdatedAt: t.timestamp({ mode: 'date' }),
  statusUpdatedAt: t.timestamp({ mode: 'date' }),
  notesUpdatedAt: t.timestamp({ mode: 'date' }),
  ownedUpdatedAt: t.timestamp({ mode: 'date' }),
}));

export type PileItem = typeof pileItems.$inferSelect;
export type PileItemInsert = typeof pileItems.$inferInsert;
