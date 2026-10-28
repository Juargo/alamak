# ADR-0002: Monolito modular por capas, con procesamiento asíncrono por eventos en Postgres

- **Estado:** Aceptado (la sección *Procesamiento asíncrono* queda **Propuesto** hasta el GO)
- **Fecha:** 2026-10-27
- **Fase:** Validación y Producto
- **Requisitos:** RES-14, RES-15, RNF-19, RNF-20, RNF-24, RNF-25, RNF-26, DI-17, D-14

## Contexto
- Un solo desarrollador a tiempo parcial (RES-14) que debe operar el sistema sin intervención manual compleja (RNF-26).
- Presupuesto de operación ≤ US$80 al mes hasta ~10.000 usuarios (RES-15, RNF-24), con capacidad para llegar a ~12.000 activos al mes sin rediseño (RNF-25).
- El producto completo tiene trabajo que no cabe en una solicitud HTTP:
  - importar 30 días de partidas al vincular la cuenta (D-14), respetando el límite de llamadas de Riot;
  - generar el resumen cada lunes (RNF-19);
  - reintentar cuando Riot no responde (RNF-20);
  - procesar los webhooks de pago y enviar los avisos push.
- La validación (M1–M2) solo necesita una landing, una lista de espera, el test de tilt y un link de pago.

## Decisión
**Un monolito modular**: una sola aplicación desplegable (Next.js) y una sola base de datos (PostgreSQL).

### Módulos por capacidad de negocio
| Módulo | Responsabilidad | Fase |
|---|---|---|
| `captacion` | Lista de espera y test de tilt | M1 |
| `riot` | Cliente de la API oficial, límite de tasa, caché y Data Dragon | M1 |
| `pagos` | Pre-venta, suscripciones y webhooks | M2 |
| `cuentas` | Registro, perfil, roles, edad y consentimientos | M2/M3 |
| `privacidad` | Exportación, borrado y retención | M3 |
| `diario` | Partidas, reflexiones, tags y hallazgos | M3 |
| `resumen` | Resumen semanal, foco semanal e IA | M4 |
| `coach` | Vínculo coach–alumno | Después del GO |

### Capas dentro de cada módulo (hexagonal liviano)
```
src/modules/<modulo>/
  dominio/          reglas puras: entidades y cálculos, sin E/S ni frameworks
  aplicacion/       casos de uso que orquestan el dominio a través de puertos (interfaces)
  infraestructura/  adaptadores: Supabase, Riot, IA, correo, pagos
  index.ts          API pública del módulo (lo único que otros módulos pueden importar)
src/app/            rutas de Next.js (interfaz): páginas, Server Actions y Route Handlers
src/shared/         utilidades transversales sin lógica de negocio (logger, config, errores)
```
- **Regla de dependencia:** `app → aplicacion → dominio`; `infraestructura` implementa los puertos de `aplicacion`. `dominio` no importa nada externo.
- Un módulo usa a otro solo a través de su `index.ts` o mediante eventos. La regla se verifica en CI (ADR-0010).

### Procesamiento asíncrono (Propuesto, M3–M4)
Es *event-driven* liviano dentro de la misma base, sin broker externo:
1. Un caso de uso guarda su cambio y, **en la misma transacción**, inserta un evento en la cola (patrón *outbox*), usando Supabase Queues (`pgmq`).
2. `pg_cron` llama cada minuto a un endpoint *worker* protegido (`/api/v1/jobs/procesar-cola`). El worker procesa los mensajes en lotes pequeños dentro del límite de duración de las funciones serverless.
3. Cada consumidor es **idempotente**, reintenta con espera exponencial y, después de N intentos, mueve el mensaje a una cola de fallidos y alerta (ADR-0013).

Eventos iniciales: `cuenta_riot_vinculada` → importar partidas; `partida_detectada` → aviso push; `semana_cerrada` → generar resumen; `pago_confirmado` → activar plan; `cuenta_borrada` → purgar datos.

En la validación (M1–M2) no hay cola: el test de tilt se resuelve dentro de la solicitud con caché, y el webhook de pago escribe directamente.

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| Microservicios | Varios despliegues, red, observabilidad distribuida y más costo fijo. Es inviable para 1 persona con 2 h por semana |
| *Event-driven* con broker (Kafka, SQS, RabbitMQ) | Otro servicio que pagar y operar; el volumen esperado cabe en Postgres |
| Orquestadores gestionados (Inngest, Trigger.dev) | Viables y con plan gratuito, pero agregan un proveedor más. **Plan B** si la cola en Postgres se queda corta |
| Capas clásicas sin módulos (controllers/services/repos globales) | Se acoplan rápido y cuesta extraer o borrar funciones del alcance |

## Consecuencias
- **Positivas:** un solo deploy; transacciones ACID entre módulos; refactorizar es barato; el dominio puro es fácil de probar; si algún día hace falta, un módulo se puede extraer porque sus límites ya existen.
- **Negativas / costos:** los límites entre módulos exigen disciplina, que se verifica con lint. El worker serverless obliga a usar lotes pequeños e idempotentes.
- **Revisar cuando:** se superen ~12.000 usuarios activos al mes, la cola acumule más de 1 h de atraso de forma sostenida o un módulo necesite escalar distinto al resto.
