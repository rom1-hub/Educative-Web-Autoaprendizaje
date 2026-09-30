# Datos de verbos de COQ

La fuente actual de producción del frontend es `data/verbs/local-database.js`, generado por `scripts/build-local-verb-database.js`.

No debe editarse manualmente ni sustituirse por una extracción parcial de `data/verbs/verbs.js`.

Objetivo de migración:

```
data/verbs/local-database.js
        |
        v
backend/data/verbs/verbs.json
        |
        v
Python / FastAPI
```

El JSON será un artefacto de datos: no contendrá JavaScript, funciones, acceso a `window` ni lógica de interfaz.
