import { createServer, type Server } from "node:http";

/** Accounts the fake Riot knows, by "name#tag" (lower case). */
const ACCOUNTS: Record<string, { puuid: string; gameName: string; tagLine: string }> = {
  "señor tilt#las": { puuid: "puuid-senor-tilt", gameName: "Señor Tilt", tagLine: "LAS" },
};
/** Riot IDs whose lookups fail as if Riot were down. */
const UNAVAILABLE = new Set(["caido#las"]);

/** Minimal stand-in for Riot's account-v1, at `<base>/<route>/riot/account/v1/...`. */
export function startFakeRiot(port: number): Promise<Server> {
  const server = createServer((request, response) => {
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
