import { describe, expect, it } from "vitest";
import type { RankedMatch } from "../dominio/match";
import { importRecentMatches } from "./import-recent-matches";
import { RiotRateLimitedError, RiotRejectedError } from "./riot-port";
import { inMemoryAccounts, inMemoryMatches, riotWith } from "./test-doubles";

const NOW = new Date("2026-10-31T12:00:00Z");
const ANA = { puuid: "puuid-ana", gameName: "Ana", tagLine: "LAS" };

function game(matchId: string): RankedMatch {
  return {
    matchId,
    queue: "solo",
    result: "win",
    isRemake: false,
    championId: 103,
    championName: "Ahri",
    role: "MIDDLE",
    startedAt: new Date("2026-10-30T23:00:00Z"),
    durationSeconds: 1800,
  };
}

async function setup(options: { verified: boolean; games: RankedMatch[] }) {
  const accounts = inMemoryAccounts();
  const linked = await accounts.link("user-ana", { ...ANA, region: "LAS" });
  if (linked.status !== "linked") throw new Error("not linked");
  if (options.verified) accounts.verify("user-ana");
  const matches = inMemoryMatches();
  const riot = riotWith({ accounts: [ANA], games: options.games });
  const importer = importRecentMatches({ accounts, matches, riot, now: () => NOW });
  return { accounts, matches, riot, importer, accountId: linked.account.id };
}

describe("importRecentMatches", () => {
  it("#25 S2 imports the ranked games of the last 30 days once the account is verified", async () => {
    const { importer, matches, riot, accountId } = await setup({
      verified: true,
      games: [game("LA2_2"), game("LA2_1")],
    });

    const result = await importer("user-ana");

    expect(result).toEqual({ status: "done", imported: 2 });
    expect(await matches.storedMatchIds("user-ana", accountId)).toEqual(
      new Set(["LA2_1", "LA2_2"]),
    );
    expect(riot.calls[0]).toEqual({
      method: "rankedMatchIds",
      puuid: "puuid-ana",
      region: "LAS",
      since: new Date("2026-10-01T12:00:00Z"),
    });
  });

  it("#25 S2 L2 imports nothing while the account is not verified", async () => {
    const { importer, riot } = await setup({ verified: false, games: [game("LA2_1")] });

    expect(await importer("user-ana")).toEqual({ status: "not-verified" });
    expect(riot.calls).toEqual([]);
  });

  it("#25 S2 says there is nothing to import without a linked account", async () => {
    const importer = importRecentMatches({
      accounts: inMemoryAccounts(),
      matches: inMemoryMatches(),
      riot: riotWith({ accounts: [] }),
      now: () => NOW,
    });

    expect(await importer("user-ana")).toEqual({ status: "not-linked" });
  });

  it("#25 S4 a second import only fetches the games it does not have yet", async () => {
    const { importer, riot } = await setup({
      verified: true,
      games: [game("LA2_3"), game("LA2_2"), game("LA2_1")],
    });
    await importer("user-ana");
    riot.calls.length = 0;

    const second = await importer("user-ana");

    expect(second).toEqual({ status: "done", imported: 0 });
    expect(riot.calls.map((call) => call.method)).toEqual(["rankedMatchIds"]);
  });

  it("#25 S3 pauses at Riot's rate limit, keeps what it stored, and resumes later", async () => {
    const { importer, riot, matches, accountId } = await setup({
      verified: true,
      games: [game("LA2_3"), game("LA2_2"), game("LA2_1")],
    });
    riot.failMatchAfter(1, new RiotRateLimitedError(30));

    const first = await importer("user-ana");

    expect(first).toEqual({ status: "paused", imported: 1, retryAfterSeconds: 30 });
    expect((await matches.storedMatchIds("user-ana", accountId)).size).toBe(1);
    riot.failMatchAfter(Infinity);
    expect(await importer("user-ana")).toEqual({ status: "done", imported: 2 });
    expect((await matches.storedMatchIds("user-ana", accountId)).size).toBe(3);
  });

  it("#25 S3 keeps what it stored when Riot fails or refuses the key, and resumes later", async () => {
    const { importer, riot, matches, accountId } = await setup({
      verified: true,
      games: [game("LA2_2"), game("LA2_1")],
    });
    riot.failMatchAfter(1, new RiotRejectedError(403));

    expect(await importer("user-ana")).toEqual({ status: "failed", imported: 1 });
    riot.failMatchAfter(Infinity);
    expect(await importer("user-ana")).toEqual({ status: "done", imported: 1 });
    expect((await matches.storedMatchIds("user-ana", accountId)).size).toBe(2);
  });

  it("#25 RF-07 skips ids Riot no longer resolves to a ranked game of the player", async () => {
    const { importer, riot } = await setup({ verified: true, games: [game("LA2_1")] });
    riot.extraIds.push("LA2_ghost");

    expect(await importer("user-ana")).toEqual({ status: "done", imported: 1 });
  });
});
