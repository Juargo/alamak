import "server-only";
import { and, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type {
  LinkedAccount,
  MatchRepository,
  RiotAccountRepository,
} from "../aplicacion/repositories";
import { riotAccounts, riotMatches } from "./schema";

function toLinkedAccount(row: typeof riotAccounts.$inferSelect): LinkedAccount {
  return {
    id: row.id,
    puuid: row.puuid,
    gameName: row.gameName,
    tagLine: row.tagLine,
    region: row.region,
    verified: row.verifiedAt !== null,
  };
}

export function postgresRiotAccountRepository(db: NodePgDatabase): RiotAccountRepository {
  return {
    async findByUser(userId) {
      const [row] = await db.select().from(riotAccounts).where(eq(riotAccounts.userId, userId));
      return row ? toLinkedAccount(row) : null;
    },

    async link(userId, account) {
      // The unique user_id makes a second link a no-op, even under concurrent requests.
      const [row] = await db
        .insert(riotAccounts)
        .values({ userId, ...account })
        .onConflictDoNothing({ target: riotAccounts.userId })
        .returning();
      return row
        ? { status: "linked", account: toLinkedAccount(row) }
        : { status: "already-linked" };
    },
  };
}

export function postgresMatchRepository(db: NodePgDatabase): MatchRepository {
  return {
    async storedMatchIds(userId, riotAccountId) {
      const rows = await db
        .select({ matchId: riotMatches.matchId })
        .from(riotMatches)
        .where(and(eq(riotMatches.userId, userId), eq(riotMatches.riotAccountId, riotAccountId)));
      return new Set(rows.map((row) => row.matchId));
    },

    async save(userId, riotAccountId, matches) {
      if (matches.length === 0) return 0;
      // The account must belong to this player; otherwise nothing is stored.
      const [owned] = await db
        .select({ id: riotAccounts.id })
        .from(riotAccounts)
        .where(and(eq(riotAccounts.id, riotAccountId), eq(riotAccounts.userId, userId)));
      if (!owned) return 0;
      const inserted = await db
        .insert(riotMatches)
        .values(matches.map((match) => ({ userId, riotAccountId, ...match })))
        .onConflictDoNothing({ target: [riotMatches.riotAccountId, riotMatches.matchId] })
        .returning({ id: riotMatches.id });
      return inserted.length;
    },
  };
}
