-- M2 — full-text search & geo indexes
-- pg_trgm for fuzzy ILIKE on names; expression GIN indexes for FTS.

CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS unaccent;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS restaurants_name_trgm_idx
  ON restaurants USING gin (lower(name) gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS restaurants_city_trgm_idx
  ON restaurants USING gin (lower(city) gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS menu_items_name_trgm_idx
  ON menu_items USING gin (lower(name) gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS restaurants_lat_idx ON restaurants ((lat::double precision));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS restaurants_lng_idx ON restaurants ((lng::double precision));
