import { describe, expect, it } from "vitest";
import { SIGN_IN_ERROR, signInErrorMessage } from "./sign-in-errors";

describe("signInErrorMessage", () => {
  it("#23 explains an expired session", () => {
    expect(signInErrorMessage(SIGN_IN_ERROR.sessionExpired)).toMatch(/ya había terminado/);
  });

  it.each(["acceso", "state_mismatch", "__proto__", "constructor", "toString"])(
    "#23 answers any other code, %s included, with the generic message",
    (code) => {
      expect(signInErrorMessage(code)).toBe(
        "No pudimos completar el ingreso. Vuelve a intentarlo.",
      );
    },
  );
});
