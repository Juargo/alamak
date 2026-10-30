import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { countSignups } from "./db";

/** A unique address per test and project, so runs never collide in the shared database. */
function uniqueEmail(testInfo: { project: { name: string } }): string {
  return `e2e-${testInfo.project.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function expectNoSeriousA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );
  expect(serious.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
}

test("#4 CA-1: the landing shows every section without serious accessibility issues", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("¿Qué te está costando LP?");
  await expect(page.getByRole("heading", { name: "Cómo funciona" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tus notas son tuyas" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Únete a la lista de espera" })).toBeVisible();
  // No horizontal scroll on any viewport.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  await expectNoSeriousA11yViolations(page);
});

test("#4 CA-2: the hero button takes you to the waitlist form", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Unirme a la lista de espera" }).click();

  await expect(page).toHaveURL(/#lista-de-espera$/);
  await expect(page.getByLabel("Correo")).toBeInViewport();
});

test.describe("region preselection", () => {
  test.use({ extraHTTPHeaders: { "x-vercel-ip-country": "MX" } });

  test("#4 CA-3: preselects the region of the visitor's country", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByLabel("Región")).toHaveValue("LAN");
  });
});

test("#4 CA-3: an invalid email shows the error and keeps what was typed and chosen", async ({
  page,
}) => {
  await page.goto("/");
  const email = page.getByLabel("Correo");
  const region = page.getByLabel("Región");

  await email.fill("no-es-un-correo");
  await region.selectOption("EUW");
  await page.getByRole("button", { name: "Unirme a la lista de espera" }).click();

  await expect(
    page.getByText("Revisa el correo: debe tener la forma nombre@dominio.com."),
  ).toBeVisible();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(email).toHaveValue("no-es-un-correo");
  await expect(region).toHaveValue("EUW");
  expect(await countSignups("no-es-un-correo")).toBe(0);
});

test("#4 CA-4: a new email is enrolled once, and repeating it shows the same message without duplicating it", async ({
  page,
}, testInfo) => {
  const address = uniqueEmail(testInfo);

  for (const typed of [address, address.toUpperCase()]) {
    await page.goto("/");
    await page.getByLabel("Correo").fill(typed);
    await page.getByLabel("Región").selectOption("LAS");
    await page.getByRole("button", { name: "Unirme a la lista de espera" }).click();

    const status = page.getByRole("status");
    await expect(status.getByText("Listo, estás en la lista")).toBeVisible();
    await expect(status).toContainText(typed);
    // The email stays out of the URL (it would end up in logs).
    expect(page.url()).not.toContain(encodeURIComponent(typed));
  }

  expect(await countSignups(address)).toBe(1);
  await expectNoSeriousA11yViolations(page);
});

test("#4 CA-5: the privacy policy link and the Riot notice are visible", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Política de privacidad" }).first()).toBeVisible();
  await expect(page.getByText("Alamak no está respaldado por Riot Games")).toBeVisible();
});
