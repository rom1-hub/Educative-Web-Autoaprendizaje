/*
 * COQ — Controlador de Vocabulario
 *
 * Jerarquía de navegación:
 * categoría → subcategoría → entrada
 *
 * El menú de búsqueda y categorías es común a los dos modos:
 * aprender vocabulario → mostrar contenido
 * practicar vocabulario → preparar la futura capa de ejercicios
 */
(function () {
  'use strict';

  const searchInput = document.getElementById('vocabularySearch');
  const results = document.getElementById('vocabularyResults');
  const browseButton = document.getElementById('vocabularyBrowse');
  const resetButton = document.getElementById('vocabularyReset');
  const topicsPanel = document.getElementById('vocabularyTopics');
  const learnContent = document.getElementById('vocabularyLearnContent');
  const practiceContent = document.getElementById('vocabularyPracticeContent');

  if (!searchInput || !results || !browseButton || !resetButton || !topicsPanel || !learnContent || !practiceContent) return;

  const database = window.COQ_VOCABULARY_DATABASE;
  if (!database || !Array.isArray(database.categories)) return;

  let selectedItem = null;
  let mode = 'learn';

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
  }

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function getItems() {
    const items = [];

    database.categories.forEach((category) => {
      items.push({
        type: 'category',
        id: category.id,
        title: category.title,
        category: category.title,
        parent: null,
        data: category
      });

      (category.subcategories || []).forEach((subcategory) => {
        items.push({
          type: 'subcategory',
          id: subcategory.id,
          title: subcategory.title,
          category: category.title,
          parent: category,
          data: subcategory
        });
      });
    });

    return items;
  }

  function getCategoryById(id) {
    return database.categories.find((category) => category.id === id) || null;
  }

  function getSubcategoryById(id) {
    for (const category of database.categories) {
      const subcategory = (category.subcategories || []).find((item) => item.id === id);
      if (subcategory) return { category, subcategory };
    }
    return null;
  }

  function getEntries(item) {
    if (!item) return [];

    if (item.type === 'subcategory') {
      return Array.isArray(item.data.entries) ? item.data.entries : [];
    }

    if (item.type === 'category') {
      return (item.data.subcategories || []).flatMap((subcategory) =>
        Array.isArray(subcategory.entries) ? subcategory.entries : []
      );
    }

    return [];
  }

  function findWordMatches(query) {
    const term = normalize(query);
    if (!term) return [];

    const matches = [];

    database.categories.forEach((category) => {
      (category.subcategories || []).forEach((subcategory) => {
        (subcategory.entries || []).forEach((entry) => {
          const haystack = normalize(
            `${entry.word || ''} ${entry.translation || ''}`
          );

          if (haystack.includes(term)) {
            matches.push({
              type: 'entry',
              id: entry.id,
              title: `${entry.articleFr || ''} ${entry.word || ''} / ${entry.articleEs || ''} ${entry.translation || ''}`.trim(),
              category: `${category.title} · ${subcategory.title}`,
              parent: subcategory,
              categoryData: category,
              data: entry
            });
          }
        });
      });
    });

    return matches;
  }

  function searchableItems(query) {
    const term = normalize(query);
    if (!term) return [];

    const structuralMatches = getItems().filter((item) =>
      normalize(`${item.title} ${item.category}`).includes(term)
    );

    const wordMatches = findWordMatches(query);

    return [...structuralMatches, ...wordMatches];
  }

  function selectItem(item) {
    selectedItem = item;
    results.innerHTML = '';
    searchInput.value = item.title;
    searchInput.setAttribute('aria-expanded', 'false');
    topicsPanel.classList.add('hidden');
    browseButton.setAttribute('aria-expanded', 'false');
    renderContent();
  }

  function selectSubcategoryById(id) {
    const found = getSubcategoryById(id);
    if (!found) return;

    selectItem({
      type: 'subcategory',
      id: found.subcategory.id,
      title: found.subcategory.title,
      category: found.category.title,
      parent: found.category,
      data: found.subcategory
    });
  }

  function selectCategoryById(id) {
    const category = getCategoryById(id);
    if (!category) return;

    selectItem({
      type: 'category',
      id: category.id,
      title: category.title,
      category: category.title,
      parent: null,
      data: category
    });
  }

  function selectEntry(item) {
    selectedItem = item;
    results.innerHTML = '';
    searchInput.value = item.data.word;
    searchInput.setAttribute('aria-expanded', 'false');
    topicsPanel.classList.add('hidden');
    browseButton.setAttribute('aria-expanded', 'false');
    renderWordResult(item);
  }

  function resetVocabulary() {
    selectedItem = null;
    mode = 'learn';

    searchInput.value = '';
    results.innerHTML = '';
    searchInput.setAttribute('aria-expanded', 'false');

    topicsPanel.innerHTML = '';
    topicsPanel.classList.add('hidden');
    browseButton.setAttribute('aria-expanded', 'false');

    learnContent.innerHTML = '';
    practiceContent.innerHTML = '';

    document.querySelectorAll('[data-vocabulary-tab]').forEach((item) => {
      const active = item.dataset.vocabularyTab === 'learn';
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    });

    document.getElementById('vocabularyLearnPanel').classList.remove('hidden');
    document.getElementById('vocabularyPracticePanel').classList.add('hidden');

    searchInput.focus();
  }

  function renderEntries(entries) {
    if (!entries.length) {
      return '<p class="vocabulary-no-results">Este contenido todavía no tiene palabras cargadas.</p>';
    }

    return `<div class="vocabulary-entry-list">${entries.map((entry) => `
      <article class="vocabulary-entry">
        <div>
          <strong>${entry.emoji ? escapeHtml(entry.emoji) + ' ' : ''}${escapeHtml(entry.articleFr || '')} ${escapeHtml(entry.word || '')}</strong>
          <span>${escapeHtml(entry.articleEs || '')} ${escapeHtml(entry.translation || '')}</span>
        </div>
      </article>`).join('')}</div>`;
  }

  function renderLearn(item) {
    const title = escapeHtml(item.title);

    if (item.type === 'category') {
      const subcategories = item.data.subcategories || [];

      learnContent.innerHTML = `<div class="vocabulary-result-content">
        <div class="section-head">
          <div><span class="tag">Categoría</span><h2>${title}</h2></div>
          <p>Selecciona una subcategoría para ver su vocabulario.</p>
        </div>
        <div class="vocabulary-topics">
          ${subcategories.map((subcategory) => `
            <button type="button" class="vocabulary-topic-option" data-id="${escapeHtml(subcategory.id)}">
              <strong>${escapeHtml(subcategory.title)}</strong>
              <small>${(subcategory.entries || []).length} palabras</small>
            </button>`).join('')}
        </div>
      </div>`;

      bindSubcategoryButtons(learnContent);
      return;
    }

    if (item.type === 'subcategory') {
      learnContent.innerHTML = `<div class="vocabulary-result-content">
        <div class="section-head">
          <div><span class="tag">Subcategoría</span><h2>${title}</h2></div>
          <p>${escapeHtml(item.parent.title)}</p>
        </div>
        ${renderEntries(getEntries(item))}
      </div>`;
    }
  }

  function renderWordResult(item) {
    const entry = item.data;

    learnContent.innerHTML = `<div class="vocabulary-result-content">
      <div class="section-head">
        <div><span class="tag">Palabra</span><h2>${escapeHtml(entry.word)}</h2></div>
        <p>${escapeHtml(item.category)}</p>
      </div>
      <div class="vocabulary-entry-list">
        <article class="vocabulary-entry">
          <strong>${escapeHtml(entry.articleFr || '')} ${escapeHtml(entry.word || '')}</strong>
          <span>${escapeHtml(entry.articleEs || '')} ${escapeHtml(entry.translation || '')}</span>
        </article>
      </div>
      <div class="vocabulary-word-context">
        <button type="button" class="btn secondary" data-word-subcategory="${escapeHtml(item.parent.id)}">
          Ver toda la subcategoría →
        </button>
      </div>
    </div>`;

    const button = learnContent.querySelector('[data-word-subcategory]');
    if (button) {
      button.addEventListener('click', () => selectSubcategoryById(button.dataset.wordSubcategory));
    }

    practiceContent.innerHTML = '';
  }

  function renderPractice(item) {
    const title = escapeHtml(item.title);

    if (item.type === 'category') {
      practiceContent.innerHTML = `<div class="vocabulary-result-content">
        <div class="section-head">
          <div><span class="tag">Práctica</span><h2>${title}</h2></div>
          <p>Selecciona una subcategoría para practicar su vocabulario.</p>
        </div>
        <div class="vocabulary-topics">
          ${(item.data.subcategories || []).map((subcategory) => `
            <button type="button" class="vocabulary-topic-option" data-id="${escapeHtml(subcategory.id)}">
              <strong>${escapeHtml(subcategory.title)}</strong>
              <small>${(subcategory.entries || []).length} palabras</small>
            </button>`).join('')}
        </div>
      </div>`;

      bindSubcategoryButtons(practiceContent);
      return;
    }

    if (item.type === 'subcategory') {
      practiceContent.innerHTML = `<div class="vocabulary-result-content">
        <div class="section-head">
          <div><span class="tag">Práctica</span><h2>${title}</h2></div>
          <p>Esta subcategoría contiene ${getEntries(item).length} palabras listas para practicar.</p>
        </div>
        <div class="vocabulary-practice-card">
          <strong>Ejercicios próximamente</strong>
          <p>La base de datos ya está preparada para que los ejercicios reutilicen estas entradas.</p>
        </div>
      </div>`;
    }
  }

  function bindSubcategoryButtons(container) {
    container.querySelectorAll('[data-id]').forEach((button) => {
      button.addEventListener('click', () => selectSubcategoryById(button.dataset.id));
    });
  }

  function renderContent() {
    if (!selectedItem) return;

    if (selectedItem.type === 'entry') {
      renderWordResult(selectedItem);
      return;
    }

    if (mode === 'learn') renderLearn(selectedItem);
    else renderPractice(selectedItem);
  }

  function renderResults(query) {
    const matches = searchableItems(query);

    if (!matches.length) {
      results.innerHTML = '<div class="vocabulary-no-results">No hay coincidencias.</div>';
      searchInput.setAttribute('aria-expanded', 'true');
      return;
    }

    results.innerHTML = matches.map((item, index) => {
      if (item.type === 'entry') {
        return `<button type="button" class="vocabulary-result" data-result-index="${index}">
          <strong>${item.data.emoji ? escapeHtml(item.data.emoji) + " " : ""}${escapeHtml(item.title)}</strong>
          <small>${escapeHtml(item.category)}</small>
        </button>`;
      }

      return `<button type="button" class="vocabulary-result" data-result-index="${index}">
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.category)}</small>
      </button>`;
    }).join('');

    results.querySelectorAll('[data-result-index]').forEach((button) => {
      button.addEventListener('click', () => {
        const item = matches[Number(button.dataset.resultIndex)];
        if (item.type === 'entry') selectEntry(item);
        else selectItem(item);
      });
    });

    searchInput.setAttribute('aria-expanded', 'true');
  }

  function renderAllCategories() {
    topicsPanel.innerHTML = database.categories.map((category) => `
      <section class="vocabulary-category-group">
        <button type="button" class="vocabulary-category-option" data-category-id="${escapeHtml(category.id)}" aria-expanded="false">
          <strong>${escapeHtml(category.title)}</strong><span aria-hidden="true">▾</span>
        </button>
        <div class="vocabulary-subcategories hidden" data-subcategories-for="${escapeHtml(category.id)}">
          ${(category.subcategories || []).map((subcategory) => `
            <button type="button" class="vocabulary-topic-option" data-id="${escapeHtml(subcategory.id)}">
              <strong>${escapeHtml(subcategory.title)}</strong>
              <small>${(subcategory.entries || []).length} palabras</small>
            </button>`).join('')}
        </div>
      </section>`).join('');

    topicsPanel.querySelectorAll('[data-category-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const categoryId = button.dataset.categoryId;
        const subcategories = topicsPanel.querySelector(
          `[data-subcategories-for="${CSS.escape(categoryId)}"]`
        );

        if (!subcategories) return;

        const open = !subcategories.classList.contains('hidden');
        subcategories.classList.toggle('hidden', open);
        button.setAttribute('aria-expanded', String(!open));
      });
    });

    bindSubcategoryButtons(topicsPanel);
  }

  searchInput.addEventListener('input', () => {
    if (!searchInput.value.trim()) {
      results.innerHTML = '';
      searchInput.setAttribute('aria-expanded', 'false');
      return;
    }

    renderResults(searchInput.value);
  });

  browseButton.addEventListener('click', () => {
    const open = !topicsPanel.classList.contains('hidden');

    topicsPanel.classList.toggle('hidden', open);
    browseButton.setAttribute('aria-expanded', String(!open));

    if (!open) renderAllCategories();
  });

  resetButton.addEventListener('click', resetVocabulary);

  document.querySelectorAll('[data-vocabulary-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      mode = button.dataset.vocabularyTab;

      document.querySelectorAll('[data-vocabulary-tab]').forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });

      document.getElementById('vocabularyLearnPanel').classList.toggle('hidden', mode !== 'learn');
      document.getElementById('vocabularyPracticePanel').classList.toggle('hidden', mode !== 'practice');

      renderContent();
    });
  });
})();
