import "server-only";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { getPool } from "./pool";

let db: NodePgDatabase | undefined;

/** Drizzle over the shared pool (ADR-0016). */
export function getDb(): NodePgDatabase {
  db ??= drizzle({ client: getPool() });
  return db;
}
