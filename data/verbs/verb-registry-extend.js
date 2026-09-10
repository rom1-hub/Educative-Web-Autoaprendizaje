// COQ — registro léxico extendido.
// Este archivo se carga después de verbs.js y antes de la resolución de familias.
(function(){
  const source=window.COQ_VERBS||{};
  const records=window.COQ_VERB_DATA||{};
  Object.keys(source).forEach(key=>{ if(records[key]) return; records[key]=source[key]; });
  window.COQ_VERB_DATA=records;
})();
