/* COQ — Ejercicios de vocabulario. Módulo independiente del navegador de palabras. */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const normalize = value => String(value ?? "").toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[’']/g, "'").trim().replace(/\s+/g, " ");
  const tabs = $("vocabulary-mode-tabs");
  const learningPanel = $("vocabulary-learning-panel");
  const practicePanel = $("vocabulary-practice-panel");
  const categorySelect = $("vocabulary-category-select");
  const subcategorySelect = $("vocabulary-subcategory-select");
  const searchInput = $("vocabulary-search-input");
  const searchArea = document.querySelector(".vocabulary-search-area");
  let categories = [];
  let exerciseType = null;
  let questions = [];
  let questionChoices = [];
  let questionIndex = 0;
  let score = 0;
  let selectedAnswer = "";
  let answerChecked = false;
  let finished = false;
  let lastWrittenAnswer = "";

  function frenchLabel(entry) {
    const article = String(entry.articleFr || "").trim();
    const word = String(entry.word || "").trim();
    if (!article) return word;
    if (!word) return article;
    if (/['’]$/.test(article)) return article + word;
    return article + " " + word;
  }
  function getCategory(id) { return categories.find(item => item.id === id) || categories[0]; }
  function getSubcategory(category, id) { return category?.subcategories.find(item => item.id === id) || category?.subcategories[0]; }
  function activeCategory() { return getCategory(categorySelect?.value); }
  function activeSubcategory() { const category = activeCategory(); return getSubcategory(category, subcategorySelect?.value); }
  function wordsForSelection() {
    return activeSubcategory()?.words || [];
  }

  function mapCategory(source) {
    return {
      id: source.id, title: source.title,
      subcategories: source.subcategories.map(sub => ({
        id: sub.id, title: sub.title,
        words: sub.entries.map(entry => ({
          id: entry.id, word: String(entry.word || ""), french: frenchLabel(entry),
          spanish: String(entry.translation || ""), emoji: entry.emoji || ""
        }))
      }))
    };
  }
  function switchMode(mode) {
    const practice = mode === "practice";
    $("vocabulary-learn-tab").classList.toggle("is-active", !practice);
    $("vocabulary-practice-tab").classList.toggle("is-active", practice);
    $("vocabulary-learn-tab").setAttribute("aria-selected", String(!practice));
    $("vocabulary-practice-tab").setAttribute("aria-selected", String(practice));
    learningPanel.hidden = practice;
    practicePanel.hidden = !practice;
    if (searchArea) searchArea.hidden = practice;
    if (practice) renderSetup();
  }
  function selectMarkup(id, label, options, selected) {
    return `<label class="vocabulary-practice-field"><span>${label}</span><select id="${id}">${options.map(option => `<option value="${escapeHTML(option.id)}" ${option.id === selected ? "selected" : ""}>${escapeHTML(option.title)}</option>`).join("")}</select></label>`;
  }
  function renderSetup() {
    if (!categories.length) return;
    const category = activeCategory();
    const subcategory = activeSubcategory();
    const available = wordsForSelection().length;
    practicePanel.innerHTML = `
      <div class="vocabulary-breadcrumb">Vocabulario <span>›</span> <strong>Practicar</strong></div>
      <div class="vocabulary-heading"><div><h2>Practicar vocabulario</h2><p>Elige un ejercicio para practicar las palabras de los filtros seleccionados.</p></div></div>
      <div class="vocabulary-practice-section-title"><h3>Elige un ejercicio</h3><p>${available} palabra(s) disponibles</p></div>
      <div class="vocabulary-exercise-options">
        <button type="button" class="vocabulary-exercise-option" data-exercise="match">
          <span class="vocabulary-exercise-number">01</span><span class="vocabulary-exercise-copy"><strong>Asociar palabras</strong><small>Elegir la palabra francesa que corresponde a la traducción española.</small></span><span class="vocabulary-exercise-arrow" aria-hidden="true">→</span>
        </button>
        <button type="button" class="vocabulary-exercise-option" data-exercise="write">
          <span class="vocabulary-exercise-number">02</span><span class="vocabulary-exercise-copy"><strong>Escribir en francés</strong><small>Recordar la palabra francesa a partir de su significado en español.</small></span><span class="vocabulary-exercise-arrow" aria-hidden="true">→</span>
        </button>
        <button type="button" class="vocabulary-exercise-option" data-exercise="audio">
          <span class="vocabulary-exercise-number">03</span><span class="vocabulary-exercise-copy"><strong>Escuchar y asociar</strong><small>Escuchar una palabra francesa y seleccionar su significado.</small></span><span class="vocabulary-exercise-arrow" aria-hidden="true">→</span>
        </button>
      </div>
      <p class="vocabulary-practice-note">Cada sesión contiene hasta 10 palabras distintas. El número de preguntas se adapta al vocabulario disponible.</p>`;
  }
  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
    return copy;
  }
  function startExercise(type) {
    const words = wordsForSelection();
    if (!words.length) {
      practicePanel.innerHTML = '<div class="vocabulary-empty"><h3>No hay palabras disponibles</h3><p>Elige otra subcategoría para practicar.</p><button type="button" class="button button-secondary" data-back-setup>Volver</button></div>';
      return;
    }
    exerciseType = type;
    questions = shuffle(words).slice(0, Math.min(10, words.length));
    questionIndex = 0; score = 0; selectedAnswer = ""; answerChecked = false; finished = false;
    questionChoices = questions.map(word => type === "write" ? [] : distractors(word));
    renderQuestion();
  }
  function distractors(correct) {
    const category = activeCategory();
    const pool = category.subcategories.flatMap(sub => sub.words).filter(word => word.id !== correct.id && normalize(word.french) !== normalize(correct.french));
    const selected = shuffle(pool).slice(0, 3);
    return shuffle([correct, ...selected]);
  }
  function renderQuestion() {
    if (questionIndex >= questions.length) { finished = true; renderResults(); return; }
    const word = questions[questionIndex];
    const progress = Math.round(questionIndex / questions.length * 100);
    const title = exerciseType === "write" ? "Escribe la palabra en francés" : exerciseType === "audio" ? "Escucha y elige la traducción" : "¿Qué palabra corresponde a esta traducción?";
    const prompt = exerciseType === "write" ? word.spanish : exerciseType === "audio" ? "Escucha la palabra francesa" : word.spanish;
    const choices = exerciseType === "write" ? [] : (questionChoices[questionIndex] || []);
    practicePanel.innerHTML = `
      <div class="vocabulary-breadcrumb"><button type="button" class="vocabulary-text-button" data-back-setup>← Cambiar ejercicio</button><span>›</span><strong>${escapeHTML(activeSubcategory()?.title || "")}</strong></div>
      <div class="vocabulary-practice-progress"><span>Pregunta ${questionIndex + 1} de ${questions.length}</span><span>${score} acierto(s)</span></div>
      <div class="vocabulary-practice-progress-track"><span style="width:${progress}%"></span></div>
      <section class="vocabulary-question-card">
        <span class="eyebrow">${title}</span>
        <h2>${escapeHTML(prompt)}</h2>
        ${exerciseType === "audio" ? '<button type="button" class="vocabulary-audio-button" data-play-audio><span aria-hidden="true">▶</span> Escuchar la palabra</button>' : ""}
        ${exerciseType === "write" ? '<label class="vocabulary-answer-field"><span>Tu respuesta en francés</span><input id="vocabulary-written-answer" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Escribe aquí…"></label>' : `<div class="vocabulary-answer-options">${choices.map((choice,index) => `<button type="button" class="vocabulary-answer-option ${selectedAnswer === choice.id ? "is-selected" : ""}" data-answer="${escapeHTML(choice.id)}" ${answerChecked ? "disabled" : ""}><span>${String.fromCharCode(65+index)}</span>${escapeHTML(exerciseType === "audio" ? choice.spanish : choice.french)}</button>`).join("")}</div>`}
        <div id="vocabulary-answer-feedback" class="vocabulary-answer-feedback" aria-live="polite">${feedbackMarkup(word)}</div>
        <div class="vocabulary-question-actions"><button type="button" class="button button-secondary" data-back-setup>Salir del ejercicio</button><button type="button" class="button button-primary" data-check-answer ${answerChecked ? "" : (exerciseType === "write" ? "" : !selectedAnswer ? "disabled" : "")}>${answerChecked ? (questionIndex === questions.length - 1 ? "Ver resultados" : "Siguiente pregunta") : "Comprobar respuesta"}</button></div>
      </section>`;
    if (exerciseType === "write") $("vocabulary-written-answer")?.focus();
  }
  function feedbackMarkup(word) {
    if (!answerChecked) return "";
    const correct = exerciseType === "write" ? normalize(lastWrittenAnswer) === normalize(word.word) || normalize(lastWrittenAnswer) === normalize(word.french) : selectedAnswer === word.id;
    return `<p class="${correct ? "is-correct" : "is-incorrect"}">${correct ? "Correcto." : `Respuesta correcta: <strong>${escapeHTML(word.french)}</strong> — ${escapeHTML(word.spanish)}.`}</p>`;
  }
  function isWrittenCorrect(word) {
    const input = $("vocabulary-written-answer");
    const value = normalize(input?.value);
    return value === normalize(word.word) || value === normalize(word.french);
  }
  function checkAnswer() {
    if (answerChecked) {
      questionIndex++; selectedAnswer = ""; answerChecked = false; renderQuestion(); return;
    }
    const word = questions[questionIndex];
    if (exerciseType === "write" && !$("vocabulary-written-answer")?.value.trim()) { $("vocabulary-written-answer")?.focus(); return; }
    if (exerciseType !== "write" && !selectedAnswer) return;
    lastWrittenAnswer = $("vocabulary-written-answer")?.value || "";
    answerChecked = true;
    if (exerciseType === "write" ? isWrittenCorrect(word) : selectedAnswer === word.id) score++;
    renderQuestion();
  }
  function renderResults() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    const percentage = Math.round(score / questions.length * 100);
    practicePanel.innerHTML = `
      <div class="vocabulary-breadcrumb">Vocabulario <span>›</span> <strong>Resultados</strong></div>
      <section class="vocabulary-results">
        <span class="eyebrow">Sesión completada</span><h2>Ejercicio terminado</h2>
        <div class="vocabulary-results-score">${score}<span>/ ${questions.length}</span></div>
        <p>${percentage}% de respuestas correctas</p>
        <div class="vocabulary-results-track"><span style="width:${percentage}%"></span></div>
        <div class="vocabulary-question-actions"><button type="button" class="button button-secondary" data-back-setup>Elegir otro ejercicio</button><button type="button" class="button button-primary" data-retry>Repetir ejercicio</button></div>
      </section>`;
  }
  function playCurrentAudio() {
    if (!("speechSynthesis" in window)) {
      const button = practicePanel.querySelector("[data-play-audio]");
      if (button) { button.disabled = true; button.textContent = "Audio no compatible con este navegador"; }
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(questions[questionIndex].word);
    utterance.lang = "fr-FR";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }
  tabs.addEventListener("click", event => {
    const button = event.target.closest("[role='tab']");
    if (!button) return;
    switchMode(button.id === "vocabulary-practice-tab" ? "practice" : "learn");
  });
  categorySelect.addEventListener("change", () => { if (practicePanel && !practicePanel.hidden) renderSetup(); });
  subcategorySelect.addEventListener("change", () => { if (practicePanel && !practicePanel.hidden) renderSetup(); });
  practicePanel.addEventListener("click", event => {
    const exercise = event.target.closest("[data-exercise]");
    if (exercise) { startExercise(exercise.dataset.exercise); return; }
    if (event.target.closest("[data-back-setup]")) { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); renderSetup(); return; }
    const answer = event.target.closest("[data-answer]");
    if (answer && !answerChecked) { selectedAnswer = answer.dataset.answer; renderQuestion(); return; }
    if (event.target.closest("[data-check-answer]")) { checkAnswer(); return; }
    if (event.target.closest("[data-play-audio]")) { playCurrentAudio(); return; }
    if (event.target.closest("[data-retry]")) { startExercise(exerciseType); }
  });
  practicePanel.addEventListener("keydown", event => {
    if (event.key === "Enter" && event.target.id === "vocabulary-written-answer" && !answerChecked) { event.preventDefault(); checkAnswer(); }
  });
  async function init() {
    const api = window.COQ_VOCABULARY_DATABASE_API;
    if (!api) throw new Error("No se ha cargado la base de vocabulario.");
    categories = (await api.loadAll()).map(mapCategory);
    renderSetup();
  }
  init().catch(error => {
    console.error("Error al preparar los ejercicios de vocabulario:", error);
    practicePanel.innerHTML = '<div class="vocabulary-empty"><h3>No se pudieron cargar los ejercicios.</h3><p>Recarga la página. Si el problema continúa, revisaremos la carga del catálogo.</p></div>';
  });
})();