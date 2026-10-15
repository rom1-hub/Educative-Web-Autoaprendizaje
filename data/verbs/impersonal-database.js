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
    }
  });
})();
