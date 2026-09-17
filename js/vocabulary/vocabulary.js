/*
 * COQ — Controlador de Vocabulario
 * La página consume exclusivamente la base de datos de Vocabulario.
 */
(function () {
  'use strict';

  const searchInput = document.getElementById('vocabularySearch');
  const results = document.getElementById('vocabularyResults');
  const browseButton = document.getElementById('vocabularyBrowse');
  const topicsPanel = document.getElementById('vocabularyTopics');
  const featured = document.getElementById('featuredVocabularyTopics');
  const emptyState = document.getElementById('vocabularyEmptyState');
  const topicView = document.getElementById('vocabularyTopicView');
  const practiceView = document.getElementById('vocabularyPracticeView');

  if (!searchInput || !results || !browseButton || !topicsPanel || !featured || !emptyState || !topicView || !practiceView) return;

  const database = window.COQ_VOCABULARY_DATABASE;
  if (!database || !Array.isArray(database.categories)) return;

  let selectedItem = null;
  let mode = 'topic';

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

  function searchableText(item) {
    const data = item.data || {};
    const entries = Array.isArray(data.entries) ? data.entries.map((entry) => `${entry.word || ''} ${entry.translation || ''}`).join(' ') : '';
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

  function renderContent() {
    if (!selectedItem) return;

    emptyState.classList.add('hidden');
    const title = escapeHtml(selectedItem.title);
    const data = selectedItem.data || {};

    if (mode === 'practice') {
      topicView.classList.add('hidden');
      practiceView.classList.remove('hidden');
      practiceView.innerHTML = `<div class="exercise"><h3>Ejercicios · ${title}</h3><p>Los ejercicios se añadirán a esta categoría o subcategoría mediante la base de datos de Vocabulario.</p></div>`;
      return;
    }

    practiceView.classList.add('hidden');
    topicView.classList.remove('hidden');

    if (selectedItem.type === 'category') {
      const subcategories = data.subcategories || [];
      topicView.innerHTML = `<div class="exercise"><h3>${title}</h3><p>Selecciona una subcategoría.</p><div class="vocabulary-topics">${subcategories.map((subcategory) => `<button type="button" class="vocabulary-topic-option" data-id="${escapeHtml(subcategory.id)}"><strong>${escapeHtml(subcategory.title)}</strong><small>${(subcategory.topics || []).length} temas</small></button>`).join('')}</div></div>`;
      topicView.querySelectorAll('[data-id]').forEach((button) => button.addEventListener('click', () => {
        const item = getItems().find((entry) => entry.id === button.dataset.id);
        if (item) selectItem(item);
      }));
      return;
    }

    if (selectedItem.type === 'subcategory') {
      const topics = data.topics || [];
      topicView.innerHTML = `<div class="exercise"><h3>${title}</h3><p>${escapeHtml(selectedItem.parent.title)} · subcategoría</p>${topics.length ? `<div class="vocabulary-topics">${topics.map((topic) => `<button type="button" class="vocabulary-topic-option" data-id="${escapeHtml(topic.id)}"><strong>${escapeHtml(topic.title)}</strong></button>`).join('')}</div>` : '<p>Esta subcategoría está preparada para recibir sus temas de vocabulario.</p>'}</div>`;
      topicView.querySelectorAll('[data-id]').forEach((button) => button.addEventListener('click', () => {
        const item = getItems().find((entry) => entry.id === button.dataset.id);
        if (item) selectItem(item);
      }));
      return;
    }

    topicView.innerHTML = `<div class="exercise"><h3>${title}</h3><p>${escapeHtml(data.description || 'Contenido del tema de vocabulario.')}</p></div>`;
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
      ? matches.map((item, index) => `<button type="button" class="vocabulary-result" role="option" data-result-index="${index}"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.category)} · ${escapeHtml(item.type)}</small></button>`).join('')
      : '<div class="vocabulary-no-results">No hay coincidencias.</div>';

    results.querySelectorAll('[data-result-index]').forEach((button) => button.addEventListener('click', () => selectItem(matches[Number(button.dataset.resultIndex)])));
    searchInput.setAttribute('aria-expanded', 'true');
  }

  function renderAllCategories() {
    topicsPanel.innerHTML = database.categories.map((category) => `<section class="vocabulary-category-group"><h3>${escapeHtml(category.title)}</h3>${(category.subcategories || []).map((subcategory) => `<button type="button" class="vocabulary-topic-option" data-id="${escapeHtml(subcategory.id)}"><strong>${escapeHtml(subcategory.title)}</strong><small>${(subcategory.topics || []).length} temas</small></button>`).join('')}</section>`).join('');
    topicsPanel.querySelectorAll('[data-id]').forEach((button) => button.addEventListener('click', () => {
      const item = getItems().find((entry) => entry.id === button.dataset.id);
      if (item) selectItem(item);
    }));
  }

  function renderFeatured() {
    const categories = database.categories.slice(0, 6);
    featured.innerHTML = categories.map((category) => `<article class="card vocabulary-featured-card"><div class="word">${escapeHtml(category.title)}</div><small>${(category.subcategories || []).length} subcategorías</small><button class="btn secondary" type="button" data-featured-id="${escapeHtml(category.id)}">Explorar</button></article>`).join('');
    featured.querySelectorAll('[data-featured-id]').forEach((button) => button.addEventListener('click', () => {
      const item = getItems().find((entry) => entry.id === button.dataset.featuredId);
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

  document.querySelectorAll('[data-vocabulary-mode]').forEach((button) => button.addEventListener('click', () => {
    mode = button.dataset.vocabularyMode;
    document.querySelectorAll('[data-vocabulary-mode]').forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    renderContent();
  }));

  renderFeatured();
})();
