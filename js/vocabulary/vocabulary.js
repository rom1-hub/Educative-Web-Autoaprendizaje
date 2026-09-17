/*
 * COQ — Controlador de Vocabulario
 *
 * Jerarquía de navegación:
 * categoría → subcategoría → tema
 *
 * El menú de búsqueda y categorías es común a los dos modos:
 * aprender vocabulario → mostrar contenido
 * practicar vocabulario → abrir ejercicios
 */
(function () {
  'use strict';

  const searchInput = document.getElementById('vocabularySearch');
  const results = document.getElementById('vocabularyResults');
  const browseButton = document.getElementById('vocabularyBrowse');
  const topicsPanel = document.getElementById('vocabularyTopics');
  const learnContent = document.getElementById('vocabularyLearnContent');
  const practiceContent = document.getElementById('vocabularyPracticeContent');
  const learnEmptyState = document.getElementById('vocabularyEmptyState');
  const practiceEmptyState = document.getElementById('vocabularyPracticeEmptyState');

  if (!searchInput || !results || !browseButton || !topicsPanel || !learnContent || !practiceContent || !learnEmptyState || !practiceEmptyState) return;

  const database = window.COQ_VOCABULARY_DATABASE;
  if (!database || !Array.isArray(database.categories)) return;

  let selectedItem = null;
  let mode = 'learn';

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function normalize(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  function getItems() {
    const items = [];
    database.categories.forEach((category) => {
      items.push({ type: 'category', id: category.id, title: category.title, category: category.title, parent: null, data: category });
      (category.subcategories || []).forEach((subcategory) => {
        items.push({ type: 'subcategory', id: subcategory.id, title: subcategory.title, category: category.title, parent: category, data: subcategory });
        (subcategory.topics || []).forEach((topic) => {
          items.push({ type: 'topic', id: topic.id, title: topic.title, category: `${category.title} · ${subcategory.title}`, parent: subcategory, data: topic });
        });
      });
    });
    return items;
  }

  function getEntries(item) {
    if (!item) return [];
    if (item.type === 'topic') return Array.isArray(item.data.entries) ? item.data.entries : [];
    if (item.type === 'subcategory') return (item.data.topics || []).flatMap((topic) => Array.isArray(topic.entries) ? topic.entries : []);
    if (item.type === 'category') return (item.data.subcategories || []).flatMap((subcategory) => (subcategory.topics || []).flatMap((topic) => Array.isArray(topic.entries) ? topic.entries : []));
    return [];
  }

  function getExercises(item) {
    if (!item) return [];
    if (item.type === 'topic') return Array.isArray(item.data.exercises) ? item.data.exercises : [];
    if (item.type === 'subcategory') return (item.data.topics || []).flatMap((topic) => Array.isArray(topic.exercises) ? topic.exercises : []).concat(Array.isArray(item.data.exercises) ? item.data.exercises : []);
    return [];
  }

  function searchableText(item) {
    const data = item.data || {};
    const entries = getEntries(item).map((entry) => `${entry.word || ''} ${entry.translation || ''} ${entry.definition || ''}`).join(' ');
    return normalize(`${item.title} ${item.category} ${data.description || ''} ${entries}`);
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

  function renderEntries(entries) {
    if (!entries.length) return '<p class="vocabulary-no-results">Este contenido todavía no tiene palabras cargadas.</p>';
    return `<div class="vocabulary-entry-list">${entries.map((entry) => `<article class="vocabulary-entry"><div><strong>${escapeHtml(entry.word || '')}</strong>${entry.translation ? `<span>${escapeHtml(entry.translation)}</span>` : ''}</div>${entry.definition ? `<p>${escapeHtml(entry.definition)}</p>` : ''}</article>`).join('')}</div>`;
  }

  function renderLearn(item) {
    const title = escapeHtml(item.title);
    const data = item.data || {};

    if (item.type === 'category') {
      const subcategories = data.subcategories || [];
      learnContent.innerHTML = `<div class="vocabulary-result-content"><div class="section-head"><div><span class="tag">Categoría</span><h2>${title}</h2></div><p>Selecciona una subcategoría para ver su vocabulario.</p></div><div class="vocabulary-topics">${subcategories.map((subcategory) => `<button type="button" class="vocabulary-topic-option" data-id="${escapeHtml(subcategory.id)}"><strong>${escapeHtml(subcategory.title)}</strong><small>${(subcategory.topics || []).length} temas</small></button>`).join('')}</div></div>`;
      bindItemButtons(learnContent);
      return;
    }

    if (item.type === 'subcategory') {
      const topics = data.topics || [];
      learnContent.innerHTML = `<div class="vocabulary-result-content"><div class="section-head"><div><span class="tag">Subcategoría</span><h2>${title}</h2></div><p>${escapeHtml(item.parent.title)}</p></div>${topics.length ? `<div class="vocabulary-topics">${topics.map((topic) => `<button type="button" class="vocabulary-topic-option" data-id="${escapeHtml(topic.id)}"><strong>${escapeHtml(topic.title)}</strong><small>${(topic.entries || []).length} palabras</small></button>`).join('')}</div>` : renderEntries(getEntries(item))}</div>`;
      bindItemButtons(learnContent);
      return;
    }

    learnContent.innerHTML = `<div class="vocabulary-result-content"><div class="section-head"><div><span class="tag">Tema</span><h2>${title}</h2></div><p>${escapeHtml(data.description || '')}</p></div>${renderEntries(getEntries(item))}</div>`;
  }

  function renderPractice(item) {
    const title = escapeHtml(item.title);
    const exercises = getExercises(item);

    if (item.type === 'category') {
      practiceContent.innerHTML = `<div class="vocabulary-result-content"><div class="section-head"><div><span class="tag">Práctica</span><h2>${title}</h2></div><p>Selecciona una subcategoría para abrir sus ejercicios.</p></div><div class="vocabulary-topics">${(item.data.subcategories || []).map((subcategory) => `<button type="button" class="vocabulary-topic-option" data-id="${escapeHtml(subcategory.id)}"><strong>${escapeHtml(subcategory.title)}</strong><small>${getExercises({ type: 'subcategory', data: subcategory }).length} ejercicios</small></button>`).join('')}</div></div>`;
      bindItemButtons(practiceContent);
      return;
    }

    practiceContent.innerHTML = `<div class="vocabulary-result-content"><div class="section-head"><div><span class="tag">Práctica</span><h2>${title}</h2></div><p>Ejercicios de ${item.type === 'subcategory' ? 'esta subcategoría' : 'este tema'}.</p></div><div class="vocabulary-practice-card"><strong>${exercises.length ? `${exercises.length} ejercicios disponibles` : 'Ejercicios próximamente'}</strong><p>${exercises.length ? 'La sesión de práctica se abrirá desde este contenido.' : 'Todavía no hay ejercicios configurados para este contenido.'}</p>${exercises.length ? '<button class="btn blue" type="button">Comenzar ejercicios →</button>' : ''}</div></div>`;
  }

  function bindItemButtons(container) {
    container.querySelectorAll('[data-id]').forEach((button) => button.addEventListener('click', () => {
      const item = getItems().find((entry) => entry.id === button.dataset.id);
      if (item) selectItem(item);
    }));
  }

  function renderContent() {
    if (!selectedItem) return;
    learnEmptyState.classList.add('hidden');
    practiceEmptyState.classList.add('hidden');
    if (mode === 'learn') renderLearn(selectedItem);
    else renderPractice(selectedItem);
  }

  function renderResults(query) {
    const term = normalize(query);
    if (!term) {
      results.innerHTML = '';
      searchInput.setAttribute('aria-expanded', 'false');
      return;
    }

    const matches = getItems().filter((item) => searchableText(item).includes(term));
    results.innerHTML = matches.length
      ? matches.map((item, index) => `<button type="button" class="vocabulary-result" role="option" data-result-index="${index}"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.category)}</small></button>`).join('')
      : '<div class="vocabulary-no-results">No hay coincidencias.</div>';

    results.querySelectorAll('[data-result-index]').forEach((button) => button.addEventListener('click', () => selectItem(matches[Number(button.dataset.resultIndex)])));
    searchInput.setAttribute('aria-expanded', 'true');
  }

  function renderAllCategories() {
    topicsPanel.innerHTML = database.categories.map((category) => `
      <section class="vocabulary-category-group">
        <button type="button" class="vocabulary-category-option" data-category-id="${escapeHtml(category.id)}" aria-expanded="false">
          <strong>${escapeHtml(category.title)}</strong><span aria-hidden="true">▾</span>
        </button>
        <div class="vocabulary-subcategories hidden" data-subcategories-for="${escapeHtml(category.id)}">
          ${(category.subcategories || []).map((subcategory) => `<button type="button" class="vocabulary-topic-option" data-id="${escapeHtml(subcategory.id)}"><strong>${escapeHtml(subcategory.title)}</strong><small>${(subcategory.topics || []).length} temas</small></button>`).join('')}
        </div>
      </section>`).join('');

    topicsPanel.querySelectorAll('[data-category-id]').forEach((button) => button.addEventListener('click', () => {
      const categoryId = button.dataset.categoryId;
      const subcategories = topicsPanel.querySelector(`[data-subcategories-for="${CSS.escape(categoryId)}"]`);
      if (!subcategories) return;
      const open = !subcategories.classList.contains('hidden');
      subcategories.classList.toggle('hidden', open);
      button.setAttribute('aria-expanded', String(!open));
    }));

    topicsPanel.querySelectorAll('[data-id]').forEach((button) => button.addEventListener('click', () => {
      const item = getItems().find((entry) => entry.id === button.dataset.id);
      if (item) selectItem(item);
    }));
  }

  searchInput.addEventListener('input', () => renderResults(searchInput.value));

  browseButton.addEventListener('click', () => {
    const open = !topicsPanel.classList.contains('hidden');
    topicsPanel.classList.toggle('hidden', open);
    browseButton.setAttribute('aria-expanded', String(!open));
    if (!open) renderAllCategories();
  });

  document.querySelectorAll('[data-vocabulary-tab]').forEach((button) => button.addEventListener('click', () => {
    mode = button.dataset.vocabularyTab;
    document.querySelectorAll('[data-vocabulary-tab]').forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    });
    document.getElementById('vocabularyLearnPanel').classList.toggle('hidden', mode !== 'learn');
    document.getElementById('vocabularyPracticePanel').classList.toggle('hidden', mode !== 'practice');
    renderContent();
  }));
})();
