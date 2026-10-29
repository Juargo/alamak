import { describe, expect, it } from "vitest";
import { parseWaitlistSignup } from "./waitlist";

describe("parseWaitlistSignup", () => {
  it("#4 CA-3: accepts an email and one of the LAS, LAN or EUW regions", () => {
    for (const region of ["LAS", "LAN", "EUW"]) {
      expect(parseWaitlistSignup({ email: "ana@example.com", region })).toEqual({
        ok: true,
        signup: { email: "ana@example.com", region },
      });
    }
  });

  it("#4 CA-4: normalizes the email so the same person is not stored twice", () => {
    expect(parseWaitlistSignup({ email: "  Ana@Example.COM ", region: "LAS" })).toEqual({
      ok: true,
      signup: { email: "ana@example.com", region: "LAS" },
    });
  });

  it("#4 CA-3: rejects an invalid email", () => {
    for (const email of ["", "ana", "ana@", "@example.com", "ana @example.com"]) {
      expect(parseWaitlistSignup({ email, region: "LAS" })).toEqual({
        ok: false,
        field: "email",
      });
    }
  });

  it("#4 CA-3: rejects a region outside LAS, LAN and EUW", () => {
    for (const region of ["", "NA", "las", undefined]) {
      expect(parseWaitlistSignup({ email: "ana@example.com", region })).toEqual({
        ok: false,
        field: "region",
      });
    }
  });
});
