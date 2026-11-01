import { describe, expect, it, vi } from "vitest";
import {
  RiotRateLimitedError,
  RiotRejectedError,
  RiotUnavailableError,
} from "../aplicacion/riot-port";
import { createRiotHttpApi } from "./riot-http-api";

const PUUID = "puuid-ana";

type Reply = { status: number; body?: unknown; headers?: Record<string, string> };

/** A fetch that answers each call with the next reply and records the requests. */
function fakeFetch(...replies: Reply[]) {
  const requests: { url: string; token: string | null }[] = [];
  const fetch = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    requests.push({
      url: String(input),
      token: new Headers(init?.headers).get("X-Riot-Token"),
    });
    const reply = replies.shift();
    if (!reply) throw new Error("unexpected request");
    return new Response(reply.body === undefined ? null : JSON.stringify(reply.body), {
      status: reply.status,
      headers: reply.headers,
    });
  });
  return { fetch, requests };
}

function api(
  fetch: typeof globalThis.fetch,
  sleep: (ms: number) => Promise<void> = async () => {},
) {
  return createRiotHttpApi({ apiKey: "RGAPI-test", fetch, sleep });
}

const SUMMONER: Reply = { status: 200, body: { puuid: PUUID } };

function participant(overrides: Record<string, unknown> = {}) {
  return {
    puuid: PUUID,
    win: true,
    championId: 103,
    championName: "Ahri",
    teamPosition: "MIDDLE",
    gameEndedInEarlySurrender: false,
    ...overrides,
  };
}

function matchBody(overrides: Record<string, unknown> = {}, player = participant()) {
  return {
    metadata: { matchId: "LA2_1" },
    info: {
      queueId: 420,
      gameStartTimestamp: Date.UTC(2026, 9, 20, 23, 30),
      gameDuration: 1800,
      participants: [participant({ puuid: "someone-else", win: false }), player],
      ...overrides,
    },
  };
}

describe("riot http api", () => {
  it("#25 S1 finds an account by Riot ID on the region's routing host, with the key in a header", async () => {
    const { fetch, requests } = fakeFetch(
      { status: 200, body: { puuid: PUUID, gameName: "Señor Tilt", tagLine: "LAS" } },
      SUMMONER,
    );

    const account = await api(fetch).findAccount({ gameName: "Señor Tilt", tagLine: "LAS" }, "LAS");

    expect(account).toEqual({ puuid: PUUID, gameName: "Señor Tilt", tagLine: "LAS" });
    expect(requests).toEqual([
      {
        url: "https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/Se%C3%B1or%20Tilt/LAS",
        token: "RGAPI-test",
      },
      {
        url: `https://la2.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${PUUID}`,
        token: "RGAPI-test",
      },
    ]);
  });

  it("#25 S1 does not find an account that exists in another region", async () => {
    const { fetch, requests } = fakeFetch(
      { status: 200, body: { puuid: PUUID, gameName: "Ana", tagLine: "LAS" } },
      { status: 404 },
    );

    expect(await api(fetch).findAccount({ gameName: "Ana", tagLine: "LAS" }, "EUW")).toBeNull();
    expect(requests[1].url).toMatch(/^https:\/\/euw1\.api\.riotgames\.com\/lol\/summoner\/v4\//);
  });

  it("#25 S1 reports a missing account as null", async () => {
    const { fetch } = fakeFetch({ status: 404, body: { status: { status_code: 404 } } });

    expect(await api(fetch).findAccount({ gameName: "Nadie", tagLine: "000" }, "EUW")).toBeNull();
  });

  it("#26 S2 reads the player's current profile icon on the region's server", async () => {
    const { fetch, requests } = fakeFetch({
      status: 200,
      body: { puuid: PUUID, profileIconId: 7 },
    });

    expect(await api(fetch).profileIconId(PUUID, "LAN")).toBe(7);
    expect(requests[0].url).toBe(
      `https://la1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${PUUID}`,
    );
  });

  it("#25 S2 lists Solo/Duo and Flex games of the last 30 days, routed to europe for EUW", async () => {
    const since = new Date(Date.UTC(2026, 9, 1));
    const { fetch, requests } = fakeFetch(
      { status: 200, body: ["EUW1_3", "EUW1_2"] },
      { status: 200, body: ["EUW1_1"] },
    );

    const ids = await api(fetch).rankedMatchIds(PUUID, "EUW", since);

    expect(ids).toEqual(["EUW1_3", "EUW1_2", "EUW1_1"]);
    const startTime = since.getTime() / 1000;
    expect(requests.map((request) => request.url)).toEqual([
      `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${PUUID}/ids?queue=420&startTime=${startTime}&start=0&count=100`,
      `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${PUUID}/ids?queue=440&startTime=${startTime}&start=0&count=100`,
    ]);
  });

  it("#25 S2 pages through more than 100 games of one queue", async () => {
    const firstPage = Array.from({ length: 100 }, (_, i) => `LA1_${i}`);
    const { fetch, requests } = fakeFetch(
      { status: 200, body: firstPage },
      { status: 200, body: ["LA1_100"] },
      { status: 200, body: [] },
    );

    const ids = await api(fetch).rankedMatchIds(PUUID, "LAN", new Date(0));

    expect(ids).toHaveLength(101);
    expect(requests[1].url).toContain("queue=420&startTime=0&start=100&count=100");
  });

  it("#25 S2 reads result, champion, role, start time, duration and queue for the player", async () => {
    const { fetch } = fakeFetch({ status: 200, body: matchBody() });

    const match = await api(fetch).rankedMatch("LA2_1", PUUID, "LAS");

    expect(match).toEqual({
      matchId: "LA2_1",
      queue: "solo",
      result: "win",
      isRemake: false,
      championId: 103,
      championName: "Ahri",
      role: "MIDDLE",
      startedAt: new Date(Date.UTC(2026, 9, 20, 23, 30)),
      durationSeconds: 1800,
    });
  });

  it("#25 S2 marks an early surrender as a remake", async () => {
    const { fetch } = fakeFetch({
      status: 200,
      body: matchBody(
        { gameDuration: 200 },
        participant({ win: false, gameEndedInEarlySurrender: true }),
      ),
    });

    expect(await api(fetch).rankedMatch("LA2_1", PUUID, "LAS")).toMatchObject({
      isRemake: true,
      result: "loss",
    });
  });

  it("#25 S2 treats a game under 5 minutes as a remake when Riot does not say", async () => {
    const player = participant();
    delete (player as Record<string, unknown>).gameEndedInEarlySurrender;
    const { fetch } = fakeFetch({ status: 200, body: matchBody({ gameDuration: 240 }, player) });

    expect((await api(fetch).rankedMatch("LA2_1", PUUID, "LAS"))?.isRemake).toBe(true);
  });

  it("#25 S2 leaves the role empty when Riot does not report it", async () => {
    const { fetch } = fakeFetch({
      status: 200,
      body: matchBody({}, participant({ teamPosition: "" })),
    });

    expect((await api(fetch).rankedMatch("LA2_1", PUUID, "LAS"))?.role).toBeNull();
  });

  it("#25 RF-07 ignores a game from another queue or one the player did not play", async () => {
    const { fetch } = fakeFetch(
      { status: 200, body: matchBody({ queueId: 450 }) },
      { status: 200, body: matchBody({}, participant({ puuid: "not-ana" })) },
    );

    expect(await api(fetch).rankedMatch("LA2_1", PUUID, "LAS")).toBeNull();
    expect(await api(fetch).rankedMatch("LA2_1", PUUID, "LAS")).toBeNull();
  });

  it("#25 S3 retries a temporary Riot error and then succeeds", async () => {
    const { fetch } = fakeFetch(
      { status: 503 },
      { status: 500 },
      { status: 200, body: { puuid: PUUID, gameName: "Ana", tagLine: "LAS" } },
      SUMMONER,
    );

    expect(await api(fetch).findAccount({ gameName: "Ana", tagLine: "LAS" }, "LAS")).toMatchObject({
      puuid: PUUID,
    });
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it("#25 S3 gives up after three failed attempts", async () => {
    const { fetch } = fakeFetch({ status: 503 }, { status: 503 }, { status: 503 });

    await expect(
      api(fetch).findAccount({ gameName: "Ana", tagLine: "LAS" }, "LAS"),
    ).rejects.toThrow(RiotUnavailableError);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("#25 S3 stops at the rate limit and reports when to try again", async () => {
    const { fetch } = fakeFetch({ status: 429, headers: { "Retry-After": "17" } });

    const error = await api(fetch)
      .findAccount({ gameName: "Ana", tagLine: "LAS" }, "LAS")
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(RiotRateLimitedError);
    expect((error as RiotRateLimitedError).retryAfterSeconds).toBe(17);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("#25 S3 never retries a rejected key, which would only burn the limit", async () => {
    const { fetch } = fakeFetch({ status: 403 });

    await expect(
      api(fetch).findAccount({ gameName: "Ana", tagLine: "LAS" }, "LAS"),
    ).rejects.toThrow(RiotRejectedError);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("#25 S3 retries network errors and timeouts, waiting only between attempts", async () => {
    const waits: number[] = [];
    const fetch = vi.fn(async () => {
      throw new DOMException("The operation timed out.", "TimeoutError");
    });

    await expect(
      api(fetch as unknown as typeof globalThis.fetch, async (ms) => {
        waits.push(ms);
      }).findAccount({ gameName: "Ana", tagLine: "LAS" }, "LAS"),
    ).rejects.toThrow(RiotUnavailableError);
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(waits).toEqual([1000, 2000]);
  });

  it("#25 S3 gives every request a time limit", async () => {
    const { fetch } = fakeFetch({ status: 200, body: [] }, { status: 200, body: [] });

    await api(fetch).rankedMatchIds(PUUID, "LAS", new Date(0));

    expect(fetch.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it("#25 S3 retries a cut-off body instead of failing on it", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response("{not json", { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(["LA2_1"]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));

    expect(await api(fetch).rankedMatchIds(PUUID, "LAS", new Date(0))).toEqual(["LA2_1"]);
  });

  it("#25 E2E can point the client at a local fake Riot", async () => {
    const { fetch, requests } = fakeFetch({ status: 200, body: [] });
    const local = createRiotHttpApi({
      apiKey: "k",
      baseUrl: "http://127.0.0.1:3298",
      fetch,
      sleep: async () => {},
    });

    await local.rankedMatchIds(PUUID, "LAS", new Date(0)).catch(() => {});

    expect(requests[0].url).toMatch(/^http:\/\/127\.0\.0\.1:3298\/americas\/lol\/match\/v5\//);
  });
});
