import type { BrowserContext } from "@playwright/test";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { testUtils } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { E2E_AUTH } from "../playwright.config";
import * as schema from "../src/modules/cuentas/infraestructura/schema";
import { testDatabaseUrl } from "./db";

// Test-only Better Auth instance: same database and secret as the app under test, plus
// testUtils to create players and sessions without going through Discord or Google.
let pool: Pool | undefined;

function testAuth() {
  pool ??= new Pool({ connectionString: testDatabaseUrl() });
  return betterAuth({
    secret: E2E_AUTH.BETTER_AUTH_SECRET,
    baseURL: E2E_AUTH.BETTER_AUTH_URL,
    database: drizzleAdapter(drizzle({ client: pool }), { provider: "pg", schema }),
    plugins: [testUtils()],
  });
}

const auth = testAuth();

/** Creates a player with a verified email and returns its id. */
export async function createPlayer(email: string, name: string): Promise<string> {
  const test = (await auth.$context).test;
  const player = test.createUser({ email, name, emailVerified: true });
  await test.saveUser(player);
  return player.id;
}

/** Signs the player in on this browser, as a new device. */
export async function signIn(context: BrowserContext, userId: string): Promise<void> {
  const test = (await auth.$context).test;
  await context.addCookies(await test.getCookies({ userId, domain: "127.0.0.1" }));
}

export async function deletePlayer(userId: string): Promise<void> {
  const test = (await auth.$context).test;
  await test.deleteUser(userId);
}
