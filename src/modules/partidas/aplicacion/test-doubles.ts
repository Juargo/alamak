// In-memory ports for use-case tests, with the same rules as the Postgres adapters.
import type { Region } from "@/modules/captacion";
import type { RankedMatch } from "../dominio/match";
import type { LinkedAccount, MatchRepository, RiotAccountRepository } from "./repositories";
import type { RiotAccount, RiotApi } from "./riot-port";

export function inMemoryAccounts(): RiotAccountRepository & { verify(userId: string): void } {
  const byUser = new Map<string, LinkedAccount>();
  const update = (userId: string, changes: Partial<LinkedAccount>) => {
    const account = byUser.get(userId);
    if (account) byUser.set(userId, { ...account, ...changes });
  };
  return {
    async findByUser(userId) {
      return byUser.get(userId) ?? null;
    },
    async link(userId, account) {
      if (byUser.has(userId)) return { status: "already-linked" };
      const linked: LinkedAccount = {
        ...account,
        id: `account-${userId}`,
        verified: false,
        challengeIconId: null,
        lastCheckAt: null,
      };
      byUser.set(userId, linked);
      return { status: "linked", account: linked };
    },
    async setChallengeIcon(userId, iconId) {
      if (!byUser.get(userId)?.verified) update(userId, { challengeIconId: iconId });
    },
    async recordCheck(userId, at) {
      update(userId, { lastCheckAt: at });
    },
    async markVerified(userId) {
      const account = byUser.get(userId);
      const claimed = [...byUser.values()].some(
        (other) => other !== account && other.verified && other.puuid === account?.puuid,
      );
      if (claimed) return "claimed";
      update(userId, { verified: true });
      return "verified";
    },
    verify(userId) {
      update(userId, { verified: true });
    },
  };
}

export function inMemoryMatches(): MatchRepository {
  const stored = new Map<string, Map<string, RankedMatch>>();
  return {
    async storedMatchIds(userId, riotAccountId) {
      return new Set(stored.get(`${userId}/${riotAccountId}`)?.keys());
    },
    async save(userId, riotAccountId, matches) {
      const key = `${userId}/${riotAccountId}`;
      const games = stored.get(key) ?? new Map<string, RankedMatch>();
      stored.set(key, games);
      let added = 0;
      for (const match of matches) {
        if (games.has(match.matchId)) continue;
        games.set(match.matchId, match);
        added++;
      }
      return added;
    },
  };
}

type Call =
  | { method: "findAccount"; gameName: string; tagLine: string; region: Region }
  | { method: "profileIconId"; puuid: string; region: Region }
  | { method: "rankedMatchIds"; puuid: string; region: Region; since: Date }
  | { method: "rankedMatch"; matchId: string };

/** A Riot that knows some accounts and games, records calls and can fail on demand. */
export function riotWith(data: {
  accounts: RiotAccount[];
  games?: RankedMatch[];
  icons?: Record<string, number>;
}) {
  const calls: Call[] = [];
  const extraIds: string[] = [];
  let matchFailure: { after: number; error: Error } | null = null;
  let matchCalls = 0;
  const riot: RiotApi = {
    async findAccount({ gameName, tagLine }, region) {
      calls.push({ method: "findAccount", gameName, tagLine, region });
      return data.accounts.find((a) => a.gameName === gameName && a.tagLine === tagLine) ?? null;
    },
    async profileIconId(puuid, region) {
      calls.push({ method: "profileIconId", puuid, region });
      return data.icons?.[puuid] ?? null;
    },
    async rankedMatchIds(puuid, region, since) {
      calls.push({ method: "rankedMatchIds", puuid, region, since });
      return [...(data.games ?? []).map((game) => game.matchId), ...extraIds];
    },
    async rankedMatch(matchId) {
      calls.push({ method: "rankedMatch", matchId });
      if (matchFailure && matchCalls >= matchFailure.after) throw matchFailure.error;
      matchCalls++;
      return data.games?.find((game) => game.matchId === matchId) ?? null;
    },
  };
  return {
    ...riot,
    calls,
    extraIds,
    /** Fails every match request after `after` successful ones (Infinity = never). */
    failMatchAfter(after: number, error: Error = new Error("fail")) {
      matchCalls = 0;
      matchFailure = after === Infinity ? null : { after, error };
    },
  };
}
