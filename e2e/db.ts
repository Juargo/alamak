import { Pool } from "pg";

/** Local, disposable database shared by the app under test and the E2E checks. */
export function testDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL;
  if (!url || !["localhost", "127.0.0.1"].includes(new URL(url).hostname)) {
    throw new Error("E2E needs TEST_DATABASE_URL pointing to a local, disposable Postgres");
  }
  return url;
}

/** Counts stored sign-ups for an email, ignoring letter case like the unique index. */
export async function countSignups(email: string): Promise<number> {
  const pool = new Pool({ connectionString: testDatabaseUrl() });
  try {
    const result = await pool.query<{ count: string }>(
      "select count(*) from waitlist_entries where lower(email) = lower($1)",
      [email],
    );
    return Number(result.rows[0].count);
  } finally {
    await pool.end();
  }
}
