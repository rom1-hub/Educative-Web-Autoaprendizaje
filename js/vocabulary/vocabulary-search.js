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
      .replace(/[^a-z0-9œæç]+/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
  }

  function create(database) {
    const itemsById = new Map();
    const prefixIndex = new Map();
    const searchMetadata = new Map();

    function addPrefix(prefix, id) {
      if (!prefixIndex.has(prefix)) prefixIndex.set(prefix, new Set());
      prefixIndex.get(prefix).add(id);
    }

    function indexItem(item) {
      if (!item || !item.id) return;

      itemsById.set(item.id, item);

      const titleTokens = tokenize(item.title);
      const translationTokens = tokenize(item.translation);
      searchMetadata.set(item.id, {
        titleTokens,
        translationTokens,
        normalizedTitle: normalize(item.title),
        normalizedTranslation: normalize(item.translation)
      });

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
      searchMetadata.clear();

      const source = Array.isArray(database && database.index) ? database.index : [];
      source.forEach(indexItem);
    }

    function refresh() {
      rebuild();
      return api;
    }

    function scoreItem(item, searchTokens) {
      const metadata = searchMetadata.get(item && item.id);
      const titleTokens = metadata?.titleTokens || tokenize(item && item.title);
      const translationTokens = metadata?.translationTokens || tokenize(item && item.translation);
      const normalizedTitle = metadata?.normalizedTitle || normalize(item && item.title);
      const normalizedTranslation = metadata?.normalizedTranslation || normalize(item && item.translation);

      let score = 0;

      searchTokens.forEach((searchToken) => {
        const exactTitle = titleTokens.some((token) => token === searchToken);
        const exactTranslation = translationTokens.some((token) => token === searchToken);
        const startsTitle = titleTokens.some((token) => token.startsWith(searchToken));
        const startsTranslation = translationTokens.some((token) => token.startsWith(searchToken));
        const titleContains = normalizedTitle.includes(searchToken);
        const translationContains = normalizedTranslation.includes(searchToken);

        if (exactTitle) score += 10000;
        else if (startsTitle) score += 5000;
        else if (titleContains) score += 3000;
        else if (exactTranslation) score += 2000;
        else if (startsTranslation) score += 1000;
        else if (translationContains) score += 500;

        if (exactTitle && titleTokens.length === searchTokens.length) score += 5000;
      });

      return score;
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
        .map((id, index) => {
          const item = itemsById.get(id);
          return item ? { item, index, score: scoreItem(item, tokens) } : null;
        })
        .filter(Boolean)
        .sort((a, b) => {
          const scoreDifference = b.score - a.score;
          return scoreDifference || a.index - b.index;
        })
        .map((result) => result.item);
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
