# ADR-0001: Registrar las decisiones de arquitectura con ADR

- **Estado:** Aceptado
- **Fecha:** 2026-10-27
- **Fase:** Validación y Producto
- **Requisitos:** RES-14, D-15, D-16
- **Issue:** #3

## Contexto
Alamak lo construye una sola persona con ~2 h por semana (RES-14), y los issues los ejecutan agentes de IA sin otro contexto (D-16). Los requisitos viven en Obsidian, fuera del repo. Sin un registro dentro del repo, el *porqué* de cada elección técnica se pierde entre sprints y un agente puede contradecir una decisión previa.

## Decisión
1. Cada decisión de arquitectura se registra como un archivo `docs/adr/NNNN-titulo-corto.md` basado en `0000-plantilla.md`.
2. Estados posibles: **Propuesto**, **Aceptado**, **Reemplazado por ADR-NNNN** y **Descartado**. El fondo de un ADR aceptado no se edita: se reemplaza con uno nuevo que lo referencia.
3. Lo que se necesita en la validación (M1 Captación y M2 Pre-venta) queda **Aceptado**. Lo que solo aplica al producto completo (M3 Diario y M4 Resumen) queda **Propuesto** hasta la decisión GO (D-15) y se revisa en la primera planificación posterior al GO.
4. Cada ADR cita los IDs de requisitos (RF, RNF, RES, DI, D-xx) para la trazabilidad. Esos códigos nunca aparecen en la interfaz.
5. Los ADR se crean o cambian por PR con el label `decisión`.
6. Antes de introducir una tecnología, una dependencia relevante o un proveedor nuevo, se revisa `docs/adr/`. Si la decisión no está registrada, se propone un ADR en el mismo PR (regla ya presente en `CLAUDE.md`).

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| Decisiones solo en Obsidian | Los agentes y los revisores de PR no las ven |
| Wiki de GitHub | No viaja con el código ni se revisa en los PR |
| No registrar nada | Con 2 h por semana, el contexto se olvida entre sprints |

## Consecuencias
- **Positivas:** el contexto vive junto al código; los agentes tienen reglas explícitas; las decisiones se pueden auditar.
- **Negativas / costos:** ~15 minutos por decisión para escribirla.
- **Revisar cuando:** el proceso de trabajo cambie (más personas o más horas).
