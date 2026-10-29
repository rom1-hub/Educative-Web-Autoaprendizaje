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
  function normalizePartOfSpeech(value) {
    const valueNormalized = normalize(value).replace(/[._-]/g, " ");
    const aliases = {
      noun: "sustantivo", nom: "sustantivo", sustantivo: "sustantivo",
      verb: "verbo", verbe: "verbo", verbo: "verbo",
      adjective: "adjetivo", adjectif: "adjetivo", adjetivo: "adjetivo",
      adverb: "adverbio", adverbe: "adverbio", adverbio: "adverbio",
      expression: "expresión", phrase: "expresión", expresion: "expresión",
      connector: "conector", connecteur: "conector", conector: "conector"
    };
    return aliases[valueNormalized] || "";
  }
  function inferPartOfSpeech(entry, source, sub) {
    const explicit = normalizePartOfSpeech(entry.partOfSpeech || entry.wordType || entry.grammaticalCategory || entry.pos || "");
    if (explicit) return explicit;

    const article = normalize(entry.articleFr || "");
    if (/^(un|une|des|du|de la|de l')$/.test(article)) return "sustantivo";

    const context = normalize([source.id, source.title, sub.id, sub.title].join(" "));
    if (source.id === "common-adverbs" || /\badverbs?\b|\badverbios?\b/.test(context)) return "adverbio";
    if (source.id === "connectors" || /\bconnectors?\b|\bconectores?\b/.test(context)) return "conector";

    const word = String(entry.word || "").trim();
    const translation = normalize(entry.translation || "");
    if (/[（(](masculino|femenino)[）)]/.test(translation) ||
        /\b(masculino|femenino)\b/.test(translation) ||
        /\b(adjetivo|adjective|adjectif)\b/.test(translation)) return "adjetivo";

    // A standalone infinitive can be identified reliably from its form; multiword idioms remain expressions.
    if (!/\s/.test(word) && /^(se\s+)?[a-zà-ÿ]+(?:er|ir|re|oir)$/iu.test(word)) return "verbo";

    // Adjectives with common French endings, only for single-word entries without noun articles.
    if (!/\s/.test(word) && /(?:eux|euse|if|ive|able|ible|el|elle|ien|ienne|ant|ante|ent|ente|al|ale|ique|iste|oir|oire)$/iu.test(word)) {
      return "adjetivo";
    }
    // Multiword terms without a noun article are expressions, not presumed nouns.
    if (/\s/.test(word) || /[!?…]/.test(word)) return "expresión";
    return "palabra";
  }
  function mapCategory(source) {
    return {
      id: source.id, name: source.title,
      subcategories: source.subcategories.map(sub => ({
        id: sub.id, name: sub.title,
        words: sub.entries.map(entry => {
          const partOfSpeech = inferPartOfSpeech(entry, source, sub);
          return {
            id: entry.id, french: frenchLabel(entry), lemma: entry.word, spanish: entry.translation,
            articleFr: entry.articleFr || "", articleEs: entry.articleEs || "", emoji: entry.emoji || "",
            partOfSpeech, pluralFr: entry.pluralFr || entry.plural || "",
            adjectiveForms: entry.adjectiveForms || null,
            categoryId: source.id, categoryName: source.title, subcategoryId: sub.id, subcategoryName: sub.title
          };
        })
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
  const adjectiveExceptions = {
    heureux: { feminine: "heureuse", masculinePlural: "heureux" }, vieux: { feminine: "vieille", masculinePlural: "vieux" },
    nouveau: { feminine: "nouvelle", masculinePlural: "nouveaux" }, beau: { feminine: "belle", masculinePlural: "beaux" },
    fou: { feminine: "folle", masculinePlural: "fous" }, mou: { feminine: "molle", masculinePlural: "mous" },
    doux: { feminine: "douce", masculinePlural: "doux" }, faux: { feminine: "fausse", masculinePlural: "faux" },
    roux: { feminine: "rousse", masculinePlural: "roux" }, frais: { feminine: "fraîche", masculinePlural: "frais" },
    blanc: { feminine: "blanche" }, sec: { feminine: "sèche" }, public: { feminine: "publique" },
    long: { feminine: "longue" }, gentil: { feminine: "gentille" }, bon: { feminine: "bonne" },
    mignon: { feminine: "mignonne" }, ancien: { feminine: "ancienne" }, premier: { feminine: "première" },
    dernier: { feminine: "dernière" }, léger: { feminine: "légère" }, cher: { feminine: "chère" },
    fier: { feminine: "fière" }, cruel: { feminine: "cruelle" }, naturel: { feminine: "naturelle" },
    pareil: { feminine: "pareille" }, nul: { feminine: "nulle" }, actif: { feminine: "active" },
    sportif: { feminine: "sportive" }, sérieux: { feminine: "sérieuse" }, paresseux: { feminine: "paresseuse" },
    dangereux: { feminine: "dangereuse" }, enchanté: { feminine: "enchantée" }, ravi: { feminine: "ravie" },
    désolé: { feminine: "désolée" }, content: { feminine: "contente" }, heureux: { feminine: "heureuse", masculinePlural: "heureux" }
  };
  function adjectiveInflections(word) {
    if (word.adjectiveForms && typeof word.adjectiveForms === "object") {
      return {
        ms: word.adjectiveForms.masculineSingular || word.adjectiveForms.ms || word.lemma,
        fs: word.adjectiveForms.feminineSingular || word.adjectiveForms.fs || "",
        mp: word.adjectiveForms.masculinePlural || word.adjectiveForms.mp || "",
        fp: word.adjectiveForms.femininePlural || word.adjectiveForms.fp || ""
      };
    }
    let base = String(word.lemma || word.french || "").trim();
    const translation = normalize(word.spanish || "");
    if (/\bfemenino\b/.test(translation)) {
      const reverse = Object.entries(adjectiveExceptions).find(([, forms]) => normalize(forms.feminine) === normalize(base));
      if (reverse) base = reverse[0];
      else if (/ée$/iu.test(base)) base = base.slice(0, -1);
      else if (/ie$/iu.test(base)) base = base.slice(0, -1);
      else if (/e$/iu.test(base) && !/(?:euse|esse|ette|elle|nne)$/iu.test(base)) base = base.slice(0, -1);
    }
    const key = normalize(base);
    let feminine = "";
    if (adjectiveExceptions[key]) feminine = adjectiveExceptions[key].feminine;
    else if (/(?:e|ée|ie|ue|ée|ique|able|ible|iste)$/iu.test(base)) feminine = base;
    else if (/eux$/iu.test(base)) feminine = base.replace(/eux$/iu, "euse");
    else if (/if$/iu.test(base)) feminine = base.replace(/if$/iu, "ive");
    else if (/er$/iu.test(base)) feminine = base.replace(/er$/iu, "ère");
    else if (/el$/iu.test(base)) feminine = base + "le";
    else if (/en$/iu.test(base)) feminine = base + "ne";
    else if (/on$/iu.test(base)) feminine = base + "ne";
    else if (/et$/iu.test(base)) feminine = base + "te";
    else if (/f$/iu.test(base)) feminine = base.replace(/f$/iu, "ve");
    else if (/x$/iu.test(base)) feminine = base.replace(/x$/iu, "se");
    else feminine = base + "e";
    const masculinePlural = adjectiveExceptions[key]?.masculinePlural || (/(?:s|x)$/iu.test(base) ? base : base + "s");
    const femininePlural = /(?:s|x)$/iu.test(feminine) ? feminine : feminine + "s";
    return { ms: base, fs: feminine, mp: masculinePlural, fp: femininePlural };
  }
  function nounPlural(word) {
    if (word.pluralFr) return String(word.pluralFr).trim();
    const article = normalize(word.articleFr || "");
    const base = String(word.lemma || "").trim();
    if (!base || !/^(un|une|des)$/.test(article)) return "";
    if (/\s/.test(base)) return "";
    const irregular = {
      oeil: "yeux", œil: "yeux", ciel: "cieux", travail: "travaux", cheval: "chevaux",
      animal: "animaux", journal: "journaux", bijou: "bijoux", genou: "genoux", caillou: "cailloux",
      chou: "choux", hibou: "hiboux", joujou: "joujoux", pou: "poux"
    };
    const key = normalize(base);
    let plural = irregular[key] || "";
    if (!plural) {
      if (/(?:s|x|z)$/iu.test(base)) plural = base;
      else if (/(?:eau|au|eu)$/iu.test(base)) plural = base + "x";
      else if (/al$/iu.test(base) && !/^(bal|carnaval|festival|récital|régal)$/iu.test(base)) plural = base.replace(/al$/iu, "aux");
      else plural = base + "s";
    }
    return "les " + plural;
  }
  function detailMarkup(word) {
    const type = word.partOfSpeech || "palabra";
    let details = "";
    if (type === "sustantivo") {
      const article = String(word.articleFr || "").trim();
      const normalizedArticle = normalize(article);
      const gender = normalizedArticle === "un" ? "masculino" : normalizedArticle === "une" ? "femenino" : "";
      const definedArticle = gender && /^[aeiouyàâäéèêëîïôöùûüÿ]/iu.test(word.lemma || "") ? "l’" : (gender === "masculino" ? "le" : gender === "femenino" ? "la" : "");
      const articleLabel = article && gender ? `${definedArticle} / ${article} (${gender})` : "";
      const plural = nounPlural(word);
      details = `<div class="vocabulary-detail-grid">${articleLabel ? `<div class="vocabulary-detail-cell"><span>Artículo</span><strong>${escapeHTML(articleLabel)}</strong></div>` : ""}${plural ? `<div class="vocabulary-detail-cell"><span>Plural</span><strong>${escapeHTML(plural)}</strong></div>` : ""}</div>`;
    } else if (type === "adjetivo") {
      const forms = adjectiveInflections(word);
      details = `<div class="vocabulary-detail-grid vocabulary-adjective-grid">
        <div class="vocabulary-detail-cell"><span>Masculino singular</span><strong>${escapeHTML(forms.ms || "")}</strong></div>
        <div class="vocabulary-detail-cell"><span>Femenino singular</span><strong>${escapeHTML(forms.fs || "No disponible")}</strong></div>
        <div class="vocabulary-detail-cell"><span>Masculino plural</span><strong>${escapeHTML(forms.mp || "No disponible")}</strong></div>
        <div class="vocabulary-detail-cell"><span>Femenino plural</span><strong>${escapeHTML(forms.fp || "No disponible")}</strong></div>
      </div>`;
    } else if (type === "verbo" || type === "adverbio") {
      details = `<div class="vocabulary-detail-grid"><div class="vocabulary-detail-cell"><span>Categoría</span><strong>${type === "verbo" ? "Verbo" : "Adverbio"}</strong></div><div class="vocabulary-detail-cell"><span>Variación</span><strong>Invariable</strong></div></div>`;
    } else {
      const typeLabel = type === "conector" ? "Conector" : type === "expresión" ? "Expresión" : "Palabra";
      details = `<div class="vocabulary-detail-grid"><div class="vocabulary-detail-cell"><span>Categoría</span><strong>${typeLabel}</strong></div></div>`;
    }
    return `<section class="vocabulary-detail" aria-label="Ficha de vocabulario">
      <div class="vocabulary-detail-head"><div><span class="eyebrow">Ficha de vocabulario</span><h3>${escapeHTML(word.french)}</h3><p>${escapeHTML(word.spanish)}</p></div></div>
      ${details}
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