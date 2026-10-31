# Alamak

Diario de ranked en español para League of Legends: el jugador anota en 30 segundos cómo se sintió después de cada partida y cada lunes recibe los patrones que le están costando LP.

## Estado
Construcción del **diario (M3)**, sprints 3 a 10. Desde el 30-10-2026 se salta la validación previa: la landing con lista de espera ya está en producción, y el test de tilt, el correo de confirmación y la pre-venta (M1 y M2) quedan para los sprints 11 y 12. El resumen semanal (M4) va después del diario. Abrir el diario a otros jugadores requiere la clave de producción de Riot.

## Cómo trabajar en este repo
- Un desarrollador a tiempo parcial (~2 h/semana). Los issues son la especificación: si algo no está en el issue, pregunta en un comentario en vez de suponer.
- Sprints de 2 semanas en GitHub Projects. Un PR por issue, pequeño y revisable.
- Los requisitos viven fuera del repo (Obsidian). Los issues citan sus IDs (RF, RU, RNF, RES, DI, D-xx) solo para trazabilidad; nunca muestres esos códigos en la interfaz.
- Antes de elegir tecnología, revisa `docs/adr/`. Si una decisión no está registrada, propón un ADR.

## Reglas que no se negocian
- Política de Riot: solo datos oficiales de la API; solo datos del propio jugador; nada de MMR/ELO; no "dictar decisiones" (todo como sugerencia); aviso visible de que el producto no está respaldado por Riot Games; identidad visual propia.
- Privacidad (Ley 21.719 de Chile y RGPD): las notas emocionales son datos sensibles; sin anuncios ni venta de datos; no guardar datos de tarjetas.
- Textos de la interfaz en español neutro, tono reflexivo, nunca de reproche.
- Mercado: LAS, LAN y EUW (España).
