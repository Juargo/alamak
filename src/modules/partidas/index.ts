import "server-only";
import { getRiotEnv } from "@/shared/config/env";
import { getDb } from "@/shared/db/drizzle";
import {
  importRecentMatches as importWith,
  type ImportResult,
} from "./aplicacion/import-recent-matches";
import { linkRiotAccount as linkWith, type LinkResult } from "./aplicacion/link-riot-account";
import type { LinkedAccount } from "./aplicacion/repositories";
import {
  postgresMatchRepository,
  postgresRiotAccountRepository,
} from "./infraestructura/postgres-repositories";
import { createRiotHttpApi } from "./infraestructura/riot-http-api";

export type { ImportResult } from "./aplicacion/import-recent-matches";
export type { LinkResult } from "./aplicacion/link-riot-account";
export type { LinkedAccount } from "./aplicacion/repositories";
export { formatRiotId } from "./dominio/riot-id";

// Every function takes the player's id from the server session (ADR-0017), never the client.

function riot() {
  const env = getRiotEnv();
  return createRiotHttpApi({ apiKey: env.RIOT_API_KEY, baseUrl: env.RIOT_API_BASE_URL });
}

export function getLinkedAccount(userId: string): Promise<LinkedAccount | null> {
  return postgresRiotAccountRepository(getDb()).findByUser(userId);
}

/** Links the player's Riot account (unverified); one per player. */
export function linkRiotAccount(
  userId: string,
  input: { riotId: unknown; region: unknown },
): Promise<LinkResult> {
  return linkWith({ accounts: postgresRiotAccountRepository(getDb()), riot: riot() })(
    userId,
    input,
  );
}

/** Imports the last 30 days of ranked games of a verified account; #26 runs it after verifying. */
export function importRecentMatches(userId: string): Promise<ImportResult> {
  const db = getDb();
  return importWith({
    accounts: postgresRiotAccountRepository(db),
    matches: postgresMatchRepository(db),
    riot: riot(),
  })(userId);
}
