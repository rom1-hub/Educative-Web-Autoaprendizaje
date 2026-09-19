/*
 * COQ — Registro y cargador de la base de datos de Vocabulario
 *
 * Arquitectura:
 * - El catálogo de categorías es pequeño y estable.
 * - Cada categoría vive en su propio chunk JS y se carga una sola vez.
 * - El contenido pedagógico nunca se duplica en la lógica de interfaz.
 * - La API admite carga bajo demanda aunque la vista actual pueda pedir
 *   todas las categorías para mantener el comportamiento existente.
 *
 * Camino:
 * catálogo → categoría → subcategoría → entrada
 */
(function () {
  'use strict';

  const MANIFEST = Object.freeze([
    Object.freeze({
      id: 'animals',
      src: '../data/vocabulary/categories/animals.js?v=20260919-arch'
    })
  ]);

  const registry = new Map();
  const loadCache = new Map();

  function assertCategory(category) {
    if (!category || typeof category !== 'object') {
      throw new Error('Vocabulario: categoría inválida.');
    }
    if (!category.id || typeof category.id !== 'string') {
      throw new Error('Vocabulario: una categoría no tiene un id válido.');
    }
    if (!Array.isArray(category.subcategories)) {
      throw new Error('Vocabulario: la categoría "' + category.id + '" no tiene subcategorías válidas.');
    }

    const subcategoryIds = new Set();
    const entryIds = new Set();

    category.subcategories.forEach((subcategory) => {
      if (!subcategory || typeof subcategory !== 'object' || !subcategory.id) {
        throw new Error('Vocabulario: subcategoría inválida en "' + category.id + '".');
      }
      if (subcategoryIds.has(subcategory.id)) {
        throw new Error('Vocabulario: id de subcategoría duplicado: "' + subcategory.id + '".');
      }
      subcategoryIds.add(subcategory.id);

      if (!Array.isArray(subcategory.entries)) {
        throw new Error('Vocabulario: "' + subcategory.id + '" no tiene entries válidas.');
      }

      subcategory.entries.forEach((entry) => {
        if (!entry || typeof entry !== 'object' || !entry.id) {
          throw new Error('Vocabulario: entrada inválida en "' + subcategory.id + '".');
        }
        if (entryIds.has(entry.id)) {
          throw new Error('Vocabulario: id de entrada duplicado en "' + category.id + '": "' + entry.id + '".');
        }
        entryIds.add(entry.id);
      });
    });

    return category;
  }

  function registerCategory(category) {
    assertCategory(category);
    const previous = registry.get(category.id);
    if (previous && previous !== category) {
      throw new Error('Vocabulario: la categoría "' + category.id + '" fue registrada más de una vez.');
    }
    registry.set(category.id, category);
    return category;
  }

  function loadScript(src) {
    if (loadCache.has(src)) return loadCache.get(src);

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar el módulo de vocabulario: ' + src));
      document.head.appendChild(script);
    });

    loadCache.set(src, promise);
    return promise;
  }

  async function loadCategory(id) {
    const descriptor = MANIFEST.find((item) => item.id === id);
    if (!descriptor) throw new Error('Vocabulario: categoría no registrada en el catálogo: "' + id + '".');

    if (!registry.has(id)) await loadScript(descriptor.src);

    const category = registry.get(id);
    if (!category) throw new Error('Vocabulario: el módulo "' + id + '" no registró ninguna categoría.');
    return Object.freeze(category);
  }

  async function loadAll() {
    await Promise.all(MANIFEST.map((item) => loadCategory(item.id)));
    const categories = MANIFEST.map((item) => registry.get(item.id)).filter(Boolean);
    return Object.freeze(categories.slice());
  }

  function buildSearchIndex(categories) {
    const index = [];

    categories.forEach((category) => {
      index.push({
        type: 'category',
        id: category.id,
        title: category.title,
        category: category.title,
        parentId: null,
        data: category
      });

      (category.subcategories || []).forEach((subcategory) => {
        index.push({
          type: 'subcategory',
          id: subcategory.id,
          title: subcategory.title,
          category: category.title,
          parentId: category.id,
          data: subcategory
        });

        (subcategory.entries || []).forEach((entry) => {
          index.push({
            type: 'entry',
            id: entry.id,
            title: [entry.articleFr, entry.word].filter(Boolean).join(' '),
            translation: [entry.articleEs, entry.translation].filter(Boolean).join(' '),
            category: category.title + ' · ' + subcategory.title,
            parentId: subcategory.id,
            categoryId: category.id,
            data: entry
          });
        });
      });
    });

    return Object.freeze(index);
  }

  const ready = loadAll().then((categories) => {
    categories.forEach(assertCategory);

    const categoryIds = new Set();
    const subcategoryIds = new Set();
    const entryIds = new Set();

    categories.forEach((category) => {
      if (categoryIds.has(category.id)) {
        throw new Error('Vocabulario: id de categoría duplicado: "' + category.id + '".');
      }
      categoryIds.add(category.id);

      (category.subcategories || []).forEach((subcategory) => {
        if (subcategoryIds.has(subcategory.id)) {
          throw new Error('Vocabulario: id de subcategoría duplicado globalmente: "' + subcategory.id + '".');
        }
        subcategoryIds.add(subcategory.id);

        (subcategory.entries || []).forEach((entry) => {
          if (entryIds.has(entry.id)) {
            throw new Error('Vocabulario: id de entrada duplicado globalmente: "' + entry.id + '".');
          }
          entryIds.add(entry.id);
        });
      });
    });

    const database = Object.freeze({
      version: '4.0.0',
      categories,
      index: buildSearchIndex(categories),
      manifest: MANIFEST,
      loadCategory,
      loadAll
    });

    window.COQ_VOCABULARY_DATABASE = database;
    return database;
  });

  window.COQ_VOCABULARY_DATABASE_API = Object.freeze({
    manifest: MANIFEST,
    registerCategory,
    loadCategory,
    loadAll
  });

  window.COQ_VOCABULARY_DATABASE_READY = ready;
})();