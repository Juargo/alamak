import { betterAuth } from "better-auth";
import { testUtils } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { authOptions } from "./auth";
import { rateLimit as rateLimitTable, session as sessionTable, user } from "./schema";

const url = process.env.TEST_DATABASE_URL;

// This suite empties the auth tables, so it only runs against a local, disposable database.
const isLocal = url !== undefined && ["localhost", "127.0.0.1"].includes(new URL(url).hostname);

if (process.env.CI && !isLocal) {
  throw new Error("CI must set TEST_DATABASE_URL to a local Postgres for integration tests");
}

const DAY_MS = 24 * 60 * 60 * 1000;

function createTestAuth(db: NodePgDatabase) {
  return betterAuth({ ...authOptions(db), plugins: [testUtils()] });
}

describe.runIf(isLocal)("auth sessions (integration)", () => {
  let pool: Pool;
  let db: NodePgDatabase;
  let auth: ReturnType<typeof createTestAuth>;

  beforeAll(async () => {
    Object.assign(process.env, {
      BETTER_AUTH_SECRET: "test-secret-with-at-least-32-characters!",
      BETTER_AUTH_URL: "https://alamak.example",
      GOOGLE_CLIENT_ID: "google-id",
      GOOGLE_CLIENT_SECRET: "google-secret",
    });
    pool = new Pool({ connectionString: url });
    db = drizzle({ client: pool });
    await migrate(db, { migrationsFolder: "drizzle" });
    auth = createTestAuth(db);
  });

  beforeEach(async () => {
    await db.delete(user);
    await db.delete(rateLimitTable);
  });

  afterAll(async () => {
    await pool?.end();
  });

  async function signedInPlayer() {
    const test = (await auth.$context).test;
    const player = test.createUser({ email: "ana@example.com", name: "Ana", emailVerified: true });
    await test.saveUser(player);
    return { test, player };
  }

  it("#23 S1: an account never starts from an unverified provider email", async () => {
    const test = (await auth.$context).test;
    const intruder = test.createUser({ email: "ana@example.com", emailVerified: false });

    expect(await test.saveUser(intruder)).toBeNull();

    expect(await db.select().from(user)).toEqual([]);
  });

  it("#23 S4: a session in use is renewed to 7 days once a day has passed", async () => {
    const { test, player } = await signedInPlayer();
    const { session, headers } = await test.login({ userId: player.id });
    // Age the session by two days, as if it had been created then.
    await db
      .update(sessionTable)
      .set({ expiresAt: new Date(session.expiresAt.getTime() - 2 * DAY_MS) })
      .where(eq(sessionTable.id, session.id));

    const renewed = await auth.api.getSession({ headers });

    expect(renewed?.session.expiresAt.getTime()).toBeGreaterThan(Date.now() + 7 * DAY_MS - 60_000);
    const [stored] = await db.select().from(sessionTable).where(eq(sessionTable.id, session.id));
    expect(stored.expiresAt.getTime()).toBeGreaterThan(Date.now() + 7 * DAY_MS - 60_000);
  });

  it("#23 the raw API does not let a player rename, delete or relink the account", async () => {
    const { test, player } = await signedInPlayer();
    const headers = await test.getAuthHeaders({ userId: player.id });

    for (const path of [
      "/update-user",
      "/change-email",
      "/delete-user",
      "/link-social",
      "/unlink-account",
    ]) {
      const response = await auth.handler(
        new Request(`https://alamak.example/api/auth${path}`, {
          method: "POST",
          headers: { ...Object.fromEntries(headers), "content-type": "application/json" },
          body: JSON.stringify({ name: "Otro", newEmail: "otro@example.com", provider: "google" }),
        }),
      );
      expect(response.status, path).toBe(404);
    }
    const [stored] = await db.select().from(user);
    expect(stored).toMatchObject({ name: "Ana", email: "ana@example.com" });
  });

  it("#23 an expired or replayed Google return comes back to the sign-in page", async () => {
    const response = await auth.handler(
      new Request("https://alamak.example/api/auth/callback/google?state=replayed&code=x"),
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toMatch(
      /^https:\/\/alamak\.example\/ingresar\?error=/,
    );
  });

  it("#23 rate limiting counts requests in the database and rejects the excess", async () => {
    const limited = betterAuth({
      ...authOptions(db),
      rateLimit: { enabled: true, storage: "database", window: 60, max: 2 },
    });
    const request = () =>
      limited.handler(
        new Request("https://alamak.example/api/auth/get-session", {
          headers: { "x-forwarded-for": "203.0.113.7" },
        }),
      );

    const statuses = [];
    for (let i = 0; i < 3; i++) statuses.push((await request()).status);

    expect(statuses).toEqual([200, 200, 429]);
    expect(await db.select().from(rateLimitTable)).toHaveLength(1);
  });

  it("#23 S4: the session cookie is HttpOnly, Secure and SameSite=Lax", async () => {
    const { test, player } = await signedInPlayer();

    const cookies = await test.getCookies({ userId: player.id });

    const sessionCookie = cookies.find((cookie) => cookie.name.endsWith("session_token"));
    expect(sessionCookie).toMatchObject({ httpOnly: true, secure: true, sameSite: "Lax" });
  });

  it("#23 S4: a session lasts 7 days and identifies its user", async () => {
    const { test, player } = await signedInPlayer();

    const { session, headers } = await test.login({ userId: player.id });

    expect(session.expiresAt.getTime() - Date.now()).toBeGreaterThan(7 * DAY_MS - 60_000);
    expect(session.expiresAt.getTime() - Date.now()).toBeLessThanOrEqual(7 * DAY_MS);
    const current = await auth.api.getSession({ headers });
    expect(current?.user.email).toBe("ana@example.com");
  });

  it("#23 S3: signing out everywhere ends every session of the user", async () => {
    const { test, player } = await signedInPlayer();
    const laptop = await test.getAuthHeaders({ userId: player.id });
    const phone = await test.getAuthHeaders({ userId: player.id });

    await auth.api.revokeSessions({ headers: laptop });

    expect(await auth.api.getSession({ headers: laptop })).toBeNull();
    expect(await auth.api.getSession({ headers: phone })).toBeNull();
  });

  it("#23 S3: signing out ends only the current session", async () => {
    const { test, player } = await signedInPlayer();
    const laptop = await test.getAuthHeaders({ userId: player.id });
    const phone = await test.getAuthHeaders({ userId: player.id });

    await auth.api.signOut({ headers: laptop });

    expect(await auth.api.getSession({ headers: laptop })).toBeNull();
    expect((await auth.api.getSession({ headers: phone }))?.user.id).toBe(player.id);
  });
});
