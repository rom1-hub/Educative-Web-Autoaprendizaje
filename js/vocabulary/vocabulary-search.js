/*
 * COQ — Índice de búsqueda de Vocabulario
 *
 * Índice en memoria basado en prefijos de tokens.
 * La interfaz no conoce la estructura interna del índice.
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

  function tokenize(value) {
    return normalize(value)
      .split(/\s+/)
      .map((token) => token.replace(/[^a-z0-9œæç]+/g, ''))
      .filter(Boolean);
  }

  function create(database) {
    const itemsById = new Map();
    const prefixIndex = new Map();

    function addPrefix(prefix, id) {
      if (!prefixIndex.has(prefix)) prefixIndex.set(prefix, new Set());
      prefixIndex.get(prefix).add(id);
    }

    function indexItem(item) {
      if (!item || !item.id) return;

      itemsById.set(item.id, item);

      const text = [item.title, item.translation, item.category]
        .filter(Boolean)
        .join(' ');

      tokenize(text).forEach((token) => {
        for (let length = 1; length <= token.length; length += 1) {
          addPrefix(token.slice(0, length), item.id);
        }
      });
    }

    function rebuild() {
      itemsById.clear();
      prefixIndex.clear();

      const source = Array.isArray(database && database.index) ? database.index : [];
      source.forEach(indexItem);
    }

    function refresh() {
      rebuild();
      return api;
    }

    function query(value) {
      const tokens = tokenize(value);
      if (!tokens.length) return [];

      let candidates = null;

      tokens.forEach((token) => {
        const ids = prefixIndex.get(token) || new Set();

        if (candidates === null) {
          candidates = new Set(ids);
          return;
        }

        candidates = new Set([...candidates].filter((id) => ids.has(id)));
      });

      return [...(candidates || [])]
        .map((id) => itemsById.get(id))
        .filter(Boolean);
    }

    const api = {
      query,
      refresh,
      get size() {
        return itemsById.size;
      }
    };

    rebuild();
    return Object.freeze(api);
  }

  window.COQ_VOCABULARY_SEARCH = Object.freeze({ normalize, tokenize, create });
})();
