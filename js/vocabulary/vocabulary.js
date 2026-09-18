/*
 * COQ — Controlador de Vocabulario
 *
 * Arquitectura:
 * categoría → subcategoría → entradas → ejercicios universales
 *
 * Los ejercicios reutilizan exclusivamente las entradas de la
 * subcategoría seleccionada. No existen listas de vocabulario duplicadas
 * dentro de la lógica de ejercicios.
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
  const exerciseTabs = document.getElementById('vocabularyExerciseTabs');

  if (!searchInput || !results || !browseButton || !resetButton || !topicsPanel ||
      !learnContent || !practiceContent || !exerciseTabs) return;

  const database = window.COQ_VOCABULARY_DATABASE;
  if (!database || !Array.isArray(database.categories)) return;

  const EXERCISES = [
    { id: 'match', label: 'Ejercicio 1', title: 'Asociar palabras', description: 'Arrastra cada palabra francesa hasta su traducción.' },
    { id: 'write', label: 'Ejercicio 2', title: 'Escribir la palabra', description: 'Escribe en francés la palabra que aparece en español.' },
    { id: 'audio', label: 'Ejercicio 3', title: 'Escuchar y reconocer', description: 'Escucha la palabra y selecciona la forma escrita correcta.' }
  ];

  let selectedItem = null;
  let mode = 'learn';
  let activeExercise = 'match';

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, (char) => ({
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

  function shuffle(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function sampleEntries(entries, count = 15) {
    return shuffle(entries).slice(0, Math.min(count, entries.length));
  }

  function displayWord(entry) {
    const article = String(entry.articleFr || '').trim();
    const word = String(entry.word || '').trim();
    return escapeHtml([article, word].filter(Boolean).join(' '));
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
          const haystack = normalize(`${entry.word || ''} ${entry.translation || ''}`);
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

    return [...structuralMatches, ...findWordMatches(query)];
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
    activeExercise = 'match';

    searchInput.value = '';
    results.innerHTML = '';
    searchInput.setAttribute('aria-expanded', 'false');
    topicsPanel.innerHTML = '';
    topicsPanel.classList.add('hidden');
    browseButton.setAttribute('aria-expanded', 'false');
    learnContent.innerHTML = '';
    practiceContent.innerHTML = '';
    exerciseTabs.innerHTML = '';
    exerciseTabs.classList.add('hidden');

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
          <strong>${entry.emoji ? escapeHtml(entry.emoji) + ' ' : ''}${displayWord(entry)}</strong>
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
          <strong>${entry.emoji ? escapeHtml(entry.emoji) + ' ' : ''}${displayWord(entry)}</strong>
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
    exerciseTabs.innerHTML = '';
    exerciseTabs.classList.add('hidden');
  }

  function renderPracticeCategory(item) {
    practiceContent.innerHTML = `<div class="vocabulary-result-content">
      <div class="section-head">
        <div><span class="tag">Práctica</span><h2>${escapeHtml(item.title)}</h2></div>
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
    exerciseTabs.innerHTML = '';
    exerciseTabs.classList.add('hidden');
  }

  function renderExerciseTabs() {
    exerciseTabs.innerHTML = EXERCISES.map((exercise, index) => `
      <button type="button"
        class="vocabulary-exercise-tab${exercise.id === activeExercise ? ' active' : ''}"
        role="tab"
        aria-selected="${String(exercise.id === activeExercise)}"
        aria-controls="vocabularyPracticeContent"
        data-exercise="${exercise.id}">
        <span>${exercise.label}</span>
        <small>${index + 1}</small>
      </button>`).join('');

    exerciseTabs.classList.remove('hidden');

    exerciseTabs.querySelectorAll('[data-exercise]').forEach((button) => {
      button.addEventListener('click', () => {
        activeExercise = button.dataset.exercise;
        renderExerciseTabs();
        renderPracticeSubcategory(selectedItem);
      });
    });
  }

  function exerciseHeader(exercise) {
    return `<div class="vocabulary-exercise-head">
      <div>
        <span class="tag">${escapeHtml(exercise.label)}</span>
        <h2>${escapeHtml(exercise.title)}</h2>
      </div>
      <p>${escapeHtml(exercise.description)}</p>
    </div>`;
  }

  function feedbackHtml(correct, answer) {
    return correct
      ? '<div class="vocabulary-exercise-feedback correct" role="status">Correcto.</div>'
      : `<div class="vocabulary-exercise-feedback wrong" role="status">Incorrecto. Respuesta: <strong>${escapeHtml(answer)}</strong></div>`;
  }

  function renderMatchExercise(entries) {
    const selected = sampleEntries(entries);
    const french = shuffle(selected);
    const spanish = shuffle(selected);

    practiceContent.innerHTML = `${exerciseHeader(EXERCISES[0])}
      <div class="vocabulary-exercise-meta"><span>15 palabras</span><span class="vocabulary-match-progress">0 / ${selected.length} asociadas</span></div>
      <div class="vocabulary-match-board" data-match-board>
        <div class="vocabulary-match-column">
          <h3>Français</h3>
          <div class="vocabulary-match-list">
            ${french.map((entry) => `
              <button type="button" class="vocabulary-match-card vocabulary-match-source"
                draggable="true" data-match-id="${escapeHtml(entry.id)}">
                ${displayWord(entry)}
              </button>`).join('')}
          </div>
        </div>
        <div class="vocabulary-match-column">
          <h3>Español</h3>
          <div class="vocabulary-match-list">
            ${spanish.map((entry) => `
              <button type="button" class="vocabulary-match-card vocabulary-match-target"
                data-match-id="${escapeHtml(entry.id)}">
                ${escapeHtml(entry.articleEs || '')} ${escapeHtml(entry.translation || '')}
              </button>`).join('')}
          </div>
        </div>
      </div>
      <div class="vocabulary-exercise-actions"><button type="button" class="btn secondary" data-restart-exercise>Generar otras palabras</button></div>`;

    let matched = 0;
    let draggingId = null;
    const board = practiceContent.querySelector('[data-match-board]');

    function tryMatch(source, target) {
      if (!source || !target || source.disabled || target.disabled) return;
      const correct = source.dataset.matchId === target.dataset.matchId;
      if (correct) {
        source.disabled = true;
        target.disabled = true;
        source.classList.add('matched');
        target.classList.add('matched');
        matched += 1;
        practiceContent.querySelector('.vocabulary-match-progress').textContent = `${matched} / ${selected.length} asociadas`;
        if (matched === selected.length) {
          practiceContent.querySelector('.vocabulary-exercise-complete')?.remove();
          practiceContent.insertAdjacentHTML('beforeend', '<div class="vocabulary-exercise-complete" role="status">Completado: todas las parejas están asociadas.</div>');
        }
      } else {
        source.classList.add('wrong');
        target.classList.add('wrong');
        window.setTimeout(() => {
          source.classList.remove('wrong');
          target.classList.remove('wrong');
        }, 450);
      }
    }

    board.querySelectorAll('.vocabulary-match-source').forEach((source) => {
      source.addEventListener('dragstart', (event) => {
        draggingId = source.dataset.matchId;
        event.dataTransfer.setData('text/plain', draggingId);
        source.classList.add('dragging');
      });
      source.addEventListener('dragend', () => {
        draggingId = null;
        source.classList.remove('dragging');
      });
    });

    board.querySelectorAll('.vocabulary-match-target').forEach((target) => {
      target.addEventListener('dragover', (event) => {
        event.preventDefault();
        target.classList.add('drag-over');
      });
      target.addEventListener('dragleave', () => target.classList.remove('drag-over'));
      target.addEventListener('drop', (event) => {
        event.preventDefault();
        target.classList.remove('drag-over');
        const id = event.dataTransfer.getData('text/plain') || draggingId;
        const source = board.querySelector(`.vocabulary-match-source[data-match-id="${CSS.escape(id)}"]`);
        tryMatch(source, target);
      });
      target.addEventListener('click', () => {
        const source = board.querySelector('.vocabulary-match-source.selected');
        if (source) {
          source.classList.remove('selected');
          tryMatch(source, target);
        }
      });
    });

    board.querySelectorAll('.vocabulary-match-source').forEach((source) => {
      source.addEventListener('click', () => {
        if (source.disabled) return;
        board.querySelectorAll('.vocabulary-match-source.selected').forEach((item) => item.classList.remove('selected'));
        source.classList.add('selected');
      });
    });

    bindRestartButton();
  }

  function renderWriteExercise(entries) {
    const selected = sampleEntries(entries);
    let index = 0;
    let correctCount = 0;

    practiceContent.innerHTML = `${exerciseHeader(EXERCISES[1])}
      <div class="vocabulary-exercise-meta"><span>15 palabras</span><span class="vocabulary-write-progress">1 / ${selected.length}</span></div>
      <div class="vocabulary-write-card">
        <span class="vocabulary-write-label">Escribe en francés:</span>
        <strong class="vocabulary-write-prompt"></strong>
        <label class="sr-only" for="vocabularyWriteInput">Respuesta en francés</label>
        <input id="vocabularyWriteInput" class="vocabulary-write-input" type="text" autocomplete="off" spellcheck="false">
        <button type="button" class="btn primary" data-check-write>Comprobar</button>
        <div class="vocabulary-write-feedback" aria-live="polite"></div>
      </div>`;

    const prompt = practiceContent.querySelector('.vocabulary-write-prompt');
    const input = practiceContent.querySelector('.vocabulary-write-input');
    const check = practiceContent.querySelector('[data-check-write]');
    const feedback = practiceContent.querySelector('.vocabulary-write-feedback');
    const progress = practiceContent.querySelector('.vocabulary-write-progress');

    function showQuestion() {
      const entry = selected[index];
      prompt.textContent = entry.translation;
      input.value = '';
      input.disabled = false;
      check.disabled = false;
      feedback.innerHTML = '';
      input.focus();
      progress.textContent = `${index + 1} / ${selected.length}`;
    }

    function finish() {
      practiceContent.querySelector('.vocabulary-write-card').innerHTML = `
        <div class="vocabulary-exercise-final">
          <strong>Ejercicio terminado</strong>
          <p>Resultado: ${correctCount} / ${selected.length}</p>
          <button type="button" class="btn secondary" data-restart-exercise>Generar otras palabras</button>
        </div>`;
      bindRestartButton();
    }

    function submit() {
      if (input.disabled) return;
      const entry = selected[index];
      const answer = normalize(input.value);
      const expected = normalize(entry.word);
      const correct = answer === expected;

      if (correct) {
        correctCount += 1;
        feedback.innerHTML = feedbackHtml(true, entry.word);
      } else {
        feedback.innerHTML = feedbackHtml(false, entry.word);
      }

      input.disabled = true;
      check.disabled = true;

      window.setTimeout(() => {
        index += 1;
        if (index >= selected.length) finish();
        else showQuestion();
      }, 900);
    }

    check.addEventListener('click', submit);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') submit();
    });
    showQuestion();
  }

  function buildAudioOptions(entry, entries) {
    const distractors = shuffle(entries.filter((item) => item.id !== entry.id)).slice(0, Math.min(3, entries.length - 1));
    return shuffle([entry, ...distractors]);
  }

  function renderAudioExercise(entries) {
    const selected = sampleEntries(entries);
    let index = 0;
    let correctCount = 0;

    practiceContent.innerHTML = `${exerciseHeader(EXERCISES[2])}
      <div class="vocabulary-exercise-meta"><span>15 palabras</span><span class="vocabulary-audio-progress">1 / ${selected.length}</span></div>
      <div class="vocabulary-audio-card">
        <p>Escucha y selecciona la palabra correcta.</p>
        <button type="button" class="vocabulary-audio-button" data-audio-play aria-label="Reproducir palabra">▶ Escuchar</button>
        <div class="vocabulary-audio-options" data-audio-options></div>
        <div class="vocabulary-audio-feedback" aria-live="polite"></div>
      </div>`;

    const play = practiceContent.querySelector('[data-audio-play]');
    const options = practiceContent.querySelector('[data-audio-options]');
    const feedback = practiceContent.querySelector('.vocabulary-audio-feedback');
    const progress = practiceContent.querySelector('.vocabulary-audio-progress');

    function speakCurrent() {
      const entry = selected[index];
      if (window.Coqaudio && typeof window.Coqaudio.speak === 'function') {
        window.Coqaudio.speak(entry.word);
      } else if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(entry.word);
        utterance.lang = 'fr-FR';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    }

    function showQuestion() {
      const entry = selected[index];
      progress.textContent = `${index + 1} / ${selected.length}`;
      feedback.innerHTML = '';
      options.innerHTML = buildAudioOptions(entry, selected).map((option) => `
        <button type="button" class="vocabulary-audio-option" data-answer-id="${escapeHtml(option.id)}">
          ${displayWord(option)}
        </button>`).join('');
      options.querySelectorAll('[data-answer-id]').forEach((button) => {
        button.addEventListener('click', () => {
          if (button.disabled) return;
          const correct = button.dataset.answerId === entry.id;
          if (correct) correctCount += 1;
          options.querySelectorAll('button').forEach((item) => { item.disabled = true; });
          button.classList.add(correct ? 'correct' : 'wrong');
          if (!correct) {
            const right = options.querySelector(`[data-answer-id="${CSS.escape(entry.id)}"]`);
            if (right) right.classList.add('correct');
          }
          feedback.innerHTML = feedbackHtml(correct, entry.word);
          window.setTimeout(() => {
            index += 1;
            if (index >= selected.length) finish();
            else showQuestion();
          }, 850);
        });
      });
    }

    function finish() {
      practiceContent.querySelector('.vocabulary-audio-card').innerHTML = `
        <div class="vocabulary-exercise-final">
          <strong>Ejercicio terminado</strong>
          <p>Resultado: ${correctCount} / ${selected.length}</p>
          <button type="button" class="btn secondary" data-restart-exercise>Generar otras palabras</button>
        </div>`;
      bindRestartButton();
    }

    play.addEventListener('click', speakCurrent);
    showQuestion();
  }

  function renderPracticeSubcategory(item) {
    if (!item || item.type !== 'subcategory') return;

    const entries = getEntries(item);
    if (!entries.length) {
      exerciseTabs.classList.add('hidden');
      practiceContent.innerHTML = '<div class="vocabulary-practice-card"><strong>Sin vocabulario</strong><p>Esta subcategoría todavía no tiene palabras cargadas.</p></div>';
      return;
    }

    renderExerciseTabs();

    if (activeExercise === 'match') renderMatchExercise(entries);
    else if (activeExercise === 'write') renderWriteExercise(entries);
    else if (activeExercise === 'audio') renderAudioExercise(entries);
    else renderMatchExercise(entries);
  }

  function renderPractice(item) {
    if (item.type === 'category') {
      renderPracticeCategory(item);
      return;
    }

    if (item.type === 'subcategory') {
      renderPracticeSubcategory(item);
    }
  }

  function bindRestartButton() {
    const button = practiceContent.querySelector('[data-restart-exercise]');
    if (button) button.addEventListener('click', () => renderPracticeSubcategory(selectedItem));
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
          <strong>${item.data.emoji ? escapeHtml(item.data.emoji) + ' ' : ''}${escapeHtml(item.title)}</strong>
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
        const subcategories = topicsPanel.querySelector(`[data-subcategories-for="${CSS.escape(categoryId)}"]`);
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
