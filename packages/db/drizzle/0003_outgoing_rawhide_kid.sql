CREATE TYPE "public"."notif_kind" AS ENUM('order_placed', 'order_accepted', 'order_preparing', 'order_ready', 'order_in_delivery', 'order_delivered', 'order_cancelled', 'order_refunded', 'promo_available', 'review_request', 'system');--> statement-breakpoint
CREATE TABLE "notif_prefs" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"email_order_updates" boolean DEFAULT true NOT NULL,
	"email_promotions" boolean DEFAULT true NOT NULL,
	"email_newsletter" boolean DEFAULT false NOT NULL,
	"push_order_updates" boolean DEFAULT true NOT NULL,
	"push_promotions" boolean DEFAULT false NOT NULL,
	"system_transactional" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" "notif_kind" NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"href" text,
	"data" jsonb,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "leave_at_door" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_proof_photo_url" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_proof_signature_url" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_proof_recorded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notif_prefs" ADD CONSTRAINT "notif_prefs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notif_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notif_user_read_idx" ON "notifications" USING btree ("user_id","read_at");--> statement-breakpoint
CREATE INDEX "notif_user_created_idx" ON "notifications" USING btree ("user_id","created_at");