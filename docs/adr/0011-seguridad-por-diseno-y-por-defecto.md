# ADR-0011: Seguridad y privacidad por diseño y por defecto

- **Estado:** Aceptado (los controles de M3–M4 quedan **Propuesto**)
- **Fecha:** 2026-10-27
- **Fase:** Validación y Producto
- **Requisitos:** RES-05, RES-07, RES-11, RES-12, RNF-09 a RNF-16, RNF-26, DI-11, DI-14 a DI-19, D-10

> **Nota (2026-10-28):** lo que este ADR decide sobre Supabase está reemplazado por [ADR-0014](0014-neon-como-base-de-datos.md) (Neon), por falta de presupuesto. El resto sigue vigente.

## Contexto
Las notas y el ánimo son datos sensibles (RNF-09). Rigen la Ley 21.719 desde el 1 de diciembre de 2026 (RES-11) y el RGPD (RNF-16). Hay pagos, una política estricta de Riot (RES-05, RES-07) y una sola persona para responder ante un incidente. La seguridad tiene que estar en la estructura y en los valores por defecto, no depender de recordar cosas.

## Decisión
### Por diseño
1. **Modelado de amenazas liviano (STRIDE)** en cada issue habilitador de una épica nueva. Las amenazas principales identificadas hoy son:
   | Amenaza | Control |
   |---|---|
   | Un usuario lee los datos de otro | RLS con denegación por defecto + tests pgTAP (ADR-0005, ADR-0012) |
   | Abuso del test de tilt (consultar Riot IDs ajenos, agotar la cuota de Riot) | Turnstile, límite de tasa por IP con hash, caché, confirmación "Esta cuenta es mía" (A-34) y nada se guarda sin inscripción |
   | Webhook de pago falsificado o repetido | Firma HMAC, tolerancia de tiempo e idempotencia por id de evento |
   | Filtración de secretos | Secretos solo en Vercel, GitHub y Supabase; gitleaks en CI |
   | XSS por el texto libre de las notas | React escapa por defecto; se prohíbe `dangerouslySetInnerHTML` (regla de lint) y se usa una CSP estricta |
   | Inyección de instrucciones hacia la IA desde las notas (M4) | Las notas se tratan como datos delimitados; la salida se valida (sin imperativos, RNF-06; con cifra de respaldo, RNF-21) |
2. **Minimización:**
   - La lista de espera guarda solo el correo y la región (A-37).
   - La IA recibe hallazgos y extractos sin identificadores (RNF-14).
   - No se guarda el JSON completo de Riot.
   - Las métricas son agregadas y anónimas (RNF-13).
3. **Mínimo privilegio:**
   - El navegador solo usa la clave `anon`; `service_role` solo existe en el servidor.
   - Cada job tiene su propio secreto.
   - El acceso de administrador es solo para Jorge, con MFA.
4. **Defensa en profundidad:** validación con Zod en el servidor + verificación de rol en el caso de uso + RLS en la base.
5. **Privacidad por diseño:**
   - Consentimientos granulares y versionados (notas emocionales, entrenamiento de IA y autorización parental; DI-11).
   - El *opt-in* de entrenamiento de IA viene **desactivado** (RNF-10).
   - Exportación y borrado automáticos, sin intervención manual (RNF-15, RNF-26).
   - Plazos de retención ejecutados por jobs (DI-16, DI-18).
6. **Cifrado:**
   - TLS en todo el tráfico; cifrado en reposo provisto por Supabase.
   - Cifrado a nivel de aplicación del texto de las notas (ADR-0005, Propuesto).
   - Respaldos cifrados con `age` (ADR-0010).
7. **Proveedores:** solo proveedores con DPA y cláusulas para transferencias internacionales (Vercel, Supabase, Resend, PostHog, Sentry, Lemon Squeezy y el proveedor de IA). La lista se publica en la política de privacidad.

### Por defecto
| Control | Valor por defecto |
|---|---|
| RLS | Activado en toda tabla nueva; sin política no hay acceso. **La CI falla** si una tabla de `public` no tiene RLS |
| Cabeceras HTTP | CSP con *nonce*, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` mínima, `frame-ancestors 'none'` |
| Cookies | `HttpOnly`, `Secure`, `SameSite=Lax` |
| Formularios públicos | Turnstile + límite de tasa (tabla en Postgres por hash de IP y ruta) + tamaño máximo de entrada |
| Endpoints `/api/v1/jobs/*` | Secreto en cabecera con comparación en tiempo constante; rechazan todo lo demás |
| Errores al cliente | Mensajes genéricos en español; el detalle solo va a Sentry |
| Logs | Sin PII ni contenido de notas (ADR-0013) |
| Dependencias | *Lockfile* versionado, Dependabot, `pnpm audit` y Actions fijadas por SHA |
| Clave de Riot | Solo en el servidor; nunca se expone al cliente |
| Consentimientos | Todo lo opcional viene desactivado |

### Verificación
- Checklist **OWASP ASVS nivel 1** antes del lanzamiento público, registrado en un issue.
- El *Security Advisor* de Supabase sin alertas antes de cada release.
- Cabeceras verificadas con Mozilla Observatory (objetivo: A).
- **Plan ante incidentes:** un runbook breve en `docs/runbooks/incidente.md` (contener, evaluar, notificar). El RGPD exige notificar a la autoridad en 72 h; se deja revisado el plazo de la Ley 21.719.

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| WAF o servicios pagos de seguridad | Sin presupuesto; Turnstile, la CSP y RLS cubren el riesgo actual |
| Pentest externo | Costo; se reemplaza por ASVS nivel 1 + Semgrep + el modelado de amenazas |
| Delegar el aislamiento solo al código de la aplicación | Un solo bug expondría datos sensibles; RLS es la segunda barrera |

## Consecuencias
- **Positivas:** un olvido no abre los datos (los valores por defecto son seguros); el cumplimiento legal se puede demostrar.
- **Negativas / costos:** la CSP estricta y el cifrado de las notas agregan trabajo; los tests de RLS son obligatorios.
- **Revisar cuando:** haya un incidente, aparezca un dato nuevo de categoría sensible, se sume un proveedor nuevo o se lance la app nativa.
