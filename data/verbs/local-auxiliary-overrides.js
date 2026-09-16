/* COQ — Overrides locales de auxiliar para verbos con doble posibilidad.
 * Solo selecciona el auxiliar utilizado por COQ; no modifica el motor ni las reglas de concordancia.
 */
(function(){
  const overrides={
    sortir:'être',
    monter:'être',
    descendre:'être',
    passer:'être',
    retourner:'être',
    'apparaître':'être'
  };
  Object.keys(overrides).forEach(function(verb){
    if(window.COQ_VERBS && window.COQ_VERBS[verb]){
      window.COQ_VERBS[verb].auxiliaire=overrides[verb];
      if(Array.isArray(window.COQ_VERBS[verb].auxiliaires)){
        window.COQ_VERBS[verb].auxiliaires=[overrides[verb]];
      }
    }
  });
})();
