import { beforeEach, describe, expect, it, vi } from "vitest";

const enrollInWaitlist = vi.fn();
vi.mock("@/modules/captacion", () => ({ enrollInWaitlist }));

const { joinWaitlist } = await import("./actions");

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
}

describe("joinWaitlist", () => {
  beforeEach(() => {
    enrollInWaitlist.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("#4 CA-3: passes the form's email and region to the enrollment", async () => {
    enrollInWaitlist.mockResolvedValue({ status: "enrolled", region: "LAN" });

    await expect(
      joinWaitlist({ status: "idle" }, form({ email: "ana@example.com", region: "LAN" })),
    ).resolves.toEqual({ status: "enrolled", email: "ana@example.com", region: "LAN" });
    expect(enrollInWaitlist).toHaveBeenCalledWith({ email: "ana@example.com", region: "LAN" });
  });

  it("#4 CA-4: an email already on the list gets the same response as a new one", async () => {
    enrollInWaitlist.mockResolvedValue({ status: "enrolled", region: "LAN" });
    const fresh = await joinWaitlist(
      { status: "idle" },
      form({ email: "ana@example.com", region: "LAN" }),
    );
    enrollInWaitlist.mockResolvedValue({ status: "already-enrolled", region: "LAN" });
    const repeated = await joinWaitlist(
      { status: "idle" },
      form({ email: "ana@example.com", region: "LAN" }),
    );

    expect(repeated).toEqual(fresh);
  });

  it("#4 CA-3: invalid input returns the field and what was submitted, so the form keeps it", async () => {
    enrollInWaitlist.mockResolvedValue({ status: "invalid", field: "email" });

    await expect(
      joinWaitlist({ status: "idle" }, form({ email: "no-es-un-correo", region: "EUW" })),
    ).resolves.toEqual({
      status: "invalid",
      field: "email",
      values: { email: "no-es-un-correo", region: "EUW" },
    });
  });

  it("#4 CA-4: a filled honeypot field looks successful but stores nothing", async () => {
    await expect(
      joinWaitlist(
        { status: "idle" },
        form({ email: "bot@example.com", region: "LAN", website: "https://spam.example" }),
      ),
    ).resolves.toEqual({ status: "enrolled", email: "bot@example.com", region: null });
    expect(enrollInWaitlist).not.toHaveBeenCalled();
  });

  it("#4 CA-4: when the database fails it returns an error state and does not log the email", async () => {
    enrollInWaitlist.mockRejectedValue(new Error("connection refused"));

    await expect(
      joinWaitlist({ status: "idle" }, form({ email: "ana@example.com", region: "LAN" })),
    ).resolves.toEqual({
      status: "error",
      values: { email: "ana@example.com", region: "LAN" },
    });
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain("ana@example.com");
  });
});
