# Catálogo de eventos de analítica

Analítica de producto con PostHog Cloud UE (ADR-0013). Todo evento nuevo se agrega aquí en el mismo PR que lo envía. El código está en `src/shared/analytics/client.ts`; el tipo `Events` de ese archivo debe coincidir con esta tabla.

## Reglas
- Sin cookies ni almacenamiento en el navegador (`cookieless_mode: "always"`), así que la landing no necesita banner de cookies.
- Sin perfiles de persona, sin autocaptura, sin grabación de sesiones.
- **Prohibido enviar:** correo, Riot ID, texto de notas, ánimo individual, IP o cualquier identificador directo.
- Sin `NEXT_PUBLIC_POSTHOG_KEY` la analítica queda apagada (desarrollo local y CI).

## Eventos
| Evento | Cuándo | Propiedades | Issue |
|---|---|---|---|
| `$pageview` | Cada visita a una página (automático) | URL, referer y parámetros UTM (`utm_source`, `utm_medium`, `utm_campaign`) que PostHog captura solo | #6 |
| `lista_espera_inscrito` | El formulario de la lista de espera muestra "Listo, estás en la lista" | `region`: `LAS`, `LAN` o `EUW` | #6 |

`lista_espera_inscrito` también se envía si el correo ya estaba inscrito, porque la pantalla no distingue los dos casos (para no revelar quién está en la lista). El número real de inscritos únicos sale de la tabla `waitlist_entries`. Las respuestas al honeypot (bots) no se cuentan.

## Conversión visita → inscripción (H4)
En PostHog, crear un *insight* de tipo **Funnel**:
1. Paso 1: `$pageview` con la URL de la landing.
2. Paso 2: `lista_espera_inscrito`.
3. *Breakdown* por `utm_source` (o `$referring_domain` para el tráfico sin UTM).
4. Intervalo semanal. Guardarlo en un dashboard "H4 · Captación".

## Configuración (una vez, la hace el responsable)
1. Crear el proyecto en PostHog Cloud **UE** (`eu.posthog.com`).
2. En *Project settings*:
   - activar el **modo sin cookies** (*cookieless*); sin esto PostHog descarta los eventos que envía la web;
   - activar **Discard client IP data**.
3. En Vercel, agregar `NEXT_PUBLIC_POSTHOG_KEY` (el *project API key*, que es público) en Production. En Preview conviene dejarla vacía para no mezclar datos de prueba.
