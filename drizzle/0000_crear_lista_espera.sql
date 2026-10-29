CREATE TYPE "public"."region" AS ENUM('LAS', 'LAN', 'EUW');--> statement-breakpoint
CREATE TABLE "waitlist_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"region" "region" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_entries_email_unique" ON "waitlist_entries" USING btree (lower("email"));