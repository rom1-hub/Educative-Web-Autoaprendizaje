/* COQ — Utilidades de Conjugación
 *
 * Responsabilidad exclusiva:
 * - construir una vista estable de los datos cargados;
 * - normalización y escapado de datos;
 * - expansión de filas de práctica;
 * - utilidades puras de soporte.
 *
 * Los archivos de datos pueden enriquecer COQ_VERBS durante la carga. Una vez
 * completada esa fase, este módulo crea el registro inmutable que consumen
 * motor y UI, eliminando dependencias de orden durante el runtime.
 */
(function(){
  const data=window.COQ_VERB_DATA||{};
  const catalog=window.COQ_VERBS||{};
  const source={...(data.verbMeta||{}),...catalog};
  const registry={};
  const normalizedMeta={};

  Object.keys(source).forEach(function(key){
    const record=source[key];
    if(!record||typeof record!=='object')return;
    const stable={...record};
    if(record.formes&&typeof record.formes==='object'){
      stable.formes=Object.fromEntries(Object.entries(record.formes).map(([tense,rows])=>[tense,(rows||[]).map(row=>[row[0],row[1]])]));
    }
    registry[key]=stable;
    normalizedMeta[key]={...stable};
    if(record.pronominal===true)normalizedMeta[key].auxiliaire=null;
  });

  window.COQ_VERB_REGISTRY=Object.freeze(registry);

  const api={
    conjugations:{...(data.conjugations||{}),...registry},
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
