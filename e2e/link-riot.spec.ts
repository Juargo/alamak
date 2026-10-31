import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { createPlayer, deletePlayer, signIn } from "./auth";

// Riot IDs the fake Riot knows (e2e/fake-riot.ts).
const KNOWN = "Señor Tilt#LAS";
const UNAVAILABLE = "Caido#LAS";

let playerId: string;

// A Mexican browser: the region is preselected from its language (LAN).
test.use({ locale: "es-MX" });

test.beforeEach(async ({ context }, testInfo) => {
  playerId = await createPlayer(
    `riot-${testInfo.project.name}-${testInfo.testId}@example.com`,
    "Ana",
  );
  await signIn(context, playerId);
});

test.afterEach(async () => {
  await deletePlayer(playerId);
});

test("#25 S1 S6: linking a Riot account shows it as linked and still to be verified", async ({
  page,
}) => {
  await page.goto("/diario");
  await expect(page.getByLabel("Región")).toHaveValue("LAN");
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? "")),
  ).toEqual([]);

  await page.getByLabel("Riot ID").fill(KNOWN);
  await page.getByLabel("Región").selectOption("LAS");
  await page.getByRole("button", { name: "Vincular cuenta" }).click();

  await expect(
    page.getByRole("heading", { name: `Cuenta vinculada: ${KNOWN} (LAS)` }),
  ).toBeVisible();
  await expect(page.getByText("Falta comprobar que esta cuenta es tuya.")).toBeVisible();
});

test("#25 S5: once linked, the form to link another account is gone, also after reloading", async ({
  page,
}) => {
  await page.goto("/diario");
  await page.getByLabel("Riot ID").fill(KNOWN);
  await page.getByLabel("Región").selectOption("LAS");
  await page.getByRole("button", { name: "Vincular cuenta" }).click();
  await expect(page.getByRole("heading", { name: /Cuenta vinculada/ })).toBeVisible();

  await page.reload();

  await expect(
    page.getByRole("heading", { name: `Cuenta vinculada: ${KNOWN} (LAS)` }),
  ).toBeVisible();
  await expect(page.getByLabel("Riot ID")).toHaveCount(0);
});

test("#25 S1: an account that plays in another region is not linked to the wrong one", async ({
  page,
}) => {
  await page.goto("/diario");
  await page.getByLabel("Riot ID").fill(KNOWN);
  await page.getByLabel("Región").selectOption("EUW");

  await page.getByRole("button", { name: "Vincular cuenta" }).click();

  await expect(
    page.getByText(
      "No encontramos esa cuenta en la región elegida. Revisa el nombre, el tag y la región.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /Cuenta vinculada/ })).toHaveCount(0);
});

for (const [name, riotId, message] of [
  [
    "a malformed Riot ID",
    "SinTag",
    "Escribe tu Riot ID como aparece en el cliente, por ejemplo Nombre#TAG.",
  ],
  [
    "an account Riot does not know",
    "Nadie#LAS",
    "No encontramos esa cuenta en la región elegida. Revisa el nombre, el tag y la región.",
  ],
  [
    "Riot being down",
    UNAVAILABLE,
    "Riot no responde en este momento. Vuelve a intentarlo en unos minutos.",
  ],
] as const) {
  test(`#25 S1: ${name} shows a clear error and keeps what was typed`, async ({ page }) => {
    await page.goto("/diario");
    await page.getByLabel("Riot ID").fill(riotId);
    await page.getByLabel("Región").selectOption("LAS");

    await page.getByRole("button", { name: "Vincular cuenta" }).click();

    await expect(page.getByText(message)).toBeVisible();
    await expect(page.getByLabel("Riot ID")).toHaveValue(riotId);
    await expect(page.getByLabel("Región")).toHaveValue("LAS");
    await expect(page.getByRole("heading", { name: /Cuenta vinculada/ })).toHaveCount(0);
  });
}
