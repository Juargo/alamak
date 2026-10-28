# ADR-0012: Pirámide de testing y criterios de aceptación

- **Estado:** Aceptado
- **Fecha:** 2026-10-27
- **Fase:** Validación y Producto
- **Requisitos:** RNF-01 a RNF-08, RNF-12, RNF-18, RNF-21, RNF-22, D-03, D-16

## Contexto
El código lo escriben agentes a partir de issues (D-16) y la revisión humana es breve. Los tests son la forma de comprobar que un PR cumple el issue. Los minutos de CI son limitados (ADR-0010), así que la mayoría de las pruebas debe ser rápida.

## Decisión
### Pirámide
| Nivel | Proporción aprox. | Herramientas | Qué cubre |
|---|---|---|---|
| **Unitarias** | ~70% | Vitest | Dominio puro: niveles de evidencia (D-03), umbral de 8 partidas por grupo del test de tilt, cálculo de hallazgos y patrones, precios regionales, reglas de edad y validaciones Zod. Sin red ni base de datos |
| **Integración** | ~20% | Vitest + Supabase local; pgTAP; MSW | Casos de uso con la base real; migraciones; **RLS** (un usuario no ve datos de otro; el coach solo ve lo compartido; `anon` no lee las tablas de captación); adaptadores de Riot y pagos contra *fixtures* grabados; webhooks con firma válida, inválida y duplicada |
| **E2E** | ~10% | Playwright + axe | Solo los flujos Must, en escritorio y móvil (viewport de iPhone y Android): unirse a la lista de espera; test de tilt (con Riot simulado); ir al checkout de la pre-venta (modo prueba). En M3: anotar con 1 toque (RNF-02) y anotar sin conexión (RNF-18). axe sin violaciones serias (RNF-08) |
| **Manual / exploratoria** | Antes de cada release | Teléfono real | Revisión de textos (español neutro y tono reflexivo, RNF-05/06) y aviso de no respaldo de Riot visible |

### Pruebas no funcionales
- **Rendimiento:** Lighthouse CI en la landing (móvil): LCP < 2,5 s y presupuesto de JS. Esto es más estricto que RNF-07 (< 3 s).
- **Evaluación de la IA (M4, Propuesto):** un conjunto dorado de ~20 semanas sintéticas, con verificaciones automáticas:
  - ningún imperativo tipo "haz X" (RNF-06);
  - cada hallazgo con su cifra de respaldo (RNF-21);
  - no concluye nada si faltan datos (RNF-22).
  Se ejecuta al cambiar el prompt o el modelo.

### Cobertura
- Módulos `*/dominio/`: **≥ 90% de líneas**. La CI falla si baja.
- No se exige una cobertura global (evita tests sin valor sobre el código de plumbing).

### Criterios de aceptación
1. Cada issue de tipo historia incluye criterios en formato **Dado / Cuando / Entonces**, en español, observables y verificables. Como mínimo cubren:
   - el caso feliz;
   - al menos un caso de borde o error;
   - los RNF que apliquen: móvil, privacidad, idioma y aviso de Riot.
2. **Trazabilidad:** cada criterio se identifica como `CA-n` y se cubre con al menos un test cuyo nombre lo cita. Ejemplo: `it('#7 CA-2: con menos de 8 partidas por grupo muestra cuántas faltan')`.
3. **Definition of Ready:** el issue tiene la historia, los criterios, lo que queda fuera del alcance, los requisitos, las dependencias y la talla. Si no, no entra al sprint.
4. **Definition of Done:** la plantilla de PR está completa, la CI está en verde, el *preview* se revisó en el móvil y los criterios `CA-n` tienen su test.

**Ejemplo (test de tilt, issue #7):**
```gherkin
CA-1
Dado un visitante que ingresa un Riot ID de LAS y marca "Esta cuenta es mía"
Cuando la cuenta tiene al menos 8 partidas ranked en cada grupo dentro de las últimas 50
Entonces ve un único dato agregado de winrate por grupo, en tono de sugerencia,
  y no se guarda nada si no se inscribe

CA-2
Dado el mismo visitante
Cuando algún grupo tiene menos de 8 partidas
Entonces ve cuántas partidas faltan y no se muestra ninguna conclusión

CA-3
Dado que Riot no responde
Cuando el visitante envía el formulario
Entonces ve un estado claro con la opción de reintentar más tarde (sin error genérico)
```

### Datos de prueba
Siempre sintéticos: Riot IDs y correos ficticios. **Nunca** datos reales de jugadores en los *fixtures* ni en staging.

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| Cobertura global ≥ 80% | Incentiva tests de bajo valor; el riesgo está en el dominio y en RLS |
| Muchos E2E | Lentos, frágiles y caros en minutos de CI |
| Sin criterios formales | Los agentes necesitan una especificación verificable (D-16) |

## Consecuencias
- **Positivas:** feedback rápido; el aislamiento de datos se comprueba en cada PR; cada criterio del issue tiene un test que lo demuestra.
- **Negativas / costos:** escribir criterios Dado/Cuando/Entonces toma tiempo al especificar (ya está incluido en las tallas de D-16).
- **Revisar cuando:** los E2E se vuelvan inestables (>5% de reintentos) o los bugs en producción escapen sistemáticamente de un nivel de la pirámide.
