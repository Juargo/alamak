import { REGIONS, type Region } from "@/modules/captacion";
import { parseRiotId } from "../dominio/riot-id";
import type { LinkedAccount, RiotAccountRepository } from "./repositories";
import { isRiotFailure, type RiotApi } from "./riot-port";

export type LinkResult =
  | { status: "linked"; account: LinkedAccount }
  | { status: "invalid"; field: "riotId" | "region" }
  | { status: "not-found" }
  | { status: "already-linked" }
  | { status: "riot-unavailable" };

function isRegion(value: unknown): value is Region {
  return REGIONS.includes(value as Region);
}

/**
 * Links the Riot account behind a Riot ID to the player (RF-02). It stays unverified, and
 * its games are imported only after the player proves it is theirs (#26).
 */
export function linkRiotAccount(deps: { accounts: RiotAccountRepository; riot: RiotApi }) {
  return async (
    userId: string,
    input: { riotId: unknown; region: unknown },
  ): Promise<LinkResult> => {
    const riotId = typeof input.riotId === "string" ? parseRiotId(input.riotId) : null;
    if (!riotId) return { status: "invalid", field: "riotId" };
    if (!isRegion(input.region)) return { status: "invalid", field: "region" };
    // One account per player: no need to spend Riot's rate limit on a second one.
    if (await deps.accounts.findByUser(userId)) return { status: "already-linked" };

    let account;
    try {
      account = await deps.riot.findAccount(riotId, input.region);
    } catch (error) {
      if (!isRiotFailure(error)) throw error;
      console.error("riot account lookup failed", { error: String(error) });
      return { status: "riot-unavailable" };
    }
    if (!account) return { status: "not-found" };
    return deps.accounts.link(userId, { ...account, region: input.region });
  };
}
