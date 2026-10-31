/** Ranked queues the diary counts (RF-07): Solo/Duo and Flex. */
export const RANKED_QUEUES = { solo: 420, flex: 440 } as const;
export type RankedQueue = keyof typeof RANKED_QUEUES;

export const ROLES = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"] as const;
export type Role = (typeof ROLES)[number];

/** How far back the first import reaches (A-33). */
export const IMPORT_WINDOW_DAYS = 30;

/**
 * One ranked game as the diary stores it: only official Riot data about the player's own
 * performance, never edited by hand (DI-31), and no MMR or rank estimates.
 */
export type RankedMatch = {
  matchId: string;
  queue: RankedQueue;
  result: "win" | "loss";
  isRemake: boolean;
  championId: number;
  championName: string;
  role: Role | null;
  startedAt: Date;
  durationSeconds: number;
};
