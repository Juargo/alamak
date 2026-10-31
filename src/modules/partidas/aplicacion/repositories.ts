import type { Region } from "@/modules/captacion";
import type { RankedMatch } from "../dominio/match";
import type { RiotAccount } from "./riot-port";

/** The Riot account a player linked; its games count only once it is verified (#26). */
export type LinkedAccount = RiotAccount & {
  id: string;
  region: Region;
  verified: boolean;
  /** Icon the player must set to prove ownership (#26), once a check has started. */
  challengeIconId: number | null;
  lastCheckAt: Date | null;
};

/** Every method takes the player's id from their session, never from the client (ADR-0017). */
export interface RiotAccountRepository {
  findByUser(userId: string): Promise<LinkedAccount | null>;
  /** "already-linked" when the player has a Riot account already (one per player). */
  link(
    userId: string,
    account: RiotAccount & { region: Region },
  ): Promise<{ status: "linked"; account: LinkedAccount } | { status: "already-linked" }>;
  setChallengeIcon(userId: string, iconId: number): Promise<void>;
  recordCheck(userId: string, at: Date): Promise<void>;
  /** "claimed" when another player already verified the same Riot account. */
  markVerified(userId: string, at: Date): Promise<"verified" | "claimed">;
}

export interface MatchRepository {
  /** Ids of this account's games already stored, to skip them. */
  storedMatchIds(userId: string, riotAccountId: string): Promise<Set<string>>;
  /** Stores the games; ones already stored are left untouched. Returns how many were new. */
  save(userId: string, riotAccountId: string, matches: RankedMatch[]): Promise<number>;
}
