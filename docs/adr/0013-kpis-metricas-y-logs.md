# ADR-0013: KPIs, analítica de producto y logs

- **Estado:** Aceptado (los KPIs de M3–M4 quedan **Propuesto**)
- **Fecha:** 2026-10-27
- **Fase:** Validación y Producto
- **Requisitos:** RN-01 a RN-05, RNF-03, RNF-07, RNF-13, RNF-19, RNF-23, RNF-24, RNF-26, DI-13, DI-27, RF-34, D-14, D-15

## Contexto
La decisión GO / pivote / no-go (D-15) depende de medir H1–H5 sin errores. La operación es de una sola persona (RNF-26): hacen falta alertas, no paneles que haya que revisar a mano. La analítica no puede hacer seguimiento de terceros ni exponer datos personales (DI-27, RNF-13, RES-05).

## Decisión
### KPIs de producto (hipótesis)
| Hipótesis | KPI | Fórmula | Meta | Eventos / fuente | Fase |
|---|---|---|---|---|---|
| H4 | Inscritos | Total en la lista de espera durante las 3 semanas | ≥ 500 | `lista_espera_inscrito` | M1 |
| H4 | Conversión de la landing | Visitantes únicos que se inscriben / visitantes únicos de la landing | ≥ 15% | `landing_vista`, `lista_espera_inscrito` | M1 |
| H4 | Costo por registro | Gasto total / inscritos | < US$0,50 | Gasto anotado a mano + inscritos | M1 |
| H4 | Uso del test de tilt | Tests completados / tests iniciados | Referencia | `test_tilt_iniciado`, `test_tilt_completado` | M1 |
| H3 | Pre-venta sobre la lista de espera | Compras / inscritos | ≥ 5% | `preventa_checkout_iniciado`, webhook `order_created` | M2 |
| H3 | Pre-venta sobre los beta activos | Compras de beta / beta activos | ≥ 3% | Ídem | M2 |
| H5 | Estado ante Riot | *Acknowledged* o *Approved* | Antes del lanzamiento | Manual | M1 |
| H1 | Hábito | Partidas ranked con reflexión / partidas ranked (semana 2) | ≥ 40% | `partida_importada`, `reflexion_guardada` | M3 (Propuesto) |
| H1 | Retención a 30 días | Usuarios activos el día 30 / cohorte | ≥ 20% | `sesion_iniciada` | M3 (Propuesto) |
| H2 | Apertura del resumen | Resúmenes abiertos / enviados | ≥ 60% | `resumen_enviado`, `resumen_abierto` | M4 (Propuesto) |
| H2 | Utilidad | Calificaciones "útil" o "muy útil" / calificaciones | ≥ 50% | `resumen_calificado` | M4 (Propuesto) |
| H2 | NPS | % promotores − % detractores | ≥ 30 | `nps_respondido` | M4 (Propuesto) |
| — | Primer hallazgo | Activos con una *Pista* antes del día 7 / activos | ≥ 70% (RNF-03) | `hallazgo_mostrado` | M3 (Propuesto) |

### KPIs técnicos y de operación
| KPI | Meta | Fuente |
|---|---|---|
| Disponibilidad de `/api/v1/salud` | ≥ 99,5% mensual | UptimeRobot (cada 5 min) |
| Tasa de errores 5xx | < 1% de las solicitudes | Sentry + logs de Vercel |
| LCP p75 en móvil | < 2,5 s (RNF-07 pide < 3 s) | Web Vitals capturados en PostHog |
| Resumen del lunes entregado | ≥ 95% de las semanas (RNF-19) | Tabla `job_run` |
| Importación de 30 días (~100 partidas) | < 2 min (D-14) | `job_run` |
| Atraso de la cola | < 15 min | `pgmq` (métrica del worker) |
| Costo de IA por usuario premium | ≤ US$0,40 al mes (RNF-23) | Tabla `uso_ia` (tokens y costo por llamada) |
| Costo total de operación | ≤ US$80 al mes (RNF-24) | Revisión manual mensual |

### Analítica de producto: PostHog Cloud UE
- **Nombres de eventos** en `snake_case`, con la forma `objeto_accion` en participio y en español (`lista_espera_inscrito`). El catálogo de eventos vive en `docs/analitica/eventos.md`; un evento nuevo requiere agregarlo ahí en el mismo PR.
- **Propiedades permitidas:** región (LAS, LAN o EUW), plan, tipo de dispositivo, variante de la landing y conteos.
- **Prohibido enviar:** correo, Riot ID, texto de las notas, ánimo individual, IP o cualquier identificador directo.
- **Configuración:**
  - región UE;
  - sin autocaptura de campos de formulario;
  - IP descartada;
  - en la landing, persistencia sin cookies (en memoria), para no requerir banner de cookies;
  - con cuenta, se identifica con un id interno pseudónimo, nunca con el correo.
- **El panel interno de métricas (RF-34)** son dashboards de PostHog durante la validación (concierge), más una consulta SQL para el H3 basada en los webhooks.

### Logs
1. **Formato:** JSON en una línea, emitido por un logger propio y mínimo en `src/shared/logger.ts`.
   ```json
   {"ts":"2026-10-27T15:00:00Z","nivel":"info","evento":"riot.partidas_importadas","modulo":"riot",
    "request_id":"…","usuario_ref":"hash","duracion_ms":842,"cantidad":37}
   ```
2. **Niveles:** `error` (requiere acción), `warn` (degradación o reintento), `info` (hito de negocio o de job). `debug` solo en el entorno local.
3. **Prohibido loguear:** correos, Riot IDs, texto de notas, ánimo, tokens, cabeceras de autorización, cuerpos de webhooks e IP en claro. `usuario_ref` es un hash con sal del id. Sentry tiene activados `sendDefaultPii: false` y un filtro `beforeSend`.
4. **Correlación:** un `request_id` generado en el middleware se propaga a los jobs y a los mensajes de la cola.
5. **Destinos y retención:**
   | Destino | Qué guarda | Retención |
   |---|---|---|
   | Logs de Vercel | Logs de ejecución | La del plan (corta en Hobby) |
   | Sentry | Errores con contexto y sin PII | La del plan gratuito |
   | Tabla `job_run` | Cada ejecución de un job: nombre, inicio, fin, estado, conteos y error | 90 días |
   | Tabla `audit_log` | Eventos de privacidad y seguridad: consentimientos, exportaciones, borrados, cambios de rol, ingresos de admin y reembolsos. Sin datos sensibles | Según la obligación legal (a confirmar en la revisión legal) |
6. **Alertas por correo a Jorge:** un error nuevo en Sentry; el resumen del lunes falló o no corrió; un mensaje terminó en la cola de fallidos; UptimeRobot detecta una caída. No hay guardias ni paginación: todo es asíncrono por correo.

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| Google Analytics | Hace seguimiento de terceros y exige banner de cookies; choca con RES-05 y DI-27 |
| Plausible o Umami | Privados y simples, pero sin embudos ni cohortes suficientes para H1–H3 (o pagos) |
| Log drains a Axiom o Datadog | En Vercel requieren plan Pro; se reevalúa al pasar a Pro |
| Medir con consultas SQL | Válido para H3 y RLS, pero no para la conversión de la landing |

## Consecuencias
- **Positivas:** la decisión GO / pivote / no-go se toma con datos; el cumplimiento de privacidad se puede auditar; Jorge recibe alertas sin vigilar paneles.
- **Negativas / costos:** mantener el catálogo de eventos; los logs en Hobby se pierden pronto (se compensa con Sentry y las tablas `job_run` y `audit_log`).
- **Revisar cuando:** se pase a Vercel Pro (log drain), se superen 1 M de eventos al mes en PostHog o termine la validación (reemplazar los KPIs de H por los de crecimiento).
