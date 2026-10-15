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
