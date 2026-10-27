# ADR-0004: Prácticas de mantenibilidad y estrategia de escalabilidad

- **Estado:** Aceptado
- **Fecha:** 2026-10-27
- **Fase:** Validación y Producto
- **Requisitos:** RES-14, RNF-07, RNF-19, RNF-20, RNF-23, RNF-24, RNF-25, RNF-26, DI-17, D-14

## Contexto
El código lo escriben mayormente agentes de IA y lo revisa una sola persona en poco tiempo. Hace falta que todo sea predecible, fácil de revisar y barato de cambiar. Los picos de carga son previsibles: noches y fines de semana, el lunes del resumen y los inicios de temporada o de split.

## Decisión
### Mantenibilidad
1. **Un solo lenguaje:** TypeScript en modo `strict` en todo el código (front, back, scripts y tests). Se prohíbe `any` implícito.
2. **Límites verificados:** la estructura de módulos y capas del ADR-0002 se verifica con `dependency-cruiser` en CI.
3. **Dominio puro y probado:** las reglas de negocio (hallazgos, niveles de evidencia D-03, umbrales del test de tilt, precios regionales, reglas de edad) no hacen E/S y tienen tests unitarios.
4. **Proveedores reemplazables:** Riot, IA, pagos, correo y analítica se usan a través de puertos (interfaces). Cambiar de proveedor toca solo `infraestructura/`.
5. **Configuración validada:** las variables de entorno se validan con Zod al arrancar; si falta una, la app no arranca. Cada variable nueva se documenta en `.env.example`.
6. **Estilo automático:** ESLint + Prettier; Conventional Commits; un PR pequeño por issue; *squash merge*.
7. **Dependencias mínimas:** antes de agregar una librería se pregunta si lo resuelve la plataforma o 30 líneas propias. Las actualizaciones se agrupan una vez por semana (Dependabot).
8. **Documentación mínima útil:** ADRs y un `README.md` de un párrafo por módulo (qué hace y qué no hace).

### Escalabilidad
1. **Cómputo:** funciones serverless sin estado, que escalan horizontalmente sin configuración.
2. **Base de datos:**
   - Índices compuestos por `(user_id, fecha)`; paginación por cursor, nunca por `OFFSET`.
   - Los hallazgos se calculan **al escribir** (al guardar una reflexión o al cerrar la semana) y se guardan, no se recalculan en cada lectura (RNF-07).
   - De cada partida de Riot se guardan solo los campos del jugador que se usan (~1 KB), no el JSON completo de decenas de KB (DI-17).
3. **Riot API:**
   - Un único cliente con limitador de tasa centralizado (token bucket en Postgres) por app y por método, respetando las cabeceras `X-App-Rate-Limit` y `Retry-After`.
   - Caché de partidas en la base (DI-17); datos estáticos de Data Dragon cacheados por versión.
   - Reintentos con espera exponencial y estado visible para el usuario (RNF-20).
   - La importación de 30 días (D-14) va por la cola, en lotes, y reporta su progreso.
   - Ojo: la clave de desarrollo expira cada 24 h y su límite (~100 llamadas cada 2 min) no alcanza para usuarios reales. **La clave de producción (RES-02) es un requisito para lanzar el test de tilt de forma pública.**
4. **IA:** una llamada por usuario premium por semana, en lote, con tokens de entrada y salida acotados y con el costo registrado por llamada (RNF-23).
5. **Estimación gruesa de volumen:** 10.000 usuarios × ~60 partidas al mes × ~1,5 KB ≈ 1 GB al año entre partidas y reflexiones. Supera el plan Free (500 MB), pero cabe holgado en Supabase Pro.

### Umbrales que reabren decisiones
| Señal | Acción |
|---|---|
| Base > 400 MB | Pasar a Supabase Pro |
| p95 de la API > 1 s durante una semana | Revisar consultas e índices antes de agregar infraestructura |
| Cola con > 1 h de atraso | Ajustar los lotes o evaluar Inngest/Trigger.dev (ADR-0002) |
| Costo mensual > US$60 | Revisar proveedores (ADR-0003) |

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| Redis o caché distribuido desde el inicio | Optimización prematura; Postgres + la CDN alcanzan para el volumen esperado |
| Réplicas de lectura | Innecesarias antes de ~decenas de miles de usuarios activos |
| Calcular los hallazgos al leer | Más simple, pero la latencia y el costo crecen con el historial |

## Consecuencias
- **Positivas:** PRs predecibles y revisables; cambiar de proveedor es barato; el costo crece de forma lineal y medible.
- **Negativas / costos:** más archivos por módulo (puertos y adaptadores); disciplina para no saltarse capas.
- **Revisar cuando:** se toque cualquiera de los umbrales.
