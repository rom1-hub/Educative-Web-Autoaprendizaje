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
    const declared = Array.isArray(verb.auxiliaires) ? verb.auxiliaires : [verb.auxiliaire || "avoir"];
    // Provisional COQ display rule: when both are declared, prefer être.
    if (declared.includes("être")) return "être";
    return "avoir";
  }

  function getParticiple(verb) {
    return String(verb.participePasse || verb.participe_passe || "").trim();
  }

  function agreement(participle, subject) {
    if (!participle) return "";
    if (subject.inclusive) {
      if (subject.key === "on") return participle + "(e)(s)";
      return participle + "(e)(s)";
    }
    if (subject.gender === "f" && subject.number === "p") return /e?s$/u.test(participle) ? (participle.endsWith("s") ? participle : participle + "s") : participle + "es";
    if (subject.gender === "f") return participle.endsWith("e") ? participle : participle + "e";
    if (subject.number === "p") return participle.endsWith("s") ? participle : participle + "s";
    return participle;
  }

  function compoundParticiple(verb, aux, subject) {
    const pp = getParticiple(verb);
    if (!pp) return "";
    if (aux === "avoir" && !verb.pronominal) return pp;
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

  function simpleRows(verb, tense) {
    const forms = verb.formes && verb.formes[tense];
    if (!Array.isArray(forms)) return [];
    const prefix = isSubjunctive(tense) ? "que" : "";
    return SUBJECTS.map(subject => {
      const form = forms[subject.index];
      if (!form) return null;
      let text;
      if (prefix) {
        const p = subject.key;
        if (p === "je") text = /^[aeiouyàâäéèêëîïôöùûüÿœh]/i.test(form) ? "que j'" + form : "que je " + form;
        else if (["il", "elle", "on", "ils", "elles"].includes(p)) text = "qu'" + p + " " + form;
        else text = "que " + p + " " + form;
      } else {
        text = elide(subject.key, form) + form;
      }
      return { person: subject.key, form: text };
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
      let text;
      if (verb.pronominal) {
        const reflexive = {je:"me", tu:"te", il:"se", elle:"se", on:"se", nous:"nous", vous:"vous", ils:"se", elles:"se"}[subject.key];
        const beforeAux = subject.key === "je" && /^[aeiouyàâäéèêëîïôöùûüÿœh]/i.test(reflexive) ? "m'" : reflexive + " ";
        const auxPhrase = subject.key === "je" ? "je " + beforeAux + auxForm : subject.key + " " + beforeAux + auxForm;
        text = auxPhrase + " " + participle;
      } else {
        const pronoun = subject.key;
        const prefix = spec.mood === "subjonctif" ? (["il","elle","on","ils","elles"].includes(pronoun) ? "qu'" + pronoun : "que " + pronoun) : pronoun;
        if (spec.mood === "subjonctif") {
          if (pronoun === "je") text = /^[aeiouyàâäéèêëîïôöùûüÿœh]/i.test(auxForm) ? "que j'" + auxForm + " " + participle : "que je " + auxForm + " " + participle;
          else text = prefix + " " + auxForm + " " + participle;
        } else text = elide(pronoun, auxForm) + auxForm + " " + participle;
      }
      return { person: subject.key, form: text };
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