CREATE TYPE "public"."support_sender" AS ENUM('customer', 'agent', 'system');--> statement-breakpoint
CREATE TYPE "public"."support_thread_status" AS ENUM('open', 'pending', 'resolved', 'closed');--> statement-breakpoint
CREATE TABLE "support_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" uuid NOT NULL,
	"sender_type" "support_sender" NOT NULL,
	"sender_user_id" uuid,
	"body" text NOT NULL,
	"meta" jsonb,
	"read_by_customer_at" timestamp with time zone,
	"read_by_agent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"order_id" uuid,
	"subject" text NOT NULL,
	"status" "support_thread_status" DEFAULT 'open' NOT NULL,
	"assigned_agent_id" uuid,
	"last_message_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_thread_id_support_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."support_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_sender_user_id_users_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_threads" ADD CONSTRAINT "support_threads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_threads" ADD CONSTRAINT "support_threads_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_threads" ADD CONSTRAINT "support_threads_assigned_agent_id_users_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "support_msg_thread_idx" ON "support_messages" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "support_msg_created_idx" ON "support_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "support_user_idx" ON "support_threads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "support_status_idx" ON "support_threads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "support_last_msg_idx" ON "support_threads" USING btree ("last_message_at");