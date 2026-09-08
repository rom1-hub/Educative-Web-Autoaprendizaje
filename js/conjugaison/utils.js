/* COQ — Utilidades de Conjugación
 *
 * Responsabilidad exclusiva:
 * - construir la vista de datos consumida por la interfaz;
 * - normalización y escapado de datos;
 * - expansión de filas de práctica;
 * - utilidades puras de soporte.
 *
 * El motor conserva los registros de COQ_VERBS. La práctica recibe una vista
 * estable de metadatos para evitar depender de mutaciones posteriores del
 * catálogo global.
 */
(function(){
  const data=window.COQ_VERB_DATA||{};
  const catalog=window.COQ_VERBS||{};
  const source={...(data.verbMeta||{}),...catalog};
  const normalizedMeta={};
  Object.keys(source).forEach(function(key){
    const record=source[key];
    if(!record||typeof record!=='object')return;
    normalizedMeta[key]={...record};
    if(record.pronominal===true)normalizedMeta[key].auxiliaire=null;
  });
  const api={
    conjugations:{...(data.conjugations||{}),...catalog},
    verbGroups:data.verbGroups||{},
    verbMeta:normalizedMeta
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
