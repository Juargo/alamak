# Requisitos de negocio

## Contexto

- **Problema**: el jugador ranked que no sube de elo no sabe por qué. Las herramientas actuales (OP.GG, Mobalytics, iTero, Meeko) analizan datos objetivos o dan coaching en vivo; ninguna captura lo que el jugador sintió y decidió ni lo cruza con sus derrotas. El coaching humano sí, pero cuesta €15–30 por sesión y no tiene continuidad.
- **Diferenciador**: reflexión subjetiva post-partida + español nativo + uso cómodo en el móvil + solo datos oficiales de Riot (no le afecta el bloqueo de memoria del juego de octubre de 2026).
- **Foso**: idioma + comunidad hispana + hábito + datos subjetivos acumulados. La función en sí es copiable.
- **Posicionamiento**: *"Tu diario de ranked en español: 30 segundos después de cada partida, y cada lunes la IA te dice qué patrón te está costando LP."*
- **Tipo de negocio**: micro-negocio de ingreso complementario, además de portafolio y aprendizaje (supuesto).
- **Mercado**: ~2,2 M de jugadores ranked en LAS, LAN y España; núcleo orientado a mejorar ~330 mil (estimación 15%).

## Hipótesis de validación

| ID | Requisito | Criterio de aceptación | Prioridad | Hito que la mide |
|---|---|---|---|---|
| RN-01 | H1: los jugadores mantienen el hábito de anotar | ≥40% de las partidas ranked de los beta con reflexión en la semana 2; ≥20% de retención a 30 días | Must | M3 |
| RN-02 | H2: el resumen semanal aporta valor | ≥60% de apertura; ≥50% lo califica "útil" o "muy útil"; NPS ≥30 | Must | M4 |
| RN-03 | H3: hay disposición a pagar en LATAM | ≥5% de la lista de espera pre-compra o deja medio de pago; ≥3% de los beta activos convierte al terminar la prueba | Must | M2 (pre-venta) y Prod. (conversión) |
| RN-04 | H4: adquisición barata vía comunidades hispanas | ≥500 inscritos en 3 semanas; landing ≥15% visita→registro; costo por registro < US$0,50 | Must | M1 |
| RN-05 | H5: Riot aprueba el caso de uso | Producto registrado en la semana 1; estado *Acknowledged* o *Approved* antes del lanzamiento público | Must | M1 (issue #1) |

## Reglas de decisión

| Resultado | Condición | Decisión |
|---|---|---|
| GO | Se cumplen H1 y H2, y H3 llega al menos al 3% | Construir el producto completo |
| Pivote | H1 falla en jugadores sueltos (<20% sigue anotando), pero los coaches lo usan con sus alumnos | Producto para coaches (B2B2C) |
| No-go | Fallan H1 y H3 a la vez | Publicar como herramienta gratuita y open source |

> Con el camino 1 (M1 y M2 primero), al cerrar M2 solo hay datos de H3, H4 y H5. Esa revisión decide si **construir el diario (M3 y M4)**; el GO del producto completo exige además H1 y H2. Ver C-15 en [decisiones.md](decisiones.md).

## Modelo de ingresos

| ID | Requisito | Criterio de aceptación | Prioridad | Fase |
|---|---|---|---|---|
| RN-06 | Freemium con nivel gratuito permanente | Plan gratuito útil sin límite de tiempo | Must | Producto |
| RN-07 | Suscripción premium mensual y anual | Premium incluye el resumen semanal con IA y todos los hallazgos | Must | Producto |
| RN-08 | Precios regionales | Chile CLP 2.990/mes y CLP 24.990/año; resto de LATAM US$1,99–2,49/mes y US$17,99/año; España €3,99/mes y €29,99/año | Should | Producto |
| RN-09 | Prueba gratuita de premium | 14 días, activada al tercer resumen semanal, sin pedir tarjeta (A-16) | Should | Producto |
| RN-10 | Plan Coach (B2B) | Hasta 10 alumnos, US$12–19/mes; piloto con 2–3 coaches en la semana 5 | Should | Validación (piloto) / Producto |
| RN-11 | Sin publicidad ni venta de datos | Sin anuncios de terceros ni datos compartidos con anunciantes | Must | Ambas |
| RN-17 | Pre-venta del plan anual con descuento | Precio y garantía según A-35 y A-36 (pendientes, issue #2) | Should | Validación (M2) |

## Objetivos comerciales y de operación

| ID | Requisito | Criterio de aceptación | Prioridad | Fase |
|---|---|---|---|---|
| RN-12 | Lanzar antes del inicio de la temporada 2027 | Lanzamiento público en enero de 2027 o antes; no lanzar en agosto. **En riesgo**: ver C-16 | Should | Producto |
| RN-13 | Margen bruto alto | >80% después de comisiones | Should | Producto |
| RN-14 | Meta de referencia al mes 12 | Base ~US$600 de MRR (~240 suscriptores); pesimista ~US$72; optimista ~US$3.640 | Could | Producto |
| RN-15 | Adquisición sin pago hasta validar retención | Discord hispanos, coaches, micro-creadores y contenido corto antes de cualquier anuncio | Must | Ambas |
| RN-16 | Diferenciarse por mentalidad, hábito e idioma, no por estadísticas | No competir en profundidad de stats con iTero, Mobalytics u OP.GG | Must | Ambas |

## Costos de referencia

IA: ~US$0,06 por usuario premium al mes con Haiku 5.5, ~US$0,37 si el resumen usa Sonnet 5.5.

## Riesgos

- No se mantiene el hábito de anotar → RN-01 (el mayor riesgo).
- Baja disposición a pagar en LATAM → RN-03, RN-08, RN-10.
- Copia por parte de incumbentes → RN-16.
- Riot rechaza o retrasa la aprobación → RN-05.
