/* ==========================================================
   VOCABULARIO — búsqueda bilingüe y navegación por categorías
   Catálogo de ejemplo temporal; preparado para conectar la base canónica.
   ========================================================== */
(() => {
  "use strict";
  const catalog = [
    {id:"animales",name:"Animales",code:"AN",subcategories:[
      {id:"domesticos",name:"Animales domésticos",words:[["le chat","gato","A1","le","les chats"],["le chien","perro","A1","le","les chiens"],["le lapin","conejo","A1","le","les lapins"],["l'oiseau","pájaro","A1","l’","les oiseaux"]]},
      {id:"salvajes",name:"Animales salvajes",words:[["le lion","león","A2","le","les lions"],["la girafe","jirafa","A2","la","les girafes"]]},
      {id:"insectos",name:"Insectos",words:[["le papillon","mariposa","A1","le","les papillons"],["l'abeille","abeja","A2","l’","les abeilles"]]}
    ]},
    {id:"alimentacion",name:"Alimentación",code:"AL",subcategories:[
      {id:"frutas",name:"Frutas",words:[["la pomme","manzana","A1","la","les pommes"],["la fraise","fresa","A1","la","les fraises"]]},
      {id:"bebidas",name:"Bebidas",words:[["l'eau","agua","A1","l’","—"],["le lait","leche","A1","le","—"]]},
      {id:"comidas",name:"Comidas",words:[["le pain","pan","A1","le","les pains"]]}
    ]},
    {id:"casa",name:"Casa",code:"CA",subcategories:[
      {id:"vivienda",name:"Vivienda",words:[["la maison","casa","A1","la","les maisons"],["la chambre","habitación","A1","la","les chambres"]]},
      {id:"muebles",name:"Muebles",words:[["la chaise","silla","A1","la","les chaises"],["la table","mesa","A1","la","les tables"]]}
    ]},
    {id:"personas",name:"Personas",code:"PE",subcategories:[
      {id:"familia",name:"Familia",words:[["la mère","madre","A1","la","les mères"],["le père","padre","A1","le","les pères"]]},
      {id:"acciones",name:"Acciones",words:[["manger","comer","A1","—","—"],["parler","hablar","A1","—","—"]]}
    ]},
    {id:"transporte",name:"Transporte",code:"TR",subcategories:[
      {id:"vehiculos",name:"Vehículos",words:[["la voiture","coche","A1","la","les voitures"],["le train","tren","A1","le","les trains"]]}
    ]},
    {id:"naturaleza",name:"Naturaleza",code:"NA",subcategories:[
      {id:"paisajes",name:"Paisajes",words:[["la montagne","montaña","A2","la","les montagnes"],["la forêt","bosque","A2","la","les forêts"]]}
    ]}
  ];
  const $ = id => document.getElementById(id);
  let selectedCategory="animales", selectedSubcategory="domesticos", selectedWord=null;
  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const getCategory = () => catalog.find(item => item.id === selectedCategory) || catalog[0];
  const getSubcategory = () => getCategory().subcategories.find(item => item.id === selectedSubcategory) || getCategory().subcategories[0];
  const allWords = () => catalog.flatMap(category => category.subcategories.flatMap(subcategory => subcategory.words.map(word => ({
    french:word[0], spanish:word[1], level:word[2], article:word[3], plural:word[4],
    categoryId:category.id, categoryName:category.name, subcategoryId:subcategory.id, subcategoryName:subcategory.name
  }))));
  function renderCategories() {
    $("vocabulary-category-count").textContent = catalog.length + " temas";
    $("vocabulary-categories").innerHTML = catalog.map(item => `<button type="button" class="vocabulary-category ${item.id===selectedCategory?"is-active":""}" data-category="${item.id}" aria-pressed="${item.id===selectedCategory}"><span class="vocabulary-category-code">${item.code}</span><span>${escapeHTML(item.name)}</span></button>`).join("");
  }
  function wordCard(word) {
    const initial = word.french.replace(/^(le |la |l'|l’|les )/i,"").trim().charAt(0).toLocaleUpperCase("fr") || "É";
    return `<article class="vocabulary-word"><div class="vocabulary-word-main"><span class="vocabulary-word-initial" aria-hidden="true">${escapeHTML(initial)}</span><div class="vocabulary-word-text"><div class="vocabulary-word-french">${escapeHTML(word.french)}</div><div class="vocabulary-word-spanish">${escapeHTML(word.spanish)}</div></div></div><div class="vocabulary-word-actions"><span class="vocabulary-level">${escapeHTML(word.level)}</span><button type="button" class="button button-secondary" data-word="${escapeHTML(word.french)}" aria-label="Ver ficha de ${escapeHTML(word.french)}" style="min-height:2.15rem;padding:.25rem .65rem">+</button></div></article>`;
  }
  function detailMarkup() {
    const word = allWords().find(item => item.french === selectedWord);
    if (!word) return "";
    return `<section class="vocabulary-detail" aria-label="Ficha de vocabulario"><div class="vocabulary-detail-head"><div><span class="eyebrow">Ficha de vocabulario</span><h3>${escapeHTML(word.french)}</h3><p>${escapeHTML(word.spanish)}</p></div><button type="button" class="button button-secondary" data-close-detail aria-label="Cerrar ficha">Cerrar ×</button></div><div class="vocabulary-detail-grid"><div class="vocabulary-detail-cell"><span>Artículo</span><strong>${escapeHTML(word.article)}</strong></div><div class="vocabulary-detail-cell"><span>Plural</span><strong>${escapeHTML(word.plural)}</strong></div><div class="vocabulary-detail-cell"><span>Nivel</span><strong>${escapeHTML(word.level)}</strong></div></div><p class="vocabulary-note">Categoría: ${escapeHTML(word.categoryName)} · Subcategoría: ${escapeHTML(word.subcategoryName)}. Datos de demostración; el catálogo definitivo se integrará en una fase posterior.</p></section>`;
  }
  function renderBrowse() {
    const category = getCategory(), subcategory = getSubcategory();
    return `<div class="vocabulary-breadcrumb">Vocabulario <span>›</span> ${escapeHTML(category.name)} <span>›</span> <strong>${escapeHTML(subcategory.name)}</strong></div>
      <div class="vocabulary-heading"><div><h2>${escapeHTML(category.name)}</h2><p>Selecciona una subcategoría para consultar sus palabras.</p></div><span class="vocabulary-count">${category.subcategories.length} subcategorías</span></div>
      <div class="vocabulary-subcategories">${category.subcategories.map(item => `<button type="button" class="vocabulary-subcategory ${item.id===selectedSubcategory?"is-active":""}" data-subcategory="${item.id}" aria-pressed="${item.id===selectedSubcategory}"><span>${escapeHTML(item.name)}</span><span aria-hidden="true">→</span></button>`).join("")}</div>
      <div class="vocabulary-section-heading"><h3>${escapeHTML(subcategory.name)}</h3><span>${subcategory.words.length} palabras de ejemplo</span></div>
      <div class="vocabulary-word-list">${subcategory.words.map(word => wordCard({french:word[0],spanish:word[1],level:word[2]})).join("")}</div>${detailMarkup()}`;
  }
  function renderSearch(query) {
    const normalized = query.toLocaleLowerCase("fr").trim();
    const results = allWords().filter(word => word.french.toLocaleLowerCase("fr").includes(normalized) || word.spanish.toLocaleLowerCase("es").includes(normalized));
    $("vocabulary-status").textContent = results.length + " coincidencia(s)";
    if (!results.length) return `<div class="vocabulary-breadcrumb">Vocabulario <span>›</span> <strong>Resultados de búsqueda</strong></div><div class="vocabulary-empty"><h3>No encontramos coincidencias.</h3><p>Prueba otra palabra en francés o su traducción al español.</p></div>`;
    return `<div class="vocabulary-breadcrumb">Vocabulario <span>›</span> <strong>Resultados de búsqueda</strong></div><div class="vocabulary-heading"><div><h2>Resultados</h2><p>Coincidencias en francés y español para «${escapeHTML(query)}».</p></div><span class="vocabulary-count">${results.length} resultado(s)</span></div><div class="vocabulary-word-list">${results.map(wordCard).join("")}</div>${detailMarkup()}`;
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
    if (word) { selectedWord = word.dataset.word; render(); return; }
    if (event.target.closest("[data-close-detail]")) { selectedWord = null; render(); }
  });
  $("vocabulary-search-input").addEventListener("input", () => { selectedWord = null; render(); });
  $("vocabulary-clear").addEventListener("click", () => { $("vocabulary-search-input").value = ""; selectedWord = null; render(); $("vocabulary-search-input").focus(); });
  render();
})();