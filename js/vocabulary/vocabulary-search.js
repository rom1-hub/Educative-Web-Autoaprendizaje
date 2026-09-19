/*
 * COQ — Índice de búsqueda de vocabulario
 *
 * El índice se construye una sola vez a partir de database.index.
 * La interfaz no conoce la estructura física de la base de datos.
 */
(function () {
  'use strict';

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function create(database) {
    const source = Array.isArray(database && database.index) ? database.index : [];
    const indexed = source.map((item) => Object.freeze({
      ...item,
      searchText: normalize([item.title, item.translation, item.category].filter(Boolean).join(' '))
    }));

    return Object.freeze({
      query(value) {
        const term = normalize(value);
        if (!term) return [];
        return indexed.filter((item) => item.searchText.includes(term));
      },
      size: indexed.length
    });
  }

  window.COQ_VOCABULARY_SEARCH = Object.freeze({ normalize, create });
})();
