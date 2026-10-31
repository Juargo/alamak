import { describe, expect, it, vi } from "vitest";
import { RiotUnavailableError } from "./riot-port";
import { inMemoryAccounts, riotWith } from "./test-doubles";
import { checkOwnership, startOwnershipCheck } from "./verify-riot-account";

const ANA = { puuid: "puuid-ana", gameName: "Ana", tagLine: "LAS" };
const T0 = new Date("2026-10-31T12:00:00Z");

async function linkedAna(icon = 7) {
  const accounts = inMemoryAccounts();
  await accounts.link("user-ana", { ...ANA, region: "LAS" });
  const riot = riotWith({ accounts: [ANA], icons: { "puuid-ana": icon } });
  return { accounts, riot };
}

describe("startOwnershipCheck", () => {
  it("#26 S1 assigns a default icon different from the player's current one, once", async () => {
    const { accounts, riot } = await linkedAna(7);
    const start = startOwnershipCheck({ accounts, riot, random: () => 0.25 });

    const first = await start("user-ana");
    const second = await start("user-ana");

    expect(first).toEqual({ status: "pending", iconId: expect.any(Number) });
    expect(first.status === "pending" && first.iconId).not.toBe(7);
    expect(second).toEqual(first);
    expect(riot.calls.filter((call) => call.method === "profileIconId")).toHaveLength(1);
  });

  it("#26 says the account is already verified", async () => {
    const { accounts, riot } = await linkedAna();
    accounts.verify("user-ana");

    expect(await startOwnershipCheck({ accounts, riot })("user-ana")).toEqual({
      status: "verified",
    });
  });

  it("#26 says there is nothing to check without a linked account", async () => {
    const start = startOwnershipCheck({
      accounts: inMemoryAccounts(),
      riot: riotWith({ accounts: [] }),
    });

    expect(await start("user-ana")).toEqual({ status: "not-linked" });
  });

  it("#26 reports Riot as unavailable instead of picking an icon blindly", async () => {
    const { accounts } = await linkedAna();
    const riot = {
      ...riotWith({ accounts: [ANA] }),
      profileIconId: vi.fn().mockRejectedValue(new RiotUnavailableError("down")),
    };
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await startOwnershipCheck({ accounts, riot })("user-ana")).toEqual({
      status: "riot-unavailable",
    });
    expect((await accounts.findByUser("user-ana"))?.challengeIconId).toBeNull();
  });
});

describe("checkOwnership", () => {
  async function challenged(currentIcon: number) {
    const { accounts, riot } = await linkedAna(currentIcon);
    await accounts.setChallengeIcon("user-ana", 3);
    let now = T0;
    const check = checkOwnership({ accounts, riot, now: () => now });
    return {
      accounts,
      riot,
      check,
      advance: (seconds: number) => (now = new Date(now.getTime() + seconds * 1000)),
    };
  }

  it("#26 S2 verifies the account when the player set the given icon", async () => {
    const { check, accounts } = await challenged(3);

    expect(await check("user-ana")).toEqual({ status: "verified" });
    expect((await accounts.findByUser("user-ana"))?.verified).toBe(true);
  });

  it("#26 S3 says the icon does not match yet and leaves the account unverified", async () => {
    const { check, accounts } = await challenged(7);

    expect(await check("user-ana")).toEqual({ status: "mismatch", currentIconId: 7 });
    expect((await accounts.findByUser("user-ana"))?.verified).toBe(false);
  });

  it("#26 S3 allows one check every 20 seconds", async () => {
    const { check, riot, advance } = await challenged(7);
    await check("user-ana");

    advance(5);
    const tooSoon = await check("user-ana");
    advance(15);
    const allowed = await check("user-ana");

    expect(tooSoon).toEqual({ status: "too-soon", retryAfterSeconds: 15 });
    expect(allowed.status).toBe("mismatch");
    expect(riot.calls.filter((call) => call.method === "profileIconId")).toHaveLength(2);
  });

  it("#26 refuses when another player already proved the same Riot account", async () => {
    const { accounts, riot } = await linkedAna(3);
    await accounts.link("user-beto", { ...ANA, region: "LAS" });
    accounts.verify("user-beto");
    await accounts.setChallengeIcon("user-ana", 3);

    expect(await checkOwnership({ accounts, riot, now: () => T0 })("user-ana")).toEqual({
      status: "claimed",
    });
  });

  it("#26 needs a started check first", async () => {
    const { accounts, riot } = await linkedAna(3);

    expect(await checkOwnership({ accounts, riot, now: () => T0 })("user-ana")).toEqual({
      status: "not-started",
    });
  });

  it("#26 reports Riot as unavailable and counts the attempt", async () => {
    const { accounts } = await linkedAna();
    await accounts.setChallengeIcon("user-ana", 3);
    const riot = {
      ...riotWith({ accounts: [ANA] }),
      profileIconId: vi.fn().mockRejectedValue(new RiotUnavailableError("down")),
    };
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await checkOwnership({ accounts, riot, now: () => T0 })("user-ana")).toEqual({
      status: "riot-unavailable",
    });
    expect((await accounts.findByUser("user-ana"))?.lastCheckAt).toEqual(T0);
  });
});
