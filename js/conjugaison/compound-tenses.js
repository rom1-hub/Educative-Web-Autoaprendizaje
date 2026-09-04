/* COQ — Motor común de tiempos compuestos. */
(function(){
  const mapping={
    'passé composé': "présent de l'indicatif",
    'plus-que-parfait': 'imparfait',
    'conditionnel passé': 'conditionnel présent',
    'futur antérieur': 'futur simple',
    'subjonctif passé': 'subjonctif présent'
  };
  const compoundTenses=Object.keys(mapping);
  function auxiliaryTense(tense){return mapping[tense]||null;}
  function isCompound(tense){return Object.prototype.hasOwnProperty.call(mapping,tense);}
  window.COQ_CONJ_COMPOUND={mapping,compoundTenses,auxiliaryTense,isCompound};
})();
