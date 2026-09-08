/* COQ — Motor común de tiempos compuestos.
 * Fuente única: data/verbs/tense-rules.js.
 */
(function(){
  const rules=window.COQ_TENSE_RULES||{};
  const mapping={};
  Object.keys(rules).forEach(tense=>{
    const rule=rules[tense];
    if(rule&&rule.type==='composé'&&rule.auxiliaireTemps)mapping[tense]=rule.auxiliaireTemps;
  });
  function auxiliaryTense(tense){return mapping[tense]||null;}
  function isCompound(tense){return Object.prototype.hasOwnProperty.call(mapping,tense);}
  window.COQ_CONJ_COMPOUND={mapping,compoundTenses:Object.keys(mapping),auxiliaryTense,isCompound};
})();
