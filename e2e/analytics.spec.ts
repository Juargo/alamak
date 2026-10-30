import { gunzipSync } from "node:zlib";
import { expect, test, type Request } from "@playwright/test";
import { ANALYTICS_HOST } from "../playwright.config";

type CapturedEvent = { event: string; properties: Record<string, unknown> };

/** Decodes a PostHog batch, which may arrive gzipped. */
function decode(request: Request): { raw: string; events: CapturedEvent[] } {
  const body = request.postDataBuffer() ?? Buffer.alloc(0);
  const raw = body[0] === 0x1f && body[1] === 0x8b ? gunzipSync(body).toString() : body.toString();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { raw, events: [] };
  }
  const list = Array.isArray(parsed)
    ? parsed
    : ((parsed as { batch?: unknown[] }).batch ?? [parsed]);
  return { raw, events: list as CapturedEvent[] };
}

test.use({
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
});

test("#6 CA-2 and CA-4: records the visit with its source and the sign-up, never the email", async ({
  page,
  context,
}, testInfo) => {
  // PostHog drops events from automated browsers (user agent, client hints, webdriver flag).
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    Object.defineProperty(navigator, "userAgentData", { get: () => undefined });
  });
  const payloads: string[] = [];
  const events: CapturedEvent[] = [];
  await page.route(`${ANALYTICS_HOST}/**`, async (route) => {
    const decoded = decode(route.request());
    payloads.push(decoded.raw);
    events.push(...decoded.events);
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  const email = `e2e-analytics-${testInfo.project.name}-${Date.now()}@example.com`;

  await page.goto("/?utm_source=discord&utm_medium=social");
  await page.getByLabel("Correo").fill(email);
  await page.getByLabel("Región").selectOption("EUW");
  await page.getByRole("button", { name: "Unirme a la lista de espera" }).click();
  await expect(page.getByText("Listo, estás en la lista")).toBeVisible();

  await expect
    .poll(() => events.map((event) => event.event), { timeout: 15_000 })
    .toEqual(expect.arrayContaining(["$pageview", "lista_espera_inscrito"]));
  const pageview = events.find((event) => event.event === "$pageview");
  expect(pageview?.properties).toMatchObject({ utm_source: "discord", utm_medium: "social" });
  const signup = events.find((event) => event.event === "lista_espera_inscrito");
  expect(signup?.properties).toMatchObject({ region: "EUW" });

  expect(payloads.join("\n")).not.toContain(email);
  // Cookieless: nothing stored in the browser, so no cookie banner is needed.
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
});
