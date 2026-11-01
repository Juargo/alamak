// Champion images come only from Riot's Data Dragon CDN (RES-08), never from the app.
const DATA_DRAGON = "https://ddragon.leagueoflegends.com";

/** Square icon of a champion by the name Riot reports in a match (e.g. "Ahri"). */
export function championIconUrl(gameVersion: string, championName: string): string {
  return `${DATA_DRAGON}/cdn/${gameVersion}/img/champion/${encodeURIComponent(championName)}.png`;
}

/** A player's profile icon, e.g. the one they must set to prove ownership. */
export function profileIconUrl(gameVersion: string, iconId: number): string {
  return `${DATA_DRAGON}/cdn/${gameVersion}/img/profileicon/${iconId}.png`;
}

/** Data Dragon lists versions newest first. */
export const DATA_DRAGON_VERSIONS_URL = `${DATA_DRAGON}/api/versions.json`;
