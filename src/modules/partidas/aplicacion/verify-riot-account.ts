import {
  CHALLENGE_TTL_SECONDS,
  CHECK_INTERVAL_SECONDS,
  isChallengeExpired,
  pickChallengeIcon,
  secondsUntilNextCheck,
} from "../dominio/verification";
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
  | { status: "expired" }
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
 * current icon, so setting it proves they control the account. It lasts 15 minutes; after
 * that a new one is picked. Concurrent calls agree on the same icon.
 */
export function startOwnershipCheck(deps: {
  accounts: RiotAccountRepository;
  riot: RiotApi;
  random?: () => number;
  now?: () => Date;
}) {
  const now = deps.now ?? (() => new Date());
  return async (userId: string): Promise<StartResult> => {
    const account = await deps.accounts.findByUser(userId);
    if (!account) return { status: "not-linked" };
    if (account.verified) return { status: "verified" };
    const at = now();
    if (account.challengeIconId !== null && !isChallengeExpired(account.challengeSetAt, at)) {
      return { status: "pending", iconId: account.challengeIconId };
    }

    const current = await fromRiot(() => deps.riot.profileIconId(account.puuid, account.region));
    // Without the current icon a pick could equal it and prove nothing.
    if (current === "riot-unavailable" || current === null) return { status: "riot-unavailable" };
    const iconId = await deps.accounts.setChallengeIcon(
      userId,
      pickChallengeIcon(current, deps.random),
      at,
      CHALLENGE_TTL_SECONDS,
    );
    return iconId === null ? { status: "verified" } : { status: "pending", iconId };
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
    if (isChallengeExpired(account.challengeSetAt, at)) return { status: "expired" };
    if (!(await deps.accounts.tryRecordCheck(userId, at, CHECK_INTERVAL_SECONDS))) {
      const wait = secondsUntilNextCheck(account.lastCheckAt, at);
      return { status: "too-soon", retryAfterSeconds: Math.max(wait, 1) };
    }

    const current = await fromRiot(() => deps.riot.profileIconId(account.puuid, account.region));
    if (current === "riot-unavailable") return { status: "riot-unavailable" };
    if (current !== account.challengeIconId) return { status: "mismatch", currentIconId: current };
    const outcome = await deps.accounts.markVerified(userId, at);
    return { status: outcome };
  };
}
