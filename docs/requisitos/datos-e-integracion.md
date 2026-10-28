# Datos e integración

## Datos

| ID | Dato | Contenido | Sensibilidad |
|---|---|---|---|
| DI-01 | Usuario | Contacto, edad, región, zona horaria, rol (gratis, premium, coach, admin) | Personal |
| DI-02 | Cuenta de Riot vinculada | Riot ID, región, si la propiedad está comprobada | Personal |
| DI-03 | Partida | Resultado (victoria, derrota, remake), campeón, rol, cola, fecha y hora, duración, estadísticas básicas | Personal (dato de juego) |
| DI-04 | Reflexión | Ánimo 1–5, tags, texto libre, marca "editada" y fecha; nota de voz a futuro | **Sensible** |
| DI-05 | Tag | Predefinidos (se ocultan, no se borran) y propios | Baja |
| DI-06 | Resumen semanal | Semana, hallazgos, texto generado | **Sensible** |
| DI-07 | Hallazgo | Tipo (horario, racha, tag, ánimo), cifras y tamaño de cada grupo, nivel (Recolectando, Pista, Patrón), período | Sensible |
| DI-08 | Foco semanal | Alternativas sugeridas y la elegida | Personal |
| DI-09 | Suscripción o pre-venta | Plan, estado, región de precio, monto, fechas | Personal (sin tarjeta) |
| DI-10 | Vínculo coach–alumno | Coach, alumno, qué se comparte, fechas de inicio y revocación | Personal |
| DI-11 | Consentimiento | Tipo (notas, entrenamiento de IA, tutor), fecha, versión aceptada | Registro legal |
| DI-12 | Lista de espera | Correo y región (A-37, pendiente) | Personal |
| DI-29 | Respuestas del test de tilt | Respuestas sin Riot ID, para medir H4 | Anónima |
| DI-13 | Métricas agregadas | Indicadores H1–H4 y datos de comunidad anónimos | Anónima |

## Reglas sobre los datos

| ID | Regla |
|---|---|
| DI-14 | Cada jugador accede solo a sus datos; el coach solo a lo que el alumno comparte |
| DI-15 | No se guardan datos de tarjetas; los gestiona la pasarela |
| DI-16 | Los datos se conservan mientras exista la cuenta y se borran por completo al eliminarla; respaldos en ≤30 días |
| DI-17 | Las partidas de Riot se guardan para no pedirlas dos veces y respetar los límites |
| DI-18 | La lista de espera se borra a los 6 meses si la persona no se registra (A-37, pendiente) |
| DI-19 | Todo dato en contenido o marketing es agregado y anónimo |
| DI-30 | El Riot ID del test de tilt no se guarda si el visitante no se inscribe |
| DI-31 | Los datos de Riot no se editan a mano; solo la reflexión (A-25) |
| DI-32 | Las partidas no se borran ni se ocultan; solo sus notas (A-27) |

## Integraciones externas

| ID | Sistema | Para qué | Prioridad | Hito |
|---|---|---|---|---|
| DI-20 | Riot Games API (datos oficiales) | Partidas, verificación por ícono, datos estáticos de campeones | Must | M1 (test de tilt) |
| DI-21 | Riot Sign On | Prueba de propiedad más fuerte | Could | Prod. (requiere clave de producción) |
| DI-22 | Proveedor de IA | Redactar resúmenes con hallazgos ya calculados | Must | M4 |
| DI-23 | Tiendas de apps | **Fuera de alcance** mientras el producto sea solo web | Won't | — |
| DI-24 | Pasarela de pago web | Pre-venta y luego suscripciones | Must | M2 |
| DI-25 | Notificaciones del navegador | Partida nueva y resumen semanal | Must | M3 |
| DI-26 | Correo transaccional | Confirmación de lista de espera, enlace de inicio de sesión, pre-venta, resumen del lunes | Must | M1 |
| DI-27 | Analítica de producto sin seguimiento de terceros | Medir H1–H4 | Must | M1 |
| DI-28 | Discord | Bot de resumen del server | Could | Prod. |

**Ajustes**: DI-24 sube de Could/Producto a Must/M2 porque la pre-venta (issue #9) cobra por web. DI-26 sube a Must/M1 porque la lista de espera envía correo de confirmación (issue #4). DI-25 sube a Must por C-08.

## Migración

- No hay sistema legado.
- Los participantes de la validación pasan al producto completo solo con su consentimiento (supuesto).

## Riesgos de integración

- Riot puede cambiar políticas o límites: usar solo datos oficiales y guardar lo consultado.
- Aprobación de Riot retrasada: registro en la semana 1.
- Proveedor de IA y demás encargados con acuerdo de tratamiento de datos y transferencias internacionales cubiertas.
