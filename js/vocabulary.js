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
      interjection: "interjección", interjeccion: "interjección",
      connector: "conector", connecteur: "conector", conector: "conector"
    };
    return aliases[valueNormalized] || "";
  }
  function inferPartOfSpeech(entry, source, sub) {
    const explicit = normalizePartOfSpeech(entry.partOfSpeech || entry.wordType || entry.grammaticalCategory || entry.pos || "");
    if (explicit) return explicit;

    const article = normalize(entry.articleFr || "").replace(/’/g, "'");
    if (/^(un|une|des|du|de la|de l'|l')$/.test(article)) return "sustantivo";

    const context = normalize([source.id, source.title, sub.id, sub.title].join(" "));
    if (source.id === "common-adverbs" || /\badverbs?\b|\badverbios?\b/.test(context)) return "adverbio";
    if (source.id === "connectors" || /\bconnectors?\b|\bconectores?\b/.test(context)) return "conector";

    const word = String(entry.word || "").trim();
    const translation = normalize(entry.translation || "");
    if (/\s/.test(word)) return "expresión";
    if (/[（(](masculino|femenino)[）)]/.test(translation) ||
        /\b(masculino|femenino)\b/.test(translation) ||
        /\b(adjetivo|adjective|adjectif)\b/.test(translation)) return "adjetivo";

    // Infinitives are detected using both the French form and the Spanish infinitive translation.
    const spanishInfinitive = /(?:^|\s)[^\s]+(?:ar|er|ir)(?:$|\s)/u.test(String(entry.translation || "").toLowerCase());
    const irregularVerbTranslations = /^(ser|estar|tener|hacer|poder|deber|querer|saber|poner|salir|venir|ver|ir|dar|decir|traer|conocer|vivir|morir|abrir|cubrir|escribir|describir|descubrir|ofrecer|recibir|seguir|dormir|sentir|pedir|servir|huir|oír|leer|reír|sonreír)$/iu.test(normalize(entry.translation || ""));
    if (!/\s/.test(word) && /^(se\s+)?[a-zà-ÿ]+(?:er|ir|re|oir)$/iu.test(word) && (spanishInfinitive || irregularVerbTranslations)) return "verbo";

    // Color names without an article are normally being used adjectivally in the color vocabulary.
    if (!/\s/.test(word) && /colou?r|couleur|colores|couleurs/.test(context)) return "adjetivo";

    const knownAdjectives = new Set([
      "beau","belle","bon","bonne","mauvais","mauvaise","grand","grande","petit","petite",
      "jeune","vieux","vieille","nouveau","nouvelle","noir","noire","blanc","blanche",
      "rouge","bleu","bleue","vert","verte","jaune","gris","grise","rose","violet","violette",
      "orange","marron","rapide","facile","difficile","important","importante","possible","impossible",
      "utile","pratique","cher","chère","content","contente","triste","fatigué","fatiguée",
      "heureux","heureuse","malheureux","malheureuse","actif","active","sportif","sportive",
      "enchanté","enchantée","ravi","ravie","désolé","désolée","sérieux","sérieuse"
    ]);
    if (!/\s/.test(word) && knownAdjectives.has(normalize(word))) return "adjetivo";

    // Adjectives with common French endings, only for single-word entries without noun articles.
    if (!/\s/.test(word) && /(?:eux|euse|if|ive|able|ible|el|elle|ien|ienne|ant|ante|ent|ente|al|ale|ique|iste|oire)$/iu.test(word)) {
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
        id: sub.id, name: sub.title, scene: sub.scene || null,
        words: sub.entries.map(entry => {
          const partOfSpeech = inferPartOfSpeech(entry, source, sub);
          return {
            id: entry.id, french: frenchLabel(entry), lemma: entry.word, spanish: entry.translation,
            articleFr: entry.articleFr || "", articleEs: entry.articleEs || "", genderVariants: entry.genderVariants || null, emoji: entry.emoji || "",
            partOfSpeech, pluralFr: entry.pluralFr || entry.plural || "",
            adjectiveForms: entry.adjectiveForms || null,
            adjectiveSpanishForms: entry.adjectiveSpanishForms || null,
            detailCategoryLabel: entry.detailCategoryLabel || '',
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
    const exceptionKey = Object.keys(adjectiveExceptions).find(candidate => normalize(candidate) === key);
    let feminine = "";
    if (exceptionKey) feminine = adjectiveExceptions[exceptionKey].feminine;
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
    const masculinePlural = (exceptionKey && adjectiveExceptions[exceptionKey].masculinePlural) || (/(?:s|x)$/iu.test(base) ? base : base + "s");
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
      const plural = nounPlural(word);
      if (word.genderVariants) {
        const variants = word.genderVariants;
        const genderCell = (label, variant) => `<div class="vocabulary-detail-cell"><span>${label}</span><strong>${escapeHTML(variant.article + " " + (variant.word || word.lemma))}</strong><small>${escapeHTML(variant.translation || "")}</small></div>`;
        const pluralCells = variants.masculine.plural === variants.feminine.plural
          ? `<div class="vocabulary-detail-cell"><span>Plural</span><strong>${escapeHTML("les " + variants.masculine.plural)}</strong></div>`
          : `<div class="vocabulary-detail-cell"><span>Plural masculino</span><strong>${escapeHTML("les " + variants.masculine.plural)}</strong></div><div class="vocabulary-detail-cell"><span>Plural femenino</span><strong>${escapeHTML("les " + variants.feminine.plural)}</strong></div>`;
        details = `<div class="vocabulary-detail-grid vocabulary-gender-variants">${genderCell("Masculino", variants.masculine)}${genderCell("Femenino", variants.feminine)}${pluralCells}</div>`;
      } else {
        const gender = normalizedArticle === "un" ? "masculino" : normalizedArticle === "une" ? "femenino" : "";
        const definedArticle = gender && /^[aeiouyàâäéèêëîïôöùûüÿ]/iu.test(word.lemma || "") ? "l’" : (gender === "masculino" ? "le" : gender === "femenino" ? "la" : "");
        const articleLabel = article && gender ? `${definedArticle} / ${article} (${gender})` : "";
        details = `<div class="vocabulary-detail-grid">${articleLabel ? `<div class="vocabulary-detail-cell"><span>Artículo</span><strong>${escapeHTML(articleLabel)}</strong></div>` : ""}${plural ? `<div class="vocabulary-detail-cell"><span>Plural</span><strong>${escapeHTML(plural)}</strong></div>` : ""}</div>`;
      }
    } else if (word.detailCategoryLabel && !word.adjectiveForms) {
      details = `<div class="vocabulary-detail-grid"><div class="vocabulary-detail-cell"><span>Categoría</span><strong>${escapeHTML(word.detailCategoryLabel)}</strong></div></div>`;
    } else if (type === "adjetivo" || word.adjectiveForms) {
      const forms = adjectiveInflections(word);
      const spanishForms = word.adjectiveSpanishForms || {};
      details = `<div class="vocabulary-detail-grid vocabulary-adjective-grid ${word.detailCategoryLabel ? "vocabulary-numeral-adjective-grid" : ""}">
        <div class="vocabulary-detail-cell ${word.detailCategoryLabel ? "vocabulary-numeral-category" : ""}"><span>Categoría</span><strong>${escapeHTML(word.detailCategoryLabel || "Adjetivo")}</strong></div>
        <div class="vocabulary-detail-cell"><span>Masculino singular</span><strong>${escapeHTML(forms.ms || "")}</strong><small>${escapeHTML(spanishForms.masculineSingular || "")}</small></div>
        <div class="vocabulary-detail-cell"><span>Femenino singular</span><strong>${escapeHTML(forms.fs || "No disponible")}</strong><small>${escapeHTML(spanishForms.feminineSingular || "")}</small></div>
        <div class="vocabulary-detail-cell"><span>Masculino plural</span><strong>${escapeHTML(forms.mp || "No disponible")}</strong><small>${escapeHTML(spanishForms.masculinePlural || "")}</small></div>
        <div class="vocabulary-detail-cell"><span>Femenino plural</span><strong>${escapeHTML(forms.fp || "No disponible")}</strong><small>${escapeHTML(spanishForms.femininePlural || "")}</small></div>
      </div>`;
    } else if (type === "verbo" || type === "adverbio") {
      details = `<div class="vocabulary-detail-grid"><div class="vocabulary-detail-cell"><span>Categoría</span><strong>${type === "verbo" ? "Verbo" : "Adverbio"}</strong></div><div class="vocabulary-detail-cell"><span>Variación</span><strong>Invariable</strong></div></div>`;
    } else {
      const typeLabel = type === "conector" ? "Conector" : type === "interjección" ? "Interjección" : type === "expresión" ? "Expresión" : "Palabra";
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
  function renderHouseScene(words) {
    const byId = new Map(words.map(word => [word.id, word]));
    // Coordenadas ajustadas a la fotografía nueva (1536 × 1024; viewBox 900 × 600).
    // Cada marcador se sitúa dentro del espacio que nombra.
    const hotspots = [
      {id:"house-home",x:120,y:95},          // Casa: estructura central
      {id:"house-apartment",x:785,y:95},      // Edificio del círculo superior derecho
      {id:"house-attic",x:455,y:110},         // Ático bajo el tejado
      {id:"house-bedroom",x:290,y:220},       // Dormitorio superior izquierdo
      {id:"house-bathroom",x:410,y:220},      // Cuarto de baño con bañera
      {id:"house-balcony",x:165,y:225},       // Balcón superior izquierdo
      {id:"house-room",x:660,y:220},          // Despacho / estancia superior derecha
      {id:"house-dining-room",x:625,y:365},   // Comedor inferior derecho
      {id:"house-living-room",x:295,y:365},   // Salón inferior izquierdo
      {id:"house-hallway",x:590,y:220},       // Distribuidor central
      {id:"house-kitchen",x:710,y:365},       // Cocina inferior derecha
      {id:"house-toilet",x:525,y:365},        // Aseo junto a la zona central
      {id:"house-entrance",x:390,y:390},      // Entrada principal
      {id:"house-terrace",x:95,y:365},        // Terraza exterior izquierda
      {id:"house-garage",x:815,y:365},        // Garaje derecho
      {id:"house-garden",x:260,y:555},        // Jardín delantero
      {id:"house-cellar",x:455,y:485},        // Sótano
      {id:"house-stairs",x:485,y:320}         // Escalera central
    ];    const selected = words.find(word => wordKey(word) === selectedWord);
    const selectedSpot = selected ? hotspots.find(spot => spot.id === selected.id) : null;
    const svgHotspots = hotspots.map((spot, index) => {
      const word = byId.get(spot.id);
      if (!word) return "";
      const active = selectedWord === wordKey(word);
      return '<g class="vocabulary-scene-hotspot ' + (active ? "is-selected" : "") +
        '" data-scene-word="' + escapeHTML(wordKey(word)) + '" role="button" tabindex="0" aria-label="' +
        escapeHTML(word.french + " — " + word.spanish) + '" aria-pressed="' + active + '">' +
        '<circle class="scene-marker-halo" cx="' + spot.x + '" cy="' + spot.y + '" r="17"></circle>' +
        '<circle class="scene-marker" cx="' + spot.x + '" cy="' + spot.y + '" r="12"></circle>' +
        '<text x="' + spot.x + '" y="' + (spot.y + 4) + '">' + (index + 1) + '</text></g>';
    }).join("");
    const sceneLegend = hotspots.map((spot, index) => {
      const word = byId.get(spot.id);
      if (!word) return "";
      const active = selectedWord === wordKey(word);
      return '<button type="button" class="vocabulary-scene-legend-item ' + (active ? "is-selected" : "") +
        '" data-scene-word="' + escapeHTML(wordKey(word)) + '" aria-pressed="' + active + '">' +
        '<span class="vocabulary-scene-legend-number">' + (index + 1) + '</span>' +
        '<span><strong>' + escapeHTML(word.french) + '</strong><small>' + escapeHTML(word.spanish) + '</small></span></button>';
    }).join("");
    const floatingCard = selected && selectedSpot
      ? '<div class="vocabulary-scene-popover" style="--scene-x:' + (selectedSpot.x / 900 * 100) + '%;--scene-y:' + (selectedSpot.y / 600 * 100) + '%" role="status">' +
        '<button type="button" class="vocabulary-scene-popover-close" data-scene-close aria-label="Cerrar ficha">×</button>' +
        detailMarkup(selected) + '</div>'
      : '<div class="vocabulary-scene-selection">Selecciona un número para consultar la palabra en francés y su traducción.</div>';
    return '<div class="vocabulary-scene-intro"><p>Selecciona un número de la imagen o una palabra de la columna.</p><span>18 espacios interactivos</span></div>' +
      '<div class="vocabulary-scene-layout"><div class="vocabulary-scene-visual">' +
      '<div class="vocabulary-house-scene">' +
      '<img class="vocabulary-house-image" src="assets/images/casa-interactiva-moderna.webp.png" alt="Casa moderna en corte con ático, dormitorio, baño, salón, comedor, cocina, sótano, garaje y jardín" width="1536" height="1024" loading="lazy" decoding="async">' +
      '<svg class="scene-hotspot-overlay" viewBox="0 0 900 600" preserveAspectRatio="none" role="group" aria-label="Zonas interactivas de la casa">' +
      svgHotspots + '</svg></div>' + floatingCard + '</div>' +
      '<aside class="vocabulary-scene-sidebar" aria-label="Vocabulario de la casa"><h3>Vocabulario <span>18 términos</span></h3><div class="vocabulary-scene-legend">' + sceneLegend + '</div></aside></div>';
  }

  function renderLivingRoomScene(words) {
    const byId = new Map(words.map(word => [word.id, word]));
    // Coordenadas sobre la imagen original «Salón moderno cálido con chimenea.png» (1671 × 941).
    // Cada punto se sitúa en el centro visual del objeto correspondiente.
    const hotspots = [
      {id:"house-living-sofa",x:300,y:565},
      {id:"house-living-armchair",x:1480,y:690},
      {id:"house-living-coffee-table",x:785,y:700},
      {id:"house-living-television",x:1060,y:370},
      {id:"house-living-remote",x:940,y:690},
      {id:"house-living-lamp",x:545,y:330},
      {id:"house-living-carpet",x:790,y:820},
      {id:"house-living-curtain",x:475,y:170},
      {id:"house-living-cushion",x:410,y:490},
      {id:"house-living-blanket",x:145,y:690},
      {id:"house-living-shelf",x:1480,y:255},
      {id:"house-living-bookcase",x:1460,y:405},
      {id:"house-living-furniture",x:1080,y:565},
      {id:"house-living-vase",x:810,y:600},
      {id:"house-living-plant",x:685,y:445},
      {id:"house-living-frame",x:745,y:260},
      {id:"house-living-wall-clock",x:1135,y:180},
      {id:"house-living-decoration",x:1550,y:420},
      {id:"house-living-fireplace",x:1550,y:570},
      {id:"house-living-fan",x:865,y:205},
      {id:"house-living-air-conditioning",x:1130,y:55},
      {id:"house-living-speaker",x:1265,y:460},
      {id:"house-living-outlet",x:1320,y:600},
      {id:"house-living-switch",x:600,y:370},
      {id:"house-living-window",x:245,y:240}
    ];
    const selected = words.find(word => wordKey(word) === selectedWord);
    const selectedSpot = selected ? hotspots.find(spot => spot.id === selected.id) : null;
    const svgHotspots = hotspots.map((spot,index) => {
      const word = byId.get(spot.id);
      if (!word) return "";
      const active = selectedWord === wordKey(word);
      return '<g class="vocabulary-scene-hotspot ' + (active ? "is-selected" : "") +
        '" data-scene-word="' + escapeHTML(wordKey(word)) + '" role="button" tabindex="0" aria-label="' +
        escapeHTML(word.french + " — " + word.spanish) + '" aria-pressed="' + active + '">' +
        '<circle class="scene-marker-halo" cx="' + spot.x + '" cy="' + spot.y + '" r="23"></circle>' +
        '<circle class="scene-marker" cx="' + spot.x + '" cy="' + spot.y + '" r="17"></circle>' +
        '<text x="' + spot.x + '" y="' + (spot.y + 6) + '" style="font-size:18px">' + (index + 1) + '</text></g>';
    }).join("");
    const sceneLegend = hotspots.map((spot,index) => {
      const word = byId.get(spot.id);
      if (!word) return "";
      const active = selectedWord === wordKey(word);
      return '<button type="button" class="vocabulary-scene-legend-item ' + (active ? "is-selected" : "") +
        '" data-scene-word="' + escapeHTML(wordKey(word)) + '" aria-pressed="' + active + '">' +
        '<span class="vocabulary-scene-legend-number">' + (index + 1) + '</span>' +
        '<span><strong>' + escapeHTML(word.french) + '</strong><small>' + escapeHTML(word.spanish) + '</small></span></button>';
    }).join("");
    const floatingCard = selected && selectedSpot
      ? '<div class="vocabulary-scene-popover" style="--scene-x:' + (selectedSpot.x / 1671 * 100) + '%;--scene-y:' + (selectedSpot.y / 941 * 100) + '%" role="status">' +
        '<button type="button" class="vocabulary-scene-popover-close" data-scene-close aria-label="Cerrar ficha">×</button>' +
        detailMarkup(selected) + '</div>'
      : '<div class="vocabulary-scene-selection">Selecciona un número para consultar la palabra en francés y su traducción.</div>';
    // El vocabulario incluye «ventilateur», que no aparece en la fotografía; se representa
    // con un pequeño ventilador vectorial en una zona libre de pared para mantener los 25 términos.
    const fanIllustration = '<g class="living-room-fan-illustration" aria-label="Ventilador ilustrado">' +
      '<circle cx="865" cy="205" r="25" fill="#f4f0e8" fill-opacity=".9" stroke="#705b48" stroke-width="4"/>' +
      '<circle cx="865" cy="205" r="6" fill="#705b48"/>' +
      '<path d="M865 199 C850 183 852 170 863 174 C875 178 871 192 868 200 Z M871 205 C889 193 900 199 895 210 C890 220 878 213 870 209 Z M862 211 C860 232 849 237 844 227 C840 216 853 210 861 207 Z" fill="#b88a55" stroke="#705b48" stroke-width="2"/>' +
      '<path d="M865 230 L865 263 M849 264 H881" stroke="#705b48" stroke-width="5" stroke-linecap="round"/></g>';
    return '<div class="vocabulary-scene-intro"><p>Selecciona un número de la imagen o una palabra de la columna.</p><span>25 términos interactivos</span></div>' +
      '<div class="vocabulary-scene-layout"><div class="vocabulary-scene-visual">' +
      '<div class="vocabulary-house-scene vocabulary-living-room-scene">' +
      '<img class="vocabulary-house-image" src="assets/images/Salón moderno cálido con chimenea.png" alt="Salón moderno y cálido con sofá, sillón, mesa, televisión, estanterías, chimenea y decoración" width="1671" height="941" loading="lazy" decoding="async">' +
      '<svg class="scene-hotspot-overlay" viewBox="0 0 1671 941" preserveAspectRatio="none" role="group" aria-label="Vocabulario interactivo del salón">' +
      fanIllustration + svgHotspots + '</svg></div>' + floatingCard + '</div>' +
      '<aside class="vocabulary-scene-sidebar" aria-label="Vocabulario del salón"><h3>Vocabulario <span>25 términos</span></h3><div class="vocabulary-scene-legend">' + sceneLegend + '</div></aside></div>';
  }

  function renderKitchenScene(words) {
    const byId = new Map(words.map(word => [word.id, word]));
    // Coordenadas sobre la imagen original (1648 × 1024). Marcadores 25 y 21 ajustados según indicaciones.
    const hotspots = [
      {id:"house-kitchen-refrigerator",x:145,y:275},{id:"house-kitchen-fridge",x:205,y:405},
      {id:"house-kitchen-freezer",x:150,y:610},{id:"house-kitchen-oven",x:930,y:520},
      {id:"house-kitchen-microwave",x:1140,y:340},{id:"house-kitchen-cooktop",x:895,y:425},
      {id:"house-kitchen-dishwasher",x:1195,y:590},{id:"house-kitchen-coffeemaker",x:360,y:365},
      {id:"house-kitchen-kettle",x:455,y:370},{id:"house-kitchen-toaster",x:555,y:375},
      {id:"house-kitchen-blender",x:675,y:365},{id:"house-kitchen-sink",x:1410,y:420},
      {id:"house-kitchen-faucet",x:1500,y:315},{id:"house-kitchen-trash-bin",x:1575,y:720},
      {id:"house-kitchen-saucepan",x:840,y:350},{id:"house-kitchen-frying-pan",x:980,y:365},
      {id:"house-kitchen-plate",x:355,y:735},{id:"house-kitchen-bowl",x:540,y:700},
      {id:"house-kitchen-glass",x:740,y:675},{id:"house-kitchen-cup",x:850,y:685},
      {id:"house-kitchen-knife",x:1100,y:770},{id:"house-kitchen-fork",x:620,y:800},
      {id:"house-kitchen-spoon",x:735,y:805},{id:"house-kitchen-spatula",x:575,y:535},
      {id:"house-kitchen-cutting-board",x:985,y:845}
    ];
    const selected = words.find(word => wordKey(word) === selectedWord);
    const selectedSpot = selected ? hotspots.find(spot => spot.id === selected.id) : null;
    const svgHotspots = hotspots.map((spot,index) => {
      const word = byId.get(spot.id);
      if (!word) return "";
      const active = selectedWord === wordKey(word);
      return '<g class="vocabulary-scene-hotspot ' + (active ? "is-selected" : "") +
        '" data-scene-word="' + escapeHTML(wordKey(word)) + '" role="button" tabindex="0" aria-label="' +
        escapeHTML(word.french + " — " + word.spanish) + '" aria-pressed="' + active + '">' +
        '<circle class="scene-marker-halo" cx="' + spot.x + '" cy="' + spot.y + '" r="23"></circle>' +
        '<circle class="scene-marker" cx="' + spot.x + '" cy="' + spot.y + '" r="17"></circle>' +
        '<text x="' + spot.x + '" y="' + (spot.y + 6) + '" style="font-size:18px">' + (index + 1) + '</text></g>';
    }).join("");
    const sceneLegend = hotspots.map((spot,index) => {
      const word = byId.get(spot.id);
      if (!word) return "";
      const active = selectedWord === wordKey(word);
      return '<button type="button" class="vocabulary-scene-legend-item ' + (active ? "is-selected" : "") +
        '" data-scene-word="' + escapeHTML(wordKey(word)) + '" aria-pressed="' + active + '">' +
        '<span class="vocabulary-scene-legend-number">' + (index + 1) + '</span>' +
        '<span><strong>' + escapeHTML(word.french) + '</strong><small>' + escapeHTML(word.spanish) + '</small></span></button>';
    }).join("");
    const floatingCard = selected && selectedSpot
      ? '<div class="vocabulary-scene-popover" style="--scene-x:' + (selectedSpot.x / 1648 * 100) + '%;--scene-y:' + (selectedSpot.y / 1024 * 100) + '%" role="status">' +
        '<button type="button" class="vocabulary-scene-popover-close" data-scene-close aria-label="Cerrar ficha">×</button>' +
        detailMarkup(selected) + '</div>'
      : '<div class="vocabulary-scene-selection">Selecciona un número para consultar la palabra en francés y su traducción.</div>';
    return '<div class="vocabulary-scene-intro"><p>Selecciona un número de la imagen o una palabra de la columna.</p><span>25 términos interactivos</span></div>' +
      '<div class="vocabulary-scene-layout"><div class="vocabulary-scene-visual">' +
      '<div class="vocabulary-house-scene vocabulary-kitchen-scene">' +
      '<img class="vocabulary-house-image" src="assets/images/Cocina-moderna-llena-de-detalles.png" alt="Cocina moderna con electrodomésticos, fregadero, utensilios, vajilla y cubiertos" width="1648" height="1024" loading="lazy" decoding="async">' +
      '<svg class="scene-hotspot-overlay" viewBox="0 0 1648 1024" preserveAspectRatio="none" role="group" aria-label="Vocabulario interactivo de la cocina">' +
      svgHotspots + '</svg></div>' + floatingCard + '</div>' +
      '<aside class="vocabulary-scene-sidebar" aria-label="Vocabulario de la cocina"><h3>Vocabulario <span>25 términos</span></h3><div class="vocabulary-scene-legend">' + sceneLegend + '</div></aside></div>';
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
    if (subcategory.scene === "house-cutaway") {
      const sceneHeading = `<div class="vocabulary-breadcrumb">Vocabulario <span>›</span> ${escapeHTML(category.name)} <span>›</span> <strong>${escapeHTML(subcategory.name)}</strong></div><div class="vocabulary-heading"><div><h2>${escapeHTML(subcategory.name)}</h2><p>Explora la casa y selecciona sus habitaciones y objetos.</p></div><span class="vocabulary-count">${words.length} elementos</span></div>`;
      return sceneHeading + renderHouseScene(words);
    }
    if (subcategory.scene === "kitchen-hotspots") {
      const sceneHeading = '<div class="vocabulary-breadcrumb">Vocabulario <span>›</span> ' + escapeHTML(category.name) + ' <span>›</span> <strong>' + escapeHTML(subcategory.name) + '</strong></div><div class="vocabulary-heading"><div><h2>' + escapeHTML(subcategory.name) + '</h2><p>Explora la cocina y selecciona sus electrodomésticos, utensilios y objetos.</p></div><span class="vocabulary-count">' + words.length + ' elementos</span></div>';
      return sceneHeading + renderKitchenScene(words);
    }
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
      if (event.target.closest("[data-scene-close]")) { selectedWord = null; render(); return; }
      const sceneWord = event.target.closest("[data-scene-word]");
      if (sceneWord) { selectedWord = selectedWord === sceneWord.dataset.sceneWord ? null : sceneWord.dataset.sceneWord; render(); return; }
      const card = event.target.closest("[data-word-card]");
      if (!card) return;
      selectedWord = selectedWord === card.dataset.wordCard ? null : card.dataset.wordCard;
      render();
    });
    $("vocabulary-learning-panel").addEventListener("keydown", event => {
      const sceneWord = event.target.closest("[data-scene-word]");
      if (sceneWord && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); selectedWord = selectedWord === sceneWord.dataset.sceneWord ? null : sceneWord.dataset.sceneWord; render(); return; }
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