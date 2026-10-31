import { describe, expect, it, vi } from "vitest";
import {
  RiotRateLimitedError,
  RiotRejectedError,
  RiotUnavailableError,
  type RiotApi,
} from "./riot-port";
import { linkRiotAccount } from "./link-riot-account";
import { inMemoryAccounts, riotWith } from "./test-doubles";

const ANA_ACCOUNT = { puuid: "puuid-ana", gameName: "Señor Tilt", tagLine: "LAS" };

describe("linkRiotAccount", () => {
  it("#25 S1 links the Riot account found for the Riot ID and region, still unverified", async () => {
    const accounts = inMemoryAccounts();
    const link = linkRiotAccount({ accounts, riot: riotWith({ accounts: [ANA_ACCOUNT] }) });

    const result = await link("user-ana", { riotId: " Señor Tilt#LAS ", region: "LAS" });

    expect(result).toMatchObject({
      status: "linked",
      account: { ...ANA_ACCOUNT, region: "LAS", verified: false },
    });
    expect(await accounts.findByUser("user-ana")).toMatchObject({ puuid: "puuid-ana" });
  });

  it("#25 S1 says the account does not exist when Riot does not find it", async () => {
    const accounts = inMemoryAccounts();
    const link = linkRiotAccount({ accounts, riot: riotWith({ accounts: [] }) });

    expect(await link("user-ana", { riotId: "Nadie#000", region: "LAS" })).toEqual({
      status: "not-found",
    });
    expect(await accounts.findByUser("user-ana")).toBeNull();
  });

  it.each([
    [{ riotId: "sin-tag", region: "LAS" }, "riotId"],
    [{ riotId: "Ana#LAS", region: "NA" }, "region"],
    [{ riotId: 42, region: "LAS" }, "riotId"],
  ])("#25 S1 rejects malformed input %j without calling Riot", async (input, field) => {
    const riot = riotWith({ accounts: [ANA_ACCOUNT] });
    const link = linkRiotAccount({ accounts: inMemoryAccounts(), riot });

    expect(await link("user-ana", input)).toEqual({ status: "invalid", field });
    expect(riot.calls).toEqual([]);
  });

  it("#25 S5 refuses a second Riot account for the same player", async () => {
    const accounts = inMemoryAccounts();
    const link = linkRiotAccount({
      accounts,
      riot: riotWith({
        accounts: [ANA_ACCOUNT, { puuid: "p2", gameName: "Otra", tagLine: "EUW" }],
      }),
    });
    await link("user-ana", { riotId: "Señor Tilt#LAS", region: "LAS" });

    const second = await link("user-ana", { riotId: "Otra#EUW", region: "EUW" });

    expect(second).toEqual({ status: "already-linked" });
    expect((await accounts.findByUser("user-ana"))?.gameName).toBe("Señor Tilt");
  });

  it("#25 S5 does not even ask Riot when the player already has an account", async () => {
    const accounts = inMemoryAccounts();
    const riot = riotWith({ accounts: [ANA_ACCOUNT] });
    const link = linkRiotAccount({ accounts, riot });
    await link("user-ana", { riotId: "Señor Tilt#LAS", region: "LAS" });
    riot.calls.length = 0;

    await link("user-ana", { riotId: "Señor Tilt#LAS", region: "LAS" });

    expect(riot.calls).toEqual([]);
  });

  it.each([
    new RiotRateLimitedError(10),
    new RiotUnavailableError("down"),
    new RiotRejectedError(403),
  ])("#25 S3 reports Riot as unavailable on %s", async (error) => {
    const riot: RiotApi = {
      findAccount: async () => {
        throw error;
      },
      rankedMatchIds: async () => [],
      rankedMatch: async () => null,
    };
    const link = linkRiotAccount({ accounts: inMemoryAccounts(), riot });
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await link("user-ana", { riotId: "Ana#LAS", region: "LAS" })).toEqual({
      status: "riot-unavailable",
    });
  });
});
