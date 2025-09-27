CREATE OR REPLACE FUNCTION set_default_pile_item_order_index()
  RETURNS TRIGGER AS $$
  DECLARE
    max_index INTEGER;
  BEGIN
    SELECT MAX("orderIndex") into max_index from "pileItems";
    NEW."orderIndex" = COALESCE(max_index, 0) + 1;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

CREATE TRIGGER pile_item_insert_trigger
  BEFORE INSERT ON "pileItems"
  FOR EACH ROW
  EXECUTE FUNCTION set_default_pile_item_order_index();

CREATE OR REPLACE FUNCTION update_pile_item_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'queued' AND NEW.status = 'finished' THEN
    NEW."finishedAt" = NOW();
  ELSIF OLD.status = 'queued' AND NEW.status = 'dnf' THEN
    NEW."didNotFinishAt" = NOW();
  ELSIF OLD.status = 'finished' AND NEW.status = 'queued' THEN
    NEW."finishedAt" = NULL;
  ELSIF OLD.status = 'dnf' AND NEW.status = 'queued' THEN
    NEW."didNotFinishAt" = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pile_item_update_timestamp_trigger
  BEFORE UPDATE ON "pileItems"
  FOR EACH ROW
  EXECUTE FUNCTION update_pile_item_timestamps();
