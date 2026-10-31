import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const hasSession = vi.fn();
vi.mock("@/modules/cuentas", () => ({
  hasSession,
  DIARY_PATH: "/diario",
  SIGN_IN_PATH: "/ingresar",
}));

const { proxy } = await import("./proxy");

function request(path: string, method = "GET") {
  return new NextRequest(`https://alamak.example${path}`, { method });
}

describe("proxy", () => {
  beforeEach(() => {
    hasSession.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("#23 S5: sends a diary visit without a session to the sign-in page", async () => {
    hasSession.mockResolvedValue(false);

    const response = await proxy(request("/diario"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://alamak.example/ingresar");
  });

  it("#23 lets a signed-in player into the diary", async () => {
    hasSession.mockResolvedValue(true);

    const response = await proxy(request("/diario"));

    expect(response.headers.get("location")).toBeNull();
  });

  it("#23 lets Server Actions through so they handle a missing session", async () => {
    hasSession.mockResolvedValue(false);

    const response = await proxy(request("/diario", "POST"));

    expect(response.headers.get("location")).toBeNull();
  });

  it("#23 sends the diary to sign-in with a retry message when the session cannot be read", async () => {
    hasSession.mockRejectedValue(new Error("database unavailable"));

    const response = await proxy(request("/diario"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://alamak.example/ingresar?error=servicio");
  });

  it("#23 still shows the sign-in page when the session cannot be read", async () => {
    hasSession.mockRejectedValue(new Error("database unavailable"));

    const response = await proxy(request("/ingresar"));

    expect(response.headers.get("location")).toBeNull();
  });
});
