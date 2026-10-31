// Ownership check (D-11): the player sets a given profile icon and Riot confirms it.

/** Icons every League account owns, so anyone can set them. */
export const DEFAULT_ICON_IDS = Array.from({ length: 29 }, (_, id) => id);

/** One check every 20 seconds per player: three per minute at most. */
export const CHECK_INTERVAL_SECONDS = 20;

/**
 * A requested icon lasts 15 minutes. A short life keeps someone who links another
 * player's Riot ID from several Alamak accounts from waiting until the owner sets one of
 * their icons.
 */
export const CHALLENGE_TTL_SECONDS = 15 * 60;

export function isChallengeExpired(setAt: Date | null, now: Date): boolean {
  return !setAt || now.getTime() - setAt.getTime() >= CHALLENGE_TTL_SECONDS * 1000;
}

/** A default icon other than the one the player has now, so the check proves a change. */
export function pickChallengeIcon(currentIconId: number | null, random = Math.random): number {
  const candidates = DEFAULT_ICON_IDS.filter((id) => id !== currentIconId);
  return candidates[Math.floor(random() * candidates.length)];
}

/** Seconds until the next check is allowed, or 0 when it is allowed now. */
export function secondsUntilNextCheck(lastCheckAt: Date | null, now: Date): number {
  if (!lastCheckAt) return 0;
  const elapsed = (now.getTime() - lastCheckAt.getTime()) / 1000;
  return Math.max(0, Math.ceil(CHECK_INTERVAL_SECONDS - elapsed));
}
