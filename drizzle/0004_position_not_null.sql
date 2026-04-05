DROP TRIGGER IF EXISTS pile_item_insert_trigger ON "pileItems";
DROP FUNCTION IF EXISTS set_default_pile_item_order_index();

ALTER TABLE "pileItems"
  ALTER COLUMN "position" SET NOT NULL,
  DROP COLUMN "orderIndex";
