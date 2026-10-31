import { createServer, type Server } from "node:http";

/** Accounts the fake Riot knows, by "name#tag" (lower case). */
const ACCOUNTS: Record<string, { puuid: string; gameName: string; tagLine: string }> = {
  "señor tilt#las": { puuid: "puuid-senor-tilt", gameName: "Señor Tilt", tagLine: "LAS" },
};
/** Platform (game server) each known player is on. */
const PLATFORM_BY_PUUID: Record<string, string> = { "puuid-senor-tilt": "la2" };
/** Riot IDs whose lookups fail as if Riot were down. */
const UNAVAILABLE = new Set(["caido#las"]);

/** Minimal stand-in for Riot's account-v1 and summoner-v4, at `<base>/<host>/...`. */
export function startFakeRiot(port: number): Promise<Server> {
  const server = createServer((request, response) => {
    const summoner = request.url?.match(
      /^\/([a-z0-9]+)\/lol\/summoner\/v4\/summoners\/by-puuid\/([^/?]+)/,
    );
    if (summoner && request.headers["x-riot-token"] === "RGAPI-e2e") {
      const puuid = decodeURIComponent(summoner[2]);
      const found = PLATFORM_BY_PUUID[puuid] === summoner[1];
      response.writeHead(found ? 200 : 404, { "content-type": "application/json" });
      response.end(JSON.stringify(found ? { puuid } : { status: { status_code: 404 } }));
      return;
    }
    const match = request.url?.match(
      /^\/(americas|europe)\/riot\/account\/v1\/accounts\/by-riot-id\/([^/]+)\/([^/?]+)/,
    );
    if (!match || request.headers["x-riot-token"] !== "RGAPI-e2e") {
      response.writeHead(match ? 401 : 404).end();
      return;
    }
    const riotId = `${decodeURIComponent(match[2])}#${decodeURIComponent(match[3])}`.toLowerCase();
    if (UNAVAILABLE.has(riotId)) {
      response.writeHead(503).end();
      return;
    }
    const account = ACCOUNTS[riotId];
    response.writeHead(account ? 200 : 404, { "content-type": "application/json" });
    response.end(JSON.stringify(account ?? { status: { status_code: 404 } }));
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}
