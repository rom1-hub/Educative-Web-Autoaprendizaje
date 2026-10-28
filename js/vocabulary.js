/* COQ — Vocabulario: catálogo modular y búsqueda bilingüe */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const normalize = value => String(value ?? "").toLocaleLowerCase("fr").normalize("NFC").trim();
  let catalog = [];
  let selectedCategory = null, selectedSubcategory = null, selectedWord = null;

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
      code: source.title.split(/\s+/).slice(0, 2).map(part => part[0] || "").join("").toLocaleUpperCase("es"),
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
  const getCategory = () => catalog.find(item => item.id === selectedCategory) || catalog[0];
  const getSubcategory = () => {
    const category = getCategory();
    return category?.subcategories.find(item => item.id === selectedSubcategory) || category?.subcategories[0];
  };
  const allWords = () => catalog.flatMap(category => category.subcategories.flatMap(subcategory => subcategory.words));
  function renderCategories() {
    $("vocabulary-category-count").textContent = catalog.length + " temas";
    $("vocabulary-categories").innerHTML = catalog.map(item =>
      `<button type="button" class="vocabulary-category ${item.id === selectedCategory ? "is-active" : ""}" data-category="${escapeHTML(item.id)}" aria-pressed="${item.id === selectedCategory}"><span class="vocabulary-category-code">${escapeHTML(item.code)}</span><span>${escapeHTML(item.name)}</span></button>`
    ).join("");
  }
  function wordKey(word) { return [word.categoryId, word.subcategoryId, word.id].join("::"); }
  function detailMarkup(word) {
    if (!word) return "";
    const gender = word.articleFr === "un" ? "masculino" : word.articleFr === "une" ? "femenino" : "No disponible";
    return `<section class="vocabulary-detail" aria-label="Ficha de vocabulario">
      <div class="vocabulary-detail-head"><div><span class="eyebrow">Ficha de vocabulario</span><h3>${escapeHTML(word.french)}</h3><p>${escapeHTML(word.spanish)}</p></div><button type="button" class="button button-secondary" data-close-detail aria-label="Cerrar ficha">Cerrar ×</button></div>
      <div class="vocabulary-detail-grid">
        <div class="vocabulary-detail-cell"><span>Artículo francés</span><strong>${escapeHTML(word.articleFr || "No disponible")}</strong></div>
        <div class="vocabulary-detail-cell"><span>Artículo español</span><strong>${escapeHTML(word.articleEs || "No disponible")}</strong></div>
        <div class="vocabulary-detail-cell"><span>Género gramatical</span><strong>${escapeHTML(gender)}</strong></div>
        <div class="vocabulary-detail-cell"><span>Plural</span><strong>No disponible en la fuente</strong></div>
      </div>
      <p class="vocabulary-note">Categoría: ${escapeHTML(word.categoryName)} · Subcategoría: ${escapeHTML(word.subcategoryName)}.</p>
    </section>`;
  }
  function wordCard(word) {
    const key = wordKey(word);
    const initial = (word.lemma || word.french).replace(/^(?:le|la|l['’]|les|un|une)\s*/iu, "").trim().charAt(0).toLocaleUpperCase("fr") || "É";
    return `<div class="vocabulary-word-entry"><article class="vocabulary-word"><div class="vocabulary-word-main"><span class="vocabulary-word-initial" aria-hidden="true">${escapeHTML(word.emoji || initial)}</span><div class="vocabulary-word-text"><div class="vocabulary-word-french">${escapeHTML(word.french)}</div><div class="vocabulary-word-spanish">${escapeHTML(word.spanish)}</div></div></div><div class="vocabulary-word-actions"><button type="button" class="button button-secondary" data-word="${escapeHTML(key)}" aria-expanded="${selectedWord === key}" aria-label="Ver ficha de ${escapeHTML(word.french)}" style="min-height:2.15rem;padding:.25rem .65rem">${selectedWord === key ? "−" : "+"}</button></div></article>${selectedWord === key ? detailMarkup(word) : ""}</div>`;
  }
  function renderBrowse() {
    const category = getCategory(), subcategory = getSubcategory();
    if (!category || !subcategory) return '<div class="vocabulary-empty"><h3>No hay contenido disponible.</h3></div>';
    return `<div class="vocabulary-breadcrumb">Vocabulario <span>›</span> ${escapeHTML(category.name)} <span>›</span> <strong>${escapeHTML(subcategory.name)}</strong></div>
      <div class="vocabulary-heading"><div><h2>${escapeHTML(category.name)}</h2><p>Selecciona una subcategoría para consultar sus palabras.</p></div><span class="vocabulary-count">${category.subcategories.length} subcategorías</span></div>
      <div class="vocabulary-subcategories">${category.subcategories.map(item => `<button type="button" class="vocabulary-subcategory ${item.id === selectedSubcategory ? "is-active" : ""}" data-subcategory="${escapeHTML(item.id)}" aria-pressed="${item.id === selectedSubcategory}"><span>${escapeHTML(item.name)}</span><span aria-hidden="true">→</span></button>`).join("")}</div>
      <div class="vocabulary-section-heading"><h3>${escapeHTML(subcategory.name)}</h3><span>${subcategory.words.length} palabras</span></div>
      <div class="vocabulary-word-list">${subcategory.words.map(wordCard).join("")}</div>`;
  }
  function renderSearch(query) {
    const q = normalize(query);
    const results = allWords().filter(word => normalize(word.french).includes(q) || normalize(word.lemma).includes(q) || normalize(word.spanish).includes(q));
    $("vocabulary-status").textContent = results.length + " coincidencia(s)";
    if (!results.length) return `<div class="vocabulary-breadcrumb">Vocabulario <span>›</span> <strong>Resultados de búsqueda</strong></div><div class="vocabulary-empty"><h3>No encontramos coincidencias.</h3><p>Prueba otra palabra en francés o su traducción al español.</p></div>`;
    return `<div class="vocabulary-breadcrumb">Vocabulario <span>›</span> <strong>Resultados de búsqueda</strong></div><div class="vocabulary-heading"><div><h2>Resultados</h2><p>Coincidencias en francés y español para «${escapeHTML(query)}».</p></div><span class="vocabulary-count">${results.length} resultado(s)</span></div><div class="vocabulary-word-list">${results.map(wordCard).join("")}</div>`;
  }
  function render() {
    renderCategories();
    const query = $("vocabulary-search-input").value.trim();
    $("vocabulary-content").innerHTML = query ? renderSearch(query) : renderBrowse();
    if (!query && getCategory() && getSubcategory()) $("vocabulary-status").textContent = getCategory().name + " · " + getSubcategory().name;
  }
  async function init() {
    const api = window.COQ_VOCABULARY_DATABASE_API;
    if (!window.COQ_VOCABULARY_DATABASE || !api) throw new Error("No se ha cargado el registro de vocabulario.");
    const sources = await api.loadAll();
    catalog = sources.map(mapCategory);
    selectedCategory = catalog[0]?.id || null;
    selectedSubcategory = catalog[0]?.subcategories[0]?.id || null;
    $("vocabulary-categories").addEventListener("click", event => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      selectedCategory = button.dataset.category;
      selectedSubcategory = getCategory()?.subcategories[0]?.id || null;
      selectedWord = null;
      render();
    });
    $("vocabulary-content").addEventListener("click", event => {
      const subcategory = event.target.closest("[data-subcategory]");
      if (subcategory) { selectedSubcategory = subcategory.dataset.subcategory; selectedWord = null; render(); return; }
      const word = event.target.closest("[data-word]");
      if (word) { selectedWord = selectedWord === word.dataset.word ? null : word.dataset.word; render(); return; }
      if (event.target.closest("[data-close-detail]")) { selectedWord = null; render(); }
    });
    $("vocabulary-search-input").addEventListener("input", () => { selectedWord = null; render(); });
    $("vocabulary-clear").addEventListener("click", () => { $("vocabulary-search-input").value = ""; selectedWord = null; render(); $("vocabulary-search-input").focus(); });
    render();
  }
  init().catch(error => {
    console.error("Error al cargar el vocabulario:", error);
    $("vocabulary-status").textContent = "No se pudo cargar el catálogo";
    $("vocabulary-content").innerHTML = '<div class="vocabulary-empty"><h3>No se pudo cargar el vocabulario.</h3><p>Recarga la página. Si el problema continúa, revisaremos la carga de los módulos.</p></div>';
  });
})();
