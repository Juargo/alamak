import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";
import { getServerEnv } from "@/shared/config/env";

let pool: Pool | undefined;

/**
 * Shared Postgres pool over Neon's pooled connection string.
 * On Vercel Fluid compute, attachDatabasePool closes idle clients before the function suspends.
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: getServerEnv().DATABASE_URL });
    attachDatabasePool(pool);
  }
  return pool;
}
