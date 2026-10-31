# Inicio de sesión

Cuentas de jugador con Better Auth sobre Neon (ADR-0017). El código está en `src/modules/cuentas/`; las pantallas son `/ingresar` y `/diario`.

## Cómo funciona
- Sin contraseñas: Discord y Google. El enlace al correo llega cuando haya dominio propio en Resend (issue #23, tarea pendiente).
- Una cuenta solo se crea con un correo verificado por el proveedor. Así nadie puede registrar con Discord un correo ajeno sin verificar.
- Un segundo proveedor se une a la cuenta existente solo si ambos correos están verificados.
- La sesión se guarda en la tabla `sessions`, dura 7 días y se renueva una vez al día mientras se use. La cookie es `HttpOnly` y `SameSite=Lax`, y `Secure` en producción (la URL base debe ser https; la validación lo exige).
- "Cerrar sesión en todos los dispositivos" borra todas las sesiones del jugador.
- El límite de intentos se guarda en la tabla `rate_limits` y se activa en producción.
- Las pantallas del diario usan `requireUser()`: sin sesión redirigen a `/ingresar`. El `userId` de cualquier caso de uso sale de `getCurrentUser()`, nunca del cliente.

## Variables de entorno
| Variable | Qué es | Dónde se obtiene |
|---|---|---|
| `BETTER_AUTH_SECRET` | Clave para firmar las cookies (32 caracteres o más) | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | URL pública de la app, sin barra final (https en producción) | El dominio de producción |
| `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` | App OAuth de Discord | Discord Developer Portal |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Cliente OAuth de Google | Google Cloud Console |

Las páginas que no usan sesión (landing, `/privacidad`) funcionan sin estas variables. En los E2E se usan valores falsos definidos en `playwright.config.ts`.

## Configuración (una vez, la hace el responsable)
1. **Discord:** en el Developer Portal, crear una aplicación → *OAuth2* → agregar el redirect `https://<dominio>/api/auth/callback/discord`. Copiar *Client ID* y *Client Secret*.
2. **Google:** en Cloud Console, crear un *OAuth client ID* de tipo *Web application*, con origen `https://<dominio>` y redirect `https://<dominio>/api/auth/callback/google`. Configurar la pantalla de consentimiento con el nombre Alamak y el enlace a `/privacidad`.
3. **Vercel:** cargar las seis variables en Production, marcando como *sensitive* el secreto y los dos *client secret*.
4. Para probar en local, agregar los redirects con `http://localhost:3000` en ambos proveedores y las variables en `.env.local`.

Las migraciones (tablas `users`, `sessions`, `accounts`, `verifications` y `rate_limits`) las aplica `migrate.yml` al fusionar en `main`.

**Limitación:** los Preview de Vercel tienen una URL distinta en cada despliegue, que Discord y Google no aceptan como redirect. El inicio de sesión se prueba en local o en producción.
