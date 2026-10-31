import { describe, expect, it } from "vitest";
import { championIconUrl } from "./data-dragon";

describe("championIconUrl", () => {
  it("#25 S7 points to Riot's Data Dragon CDN", () => {
    expect(championIconUrl("15.20.1", "MonkeyKing")).toBe(
      "https://ddragon.leagueoflegends.com/cdn/15.20.1/img/champion/MonkeyKing.png",
    );
  });
});
