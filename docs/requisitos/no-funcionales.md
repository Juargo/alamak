# Requisitos no funcionales

Qué tan bien debe funcionar el sistema, sin decidir la tecnología.

## Usabilidad

| ID | Requisito | Criterio de aceptación | Prioridad |
|---|---|---|---|
| RNF-01 | La reflexión se completa en 30 s o menos | Mediana ≤30 s en pruebas con usuarios | Must |
| RNF-02 | Del aviso a la reflexión hay 1 clic o toque | Se verifica en el flujo. **Ajuste (C-07)**: desde la segunda nota; la primera agrega el consentimiento | Must |
| RNF-03 | Valor antes del día 7 | ≥70% de los activos ve una pista o el progreso "Te faltan N partidas" antes del día 7. **Ajuste (C-09)**: se mide en la beta (umbral supuesto) | Must |
| RNF-04 | Uso cómodo en el móvil | Todas las funciones del jugador se usan en el navegador de un teléfono. **Ajuste**: era "app móvil primero"; el diseño es web responsive | Must |
| RNF-05 | Español neutro con tuteo y jerga gamer compartida por LAS, LAN y España (ranked, LP, elo, tilt, dúo, remake), sin modismos regionales | Revisado por al menos un jugador de cada región (supuesto). **Ajuste**: Obsidian pedía variantes por región; Figma (Voz y tono) y `CLAUDE.md` piden español neutro | Must |
| RNF-06 | Tono de acompañamiento, nunca de órdenes ni de juicio | Ningún texto usa imperativos tipo "haz X"; se describe la partida, no a la persona | Must |
| RNF-07 | Historial y resumen cargan sin espera perceptible | <3 s en una conexión móvil normal (supuesto) | Should |
| RNF-08 | Accesibilidad básica | Contraste ≥4,5:1 en texto normal, áreas táctiles ≥44×44 px, estados con forma o texto además del color, tema claro y oscuro | Could |

## Privacidad y seguridad

| ID | Requisito | Criterio de aceptación | Prioridad |
|---|---|---|---|
| RNF-09 | Notas y ánimo son datos sensibles | Cifrados; solo los ve su dueño o el coach si el alumno lo autoriza | Must |
| RNF-10 | Las notas no entrenan modelos de IA sin aceptación | Opt-in separado y desactivado por defecto | Must |
| RNF-11 | Ningún dato se vende ni se comparte con anunciantes o para seguimiento | Declarado en la política de privacidad | Must |
| RNF-12 | Un usuario solo ve sus propios datos | No hay forma de ver partidas de otros. En el test de tilt el visitante declara que la cuenta es suya y ve un solo dato agregado (A-34, pendiente) | Must |
| RNF-13 | Datos para contenido o métricas siempre agregados y anónimos | Ningún agregado identifica a una persona | Must |
| RNF-14 | La IA recibe solo lo necesario | Se revisa qué sale hacia el proveedor de IA; sin identificadores innecesarios | Should |
| RNF-29 | Ninguna clave de API en el cliente | Las llamadas a Riot y a la IA se hacen en el servidor | Must |

## Cumplimiento

| ID | Requisito | Criterio de aceptación | Prioridad |
|---|---|---|---|
| RNF-15 | Ley 21.719 de Chile (vigente desde el 1-dic-2026) | Consentimiento, acceso, rectificación, borrado y portabilidad disponibles | Must |
| RNF-16 | RGPD y LOPDGDD para España | Base legal de consentimiento, política en español, proveedores con acuerdo de tratamiento de datos | Must |
| RNF-17 | Declaraciones de privacidad coherentes | Sin seguimiento de terceros; se declara el contenido generado por IA. **Ajuste**: las etiquetas de App Store y Google Play solo aplican si hay app nativa | Must |

## Confiabilidad

| ID | Requisito | Criterio de aceptación | Prioridad |
|---|---|---|---|
| RNF-18 | No se pierde ninguna reflexión | 0 reflexiones perdidas; si el guardado falla, queda en el navegador y se reintenta | Must |
| RNF-19 | El resumen llega puntual cada lunes | ≥95% de las semanas (supuesto) | Should |
| RNF-20 | Si Riot no responde, se reintenta y se avisa | El usuario ve un estado claro; su nota queda guardada | Should |

## Calidad del análisis

| ID | Requisito | Criterio de aceptación | Prioridad |
|---|---|---|---|
| RNF-21 | Todo hallazgo se basa en datos reales y muestra su respaldo | Ningún hallazgo sin cifra ni tamaño de muestra | Must |
| RNF-22 | La IA no inventa conclusiones | El sistema calcula los números; la IA solo redacta y nunca decide si hay hallazgo | Must |

## Costos y escala

| ID | Requisito | Criterio de aceptación | Prioridad |
|---|---|---|---|
| RNF-23 | Costo de IA bajo | ≤US$0,40 al mes por usuario premium | Should |
| RNF-24 | Costo de operación acotado | ≤US$80 al mes hasta ~10.000 usuarios | Should |
| RNF-25 | Escenario optimista sin rediseño | ~40.000 registrados y ~12.000 activos al mes | Could |

## Operación y plataformas

| ID | Requisito | Criterio de aceptación | Prioridad |
|---|---|---|---|
| RNF-26 | Operable por una sola persona | Soporte, métricas y borrados sin intervención manual compleja | Must |
| RNF-27 | App web responsive: escritorio y navegador del móvil | Funciona en Chrome, Safari, Firefox y Edge actuales. En iPhone el aviso solo llega si se agrega la web a la pantalla de inicio; el contador en la pestaña cubre a quien no da permiso. **Ajuste**: Obsidian pedía Android e iOS nativos | Must |
| RNF-28 | El panel de coach se usa en un computador | Cómodo en pantalla grande | Should |
