/* COQ — Utilidades de Conjugación
 *
 * Responsabilidad exclusiva:
 * - normalización y escapado de datos;
 * - expansión de filas de práctica;
 * - utilidades puras de soporte.
 *
 * La validación de respuestas de práctica pertenece exclusivamente a
 * practice.js, que aplica el contrato canónico: solo la forma verbal.
 * La presentación pertenece a table-presentation.js.
 */
(function(){
  const data=window.COQ_VERB_DATA||{};
  const catalog=window.COQ_VERBS||{};
  const api={
    conjugations:{...(data.conjugations||{}),...catalog},
    verbGroups:data.verbGroups||{},
    verbMeta:{...(data.verbMeta||{}),...catalog}
  };

  api.normalizeVerb=function(v){return String(v||'').trim().toLowerCase();};
  api.escapeHtml=function(v){return String(v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));};
  api.normalizeAnswerText=function(v){return String(v||'').trim().toLocaleLowerCase().replace(/\s+/g,' ');};

  api.expandPracticeRows=function(rows){
    const expanded=[];
    (rows||[]).forEach(r=>{
      const subjects=String(r[0]||'').split('/').map(x=>x.trim()).filter(Boolean);
      if(subjects.length>1)subjects.forEach(subject=>expanded.push({subject,answer:r[1]}));
      else expanded.push({subject:r[0],answer:r[1]});
    });
    return expanded;
  };

  api.shuffleArray=function(arr){
    const a=[...(arr||[])];
    for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return a;
  };

  window.COQ_CONJ_UTILS=api;
})();
