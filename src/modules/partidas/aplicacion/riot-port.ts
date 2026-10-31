import type { Region } from "@/modules/captacion";
import type { RankedMatch } from "../dominio/match";
import type { RiotId } from "../dominio/riot-id";

export type RiotAccount = RiotId & { puuid: string };

/** Riot stopped answering for now (429); try again after this many seconds. */
export class RiotRateLimitedError extends Error {
  constructor(readonly retryAfterSeconds: number) {
    super(`Riot API rate limit reached; retry after ${retryAfterSeconds}s`);
    this.name = "RiotRateLimitedError";
  }
}

/** Riot failed even after retrying temporary errors (5xx, network). */
export class RiotUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RiotUnavailableError";
  }
}

/** Official Riot API, called only from the server (RNF-29). */
export interface RiotApi {
  /** The account behind a Riot ID, or null when it does not exist. */
  findAccount(riotId: RiotId, region: Region): Promise<RiotAccount | null>;
  /** Ids of the player's Solo/Duo and Flex games started since `since`. */
  rankedMatchIds(puuid: string, region: Region, since: Date): Promise<string[]>;
  /** The player's view of one game, or null if it is not a ranked game they played. */
  rankedMatch(matchId: string, puuid: string, region: Region): Promise<RankedMatch | null>;
}
