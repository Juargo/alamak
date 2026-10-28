# ADR-0015: Decisiones de captación y pre-venta (A-34 a A-37, C-16, C-18 y C-19)

- **Estado:** Aceptado
- **Fecha:** 2026-10-28
- **Fase:** Validación (M1–M2)
- **Requisitos:** RF-20, RF-21, RF-22, RNF-12, RES-07, RES-19, RN-12, RN-17, DI-12, DI-18, C-04, C-16, C-18, C-19
- **Issue:** #2

## Contexto
- La landing (#4), el test de tilt (#7) y la pre-venta (#9) no se pueden especificar sin cerrar las propuestas A-34 a A-37 del Flujo 10 de Figma.
- La revisión del 27-10-2026 dejó tres contradicciones que dependen de ellas:
  - **C-16:** el lanzamiento en enero de 2027 no cabe a ~2 h por semana.
  - **C-18:** la landing promete una beta en noviembre.
  - **C-19:** el resultado del test dice que se guarda el Riot ID, pero la lista de espera guarda solo correo y región.
- Restricciones que aplican:
  - Política de Riot: solo datos del propio jugador; ninguna decisión dictada.
  - Privacidad: Ley 21.719 y RGPD, con mínimo de datos.
  - Validación: medir H3 (≥5% de la lista de espera pre-compra) y H4 (≥15% de las visitas se inscriben).

## Decisión
Se registran en `docs/requisitos/decisiones.md` como D-17 a D-22.

| ID | Resuelve | Decisión |
|---|---|---|
| D-17 | A-34, C-04 | En el test de tilt el visitante marca **"Esta cuenta es mía"** y ve **un solo dato agregado**, sin el detalle de las partidas. Sin inscripción no se guarda nada: ni el Riot ID ni el resultado. No se verifica con el ícono de perfil en la landing; esa verificación queda para el diario (RF-03). |
| D-18 | A-35 | Pre-venta del plan anual a **CLP 14.990** en Chile, **US$10,99** en el resto de LATAM y **€17,99** en España, el primer año (~40% menos que el anual de RN-08). Pago único, **sin renovación automática**. El año rige desde el lanzamiento, no desde la compra. |
| D-19 | A-36 | **Devolución del 100%** si Alamak no se lanza antes del **30-sep-2027**, o si la persona la pide en cualquier momento antes del lanzamiento. La fecha es la de D-21 más 3 meses de colchón. |
| D-20 | A-37, C-19 | La lista de espera guarda **solo correo y región**. Se borra a los **6 meses** si la persona no se registra. No se guarda el Riot ID. El texto del resultado del test cambia a "Si te inscribes, te avisamos cuando empiece la beta". |
| D-21 | C-16 | El objetivo de lanzamiento se corre de enero a **30-jun-2027**, con la beta durante el 2º trimestre de 2027. Se acepta perder el pico de inicio de temporada a cambio de un plazo realista a ~2 h por semana. |
| D-22 | C-18 | La landing no promete fechas: dice **"Te avisamos cuando empiece la beta"**. |

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| Verificar con el ícono de perfil en el test (A-34) | Exige abrir el juego antes de ver el resultado; perjudica la meta de ≥15% de visitas que se inscriben (H4) |
| Test sin consultar a Riot (A-34) | Pierde el dato real, que es el gancho del test |
| ~50% de descuento en la pre-venta (A-35) | Si la señal de H3 es débil, no se distingue si fue por el producto o por el precio |
| Precio completo con bono (A-35) | Pre-comprar algo que no existe a precio completo convierte poco |
| Garantía hasta el 31-mar-2027 (A-36) | Esa fecha está en riesgo por C-16 |
| Garantía sin fecha (A-36) | Sin fecha, comprar se siente más riesgoso |
| Guardar el Riot ID en la lista de espera (A-37) | Más datos personales sin una necesidad en M1–M2, y sin verificación podría ser de otra persona |
| Mantener enero y recortar M3 y M4 (C-16) | Diciembre a ~2 h por semana no alcanza, y el resumen semanal es la propuesta de valor |
| Poner una fecha de beta en la landing (C-18) | Si se atrasa, se rompe una promesa pública |

## Consecuencias
- **Positivas:**
  - #4, #7 y #9 se pueden especificar sin supuestos.
  - La captación guarda el mínimo de datos, lo que simplifica la política de privacidad (#5).
  - Las promesas públicas (fechas y garantía) se pueden cumplir.
- **Negativas / costos:**
  - Sin verificación, un visitante puede consultar una cuenta ajena. Se mitiga mostrando un solo dato agregado y no guardando nada.
  - En la beta, la persona tiene que volver a escribir su Riot ID.
  - El lanzamiento se pierde el inicio de la temporada 2027.
  - Hay que verificar si Lemon Squeezy devuelve su comisión al reembolsar. Si no la devuelve, cada devolución tiene costo (ADR-0009).
- **Pendiente fuera del repo:**
  - Corregir en Figma los textos de la landing y del resultado del test.
  - Registrar D-17 a D-22 en Obsidian (*Decisiones y Contradicciones*).
- **Revisar cuando:**
  - Un pico de tráfico muestre abuso del test con cuentas ajenas.
  - La pre-venta no llegue al 3% en sus semanas.
  - El avance real de M3 y M4 haga inalcanzable el 30-jun-2027. En ese caso también se mueve la garantía, con aviso a los compradores.
