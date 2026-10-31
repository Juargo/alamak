import "server-only";
import type { Region } from "@/modules/captacion";
import {
  RiotRateLimitedError,
  RiotUnavailableError,
  type RiotAccount,
  type RiotApi,
} from "../aplicacion/riot-port";
import {
  RANKED_QUEUES,
  ROLES,
  type RankedMatch,
  type RankedQueue,
  type Role,
} from "../dominio/match";
import type { RiotId } from "../dominio/riot-id";

// Riot groups servers by continent for account-v1 and match-v5.
const ROUTE_BY_REGION: Record<Region, "americas" | "europe"> = {
  LAS: "americas",
  LAN: "americas",
  EUW: "europe",
};

const PAGE_SIZE = 100;
const MAX_ATTEMPTS = 3;
// Without Riot's own flag, a game this short ended in a remake.
const REMAKE_MAX_SECONDS = 5 * 60;
const DEFAULT_RETRY_AFTER_SECONDS = 10;

type Options = {
  apiKey: string;
  /** Replaces `https://<route>.api.riotgames.com` with `<baseUrl>/<route>` (local fake in E2E). */
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
  sleep?: (ms: number) => Promise<void>;
};

type MatchDto = {
  metadata: { matchId: string };
  info: {
    queueId: number;
    gameStartTimestamp: number;
    gameDuration: number;
    participants: {
      puuid: string;
      win: boolean;
      championId: number;
      championName: string;
      teamPosition?: string;
      gameEndedInEarlySurrender?: boolean;
    }[];
  };
};

/** Riot API over HTTP with the server-side key, retrying temporary errors. */
export function createRiotHttpApi(options: Options): RiotApi {
  const fetch = options.fetch ?? globalThis.fetch;
  const sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));

  function url(region: Region, path: string): string {
    const route = ROUTE_BY_REGION[region];
    return options.baseUrl
      ? `${options.baseUrl}/${route}${path}`
      : `https://${route}.api.riotgames.com${path}`;
  }

  /** GETs JSON; null on 404. Retries 5xx and network errors, stops at once on 429. */
  async function get<T>(target: string): Promise<T | null> {
    let lastFailure = "";
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      let response: Response;
      try {
        response = await fetch(target, { headers: { "X-Riot-Token": options.apiKey } });
      } catch (error) {
        lastFailure = `network error: ${String(error)}`;
        await sleep(1000 * attempt);
        continue;
      }
      if (response.ok) return (await response.json()) as T;
      if (response.status === 404) return null;
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("Retry-After"));
        throw new RiotRateLimitedError(retryAfter > 0 ? retryAfter : DEFAULT_RETRY_AFTER_SECONDS);
      }
      if (response.status < 500) throw new Error(`Riot API answered ${response.status}`);
      lastFailure = `status ${response.status}`;
      if (attempt < MAX_ATTEMPTS) await sleep(1000 * attempt);
    }
    throw new RiotUnavailableError(
      `Riot API unavailable after ${MAX_ATTEMPTS} attempts (${lastFailure})`,
    );
  }

  return {
    async findAccount({ gameName, tagLine }: RiotId, region) {
      const account = await get<RiotAccount>(
        url(
          region,
          `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
        ),
      );
      return (
        account && { puuid: account.puuid, gameName: account.gameName, tagLine: account.tagLine }
      );
    },

    async rankedMatchIds(puuid, region, since) {
      const startTime = Math.floor(since.getTime() / 1000);
      const ids: string[] = [];
      for (const queueId of Object.values(RANKED_QUEUES)) {
        for (let start = 0; ; start += PAGE_SIZE) {
          const page =
            (await get<string[]>(
              url(
                region,
                `/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?queue=${queueId}&startTime=${startTime}&start=${start}&count=${PAGE_SIZE}`,
              ),
            )) ?? [];
          ids.push(...page);
          if (page.length < PAGE_SIZE) break;
        }
      }
      return ids;
    },

    async rankedMatch(matchId, puuid, region) {
      const match = await get<MatchDto>(
        url(region, `/lol/match/v5/matches/${encodeURIComponent(matchId)}`),
      );
      return match && toRankedMatch(match, puuid);
    },
  };
}

function queueOf(queueId: number): RankedQueue | null {
  const entry = Object.entries(RANKED_QUEUES).find(([, id]) => id === queueId);
  return entry ? (entry[0] as RankedQueue) : null;
}

function roleOf(teamPosition: string | undefined): Role | null {
  return ROLES.includes(teamPosition as Role) ? (teamPosition as Role) : null;
}

function toRankedMatch(match: MatchDto, puuid: string): RankedMatch | null {
  const queue = queueOf(match.info.queueId);
  const player = match.info.participants.find((participant) => participant.puuid === puuid);
  if (!queue || !player) return null;
  return {
    matchId: match.metadata.matchId,
    queue,
    result: player.win ? "win" : "loss",
    isRemake: player.gameEndedInEarlySurrender ?? match.info.gameDuration < REMAKE_MAX_SECONDS,
    championId: player.championId,
    championName: player.championName,
    role: roleOf(player.teamPosition),
    startedAt: new Date(match.info.gameStartTimestamp),
    durationSeconds: match.info.gameDuration,
  };
}
