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
        pluviner: {
      infinitif: "pluviner",
      infinitive: "pluviner",
      lemma: "pluviner",
      impersonal: true,
      typeLabel: "Verbe impersonnel",
      sujetsAutorises: ["il"],
      groupe: 1,
      auxiliaire: "avoir",
      participePasse: "pluviné",
      participePresent: "pluvinant",
      accordParticipePasse: "aucun",
      gerondifDisponible: false,
      formes: {
        "présent de l'indicatif": ["", "", "pluvine", "", "", ""],
        "imparfait": ["", "", "pluvinait", "", "", ""],
        "passé simple": ["", "", "pluvina", "", "", ""],
        "futur simple": ["", "", "pluvinera", "", "", ""],
        "conditionnel présent": ["", "", "pluvinerait", "", "", ""],
        "subjonctif présent": ["", "", "pluvine", "", "", ""],
        "subjonctif imparfait": ["", "", "pluvinât", "", "", ""]
      }
    },
    pleuvoter: {
      infinitif: "pleuvoter",
      infinitive: "pleuvoter",
      lemma: "pleuvoter",
      impersonal: true,
      typeLabel: "Verbe impersonnel",
      sujetsAutorises: ["il"],
      groupe: 1,
      auxiliaire: "avoir",
      participePasse: "pleuvoté",
      participePresent: "pleuvotant",
      accordParticipePasse: "aucun",
      gerondifDisponible: false,
      formes: {
        "présent de l'indicatif": ["", "", "pleuvote", "", "", ""],
        "imparfait": ["", "", "pleuvotait", "", "", ""],
        "passé simple": ["", "", "pleuvota", "", "", ""],
        "futur simple": ["", "", "pleuvotera", "", "", ""],
        "conditionnel présent": ["", "", "pleuvoterait", "", "", ""],
        "subjonctif présent": ["", "", "pleuvote", "", "", ""],
        "subjonctif imparfait": ["", "", "pleuvotât", "", "", ""]
      }
    },
    pleuvioter: {
      infinitif: "pleuvioter",
      infinitive: "pleuvioter",
      lemma: "pleuvioter",
      impersonal: true,
      typeLabel: "Verbe impersonnel",
      sujetsAutorises: ["il"],
      groupe: 1,
      auxiliaire: "avoir",
      participePasse: "pleuvioté",
      participePresent: "pleuviotant",
      accordParticipePasse: "aucun",
      gerondifDisponible: false,
      formes: {
        "présent de l'indicatif": ["", "", "pleuviote", "", "", ""],
        "imparfait": ["", "", "pleuviotait", "", "", ""],
        "passé simple": ["", "", "pleuviota", "", "", ""],
        "futur simple": ["", "", "pleuviotera", "", "", ""],
        "conditionnel présent": ["", "", "pleuvioterait", "", "", ""],
        "subjonctif présent": ["", "", "pleuviote", "", "", ""],
        "subjonctif imparfait": ["", "", "pleuviotât", "", "", ""]
      }
    },
    pleuviner: {
      infinitif: "pleuviner",
      infinitive: "pleuviner",
      lemma: "pleuviner",
      impersonal: true,
      typeLabel: "Verbe impersonnel",
      sujetsAutorises: ["il"],
      groupe: 1,
      auxiliaire: "avoir",
      participePasse: "pleuviné",
      participePresent: "pleuvinant",
      accordParticipePasse: "aucun",
      gerondifDisponible: false,
      formes: {
        "présent de l'indicatif": ["", "", "pleuvine", "", "", ""],
        "imparfait": ["", "", "pleuvinait", "", "", ""],
        "passé simple": ["", "", "pleuvina", "", "", ""],
        "futur simple": ["", "", "pleuvinera", "", "", ""],
        "conditionnel présent": ["", "", "pleuvinerait", "", "", ""],
        "subjonctif présent": ["", "", "pleuvine", "", "", ""],
        "subjonctif imparfait": ["", "", "pleuvinât", "", "", ""]
      }
    },
    pleuvasser: {
      infinitif: "pleuvasser",
      infinitive: "pleuvasser",
      lemma: "pleuvasser",
      impersonal: true,
      typeLabel: "Verbe impersonnel",
      sujetsAutorises: ["il"],
      groupe: 1,
      auxiliaire: "avoir",
      participePasse: "pleuvassé",
      participePresent: "pleuvassant",
      accordParticipePasse: "aucun",
      gerondifDisponible: false,
      formes: {
        "présent de l'indicatif": ["", "", "pleuvasse", "", "", ""],
        "imparfait": ["", "", "pleuvassait", "", "", ""],
        "passé simple": ["", "", "pleuvassa", "", "", ""],
        "futur simple": ["", "", "pleuvassera", "", "", ""],
        "conditionnel présent": ["", "", "pleuvasserait", "", "", ""],
        "subjonctif présent": ["", "", "pleuvasse", "", "", ""],
        "subjonctif imparfait": ["", "", "pleuvassât", "", "", ""]
      }
    },
    neiger: {
      infinitif: "neiger",
      infinitive: "neiger",
      lemma: "neiger",
      impersonal: true,
      typeLabel: "Verbe impersonnel",
      sujetsAutorises: ["il"],
      groupe: 1,
      auxiliaire: "avoir",
      participePasse: "neigé",
      participePresent: "neigeant",
      accordParticipePasse: "aucun",
      gerondifDisponible: false,
      formes: {
        "présent de l'indicatif": ["", "", "neige", "", "", ""],
        "imparfait": ["", "", "neigeait", "", "", ""],
        "passé simple": ["", "", "neigea", "", "", ""],
        "futur simple": ["", "", "neigera", "", "", ""],
        "conditionnel présent": ["", "", "neigerait", "", "", ""],
        "subjonctif présent": ["", "", "neige", "", "", ""],
        "subjonctif imparfait": ["", "", "neigeât", "", "", ""]
      }
    },
"grésiller": {
      infinitif: "grésiller",
      infinitive: "grésiller",
      lemma: "grésiller",
      impersonal: true,
      typeLabel: "Verbe impersonnel",
      sujetsAutorises: ["il"],
      groupe: 1,
      auxiliaire: "avoir",
      participePasse: "grésillé",
      participePresent: "grésillant",
      accordParticipePasse: "aucun",
      gerondifDisponible: false,
      formes: {
        "présent de l'indicatif": ["", "", "grésille", "", "", ""],
        "imparfait": ["", "", "grésillait", "", "", ""],
        "passé simple": ["", "", "grésilla", "", "", ""],
        "futur simple": ["", "", "grésillera", "", "", ""],
        "conditionnel présent": ["", "", "grésillerait", "", "", ""],
        "subjonctif présent": ["", "", "grésille", "", "", ""],
        "subjonctif imparfait": ["", "", "grésillât", "", "", ""]
      }
    },
    "grêler": {
      infinitif: "grêler",
      infinitive: "grêler",
      lemma: "grêler",
      impersonal: true,
      typeLabel: "Verbe impersonnel",
      sujetsAutorises: ["il", "elle", "ils", "elles"],
      groupe: 1,
      auxiliaire: "avoir",
      participePasse: "grêlé",
      participePresent: "grêlant",
      gerondifDisponible: false,
      formes: {
        "présent de l'indicatif": ["", "", "grêle", "", "", "grêlent"],
        "imparfait": ["", "", "grêlait", "", "", "grêlaient"],
        "passé simple": ["", "", "grêla", "", "", "grêlèrent"],
        "futur simple": ["", "", "grêlera", "", "", "grêleront"],
        "conditionnel présent": ["", "", "grêlerait", "", "", "grêleraient"],
        "subjonctif présent": ["", "", "grêle", "", "", "grêlent"],
        "subjonctif imparfait": ["", "", "grêlât", "", "", "grêlassent"]
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
