# ADR-0007: Autenticación sin contraseña con Supabase Auth; autorización RBAC + RLS

- **Estado:** Aceptado para M1–M2 (el login de jugadores, RSO y el vínculo con coaches quedan **Propuesto**)
- **Fecha:** 2026-10-27
- **Fase:** Validación y Producto
- **Requisitos:** RES-07, RES-12, RES-16, RNF-12, DI-01, DI-02, DI-09, DI-10, DI-11, DI-14, DI-21, D-10, D-11

## Contexto
- En la validación, el visitante **no inicia sesión** (Flujo 10): deja su correo, hace el test de tilt y paga la pre-venta.
- El producto tiene roles (free, premium, coach, admin; DI-01) y aislamiento estricto por usuario (RNF-12, DI-14).
- Edad mínima de 14 años, con autorización del tutor bajo esa edad (RES-12, D-10).
- El público vive en Discord (RES-16).
- RSO (Riot Sign On) requiere la clave de producción (DI-21).
- No hay tiempo para custodiar contraseñas ni para atender soporte de "olvidé mi clave".

## Decisión
### Autenticación
1. **Proveedor:** Supabase Auth (incluido en el plan gratuito; usuarios en la misma base, lo que permite RLS directo).
2. **M1–M2 (Aceptado):**
   - Visitantes anónimos. La lista de espera y el test de tilt se protegen con Cloudflare Turnstile y un límite de tasa (ADR-0011).
   - La pre-venta se paga en el checkout de Lemon Squeezy con el correo del comprador; el vínculo con una cuenta se hace después, por ese correo.
   - **Admin (Jorge):** correo + **MFA TOTP obligatorio**, para el panel interno de métricas.
3. **Producto (Propuesto, M3):**
   - **Sin contraseñas:** código o enlace de un solo uso por correo (OTP) + **Discord OAuth** + Google OAuth.
   - SMTP propio con Resend. El SMTP integrado de Supabase tiene límites muy bajos y es solo para pruebas.
4. **Sesión:**
   - Cookies `HttpOnly`, `Secure` y `SameSite=Lax` gestionadas por `@supabase/ssr`.
   - Token de acceso corto (≤ 1 h) con *refresh token* rotativo y detección de reuso.
   - Opción de cerrar sesión en todos los dispositivos.
5. **Cuenta de Riot:**
   - La propiedad se comprueba por el ícono de perfil (D-11).
   - **RSO** se agrega cuando haya clave de producción, como verificación de la cuenta y no como login principal (DI-21).
6. **Edad:**
   - Se pide la fecha de nacimiento al registrarse.
   - Si la persona tiene menos de 14 años, se activa el flujo de autorización del tutor, y el consentimiento queda registrado y versionado (DI-11).
   - Las cuentas con menos de 14 años y sin autorización no pueden guardar datos sensibles.

### Autorización
1. **RBAC** con los roles `free`, `premium`, `coach` y `admin`.
   - El plan (`free`/`premium`) **se deriva de la suscripción** (DI-09) que escribe el webhook, nunca de un campo que el usuario pueda editar.
   - El rol se inyecta en el JWT con el *Custom Access Token Hook* de Supabase.
2. **Propiedad:** RLS `user_id = auth.uid()` en todas las tablas de datos del jugador (ADR-0005). No existe ningún endpoint que reciba el Riot ID o el id de **otro** usuario (RES-07, RNF-12).
3. **Coach (Propuesto):** accede solo a lo que el alumno compartió, a través de la tabla de vínculo con alcances y revocación inmediata (DI-10).
4. **Premium:** se verifica en el servidor (caso de uso + RLS), no solo ocultando elementos en la interfaz.
5. **Admin:** las operaciones van por Server Actions que exigen el rol `admin` y la sesión con MFA (nivel `aal2`). La clave `service_role` nunca llega al navegador.

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| Auth.js + Neon | Más código y más piezas que mantener |
| Clerk o Auth0 | Otro proveedor con datos personales fuera; los planes gratuitos tienen límites y los usuarios quedan fuera de la base, lo que complica RLS |
| Correo y contraseña | Implica custodiar contraseñas, recuperaciones y soporte; peor experiencia |
| RSO como único login | No está disponible sin clave de producción ni aprobación de Riot |

## Consecuencias
- **Positivas:** sin contraseñas que filtrar; inicio de sesión de un toque desde Discord; el aislamiento lo garantiza la base de datos.
- **Negativas / costos:** depende de que llegue el correo (dominio con SPF, DKIM y DMARC configurados en Resend); el flujo del tutor agrega complejidad legal y de producto.
- **Revisar cuando:** se apruebe RSO, existan apps nativas o se requiera SSO para coaches u organizaciones.
