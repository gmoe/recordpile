ALTER TABLE "pileItems"
  ADD COLUMN "position" text,
  ADD COLUMN "positionUpdatedAt" timestamp,
  ADD COLUMN "statusUpdatedAt" timestamp,
  ADD COLUMN "notesUpdatedAt" timestamp,
  ADD COLUMN "ownedUpdatedAt" timestamp;
