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


## Fase 2E — separar buscador global
- Extraída la lógica del buscador global de `script.js` a `js/search/search.js`.
- Se conserva el índice actual y el comportamiento de búsqueda; no se amplía todavía el buscador.
- Las 10 páginas HTML cargan `js/search/search.js` antes de `script.js`.
- Protegidos: conjugación, audio, navegación, ejercicios, progreso, estilos y contenido.

## Validación FASE 2E
- `script.js` ya no contiene el bloque del buscador global.
- `search.js` contiene una única implementación del buscador global.
- Todas las páginas HTML cargan `search.js` una sola vez.
- El buscador mantiene el mismo índice y comportamiento de V43.


## Fase 3A — separar datos de conjugación
- Extraídos los datos de `conjugations`, `verbGroups` y `verbMeta` de `conjugaison.html` a `data/verbs/conjugations.js`.
- Se mantiene el contenido de datos sin cambios.
- `conjugaison.html` consume `window.COQ_VERB_DATA`; la lógica de conjugación permanece en la página en esta fase.
- No se modifican CSS, ejercicios, progreso, buscador, navegación ni audio.


## Correcciones de Conjugación antes de cerrar Fase 3A
- Aceptar la respuesta completa con el sujeto `j'` (por ejemplo, `j'ai`) en el ejercicio, manteniendo también válida la forma conjugada sola (`ai`).
- Ordenar la vista de `Todos los tiempos` comenzando por `présent de l'indicatif`, seguido del orden pedagógico definido, sin modificar los datos de conjugación.
- Adaptar la ventana y el resumen final a móvil/tablet para eliminar el scroll horizontal de la tabla.


## Fase 3B — separación de lógica de Conjugación
- Extraída la lógica inline de `conjugaison.html`.
- Separada por responsabilidad en `js/conjugaison/utils.js`, `lookup.js`, `practice.js` y `app.js`.
- Sin cambios pedagógicos ni de base de datos en esta fase.
