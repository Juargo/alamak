import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { WaitlistRepository } from "../aplicacion/enroll-in-waitlist";
import { waitlistEntries } from "./schema";

/**
 * The unique index on lower(email) decides duplicates, so two concurrent
 * sign-ups with the same email cannot both be stored.
 */
export function postgresWaitlistRepository(db: NodePgDatabase): WaitlistRepository {
  return {
    async add(signup) {
      const inserted = await db
        .insert(waitlistEntries)
        .values(signup)
        .onConflictDoNothing()
        .returning({ id: waitlistEntries.id });
      return inserted.length > 0 ? "created" : "already-exists";
    },
  };
}
