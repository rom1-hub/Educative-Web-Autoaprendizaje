/* COQ — Utilidades de Conjugación.
 * Construye una única vista normalizada de datos y expone utilidades puras.
 * Después de esta fase, motor y UI no deben leer ni modificar COQ_VERBS.
 */
(function(){
  const base=window.COQ_VERB_DATA?.verbMeta||window.COQ_VERBS||{};
  const rawFamilies=window.COQ_VERB_FAMILY_CATALOG||{};
  const source={...base};
  Object.entries(rawFamilies).forEach(([key,familyRecord])=>{source[key]={...(source[key]||{}),...familyRecord};});

  function clone(value){
    if(Array.isArray(value))return value.map(clone);
    if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,clone(v)]));
    return value;
  }
  function deepFreeze(value){
    if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(deepFreeze);Object.freeze(value);}return value;
  }

  const registry={};
  Object.keys(source).forEach(key=>{
    const record=source[key];if(!record||typeof record!=='object')return;
    const stable=clone(record);
    if(stable.formes&&typeof stable.formes==='object')stable.formes=Object.fromEntries(Object.entries(stable.formes).map(([tense,rows])=>[tense,(rows||[]).map(row=>[row[0],row[1]])]));
    registry[key]=deepFreeze(stable);
  });
  deepFreeze(registry);

  const normalizedMeta={};
  Object.entries(registry).forEach(([key,record])=>{const meta={...record};if(record.pronominal===true)meta.auxiliaire=null;normalizedMeta[key]=deepFreeze(meta);});
  deepFreeze(normalizedMeta);

  const api={
    conjugations:registry,
    verbGroups:Object.freeze({...((window.COQ_VERB_DATA||{}).verbGroups||{})}),
    verbMeta:normalizedMeta
  };
  api.normalizeVerb=v=>String(v??'').trim().toLowerCase();
  api.escapeHtml=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  api.normalizeAnswerText=v=>String(v??'').trim().toLocaleLowerCase().replace(/\s+/g,' ');
  api.expandPracticeRows=rows=>{const expanded=[];(rows||[]).forEach(r=>{const subjects=String(r?.[0]??'').split('/').map(x=>x.trim()).filter(Boolean);if(subjects.length>1)subjects.forEach(subject=>expanded.push({subject,answer:r[1]}));else expanded.push({subject:r?.[0],answer:r?.[1]});});return expanded;};
  api.shuffleArray=arr=>{const a=[...(arr||[])];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

  window.COQ_VERB_REGISTRY=registry;
  window.COQ_CONJ_UTILS=api;
})();
