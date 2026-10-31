import { defineConfig, devices } from "@playwright/test";
import { testDatabaseUrl } from "./e2e/db";

const port = 3200;
export const ANALYTICS_HOST = "http://127.0.0.1:3299";
export const BASE_URL = `http://127.0.0.1:${port}`;
export const FAKE_RIOT_PORT = 3298;

// Fake sign-in settings: E2E never reaches Google, and creates sessions with
// the same secret (e2e/auth.ts).
export const E2E_AUTH = {
  BETTER_AUTH_SECRET: "e2e-secret-with-at-least-32-characters!",
  BETTER_AUTH_URL: BASE_URL,
  GOOGLE_CLIENT_ID: "e2e-google-id",
  GOOGLE_CLIENT_SECRET: "e2e-google-secret",
};

// The app writes sign-ups to this database, so E2E only runs against a local, disposable one.
// Checked here too: the web server may start before the global setup runs.
const databaseUrl = testDatabaseUrl();

// E2E covers the Must flows on desktop and on iPhone and Android viewports (ADR-0012).
// Every project runs on Chromium to keep CI minutes low; the viewports differ.
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "iphone", use: { ...devices["iPhone 14"], browserName: "chromium" } },
    { name: "android", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `pnpm build && pnpm start --port ${port}`,
    url: BASE_URL,
    timeout: 180_000,
    reuseExistingServer: false,
    env: {
      DATABASE_URL: databaseUrl,
      // Analytics on, pointed at a local address that only the analytics test intercepts.
      NEXT_PUBLIC_POSTHOG_KEY: "phc_e2e",
      NEXT_PUBLIC_POSTHOG_HOST: ANALYTICS_HOST,
      ...E2E_AUTH,
      // The app talks to a local fake Riot (e2e/fake-riot.ts), never to the real API.
      RIOT_API_KEY: "RGAPI-e2e",
      RIOT_API_BASE_URL: `http://127.0.0.1:${FAKE_RIOT_PORT}`,
    },
  },
});
