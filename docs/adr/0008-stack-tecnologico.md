# ADR-0008: Stack tecnológico

- **Estado:** Aceptado (las filas marcadas M3/M4 quedan **Propuesto**)
- **Fecha:** 2026-10-27
- **Fase:** Validación y Producto
- **Requisitos:** RES-08, RES-15, RES-23, RNF-04, RNF-08, RNF-10, RNF-14, RNF-23, RNF-27, D-05, D-06, D-07

## Contexto
Hace falta un stack que Jorge ya domine (TypeScript, React, Vercel) para no gastar las 2 h semanales en aprender. Debe costar ~0 y servir para la web responsive (D-06), dejando abierta la puerta a apps nativas en el futuro.

## Decisión
| Capa | Tecnología | Fase | Notas |
|---|---|---|---|
| Lenguaje y runtime | TypeScript `strict`, Node.js 24 LTS, pnpm | M1 | Un solo lenguaje |
| Framework web | Next.js (App Router, última versión estable) + React | M1 | SSR/SSG para la landing (SEO), Server Actions y Route Handlers |
| Estilos y UI | Tailwind CSS v4 con los tokens de la Etapa 2 (Space Grotesk + Inter, D-05; tema claro/oscuro, D-07); componentes shadcn/ui (Radix); íconos Lucide | M1 | Radix aporta accesibilidad (RNF-08). Identidad propia, sin parecerse a Riot (RES-08) |
| Formularios y validación | Zod (+ React Hook Form) | M1 | Los mismos esquemas en el cliente y el servidor |
| Datos, auth y colas | Supabase: Postgres, Auth, Storage, Queues (`pgmq`), `pg_cron`; `supabase-js` y `@supabase/ssr` | M1 | ADR-0005 y ADR-0007 |
| Correo | Resend + React Email | M1 | Plan gratuito: 3.000 correos al mes, 100 al día |
| Anti-bots | Cloudflare Turnstile | M1 | Gratis, sin CAPTCHA molesto |
| Datos de juego | Cliente HTTP propio sobre `fetch` para la Riot API; Data Dragon para campeones e imágenes | M1 | Solo datos oficiales (RES-10) |
| Pagos | Lemon Squeezy | M2 | ADR-0009 |
| Analítica | PostHog Cloud (UE) | M1 | ADR-0013 |
| Errores | Sentry (`@sentry/nextjs`) | M1 | Limpieza de PII activada |
| Notificaciones | Web Push estándar (`web-push`, VAPID) + *service worker* | M3 (Propuesto) | Sin servicio pago de notificaciones |
| IA | Interfaz `GeneradorDeResumen`; candidato: modelo pequeño de la familia **Claude Haiku** (API de Anthropic); alternativa: Gemini Flash | M4 (Propuesto) | Se elige por costo ≤ US$0,40 por usuario premium (RNF-23), DPA para el RGPD y no uso de los datos para entrenar (RNF-10) |
| Pruebas | Vitest, Testing Library, Playwright, pgTAP (`supabase test db`), MSW, axe | M1 | ADR-0012 |
| Calidad | ESLint, Prettier, `dependency-cruiser` | M1 | ADR-0004 |
| CI/CD y seguridad | GitHub Actions, Dependabot, Semgrep CE, gitleaks | M1 | ADR-0010 y ADR-0011 |

**Regla general:** cualquier librería o proveedor que no esté en esta tabla requiere justificación en el PR o un ADR nuevo (ADR-0001).

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| Astro para la landing y Next.js para la app | Dos stacks; la landing y el test de tilt ya necesitan servidor |
| Expo (React Native) web desde ya | Solo web por ahora (D-06); la web de Expo es menos madura para SEO. Con TypeScript y el dominio puro, la lógica se reutilizará en las apps nativas futuras |
| Remix o SvelteKit | Sin ventaja clara frente al stack que Jorge ya domina |
| Prisma | Ver ADR-0005 (salta RLS) |

## Consecuencias
- **Positivas:** curva de aprendizaje casi nula; todo con plan gratuito; el dominio en TypeScript sirve para las futuras apps con React Native.
- **Negativas / costos:** dependencia del ecosistema Vercel/Next.js, mitigada porque la lógica vive en módulos independientes del framework (ADR-0002).
- **Revisar cuando:** se decidan las apps nativas, se elija el proveedor de IA (antes de M4) o cambie un plan gratuito de algún proveedor.
