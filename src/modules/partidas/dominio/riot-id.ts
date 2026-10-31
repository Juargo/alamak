/** A Riot ID such as "Faker#KR1": the visible name plus the tag after "#". */
export type RiotId = { gameName: string; tagLine: string };

// Riot's limits: the name has 3 to 16 characters and the tag 3 to 5 letters or digits.
const GAME_NAME_LENGTH = { min: 3, max: 16 };
const TAG_LINE_PATTERN = /^[\p{L}\p{N}]{3,5}$/u;

/** Reads what the player typed; null when it is not a well-formed Riot ID. */
export function parseRiotId(input: string): RiotId | null {
  const parts = input.trim().split("#");
  if (parts.length !== 2) return null;
  const gameName = parts[0].trim();
  const tagLine = parts[1].trim();
  const nameLength = [...gameName].length;
  if (nameLength < GAME_NAME_LENGTH.min || nameLength > GAME_NAME_LENGTH.max) return null;
  if (!TAG_LINE_PATTERN.test(tagLine)) return null;
  return { gameName, tagLine };
}

export function formatRiotId({ gameName, tagLine }: RiotId): string {
  return `${gameName}#${tagLine}`;
}
