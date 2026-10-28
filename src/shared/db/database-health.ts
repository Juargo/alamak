import "server-only";
import { getPool } from "@/shared/db/pool";

/** Checks that Postgres answers a trivial query. */
export async function isDatabaseReachable(): Promise<boolean> {
  try {
    const result = await getPool().query<{ ok: number }>("select 1 as ok");
    return result.rows[0]?.ok === 1;
  } catch {
    return false;
  }
}
