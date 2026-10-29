export const REGIONS = ["LAS", "LAN", "EUW"] as const;

export type Region = (typeof REGIONS)[number];

/** A waitlist sign-up keeps only email and region (D-20). */
export type WaitlistSignup = { email: string; region: Region };

export type ParsedSignup =
  { ok: true; signup: WaitlistSignup } | { ok: false; field: "email" | "region" };

// Pragmatic shape check: one "@", no spaces, a dot in the domain. Delivery is the real test.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isRegion(value: unknown): value is Region {
  return REGIONS.includes(value as Region);
}

/** Validates raw form input and normalizes the email (trimmed, lowercase). */
export function parseWaitlistSignup(input: { email: unknown; region: unknown }): ParsedSignup {
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  if (!EMAIL_PATTERN.test(email)) return { ok: false, field: "email" };
  if (!isRegion(input.region)) return { ok: false, field: "region" };
  return { ok: true, signup: { email, region: input.region } };
}
