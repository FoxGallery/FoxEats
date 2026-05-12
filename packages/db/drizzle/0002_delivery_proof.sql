-- M5 — colonnes preuve de remise sur orders

ALTER TABLE orders ADD COLUMN IF NOT EXISTS leave_at_door boolean NOT NULL DEFAULT false;
--> statement-breakpoint
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_proof_photo_url text;
--> statement-breakpoint
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_proof_signature_url text;
--> statement-breakpoint
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_proof_recorded_at timestamp with time zone;
