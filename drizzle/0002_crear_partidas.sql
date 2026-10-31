CREATE TYPE "public"."match_result" AS ENUM('win', 'loss');--> statement-breakpoint
CREATE TYPE "public"."ranked_queue" AS ENUM('solo', 'flex');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY');--> statement-breakpoint
CREATE TABLE "riot_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"puuid" text NOT NULL,
	"game_name" text NOT NULL,
	"tag_line" text NOT NULL,
	"region" "region" NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "riot_accounts_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "riot_matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"riot_account_id" uuid NOT NULL,
	"match_id" text NOT NULL,
	"queue" "ranked_queue" NOT NULL,
	"result" "match_result" NOT NULL,
	"is_remake" boolean NOT NULL,
	"champion_id" integer NOT NULL,
	"champion_name" text NOT NULL,
	"role" "role",
	"started_at" timestamp with time zone NOT NULL,
	"duration_seconds" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "riot_accounts" ADD CONSTRAINT "riot_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riot_matches" ADD CONSTRAINT "riot_matches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riot_matches" ADD CONSTRAINT "riot_matches_riot_account_id_riot_accounts_id_fk" FOREIGN KEY ("riot_account_id") REFERENCES "public"."riot_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "riot_accounts_verified_puuid_unique" ON "riot_accounts" USING btree ("puuid") WHERE "riot_accounts"."verified_at" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "riot_matches_account_match_unique" ON "riot_matches" USING btree ("riot_account_id","match_id");--> statement-breakpoint
CREATE INDEX "riot_matches_user_started_idx" ON "riot_matches" USING btree ("user_id","started_at");