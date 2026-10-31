ALTER TABLE "riot_accounts" ADD COLUMN "challenge_icon_id" integer;--> statement-breakpoint
ALTER TABLE "riot_accounts" ADD COLUMN "challenge_set_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "riot_accounts" ADD COLUMN "last_check_at" timestamp with time zone;