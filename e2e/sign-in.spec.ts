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

test("#23 S5: the diary sends a visitor without a session to the sign-in page", async ({
  page,
}) => {
  await page.goto("/diario");

  await expect(page).toHaveURL(/\/ingresar$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Entra a tu diario");
  await expectNoSeriousA11yIssues(page);
});

for (const provider of [
  { name: "Discord", id: "discord", host: "https://discord.com/**" },
  { name: "Google", id: "google", host: "https://accounts.google.com/**" },
]) {
  test(`#23 S1: "Continuar con ${provider.name}" opens ${provider.name} sign-in for Alamak`, async ({
    page,
  }) => {
    let authorizeUrl: URL | undefined;
    await page.route(provider.host, async (route) => {
      authorizeUrl = new URL(route.request().url());
      await route.fulfill({ body: "provider sign-in" });
    });
    await page.goto("/ingresar");

    await page.getByRole("button", { name: `Continuar con ${provider.name}` }).click();

    await expect
      .poll(() => authorizeUrl?.searchParams.get("redirect_uri"))
      .toBe(`${E2E_AUTH.BETTER_AUTH_URL}/api/auth/callback/${provider.id}`);
    expect(authorizeUrl?.searchParams.get("client_id")).toBe(
      provider.id === "discord" ? E2E_AUTH.DISCORD_CLIENT_ID : E2E_AUTH.GOOGLE_CLIENT_ID,
    );
  });
}

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
  await otherPage.goto("/diario");
  await expect(otherPage).toHaveURL(/\/ingresar$/);
  await otherDevice.close();
});
