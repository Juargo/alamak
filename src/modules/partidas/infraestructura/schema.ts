import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { regionEnum } from "@/modules/captacion/infraestructura/schema";
import { user } from "@/modules/cuentas/infraestructura/schema";
import { RANKED_QUEUES, ROLES } from "../dominio/match";

export const rankedQueueEnum = pgEnum(
  "ranked_queue",
  Object.keys(RANKED_QUEUES) as ["solo", "flex"],
);
export const roleEnum = pgEnum("role", ROLES);
export const matchResultEnum = pgEnum("match_result", ["win", "loss"]);

/**
 * The Riot account a player linked (DI-02): one per player (C-14). It counts as theirs only
 * once `verified_at` is set (#26), so the same Riot account may be claimed by several
 * players until one of them proves it.
 */
export const riotAccounts = pgTable(
  "riot_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    puuid: text("puuid").notNull(),
    gameName: text("game_name").notNull(),
    tagLine: text("tag_line").notNull(),
    region: regionEnum("region").notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("riot_accounts_verified_puuid_unique")
      .on(table.puuid)
      .where(sql`${table.verifiedAt} is not null`),
  ],
);

/**
 * Ranked games imported from Riot (DI-17): stored once so Riot is not asked twice, never
 * edited by hand (DI-31) and never deleted on their own (DI-32), only with the account.
 */
export const riotMatches = pgTable(
  "riot_matches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    riotAccountId: uuid("riot_account_id")
      .notNull()
      .references(() => riotAccounts.id, { onDelete: "cascade" }),
    matchId: text("match_id").notNull(),
    queue: rankedQueueEnum("queue").notNull(),
    result: matchResultEnum("result").notNull(),
    isRemake: boolean("is_remake").notNull(),
    championId: integer("champion_id").notNull(),
    championName: text("champion_name").notNull(),
    role: roleEnum("role"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("riot_matches_account_match_unique").on(table.riotAccountId, table.matchId),
    index("riot_matches_user_started_idx").on(table.userId, table.startedAt),
  ],
);
