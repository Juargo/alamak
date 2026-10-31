import type { BrowserContext } from "@playwright/test";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { testUtils } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { E2E_AUTH } from "../playwright.config";
import * as schema from "../src/modules/cuentas/infraestructura/schema";
import { testDatabaseUrl } from "./db";

// Test-only Better Auth instance that creates players and sessions without going through
// Google. It shares only the database, secret and base URL with the app under test (the
// app's authOptions import `server-only`); sessions it creates use Better Auth's defaults,
// so tests that depend on the app's session length set it explicitly (see `signIn`).
const pool = new Pool({ connectionString: testDatabaseUrl() });

const auth = betterAuth({
  secret: E2E_AUTH.BETTER_AUTH_SECRET,
  baseURL: E2E_AUTH.BETTER_AUTH_URL,
  database: drizzleAdapter(drizzle({ client: pool }), { provider: "pg", schema }),
  plugins: [testUtils()],
});

/** Creates a player with a verified email and returns its id. */
export async function createPlayer(email: string, name: string): Promise<string> {
  const test = (await auth.$context).test;
  const player = test.createUser({ email, name, emailVerified: true });
  await test.saveUser(player);
  return player.id;
}

/**
 * Signs the player in on this browser, as a new device. With `remainingDays`, the session
 * and its cookie look as if they were created earlier and expire in that many days.
 */
export async function signIn(
  context: BrowserContext,
  userId: string,
  options: { remainingDays?: number } = {},
): Promise<void> {
  const test = (await auth.$context).test;
  const cookies = await test.getCookies({ userId, domain: "127.0.0.1" });
  if (options.remainingDays !== undefined) {
    const expires = new Date(Date.now() + options.remainingDays * 24 * 60 * 60 * 1000);
    await pool.query("update sessions set expires_at = $1 where user_id = $2", [expires, userId]);
    for (const cookie of cookies) cookie.expires = Math.floor(expires.getTime() / 1000);
  }
  await context.addCookies(cookies);
}

export async function deletePlayer(userId: string): Promise<void> {
  const test = (await auth.$context).test;
  await test.deleteUser(userId);
}
