# COQ — FASE 2B · Separar audio global

## Objetivo
Extraer la pronunciación global de `script.js` a un servicio reutilizable, manteniendo el comportamiento actual de los botones `[data-say]`.

## Modificados
- `js/core/audio.js` (nuevo)
- `script.js` (solo extracción de audio global y navegación ya separada)
- 10 HTML (carga del servicio)

## Protegidos
No se modifica la lógica de conjugación, datos, ejercicios, buscador, progreso ni estilos. En `conjugaison.html` se elimina únicamente el inicializador de menú duplicado; la lógica de audio específica de conjugación permanece intacta.

## Validación
- `script.js` ya no contiene `SpeechSynthesisUtterance`.
- `audio.js` contiene la implementación global.
- Cada HTML carga `navigation.js`, `audio.js` y `script.js` una sola vez.
- Se conserva el conjunto completo de archivos V43, incluido CSS y logo.


## FASE 2C — Motor global de ejercicios

- Extraído el motor genérico de ejercicios de `script.js` a `js/exercises/exercise-engine.js`.
- Se conserva la lógica y comportamiento existentes; no se rediseña el motor.
- Las páginas HTML cargan el motor antes de `script.js`.
- Protegidos: conjugación, audio, navegación, búsqueda, progreso y estilos.

## Validación FASE 2C
- `script.js`, `js/core/audio.js`, `js/core/navigation.js` y `js/exercises/exercise-engine.js` pasan `node --check`.
- El bloque de ejercicios ya no existe en `script.js`.
- El motor aparece una sola vez en `js/exercises/exercise-engine.js`.
- Todas las páginas HTML cargan `exercise-engine.js` antes de `script.js`.
- No se modificó `styles.css` ni la lógica específica de `conjugaison.html`.


## Fase 2D — separar progreso global
- Extraída la escritura de finalización de etapa y la revelación de `#completeBox` a `js/progress/progress.js`.
- El motor global de ejercicios conserva su comportamiento y ahora llama a `markStageComplete()`.
- Añadida la carga de `js/progress/progress.js` en las 10 páginas HTML.
- No se modifica todavía el modelo futuro de progreso; la clave de `localStorage` sigue siendo `coq-stage-complete-` + `location.pathname`.
