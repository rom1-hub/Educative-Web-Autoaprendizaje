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
 * Compatibilidad post-carga.
 *
 * El motor actual conserva una implementación histórica en compoundForm()
 * que puede producir temporalmente "me me suis..." en una construcción
 * pronominal compuesta. Esta capa corrige únicamente ese artefacto y lo hace
 * de forma independiente de que el caller haya enviado explícitamente la
 * construcción o de que esta venga determinada por los metadatos del verbo.
 *
 * Es una capa transitoria: la lógica definitiva deberá integrarse en engine.js
 * cuando se complete la migración morfológica.
 */
document.addEventListener('DOMContentLoaded',function(){
  const engine=window.COQ_CONJ_ENGINE;
  const P=window.COQ_CONJ_PRONOUNS;
  const C=window.COQ_CONJ_COMPOUND;
  const verbs=window.COQ_VERBS||{};
  if(!engine||typeof engine.conjugate!=='function'||!P||!C||engine.__compoundCompatibilityPatch)return;

  const original=engine.conjugate.bind(engine);
  const compounds=new Set(C.compoundTenses||Object.keys(C.mapping||{}));

  function isPronominal(verb,construction){
    if(construction==='pronominale')return true;
    if(construction==='non-pronominale')return false;
    const record=verbs[String(verb||'').trim().toLowerCase()]||{};
    return record.pronominal===true || record.construction==='pronominale';
  }

  function normalizeDuplicatePronoun(result,subject){
    if(result==null)return result;
    const pronoun=P.pronounFor(subject);
    if(!pronoun)return result;

    const value=String(result).trim();
    const escaped=pronoun.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const duplicate=new RegExp('^'+escaped+'(?:\\s+|\\s*\\u2019?)'+escaped+'\\s+','i');

    return value.replace(duplicate,pronoun+' ');
  }

  engine.conjugate=function(verb,tense,subject,construction){
    const result=original(verb,tense,subject,construction);
    if(result==null||!compounds.has(tense)||!isPronominal(verb,construction))return result;
    return normalizeDuplicatePronoun(result,subject);
  };

  engine.__compoundCompatibilityPatch=true;
});
