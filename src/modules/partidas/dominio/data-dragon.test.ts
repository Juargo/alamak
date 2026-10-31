import { describe, expect, it } from "vitest";
import { championIconUrl, profileIconUrl } from "./data-dragon";

describe("championIconUrl", () => {
  it("#25 S7 points to Riot's Data Dragon CDN", () => {
    expect(championIconUrl("15.20.1", "MonkeyKing")).toBe(
      "https://ddragon.leagueoflegends.com/cdn/15.20.1/img/champion/MonkeyKing.png",
    );
  });

  it("#26 S1 profile icons also come from Data Dragon", () => {
    expect(profileIconUrl("15.20.1", 3)).toBe(
      "https://ddragon.leagueoflegends.com/cdn/15.20.1/img/profileicon/3.png",
    );
  });
});
