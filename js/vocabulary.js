/* ==========================================================
   VOCABULARIO — búsqueda bilingüe y navegación por categorías
   Catálogo de ejemplo temporal; preparado para conectar la base canónica.
   ========================================================== */
(() => {
  "use strict";
  const catalog = [
    {id:"animales",name:"Animales",code:"AN",subcategories:[
      {id:"domesticos",name:"Animales domésticos",words:[["le chat","gato","le","un","masculino","les chats"],["le chien","perro","le","un","masculino","les chiens"],["le lapin","conejo","le","un","masculino","les lapins"],["l'oiseau","pájaro","l’","un","masculino","les oiseaux"]]},
      {id:"salvajes",name:"Animales salvajes",words:[["le lion","león","le","un","masculino","les lions"],["la girafe","jirafa","la","une","femenino","les girafes"]]},
      {id:"insectos",name:"Insectos",words:[["le papillon","mariposa","le","un","masculino","les papillons"],["l'abeille","abeja","l’","une","femenino","les abeilles"]]}
    ]},
    {id:"alimentacion",name:"Alimentación",code:"AL",subcategories:[
      {id:"frutas",name:"Frutas",words:[["la pomme","manzana","la","une","femenino","les pommes"],["la fraise","fresa","la","une","femenino","les fraises"]]},
      {id:"bebidas",name:"Bebidas",words:[["l'eau","agua","l’","une","femenino","—"],["le lait","leche","le","un","masculino","—"]]},
      {id:"comidas",name:"Comidas",words:[["le pain","pan","le","un","masculino","les pains"]]}
    ]},
    {id:"casa",name:"Casa",code:"CA",subcategories:[
      {id:"vivienda",name:"Vivienda",words:[["la maison","casa","la","une","femenino","les maisons"],["la chambre","habitación","la","une","femenino","les chambres"]]},
      {id:"muebles",name:"Muebles",words:[["la chaise","silla","la","une","femenino","les chaises"],["la table","mesa","la","une","femenino","les tables"]]}
    ]},
    {id:"personas",name:"Personas",code:"PE",subcategories:[
      {id:"familia",name:"Familia",words:[["la mère","madre","la","une","femenino","les mères"],["le père","padre","le","un","masculino","les pères"]]},
      {id:"acciones",name:"Acciones",words:[["manger","comer","—","—","—","—"],["parler","hablar","—","—","—","—"]]}
    ]},
    {id:"transporte",name:"Transporte",code:"TR",subcategories:[
      {id:"vehiculos",name:"Vehículos",words:[["la voiture","coche","la","une","femenino","les voitures"],["le train","tren","le","un","masculino","les trains"]]}
    ]},
    {id:"naturaleza",name:"Naturaleza",code:"NA",subcategories:[
      {id:"paisajes",name:"Paisajes",words:[["la montagne","montaña","la","une","femenino","les montagnes"],["la forêt","bosque","la","une","femenino","les forêts"]]}
    ]}
  ];
  // Una palabra puede aparecer en distintas categorías, pero no repetirse en subcategorías diferentes de una misma categoría.
  function validateCatalog() {
    for (const category of catalog) {
      const seen = new Set();
      for (const subcategory of category.subcategories) {
        for (const word of subcategory.words) {
          const lemma = word[0].toLocaleLowerCase("fr").replace(/^(?:le|la|les|l['’])\s*/u, "").normalize("NFC");
          if (seen.has(lemma)) throw new Error(`Vocabulario duplicado en "${category.name}": ${word[0]}`);
          seen.add(lemma);
        }
      }
    }
  }
  validateCatalog();

  const $ = id => document.getElementById(id);
  let selectedCategory="animales", selectedSubcategory="domesticos", selectedWord=null;
  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const getCategory = () => catalog.find(item => item.id === selectedCategory) || catalog[0];
  const getSubcategory = () => getCategory().subcategories.find(item => item.id === selectedSubcategory) || getCategory().subcategories[0];
  const allWords = () => catalog.flatMap(category => category.subcategories.flatMap(subcategory => subcategory.words.map(word => ({
    french:word[0], spanish:word[1], article:word[2], indefinite:word[3], gender:word[4], plural:word[5],
    categoryId:category.id, categoryName:category.name, subcategoryId:subcategory.id, subcategoryName:subcategory.name
  }))));
  function renderCategories() {
    $("vocabulary-category-count").textContent = catalog.length + " temas";
    $("vocabulary-categories").innerHTML = catalog.map(item => `<button type="button" class="vocabulary-category ${item.id===selectedCategory?"is-active":""}" data-category="${item.id}" aria-pressed="${item.id===selectedCategory}"><span class="vocabulary-category-code">${item.code}</span><span>${escapeHTML(item.name)}</span></button>`).join("");
  }
  function wordKey(word) {
    return [word.categoryId || selectedCategory, word.subcategoryId || selectedSubcategory, word.french].join("::");
  }
  function wordCard(word) {
    const key = wordKey(word);
    const initial = word.french.replace(/^(le |la |l'|l’|les )/i,"").trim().charAt(0).toLocaleUpperCase("fr") || "É";
    return `<div class="vocabulary-word-entry"><article class="vocabulary-word"><div class="vocabulary-word-main"><span class="vocabulary-word-initial" aria-hidden="true">${escapeHTML(initial)}</span><div class="vocabulary-word-text"><div class="vocabulary-word-french">${escapeHTML(word.french)}</div><div class="vocabulary-word-spanish">${escapeHTML(word.spanish)}</div></div></div><div class="vocabulary-word-actions"><button type="button" class="button button-secondary" data-word="${escapeHTML(key)}" aria-expanded="${selectedWord===key}" aria-label="Ver ficha de ${escapeHTML(word.french)}" style="min-height:2.15rem;padding:.25rem .65rem">${selectedWord===key ? "−" : "+"}</button></div></article>${selectedWord===key ? detailMarkup(word) : ""}</div>`;
  }
  function detailMarkup(word) {
    if (!word) return "";
    return `<section class="vocabulary-detail" aria-label="Ficha de vocabulario"><div class="vocabulary-detail-head"><div><span class="eyebrow">Ficha de vocabulario</span><h3>${escapeHTML(word.french)}</h3><p>${escapeHTML(word.spanish)}</p></div><button type="button" class="button button-secondary" data-close-detail aria-label="Cerrar ficha">Cerrar ×</button></div><div class="vocabulary-detail-grid"><div class="vocabulary-detail-cell"><span>Artículo</span><strong>${escapeHTML(word.article === "—" ? "No aplica" : word.article + " / " + word.indefinite + " (" + word.gender + ")")}</strong></div><div class="vocabulary-detail-cell"><span>Plural</span><strong>${escapeHTML(word.plural)}</strong></div></div><p class="vocabulary-note">Categoría: ${escapeHTML(word.categoryName)} · Subcategoría: ${escapeHTML(word.subcategoryName)}. Datos de demostración; el catálogo definitivo se integrará en una fase posterior.</p></section>`;
  }
  function renderBrowse() {
    const category = getCategory(), subcategory = getSubcategory();
    return `<div class="vocabulary-breadcrumb">Vocabulario <span>›</span> ${escapeHTML(category.name)} <span>›</span> <strong>${escapeHTML(subcategory.name)}</strong></div>
      <div class="vocabulary-heading"><div><h2>${escapeHTML(category.name)}</h2><p>Selecciona una subcategoría para consultar sus palabras.</p></div><span class="vocabulary-count">${category.subcategories.length} subcategorías</span></div>
      <div class="vocabulary-subcategories">${category.subcategories.map(item => `<button type="button" class="vocabulary-subcategory ${item.id===selectedSubcategory?"is-active":""}" data-subcategory="${item.id}" aria-pressed="${item.id===selectedSubcategory}"><span>${escapeHTML(item.name)}</span><span aria-hidden="true">→</span></button>`).join("")}</div>
      <div class="vocabulary-section-heading"><h3>${escapeHTML(subcategory.name)}</h3><span>${subcategory.words.length} palabras de ejemplo</span></div>
      <div class="vocabulary-word-list">${subcategory.words.map(word => wordCard({french:word[0],spanish:word[1],article:word[2],indefinite:word[3],gender:word[4],plural:word[5],categoryId:category.id,categoryName:category.name,subcategoryId:subcategory.id,subcategoryName:subcategory.name})).join("")}</div>`;
  }
  function renderSearch(query) {
    const normalized = query.toLocaleLowerCase("fr").trim();
    const results = allWords().filter(word => word.french.toLocaleLowerCase("fr").includes(normalized) || word.spanish.toLocaleLowerCase("es").includes(normalized));
    $("vocabulary-status").textContent = results.length + " coincidencia(s)";
    if (!results.length) return `<div class="vocabulary-breadcrumb">Vocabulario <span>›</span> <strong>Resultados de búsqueda</strong></div><div class="vocabulary-empty"><h3>No encontramos coincidencias.</h3><p>Prueba otra palabra en francés o su traducción al español.</p></div>`;
    return `<div class="vocabulary-breadcrumb">Vocabulario <span>›</span> <strong>Resultados de búsqueda</strong></div><div class="vocabulary-heading"><div><h2>Resultados</h2><p>Coincidencias en francés y español para «${escapeHTML(query)}».</p></div><span class="vocabulary-count">${results.length} resultado(s)</span></div><div class="vocabulary-word-list">${results.map(wordCard).join("")}</div>`;
  }
  function render() {
    renderCategories();
    const query = $("vocabulary-search-input").value.trim();
    $("vocabulary-content").innerHTML = query ? renderSearch(query) : renderBrowse();
    if (!query) $("vocabulary-status").textContent = getCategory().name + " · " + getSubcategory().name;
  }
  $("vocabulary-categories").addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    selectedCategory = button.dataset.category;
    selectedSubcategory = getCategory().subcategories[0].id;
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
})();