/* ==========================================================
   CONJUGACIÓN — COMPORTAMIENTO DE LA INTERFAZ
   La generación de conjugaciones se delega al motor canónico.
   Contrato previsto: window.COQ_VERBS + motor de conjugación.
   ========================================================== */
(() => {
  "use strict";
  const tabs = [...document.querySelectorAll("[data-tab]")];
  const panels = [...document.querySelectorAll("[data-panel]")];
  const lookupResults = document.getElementById("lookup-results");
  const practiceResults = document.getElementById("practice-results");
  const resultPanels = [...document.querySelectorAll("[data-results-for]")];
  const lookupForm = document.getElementById("lookup-form");
  const practiceForm = document.getElementById("practice-form");
  if (!tabs.length || !lookupResults || !practiceResults || !lookupForm || !practiceForm) return;

  let activeTab = "lookup";
  let lockedVerbProfile = null;

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));

  function setTab(name) {
    activeTab = name;
    tabs.forEach(tab => {
      const active = tab.dataset.tab === name;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => { panel.hidden = panel.dataset.panel !== name; });
    resultPanels.forEach(panel => { panel.hidden = panel.dataset.resultsFor !== name; });
  }

  // Patrón de pestañas accesible: flechas, Inicio y Fin cambian el foco y el panel.
  tabs.forEach((tab, index) => {
    tab.addEventListener("keydown", event => {
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      const nextTab = tabs[nextIndex];
      setTab(nextTab.dataset.tab);
      nextTab.focus();
    });
  });

  function showMessage(message, isError = false, target = (activeTab === "lookup" ? lookupResults : practiceResults)) {
    target.innerHTML = '<p class="results-message' + (isError ? ' is-error' : '') + '" role="status">' + esc(message) + '</p>';
  }
  const showLookupMessage = (message, isError = false) => showMessage(message, isError, lookupResults);
  const showPracticeMessage = (message, isError = false) => showMessage(message, isError, practiceResults);

  function normalizeInfinitive(value) {
    return String(value ?? "")
      .trim()
      .toLocaleLowerCase("fr")
      .replace(/[’]/g, "'")
      .replace(/\s+/g, " ");
  }

  // Auxiliares con prioridad de être en el motor de práctica Python.
  // Estos verbos no deben clasificarse como regulares del primer grupo solo por terminar en -er.
  const PRACTICE_ETRE_PRIORITY_VERBS = new Set([
    "entrer", "monter", "descendre", "passer", "sortir", "retourner", "arriver"
  ]);

  function isPracticeEtrePriorityVerb(value) {
    const lemma = typeof value === "object" ? getBaseInfinitive(value) : value;
    return PRACTICE_ETRE_PRIORITY_VERBS.has(normalizeInfinitive(lemma));
  }

  function getPracticeAuxiliary(verb, profile) {
    if (isPracticeEtrePriorityVerb(verb)) return "etre";
    if (!profile.pronominal && !verb?.pronominal && getVerbGroup(verb) === 2) return "avoir";
    return profile.auxiliary || profile.auxiliaire || "";
  }

  function findVerb(raw) {
    const database = window.COQ_VERBS;

    const input = normalizeInfinitive(raw);
    const pronominal = /^(?:se\s+|s')/.test(input);
    const pronominalDatabase = window.COQ_PRONOMINAL_VERBS;
    const pronominalRecords = pronominalDatabase && typeof pronominalDatabase === "object"
      ? Object.values(pronominalDatabase)
      : [];
    const pronominalRecord = pronominal
      ? pronominalRecords.find(record => normalizeInfinitive(record?.infinitif) === input)
      : null;

    // Para los pronominales, buscar el verbo base usando el registro específico.
    // Esto también cubre formas como "s'en aller", cuyo verbo base es "aller".
    const baseKey = pronominalRecord
      ? normalizeInfinitive(pronominalRecord.formeNonPronominale || pronominalRecord.infinitifBase)
      : input.replace(/^se\s+/, "").replace(/^s'/, "");
    const fallbackKey = input.replace(/^se\s+/, "").replace(/^s'/, "");
    if (!database && !window.COQ_IMPERSONAL_VERBS) return null;

    // Los registros complementarios tienen prioridad para los verbos
    // impersonales incorporados fuera del catálogo general.
    const impersonalRecords = window.COQ_IMPERSONAL_VERBS;
    if (!pronominal && impersonalRecords && impersonalRecords[baseKey]) {
      return impersonalRecords[baseKey];
    }

    let verb = null;
    if (Array.isArray(database)) {
      verb = database.find(v =>
        [v.lemma, v.infinitive, v.infinitif, v.verb]
          .some(value => [baseKey, fallbackKey].includes(normalizeInfinitive(value)))
      ) || null;
    } else {
      verb = database?.[baseKey] || database?.[fallbackKey] ||
        Object.values(database || {}).find(v =>
          [v?.lemma, v?.infinitive, v?.infinitif, v?.verb]
            .some(value => [baseKey, fallbackKey].includes(normalizeInfinitive(value)))
        ) || null;
    }

    if (!verb || !pronominal) return verb;

    // La base pronominale aporta los metadatos gramaticales específicos;
    // las formas conjugadas continúan procediendo de la base general.
    return {
      ...verb,
      ...(pronominalRecord || {}),
      pronominal: true,
      infinitif: pronominalRecord?.infinitif || input
    };
  }

  function getEngine() {
    return window.COQ_CONJUGATION_ENGINE || window.CoQConjugationEngine || window.conjugationEngine || null;
  }

  function getForms(verb, tense) {
    const lookupEngine = window.COQ_LOOKUP_ENGINE;
    if (lookupEngine && typeof lookupEngine.conjugate === "function") {
      return lookupEngine.conjugate(verb, tense);
    }
    const engine = getEngine();
    if (engine) {
      const fn = engine.conjugate || engine.getConjugation || engine.conjugateVerb;
      if (typeof fn === "function") {
        const result = fn.call(engine, verb, tense);
        if (result && typeof result.then === "function") return result;
        return result;
      }
    }
    const stored = verb?.conjugations || verb?.forms || verb?.tenses;
    if (stored) {
      if (tense === "all") return stored;
      const aliases = {present:"present",imparfait:"imparfait","passe-compose":"passeCompose","futur-simple":"futurSimple"};
      return stored[tense] || stored[aliases[tense]] || null;
    }
    return null;
  }

  function getBaseInfinitive(verb) {
    return normalizeInfinitive(
      verb?.infinitifBase || verb?.infinitif_base || verb?.verbeBase ||
      verb?.lemma || verb?.infinitive || verb?.infinitif || verb?.verb || ""
    ).replace(/^se\s+/, "").replace(/^s'/, "");
  }

  function getPresentPluralForm(verb) {
    const present = verb?.formes?.["présent de l'indicatif"];
    if (!Array.isArray(present)) return "";
    const nousEntry = present.find(entry =>
      Array.isArray(entry) && normalizeInfinitive(entry[0]) === "nous"
    );
    const raw = nousEntry ? nousEntry[1] : present[3];
    if (Array.isArray(raw)) return String(raw[1] ?? raw[raw.length - 1] ?? "").trim();
    return String(raw ?? "").trim().replace(/^nous\s+/i, "");
  }

  function getPresentParticiple(verb) {
    const explicit = verb?.participePresent || verb?.participePrésent || verb?.participe_present;
    if (explicit) return String(explicit).trim();
    const base = getBaseInfinitive(verb);
    const irregular = { "être": "étant", "avoir": "ayant", "savoir": "sachant" };
    if (irregular[base]) return irregular[base];
    const nousForm = getPresentPluralForm(verb);
    return /ons$/i.test(nousForm) ? nousForm.slice(0, -3) + "ant" : "";
  }

  function getVerbGroup(verb) {
    const base = getBaseInfinitive(verb);
    if (base === "aller") return 3;
    if (/er$/.test(base)) return 1;
    const nousForm = getPresentPluralForm(verb);
    if (/ir$/.test(base) && /issons$/.test(nousForm)) return 2;
    const declared = Number(verb?.groupe || verb?.group);
    return [1, 2, 3].includes(declared) ? declared : 3;
  }

  function getPronominalForm(verb) {
    if (verb?.pronominal) return "";

    // « agir » tiene la forma pronominal impersonal « s'agir ».
    if (getBaseInfinitive(verb) === "agir") return "s'agir";

    // « pouvoir » tiene la forma pronominal impersonal y defectiva « se pouvoir ».
    if (getBaseInfinitive(verb) === "pouvoir") return "se pouvoir";

    if (verb?.formePronominaleDisponible !== true) return "";
    return String(verb?.formePronominale || "").trim();
  }

  function getNonPronominalForm(verb) {
    if (!verb?.pronominal) return "";
    const base = normalizeInfinitive(
      verb?.formeNonPronominale || verb?.infinitifBase || verb?.infinitif_base || verb?.verbeBase || ""
    );
    if (!base || /^(?:se\s+|s')/.test(base)) return "";
    return base;
  }

  function renderConjugations(verb, tense, forms) {
    if (!forms) {
      showLookupMessage("El verbo existe, pero el motor de conjugación aún no está conectado a esta página. La interfaz está preparada; falta integrar el catálogo y el motor canónicos.", true);
      return;
    }
    const lemma = verb.lemma || verb.infinitive || verb.infinitif || verb.verb || document.getElementById("lookup-verb").value.trim();
    let entries;
    if (tense === "all" && !Array.isArray(forms) && typeof forms === "object") {
      entries = Object.entries(forms);
      // Orden de presentación: priorizar los seis tiempos solicitados sin alterar
      // las formas devueltas por el motor ni el orden de los demás tiempos.
      const preferredTenseOrder = [
        "present",
        "passe-compose",
        "futur-simple",
        "imparfait",
        "plus-que-parfait",
        "conditionnel-present"
      ];
      const preferredTenseRank = new Map(preferredTenseOrder.map((key, index) => [key, index]));
      entries = entries
        .map((entry, originalIndex) => ({ entry, originalIndex }))
        .sort((a, b) => {
          const rankA = preferredTenseRank.has(a.entry[0]) ? preferredTenseRank.get(a.entry[0]) : preferredTenseOrder.length + a.originalIndex;
          const rankB = preferredTenseRank.has(b.entry[0]) ? preferredTenseRank.get(b.entry[0]) : preferredTenseOrder.length + b.originalIndex;
          return rankA - rankB;
        })
        .map(item => item.entry);
    } else {
      entries = [[tense, forms]];
    }
    const tenseLabels = {
      "present":"Présent de l’indicatif",
      "imparfait":"Imparfait",
      "passe-simple":"Passé simple",
      "futur-simple":"Futur simple",
      "conditionnel-present":"Conditionnel présent",
      "subjonctif-present":"Subjonctif présent",
      "subjonctif-imparfait":"Subjonctif imparfait",
      "passe-compose":"Passé composé",
      "plus-que-parfait":"Plus-que-parfait",
      "passe-anterieur":"Passé antérieur",
      "futur-anterieur":"Futur antérieur",
      "conditionnel-passe":"Conditionnel passé",
      "subjonctif-passe":"Subjonctif passé",
      "subjonctif-plus-que-parfait":"Subjonctif plus-que-parfait",
      "imperatif-present":"Impératif présent",
      "imperatif-passe":"Impératif passé"
    };
    const displayLemma = lemma.charAt(0).toLocaleUpperCase("fr") + lemma.slice(1);
    const specialVerbRecords = window.COQ_IMPERSONAL_VERBS || {};
    const normalizedLemma = normalizeInfinitive(getBaseInfinitive(verb));
    const matchedSpecialRecord = Object.entries(specialVerbRecords)
      .find(([key]) => normalizeInfinitive(key) === normalizedLemma)?.[1];
    const verbTypeLabel = verb.typeLabel || matchedSpecialRecord?.typeLabel ||
      (verb.impersonal === true || matchedSpecialRecord?.impersonal === true ? "Verbo impersonal" : "");
    const group = getVerbGroup(verb);
    const groupLabel = group === 1 ? "1er groupe" : group === 2 ? "2e groupe" : "3e groupe";
    const pastParticiple = String(verb.participePasse || verb.participe_passe || "").trim() || "—";
    const presentParticiple = getPresentParticiple(verb) || "—";
    const gerund = verb.gerondifDisponible === false
      ? ""
      : (presentParticiple === "—" ? "—" : "en " + presentParticiple);
    const pronominalForm = getPronominalForm(verb);
    const nonPronominalForm = getNonPronominalForm(verb);
    let output = '<section class="verb-summary-card" aria-label="Resumen del verbo">' +
      '<div class="verb-summary-header"><div><span class="eyebrow">Ficha del verbo</span><div class="verb-summary-title"><h2>' + esc(displayLemma) + '</h2>' +
      (verbTypeLabel ? '<span class="verb-type-badge">' + esc(verbTypeLabel) + '</span>' : '') + '</div></div>' +
      '<span class="pill">' + esc(groupLabel) + '</span></div>' +
      '<div class="verb-summary-details">' +
      '<div class="verb-summary-item"><span class="verb-summary-label">Participe passé</span><strong>' + esc(pastParticiple) + '</strong></div>' +
      '<div class="verb-summary-item"><span class="verb-summary-label">Participe présent</span><strong>' + esc(presentParticiple) + '</strong></div>' +
      '<div class="verb-summary-item"><span class="verb-summary-label">Gérondif</span><strong>' + esc(verb.gerondifDisponible === false ? '—' : gerund || '—') + '</strong></div>' +
      '</div><div class="verb-summary-actions">' +
      (pronominalForm ? '<button class="button button-secondary" type="button" data-show-pronominal>Ver su forma pronominal</button>' : '') +
      (nonPronominalForm ? '<button class="button button-secondary" type="button" data-show-non-pronominal>Ver su forma no pronominal</button>' : '') +
      '<button class="button button-primary" type="button" data-practice-this>Practicar este verbo →</button>' +
      '</div></section>';
    for (const [name, data] of entries) {
      const rows = Array.isArray(data)
        ? data.map((value, i) => value && typeof value === "object" && "person" in value
          ? [value.person, value.form ?? value.value ?? ""]
          : [String(i + 1), value])
        : Object.entries(data || {});
      output += '<div class="conjugation-table-wrap"><table class="conjugation-table"><caption>' + esc(tenseLabels[name] || name) + '</caption><thead><tr><th scope="col">Persona</th><th scope="col">Conjugación</th></tr></thead><tbody>';
      const isImperative = name === "imperatif-present" || name === "imperatif-passe";
      for (const [person, form] of rows) {
        // El motor entrega el predicado normalizado. No quitar palabras iniciales:
        // pueden ser pronombres reflexivos válidos, especialmente nous/vous.
        const rawForm = String(typeof form === "object" ? (form.form || form.value || JSON.stringify(form)) : form);
        const displayedForm = rawForm.replace(/[\u00A0\u202F]/g, " ").trim();
        // En la tabla, el sujeto y el predicado ocupan celdas separadas.
        // Mostrar «j'» cuando una forma no pronominal comienza por vocal:
        // «j'écoute», «j'ai parlé», «j'avais parlé». Las formas pronominales
        // empiezan por «me/m'», por lo que conservan «je».
        const startsWithVowel = window.COQ_FRENCH_ORTHOGRAPHY.startsWithElidableVowel(
          displayedForm,
          getBaseInfinitive(verb)
        );
        const normalizedPerson = String(person).toLocaleLowerCase("fr");
        const isSubjunctive = [
          "subjonctif-present",
          "subjonctif-passe",
          "subjonctif-imparfait",
          "subjonctif-plus-que-parfait"
        ].includes(name);
        let elidedPerson = normalizedPerson === "je" && startsWithVowel
          ? "j'"
          : person;
        if (isSubjunctive) {
          if (["il", "elle", "on", "ils", "elles"].includes(normalizedPerson)) {
            elidedPerson = "qu'" + normalizedPerson;
          } else if (normalizedPerson === "je") {
            // En forma pronominal, el predicado comienza por «me/m'»:
            // «que je me sois...», no «que j'me sois...».
            const startsWithReflexive = /^(?:me|te|se|nous|vous)\s|^(?:m|t|s)['’]/i.test(displayedForm);
            elidedPerson = startsWithVowel && !startsWithReflexive ? "que j'" : "que je";
          } else {
            elidedPerson = "que " + normalizedPerson;
          }
        }
        const displayedPerson = isImperative && ["tu", "nous", "vous"].includes(person)
          ? person + "*"
          : elidedPerson;
        output += '<tr><td>' + esc(displayedPerson) + '</td><td>' + esc(displayedForm) + '</td></tr>';
      }
      output += '</tbody></table>';
      if (isImperative) {
        output += '<p class="imperative-subject-note">* En el imperativo, los sujetos no se escriben ni se pronuncian en la oración.</p>';
      }
      output += '</div>';
    }
    lookupResults.innerHTML = output;
    lookupResults.querySelector("[data-practice-this]")?.addEventListener("click", () => {
      const profile = verb.profile || verb.metadata || verb;
      lockedVerbProfile = {
        lemma,
        group,
        family: profile.family || profile.pattern || "",
        construction: profile.pronominal ? "pronominal" : "non-pronominal",
        auxiliary: getPracticeAuxiliary(verb, profile)
      };
      document.getElementById("practice-verb").value = lemma;
      setTab("practice");
      applyLockedProfile();
      document.getElementById("practice-form").scrollIntoView({behavior:"smooth",block:"center"});
    });
    lookupResults.querySelector("[data-show-pronominal]")?.addEventListener("click", async () => {
      const input = document.getElementById("lookup-verb");
      input.value = pronominalForm;
      try {
        const pronominalVerb = findVerb(pronominalForm);
        if (!pronominalVerb) {
          showLookupMessage("No se ha encontrado la forma pronominal «" + pronominalForm + "» en el catálogo cargado.", true);
          return;
        }
        const pronominalForms = await getForms(pronominalVerb, tense);
        renderConjugations(pronominalVerb, tense, pronominalForms);
      } catch (error) {
        showLookupMessage("No se pudo obtener la conjugación de la forma pronominal.", true);
      }
    });
    lookupResults.querySelector("[data-show-non-pronominal]")?.addEventListener("click", async () => {
      const input = document.getElementById("lookup-verb");
      input.value = nonPronominalForm;
      try {
        const nonPronominalVerb = findVerb(nonPronominalForm);
        if (!nonPronominalVerb || nonPronominalVerb.pronominal) {
          showLookupMessage("No se ha encontrado la forma no pronominal «" + nonPronominalForm + "» en el catálogo cargado.", true);
          return;
        }
        const nonPronominalForms = await getForms(nonPronominalVerb, tense);
        renderConjugations(nonPronominalVerb, tense, nonPronominalForms);
      } catch (error) {
        showLookupMessage("No se pudo obtener la conjugación de la forma no pronominal.", true);
      }
    });
  }

  const COMPOUND_TENSES = new Set([
    "passe-compose",
    "plus-que-parfait",
    "passe-anterieur",
    "futur-anterieur",
    "subjonctif-passe",
    "subjonctif-plus-que-parfait",
    "conditionnel-passe",
    "imperatif-passe"
  ]);

  function isCompoundTense(tense) {
    return COMPOUND_TENSES.has(tense);
  }

  function applyLockedProfile() {
    const family = document.getElementById("practice-family");
    const practiceVerb = document.getElementById("practice-verb");
    const top100Mode = family.value === "top-100";
    const construction = document.getElementById("practice-construction");
    const auxiliary = document.getElementById("practice-auxiliary");
    const compoundTense = isCompoundTense(document.getElementById("practice-tense").value);
    const pronominalOnly = construction.value === "pronominal";

    if (practiceVerb) {
      practiceVerb.disabled = Boolean(lockedVerbProfile) || top100Mode;
      practiceVerb.closest(".form-field")?.classList.toggle("is-locked", practiceVerb.disabled);
    }
    [family, construction, auxiliary].forEach(select => {
      const locked = Boolean(lockedVerbProfile) || (top100Mode && select !== family) || (select === auxiliary && (!compoundTense || pronominalOnly));
      select.disabled = locked;
      select.closest(".form-field")?.classList.toggle("is-locked", locked);
      select.parentElement.querySelector(".locked-note")?.remove();
    });

    // En tiempos simples no se aplica ningún filtro de auxiliar.
    // Si hay un perfil de verbo fijado, conservamos su auxiliar para restaurarlo
    // al volver a seleccionar un tiempo compuesto.
    if (top100Mode && !lockedVerbProfile) {
      practiceVerb.value = "";
      construction.value = "";
      auxiliary.value = "";
    }
    if (!compoundTense && !lockedVerbProfile) auxiliary.value = "";
    if (compoundTense && pronominalOnly && !lockedVerbProfile) auxiliary.value = "etre";

    if (!lockedVerbProfile) return;
    const setIfAvailable = (select, value, aliases = {}) => {
      const normalized = aliases[value] || value;
      if ([...select.options].some(option => option.value === normalized)) select.value = normalized;
    };
    if (isPracticeEtrePriorityVerb(lockedVerbProfile.lemma)) {
      // La API solo admite estos verbos por su regla especial, no como familia regular -ER.
      family.value = "";
    } else {
      setIfAvailable(family, lockedVerbProfile.group, {"1":"premier-groupe","2":"deuxieme-groupe","3":"troisieme-groupe","premier groupe":"premier-groupe","deuxième groupe":"deuxieme-groupe","troisième groupe":"troisieme-groupe"});
      setIfAvailable(family, lockedVerbProfile.family);
    }
    setIfAvailable(construction, lockedVerbProfile.construction);
    setIfAvailable(auxiliary, isPracticeEtrePriorityVerb(lockedVerbProfile.lemma) ? "etre" : lockedVerbProfile.auxiliary, {"être":"etre","avoir":"avoir","avoir et être":""});
    [family, construction, auxiliary].forEach(select => {
      const note = document.createElement("small");
      note.className = "locked-note";
      note.textContent = "Perfil fijado por el verbo seleccionado.";
      select.parentElement.append(note);
    });
  }


  /* ==========================================================
     SMART VERB SEARCH — ambas barras, catálogo canónico
     Normaliza acentos/mayúsculas y permite errores tipográficos.
     ========================================================== */
  const searchInputs = [
    { input: document.getElementById("lookup-verb"), kind: "lookup" },
    { input: document.getElementById("practice-verb"), kind: "practice" }
  ].filter(item => item.input);

  const normalizeSearchText = value => String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9'\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  let verbSuggestionIndex = null;
  let suggestionSequence = 0;

  function editDistanceWithin(a, b, limit) {
    if (Math.abs(a.length - b.length) > limit) return limit + 1;
    let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const current = [i];
      let rowMinimum = i;
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
        rowMinimum = Math.min(rowMinimum, current[j]);
      }
      if (rowMinimum > limit) return limit + 1;
      previous = current;
    }
    return previous[b.length];
  }

  function buildVerbSuggestionIndex() {
    if (verbSuggestionIndex) return verbSuggestionIndex;
    const candidates = new Map();
    const add = (rawLabel, type = "regular") => {
      const label = String(rawLabel ?? "").trim().replace(/[’‘]/g, "'");
      const normalized = normalizeSearchText(label);
      if (!label || normalized.length < 1) return;
      const key = normalized;
      const existing = candidates.get(key);
      // En caso de duplicado, conservar primero la forma canónica más informativa.
      if (!existing || (existing.type !== "pronominal" && type === "pronominal")) {
        candidates.set(key, { label, normalized, type });
      }
    };
    const addRecords = (database, defaultType = "regular") => {
      if (!database) return;
      const records = Array.isArray(database)
        ? database.map((record, index) => [String(index), record])
        : Object.entries(database);
      for (const [key, record] of records) {
        const label = record?.infinitif || record?.infinitive || record?.lemma ||
          record?.verb || record?.verbe || record?.forme || key.replace(/-/g, " ");
        if (defaultType !== "pronominal" && normalizeInfinitive(label) === "évanouir") continue;
        add(label, defaultType);
      }
    };

    addRecords(window.COQ_VERBS);
    addRecords(window.COQ_IMPERSONAL_VERBS);
    const pronominalRecords = window.COQ_PRONOMINAL_VERBS;
    if (pronominalRecords && typeof pronominalRecords === "object") {
      for (const [key, record] of Object.entries(pronominalRecords)) {
        add(record?.infinitif || record?.infinitive || key.replace(/^se-/, "se ").replace(/-/g, " "), "pronominal");
      }
    }
    verbSuggestionIndex = [...candidates.values()];
    return verbSuggestionIndex;
  }

  function findCanonicalSuggestion(rawValue) {
    const normalized = normalizeSearchText(rawValue);
    if (!normalized) return null;
    return buildVerbSuggestionIndex().find(candidate => candidate.normalized === normalized) || null;
  }

  function syncPracticeVerbProfile() {
    const input = document.getElementById("practice-verb");
    const raw = input.value.trim();
    const normalized = normalizeSearchText(raw);

    if (lockedVerbProfile && normalized === normalizeSearchText(lockedVerbProfile.lemma)) return;

    if (lockedVerbProfile) {
      lockedVerbProfile = null;
      applyLockedProfile();
      document.getElementById("practice-family").value = "";
      document.getElementById("practice-construction").value = "";
      document.getElementById("practice-auxiliary").value = "";
    }

    if (!normalized) return;
    const canonical = findCanonicalSuggestion(raw);
    if (!canonical) return;
    const verb = findVerb(canonical.label);
    if (!verb) return;

    const profile = verb.profile || verb.metadata || verb;
    lockedVerbProfile = {
      lemma: canonical.label,
      group: getVerbGroup(verb),
      family: profile.family || profile.pattern || "",
      construction: profile.pronominal ? "pronominal" : "non-pronominal",
      auxiliary: getPracticeAuxiliary(verb, profile)
    };
    applyLockedProfile();
  }

  function rankVerbSuggestions(rawQuery) {
    const query = normalizeSearchText(rawQuery);
    if (!query) return [];
    const candidates = buildVerbSuggestionIndex();
    const ranked = [];
    for (const candidate of candidates) {
      const value = candidate.normalized;
      let score = Infinity;
      if (value === query) score = 0;
      else if (value.startsWith(query)) score = 10 + (value.length - query.length) / 100;
      else if (value.includes(query)) score = 30 + value.indexOf(query) / 100;
      else if (query.length >= 4) {
        const maxDistance = query.length >= 7 ? 2 : 1;
        const distance = editDistanceWithin(query, value, maxDistance);
        if (distance <= maxDistance) score = 50 + distance + Math.abs(value.length - query.length) / 100;
      }
      if (Number.isFinite(score)) ranked.push({ ...candidate, score });
    }
    ranked.sort((a, b) => a.score - b.score || a.label.localeCompare(b.label, "fr"));
    return ranked.slice(0, 8);
  }

  function setupVerbSuggestions({ input, kind }) {
    const field = input.closest(".form-field-verb");
    if (!field) return;
    const listbox = document.createElement("div");
    const listboxId = "verb-suggestions-" + kind;
    listbox.className = "verb-suggestions";
    listbox.id = listboxId;
    listbox.setAttribute("role", "listbox");
    listbox.setAttribute("aria-label", "Sugerencias de verbos");
    listbox.hidden = true;
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-controls", listboxId);
    input.setAttribute("aria-expanded", "false");
    field.append(listbox);

    let matches = [];
    let activeIndex = -1;

    const hide = () => {
      listbox.hidden = true;
      listbox.replaceChildren();
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      matches = [];
      activeIndex = -1;
    };

    const selectMatch = match => {
      if (!match) return;
      input.value = match.label;
      hide();
      input.dispatchEvent(new Event("change", { bubbles: true }));
    };

    const setActive = index => {
      if (!matches.length) return;
      activeIndex = (index + matches.length) % matches.length;
      [...listbox.children].forEach((option, i) => {
        const active = i === activeIndex;
        option.classList.toggle("is-active", active);
        option.setAttribute("aria-selected", String(active));
      });
      const activeOption = listbox.children[activeIndex];
      if (activeOption) {
        input.setAttribute("aria-activedescendant", activeOption.id);
        activeOption.scrollIntoView({ block: "nearest" });
      }
    };

    const render = () => {
      const query = input.value.trim();
      if (!normalizeSearchText(query)) {
        hide();
        return;
      }
      matches = rankVerbSuggestions(query);
      activeIndex = -1;
      listbox.replaceChildren();
      if (!matches.length) {
        const empty = document.createElement("div");
        empty.className = "verb-suggestions-empty";
        empty.textContent = "No se encontraron sugerencias. Puedes comprobar el infinitivo e intentarlo de nuevo.";
        listbox.append(empty);
        listbox.hidden = false;
        input.setAttribute("aria-expanded", "true");
        input.removeAttribute("aria-activedescendant");
        return;
      }
      matches.forEach((match, index) => {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "verb-suggestion";
        option.id = listboxId + "-option-" + index;
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", "false");
        const name = document.createElement("span");
        name.className = "verb-suggestion-name";
        name.textContent = match.label;
        option.append(name);
        if (match.type === "pronominal") {
          const type = document.createElement("span");
          type.className = "verb-suggestion-type";
          type.textContent = "Pronominal";
          option.append(type);
        }
        option.addEventListener("pointerdown", event => event.preventDefault());
        option.addEventListener("click", () => selectMatch(match));
        listbox.append(option);
      });
      listbox.hidden = false;
      input.setAttribute("aria-expanded", "true");
      input.removeAttribute("aria-activedescendant");
    };

    input.addEventListener("input", render);
    input.addEventListener("focus", () => {
      if (input.value.trim()) render();
    });
    input.addEventListener("keydown", event => {
      if (listbox.hidden && event.key !== "ArrowDown") return;
      if (event.key === "ArrowDown") {
        if (listbox.hidden) render();
        if (matches.length) {
          event.preventDefault();
          setActive(activeIndex + 1);
        }
      } else if (event.key === "ArrowUp") {
        if (matches.length) {
          event.preventDefault();
          setActive(activeIndex < 0 ? matches.length - 1 : activeIndex - 1);
        }
      } else if (event.key === "Enter" && !listbox.hidden && matches.length) {
        event.preventDefault();
        selectMatch(matches[activeIndex >= 0 ? activeIndex : 0]);
      } else if (event.key === "Escape" && !listbox.hidden) {
        event.preventDefault();
        hide();
      }
    });
    input.addEventListener("blur", () => window.setTimeout(hide, 120));
  }

  searchInputs.forEach(setupVerbSuggestions);

  const practiceVerbInput = document.getElementById("practice-verb");
  practiceVerbInput?.addEventListener("input", syncPracticeVerbProfile);
  practiceVerbInput?.addEventListener("change", syncPracticeVerbProfile);
  document.getElementById("practice-tense")?.addEventListener("change", applyLockedProfile);
  const constructionSelect = document.getElementById("practice-construction");
  let previousConstruction = constructionSelect?.value ?? "";
  constructionSelect?.addEventListener("change", () => {
    const auxiliary = document.getElementById("practice-auxiliary");
    const compoundTense = isCompoundTense(document.getElementById("practice-tense").value);
    const currentConstruction = constructionSelect.value;

    // Al salir del modo exclusivamente pronominal, restaurar la selección neutral.
    // Los cambios entre las otras dos construcciones conservan la elección manual.
    if (!lockedVerbProfile && compoundTense &&
        previousConstruction === "pronominal" && currentConstruction !== "pronominal") {
      auxiliary.value = "";
    }

    previousConstruction = currentConstruction;
    applyLockedProfile();
  });

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setTab(tab.dataset.tab));
    tab.addEventListener("keydown", event => {
      if (!["ArrowLeft","ArrowRight","Home","End"].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
      setTab(tabs[next].dataset.tab);
    });
  });

  lookupForm.addEventListener("submit", async event => {
    event.preventDefault();
    let raw = document.getElementById("lookup-verb").value.trim();
    const tense = document.getElementById("lookup-tense").value;
    if (!raw) return showLookupMessage("Escribe un verbo francés para realizar la búsqueda.", true);
    if (normalizeInfinitive(raw) === "évanouir") {
      return showLookupMessage("La forma no pronominal «évanouir» no está disponible. Busca «s'évanouir».", true);
    }
    const canonical = findCanonicalSuggestion(raw);
    if (canonical) {
      raw = canonical.label;
      document.getElementById("lookup-verb").value = raw;
    }
    if (!tense) return showLookupMessage("Selecciona un tiempo verbal o «Todos los tiempos verbales».", true);
    const verb = findVerb(raw);
    if (!verb) return showLookupMessage("No se ha encontrado «" + raw + "» en el catálogo de verbos cargado. El catálogo canónico debe conectarse para consultar cualquier verbo.", true);
    try {
      const forms = await getForms(verb, tense);
      renderConjugations(verb, tense, forms);
    } catch (error) {
      showLookupMessage("No se pudo obtener la conjugación. Revisa la integración del motor de conjugación.", true);
    }
  });

  lookupForm.addEventListener("reset", () => {
    window.setTimeout(() => {
      lookupResults.innerHTML = '<div class="results-empty"><div class="results-symbol" aria-hidden="true">Aa</div><h2>Tu espacio de conjugación</h2><p>Los resultados aparecerán aquí. Busca un verbo para consultar sus formas o configura una sesión de práctica.</p></div>';
    }, 0);
  });

  let activePractice = null;

  const PRACTICE_TENSE_LABELS = {
    "present": "Présent de l'indicatif",
    "imparfait": "Imparfait",
    "passe-compose": "Passé composé",
    "plus-que-parfait": "Plus-que-parfait",
    "passe-simple": "Passé simple",
    "passe-anterieur": "Passé antérieur",
    "futur-simple": "Futur simple",
    "futur-anterieur": "Futur antérieur",
    "subjonctif-present": "Subjonctif présent",
    "subjonctif-passe": "Subjonctif passé",
    "subjonctif-imparfait": "Subjonctif imparfait",
    "subjonctif-plus-que-parfait": "Subjonctif plus-que-parfait",
    "conditionnel-present": "Conditionnel présent",
    "conditionnel-passe": "Conditionnel passé",
    "imperatif-present": "Impératif présent",
    "imperatif-passe": "Impératif passé"
  };

  async function requestPractice(url, payload) {
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch {
      throw new Error("No se pudo conectar con Python. Abre la vista previa desde el entorno de desarrollo con el servidor iniciado.");
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = data?.detail;
      let message = "No se pudo procesar la práctica.";
      if (typeof detail === "string" && detail.trim()) {
        message = detail;
      } else if (Array.isArray(detail)) {
        message = detail.map(item => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object") {
            const location = Array.isArray(item.loc) ? item.loc.filter(part => part !== "body").join(" → ") : "";
            const reason = item.msg || item.message || JSON.stringify(item);
            return location ? location + ": " + reason : reason;
          }
          return String(item);
        }).join(" · ");
      } else if (detail && typeof detail === "object") {
        message = detail.message || detail.msg || JSON.stringify(detail);
      }
      throw new Error(message);
    }
    return data;
  }

  function renderPracticeQuestion() {
    if (!activePractice) return;
    const { questions, index, score, answers, sessionId } = activePractice;
    if (index >= questions.length) {
      const mistakes = answers.filter(item => !item.correct);
      const percentage = Math.round(score / questions.length * 100);
      practiceResults.innerHTML = '';
      document.getElementById("practice-results-modal")?.remove();
      const modal = document.createElement("div");
      modal.id = "practice-results-modal";
      modal.className = "practice-results-modal";
      modal.setAttribute("role", "presentation");
      modal.innerHTML =
        '<div class="practice-results-dialog" role="dialog" aria-labelledby="practice-results-title" tabindex="-1">' +
          '<span class="eyebrow">Sesión completada</span><h2 id="practice-results-title">Resultados de tu práctica</h2>' +
          '<div class="practice-summary-score"><strong>' + score + ' / ' + questions.length + '</strong><span>' + percentage + ' % de respuestas correctas</span></div>' +
          '<div class="practice-progress" role="progressbar" aria-label="Resultado final" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + percentage + '"><span style="width:' + percentage + '%"></span></div>' +
          '<p>' + (mistakes.length ? 'Revisa las formas que necesitas reforzar.' : 'Todas las respuestas han sido correctas.') + '</p>' +
          (mistakes.length ? '<details class="practice-mistakes"><summary>Revisar errores (' + mistakes.length + ')</summary><ul>' +
            mistakes.map(item => '<li><strong>' + esc(item.person + ' · ' + item.verb + ' · ' + (PRACTICE_TENSE_LABELS[item.tense] || item.tense)) + '</strong><span>Tu respuesta: ' + esc(item.answer) + '</span><span>Forma esperada: ' + esc(item.expected) + '</span></li>').join("") +
            '</ul></details>' : '') +
          '<div class="practice-answer-actions"><button class="button button-primary" type="button" data-practice-continue>Seguir practicando</button></div>' +
        '</div>';
      document.body.appendChild(modal);
      const dialog = modal.querySelector(".practice-results-dialog");
      dialog.focus();

      // El resultado no bloquea la navegación por teclado: Tab puede salir del panel.
      modal.addEventListener("keydown", event => {
        if (event.key === "Escape") {
          event.preventDefault();
          modal.querySelector("[data-practice-continue]")?.click();
        }
      });

      modal.querySelector("[data-practice-continue]")?.addEventListener("click", () => {
        modal.remove();
        practiceForm.reset();
        setTab("practice");
        practiceForm.scrollIntoView({ behavior: "smooth", block: "center" });
        window.setTimeout(() => document.getElementById("practice-verb")?.focus({ preventScroll: true }), 350);
      });
      return;
    }

    const question = questions[index];
    const orthography = window.COQ_FRENCH_ORTHOGRAPHY;
    const displayedPerson = question.person === "je" &&
      orthography?.startsWithElidableVowel(question.verb, question.verb)
        ? "j'"
        : question.person;
    practiceResults.innerHTML =
      '<section class="practice-session" aria-label="Sesión de práctica">' +
        '<div class="practice-session-top"><div><span class="eyebrow">Pregunta ' + (index + 1) + ' de ' + questions.length + '</span><h2>Conjuga el verbo</h2></div><span class="practice-score">Puntuación: ' + score + ' / ' + index + '</span></div>' +
        '<div class="practice-progress" role="progressbar" aria-label="Progreso de la práctica" aria-valuemin="0" aria-valuemax="' + questions.length + '" aria-valuenow="' + index + '"><span style="width:' + Math.round(index / questions.length * 100) + '%"></span></div>' +
        '<div class="practice-prompt"><span class="practice-prompt-label">' + esc(PRACTICE_TENSE_LABELS[question.tense] || question.tense) + '</span><div class="practice-prompt-main"><span class="practice-verb">' + esc(question.verb) + '</span></div><p>'+ (question.subject_gender && question.subject_number
          ? 'Ten en cuenta el género y el número indicados; no repitas el sujeto.'
          : 'Escribe la forma conjugada sin repetir el sujeto.') + '</p>' + (question.tense === "imperatif-present" || question.tense === "imperatif-passe" ? '<small>* En el imperativo, los sujetos no se escriben y no se pronuncian.</small>' : '') + '</div>' +
        '<form class="practice-answer-form" data-practice-answer-form><label class="practice-answer-label" for="practice-answer">Tu respuesta</label><div class="practice-answer-entry"><span class="practice-answer-person" aria-hidden="true">' + esc(displayedPerson) + '</span><input id="practice-answer" name="answer" type="text" aria-label="Forma conjugada para ' + esc(displayedPerson) + '" autocomplete="off" autocapitalize="off" spellcheck="false" required></div><small>Escribe únicamente la forma conjugada.</small><div class="practice-answer-actions"><button class="button button-primary" type="submit">Comprobar respuesta</button></div></form>' +
        '<div class="practice-feedback" data-practice-feedback aria-live="polite" hidden></div>' +
      '</section>';

    const form = practiceResults.querySelector("[data-practice-answer-form]");
    const input = practiceResults.querySelector("#practice-answer");
    const feedback = practiceResults.querySelector("[data-practice-feedback]");
    const button = form.querySelector('button[type="submit"]');
    const sessionSection = practiceResults.querySelector(".practice-session");
    sessionSection.addEventListener("keydown", event => {
      if (event.key !== "Tab") return;
      const focusable = [input, button].filter(element => !element.disabled);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    let attempts = 0;
    let solutionRequired = false;
    let firstAnswerRecorded = false;
    let firstAnswer = "";
    let expectedAnswer = "";
    let questionFinished = false;
    input.focus();

    function updateProgress() {
      practiceResults.querySelector(".practice-score").textContent =
        "Aciertos: " + activePractice.score + " / " + questions.length;
      const bar = practiceResults.querySelector(".practice-progress");
      bar.setAttribute("aria-valuenow", String(index + (questionFinished ? 1 : 0)));
      bar.querySelector("span").style.width =
        Math.round((index + (questionFinished ? 1 : 0)) / questions.length * 100) + "%";
    }

    function moveToNextQuestion() {
      if (questionFinished) return;
      questionFinished = true;
      input.disabled = true;
      button.disabled = true;
      window.setTimeout(() => {
        if (!activePractice || activePractice.index !== index) return;
        activePractice.index++;
        renderPracticeQuestion();
      }, 1000);
    }

    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (button.disabled || questionFinished || !input.value.trim()) return;
      const submittedAnswer = input.value.trim();

      // Tras dos errores, la solución se ha mostrado: solo la respuesta correcta
      // permite continuar, sin volver a contar la pregunta ni alterar la puntuación.
      if (solutionRequired) {
        button.disabled = true;
        try {
          const result = await requestPractice("/api/practice/check", {
            session_id: sessionId, index, answer: submittedAnswer
          });
          if (result.correct) {
            feedback.hidden = false;
            feedback.className = "practice-feedback is-correct";
            feedback.textContent = "Respuesta correcta. Pasando a la siguiente pregunta…";
            moveToNextQuestion();
          } else {
            feedback.hidden = false;
            feedback.className = "practice-feedback is-incorrect";
            feedback.innerHTML =
              '<strong>Respuesta incorrecta. Respuesta correcta: ' + esc(result.expected) + '.</strong>' +
              '<p>Escribe la respuesta correcta en el campo y pulsa «Comprobar respuesta» para pasar a la siguiente pregunta.</p>' +
              '<p>Escribe la respuesta correcta que aparece arriba para pasar a la siguiente pregunta.</p>';
            button.disabled = false;
            input.focus();
          }
        } catch (error) {
          feedback.hidden = false;
          feedback.className = "practice-feedback is-incorrect";
          feedback.textContent = error.message;
          button.disabled = false;
        }
        return;
      }

      button.disabled = true;
      try {
        const result = await requestPractice("/api/practice/check", {
          session_id: sessionId, index, answer: submittedAnswer
        });
        attempts++;
        expectedAnswer = result.expected;

        if (result.correct) {
          if (!firstAnswerRecorded) {
            activePractice.score++;
            activePractice.answers.push({
              person: question.person, verb: question.verb, tense: question.tense,
              answer: submittedAnswer, expected: result.expected, correct: true
            });
            firstAnswerRecorded = true;
          }
          feedback.hidden = false;
          feedback.className = "practice-feedback is-correct";
          feedback.textContent = "Respuesta correcta. Pasando a la siguiente pregunta…";
          updateProgress();
          moveToNextQuestion();
          return;
        }

        if (!firstAnswerRecorded) {
          firstAnswer = submittedAnswer;
          activePractice.answers.push({
            person: question.person, verb: question.verb, tense: question.tense,
            answer: firstAnswer, expected: result.expected, correct: false
          });
          firstAnswerRecorded = true;
        }

        feedback.hidden = false;
        feedback.className = "practice-feedback is-incorrect";
        if (attempts === 1) {
          feedback.textContent = "Respuesta incorrecta. Intenta de nuevo.";
          button.disabled = false;
          input.focus();
        } else {
          solutionRequired = true;
          feedback.innerHTML =
            '<strong>Respuesta incorrecta. Respuesta correcta: ' + esc(result.expected) + '.</strong>' +
            '<p>Escribe la respuesta correcta en el campo y pulsa «Comprobar respuesta» para pasar a la siguiente pregunta.</p>';
          button.disabled = false;
          input.focus();
        }
        updateProgress();
      } catch (error) {
        feedback.hidden = false;
        feedback.className = "practice-feedback is-incorrect";
        feedback.textContent = error.message;
        button.disabled = false;
      }
    });
  }

  document.getElementById("practice-family").addEventListener("change", () => {
    if (document.getElementById("practice-family").value === "top-100") {
      document.getElementById("practice-verb").value = "";
      document.getElementById("practice-construction").value = "";
      document.getElementById("practice-auxiliary").value = "";
    }
    applyLockedProfile();
  });

  let practiceGenerationInFlight = false;
  let practiceGenerationRequestId = 0;

  practiceForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (practiceGenerationInFlight) return;
    practiceGenerationInFlight = true;
    const requestId = ++practiceGenerationRequestId;
    const submitButton = practiceForm.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    const practiceVerbInput = document.getElementById("practice-verb");
    const rawPracticeVerb = practiceVerbInput.value.trim();
    const canonicalPracticeVerb = findCanonicalSuggestion(rawPracticeVerb);
    if (canonicalPracticeVerb) practiceVerbInput.value = canonicalPracticeVerb.label;
    const filters = {
      verb: canonicalPracticeVerb ? canonicalPracticeVerb.label : rawPracticeVerb,
      tense: document.getElementById("practice-tense").value,
      family: document.getElementById("practice-family").value,
      construction: document.getElementById("practice-construction").value,
      auxiliary: isCompoundTense(document.getElementById("practice-tense").value)
        ? document.getElementById("practice-auxiliary").value
        : ""
    };
    if (!filters.verb && !["tous-groupes-familles", "premier-groupe", "premier-groupe-reguliers", "ger", "cer", "eler", "eter", "yer", "e-accent", "deuxieme-groupe", "troisieme-groupe", "ir", "aitre", "dre", "ire-uire", "oir-oire", "ttre", "top-100"].includes(filters.family)) {
      showPracticeMessage("Escribe un verbo o selecciona una familia para generar una práctica automática.", true);
      return;
    }
    showPracticeMessage("Generando ejercicios con Python…");
    try {
      const data = await requestPractice("/api/practice/generate", filters);
      if (requestId !== practiceGenerationRequestId) return;
      if (!Array.isArray(data.questions) || data.questions.length !== 20 || !data.session_id) {
        throw new Error("Python no devolvió una sesión válida de 20 preguntas. Inténtalo de nuevo.");
      }
      activePractice = { sessionId: data.session_id, questions: data.questions, index: 0, score: 0, answers: [] };
      renderPracticeQuestion();
    } catch (error) {
      if (requestId !== practiceGenerationRequestId) return;
      showPracticeMessage(error.message, true);
    } finally {
      if (requestId === practiceGenerationRequestId) {
        practiceGenerationInFlight = false;
        if (submitButton) submitButton.disabled = false;
      }
    }
  });

  practiceForm.addEventListener("reset", () => {
    // Invalida cualquier respuesta pendiente para que no sustituya el estado del formulario reiniciado.
    practiceGenerationRequestId += 1;
    practiceGenerationInFlight = false;
    lockedVerbProfile = null;
    activePractice = null;
    window.setTimeout(() => {
      const submitButton = practiceForm.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = false;
      applyLockedProfile();
      practiceResults.innerHTML = '<div class="results-empty"><div class="results-symbol" aria-hidden="true">Aa</div><h2>Tu espacio de práctica</h2><p>Configura los filtros y genera una sesión de ejercicios. Los resultados de conjugación no se muestran en esta pestaña.</p></div>';
    }, 0);
  });

  setTab("lookup");
})();
