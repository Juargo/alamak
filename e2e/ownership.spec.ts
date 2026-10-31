import { expect, test, type Page } from "@playwright/test";
import { Pool } from "pg";
import { FAKE_RIOT_PORT } from "../playwright.config";
import { createPlayer, deletePlayer, signIn } from "./auth";
import { testDatabaseUrl } from "./db";

let playerId: string;
let riotName: string;

test.use({ locale: "es-CL" });

test.beforeEach(async ({ context }, testInfo) => {
  // Each test plays with its own Riot account: one Riot account can be verified only once.
  riotName = `E2E${testInfo.project.name.slice(0, 3)}${Math.random().toString(36).slice(2, 8)}`;
  playerId = await createPlayer(
    `own-${testInfo.project.name}-${testInfo.testId}@example.com`,
    "Ana",
  );
  await signIn(context, playerId);
});

test.afterEach(async () => {
  await deletePlayer(playerId);
});

async function linkAccount(page: Page) {
  await page.goto("/diario");
  await page.getByLabel("Riot ID").fill(`${riotName}#LAS`);
  await page.getByLabel("Región").selectOption("LAS");
  await page.getByRole("button", { name: "Vincular cuenta" }).click();
  await expect(page.getByRole("heading", { name: /Comprueba que/ })).toBeVisible();
}

/** The icon the page asks for, read from the image's accessible name. */
async function challengeIcon(page: Page): Promise<number> {
  const alt = await page.getByRole("img", { name: /Ícono de perfil \d+/ }).getAttribute("alt");
  return Number(alt?.match(/\d+/)?.[0]);
}

async function setRiotIcon(iconId: number) {
  const puuid = `puuid-${riotName.toLowerCase()}`;
  await fetch(`http://127.0.0.1:${FAKE_RIOT_PORT}/__test/icon/${puuid}/${iconId}`, {
    method: "POST",
  });
}

async function storedMatches(): Promise<number> {
  const pool = new Pool({ connectionString: testDatabaseUrl() });
  try {
    const result = await pool.query<{ count: string }>(
      "select count(*) from riot_matches where user_id = $1",
      [playerId],
    );
    return Number(result.rows[0].count);
  } finally {
    await pool.end();
  }
}

test("#26 S1 S5: after linking, the diary shows the icon to set with steps, and no games", async ({
  page,
}) => {
  await linkAccount(page);

  const icon = await challengeIcon(page);
  expect(icon).toBeGreaterThanOrEqual(0);
  expect(icon).not.toBe(7); // the fake Riot's current icon
  await expect(page.getByRole("img", { name: `Ícono de perfil ${icon}` })).toHaveAttribute(
    "src",
    `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${icon}.png`,
  );
  await expect(page.getByRole("listitem")).toHaveCount(4);
  await expect(page.getByText(/Partidas ranked guardadas/)).toHaveCount(0);
  expect(await storedMatches()).toBe(0);
});

test("#26 S3: a different icon gets a clear message, and retrying too soon asks to wait", async ({
  page,
}) => {
  await linkAccount(page);

  await page.getByRole("button", { name: "Ya lo cambié" }).click();
  await expect(page.getByText(/Todavía vemos otro ícono en tu cuenta/)).toBeVisible();
  await page.getByRole("button", { name: "Ya lo cambié" }).click();

  await expect(page.getByText(/Espera \d+ segundos antes de volver a comprobar/)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Cuenta comprobada/ })).toHaveCount(0);
});

test("#26 S2 S4 S6: setting the icon verifies the account, imports the games and says the icon can go back", async ({
  page,
}) => {
  await linkAccount(page);
  await setRiotIcon(await challengeIcon(page));

  await page.getByRole("button", { name: "Ya lo cambié" }).click();

  await expect(
    page.getByRole("heading", { name: `Cuenta comprobada: ${riotName}#LAS (LAS)` }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toHaveText(
    "Listo, ya comprobamos que la cuenta es tuya. Puedes volver a poner tu ícono de siempre.",
  );
  await expect.poll(storedMatches, { timeout: 10_000 }).toBe(2);
  await page.goto("/diario");
  await expect(page.getByText("Partidas ranked guardadas: 2.", { exact: false })).toBeVisible();
});
