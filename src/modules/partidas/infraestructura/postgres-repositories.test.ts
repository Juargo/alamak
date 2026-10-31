import { inArray } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { user } from "@/modules/cuentas/infraestructura/schema";
import type { RankedMatch } from "../dominio/match";
import { postgresMatchRepository, postgresRiotAccountRepository } from "./postgres-repositories";
import { riotMatches } from "./schema";

const url = process.env.TEST_DATABASE_URL;

// This suite empties tables, so it only runs against a local, disposable database.
const isLocal = url !== undefined && ["localhost", "127.0.0.1"].includes(new URL(url).hostname);

if (process.env.CI && !isLocal) {
  throw new Error("CI must set TEST_DATABASE_URL to a local Postgres for integration tests");
}

// Own ids and emails: other suites share the database and run in parallel.
const ANA = "partidas-ana";
const BETO = "partidas-beto";
const ACCOUNT = { puuid: "puuid-ana", gameName: "Ana", tagLine: "LAS", region: "LAS" } as const;

function match(matchId: string, overrides: Partial<RankedMatch> = {}): RankedMatch {
  return {
    matchId,
    queue: "solo",
    result: "win",
    isRemake: false,
    championId: 103,
    championName: "Ahri",
    role: "MIDDLE",
    startedAt: new Date("2026-10-20T23:30:00Z"),
    durationSeconds: 1800,
    ...overrides,
  };
}

describe.runIf(isLocal)("partidas repositories (integration)", () => {
  let pool: Pool;
  let db: NodePgDatabase;

  beforeAll(async () => {
    pool = new Pool({ connectionString: url });
    db = drizzle({ client: pool });
    await migrate(db, { migrationsFolder: "drizzle" });
  });

  beforeEach(async () => {
    await db.delete(user).where(inArray(user.id, [ANA, BETO]));
    await db.insert(user).values([
      { id: ANA, name: "Ana", email: "partidas-ana@example.com", emailVerified: true },
      { id: BETO, name: "Beto", email: "partidas-beto@example.com", emailVerified: true },
    ]);
  });

  afterAll(async () => {
    await pool?.end();
  });

  it("#25 S5 links one Riot account per player and refuses a second", async () => {
    const accounts = postgresRiotAccountRepository(db);

    const first = await accounts.link(ANA, ACCOUNT);
    const second = await accounts.link(ANA, { ...ACCOUNT, puuid: "other", gameName: "Otra" });

    expect(first).toMatchObject({ status: "linked", account: { ...ACCOUNT, verified: false } });
    expect(second).toEqual({ status: "already-linked" });
    expect(await accounts.findByUser(ANA)).toMatchObject({ gameName: "Ana", verified: false });
  });

  it("#25 S5 lets two players claim the same Riot account until one proves it (#26)", async () => {
    const accounts = postgresRiotAccountRepository(db);

    await accounts.link(ANA, ACCOUNT);
    const beto = await accounts.link(BETO, ACCOUNT);

    expect(beto.status).toBe("linked");
  });

  it("#25 a player sees only their own Riot account", async () => {
    const accounts = postgresRiotAccountRepository(db);
    await accounts.link(ANA, ACCOUNT);

    expect(await accounts.findByUser(BETO)).toBeNull();
  });

  it("#26 S2 marks the account verified and keeps the challenge icon and last check", async () => {
    const accounts = postgresRiotAccountRepository(db);
    await accounts.link(ANA, ACCOUNT);
    const at = new Date("2026-10-31T12:00:00Z");

    await accounts.setChallengeIcon(ANA, 3);
    await accounts.recordCheck(ANA, at);
    const outcome = await accounts.markVerified(ANA, at);

    expect(outcome).toBe("verified");
    expect(await accounts.findByUser(ANA)).toMatchObject({
      verified: true,
      challengeIconId: 3,
      lastCheckAt: at,
    });
  });

  it("#26 only one player can verify the same Riot account", async () => {
    const accounts = postgresRiotAccountRepository(db);
    await accounts.link(ANA, ACCOUNT);
    await accounts.link(BETO, ACCOUNT);
    await accounts.markVerified(BETO, new Date());

    expect(await accounts.markVerified(ANA, new Date())).toBe("claimed");
    expect((await accounts.findByUser(ANA))?.verified).toBe(false);
  });

  it("#26 a verified account keeps its challenge icon", async () => {
    const accounts = postgresRiotAccountRepository(db);
    await accounts.link(ANA, ACCOUNT);
    await accounts.setChallengeIcon(ANA, 3);
    await accounts.markVerified(ANA, new Date());

    await accounts.setChallengeIcon(ANA, 9);

    expect((await accounts.findByUser(ANA))?.challengeIconId).toBe(3);
  });

  it("#25 S4 stores games once: a second import does not duplicate them", async () => {
    const accounts = postgresRiotAccountRepository(db);
    const matches = postgresMatchRepository(db);
    const linked = await accounts.link(ANA, ACCOUNT);
    if (linked.status !== "linked") throw new Error("not linked");

    const firstRun = await matches.save(ANA, linked.account.id, [match("LA2_1"), match("LA2_2")]);
    const secondRun = await matches.save(ANA, linked.account.id, [
      match("LA2_2", { result: "loss" }),
      match("LA2_3"),
    ]);

    expect([firstRun, secondRun]).toEqual([2, 1]);
    expect(await matches.storedMatchIds(ANA, linked.account.id)).toEqual(
      new Set(["LA2_1", "LA2_2", "LA2_3"]),
    );
    const rows = await db
      .select()
      .from(riotMatches)
      .where(inArray(riotMatches.userId, [ANA]));
    expect(rows).toHaveLength(3);
    // Stored games are never rewritten (DI-31).
    expect(rows.find((row) => row.matchId === "LA2_2")?.result).toBe("win");
  });

  it("#25 a player cannot store games into another player's account", async () => {
    const accounts = postgresRiotAccountRepository(db);
    const matches = postgresMatchRepository(db);
    const linked = await accounts.link(ANA, ACCOUNT);
    if (linked.status !== "linked") throw new Error("not linked");

    expect(await matches.save(BETO, linked.account.id, [match("LA2_1")])).toBe(0);
    expect(await matches.storedMatchIds(BETO, linked.account.id)).toEqual(new Set());
    expect(
      await db
        .select()
        .from(riotMatches)
        .where(inArray(riotMatches.userId, [ANA, BETO])),
    ).toEqual([]);
  });

  it("#25 deleting the player deletes their Riot account and games (DI-16)", async () => {
    const accounts = postgresRiotAccountRepository(db);
    const matches = postgresMatchRepository(db);
    const linked = await accounts.link(ANA, ACCOUNT);
    if (linked.status !== "linked") throw new Error("not linked");
    await matches.save(ANA, linked.account.id, [match("LA2_1")]);

    await db.delete(user).where(inArray(user.id, [ANA]));

    expect(
      await db
        .select()
        .from(riotMatches)
        .where(inArray(riotMatches.userId, [ANA])),
    ).toEqual([]);
  });
});
