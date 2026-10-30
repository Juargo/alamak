import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("#5 CA-1: the landing links to the privacy policy in Spanish", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("contentinfo").getByRole("link", { name: "Política de privacidad" }).click();

  await expect(page).toHaveURL(/\/privacidad$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Política de privacidad");
});

test("#5 CA-2: the policy covers controller, data, purpose, retention, rights and processors", async ({
  page,
}) => {
  await page.goto("/privacidad");

  for (const heading of [
    "Quién es responsable de tus datos",
    "Qué datos guardamos",
    "Para qué los usamos",
    "Cuánto tiempo los guardamos",
    "Quién nos ayuda a tratarlos",
    "Tus derechos y cómo ejercerlos",
  ]) {
    await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
  }
  for (const processor of ["Vercel", "Neon", "Resend", "PostHog"]) {
    await expect(page.getByText(processor, { exact: true })).toBeVisible();
  }
  await expect(
    page.getByRole("link", { name: "jorgeretamal.jjr@gmail.com" }).first(),
  ).toHaveAttribute("href", "mailto:jorgeretamal.jjr@gmail.com");

  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );
  expect(serious.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
});

test("#5 CA-3 and CA-4: version, date and draft status are visible", async ({ page }) => {
  await page.goto("/privacidad");

  await expect(page.getByText(/^Versión \d+\.\d+ · \d+ de \w+ de \d{4}$/)).toBeVisible();
  await expect(page.getByRole("note")).toHaveText("Borrador pendiente de revisión legal");
});
