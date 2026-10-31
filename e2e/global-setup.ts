import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { FAKE_RIOT_PORT } from "../playwright.config";
import { testDatabaseUrl } from "./db";
import { startFakeRiot } from "./fake-riot";

/**
 * Brings the disposable database to the current schema and starts the fake Riot; the
 * returned function stops it after the run.
 */
export default async function globalSetup() {
  const pool = new Pool({ connectionString: testDatabaseUrl() });
  try {
    await migrate(drizzle({ client: pool }), { migrationsFolder: "drizzle" });
  } finally {
    await pool.end();
  }
  const fakeRiot = await startFakeRiot(FAKE_RIOT_PORT);
  return () => new Promise<void>((resolve) => fakeRiot.close(() => resolve()));
}
