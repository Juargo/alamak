# Decisiones, contradicciones y pendientes

## Decisiones aceptadas (D-xx)

El registro completo de D-01 a D-16 **no está en el repo ni en Obsidian**. Solo se conoce lo que citan Figma y los issues:

| ID | Qué decide | Dónde se cita |
|---|---|---|
| D-01 | Resuelve C-01 (contenido no localizado) | Figma, Flujo 5 |
| D-02 | En Validación solo existe la pre-venta; las suscripciones son de la fase Producto | Figma, Flujo 5; issues #9 y #10 |
| D-03 | Umbrales de evidencia de los hallazgos (8 y 15 partidas por grupo, 15 puntos) | Figma, Flujo 2; issue #7 |
| D-06 | Contenido no localizado | Issue #3 |
| D-08 | Resuelve C-07 y C-08 | Figma, Flujo 1 |
| D-09 | Acepta A-01 a A-05 | Figma, Flujo 1 |
| D-10 | Acepta A-11 a A-13 | Figma, Flujo 3 |
| D-11 | Resuelve C-11 | Figma, Flujo 3 |
| D-14 | Acepta A-33 | Figma, Flujo 3 |
| D-17 | Acepta A-34 y resuelve C-04: el visitante marca "Esta cuenta es mía", ve un solo dato agregado y no se guarda nada sin inscripción | ADR-0015; issue #2 |
| D-18 | Acepta A-35: pre-venta anual a CLP 14.990 / US$10,99 / €17,99 el primer año, pago único sin renovación, rige desde el lanzamiento | ADR-0015; issue #2 |
| D-19 | Cambia A-36: devolución del 100% si no se lanza antes del 30-sep-2027 o si se pide antes del lanzamiento | ADR-0015; issue #2 |
| D-20 | Acepta A-37 y resuelve C-19: la lista de espera guarda solo correo y región, se borra a los 6 meses; el resultado del test dice "Si te inscribes, te avisamos cuando empiece la beta" | ADR-0015; issue #2 |
| D-21 | Resuelve C-16: lanzamiento objetivo el 30-jun-2027, beta en el 2º trimestre de 2027 | ADR-0015; issue #2 |
| D-22 | Resuelve C-18: la landing dice "Te avisamos cuando empiece la beta" | ADR-0015; issue #2 |
| D-23 | Responde P-06: tags predefinidos iniciales en tres grupos. *Cómo llegué*: Cansado, Distraído, Venía de una derrota, Fuera de mi pool. *El equipo*: Buena comunicación, Roces en el chat, Jugué en dúo. *La partida*: Draft difícil, Mal inicio, Remontada, Jugué por objetivos, Partida larga | Issue #22 |
| D-24 | Responde P-10: una cuenta sin iniciar sesión ni anotar durante 24 meses se borra por completo, con aviso por correo 30 días antes | Issue #22 |
| D-25 | Autenticación de jugadores con Better Auth sobre Neon; aislamiento por `user_id` obligatorio en los casos de uso en lugar de la RLS de Supabase | ADR-0017; issue #22 |

Faltan D-04, D-05, D-07, D-12, D-13, D-15 y D-16, y el contenido de D-01 y D-06. Ver P-08.

Por inferencia, Figma (Etapa 3) y el issue #3 tratan como decidido que **Alamak es solo web**. No se encontró el ID de esa decisión.

## Propuestas del diseño (A-xx)

| Estado | Propuestas |
|---|---|
| Aceptadas (Figma: "Decisiones aceptadas por Jorge", 26-10-2026) | A-01 a A-32 |
| Aceptada (D-14, 27-10-2026) | A-33 |
| Aceptadas (D-17, D-18 y D-20, 28-10-2026) | A-34, A-35 y A-37 |
| Cambiada (D-19, 28-10-2026) | A-36: la fecha de la garantía pasa del 31-mar-2027 al 30-sep-2027 |

En los Flujos 2 y 4 a 9, el encabezado repite "D-09" o "D-10". Puede ser un encabezado copiado; conviene confirmarlo. El detalle de cada propuesta está en Obsidian, nota *Decisiones y Contradicciones*, y aplicado en [reglas-de-producto.md](reglas-de-producto.md).

## Contradicciones

| ID | Contradicción | Estado |
|---|---|---|
| C-02 | Exportar y borrar figuraban solo en Premium | Propuesta: todos los roles con cuenta. **Pendiente** |
| C-04 | El test de tilt consulta un Riot ID sin probar que es del visitante (RNF-12, RES-07) | Resuelta (D-17) |
| C-07 | 1 toque del aviso a la reflexión vs. consentimiento la primera vez | Resuelta (D-08): "desde la segunda nota" |
| C-08 | El aviso (RF-08) era Should siendo la entrada del mayor riesgo | Resuelta (D-08): Must |
| C-09 | Pista antes del día 7 para el 70% es difícil con 8 partidas por grupo | Resuelta: se mide en la beta y el progreso cuenta como valor temprano |
| C-10 | El foco semanal (Producto) aparece en el flujo de Validación | Resuelta: se omite en Validación |
| C-11 | Sin verificación de propiedad, cualquiera ve partidas ajenas | Resuelta (D-11): RF-03 Must en Validación con verificación por ícono |
| C-12 | Tags propios son Could/Producto | Resuelta: en Validación solo ocultar predefinidos |
| C-13 | Exportar y borrar eran de Producto, pero la beta tendrá usuarios con la Ley 21.719 vigente | Resuelta: a Validación |
| C-14 | Una sola cuenta de Riot vs. jugadores con smurf | Resuelta: una cuenta por ahora |
| C-15 | Las reglas de GO exigen H1 y H2, que solo se miden con el diario (M3–M4), pero el issue #10 registra GO/pivote/no-go al cerrar M2 | **Nueva**. Propuesta: el issue #10 decide "construir o no el diario" con H3 y H4; el GO final queda tras M4 |
| C-16 | Lanzamiento en enero de 2027 (RES-19) vs. ~2 h/semana: M1 y M2 ocupan 4 sprints (hasta fines de diciembre) y la garantía A-36 fija el 31-mar-2027 | Resuelta (D-21, ADR-0015) |
| C-17 | El test de tilt pide 50 partidas por visitante (~51 llamadas a Riot); con una clave de desarrollo eso satura los límites en cuanto llegue tráfico de una campaña, y una clave de desarrollo no es para productos públicos | **Nueva**. Propuesta: pedir clave personal o de producción en el issue #1, guardar en caché y bajar a 20–30 partidas si hace falta |
| C-18 | La landing de Figma dice "La beta empieza en noviembre y es gratis", pero el camino 1 construye el diario solo después de M2 | Resuelta (D-22, ADR-0015) |
| C-19 | El resultado del test en Figma dice "Si te inscribes, guardamos tu Riot ID", pero A-37 y el issue #4 guardan solo correo y región | Resuelta (D-20, ADR-0015) |
| C-20 | Obsidian pide variantes regionales (RU-08, RNF-05); Figma y `CLAUDE.md` piden español neutro | **Nueva**. Aplicado en este documento: español neutro. Confirmar |

## Preguntas pendientes

| ID | Pregunta | Bloquea |
|---|---|---|
| P-06 | Lista inicial de tags predefinidos | Respondida por D-23 |
| P-07 | Edad mínima | Respondida por A-11; revisar con abogado para Chile, México y Argentina |
| P-08 | Traer al repo el registro completo de D-01 a D-16 | Trazabilidad de todos los issues |
| P-09 | Qué significa éxito personal (ingreso, portafolio, aprendizaje) y cuánto pesa cada uno | Reglas de decisión |
| P-10 | Plazo de conservación de cuentas inactivas | Respondida por D-24 |
| P-11 | Estado del proyecto que aplazaría la Ley 21.719 | Cumplimiento |
