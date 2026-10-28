# Registro de decisiones de arquitectura (ADR)

Un archivo por decisión: `NNNN-titulo-corto.md`, basado en [`0000-plantilla.md`](0000-plantilla.md), con Contexto, Decisión, Alternativas consideradas y Consecuencias. Las reglas del proceso están en [ADR-0001](0001-registrar-decisiones-con-adr.md).

**Estados:** *Aceptado* rige ahora · *Propuesto* se revisa después del GO (M3–M4) · *Reemplazado* / *Descartado* se conservan como historia.

## Índice
| ADR | Tema | Decisión en una línea | Estado |
|---|---|---|---|
| [0001](0001-registrar-decisiones-con-adr.md) | Proceso | Decisiones como ADR en el repo; lo de M3–M4 queda Propuesto hasta el GO | Aceptado |
| [0002](0002-estilo-de-arquitectura.md) | Estilo de arquitectura | Monolito modular por capas (hexagonal liviano); asíncrono con cola en Postgres | Aceptado / cola Propuesta |
| [0003](0003-topologia-de-despliegue.md) | Topología de despliegue | Vercel (Hobby → Pro al cobrar) + Supabase en São Paulo; ~US$0 → ~US$46 al mes | Aceptado; Supabase reemplazado por 0014 |
| [0004](0004-mantenibilidad-y-escalabilidad.md) | Mantenible y escalable | TS estricto, límites verificados, proveedores detrás de puertos; escala serverless + caché y lotes | Aceptado |
| [0005](0005-base-de-datos.md) | Base de datos | Solo PostgreSQL (ACID) con RLS; sin NoSQL ni base vectorial; `supabase-js` en vez de Prisma | Aceptado; Supabase reemplazado por 0014 |
| [0006](0006-estilo-de-api.md) | API | REST `/api/v1` + Server Actions; sin WebSocket; Web Push para avisos | Aceptado |
| [0007](0007-autenticacion-y-autorizacion.md) | Authn / Authz | Supabase Auth sin contraseña (OTP, Discord, Google); RBAC + RLS; MFA para admin | Aceptado / login de jugadores Propuesto; Supabase Auth reemplazado por 0014 (proveedor por decidir) |
| [0008](0008-stack-tecnologico.md) | Tecnologías | Next.js, Tailwind, shadcn/ui, Supabase, Resend, PostHog, Sentry; IA por definir | Aceptado; Supabase reemplazado por 0014 |
| [0009](0009-pagos-merchant-of-record.md) | Pagos | Lemon Squeezy como Merchant of Record (Paddle de alternativa) | Aceptado, con verificaciones pendientes |
| [0010](0010-ci-cd.md) | CI/CD | GitHub Actions (≤ 10 min) + Vercel Git; migraciones *expand/contract*; respaldo propio | Aceptado |
| [0011](0011-seguridad-por-diseno-y-por-defecto.md) | Seguridad | Modelado de amenazas, RLS por defecto, CSP, Turnstile, sin PII, ASVS nivel 1 | Aceptado |
| [0012](0012-piramide-de-testing-y-criterios-de-aceptacion.md) | Testing | 70/20/10, RLS probado con pgTAP, criterios Dado/Cuando/Entonces trazados a tests | Aceptado |
| [0013](0013-kpis-metricas-y-logs.md) | KPIs y logs | KPIs de H1–H5 en PostHog UE; logs JSON sin PII; `job_run` y `audit_log`; alertas por correo | Aceptado |
| [0014](0014-neon-como-base-de-datos.md) | Base de datos | Postgres en Neon (reemplaza a Supabase en todos los ADR); `pg` + pool con Fluid compute; región Ohio hasta #7 | Aceptado |
| [0015](0015-decisiones-de-captacion-y-pre-venta.md) | Captación y pre-venta | Test con "Esta cuenta es mía" y un dato agregado; pre-venta CLP 14.990 / US$10,99 / €17,99; garantía hasta el 30-sep-2027; lista de espera solo correo y región; lanzamiento 30-jun-2027 | Aceptado |

## Pendientes que abren o cierran ADRs
- [ ] Verificar las condiciones de Lemon Squeezy para un vendedor en Chile (ADR-0009) antes del issue #9.
- [ ] Pasar a Vercel Pro antes de activar la pre-venta (ADR-0003).
- [ ] Elegir el proveedor de IA (ADR-0008) antes de M4.
- [ ] Elegir la autenticación de jugadores, el almacenamiento y la cola sin Supabase (ADR-0014) antes de M3.
- [ ] Revisar la región de Neon (Ohio frente a `gru1`) antes de lanzar el test de tilt, #7 (ADR-0014).
- [ ] Firmar el DPA de Neon antes de recibir datos de usuarios de España (ADR-0014).
- [ ] Revisar todos los ADR *Propuestos* en la planificación posterior al GO.
