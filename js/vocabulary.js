/* COQ — Vocabulario: catálogo, filtros compartidos y búsqueda bilingüe */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const normalize = value => String(value ?? "").toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const normalizeExactTerm = value => String(value ?? "").trim().normalize("NFC").toLocaleLowerCase("fr");
  let catalog = [], selectedWord = null;

  function frenchLabel(entry) {
    const article = String(entry.articleFr || "").trim();
    const word = String(entry.word || "").trim();
    if (!article) return word;
    if (!word) return article;
    if (/['’]$/.test(article)) return article + word;
    return article + " " + word;
  }
  function mapCategory(source) {
    return {
      id: source.id, name: source.title,
      subcategories: source.subcategories.map(sub => ({
        id: sub.id, name: sub.title,
        words: sub.entries.map(entry => ({
          id: entry.id, french: frenchLabel(entry), lemma: entry.word, spanish: entry.translation,
          articleFr: entry.articleFr || "", articleEs: entry.articleEs || "", emoji: entry.emoji || "",
          categoryId: source.id, categoryName: source.title, subcategoryId: sub.id, subcategoryName: sub.title
        }))
      }))
    };
  }
  const getCategory = () => catalog.find(item => item.id === $("vocabulary-category-select").value);
  const getSubcategory = () => getCategory()?.subcategories.find(item => item.id === $("vocabulary-subcategory-select").value);
  const allWords = () => catalog.flatMap(category => category.subcategories.flatMap(subcategory => subcategory.words));
  const selectedWords = () => getSubcategory()?.words || [];

  function populateCategorySelect() {
    const select = $("vocabulary-category-select");
    select.innerHTML = '<option value="" disabled selected>Selecciona una categoría</option>' + catalog.map(item =>
      `<option value="${escapeHTML(item.id)}">${escapeHTML(item.name)}</option>`
    ).join("");
    select.value = "";
    populateSubcategorySelect();
  }
  function populateSubcategorySelect() {
    const category = getCategory();
    const select = $("vocabulary-subcategory-select");
    select.innerHTML = category
      ? '<option value="" disabled selected>Selecciona una subcategoría</option>' + category.subcategories.map(item =>
          `<option value="${escapeHTML(item.id)}">${escapeHTML(item.name)}</option>`
        ).join("")
      : '<option value="" disabled selected>Selecciona una subcategoría</option>';
    select.disabled = !category || !category.subcategories.length;
    select.value = "";
    selectedWord = null;
  }
  function wordKey(word) { return [word.categoryId, word.subcategoryId, word.id].join("::"); }
  function detailMarkup(word) {
    const article = String(word.articleFr || "").trim();
    const gender = article === "un" ? "masculino" : article === "une" ? "femenino" : "";
    const definedArticle = gender && /^[aeiouyàâäéèêëîïôöùûüÿ]/iu.test(word.lemma || "") ? "l’" : (article === "un" ? "le" : article === "une" ? "la" : "");
    const articleLabel = definedArticle && article ? `${definedArticle} / ${article} (${gender})` : "No disponible en la fuente";
    return `<section class="vocabulary-detail" aria-label="Ficha de vocabulario">
      <div class="vocabulary-detail-head"><div><span class="eyebrow">Ficha de vocabulario</span><h3>${escapeHTML(word.french)}</h3><p>${escapeHTML(word.spanish)}</p></div></div>
      <div class="vocabulary-detail-grid"><div class="vocabulary-detail-cell"><span>Artículo</span><strong>${escapeHTML(articleLabel)}</strong></div><div class="vocabulary-detail-cell"><span>Plural</span><strong>No disponible en la fuente</strong></div></div>
    </section>`;
  }
  function wordCard(word) {
    const key = wordKey(word);
    const initial = (word.lemma || word.french).replace(/^(?:le|la|l['’]|les|un|une)\s*/iu, "").trim().charAt(0).toLocaleUpperCase("fr") || "É";
    return `<div class="vocabulary-word-entry"><article class="vocabulary-word ${selectedWord === key ? "is-expanded" : ""}" data-word-card="${escapeHTML(key)}" tabindex="0" role="button" aria-expanded="${selectedWord === key}" aria-label="Abrir o cerrar ficha de ${escapeHTML(word.french)}"><div class="vocabulary-word-main"><span class="vocabulary-word-initial" aria-hidden="true">${escapeHTML(word.emoji || initial)}</span><div class="vocabulary-word-text"><div class="vocabulary-word-french">${escapeHTML(word.french)}</div><div class="vocabulary-word-spanish">${escapeHTML(word.spanish)}</div></div></div><div class="vocabulary-word-actions"><span class="vocabulary-expand-indicator" aria-hidden="true">${selectedWord === key ? "−" : "+"}</span></div></article>${selectedWord === key ? detailMarkup(word) : ""}</div>`;
  }
  function renderBrowse() {
    const category = getCategory(), subcategory = getSubcategory();
    const query = $("vocabulary-search-input").value.trim();
    const q = normalize(query);

    // Una búsqueda activa recorre todo el catálogo y elimina solo términos franceses exactos repetidos.
    if (query) {
      const seenTerms = new Set();
      const words = allWords().filter(word => {
        const matches = normalize(word.french).includes(q) ||
          normalize(word.lemma).includes(q) ||
          normalize(word.spanish).includes(q);
        if (!matches) return false;
        const key = normalizeExactTerm(word.french);
        if (seenTerms.has(key)) return false;
        seenTerms.add(key);
        return true;
      });
      $("vocabulary-status").textContent = words.length + " coincidencia(s)";
      const heading = `<div class="vocabulary-breadcrumb">Vocabulario <span>›</span> <strong>Resultados de búsqueda</strong></div><div class="vocabulary-heading"><div><h2>Resultados de búsqueda</h2><p>Coincidencias en francés y español para «${escapeHTML(query)}».</p></div><span class="vocabulary-count">${words.length} resultado(s)</span></div>`;
      if (!words.length) return heading + '<div class="vocabulary-empty"><h3>No encontramos coincidencias.</h3><p>Prueba otra palabra o cambia los filtros.</p></div>';
      return heading + `<div class="vocabulary-word-list">${words.map(wordCard).join("")}</div>`;
    }

    if (!category || !subcategory) {
      $("vocabulary-status").textContent = "Explorando categorías";
      return '<div class="vocabulary-empty"><h3>Selecciona una categoría y una subcategoría.</h3><p>Los términos aparecerán aquí. También puedes buscar una palabra en francés o español.</p></div>';
    }

    const words = selectedWords();
    $("vocabulary-status").textContent = category.name + " · " + subcategory.name;
    const heading = `<div class="vocabulary-breadcrumb">Vocabulario <span>›</span> ${escapeHTML(category.name)} <span>›</span> <strong>${escapeHTML(subcategory.name)}</strong></div><div class="vocabulary-heading"><div><h2>${escapeHTML(subcategory.name)}</h2><p>Selecciona una palabra para consultar su ficha.</p></div><span class="vocabulary-count">${words.length} palabra(s)</span></div>`;
    if (!words.length) return heading + '<div class="vocabulary-empty"><h3>No encontramos palabras en esta subcategoría.</h3><p>Prueba otra subcategoría.</p></div>';
    return heading + `<div class="vocabulary-word-list">${words.map(wordCard).join("")}</div>`;
  }
  function render() { $("vocabulary-learning-panel").innerHTML = renderBrowse(); }
  async function init() {
    const api = window.COQ_VOCABULARY_DATABASE_API;
    if (!window.COQ_VOCABULARY_DATABASE || !api) throw new Error("No se ha cargado el registro de vocabulario.");
    catalog = (await api.loadAll()).map(mapCategory);
    populateCategorySelect();
    $("vocabulary-category-select").addEventListener("change", () => { populateSubcategorySelect(); render(); });
    $("vocabulary-subcategory-select").addEventListener("change", () => { selectedWord = null; render(); });
    $("vocabulary-reset-filters").addEventListener("click", () => {
      $("vocabulary-search-input").value = "";
      $("vocabulary-category-select").value = "";
      populateSubcategorySelect();
      selectedWord = null;
      render();
      $("vocabulary-status").textContent = "Explorando categorías";
    });
    $("vocabulary-learning-panel").addEventListener("click", event => {
      const card = event.target.closest("[data-word-card]");
      if (!card) return;
      selectedWord = selectedWord === card.dataset.wordCard ? null : card.dataset.wordCard;
      render();
    });
    $("vocabulary-learning-panel").addEventListener("keydown", event => {
      const card = event.target.closest("[data-word-card]");
      if (!card || (event.key !== "Enter" && event.key !== " ")) return;
      event.preventDefault();
      selectedWord = selectedWord === card.dataset.wordCard ? null : card.dataset.wordCard;
      render();
    });
    $("vocabulary-search-input").addEventListener("input", () => { selectedWord = null; render(); });
    $("vocabulary-clear").addEventListener("click", () => { $("vocabulary-search-input").value = ""; selectedWord = null; render(); $("vocabulary-search-input").focus(); });
    render();
  }
  init().catch(error => {
    console.error("Error al cargar el vocabulario:", error);
    $("vocabulary-status").textContent = "No se pudo cargar el catálogo";
    $("vocabulary-learning-panel").innerHTML = '<div class="vocabulary-empty"><h3>No se pudo cargar el vocabulario.</h3><p>Recarga la página. Si el problema continúa, revisaremos la carga de los módulos.</p></div>';
  });
})();