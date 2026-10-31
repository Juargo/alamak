import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { Region } from "@/modules/captacion";
import { IMPORT_WINDOW_DAYS } from "../dominio/match";
import { parseRiotId } from "../dominio/riot-id";
import { createRiotHttpApi } from "./riot-http-api";

// Manual check against the real Riot API with the development key in .env.local:
//   RIOT_LIVE_ID="Nombre#TAG" RIOT_LIVE_REGION=LAS pnpm vitest run riot-live
// Skipped otherwise, so CI and normal runs never call Riot.
const liveId = process.env.RIOT_LIVE_ID;

describe.runIf(liveId)("riot api (live)", () => {
  it("finds the account and reads its recent ranked games", async () => {
    if (existsSync(".env.local")) process.loadEnvFile(".env.local");
    const apiKey = process.env.RIOT_API_KEY;
    if (!apiKey) throw new Error("RIOT_API_KEY is missing in .env.local");
    const region = (process.env.RIOT_LIVE_REGION ?? "LAS") as Region;
    const riotId = parseRiotId(liveId ?? "");
    if (!riotId) throw new Error(`Not a Riot ID: ${liveId}`);
    const api = createRiotHttpApi({ apiKey });

    const account = await api.findAccount(riotId, region);
    expect(account).not.toBeNull();
    const since = new Date(Date.now() - IMPORT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const ids = await api.rankedMatchIds(account!.puuid, region, since);
    const first = ids[0] ? await api.rankedMatch(ids[0], account!.puuid, region) : null;

    console.log(`ranked games in ${IMPORT_WINDOW_DAYS} days: ${ids.length}`);
    console.log("latest:", first);
  }, 60_000);
});
