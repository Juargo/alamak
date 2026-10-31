# Cuenta de Riot y partidas

Vinculación de la cuenta de Riot e importación de partidas ranked (issue #25). El código está en `src/modules/partidas/`; la pantalla es `/diario`.

## Cómo funciona
- El jugador escribe su Riot ID (`Nombre#TAG`) y su región (LAS, LAN o EUW, preseleccionada según el país o el idioma del navegador). La app busca la cuenta con `account-v1` y la guarda en `riot_accounts`, todavía **sin verificar**.
- Una cuenta de Riot por jugador. La misma cuenta de Riot puede quedar vinculada a varios jugadores mientras ninguno la verifique; al verificarla (#26) queda solo para uno (índice único parcial sobre `puuid`).
- **Las partidas se importan recién al comprobar la propiedad (#26)**, para no guardar datos de cuentas ajenas ni gastar los límites de la clave en vínculos falsos. Hasta entonces no se muestra ninguna partida.
- La importación trae las partidas Solo/Duo (cola 420) y Flex (440) de los últimos 30 días con `match-v5`, y guarda solo lo del propio jugador: resultado, campeón, rol, fecha y hora, duración y si fue remake. Nada de MMR ni rangos.
- Es idempotente: se saltan las partidas ya guardadas, y una segunda importación no duplica nada (índice único por cuenta y partida).
- Las llamadas a Riot se hacen solo en el servidor, con la clave en el header `X-Riot-Token`. Ante errores temporales (5xx o de red) se reintenta hasta 3 veces. Ante un 429 se detiene respetando `Retry-After`: cada partida se guarda apenas llega, así que la próxima ejecución sigue donde quedó.
- Las imágenes de campeones salen solo de Data Dragon (`championIconUrl`).

## Variables de entorno
| Variable | Qué es |
|---|---|
| `RIOT_API_KEY` | Clave de la API de Riot (`RGAPI-…`). Solo en el servidor |
| `RIOT_API_BASE_URL` | Solo para los E2E: apunta a un Riot falso local (`e2e/fake-riot.ts`) |

La **development key** del Developer Portal vence cada 24 horas y no se puede usar en un producto público. Va solo en `.env.local` para desarrollar; producción espera la clave aprobada del issue #1.

## Probar contra Riot de verdad
Con la development key en `.env.local`:

```
RIOT_LIVE_ID="Nombre#TAG" RIOT_LIVE_REGION=LAS pnpm vitest run riot-live
```

Busca la cuenta, cuenta las partidas ranked de los últimos 30 días y muestra la última. Sin `RIOT_LIVE_ID` el test se salta, así que CI nunca llama a Riot.
