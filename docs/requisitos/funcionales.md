# Requisitos funcionales

Qué hace el sistema, sin decidir cómo se construye. La columna *Hito* indica cuándo se construye con el camino 1.

## Cuenta, vinculación y consentimiento

| ID | Requisito | Criterio de aceptación | Prioridad | Hito |
|---|---|---|---|---|
| RF-01 | Crear cuenta e iniciar sesión con Google o enlace al correo, sin contraseña (A-13) | Un visitante se registra e inicia sesión; el enlace vencido muestra cómo pedir otro | Must | M3 |
| RF-02 | Vincular una cuenta de Riot con Riot ID y región (LAS, LAN o EUW), preseleccionada según el país del navegador (A-12) | Tras vincular se importan los últimos 30 días de ranked (A-33). Una sola cuenta por usuario (C-14) | Must | M3 |
| RF-03 | Comprobar que la cuenta de Riot es del usuario, con cambio temporal del ícono de perfil verificado con la API de Riot | Sin verificación no se muestran partidas. **Ajuste (C-11)**: Should/Producto → Must/Validación | Must | M3 |
| RF-04 | Pedir la edad; bajo 14 años exigir autorización del tutor (A-11) | No se usa la app sin cumplir la regla. **Ajuste**: 14 años en todos los países (revisar con abogado para Chile, México y Argentina) | Must | M3 |
| RF-05 | Pedir consentimiento explícito antes de guardar la primera nota emocional | Sin consentimiento no se guardan notas; quien no acepta usa la app solo con resultados (A-03) | Must | M3 |

## Partidas

| ID | Requisito | Criterio de aceptación | Prioridad | Hito |
|---|---|---|---|---|
| RF-06 | Importar automáticamente las partidas recientes | Las partidas nuevas aparecen sin cargarlas a mano; botón "Buscar partidas nuevas" como máximo una vez por minuto (A-23) | Must | M3 |
| RF-07 | Solo cuentan ranked Solo/Duo y Flex | Solo aparecen esas colas. Elegir colas queda a futuro (A-31) | Must | M3 |
| RF-08 | Avisar de una partida nueva para que el jugador anote | El aviso abre la reflexión de esa partida en 1 clic. Varias pendientes: aviso agrupado si el anterior no se abrió (A-02). **Ajuste (C-08)**: Should → Must | Must | M3 |
| RF-09 | Historial con resultado, campeón, rol, fecha y hora, y la reflexión | Cada partida muestra esos datos, su nota y su estado (Anotada, Pendiente, Sin nota); se puede filtrar | Must | M3 |

## Reflexión post-partida

| ID | Requisito | Criterio de aceptación | Prioridad | Hito |
|---|---|---|---|---|
| RF-10 | Reflexión rápida: ánimo 1–5, tags predefinidos y texto libre opcional | Se completa en ≤30 s. Los remakes no piden nota (A-01). Lista de tags pendiente (P-06) | Must | M3 |
| RF-11 | Editar o completar una reflexión después | Queda actualizada, marcada "editada" con fecha si pasaron 24 h, y recalcula hallazgos (A-24) | Should | M3 |
| RF-12 | Nota de voz en lugar de texto | Queda asociada a la partida | Could | Prod. |
| RF-13 | Tags propios (máx. 20, de hasta 20 caracteres, A-14) | Se usan igual que los predefinidos. En Validación solo se ocultan predefinidos (C-12) | Could | Prod. |
| RF-37 | Borrar una nota, con Deshacer durante 10 s (A-26) | La partida se conserva; solo se borra la nota | Should | M3 |

## Análisis y resúmenes

| ID | Requisito | Criterio de aceptación | Prioridad | Hito |
|---|---|---|---|---|
| RF-14 | Resumen básico gratis: winrate, rachas, tags frecuentes y el hallazgo más fuerte | Disponible para todo usuario con partidas | Must | M4 |
| RF-15 | Resumen semanal con IA cada lunes, para premium | Se genera el lunes 00:00 en la zona horaria del jugador (A-09) | Must | M4 |
| RF-16 | Detección de hallazgos: ánimo y tags × resultado, horario × resultado, rendimiento tras rachas | Cada hallazgo muestra su cifra, el tamaño de cada grupo y su nivel; umbrales en [reglas-de-producto.md](reglas-de-producto.md) | Must | M4 |
| RF-17 | Sugerencia de foco semanal con al menos 2 alternativas | El jugador elige una o ninguna. Se omite en Validación (C-10) | Should | Prod. |
| RF-18 | Aviso de que el resumen está disponible | Aviso el lunes a las 10:00 (A-09) por navegador y correo (A-04) | Should | M4 |
| RF-19 | Si no hay datos suficientes, decirlo en vez de inventar | Se muestra "Te faltan N partidas" en lugar de una conclusión | Must | M4 |

## Captación

| ID | Requisito | Criterio de aceptación | Prioridad | Hito |
|---|---|---|---|---|
| RF-20 | Landing pública en español con test de tilt de 5 preguntas que pide el Riot ID y devuelve un dato real | El visitante ve su winrate después de 2 derrotas seguidas frente al resto, con el nivel de evidencia | Must | M1 |
| RF-21 | Inscripción en lista de espera | Se registra correo y región; "Ya inscrito" no duplica | Must | M1 |
| RF-22 | Pre-venta del plan anual con descuento | Se puede pre-pagar con pasarela web; estados rechazado y confirmado | Should | M2 |

## Suscripción

| ID | Requisito | Criterio de aceptación | Prioridad | Hito |
|---|---|---|---|---|
| RF-23 | Plan gratuito permanente | Funciona sin pagar y sin límite; nunca se bloquea ni degrada | Must | Prod. |
| RF-24 | Premium mensual o anual con precio regional | El jugador ve el precio de su región y se suscribe | Must | Prod. |
| RF-25 | Prueba de 14 días al tercer resumen semanal | Se ofrece automáticamente, sin tarjeta; aviso 3 días antes del fin (A-16, A-17) | Should | Prod. |
| RF-26 | Consultar, cambiar o cancelar la suscripción | Sin soporte y sin pasos de retención; 7 días de gracia si falla la renovación (A-18) | Must | Prod. |

## Coach y alumnos

| ID | Requisito | Criterio de aceptación | Prioridad | Hito |
|---|---|---|---|---|
| RF-27 | El coach invita hasta 10 alumnos | La invitación llega y el alumno la acepta | Should | Prod. |
| RF-28 | El alumno elige qué comparte y lo revoca | El coach deja de verlo de inmediato | Must | Prod. |
| RF-29 | Panel del coach con el progreso de sus alumnos | Ve solo lo compartido | Should | Piloto / Prod. |

## Privacidad y avisos

| ID | Requisito | Criterio de aceptación | Prioridad | Hito |
|---|---|---|---|---|
| RF-30 | Exportar los datos propios | Descarga de partidas y notas; enlace válido 7 días (A-22). **Ajuste (C-13)**: Producto → Validación | Must | M3 |
| RF-31 | Eliminar la cuenta y todos los datos desde la app | Tras confirmar se borra todo; respaldos en ≤30 días; se ofrece exportar antes. **Ajuste (C-13)**: Producto → Validación | Must | M3 |
| RF-32 | Aviso visible de no respaldo de Riot Games | En el pie de cada pantalla de la landing y la app | Must | M1 |
| RF-33 | Política de privacidad en español | Accesible desde la landing y la app antes de cualquier registro | Must | M1 |
| RF-38 | Retirar consentimientos | Al retirar el de notas, por defecto se borran; también se pueden conservar (A-20) | Must | M3 |

## Administración

| ID | Requisito | Criterio de aceptación | Prioridad | Hito |
|---|---|---|---|---|
| RF-34 | Métricas agregadas de H1–H4 | Se ven sin acceder a notas individuales. M1 cubre visitas e inscripciones (issue #6) | Must | M1–M4 |
| RF-35 | Gestión de soporte y de pedidos de privacidad | El admin registra y resuelve cada solicitud | Should | Prod. |
| RF-36 | Datos agregados y anónimos para contenido | Ningún dato identifica a un jugador | Could | Prod. |

## Fuera de alcance (Won't)

- Revisión de replays, coaching en vivo u overlays.
- Calculadoras o estimaciones de MMR o ELO.
- Ver partidas o datos de otros jugadores.
- Competir en builds y estadísticas profundas.
- Otras colas (normales, ARAM) y otros juegos.
- Varias cuentas de Riot por usuario, franjas horarias personalizadas, filtros guardados (a futuro).
