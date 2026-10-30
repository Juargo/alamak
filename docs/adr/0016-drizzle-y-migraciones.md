# ADR-0016: Usar Drizzle para el esquema y las migraciones

- **Estado:** Aceptado
- **Fecha:** 2026-10-29
- **Fase:** Validación (M1–M2)
- **Requisitos:** RES-14, D-20
- **Issue:** #4

## Contexto
- El ADR-0014 dejó para el #4 la elección de la herramienta de migraciones y de un ORM, cuando aparecieran las primeras tablas.
- La lista de espera (#4) crea la primera tabla. El diario y el resumen semanal (M3–M4) van a sumar varias tablas más.
- El ADR-0010 exige migraciones solo hacia adelante y compatibles hacia atrás, aplicadas desde GitHub Actions en cada push a `main`.
- Al preparar el #4 se descubrió que `DATABASE_URL` en Vercel era una sola variable para Production y Preview, así que los *previews* escribían en la base de producción.

## Decisión
1. **Esquema:** se define en TypeScript con Drizzle (`drizzle-orm`), en `src/modules/<modulo>/infraestructura/schema.ts`. Las consultas usan Drizzle sobre el `Pool` de `pg` del ADR-0014.
2. **Migraciones:** `pnpm db:generate` (drizzle-kit) genera archivos SQL versionados en `drizzle/`, que se revisan en el PR. `pnpm db:migrate` los aplica con `DATABASE_URL_UNPOOLED`. No se usan migraciones *down*.
3. **Aplicación automática:** el workflow `migrate.yml` aplica las migraciones pendientes cuando un PR o un push a `main` cambia `drizzle/`.
   - PR → entorno `preview` de GitHub (rama de Neon `preview`).
   - Push a `main` → entorno `production` de GitHub (rama de Neon `production`).
   - Cada entorno de GitHub guarda su propio secreto `DATABASE_URL_UNPOOLED`.
4. **Ambiente Preview (corrige el punto 4 del ADR-0014):** en lugar de una rama de Neon por PR, todos los *previews* usan una rama fija `preview`, sin expiración. En Vercel, `DATABASE_URL` tiene un valor para Production y otro distinto para Preview.

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| SQL a mano con `pg` y un script propio de migraciones | Más simple con una sola tabla, pero los tipos se escriben a mano y habría que mantener el script; con las tablas del diario se terminaría migrando |
| Prisma | Ya descartado en el ADR-0005: cliente pesado en serverless y otro lenguaje de esquema |
| Una rama de Neon por PR (integración Neon–Vercel) | Aísla mejor, pero suma configuración y ramas que limpiar; para un desarrollador con datos ficticios no compensa |

## Consecuencias
- **Positivas:** el esquema y las consultas tienen tipos; las migraciones son SQL legible en cada PR; los *previews* ya no tocan datos de producción.
- **Negativas / costos:** dos dependencias nuevas (`drizzle-orm`, `drizzle-kit`). Los PR comparten la rama `preview`: dos PR con migraciones distintas pueden chocar, y la rama puede quedar con migraciones de un PR que no se fusionó (se resuelve recreando la rama desde `production`).
- **Revisar cuando:** haya más de un desarrollador o PR con migraciones en paralelo (pasar a una rama por PR), o Drizzle limite las políticas RLS del ADR-0014.
