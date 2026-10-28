# Requisitos de Alamak

Versión destilada de los requisitos para trabajar los issues sin acceso a Obsidian ni a Figma. Fecha de corte: 27-10-2026.

## Fuentes y precedencia

| Fuente | Qué aporta | Estado |
|---|---|---|
| Obsidian · `Alamak - LOL/Requisitos` (actualizado 27-10-2026) | RN, RU, RF, RNF, RES, DI, roles, personas y la nota *Decisiones y Contradicciones* | Alineada con Figma. Es la fuente de la que se destila este directorio |
| Figma · *Alamak · Diseño de producto* (páginas 01 Marca, 03 Flujos, 04 Pantallas; 26 y 27-10-2026) | Decisiones A-xx, contradicciones C-xx resueltas, reglas de los flujos, marca y voz | Más reciente. Manda sobre Obsidian cuando hay conflicto |
| Issues de GitHub (#1 a #10) | Alcance de M1 y M2 | Alineados con Figma |
| `docs/adr/` | Decisiones técnicas | Vacío: ADR-001 pendiente (issue #3) |

Regla: **decisión aceptada (D-xx) > Figma > Obsidian**. Si cambia un requisito, se actualiza primero Obsidian y después se vuelve a destilar aquí. "Ajuste" marca lo que cambió respecto de la versión del 26-10-2026.

## Archivos

- [negocio.md](negocio.md): problema, hipótesis H1–H5, reglas de decisión y modelo de ingresos (RN).
- [usuarios.md](usuarios.md): roles, permisos, personas e historias de usuario (RU).
- [funcionales.md](funcionales.md): qué hace el sistema (RF), con el hito en que se construye.
- [no-funcionales.md](no-funcionales.md): qué tan bien debe hacerlo (RNF).
- [restricciones.md](restricciones.md): condiciones que no se negocian (RES).
- [datos-e-integracion.md](datos-e-integracion.md): datos, reglas sobre datos e integraciones (DI).
- [reglas-de-producto.md](reglas-de-producto.md): reglas de los flujos de Figma (hallazgos, notas, privacidad, captación).
- [decisiones.md](decisiones.md): registro de decisiones (D-xx), propuestas (A-xx), contradicciones (C-xx) y pendientes (P-xx).

## Convenciones

- **IDs**: RN, RU, RF, RNF, RES, DI (requisitos); A (propuesta del diseño), C (contradicción), D (decisión aceptada), P (pregunta pendiente). Son solo para trazabilidad: **nunca se muestran en la interfaz**.
- **Prioridad**: MoSCoW (Must, Should, Could, Won't).
- **Fase**: *Validación* (antes del GO) o *Producto* (después del GO).
- **Hito**: M1 Captación, M2 Pre-venta, M3 Diario, M4 Resumen semanal, *Prod.* (después del GO).
- **IDs nuevos** creados al destilar (no existen en Obsidian): RN-17, RU-20, RF-37, RF-38, RNF-29, RES-24, DI-29 a DI-32, C-15 a C-20, P-08 a P-11.
- **(supuesto)**: decisión por criterio, aún no validada con usuarios.
