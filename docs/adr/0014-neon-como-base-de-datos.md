# ADR-0014: Usar Neon como base de datos Postgres en lugar de Supabase

- **Estado:** Aceptado (la región se revisa antes de #7)
- **Fecha:** 2026-10-28
- **Fase:** Validación (M1–M2)
- **Requisitos:** RES-15, RNF-12, RNF-18, RNF-24, D-10
- **Issue:** #3

Reemplaza todo lo que ADR-0002, 0003, 0004, 0005, 0006, 0007, 0008, 0010, 0011 y 0012 deciden sobre Supabase (ver la tabla de la sección *Qué reemplaza*). El resto de esos ADR sigue vigente.

## Contexto
- **Motivo: no hay presupuesto para seguir usando Supabase.** El plan gratuito permite solo 2 proyectos activos por organización, menos de los que se necesitan. Tener más proyectos activos, o los de M3 en adelante, obliga a pagar el plan Pro (US$25 al mes), algo que el presupuesto no cubre (RES-15).
- El plan gratuito de Neon permite 100 proyectos, con 10 ramas cada uno, 100 horas de cómputo al mes por proyecto y almacenamiento por proyecto (0,5–1 GB según la fuente; verificar en neon.com/pricing).
- En M1–M2 la base solo guarda la lista de espera y los resultados del test de tilt, que se escriben desde el servidor. Nada usa todavía Supabase Auth, Storage, Queues ni `pg_cron`, así que cambiar ahora cuesta poco.

## Decisión
1. **Postgres en Neon** (proyecto `Alamak-LOL`, Postgres 18, rama `production`). Se mantiene lo demás de ADR-0005: una sola base relacional y ACID, modelo normalizado, transacciones, `timestamptz` en UTC, datos mínimos de Riot y reglas de retención.
2. **Driver:** `pg` con un `Pool` sobre la cadena *pooled* (`DATABASE_URL`) y `attachDatabasePool` de `@vercel/functions`, como recomienda Neon para Vercel con Fluid compute. Las migraciones usan `DATABASE_URL_UNPOOLED`.
3. **Configuración:** `neon.ts` en el repo declara los servicios y la política de ramas (las ramas nuevas expiran a los 7 días). `.neon` y `.env.local` no se versionan. La CLI se usa con `pnpm dlx neon@latest`.
4. **Ambientes:**

   | Ambiente | Base de datos |
   |---|---|
   | Local | Rama de Neon de desarrollo (`neon checkout dev --create`) |
   | Preview (por PR) | Una rama de Neon por PR, creada desde `production` |
   | Producción | Rama `production` |

5. **Aislamiento entre usuarios:** sin Supabase Auth no existe `auth.uid()`. RLS se mantiene como defensa en profundidad, con la identidad del usuario fijada por transacción (`set_config`) desde el servidor. El diseño se cierra en el ADR que reemplace la autenticación, antes de M3.
6. **Región:** el proyecto queda por ahora en `aws-us-east-2` (Ohio), aunque las funciones de Vercel están en `gru1` (São Paulo, ADR-0003). Se acepta la latencia extra durante la captación (decisión del 2026-10-28). Se revisa antes de lanzar el test de tilt (#7): o se recrea el proyecto en São Paulo, o se mueven las funciones a una región cercana a Ohio.

## Qué reemplaza
| ADR | Lo que decía con Supabase | Ahora |
|---|---|---|
| 0002 | Adaptadores de Supabase; *outbox* con Supabase Queues (`pgmq`) | Adaptadores de Postgres con `pg`. Cola: se decide antes de M3 (la extensión `pgmq` en Neon, o el plan B de ADR-0002) |
| 0003 | Supabase en `sa-east-1` para base, Auth, Storage, colas y `pg_cron`; latido diario por la pausa a los 7 días; proyecto staging; Supabase Pro en M3 | Neon en `aws-us-east-2` solo para la base; previews con ramas de Neon. Neon suspende el cómputo sin perder datos, así que **no hace falta el latido**. Costo fijo de M3–M4 sin los US$25 de Supabase Pro |
| 0004 | Pasar a Supabase Pro si la base supera 400 MB | Revisar el plan de Neon cuando el almacenamiento llegue al 80% del límite gratuito |
| 0005 | `supabase-js` + `@supabase/ssr`; migraciones en `supabase/migrations/` con Supabase CLI; cifrado en reposo y Storage de Supabase | `pg` (punto 2); migraciones SQL versionadas aplicadas con `DATABASE_URL_UNPOOLED` (la herramienta se elige con las primeras tablas, #4); Neon cifra en reposo; Storage se decide antes de M3 |
| 0006 | Supabase Realtime como salida si algún día hiciera falta tiempo real | El servicio `realtime` de Neon, declarable en `neon.ts`, cumple ese papel |
| 0007 | Supabase Auth, cookies con `@supabase/ssr` y *Custom Access Token Hook* | **Sin decidir.** Hace falta un ADR nuevo de autenticación antes de M3. Neon Auth es la opción a evaluar |
| 0008 | Fila "Datos, auth y colas: Supabase…"; pgTAP con `supabase test db` | Postgres en Neon con `pg`; pgTAP contra una rama de Neon |
| 0010 | `supabase start` en CI; `supabase db push`; latido de Supabase Free; respaldo propio porque Supabase Free no da respaldos | CI con un Postgres efímero (servicio `postgres` de GitHub Actions) o una rama de Neon por ejecución; migraciones contra `DATABASE_URL_UNPOOLED`; sin latido. El respaldo propio diario cifrado se mantiene (D-10) |
| 0011 | Secretos en Supabase; cifrado en reposo de Supabase; DPA de Supabase; *Security Advisor* de Supabase | Secretos en Vercel, GitHub y Neon; cifrado en reposo de Neon; DPA de Neon; el *Security Advisor* se reemplaza por un test de CI que falla si una tabla de `public` no tiene RLS |
| 0012 | Tests de integración con Supabase local | Tests de integración contra un Postgres efímero o una rama de Neon |

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| Seguir con Supabase (ADR-0005) | No hay cupo gratuito y no hay presupuesto para el plan Pro |
| Supabase con un solo proyecto y sin staging | Igual ocupa un cupo que se necesita para otros proyectos |
| `@neondatabase/serverless` (HTTP) | Neon lo recomienda para serverless clásico; con Fluid compute el pool TCP es más rápido y robusto |
| Drizzle u otro ORM | Por ahora solo hay conexión y no tablas; se evalúa cuando aparezcan las primeras tablas (#4) |

## Consecuencias
- **Positivas:** costo de base de datos US$0 durante la validación; muchos proyectos gratuitos; ramas instantáneas para previews y pruebas; Postgres estándar sin depender de un SDK; sin latido para evitar pausas.
- **Negativas / costos:**
  - Hay que reemplazar lo que daba Supabase: autenticación (ADR-0007), almacenamiento de notas de voz, la cola y las tareas programadas (Vercel Cron o GitHub Actions).
  - Con la base en Ohio y las funciones en São Paulo, cada consulta suma ~120 ms de ida y vuelta.
  - Los datos se alojan en Estados Unidos: para usuarios de España es una transferencia internacional bajo el RGPD y requiere el DPA de Neon con cláusulas contractuales tipo (ADR-0011).
- **Revisar cuando:** se elija la autenticación de jugadores (antes de M3), se supere el almacenamiento del plan gratuito, cambien sus límites o se lance el test de tilt (región).
