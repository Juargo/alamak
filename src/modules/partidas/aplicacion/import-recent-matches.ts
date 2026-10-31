import { IMPORT_WINDOW_DAYS } from "../dominio/match";
import type { MatchRepository, RiotAccountRepository } from "./repositories";
import { RiotRateLimitedError, type RiotApi } from "./riot-port";

export type ImportResult =
  | { status: "done"; imported: number }
  | { status: "paused"; imported: number; retryAfterSeconds: number }
  | { status: "not-linked" }
  | { status: "not-verified" };

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Imports the verified player's ranked games of the last 30 days (A-33). Each game is saved
 * as soon as it arrives, so when Riot's rate limit pauses the import, the next run resumes
 * with the games still missing. Runs only for a verified account (decided in #25, L2).
 */
export function importRecentMatches(deps: {
  accounts: RiotAccountRepository;
  matches: MatchRepository;
  riot: RiotApi;
  now?: () => Date;
}) {
  const now = deps.now ?? (() => new Date());
  return async (userId: string): Promise<ImportResult> => {
    const account = await deps.accounts.findByUser(userId);
    if (!account) return { status: "not-linked" };
    if (!account.verified) return { status: "not-verified" };

    const since = new Date(now().getTime() - IMPORT_WINDOW_DAYS * DAY_MS);
    let imported = 0;
    try {
      const ids = await deps.riot.rankedMatchIds(account.puuid, account.region, since);
      const stored = await deps.matches.storedMatchIds(userId, account.id);
      for (const matchId of ids.filter((id) => !stored.has(id))) {
        const match = await deps.riot.rankedMatch(matchId, account.puuid, account.region);
        if (match) imported += await deps.matches.save(userId, account.id, [match]);
      }
    } catch (error) {
      if (error instanceof RiotRateLimitedError) {
        return { status: "paused", imported, retryAfterSeconds: error.retryAfterSeconds };
      }
      throw error;
    }
    return { status: "done", imported };
  };
}
