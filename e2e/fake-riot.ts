import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";

// Minimal stand-in for the Riot API pieces the app uses, at `<base>/<host>/...`:
// account-v1, summoner-v4 and match-v5. Tests change a player's icon with
// `POST /__test/icon/<puuid>/<iconId>`.

const TOKEN = "RGAPI-e2e";
const DEFAULT_ICON = 7;

type Account = { puuid: string; gameName: string; tagLine: string; platform: string };

/** Fixed accounts, by "name#tag" (lower case). */
const FIXED: Record<string, Account> = {
  "señor tilt#las": {
    puuid: "puuid-senor-tilt",
    gameName: "Señor Tilt",
    tagLine: "LAS",
    platform: "la2",
  },
};
/** Riot IDs whose lookups fail as if Riot were down. */
const UNAVAILABLE = new Set(["caido#las"]);

/** Any Riot ID named "E2E…" exists on LAS, so each test can use its own account. */
function accountFor(gameName: string, tagLine: string): Account | undefined {
  const key = `${gameName}#${tagLine}`.toLowerCase();
  if (FIXED[key]) return FIXED[key];
  if (/^e2e/i.test(gameName) && tagLine.toUpperCase() === "LAS") {
    return { puuid: `puuid-${gameName.toLowerCase()}`, gameName, tagLine, platform: "la2" };
  }
  return undefined;
}

function platformOf(puuid: string): string | undefined {
  return puuid === FIXED["señor tilt#las"].puuid || puuid.startsWith("puuid-e2e")
    ? "la2"
    : undefined;
}

function json(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

/** Two Solo/Duo games for every player; ids carry the player so details can name them. */
function matchIds(puuid: string, queue: string | null): string[] {
  return queue === "420" ? [`LA2_${puuid}__2`, `LA2_${puuid}__1`] : [];
}

function matchDetail(matchId: string) {
  const [, puuid, n] = matchId.match(/^LA2_(.+)__(\d+)$/) ?? [];
  if (!puuid) return null;
  return {
    metadata: { matchId },
    info: {
      queueId: 420,
      gameStartTimestamp: Date.now() - Number(n) * 3_600_000,
      gameDuration: 1800,
      participants: [
        {
          puuid,
          win: n === "1",
          championId: 103,
          championName: "Ahri",
          teamPosition: "MIDDLE",
          gameEndedInEarlySurrender: false,
        },
      ],
    },
  };
}

export function startFakeRiot(port: number): Promise<Server> {
  const icons = new Map<string, number>();

  function handle(request: IncomingMessage, response: ServerResponse) {
    const url = new URL(request.url ?? "/", "http://fake");
    const path = url.pathname;

    const setIcon = path.match(/^\/__test\/icon\/([^/]+)\/(\d+)$/);
    if (setIcon && request.method === "POST") {
      icons.set(decodeURIComponent(setIcon[1]), Number(setIcon[2]));
      response.writeHead(204).end();
      return;
    }
    if (request.headers["x-riot-token"] !== TOKEN) {
      response.writeHead(401).end();
      return;
    }

    const account = path.match(
      /^\/(americas|europe)\/riot\/account\/v1\/accounts\/by-riot-id\/([^/]+)\/([^/]+)$/,
    );
    if (account) {
      const gameName = decodeURIComponent(account[2]);
      const tagLine = decodeURIComponent(account[3]);
      if (UNAVAILABLE.has(`${gameName}#${tagLine}`.toLowerCase())) {
        response.writeHead(503).end();
        return;
      }
      const found = accountFor(gameName, tagLine);
      json(response, found ? 200 : 404, found ? { puuid: found.puuid, gameName, tagLine } : {});
      return;
    }

    const summoner = path.match(/^\/([a-z0-9]+)\/lol\/summoner\/v4\/summoners\/by-puuid\/([^/]+)$/);
    if (summoner) {
      const puuid = decodeURIComponent(summoner[2]);
      const here = platformOf(puuid) === summoner[1];
      json(
        response,
        here ? 200 : 404,
        here ? { puuid, profileIconId: icons.get(puuid) ?? DEFAULT_ICON } : {},
      );
      return;
    }

    const ids = path.match(/^\/americas\/lol\/match\/v5\/matches\/by-puuid\/([^/]+)\/ids$/);
    if (ids) {
      const start = Number(url.searchParams.get("start") ?? 0);
      json(
        response,
        200,
        start === 0 ? matchIds(decodeURIComponent(ids[1]), url.searchParams.get("queue")) : [],
      );
      return;
    }

    const match = path.match(/^\/americas\/lol\/match\/v5\/matches\/([^/]+)$/);
    if (match) {
      const detail = matchDetail(decodeURIComponent(match[1]));
      json(response, detail ? 200 : 404, detail ?? {});
      return;
    }

    response.writeHead(404).end();
  }

  const server = createServer(handle);
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}
