import "server-only";
import { DATA_DRAGON_VERSIONS_URL } from "../dominio/data-dragon";

// A version Data Dragon is known to serve, used when the list cannot be read.
const FALLBACK_VERSION = "14.1.1";

/** Latest Data Dragon version, cached for a day; a known version if Data Dragon fails. */
export async function latestDataDragonVersion(pinned?: string): Promise<string> {
  if (pinned) return pinned;
  try {
    const response = await fetch(DATA_DRAGON_VERSIONS_URL, {
      next: { revalidate: 60 * 60 * 24 },
      signal: AbortSignal.timeout(2000),
    });
    const versions = (await response.json()) as unknown;
    return Array.isArray(versions) && typeof versions[0] === "string"
      ? versions[0]
      : FALLBACK_VERSION;
  } catch {
    return FALLBACK_VERSION;
  }
}
