# ADR-0005: PostgreSQL (Supabase) como única base de datos, relacional y ACID, con RLS

- **Estado:** Aceptado (el cifrado de las notas y Storage quedan **Propuesto** para M3)
- **Fecha:** 2026-10-27
- **Fase:** Validación y Producto
- **Requisitos:** RNF-09, RNF-12, RNF-13, RNF-15, RNF-18, DI-01 a DI-19, D-10, D-14

## Contexto
- Los datos son claramente relacionales: usuario → cuenta de Riot → partidas → reflexiones → hallazgos → resúmenes; suscripción; vínculo coach–alumno; consentimientos (DI-01 a DI-13).
- Hay operaciones que deben ser atómicas: guardar una reflexión y actualizar sus hallazgos; activar un plan a partir de un webhook y registrar el evento.
- RNF-18 no admite pérdida de reflexiones. Las notas y el ánimo son datos sensibles (RNF-09). Cada usuario solo ve lo suyo (RNF-12, DI-14).
- No hay requisito de búsqueda semántica ni de embeddings.

## Decisión
1. **Una sola base: PostgreSQL gestionado por Supabase.** Es relacional y con transacciones ACID. No hay base no relacional ni vectorial.
2. **Modelo normalizado** para las entidades DI-01 a DI-13. Se usa `jsonb` solo donde la estructura varía (por ejemplo, el detalle de los patrones de un resumen), nunca para relaciones.
3. **Transacciones** en todo caso de uso que escribe en más de una tabla, junto con el evento del *outbox* (ADR-0002).
4. **Row Level Security activado en todas las tablas** del esquema `public`, con denegación por defecto:
   - Políticas de propietario: `user_id = auth.uid()`.
   - Coach: acceso solo a través de la tabla de vínculo, con alcances y fecha de revocación (DI-10).
   - Las tablas de captación (lista de espera, resultados del test) **no** tienen políticas para `anon`: se escriben solo desde el servidor.
5. **Acceso a datos:** `supabase-js` con `@supabase/ssr` desde el servidor, usando la sesión del usuario para que RLS se aplique siempre, y tipos generados con `supabase gen types`. La clave `service_role` se usa solo en jobs, webhooks y tareas de administración del servidor.
6. **Migraciones:** archivos SQL versionados en `supabase/migrations/` (incluidas las políticas RLS), aplicados con Supabase CLI. Patrón *expand/contract*: los cambios destructivos van en dos PR.
7. **Fechas y zona horaria:** `timestamptz` en UTC; la zona horaria del usuario se guarda en su perfil y se usa para el horario y el día del resumen (Flujo 9).
8. **Datos de Riot:** de cada partida se guardan solo los campos del jugador que se usan (DI-03), no el JSON completo. La clave natural es `match_id` + `puuid`, para que la importación sea idempotente.
9. **Borrado y retención:** `ON DELETE CASCADE` desde el usuario; los respaldos se retienen ≤ 30 días (D-10). La lista de espera se purga según la regla que se defina en A-37 (DI-18), con un job programado.
10. **Datos sensibles (Propuesto, M3):**
    - Cifrado en reposo del disco (lo provee Supabase).
    - **Cifrado a nivel de aplicación** del texto libre de las reflexiones con AES-256-GCM. La clave vive en las variables de entorno del servidor y cada fila guarda la versión de la clave para poder rotarla.
    - Nota de voz en un bucket privado de Supabase Storage, con URLs firmadas de vida corta.
    - Las métricas y el contenido usan vistas agregadas y anónimas (RNF-13).
11. **Si aparece una necesidad vectorial**, se usa la extensión `pgvector` en la misma base antes que un servicio aparte.

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| Prisma ORM (stack habitual de Jorge) | Se conecta con un rol que **salta RLS**, con lo que se pierde la defensa en profundidad. Además exige configurar el pooler en serverless y duplica las migraciones (las políticas RLS igual se escriben en SQL) |
| Drizzle ORM | Viable y compatible con RLS; queda como **plan B** si las consultas con `supabase-js` se vuelven incómodas |
| Neon (Postgres serverless) | Buena opción, pero obliga a armar aparte Auth, cron y Storage |
| MongoDB o Firestore | Los datos son relacionales; las transacciones entre documentos son menos naturales |
| Base vectorial dedicada (Pinecone, Qdrant) | No hay requisito |

## Consecuencias
- **Positivas:** integridad garantizada por la base; el aislamiento entre usuarios lo aplica Postgres y no solo el código; un solo sistema que respaldar y restaurar.
- **Negativas / costos:**
  - Hay que escribir SQL a mano para las políticas y migraciones.
  - Los tests de RLS son obligatorios (ADR-0012).
  - El cifrado a nivel de aplicación impide buscar dentro del texto de las notas desde SQL (aceptable: no es un requisito).
- **Revisar cuando:** aparezca un requisito de búsqueda de texto o semántica, o la base supere la capacidad del plan Pro.
