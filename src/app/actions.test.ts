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
    enrollInWaitlist.mockResolvedValue({ status: "enrolled" });

    await expect(
      joinWaitlist({ status: "idle" }, form({ email: "ana@example.com", region: "LAN" })),
    ).resolves.toEqual({ status: "enrolled" });
    expect(enrollInWaitlist).toHaveBeenCalledWith({ email: "ana@example.com", region: "LAN" });
  });

  it("#4 CA-4: when the database fails it returns an error state and does not log the email", async () => {
    enrollInWaitlist.mockRejectedValue(new Error("connection refused"));

    await expect(
      joinWaitlist({ status: "idle" }, form({ email: "ana@example.com", region: "LAN" })),
    ).resolves.toEqual({ status: "error" });
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain("ana@example.com");
  });
});
