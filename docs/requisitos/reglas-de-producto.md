# Reglas de producto

Reglas de los flujos de Figma (página *03 · Flujos*). Son la especificación de comportamiento; las pantallas están en la página *04 · Pantallas*.

## Hallazgos (regla de negocio central)

- **Niveles de evidencia** (D-03):
  - *Recolectando*: algún grupo comparado tiene menos de 8 partidas. Se muestra "Te faltan N partidas", nunca una conclusión.
  - *Pista*: 8+ partidas en cada grupo y 15+ puntos de diferencia de winrate. Se redacta con "podría".
  - *Patrón*: 15+ partidas en cada grupo y 15+ puntos de diferencia. Se afirma con la cifra.
- Los remakes no cuentan para winrate ni hallazgos.
- Cada hallazgo muestra su cifra, el tamaño de cada grupo y su nivel.
- El sistema calcula los números; la IA solo redacta. La IA nunca decide si hay hallazgo.
- Ventana: últimos 30 días; el resumen informa la semana (A-06).
- Corte de horario fijo: antes y después de las 0:00 (A-07).
- Máximo 3 hallazgos por semana (A-08). Gratis: el más fuerte. Premium: todos.
- Un tag forma par solo con 8+ partidas con el tag y 8+ sin él (A-10).
- El resumen se genera el lunes 00:00 en la zona horaria del jugador; el aviso sale a las 10:00 (A-09).
- Toda edición de notas o cambio de zona horaria o cuenta recalcula todo el historial.

## Notas

- Solo partidas ranked Solo/Duo y Flex. Los remakes no piden nota (A-01).
- Estados: *Anotada* (tiene reflexión), *Pendiente* (sin reflexión y menos de 24 h; es la que muestra el aviso), *Sin nota* (sin reflexión después de 24 h; se puede anotar igual).
- Anotar nunca bloquea el uso de la app.
- Ánimo: 1 Tilteado, 2 Frustrado, 3 Normal, 4 Tranquilo, 5 Enfocado. Siempre número y palabra; sin colores de victoria o derrota.
- Ninguna nota se pierde: si falla, queda en el navegador y se reintenta.
- Una nota editada o escrita después de 24 h se marca "editada" con su fecha y cuenta igual (A-24).
- Borrar una nota se puede deshacer durante 10 s (A-26).
- Varias partidas pendientes: aviso agrupado ("Tienes 3 partidas sin nota") si el anterior no se abrió (A-02).
- El correo no respalda el aviso de partida; queda para el resumen del lunes (A-04).
- Sin permiso de notificaciones, el contador en la pestaña indica cuántas faltan.

## Consentimiento y privacidad

- El consentimiento de notas se pide al anotar por primera vez, no en el onboarding.
- Si no lo acepta, usa la app solo con resultados: ve hallazgos de horario y rachas, no de ánimo ni tags (A-03). Puede aceptarlo después en Ajustes.
- Exportar, retirar consentimientos y eliminar la cuenta están en todos los planes y nunca requieren escribir a soporte.
- Eliminar es definitivo y se ofrece exportar antes. Con premium web, la suscripción se cancela sin reembolso del período en curso (A-21).
- El enlace de exportación vale 7 días; los respaldos se borran en ≤30 días (A-22).

## Onboarding

- Pedir lo mínimo: cuenta, edad, Riot ID y región.
- La política de privacidad y el aviso de no respaldo se ven antes de crear la cuenta.
- El permiso de notificaciones se puede omitir.

## Ajustes

- Los cambios se guardan al instante; no hay botón "Guardar".
- Los cambios que afectan cálculos (cuenta de Riot, zona horaria) explican antes qué va a cambiar, recalculan todo y nunca borran notas; después Inicio muestra un aviso breve (A-32).
- Al cambiar de cuenta de Riot, las notas se conservan y los hallazgos usan solo la cuenta nueva (A-29).
- La zona horaria se toma del navegador y se puede cambiar (A-30).

## Plan y suscripción (fase Producto)

- Lo gratis nunca se bloquea ni se degrada.
- Cancelar es igual de fácil que suscribirse, sin pasos de retención.
- Ningún cambio de plan borra datos.
- El cambio entre mensual y anual se aplica en la próxima renovación (A-19).

## Captación (M1 y M2)

- Sin cuenta: el test se hace como visitante.
- Solo se muestra un dato agregado de la propia cuenta, nunca la lista de partidas ni datos de otros.
- El test usa las últimas 50 partidas ranked y compara el winrate después de 2 derrotas seguidas con el resto, con los niveles de evidencia de arriba.
- El Riot ID no se guarda si el visitante no se inscribe; las respuestas del test se guardan sin Riot ID.
- El resultado muestra la cifra y una pregunta, nunca una orden.
- El aviso de no respaldo va al pie de cada pantalla.

## Voz y tono

- Personalidad: honesta, cercana, serena.
- Principios, en orden: datos antes que opinión; 30 segundos o nada; sugerir, no ordenar; hablar de partidas, no de personas; tus notas son tuyas.
- Español neutro con tuteo; jerga compartida (ranked, LP, elo, tilt, dúo, remake); frases de una idea; sin emojis en textos de sistema.

| Situación | Así sí | Así no |
|---|---|---|
| Nota guardada | Anotado. Llevas 12 partidas con nota esta semana. | ¡¡Excelente trabajo, campeón!! Sigue así 🔥 |
| Riot no responde | Riot no está respondiendo. Tu nota quedó guardada y traemos la partida cuando vuelva. | Error 503: fallo al obtener Match-V5. |
| Sin partidas | Aún no hay partidas ranked. Juega una y aparece aquí en unos minutos. | No hay datos. |
| Límite de plan gratis | Esta semana hay 2 hallazgos más. Están en Premium; tu resumen básico sigue siendo gratis. | ¡Desbloquea TODO tu potencial ahora! |
| Hallazgo | Después de las 0:00 ganaste 3 de 10. Antes, 11 de 18. ¿Quieres probar algo distinto esta semana? | Pierdes porque juegas tarde. Deja de jugar después de medianoche. |

## Identidad visual

Fuente: Figma, página *01 · Marca*.

- Tema claro por defecto y oscuro como alternativa. Marca cian (`marca/principal` #1A7290 en claro, #5BB7D0 en oscuro); victoria en verde para no confundirse con la marca.
- Tipografía: Space Grotesk para títulos y cifras grandes; Inter para el resto, con cifras tabulares en tablas.
- Espaciado base 4; radios 6, 10, 16, 24 y completo.
- Íconos Lucide, 24 px en navegación y 20 px en listas, trazo 2 px; nunca un ícono solo para comunicar un estado.
