import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const AUTH_ENV = {
  BETTER_AUTH_SECRET: "test-secret-with-at-least-32-characters!",
  BETTER_AUTH_URL: "https://alamak.example",
  GOOGLE_CLIENT_ID: "google-id",
  GOOGLE_CLIENT_SECRET: "google-secret",
};

// getAuthEnv caches its result, so each case loads a fresh copy of the module.
async function loadGetAuthEnv() {
  vi.resetModules();
  return (await import("./env")).getAuthEnv;
}

describe("getAuthEnv", () => {
  beforeEach(() => {
    for (const [name, value] of Object.entries(AUTH_ENV)) vi.stubEnv(name, value);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("#23 returns the sign-in settings when all of them are present", async () => {
    const getAuthEnv = await loadGetAuthEnv();

    expect(getAuthEnv()).toEqual(AUTH_ENV);
  });

  it("#23 names every missing or invalid setting", async () => {
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "");
    vi.stubEnv("BETTER_AUTH_SECRET", "too-short");
    const getAuthEnv = await loadGetAuthEnv();

    expect(() => getAuthEnv()).toThrow(
      "Invalid auth environment variables: BETTER_AUTH_SECRET, GOOGLE_CLIENT_SECRET",
    );
  });

  it("#23 S4: production refuses an http base URL, which would drop the Secure cookie flag", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("BETTER_AUTH_URL", "http://alamak.example");
    const getAuthEnv = await loadGetAuthEnv();

    expect(() => getAuthEnv()).toThrow("Invalid auth environment variables: BETTER_AUTH_URL");
  });

  it("#23 local runs may use an http base URL", async () => {
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("BETTER_AUTH_URL", "http://127.0.0.1:3200");
    const getAuthEnv = await loadGetAuthEnv();

    expect(getAuthEnv().BETTER_AUTH_URL).toBe("http://127.0.0.1:3200");
  });
});
