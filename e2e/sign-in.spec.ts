import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { E2E_AUTH } from "../playwright.config";
import { createPlayer, deletePlayer, signIn } from "./auth";

const RIOT_NOTICE = /Alamak no está respaldado por Riot Games/;

async function expectNoSeriousA11yIssues(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );
  expect(serious.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
}

// Each test gets its own player, because the three device projects share the database.
let playerId: string;
let playerEmail: string;

test.beforeEach(async ({}, testInfo) => {
  playerEmail = `ana-${testInfo.project.name}-${testInfo.testId}@example.com`;
  playerId = await createPlayer(playerEmail, "Ana");
});

test.afterEach(async () => {
  await deletePlayer(playerId);
});

test("#23 S5: the diary answers a visitor without a session with a redirect, not a page", async ({
  request,
}) => {
  const response = await request.get("/diario", { maxRedirects: 0 });

  expect(response.status()).toBe(307);
  expect(response.headers().location).toMatch(/\/ingresar$/);
});

test("#23 S4: using the diary renews the session cookie to 7 days", async ({ page, context }) => {
  await signIn(context, playerId, { remainingDays: 5 });

  await page.goto("/diario");

  const cookie = (await context.cookies()).find((c) => c.name.endsWith("session_token"));
  const sixDaysFromNow = Date.now() / 1000 + 6 * 24 * 60 * 60;
  expect(cookie?.expires).toBeGreaterThan(sixDaysFromNow);
});

test("#23 S5: the diary sends a visitor without a session to the sign-in page", async ({
  page,
}) => {
  await page.goto("/diario");

  await expect(page).toHaveURL(/\/ingresar$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Entra a tu diario");
  await expectNoSeriousA11yIssues(page);
});

test('#23 S1: "Continuar con Google" opens Google sign-in for Alamak', async ({ page }) => {
  let authorizeUrl: URL | undefined;
  await page.route("https://accounts.google.com/**", async (route) => {
    authorizeUrl = new URL(route.request().url());
    await route.fulfill({ body: "provider sign-in" });
  });
  await page.goto("/ingresar");

  await page.getByRole("button", { name: "Continuar con Google" }).click();

  await expect
    .poll(() => authorizeUrl?.searchParams.get("redirect_uri"))
    .toBe(`${E2E_AUTH.BETTER_AUTH_URL}/api/auth/callback/google`);
  expect(authorizeUrl?.searchParams.get("client_id")).toBe(E2E_AUTH.GOOGLE_CLIENT_ID);
});

test("#23 S1: Google is the only way to sign in for now", async ({ page }) => {
  await page.goto("/ingresar");

  await expect(page.getByRole("button", { name: /^Continuar con/ })).toHaveText([
    "Continuar con Google",
  ]);
});

test("#23 S6: a signed-in player sees the diary with the Riot Games notice", async ({
  page,
  context,
}) => {
  await signIn(context, playerId);

  await page.goto("/diario");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hola, Ana");
  await expect(page.getByRole("contentinfo").getByText(RIOT_NOTICE)).toBeVisible();
  await expectNoSeriousA11yIssues(page);
});

test("#23 a signed-in player who opens the sign-in page goes to the diary", async ({
  page,
  context,
}) => {
  await signIn(context, playerId);

  await page.goto("/ingresar");

  await expect(page).toHaveURL(/\/diario$/);
});

test("#23 S3: signing out ends the session on this device", async ({ page, context }) => {
  await signIn(context, playerId);
  await page.goto("/diario");

  await page.getByRole("button", { name: "Cerrar sesión", exact: true }).click();

  await expect(page).toHaveURL(/\/ingresar$/);
  await page.goto("/diario");
  await expect(page).toHaveURL(/\/ingresar$/);
});

test("#23 S3: signing out everywhere also ends the session on other devices", async ({
  page,
  context,
  browser,
}) => {
  await signIn(context, playerId);
  const otherDevice = await browser.newContext();
  await signIn(otherDevice, playerId);
  const otherPage = await otherDevice.newPage();
  await otherPage.goto("/diario");
  await expect(otherPage.getByRole("heading", { level: 1 })).toHaveText("Hola, Ana");

  await page.goto("/diario");
  await page.getByRole("button", { name: "Cerrar sesión en todos los dispositivos" }).click();

  await expect(page).toHaveURL(/\/ingresar$/);
  // The page left open on the other device, whose cookie has since expired, can still use
  // the button without an error.
  await otherDevice.clearCookies();
  await otherPage.getByRole("button", { name: "Cerrar sesión en todos los dispositivos" }).click();
  await expect(otherPage).toHaveURL(/\/ingresar$/);
  await otherPage.goto("/diario");
  await expect(otherPage).toHaveURL(/\/ingresar$/);
  await otherDevice.close();
});
