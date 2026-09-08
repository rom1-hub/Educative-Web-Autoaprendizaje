// COQ — reglas declarativas de tiempos verbales.
// Fuente única para tipo, modo, orden y relación de tiempos compuestos.
window.COQ_TENSE_RULES = {
  "présent de l'indicatif":{"type":"simple","mode":"indicatif","order":10},
  "impératif présent":{"type":"simple","mode":"impératif","order":20},
  "passé composé":{"type":"composé","auxiliaireTemps":"présent de l'indicatif","participe":"participePasse","constructionFilters":"COQ_COMPOUND_CONSTRUCTION_FILTERS","order":30},
  "imparfait":{"type":"simple","mode":"indicatif","order":40},
  "futur simple":{"type":"simple","mode":"indicatif","order":50},
  "conditionnel présent":{"type":"simple","mode":"conditionnel","order":60},
  "plus-que-parfait":{"type":"composé","auxiliaireTemps":"imparfait","participe":"participePasse","constructionFilters":"COQ_COMPOUND_CONSTRUCTION_FILTERS","order":70},
  "conditionnel passé":{"type":"composé","auxiliaireTemps":"conditionnel présent","participe":"participePasse","constructionFilters":"COQ_COMPOUND_CONSTRUCTION_FILTERS","order":80},
  "futur antérieur":{"type":"composé","auxiliaireTemps":"futur simple","participe":"participePasse","constructionFilters":"COQ_COMPOUND_CONSTRUCTION_FILTERS","order":90},
  "subjonctif présent":{"type":"simple","mode":"subjonctif","order":100},
  "subjonctif passé":{"type":"composé","auxiliaireTemps":"subjonctif présent","participe":"participePasse","constructionFilters":"COQ_COMPOUND_CONSTRUCTION_FILTERS","order":110}
};

/*
 * La generación de las formas compuestas pertenece al motor de conjugación.
 * Este archivo solo declara las reglas; no contiene lógica de conjugación.
 */
