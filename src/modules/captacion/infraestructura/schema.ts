import { sql } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const regionEnum = pgEnum("region", ["LAS", "LAN", "EUW"]);

/**
 * Waitlist sign-ups. Stores only email and region (D-20, ADR-0015);
 * `created_at` drives the 6-month deletion of people who never register.
 */
export const waitlistEntries = pgTable(
  "waitlist_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    region: regionEnum("region").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("waitlist_entries_email_unique").on(sql`lower(${table.email})`)],
);
