/* COQ — Motor común de tiempos compuestos.
 * Fuente única: data/verbs/tense-rules.js.
 * Mantiene un fallback de compatibilidad para que la sección siga funcionando
 * aunque este módulo se cargue antes que el catálogo declarativo.
 */
(function(){
  const rules=window.COQ_TENSE_RULES||{};
  const fallback={
    'passé composé': "présent de l'indicatif",
    'plus-que-parfait': 'imparfait',
    'conditionnel passé': 'conditionnel présent',
    'futur antérieur': 'futur simple',
    'subjonctif passé': 'subjonctif présent'
  };

  function mappingFromRules(){
    const out={};
    Object.keys(rules).forEach(tense=>{
      const rule=rules[tense];
      if(rule&&rule.type==='composé'&&rule.auxiliaireTemps) out[tense]=rule.auxiliaireTemps;
    });
    return Object.keys(out).length?out:fallback;
  }

  const mapping=mappingFromRules();
  const compoundTenses=Object.keys(mapping);

  function auxiliaryTense(tense){return mapping[tense]||null;}
  function isCompound(tense){return Object.prototype.hasOwnProperty.call(mapping,tense);}

  window.COQ_CONJ_COMPOUND={
    mapping,
    compoundTenses,
    auxiliaryTense,
    isCompound
  };
})();
