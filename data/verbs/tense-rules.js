// COQ — reglas declarativas de tiempos verbales.
// Fuente declarativa única para identificar tiempos simples y compuestos.
window.COQ_TENSE_RULES = {
  "présent de l'indicatif":{"type":"simple","mode":"indicatif"},
  "imparfait":{"type":"simple","mode":"indicatif"},
  "futur simple":{"type":"simple","mode":"indicatif"},
  "conditionnel présent":{"type":"simple","mode":"conditionnel"},
  "subjonctif présent":{"type":"simple","mode":"subjonctif"},
  "impératif présent":{"type":"simple","mode":"impératif"},
  "passé composé":{"type":"composé","auxiliaireTemps":"présent de l'indicatif","participe":"participePasse","constructionFilters":"COQ_COMPOUND_CONSTRUCTION_FILTERS"},
  "plus-que-parfait":{"type":"composé","auxiliaireTemps":"imparfait","participe":"participePasse","constructionFilters":"COQ_COMPOUND_CONSTRUCTION_FILTERS"},
  "conditionnel passé":{"type":"composé","auxiliaireTemps":"conditionnel présent","participe":"participePasse","constructionFilters":"COQ_COMPOUND_CONSTRUCTION_FILTERS"},
  "futur antérieur":{"type":"composé","auxiliaireTemps":"futur simple","participe":"participePasse","constructionFilters":"COQ_COMPOUND_CONSTRUCTION_FILTERS"},
  "subjonctif passé":{"type":"composé","auxiliaireTemps":"subjonctif présent","participe":"participePasse","constructionFilters":"COQ_COMPOUND_CONSTRUCTION_FILTERS"}
};

/*
 * La generación de las formas compuestas pertenece al motor de conjugación.
 * Este archivo solo declara las reglas de relación entre cada tiempo compuesto
 * y el tiempo que debe usar su auxiliar.
 */
