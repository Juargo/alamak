import { describe, expect, it } from "vitest";
import { DEFAULT_ICON_IDS, pickChallengeIcon, secondsUntilNextCheck } from "./verification";

describe("pickChallengeIcon", () => {
  it("#26 S1 picks a default icon different from the current one", () => {
    for (const current of DEFAULT_ICON_IDS) {
      for (const draw of [0, 0.5, 0.999]) {
        const icon = pickChallengeIcon(current, () => draw);
        expect(icon).not.toBe(current);
        expect(DEFAULT_ICON_IDS).toContain(icon);
      }
    }
  });

  it("#26 S1 picks any default icon when the current one is not a default", () => {
    expect(pickChallengeIcon(5432, () => 0)).toBe(0);
  });
});

describe("secondsUntilNextCheck", () => {
  const now = new Date("2026-10-31T12:00:20Z");

  it("#26 S3 allows the first check", () => {
    expect(secondsUntilNextCheck(null, now)).toBe(0);
  });

  it("#26 S3 waits 20 seconds between checks", () => {
    expect(secondsUntilNextCheck(new Date("2026-10-31T12:00:10Z"), now)).toBe(10);
    expect(secondsUntilNextCheck(new Date("2026-10-31T12:00:00Z"), now)).toBe(0);
  });
});
