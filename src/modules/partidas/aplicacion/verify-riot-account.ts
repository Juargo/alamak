import { pickChallengeIcon, secondsUntilNextCheck } from "../dominio/verification";
import type { RiotAccountRepository } from "./repositories";
import { isRiotFailure, type RiotApi } from "./riot-port";

export type StartResult =
  | { status: "pending"; iconId: number }
  | { status: "verified" }
  | { status: "not-linked" }
  | { status: "riot-unavailable" };

export type CheckResult =
  | { status: "verified" }
  | { status: "mismatch"; currentIconId: number | null }
  | { status: "too-soon"; retryAfterSeconds: number }
  | { status: "claimed" }
  | { status: "not-started" }
  | { status: "not-linked" }
  | { status: "riot-unavailable" };

/** Riot failures become a result; anything else is a bug and propagates. */
async function fromRiot<T>(call: () => Promise<T>): Promise<T | "riot-unavailable"> {
  try {
    return await call();
  } catch (error) {
    if (!isRiotFailure(error)) throw error;
    console.error("riot ownership check failed", { error: String(error) });
    return "riot-unavailable";
  }
}

/**
 * Gives the player the icon to set (RF-03, D-11): a default one different from their
 * current icon, so setting it proves they control the account. Idempotent.
 */
export function startOwnershipCheck(deps: {
  accounts: RiotAccountRepository;
  riot: RiotApi;
  random?: () => number;
}) {
  return async (userId: string): Promise<StartResult> => {
    const account = await deps.accounts.findByUser(userId);
    if (!account) return { status: "not-linked" };
    if (account.verified) return { status: "verified" };
    if (account.challengeIconId !== null)
      return { status: "pending", iconId: account.challengeIconId };

    const current = await fromRiot(() => deps.riot.profileIconId(account.puuid, account.region));
    if (current === "riot-unavailable") return { status: "riot-unavailable" };
    const iconId = pickChallengeIcon(current, deps.random);
    await deps.accounts.setChallengeIcon(userId, iconId);
    return { status: "pending", iconId };
  };
}

/** "Ya lo cambié": asks Riot for the player's icon, at most once every 20 seconds. */
export function checkOwnership(deps: {
  accounts: RiotAccountRepository;
  riot: RiotApi;
  now?: () => Date;
}) {
  const now = deps.now ?? (() => new Date());
  return async (userId: string): Promise<CheckResult> => {
    const account = await deps.accounts.findByUser(userId);
    if (!account) return { status: "not-linked" };
    if (account.verified) return { status: "verified" };
    if (account.challengeIconId === null) return { status: "not-started" };

    const at = now();
    const wait = secondsUntilNextCheck(account.lastCheckAt, at);
    if (wait > 0) return { status: "too-soon", retryAfterSeconds: wait };
    await deps.accounts.recordCheck(userId, at);

    const current = await fromRiot(() => deps.riot.profileIconId(account.puuid, account.region));
    if (current === "riot-unavailable") return { status: "riot-unavailable" };
    if (current !== account.challengeIconId) return { status: "mismatch", currentIconId: current };
    const outcome = await deps.accounts.markVerified(userId, at);
    return { status: outcome };
  };
}
