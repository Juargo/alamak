import { defineConfig, devices } from "@playwright/test";
import { testDatabaseUrl } from "./e2e/db";

const port = 3200;

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
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "iphone", use: { ...devices["iPhone 14"], browserName: "chromium" } },
    { name: "android", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `pnpm build && pnpm start --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    timeout: 180_000,
    reuseExistingServer: false,
    env: { DATABASE_URL: databaseUrl },
  },
});
