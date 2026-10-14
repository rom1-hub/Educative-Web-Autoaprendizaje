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

  function findVerb(raw) {
    const database = window.COQ_VERBS;
    if (!database) return null;
    const input = raw.trim().toLocaleLowerCase("fr").replace(/[’]/g, "'");
    const pronominal = /^(?:se\s+|s')/.test(input);
    const key = input.replace(/^se\s+/, "").replace(/^s'/, "");
    let verb = null;
    if (Array.isArray(database)) {
      verb = database.find(v => [v.lemma, v.infinitive, v.infinitif, v.verb].some(x => String(x || "").toLocaleLowerCase("fr") === key)) || null;
    } else {
      verb = database[key] || Object.values(database).find(v => [v?.lemma, v?.infinitive, v?.infinitif, v?.verb].some(x => String(x || "").toLocaleLowerCase("fr") === key)) || null;
    }
    if (!verb || !pronominal) return verb;
    return { ...verb, pronominal: true, infinitif: input.replace(/^se\s+/, "se ").replace(/^s'/, "s'") };
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

  function stripLeadingSubject(person, value) {
    let text = String(value ?? "").replace(/[\\u00A0\\u202F]/g, " ").trim();
    const key = String(person ?? "").trim().toLocaleLowerCase("fr");
    const patterns = {
      je: /^(?:que\\s+)?(?:je\\s+|j['’]\\s*)/i,
      tu: /^(?:que\\s+)?tu\\s+/i,
      il: /^(?:que\\s+|qu['’])?il\\s+/i,
      elle: /^(?:que\\s+|qu['’])?elle\\s+/i,
      on: /^(?:que\\s+|qu['’])?on\\s+/i,
      nous: /^(?:que\\s+)?nous\\s+/i,
      vous: /^(?:que\\s+)?vous\\s+/i,
      ils: /^(?:que\\s+|qu['’])?ils\\s+/i,
      elles: /^(?:que\\s+|qu['’])?elles\\s+/i
    };
    const pattern = patterns[key];
    if (!pattern) return text;

    // Compatibilidad con cualquier motor que todavía devuelva «sujeto + forma».
    // Se quita el sujeto solo al inicio y solo si coincide con la columna Persona.
    while (pattern.test(text)) {
      const next = text.replace(pattern, "").trim();
      if (next === text) break;
      text = next;
    }
    return text;
  }

  function renderConjugations(verb, tense, forms) {
    if (!forms) {
      showMessage("El verbo existe, pero el motor de conjugación aún no está conectado a esta página. La interfaz está preparada; falta integrar el catálogo y el motor canónicos.", true);
      return;
    }
    const lemma = verb.lemma || verb.infinitive || verb.infinitif || verb.verb || document.getElementById("lookup-verb").value.trim();
    let entries;
    if (tense === "all" && !Array.isArray(forms) && typeof forms === "object") entries = Object.entries(forms);
    else entries = [[tense, forms]];
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
    let output = '<div class="results-title"><div><span class="eyebrow">Resultado de búsqueda</span><h2>' + esc(lemma) + '</h2></div><span class="pill">' + esc(tense === "all" ? "Todos los tiempos disponibles" : (tenseLabels[tense] || tense)) + '</span></div>';
    for (const [name, data] of entries) {
      const rows = Array.isArray(data)
        ? data.map((value, i) => value && typeof value === "object" && "person" in value
          ? [value.person, value.form ?? value.value ?? ""]
          : [String(i + 1), value])
        : Object.entries(data || {});
      output += '<div class="conjugation-table-wrap"><table class="conjugation-table"><caption>' + esc(tenseLabels[name] || name) + '</caption><thead><tr><th scope="col">Persona</th><th scope="col">Conjugación</th></tr></thead><tbody>';
      for (const [person, form] of rows) {
        // El adaptador separa el sujeto del predicado antes del renderizado.
        const rawForm = String(typeof form === "object" ? (form.form || form.value || JSON.stringify(form)) : form);
        const displayedForm = stripLeadingSubject(person, rawForm);
        output += '<tr><td>' + esc(person) + '</td><td>' + esc(displayedForm) + '</td></tr>';
      }
      output += '</tbody></table></div>';
    }
    output += '<div class="results-actions"><button class="button button-primary" type="button" data-practice-this>Practicar este verbo →</button></div>';
    results.innerHTML = output;
    results.querySelector("[data-practice-this]")?.addEventListener("click", () => {
      const profile = verb.profile || verb.metadata || verb;
      lockedVerbProfile = {
        lemma,
        group: profile.group || profile.groupe || "",
        family: profile.family || profile.pattern || "",
        construction: profile.pronominal ? "pronominal" : "non-pronominal",
        auxiliary: profile.auxiliary || profile.auxiliaire || ""
      };
      document.getElementById("practice-verb").value = lemma;
      setTab("practice");
      applyLockedProfile();
      document.getElementById("practice-form").scrollIntoView({behavior:"smooth",block:"center"});
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
