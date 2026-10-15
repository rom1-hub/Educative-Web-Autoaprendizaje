/* ==========================================================
   COQ — REGISTROS COMPLEMENTARIOS DE VERBOS IMPERSONALES
   Los datos de este archivo complementan el catálogo general.
   ========================================================== */
(() => {
  "use strict";

  window.COQ_IMPERSONAL_VERBS = Object.assign(window.COQ_IMPERSONAL_VERBS || {}, {
    pleuvoir: {
      infinitif: "pleuvoir",
      infinitive: "pleuvoir",
      lemma: "pleuvoir",
      impersonal: true,
      groupe: 3,
      auxiliaire: "avoir",
      participePasse: "plu",
      formes: {
        "présent de l'indicatif": ["", "", "pleut", "", "", "pleuvent"],
        "imparfait": ["", "", "pleuvait", "", "", "pleuvaient"],
        "passé simple": ["", "", "plut", "", "", "plurent"],
        "futur simple": ["", "", "pleuvra", "", "", "pleuvront"],
        "conditionnel présent": ["", "", "pleuvrait", "", "", "pleuvraient"],
        "subjonctif présent": ["", "", "pleuve", "", "", "pleuvent"],
        "subjonctif imparfait": ["", "", "plût", "", "", "plussent"]
      }
    },
    falloir: {
      infinitif: "falloir",
      infinitive: "falloir",
      lemma: "falloir",
      impersonal: true,
      groupe: 3,
      auxiliaire: "avoir",
      participePasse: "fallu",
      formes: {
        "présent de l'indicatif": ["", "", "faut", "", "", ""],
        "imparfait": ["", "", "fallait", "", "", ""],
        "passé simple": ["", "", "fallut", "", "", ""],
        "futur simple": ["", "", "faudra", "", "", ""],
        "conditionnel présent": ["", "", "faudrait", "", "", ""],
        "subjonctif présent": ["", "", "faille", "", "", ""],
        "subjonctif imparfait": ["", "", "fallût", "", "", ""]
      }
    },
    dracher: {
      infinitif: "dracher",
      infinitive: "dracher",
      lemma: "dracher",
      impersonal: true,
      typeLabel: "Verbo impersonal",
      sujetsAutorises: ["il"],
      groupe: 1,
      auxiliaire: "avoir",
      participePasse: "draché",
      participePresent: "drachant",
      accordParticipePasse: "aucun",
      gerondifDisponible: false,
      formes: {
        "présent de l'indicatif": ["", "", "drache", "", "", ""],
        "imparfait": ["", "", "drachait", "", "", ""],
        "passé simple": ["", "", "dracha", "", "", ""],
        "futur simple": ["", "", "drachera", "", "", ""],
        "conditionnel présent": ["", "", "dracherait", "", "", ""],
        "subjonctif présent": ["", "", "drache", "", "", ""],
        "subjonctif imparfait": ["", "", "drachât", "", "", ""]
      }
    },
    crachiner: {
      infinitif: "crachiner",
      infinitive: "crachiner",
      lemma: "crachiner",
      impersonal: true,
      typeLabel: "Verbo impersonal",
      sujetsAutorises: ["il"],
      groupe: 1,
      auxiliaire: "avoir",
      participePasse: "crachiné",
      participePresent: "crachinant",
      accordParticipePasse: "aucun",
      gerondifDisponible: false,
      formes: {
        "présent de l'indicatif": ["", "", "crachine", "", "", ""],
        "imparfait": ["", "", "crachinait", "", "", ""],
        "passé simple": ["", "", "crachina", "", "", ""],
        "futur simple": ["", "", "crachinera", "", "", ""],
        "conditionnel présent": ["", "", "crachinerait", "", "", ""],
        "subjonctif présent": ["", "", "crachine", "", "", ""],
        "subjonctif imparfait": ["", "", "crachinât", "", "", ""]
      }
    },
    brumasser: {
      infinitif: "brumasser",
      infinitive: "brumasser",
      lemma: "brumasser",
      impersonal: true,
      typeLabel: "Verbo impersonal",
      sujetsAutorises: ["il"],
      groupe: 1,
      auxiliaire: "avoir",
      participePasse: "brumassé",
      participePresent: "brumassant",
      accordParticipePasse: "aucun",
      gerondifDisponible: false,
      formes: {
        "présent de l'indicatif": ["", "", "brumasse", "", "", ""],
        "imparfait": ["", "", "brumassait", "", "", ""],
        "passé simple": ["", "", "brumassa", "", "", ""],
        "futur simple": ["", "", "brumassera", "", "", ""],
        "conditionnel présent": ["", "", "brumasserait", "", "", ""],
        "subjonctif présent": ["", "", "brumasse", "", "", ""],
        "subjonctif imparfait": ["", "", "brumassât", "", "", ""]
      }
    },
    brumer: {
      infinitif: "brumer",
      infinitive: "brumer",
      lemma: "brumer",
      impersonal: true,
      typeLabel: "Verbo impersonal",
      sujetsAutorises: ["il"],
      groupe: 1,
      auxiliaire: "avoir",
      participePasse: "brumé",
      participePresent: "brumant",
      accordParticipePasse: "aucun",
      gerondifDisponible: false,
      formes: {
        "présent de l'indicatif": ["", "", "brume", "", "", ""],
        "imparfait": ["", "", "brumait", "", "", ""],
        "passé simple": ["", "", "bruma", "", "", ""],
        "futur simple": ["", "", "brumera", "", "", ""],
        "conditionnel présent": ["", "", "brumerait", "", "", ""],
        "subjonctif présent": ["", "", "brume", "", "", ""],
        "subjonctif imparfait": ["", "", "brumât", "", "", ""]
      }
    },
    bruiner: {
      infinitif: "bruiner",
      infinitive: "bruiner",
      lemma: "bruiner",
      impersonal: true,
      typeLabel: "Verbo impersonal",
      sujetsAutorises: ["il"],
      groupe: 1,
      auxiliaire: "avoir",
      participePasse: "bruiné",
      participePresent: "bruinant",
      gerondifDisponible: false,
      formes: {
        "présent de l'indicatif": ["", "", "bruine", "", "", ""],
        "imparfait": ["", "", "bruinait", "", "", ""],
        "passé simple": ["", "", "bruina", "", "", ""],
        "futur simple": ["", "", "bruinera", "", "", ""],
        "conditionnel présent": ["", "", "bruinerait", "", "", ""],
        "subjonctif présent": ["", "", "bruine", "", "", ""],
        "subjonctif imparfait": ["", "", "bruinât", "", "", ""]
      }
    },
    brouillasser: {
      infinitif: "brouillasser",
      infinitive: "brouillasser",
      lemma: "brouillasser",
      impersonal: true,
      typeLabel: "Verbo impersonal",
      sujetsAutorises: ["il"],
      groupe: 1,
      auxiliaire: "avoir",
      participePasse: "brouillassé",
      participePresent: "brouillassant",
      gerondifDisponible: false,
      formes: {
        "présent de l'indicatif": ["", "", "brouillasse", "", "", ""],
        "imparfait": ["", "", "brouillassait", "", "", ""],
        "passé simple": ["", "", "brouillassa", "", "", ""],
        "futur simple": ["", "", "brouillassera", "", "", ""],
        "conditionnel présent": ["", "", "brouillasserait", "", "", ""],
        "subjonctif présent": ["", "", "brouillasse", "", "", ""],
        "subjonctif imparfait": ["", "", "brouillassât", "", "", ""]
      }
    },
    advenir: {
      infinitif: "advenir",
      infinitive: "advenir",
      lemma: "advenir",
      defective: true,
      typeLabel: "Verbo defectivo",
      groupe: 3,
      auxiliaire: "être",
      participePasse: "advenu",
      participePresent: "advenant",
      gerondifDisponible: false,
      formes: {
        "présent de l'indicatif": ["", "", "advient", "", "", "adviennent"],
        "imparfait": ["", "", "advenait", "", "", "advenaient"],
        "passé simple": ["", "", "advint", "", "", "advinrent"],
        "futur simple": ["", "", "adviendra", "", "", "adviendront"],
        "conditionnel présent": ["", "", "adviendrait", "", "", "adviendraient"],
        "subjonctif présent": ["", "", "advienne", "", "", "adviennent"],
        "subjonctif imparfait": ["", "", "advînt", "", "", "advinssent"]
      }
    }
  });
})();
