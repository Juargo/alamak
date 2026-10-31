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
 * Passwordless sign-in with Google; Discord and the email link are planned for later.
 */
export function authOptions(db: NodePgDatabase = getDb()): BetterAuthOptions {
  const env = getAuthEnv();
  return {
    appName: "Alamak",
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, { provider: "pg", schema }),
    emailAndPassword: { enabled: false },
    // Endpoints the app does not offer: players cannot rename themselves, change email,
    // delete the account or link providers through the raw API (deletion comes with #35).
    disabledPaths: [
      "/update-user",
      "/change-email",
      "/delete-user",
      "/link-social",
      "/unlink-account",
    ],
    socialProviders: {
      google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET },
    },
    // A provider may only join an existing account when both emails are verified, so a future
    // provider with an unverified email cannot take over someone else's account.
    account: { accountLinking: { enabled: true, requireLocalEmailVerified: true } },
    databaseHooks: {
      user: {
        create: {
          // Nor can it claim an email first: accounts start only from a verified email.
          before: async (user) => (user.emailVerified ? { data: user } : false),
        },
      },
    },
    // Stored session, 7 days, renewed at most once a day while in use. Its cookie is HttpOnly
    // and SameSite=Lax by default, and Secure whenever the base URL is https.
    session: { expiresIn: 7 * DAY_IN_SECONDS, updateAge: DAY_IN_SECONDS },
    // Better Auth enables the limit only in production; counters live in the database
    // because serverless functions share no memory.
    rateLimit: { storage: "database" },
    // OAuth failures that happen before the sign-in's own error URL is known (an expired or
    // replayed state) also return to the sign-in page, with Better Auth's error code.
    onAPIError: { errorURL: `${env.BETTER_AUTH_URL}/ingresar` },
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
