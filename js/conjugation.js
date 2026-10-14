/* ==========================================================
   CONJUGACIÓN — COMPORTAMIENTO DE LA INTERFAZ
   La generación de conjugaciones se delega al motor canónico.
   Contrato previsto: window.COQ_VERBS + motor de conjugación.
   ========================================================== */
(() => {
  "use strict";
  const tabs = [...document.querySelectorAll("[data-tab]")];
  const panels = [...document.querySelectorAll("[data-panel]")];
  const results = document.getElementById("conjugation-results");
  const lookupForm = document.getElementById("lookup-form");
  const practiceForm = document.getElementById("practice-form");
  if (!tabs.length || !results || !lookupForm || !practiceForm) return;

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
  }

  function showMessage(message, isError = false) {
    results.innerHTML = '<p class="results-message' + (isError ? ' is-error' : '') + '" role="status">' + esc(message) + '</p>';
  }

  function normalizeInfinitive(value) {
    return String(value ?? "")
      .trim()
      .toLocaleLowerCase("fr")
      .replace(/[’]/g, "'")
      .replace(/\s+/g, " ");
  }

  function findVerb(raw) {
    const database = window.COQ_VERBS;
    if (!database) return null;

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

    let verb = null;
    if (Array.isArray(database)) {
      verb = database.find(v =>
        [v.lemma, v.infinitive, v.infinitif, v.verb]
          .some(value => [baseKey, fallbackKey].includes(normalizeInfinitive(value)))
      ) || null;
    } else {
      verb = database[baseKey] || database[fallbackKey] ||
        Object.values(database).find(v =>
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
    if (verb?.pronominal || verb?.formePronominaleDisponible !== true) return "";
    return String(verb?.formePronominale || "").trim();
  }

  function renderConjugations(verb, tense, forms) {
    if (!forms) {
      showMessage("El verbo existe, pero el motor de conjugación aún no está conectado a esta página. La interfaz está preparada; falta integrar el catálogo y el motor canónicos.", true);
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
      "subjonctif-plus-que-parfait":"Subjonctif plus-que-parfait"
    };
    const displayLemma = lemma.charAt(0).toLocaleUpperCase("fr") + lemma.slice(1);
    const baseInfinitive = getBaseInfinitive(verb);
    const group = getVerbGroup(verb);
    const groupLabel = group === 1 ? "1er groupe" : group === 2 ? "2e groupe" : "3e groupe";
    const pastParticiple = String(verb.participePasse || verb.participe_passe || "").trim() || "—";
    const presentParticiple = getPresentParticiple(verb) || "—";
    const gerund = presentParticiple === "—" ? "—" : "en " + presentParticiple;
    const pronominalForm = getPronominalForm(verb);
    let output = '<section class="verb-summary-card" aria-label="Resumen del verbo">' +
      '<div class="verb-summary-header"><div><span class="eyebrow">Ficha del verbo</span><h2>' + esc(displayLemma) + '</h2></div>' +
      '<span class="pill">' + esc(groupLabel) + '</span></div>' +
      '<div class="verb-summary-details">' +
      '<div class="verb-summary-item"><span class="verb-summary-label">Participe passé</span><strong>' + esc(pastParticiple) + '</strong></div>' +
      '<div class="verb-summary-item"><span class="verb-summary-label">Participe présent</span><strong>' + esc(presentParticiple) + '</strong></div>' +
      '<div class="verb-summary-item"><span class="verb-summary-label">Gérondif</span><strong>' + esc(gerund) + '</strong></div>' +
      '</div><div class="verb-summary-actions">' +
      (pronominalForm ? '<button class="button button-secondary" type="button" data-show-pronominal>Ver su forma pronominal</button>' : '') +
      '<button class="button button-primary" type="button" data-practice-this>Practicar este verbo →</button>' +
      '</div></section>';
    for (const [name, data] of entries) {
      const rows = Array.isArray(data)
        ? data.map((value, i) => value && typeof value === "object" && "person" in value
          ? [value.person, value.form ?? value.value ?? ""]
          : [String(i + 1), value])
        : Object.entries(data || {});
      output += '<div class="conjugation-table-wrap"><table class="conjugation-table"><caption>' + esc(tenseLabels[name] || name) + '</caption><thead><tr><th scope="col">Persona</th><th scope="col">Conjugación</th></tr></thead><tbody>';
      for (const [person, form] of rows) {
        // El motor entrega el predicado normalizado. No quitar palabras iniciales:
        // pueden ser pronombres reflexivos válidos, especialmente nous/vous.
        const rawForm = String(typeof form === "object" ? (form.form || form.value || JSON.stringify(form)) : form);
        const displayedForm = rawForm.replace(/[\u00A0\u202F]/g, " ").trim();
        output += '<tr><td>' + esc(person) + '</td><td>' + esc(displayedForm) + '</td></tr>';
      }
      output += '</tbody></table></div>';
    }
    results.innerHTML = output;
    results.querySelector("[data-practice-this]")?.addEventListener("click", () => {
      const profile = verb.profile || verb.metadata || verb;
      lockedVerbProfile = {
        lemma,
        group,
        family: profile.family || profile.pattern || "",
        construction: profile.pronominal ? "pronominal" : "non-pronominal",
        auxiliary: profile.auxiliary || profile.auxiliaire || ""
      };
      document.getElementById("practice-verb").value = lemma;
      setTab("practice");
      applyLockedProfile();
      document.getElementById("practice-form").scrollIntoView({behavior:"smooth",block:"center"});
    });
    results.querySelector("[data-show-pronominal]")?.addEventListener("click", async () => {
      const input = document.getElementById("lookup-verb");
      input.value = pronominalForm;
      try {
        const pronominalVerb = findVerb(pronominalForm);
        if (!pronominalVerb) {
          showMessage("No se ha encontrado la forma pronominal «" + pronominalForm + "» en el catálogo cargado.", true);
          return;
        }
        const pronominalForms = await getForms(pronominalVerb, tense);
        renderConjugations(pronominalVerb, tense, pronominalForms);
      } catch (error) {
        showMessage("No se pudo obtener la conjugación de la forma pronominal.", true);
      }
    });
  }

  function applyLockedProfile() {
    const family = document.getElementById("practice-family");
    const construction = document.getElementById("practice-construction");
    const auxiliary = document.getElementById("practice-auxiliary");
    [family, construction, auxiliary].forEach(select => {
      select.disabled = Boolean(lockedVerbProfile);
      select.closest(".form-field")?.classList.toggle("is-locked", Boolean(lockedVerbProfile));
      select.parentElement.querySelector(".locked-note")?.remove();
    });
    if (!lockedVerbProfile) return;
    const setIfAvailable = (select, value, aliases = {}) => {
      const normalized = aliases[value] || value;
      if ([...select.options].some(option => option.value === normalized)) select.value = normalized;
    };
    setIfAvailable(family, lockedVerbProfile.group, {"1":"premier-groupe","2":"deuxieme-groupe","3":"troisieme-groupe","premier groupe":"premier-groupe","deuxième groupe":"deuxieme-groupe","troisième groupe":"troisieme-groupe"});
    setIfAvailable(family, lockedVerbProfile.family);
    setIfAvailable(construction, lockedVerbProfile.construction);
    setIfAvailable(auxiliary, lockedVerbProfile.auxiliary, {"être":"etre","être":"etre","avoir":"avoir","avoir et être":""});
    [family, construction, auxiliary].forEach(select => {
      const note = document.createElement("small");
      note.className = "locked-note";
      note.textContent = "Perfil fijado por el verbo seleccionado.";
      select.parentElement.append(note);
    });
  }

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
    const raw = document.getElementById("lookup-verb").value.trim();
    const tense = document.getElementById("lookup-tense").value;
    if (!raw) return showMessage("Escribe un verbo francés para realizar la búsqueda.", true);
    if (!tense) return showMessage("Selecciona un tiempo verbal o «Todos los tiempos verbales».", true);
    const verb = findVerb(raw);
    if (!verb) return showMessage("No se ha encontrado «" + raw + "» en el catálogo de verbos cargado. El catálogo canónico debe conectarse para consultar cualquier verbo.", true);
    try {
      const forms = await getForms(verb, tense);
      renderConjugations(verb, tense, forms);
    } catch (error) {
      showMessage("No se pudo obtener la conjugación. Revisa la integración del motor de conjugación.", true);
    }
  });

  lookupForm.addEventListener("reset", () => {
    window.setTimeout(() => {
      results.innerHTML = '<div class="results-empty"><div class="results-symbol" aria-hidden="true">Aa</div><h2>Tu espacio de conjugación</h2><p>Los resultados aparecerán aquí. Busca un verbo para consultar sus formas o configura una sesión de práctica.</p></div>';
    }, 0);
  });

  practiceForm.addEventListener("submit", event => {
    event.preventDefault();
    const filters = {
      verb: document.getElementById("practice-verb").value.trim(),
      tense: document.getElementById("practice-tense").value,
      family: document.getElementById("practice-family").value,
      construction: document.getElementById("practice-construction").value,
      auxiliary: document.getElementById("practice-auxiliary").value
    };
    const engine = window.COQ_PRACTICE_ENGINE || window.CoQPracticeEngine;
    if (engine && typeof engine.start === "function") {
      engine.start(filters, results);
      return;
    }
    showMessage("Filtros preparados. La generación de ejercicios todavía necesita conectarse al motor de práctica y al catálogo canónico de verbos.", true);
  });

  practiceForm.addEventListener("reset", () => {
    lockedVerbProfile = null;
    window.setTimeout(() => applyLockedProfile(), 0);
  });

  setTab("lookup");
})();
