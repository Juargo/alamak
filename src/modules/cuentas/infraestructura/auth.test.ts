import { betterAuth } from "better-auth";
import { testUtils } from "better-auth/plugins";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { authOptions } from "./auth";
import { user } from "./schema";

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
      DISCORD_CLIENT_ID: "discord-id",
      DISCORD_CLIENT_SECRET: "discord-secret",
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
  });

  afterAll(async () => {
    await pool?.end();
  });

  async function signedInPlayer() {
    const test = (await auth.$context).test;
    const player = test.createUser({ email: "ana@example.com", name: "Ana" });
    await test.saveUser(player);
    return { test, player };
  }

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
