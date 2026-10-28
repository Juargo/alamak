# ADR-0006: API REST con Server Actions; sin WebSocket

- **Estado:** Aceptado (los endpoints de M3–M4 quedan **Propuesto**)
- **Fecha:** 2026-10-27
- **Fase:** Validación y Producto
- **Requisitos:** RES-10, RNF-02, RNF-18, RNF-20, DI-24, DI-25

> **Nota (2026-10-28):** lo que este ADR decide sobre Supabase está reemplazado por [ADR-0014](0014-neon-como-base-de-datos.md) (Neon), por falta de presupuesto. El resto sigue vigente.

## Contexto
- La app es web y la consume solo su propio front. Hay integraciones entrantes (webhooks de pago y jobs programados) y salientes (Riot, IA, correo).
- No hay funciones en vivo: Riot bloquea el acceso a la memoria del juego y restringe los replays (RES-10). El aviso de partida nueva llega por Web Push (DI-25).
- Se debe poder anotar sin conexión y sincronizar después (RNF-18, Etapa 5).

## Decisión
1. **Front ↔ back propio:** React Server Components para las lecturas y **Server Actions** para las mutaciones de formularios (lista de espera, test de tilt, reflexión).
2. **REST bajo `/api/v1`** (Route Handlers) para todo lo que consume un tercero o el cliente sin conexión:

   | Método y ruta | Uso | Fase |
   |---|---|---|
   | `GET /api/v1/salud` | Monitoreo de disponibilidad | M1 |
   | `POST /api/v1/webhooks/pagos` | Eventos de Lemon Squeezy (firma HMAC) | M2 |
   | `POST /api/v1/jobs/{nombre}` | Cron y worker de la cola (secreto compartido) | M1 (latido) / M3 |
   | `POST /api/v1/reflexiones` | Sincronización sin conexión, idempotente | M3 (Propuesto) |
   | `POST /api/v1/push/suscripciones` | Registro del dispositivo para Web Push | M3 (Propuesto) |
   | `GET /api/v1/privacidad/exportacion` | Portabilidad (RNF-15) | M3 (Propuesto) |

3. **Convenciones REST:**
   - Recursos en plural y en español, JSON y códigos HTTP correctos.
   - Errores con el formato *Problem Details* (RFC 9457, `application/problem+json`), con mensajes en español neutro y sin datos internos.
   - Validación con Zod en el borde, tanto en Server Actions como en Route Handlers.
   - Paginación por cursor; versionado por prefijo (`/v1`).
   - **Idempotencia:** las escrituras que se pueden reintentar aceptan `Idempotency-Key`. La reflexión usa un UUID generado en el cliente.
4. **Sin WebSocket ni SSE:** no hay ningún requisito de tiempo real. Los avisos usan Web Push (VAPID) disparado por un job, y la interfaz se refresca al recuperar el foco. Si en el futuro hiciera falta, Supabase Realtime ya está disponible sin infraestructura nueva.
5. **Modo sin conexión (Propuesto, M3):** PWA con *service worker*. La reflexión se guarda en IndexedDB y se reenvía de forma idempotente al volver la conexión.
6. **Salidas:** un cliente tipado por proveedor dentro del módulo `infraestructura/` correspondiente, con *timeouts* explícitos y reintentos con espera exponencial (RNF-20).

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| WebSocket o SSE | No hay requisito de tiempo real; las conexiones persistentes no encajan con las funciones serverless |
| GraphQL | Sobredimensionado para un único cliente propio |
| tRPC | Cómodo, pero no sirve para webhooks ni para el cliente sin conexión; Server Actions cubren el mismo caso |
| Solo REST (sin Server Actions) | Más código repetido para los formularios |

## Consecuencias
- **Positivas:** poco código de plumbing; contratos claros para terceros; los reintentos son seguros.
- **Negativas / costos:** dos mecanismos (Server Actions y REST), cada uno con su regla de uso clara. En iPhone, Web Push solo funciona si la web está agregada a la pantalla de inicio (DI-25).
- **Revisar cuando:** existan apps nativas (D-06), que consumirían la API REST pública, o aparezca un requisito de tiempo real.
