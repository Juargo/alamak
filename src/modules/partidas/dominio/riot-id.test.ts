import { describe, expect, it } from "vitest";
import { parseRiotId } from "./riot-id";

describe("parseRiotId", () => {
  it.each([
    ["Faker#KR1", { gameName: "Faker", tagLine: "KR1" }],
    ["  Señor Tilt #LAS  ", { gameName: "Señor Tilt", tagLine: "LAS" }],
    ["abc#1234", { gameName: "abc", tagLine: "1234" }],
  ])("#25 S1 reads %j as a Riot ID", (input, expected) => {
    expect(parseRiotId(input)).toEqual(expected);
  });

  it.each([
    "",
    "Faker",
    "#KR1",
    "Faker#",
    "ab#KR1",
    "Faker#K",
    "Faker#TOOLONG",
    "a#b#c",
    "x".repeat(17) + "#KR1",
  ])("#25 S1 rejects %j", (input) => {
    expect(parseRiotId(input)).toBeNull();
  });
});
