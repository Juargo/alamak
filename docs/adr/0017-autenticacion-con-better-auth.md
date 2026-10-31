# ADR-0017: Autenticar jugadores con Better Auth sobre Neon

- **Estado:** Aceptado
- **Fecha:** 2026-10-30
- **Fase:** Producto (M3–M4)
- **Requisitos:** RF-01, RF-04, RNF-12, RES-07, RES-12, DI-01, DI-11, D-10, D-11
- **Issue:** #22

## Contexto
- El diario (M3) necesita cuentas de jugador. ADR-0007 eligió Supabase Auth, pero la base pasó a Neon (ADR-0014), así que el proveedor quedó sin decidir.
- ADR-0007 sigue vigente en lo demás: sin contraseñas (Discord, Google y enlace al correo), cookies `HttpOnly`/`Secure`/`SameSite=Lax`, sesión corta con renovación, cerrar sesión en todos los dispositivos y aislamiento estricto por usuario.
- Sin Supabase no hay RLS ligada a `auth.uid()`. La app se conecta a Neon con un solo rol, mediante `pg` y Drizzle (ADR-0016).
- Un desarrollador a tiempo parcial: la solución debe vivir en la misma base, tener poco código propio y mantenimiento activo.
- Auth.js (NextAuth) pasó a mantenerse por el equipo de Better Auth en septiembre de 2025, que solo le da parches de seguridad y recomienda Better Auth para proyectos nuevos.

## Decisión
### Autenticación
1. **Proveedor:** Better Auth, con el adaptador de Drizzle sobre la misma base de Neon. Sus tablas (`user`, `session`, `account`, `verification`) se generan como migraciones en `drizzle/`, igual que las demás (ADR-0016).
2. **Métodos:** Discord y Google (OAuth) y enlace al correo con el plugin `magicLink`, enviado por Resend. Sin contraseñas.
3. **Sesión:**
   - Guardada en la base y referida por una cookie `HttpOnly`, `Secure` y `SameSite=Lax`.
   - Dura 7 días y se renueva una vez al día mientras se use.
   - "Cerrar sesión en todos los dispositivos" revoca todas las sesiones del usuario.
4. **Ruta:** el handler vive en `src/app/api/auth/[...all]/route.ts`. Las pantallas del diario leen la sesión en el servidor y redirigen al inicio de sesión si no existe.
5. **Límite de intentos:** se activa el *rate limit* de Better Auth, guardado en la base y no en memoria, porque las funciones serverless no comparten memoria.
6. **Edad:** la fecha de nacimiento y la autorización del tutor (#24) son campos y tablas propias del módulo de cuentas, no del proveedor.

### Aislamiento de datos (reemplaza la RLS de ADR-0007)
1. Cada tabla del jugador tiene `user_id`. Los casos de uso reciben el `userId` **solo** de la sesión del servidor; ningún endpoint ni Server Action acepta un `userId` ni un Riot ID ajeno desde el cliente (RES-07).
2. Los repositorios exigen `userId` en cada consulta, para que no exista una consulta del jugador sin ese filtro.
3. Un test de integración por repositorio comprueba que un usuario no lee ni modifica los datos de otro.
4. La RLS de Postgres queda como defensa adicional para después, cuando haya notas cifradas en producción (revisar en #29).

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| Auth.js (NextAuth v5) | En modo mantenimiento desde septiembre de 2025; sus propios mantenedores recomiendan Better Auth para proyectos nuevos |
| Neon Auth (gestionado) | Agrega otro servicio con datos personales y otra superficie que configurar; Better Auth en la misma base cubre lo mismo sin costo |
| Clerk o Auth0 | Usuarios fuera de la base, datos personales en otro proveedor y límites en los planes gratuitos (ya descartados en ADR-0007) |
| Implementación propia (sesiones a mano) | Más código de seguridad crítica que mantener y probar |
| RLS de Postgres desde el inicio | Con un solo rol y pool compartido exige fijar el usuario en cada transacción; mucho costo para un único desarrollador frente a filtros obligatorios probados |

## Consecuencias
- **Positivas:** usuarios y sesiones en la misma base y bajo las mismas migraciones; sin contraseñas que filtrar; inicio de sesión de un toque desde Discord; dependencia con mantenimiento activo.
- **Negativas / costos:**
  - El aislamiento depende de la disciplina del código y de sus tests, no de la base; un repositorio sin filtro por `userId` sería una fuga.
  - El enlace al correo depende de un dominio propio verificado en Resend (el mismo bloqueo que #21).
  - Better Auth es una dependencia más que actualizar.
- **Revisar cuando:** haya notas cifradas en producción (evaluar RLS), se apruebe RSO, aparezcan coaches con acceso a datos de alumnos o Better Auth cambie su licencia o su modelo de mantenimiento.
