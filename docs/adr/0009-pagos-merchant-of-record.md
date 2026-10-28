# ADR-0009: Cobros web con un Merchant of Record (Lemon Squeezy)

- **Estado:** Aceptado para la pre-venta (M2), con verificaciones pendientes; las suscripciones quedan **Propuesto**
- **Fecha:** 2026-10-27
- **Fase:** Validación (pre-venta) y Producto (suscripciones)
- **Requisitos:** RES-17, RN-03, RN-08, RN-13, DI-09, DI-15, DI-24, RF-22, D-02, A-35, A-36

## Contexto
- Se cobra a jugadores de Chile, del resto de Latinoamérica y de España (RN-08), con precios regionales en CLP, USD y EUR.
- Vender a consumidores de la UE implica cobrar y declarar el IVA de cada país. Como vendedor individual, Jorge no tiene estructura para hacerlo.
- La pre-venta mide H3 con un link de pago tipo concierge (RF-22, D-02). Debe permitir reembolsos para la garantía (A-36).
- No se guardan datos de tarjetas (DI-15).

## Decisión
1. **Lemon Squeezy como pasarela y Merchant of Record (MoR):** el MoR es el vendedor legal ante el comprador. Calcula, cobra y declara el IVA y emite los comprobantes.
2. **Paddle** queda como alternativa equivalente si Lemon Squeezy no acepta la cuenta o cambia sus condiciones.
3. **Pre-venta (M2, Aceptado):**
   - Producto "Plan anual de lanzamiento" con variantes por región y moneda (precios según A-35).
   - Checkout hospedado (link) desde la landing; **no se integra un SDK de pago** en el front.
   - Un único webhook (`order_created` y `order_refunded`) registra la venta en la base para medir H3. Se verifica la firma HMAC y se descartan los eventos duplicados por su id.
4. **Suscripciones (Propuesto, M3–M4):**
   - Webhooks de suscripción → tabla `suscripcion` (DI-09) → rol `premium` derivado (ADR-0007).
   - Portal del cliente del MoR para cambiar o cancelar el plan.
   - Prueba de 14 días (RN-09) gestionada por el MoR.
5. **Aislamiento:** todo pasa por un puerto `ProveedorDePagos` en el módulo `pagos`, de modo que cambiar a Paddle o a Stripe Managed Payments toque solo el adaptador.

### Verificaciones antes del issue #9
- [ ] Lemon Squeezy acepta a un vendedor individual con residencia en Chile y paga a una cuenta en Chile (método y costo de los pagos).
- [ ] Soporta precios en CLP y EUR (o define cómo se muestra la conversión).
- [ ] Permite reembolsos totales a 5 meses (garantía A-36 hasta el 31 de marzo de 2027).
- [ ] Comisión vigente. Referencia: ~5% + US$0,50 por transacción, más recargos posibles por pagos internacionales. Con la pre-venta de CLP 14.990 (~US$16), la comisión ronda el 8%, compatible con un margen >80% (RN-13).
- [ ] Estado del producto: Stripe compró Lemon Squeezy (julio de 2024) y abrió un camino de migración a Stripe Managed Payments (preview desde febrero de 2026). Si se anuncia una migración forzada, evaluar SMP o Paddle.

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| Mercado Pago | Comisión baja y conocido en Latinoamérica, pero débil en España; el IVA de la UE y la facturación recaen en Jorge |
| Stripe directo | No es MoR: los impuestos internacionales quedan a cargo de Jorge; la disponibilidad para cuentas en Chile hay que verificarla |
| Flow o Webpay | Solo Chile |
| Paddle | Equivalente; queda como alternativa. Su proceso de aprobación suele ser más exigente con productos en etapa temprana |

## Consecuencias
- **Positivas:** cero carga tributaria internacional; no hay datos de tarjetas en el sistema; la pre-venta casi no requiere código.
- **Negativas / costos:** comisión más alta que una pasarela local; dependencia de un proveedor en transición (mitigada con el puerto `ProveedorDePagos`).
- **Revisar cuando:** el volumen haga que la diferencia de comisión pese más que la carga tributaria, cambie la situación de Lemon Squeezy o existan apps nativas (cobro por las tiendas, RES-17).
