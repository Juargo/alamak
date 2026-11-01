import "server-only";
import { getRiotEnv } from "@/shared/config/env";
import { getDb } from "@/shared/db/drizzle";
import {
  importRecentMatches as importWith,
  type ImportResult,
} from "./aplicacion/import-recent-matches";
import { linkRiotAccount as linkWith, type LinkResult } from "./aplicacion/link-riot-account";
import {
  checkOwnership as checkWith,
  startOwnershipCheck as startWith,
  type CheckResult,
  type StartResult,
} from "./aplicacion/verify-riot-account";
import { profileIconUrl } from "./dominio/data-dragon";
import { latestDataDragonVersion } from "./infraestructura/data-dragon-version";
import type { LinkedAccount } from "./aplicacion/repositories";
import {
  postgresMatchRepository,
  postgresRiotAccountRepository,
} from "./infraestructura/postgres-repositories";
import { createRiotHttpApi } from "./infraestructura/riot-http-api";

export type { ImportResult } from "./aplicacion/import-recent-matches";
export type { LinkResult } from "./aplicacion/link-riot-account";
export type { LinkedAccount } from "./aplicacion/repositories";
export type { CheckResult, StartResult } from "./aplicacion/verify-riot-account";
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

/** The icon the player must set to prove the linked account is theirs (#26). */
export function startOwnershipCheck(userId: string): Promise<StartResult> {
  return startWith({ accounts: postgresRiotAccountRepository(getDb()), riot: riot() })(userId);
}

/** "Ya lo cambié": verifies the account if the player set the icon (one try per 20 s). */
export function checkOwnership(userId: string): Promise<CheckResult> {
  return checkWith({ accounts: postgresRiotAccountRepository(getDb()), riot: riot() })(userId);
}

export function countStoredMatches(userId: string): Promise<number> {
  return postgresMatchRepository(getDb()).countForUser(userId);
}

/** `DATA_DRAGON_VERSION` pins the version (E2E, offline); otherwise the latest is used. */
export async function profileIconImage(iconId: number): Promise<string> {
  return profileIconUrl(await latestDataDragonVersion(process.env.DATA_DRAGON_VERSION), iconId);
}
