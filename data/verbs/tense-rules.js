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
 * Compatibilidad post-carga: el motor conserva toda su lógica existente,
 * pero una construcción pronominal compuesta no debe duplicar el pronombre.
 * Se corrige únicamente el artefacto "me me suis..." producido por la
 * combinación de contractPronoun() + concatenación del auxiliar.
 */
document.addEventListener('DOMContentLoaded',function(){
  const engine=window.COQ_CONJ_ENGINE;
  const P=window.COQ_CONJ_PRONOUNS;
  const C=window.COQ_CONJ_COMPOUND;
  if(!engine||typeof engine.conjugate!=='function'||!P||!C||engine.__compoundCompatibilityPatch)return;

  const original=engine.conjugate.bind(engine);
  const compounds=new Set(C.compoundTenses||Object.keys(C.mapping||{}));

  engine.conjugate=function(verb,tense,subject,construction){
    const result=original(verb,tense,subject,construction);
    if(result==null||!compounds.has(tense)||construction!=='pronominale')return result;

    const pronoun=P.pronounFor(subject);
    if(!pronoun)return result;

    const first=String(result).trim();
    const escaped=pronoun.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const duplicate=new RegExp('^'+escaped+'\\s+'+escaped+'\\s+','i');
    return first.replace(duplicate,pronoun+' ');
  };

  engine.__compoundCompatibilityPatch=true;
});
