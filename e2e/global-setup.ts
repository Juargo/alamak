import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { testDatabaseUrl } from "./db";

/** Brings the disposable database to the current schema before the app starts. */
export default async function globalSetup() {
  const pool = new Pool({ connectionString: testDatabaseUrl() });
  try {
    await migrate(drizzle({ client: pool }), { migrationsFolder: "drizzle" });
  } finally {
    await pool.end();
  }
}
