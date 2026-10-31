import "server-only";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { nextCookies } from "better-auth/next-js";
import { getAuthEnv } from "@/shared/config/env";
import { getDb } from "@/shared/db/drizzle";
import * as schema from "./schema";

const DAY_IN_SECONDS = 60 * 60 * 24;

/**
 * Better Auth settings shared by the app and the test-only instance (ADR-0017).
 * Passwordless: Discord and Google; the email link waits for the own domain (#21).
 */
export function authOptions(db: NodePgDatabase = getDb()): BetterAuthOptions {
  const env = getAuthEnv();
  return {
    appName: "Alamak",
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, { provider: "pg", schema }),
    emailAndPassword: { enabled: false },
    socialProviders: {
      discord: { clientId: env.DISCORD_CLIENT_ID, clientSecret: env.DISCORD_CLIENT_SECRET },
      google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET },
    },
    // Stored session, 7 days, renewed at most once a day while in use.
    session: { expiresIn: 7 * DAY_IN_SECONDS, updateAge: DAY_IN_SECONDS },
    // Cookies are HttpOnly and SameSite=Lax by default, and Secure whenever the base URL is https.
    rateLimit: { storage: "database" },
  };
}

function createAuth() {
  // nextCookies must stay the last plugin so Server Actions can set the session cookie.
  return betterAuth({ ...authOptions(), plugins: [nextCookies()] });
}

let auth: ReturnType<typeof createAuth> | undefined;

/** Lazy, so `next build` runs without the sign-in secrets. */
export function getAuth() {
  auth ??= createAuth();
  return auth;
}
