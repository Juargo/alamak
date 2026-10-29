import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { postgresWaitlistRepository } from "./postgres-waitlist-repository";
import { waitlistEntries } from "./schema";

const url = process.env.TEST_DATABASE_URL;

// This suite empties the table, so it only runs against a local, disposable database.
const isLocal = url !== undefined && ["localhost", "127.0.0.1"].includes(new URL(url).hostname);

// In CI the suite must run; a missing or remote URL would otherwise skip it silently.
if (process.env.CI && !isLocal) {
  throw new Error("CI must set TEST_DATABASE_URL to a local Postgres for integration tests");
}

describe.runIf(isLocal)("postgresWaitlistRepository (integration)", () => {
  let pool: Pool;
  let db: NodePgDatabase;

  beforeAll(async () => {
    pool = new Pool({ connectionString: url });
    db = drizzle({ client: pool });
    await migrate(db, { migrationsFolder: "drizzle" });
  });

  beforeEach(async () => {
    await db.delete(waitlistEntries);
  });

  afterAll(async () => {
    await pool.end();
  });

  it("#4 CA-4: stores a new sign-up once with its region and creation date", async () => {
    const repository = postgresWaitlistRepository(db);

    await expect(repository.add({ email: "ana@example.com", region: "EUW" })).resolves.toBe(
      "created",
    );

    const rows = await db.select().from(waitlistEntries);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ email: "ana@example.com", region: "EUW" });
    expect(rows[0].createdAt).toBeInstanceOf(Date);
  });

  it("#4 CA-4: a repeated email, in any letter case, is not duplicated", async () => {
    const repository = postgresWaitlistRepository(db);
    await repository.add({ email: "ana@example.com", region: "EUW" });

    await expect(repository.add({ email: "ana@example.com", region: "LAS" })).resolves.toBe(
      "already-exists",
    );
    // The domain normalizes emails; the index also guards against rows written by other paths.
    await expect(repository.add({ email: "ANA@example.com", region: "LAS" })).resolves.toBe(
      "already-exists",
    );
    await expect(db.select().from(waitlistEntries)).resolves.toHaveLength(1);
  });
});
