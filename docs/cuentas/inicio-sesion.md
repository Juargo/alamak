# Inicio de sesión

Cuentas de jugador con Better Auth sobre Neon (ADR-0017). El código está en `src/modules/cuentas/`; las pantallas son `/ingresar` y `/diario`.

## Cómo funciona
- Sin contraseñas: por ahora solo Google (D-26). Discord y el enlace al correo quedan para más adelante.
- Una cuenta solo se crea con un correo verificado por el proveedor. Así, cuando se sumen otros proveedores, nadie podrá registrar un correo ajeno sin verificar.
- Un segundo proveedor se une a la cuenta existente solo si ambos correos están verificados.
- La sesión se guarda en la tabla `sessions`, dura 7 días y se renueva una vez al día mientras se use. La renovación la hace `src/proxy.ts` en `/diario` e `/ingresar`, porque los Server Components no pueden escribir cookies; el proxy también redirige del diario a `/ingresar` sin sesión antes de enviar HTML. La cookie es `HttpOnly` y `SameSite=Lax`, y `Secure` en producción (la URL base debe ser https; la validación lo exige).
- "Cerrar sesión en todos los dispositivos" borra todas las sesiones del jugador.
- La API cruda de Better Auth no permite cambiar el nombre o el correo, borrar la cuenta ni vincular proveedores (`disabledPaths`).
- El límite de intentos se guarda en la tabla `rate_limits` y se activa en producción. **Pendiente:** la acción de ingreso de `/ingresar` llama a Better Auth desde el servidor y no pasa por ese límite; conviene agregarle uno propio antes de abrir el diario al público (#40).
- Las pantallas del diario usan `requireUser()`: sin sesión redirigen a `/ingresar`. El `userId` de cualquier caso de uso sale de `getCurrentUser()`, nunca del cliente.

## Variables de entorno
| Variable | Qué es | Dónde se obtiene |
|---|---|---|
| `BETTER_AUTH_SECRET` | Clave para firmar las cookies (32 caracteres o más) | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | URL pública de la app, sin barra final (https en producción) | El dominio de producción |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Cliente OAuth de Google | Google Cloud Console |

Las páginas que no usan sesión (landing, `/privacidad`) funcionan sin estas variables. En los E2E se usan valores falsos definidos en `playwright.config.ts`.

## Configuración (una vez, la hace el responsable)
1. **Google:** en Cloud Console, crear un *OAuth client ID* de tipo *Web application*, con origen `https://<dominio>` y redirect `https://<dominio>/api/auth/callback/google`. Configurar la pantalla de consentimiento con el nombre Alamak y el enlace a `/privacidad`.
2. **Vercel:** cargar las cuatro variables en Production, marcando como *sensitive* el secreto y el *client secret*.
3. Para probar en local, agregar el redirect con `http://localhost:3000` en Google y las variables en `.env.local`.

Las migraciones (tablas `users`, `sessions`, `accounts`, `verifications` y `rate_limits`) las aplica `migrate.yml` al fusionar en `main`.

**Limitación:** los Preview de Vercel tienen una URL distinta en cada despliegue, que Google no acepta como redirect. El inicio de sesión se prueba en local o en producción.
