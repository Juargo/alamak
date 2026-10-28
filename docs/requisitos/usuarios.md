# Usuarios, roles e historias

## Roles y permisos

| Rol | Quién es | Puede | No puede |
|---|---|---|---|
| Visitante | Entra a la landing | Hacer el test de tilt con un Riot ID que declara suyo y ver un dato agregado; inscribirse en la lista de espera | Guardar notas, ver historial o ver la lista de partidas |
| Jugador gratis | Cuenta con Riot ID vinculado y verificado | Importar sus partidas, anotar, ver su historial, el resumen básico y el hallazgo más fuerte de la semana; exportar y borrar sus datos | Ver todos los hallazgos ni el resumen con IA |
| Jugador premium | Suscriptor | Todo lo anterior, más el resumen semanal con IA y todos los hallazgos (máximo 3) | Ver datos de otros jugadores |
| Coach | Coach o creador hispano (B2B) | Panel con hasta 10 alumnos | Ver datos de un alumno sin su consentimiento explícito |
| Alumno | Jugador que acepta a un coach | Elegir qué comparte y revocarlo | — |
| Admin | Operación (Jorge) | Soporte, pedidos de privacidad, métricas agregadas | Leer notas individuales; compartir datos con terceros |

**Ajuste (C-02, propuesta pendiente)**: en Obsidian exportar y borrar aparecían solo en Premium. Se mueven a todo rol con cuenta, como exige la Ley 21.719 y el RGPD.

Reglas de permisos:

- Un jugador solo ve sus propias partidas; el coach solo las de alumnos vinculados y lo que compartieron.
- La propiedad de la cuenta de Riot se comprueba antes de mostrar partidas (C-11).
- Edad mínima 14 años en todos los países; bajo esa edad, autorización del tutor (A-11).
- Datos agregados solo anónimos y para contenido, nunca por jugador.

## Personas

**Matías, escalador estancado (principal)**: 22 años, Oro II en LAS, Santiago. 3–4 ranked por noche. Juega en PC; anota justo después de la partida, en el PC o en el móvil. Dolor: "No sé por qué no subo". Nunca pagó una app de LoL, pero sí skins; pagaría CLP 2.990/mes si ve un patrón claro. Meta: Platino antes de fin de temporada.

**Tilteado crónico (gancho de marketing)**: 18–28 años, cualquier elo, rachas de derrotas y juego nocturno, LAS o LAN. Dolor emocional y de autocontrol. Necesita que anotar sea inmediato.

**Coach hispano (B2B)**: 25–35 años, coach independiente o creador educativo, España, Argentina o México. Dolor: seguir a sus alumnos entre sesiones. Usa el panel en PC.

Secundarias: aspirante competitivo (early adopter) y grinder Diamante+ (prioridad baja).

Las hipótesis de personas se validan en las 10 entrevistas de la semana 2 (Chile, México, España; incluir 2–3 coaches).

## Historias de usuario

### Jugador

| ID | Historia | Criterio de aceptación | Prioridad | Hito |
|---|---|---|---|---|
| RU-01 | Como jugador, quiero anotar en 30 s lo que sentí y decidí, para no olvidarlo | Completo la reflexión en ≤30 s, en escritorio o en el navegador del móvil | Must | M3 |
| RU-02 | Como jugador, quiero un aviso al terminar una partida, para no tener que acordarme | El aviso me lleva directo a la reflexión de esa partida | **Must** (C-08) | M3 |
| RU-03 | Como jugador, quiero ver mi historial con mis notas | Veo cada partida con su resultado y lo que anoté | Must | M3 |
| RU-04 | Como jugador, quiero ver algo real sobre mí en la primera semana | Antes del día 7 veo una pista o el progreso "Te faltan N partidas" (C-09) | Must | M3/M4 |
| RU-05 | Como jugador premium, quiero cada lunes un resumen con el patrón que me cuesta LP | Llega cada lunes y nombra al menos un hallazgo con su cifra, o explica qué falta | Must | M4 |
| RU-06 | Como tilteado crónico, quiero saber si pierdo más a ciertas horas, tras rachas o cuando estoy tilteado | Veo mi winrate por horario, tras rachas y según mis tags de ánimo | Must | M4 |
| RU-07 | Como jugador, quiero una sugerencia de foco semanal con alternativas y elegir yo | Al menos 2 opciones redactadas como sugerencia | Should | Prod. |
| RU-08 | Como jugador hispano, quiero la app en español | Español neutro con jerga gamer compartida (ver RNF-05) | Must | Todos |
| RU-09 | Como jugador, quiero descargar o borrar mis datos | Exporto y elimino cuenta y notas desde la app, en cualquier plan | Must | **M3** (C-13) |
| RU-10 | Como jugador, quiero probar premium antes de pagar | 14 días de prueba sin tarjeta | Should | Prod. |
| RU-11 | Como jugador de LATAM, quiero un precio acorde a mi país | Veo el precio en mi moneda | Should | Prod. |
| RU-12 | Como jugador, quiero saber que mis notas emocionales son privadas | Antes de la primera nota se me explica cómo se protegen y se me pide consentimiento | Must | M3 |

### Visitante

| ID | Historia | Criterio de aceptación | Prioridad | Hito |
|---|---|---|---|---|
| RU-13 | Como visitante, quiero hacer un test de tilt con mi Riot ID y ver un dato real sin registrarme | En menos de un minuto veo un dato calculado con mis partidas | Must | M1 |
| RU-14 | Como visitante interesado, quiero dejar mis datos para enterarme del lanzamiento | Me inscribo en la lista de espera desde la landing | Must | M1 |
| RU-20 | Como inscrito, quiero pre-pagar el plan anual con descuento | Pago con garantía de devolución y recibo confirmación | Should | M2 |

### Coach y alumno

| ID | Historia | Criterio de aceptación | Prioridad | Hito |
|---|---|---|---|---|
| RU-15 | Como coach, quiero seguir el progreso de mis alumnos entre sesiones | Veo lo que cada alumno decidió compartir | Should | Piloto / Prod. |
| RU-16 | Como coach, quiero invitar a mis alumnos | Invito hasta 10 | Should | Prod. |
| RU-17 | Como alumno, quiero decidir qué comparto y poder revocarlo | Elijo qué compartir y lo revoco en cualquier momento | Must | Prod. |

### Admin

| ID | Historia | Criterio de aceptación | Prioridad | Hito |
|---|---|---|---|---|
| RU-18 | Como admin, quiero métricas agregadas para decidir GO, pivote o no-go | Veo H1–H4 sin acceder a notas individuales | Must | M1 (H4), M2 (H3), M3–M4 (H1–H2) |
| RU-19 | Como admin, quiero atender soporte y pedidos de privacidad | Respondo y ejecuto pedidos de borrado o exportación | Should | Prod. |

## Necesidades de adopción

- Del aviso a la reflexión en 1 clic o toque, desde la segunda nota (C-07).
- Valor temprano: pista o progreso visible antes del día 7.
- Tono de acompañamiento, nunca de órdenes ni de juicio.
- Momento de uso: justo después de la partida, en el mismo PC o en el móvil.
