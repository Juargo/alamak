import { describe, expect, it } from "vitest";
import type { WaitlistSignup } from "../dominio/waitlist";
import { enrollInWaitlist, type WaitlistRepository } from "./enroll-in-waitlist";

/** In-memory repository with the same uniqueness rule as the database index. */
function inMemoryRepository(): WaitlistRepository & { entries: WaitlistSignup[] } {
  const entries: WaitlistSignup[] = [];
  return {
    entries,
    async add(signup) {
      if (entries.some((entry) => entry.email === signup.email)) return "already-exists";
      entries.push(signup);
      return "created";
    },
  };
}

describe("enrollInWaitlist", () => {
  it("#4 CA-4: a new email ends in the enrolled state and is stored once", async () => {
    const repository = inMemoryRepository();
    const enroll = enrollInWaitlist({ repository });

    await expect(enroll({ email: "ana@example.com", region: "LAN" })).resolves.toEqual({
      status: "enrolled",
      region: "LAN",
    });
    expect(repository.entries).toEqual([{ email: "ana@example.com", region: "LAN" }]);
  });

  it("#4 CA-4: an email already on the list returns already-enrolled without duplicating it", async () => {
    const repository = inMemoryRepository();
    const enroll = enrollInWaitlist({ repository });
    await enroll({ email: "ana@example.com", region: "LAN" });

    await expect(enroll({ email: " ANA@example.com", region: "EUW" })).resolves.toEqual({
      status: "already-enrolled",
      region: "EUW",
    });
    expect(repository.entries).toEqual([{ email: "ana@example.com", region: "LAN" }]);
  });

  it("#4 CA-3: invalid input returns the invalid field and stores nothing", async () => {
    const repository = inMemoryRepository();
    const enroll = enrollInWaitlist({ repository });

    await expect(enroll({ email: "ana", region: "LAS" })).resolves.toEqual({
      status: "invalid",
      field: "email",
    });
    expect(repository.entries).toEqual([]);
  });
});
