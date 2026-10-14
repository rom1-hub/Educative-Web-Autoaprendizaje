/* ==========================================================
   COQ — ADAPTADOR DE CONSULTA DE CONJUGACIONES
   Lee COQ_VERBS sin modificar el catálogo ni la práctica.
   ========================================================== */
(() => {
  "use strict";

  const SUBJECTS = [
    { key: "je", index: 0, gender: "m", number: "s" },
    { key: "tu", index: 1, gender: "m", number: "s" },
    { key: "il", index: 2, gender: "m", number: "s" },
    { key: "elle", index: 2, gender: "f", number: "s" },
    { key: "on", index: 2, gender: "m", number: "s", inclusive: true },
    { key: "nous", index: 3, gender: "m", number: "p" },
    { key: "vous", index: 4, gender: "m", number: "p", inclusive: true },
    { key: "ils", index: 5, gender: "m", number: "p" },
    { key: "elles", index: 5, gender: "f", number: "p" }
  ];

  const TENSES = {
    "present": "présent de l'indicatif",
    "imparfait": "imparfait",
    "passe-simple": "passé simple",
    "futur-simple": "futur simple",
    "conditionnel-present": "conditionnel présent",
    "subjonctif-present": "subjonctif présent",
    "subjonctif-imparfait": "subjonctif imparfait"
  };

  const AUX_FORMS = {
    avoir: {
      "présent de l'indicatif": ["ai", "as", "a", "avons", "avez", "ont"],
      "imparfait": ["avais", "avais", "avait", "avions", "aviez", "avaient"],
      "passé simple": ["eus", "eus", "eut", "eûmes", "eûtes", "eurent"],
      "futur simple": ["aurai", "auras", "aura", "aurons", "aurez", "auront"],
      "conditionnel présent": ["aurais", "aurais", "aurait", "aurions", "auriez", "auraient"],
      "subjonctif présent": ["aie", "aies", "ait", "ayons", "ayez", "aient"],
      "subjonctif imparfait": ["eusse", "eusses", "eût", "eussions", "eussiez", "eussent"]
    },
    être: {
      "présent de l'indicatif": ["suis", "es", "est", "sommes", "êtes", "sont"],
      "imparfait": ["étais", "étais", "était", "étions", "étiez", "étaient"],
      "passé simple": ["fus", "fus", "fut", "fûmes", "fûtes", "furent"],
      "futur simple": ["serai", "seras", "sera", "serons", "serez", "seront"],
      "conditionnel présent": ["serais", "serais", "serait", "serions", "seriez", "seraient"],
      "subjonctif présent": ["sois", "sois", "soit", "soyons", "soyez", "soient"],
      "subjonctif imparfait": ["fusse", "fusses", "fût", "fussions", "fussiez", "fussent"]
    }
  };

  const COMPOUNDS = [
    { key: "passe-compose", label: "passé composé", aux: "présent de l'indicatif", mood: "indicatif" },
    { key: "plus-que-parfait", label: "plus-que-parfait", aux: "imparfait", mood: "indicatif" },
    { key: "passe-anterieur", label: "passé antérieur", aux: "passé simple", mood: "indicatif" },
    { key: "futur-anterieur", label: "futur antérieur", aux: "futur simple", mood: "indicatif" },
    { key: "conditionnel-passe", label: "conditionnel passé", aux: "conditionnel présent", mood: "indicatif" },
    { key: "subjonctif-passe", label: "subjonctif passé", aux: "subjonctif présent", mood: "subjonctif" },
    { key: "subjonctif-plus-que-parfait", label: "subjonctif plus-que-parfait", aux: "subjonctif imparfait", mood: "subjonctif" }
  ];

  function elide(subject, nextWord) {
    if (subject === "je" && /^[aeiouyàâäéèêëîïôöùûüÿœh]/i.test(nextWord || "")) return "j'";
    return subject + " ";
  }

  function addQue(subject) {
    return /^je$/.test(subject) ? "que je" : (/^(il|elle|on|ils|elles)$/.test(subject) ? "qu'" + subject : "que " + subject);
  }

  function isSubjunctive(tense) {
    return tense.startsWith("subjonctif ");
  }

  function selectAuxiliary(verb) {
    // Los verbos pronominales forman sus tiempos compuestos con être.
    if (verb?.pronominal) return "être";
    const declared = Array.isArray(verb.auxiliaires) ? verb.auxiliaires : [verb.auxiliaire || "avoir"];
    // Para los verbos no pronominales, se respeta el auxiliar del catálogo.
    if (declared.includes("être")) return "être";
    return "avoir";
  }

  function getParticiple(verb) {
    return String(verb.participePasse || verb.participe_passe || "").trim();
  }

  function agreement(participle, subject) {
    if (!participle) return "";
    if (subject.inclusive) {
      return subject.key === "on" ? participle + "(e)(s)" : participle + "(e)s";
    }
    if (subject.gender === "f" && subject.number === "p") {
      return participle.endsWith("e") ? participle + "s" : participle + "es";
    }
    if (subject.gender === "f") return participle.endsWith("e") ? participle : participle + "e";
    if (subject.number === "p") return participle.endsWith("s") ? participle : participle + "s";
    return participle;
  }

  function compoundParticiple(verb, aux, subject) {
    const pp = getParticiple(verb);
    if (!pp) return "";
    if (aux === "avoir" && !verb.pronominal) return pp;

    // La base pronominale define explícitamente las excepciones de concordancia.
    // "aucun" significa que el participio permanece invariable (p. ej. se parler).
    if (verb.pronominal && verb.accordParticipePasse === "aucun") return pp;

    return agreement(pp, subject);
  }

  function renderSubjectForm(subject, form, tense, prefix) {
    if (!form) return null;
    let pronoun = subject.key;
    if (prefix === "que") pronoun = addQue(pronoun);
    if (pronoun.startsWith("que ")) {
      const inner = pronoun.slice(4);
      if (inner === "je") pronoun = "que " + (form && /^[aeiouyàâäéèêëîïôöùûüÿœh]/i.test(form) ? "j'" : "je ");
      else pronoun = pronoun;
    } else if (pronoun.startsWith("qu'")) {
      // already contracted
    }
    if (pronoun === "que j'") return pronoun + form;
    if (pronoun.startsWith("que ")) return pronoun + " " + form;
    if (pronoun.startsWith("qu'")) return pronoun + " " + form;
    return elide(pronoun, form) + form;
  }

  function reflexivePredicate(subject, form) {
    const pronouns = {
      je: "me", tu: "te", il: "se", elle: "se", on: "se",
      nous: "nous", vous: "vous", ils: "se", elles: "se"
    };
    const pronoun = pronouns[subject.key];
    if (!pronoun) return form;

    // Evita duplicar el pronombre si una entrada ya lo incluye.
    const alreadyReflexive = /^(?:me|te|se|nous|vous)\s+|^(?:m|t|s)['’]/i;
    if (alreadyReflexive.test(form)) return form;

    // me/te/se se eliden delante de vocal o h muda en la forma siguiente.
    if (["me", "te", "se"].includes(pronoun) &&
        /^[aeiouyàâäéèêëîïôöùûüÿœh]/i.test(form)) {
      return pronoun[0] + "'" + form;
    }
    return pronoun + " " + form;
  }

  function simpleRows(verb, tense) {
    const forms = verb.formes && verb.formes[tense];
    if (!Array.isArray(forms)) return [];

    return SUBJECTS.map(subject => {
      const entry = forms[subject.index];
      if (entry == null) return null;
      let form;
      if (Array.isArray(entry)) {
        form = entry.length >= 2 ? entry[entry.length - 1] : "";
      } else if (typeof entry === "object") {
        form = entry.form ?? entry.value ?? entry.conjugation ?? "";
      } else {
        form = entry;
      }
      let normalizedForm = String(form ?? "").trim();
      if (!normalizedForm) return null;
      if (verb.pronominal) normalizedForm = reflexivePredicate(subject, normalizedForm);
      return { person: subject.key, form: normalizedForm };
    }).filter(Boolean);
  }
  function compoundRows(verb, spec) {
    const aux = selectAuxiliary(verb);
    const auxiliaryForms = AUX_FORMS[aux] && AUX_FORMS[aux][spec.aux];
    const pp = getParticiple(verb);
    if (!auxiliaryForms || !pp) return [];

    return SUBJECTS.map(subject => {
      const auxForm = auxiliaryForms[subject.index];
      const participle = compoundParticiple(verb, aux, subject);
      if (!auxForm || !participle) return null;

      // La columna «Persona» ya contiene el sujeto: aquí solo se genera
      // el predicado. No eliminar nous/vous cuando son reflexivos.
      let form;
      if (verb.pronominal) {
        const reflexive = {je:"me", tu:"te", il:"se", elle:"se", on:"se", nous:"nous", vous:"vous", ils:"se", elles:"se"}[subject.key];
        const elideReflexive = ["me", "te", "se"].includes(reflexive) &&
          /^[aeiouyàâäéèêëîïôöùûüÿœh]/i.test(auxForm);
        const reflexiveForm = elideReflexive ? reflexive[0] + "'" : reflexive + " ";
        form = reflexiveForm + auxForm + " " + participle;
      } else {
        form = auxForm + " " + participle;
      }
      return { person: subject.key, form };
    }).filter(Boolean);
  }
  function conjugate(verb, key) {
    if (!verb || !verb.formes) return null;
    if (key === "all") {
      const result = {};
      for (const [uiKey, tense] of Object.entries(TENSES)) {
        const rows = simpleRows(verb, tense);
        if (rows.length) result[uiKey] = rows;
      }
      for (const spec of COMPOUNDS) {
        const rows = compoundRows(verb, spec);
        if (rows.length) result[spec.key] = rows;
      }
      return Object.keys(result).length ? result : null;
    }
    const tense = TENSES[key];
    if (tense) {
      const rows = simpleRows(verb, tense);
      return rows.length ? rows : null;
    }
    const spec = COMPOUNDS.find(item => item.key === key);
    if (spec) {
      const rows = compoundRows(verb, spec);
      return rows.length ? rows : null;
    }
    return null;
  }

  window.COQ_LOOKUP_ENGINE = { conjugate, selectAuxiliary };
})();