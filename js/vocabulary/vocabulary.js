/* Vocabulario dinámico — estructura inicial */
(function () {
  'use strict';
  const topics = [];
  let selectedTopic = null;
  let mode = 'topic';
  const searchInput = document.getElementById('vocabularySearch');
  const results = document.getElementById('vocabularyResults');
  const browseButton = document.getElementById('vocabularyBrowse');
  const topicsPanel = document.getElementById('vocabularyTopics');
  const featured = document.getElementById('featuredVocabularyTopics');
  const emptyState = document.getElementById('vocabularyEmptyState');
  const topicView = document.getElementById('vocabularyTopicView');
  const practiceView = document.getElementById('vocabularyPracticeView');
  if (!searchInput || !results || !browseButton || !topicsPanel || !featured || !emptyState || !topicView || !practiceView) return;
  function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char])); }
  function normalize(value) { return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
  function searchableText(topic) { const entries = Array.isArray(topic.entries) ? topic.entries.map((entry) => `${entry.word || ''} ${entry.translation || ''}`).join(' ') : ''; return normalize(`${topic.title || ''} ${topic.category || ''} ${topic.description || ''} ${entries}`); }
  function selectTopic(topic) { selectedTopic = topic; results.innerHTML = ''; searchInput.value = topic.title || ''; searchInput.setAttribute('aria-expanded','false'); topicsPanel.classList.add('hidden'); browseButton.setAttribute('aria-expanded','false'); renderContent(); }
  function renderContent() { if (!selectedTopic) return; emptyState.classList.add('hidden'); const title = escapeHtml(selectedTopic.title || 'Tema'); if (mode === 'practice') { topicView.classList.add('hidden'); practiceView.classList.remove('hidden'); practiceView.innerHTML = `<div class="exercise"><h3>Ejercicios · ${title}</h3><p>La actividad de este tema se cargará desde la futura base de datos de vocabulario.</p></div>`; } else { practiceView.classList.add('hidden'); topicView.classList.remove('hidden'); topicView.innerHTML = `<div class="exercise"><h3>${title}</h3><p>${escapeHtml(selectedTopic.description || 'Contenido del tema de vocabulario.')}</p></div>`; } }
  function renderResults(query) { const term = normalize(query); if (!term) { results.innerHTML=''; searchInput.setAttribute('aria-expanded','false'); return; } const matches = topics.filter((topic) => searchableText(topic).includes(term)); results.innerHTML = matches.length ? matches.map((topic,index) => `<button type="button" class="vocabulary-result" role="option" data-topic-index="${index}"><strong>${escapeHtml(topic.title)}</strong><small>${escapeHtml(topic.category || '')}</small></button>`).join('') : '<div class="vocabulary-no-results">No hay coincidencias todavía.</div>'; results.querySelectorAll('[data-topic-index]').forEach((button) => button.addEventListener('click', () => selectTopic(matches[Number(button.dataset.topicIndex)]))); searchInput.setAttribute('aria-expanded','true'); }
  function renderAllTopics() { topicsPanel.innerHTML = topics.length ? topics.map((topic,index) => `<button type="button" class="vocabulary-topic-option" data-topic-index="${index}"><strong>${escapeHtml(topic.title)}</strong><small>${escapeHtml(topic.category || '')}</small></button>`).join('') : '<p class="vocabulary-no-results">Los temas se incorporarán con la base de datos léxica.</p>'; topicsPanel.querySelectorAll('[data-topic-index]').forEach((button) => button.addEventListener('click', () => selectTopic(topics[Number(button.dataset.topicIndex)]))); }
  function renderFeatured() { const featuredTopics = topics.slice().sort(() => Math.random() - 0.5).slice(0,6); featured.innerHTML = featuredTopics.length ? featuredTopics.map((topic,index) => `<article class="card vocabulary-featured-card"><div class="word">${escapeHtml(topic.title)}</div><small>${escapeHtml(topic.description || '')}</small><button class="btn secondary" type="button" data-featured-index="${index}">Explorar</button></article>`).join('') : '<article class="card"><div class="word">Próximamente</div><p>Los temas de vocabulario aparecerán aquí cuando incorporemos la base de datos.</p></article>'; featured.querySelectorAll('[data-featured-index]').forEach((button) => button.addEventListener('click', () => selectTopic(featuredTopics[Number(button.dataset.featuredIndex)]))); }
  searchInput.addEventListener('input', () => renderResults(searchInput.value));
  browseButton.addEventListener('click', () => { const open = !topicsPanel.classList.contains('hidden'); topicsPanel.classList.toggle('hidden',open); browseButton.setAttribute('aria-expanded',String(!open)); if (!open) renderAllTopics(); });
  document.querySelectorAll('[data-vocabulary-mode]').forEach((button) => button.addEventListener('click', () => { mode = button.dataset.vocabularyMode; document.querySelectorAll('[data-vocabulary-mode]').forEach((item) => { const active = item === button; item.classList.toggle('active',active); item.setAttribute('aria-pressed',String(active)); }); renderContent(); }));
  renderFeatured();
})();
