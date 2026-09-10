/* COQ — Utilidades de Conjugación.
 * Construye vistas derivadas del modelo canónico y expone utilidades puras.
 * Después de esta fase, motor y UI no deben leer ni modificar COQ_VERBS.
 */
(function(){
  const dataModel=window.COQ_CONJ_DATA_MODEL;
  const records=dataModel?.records||{};
  const verbData=window.COQ_VERB_DATA||{};
  const registry={};

  // Adaptador de compatibilidad: mantiene la forma histórica que todavía
  // consumen algunas capas mientras la migración termina. Los datos provienen
  // exclusivamente del modelo canónico; no constituye una segunda autoridad.
  Object.entries(records).forEach(([key,record])=>{
    registry[key]=Object.freeze({
      id:record.id,
      infinitif:record.infinitif,
      infinitif_base:record.infinitifBase,
      groupe:record.groupe,
      familyId:record.familyId,
      patternId:record.patternId,
      pattern:record.legacyPattern,
      auxiliaire:record.auxiliaire,
      participePasse:record.participePasse,
      construction:record.construction,
      verbeBase:record.legacyVerbeBase,
      pronominal:record.pronominal,
      formePronominale:record.formePronominale,
      formeNonPronominale:record.formeNonPronominale,
      variantes:record.variantes,
      exceptions:record.exceptions,
      formes:record.legacyFormes
    });
  });
  Object.freeze(registry);

  const normalizedMeta={};
  Object.entries(records).forEach(([key,record])=>{
    const meta={...record};
    if(record.pronominal===true)meta.auxiliaire=null;
    normalizedMeta[key]=Object.freeze(meta);
  });
  Object.freeze(normalizedMeta);

  const api={
    conjugations:Object.freeze(Object.fromEntries(Object.entries(registry).map(([key,record])=>[key,record.formes||{}]))),
    verbGroups:Object.freeze({...((verbData.verbGroups)||{})}),
    verbMeta:normalizedMeta
  };
  api.normalizeVerb=v=>String(v??'').trim().toLowerCase();
  api.escapeHtml=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  api.normalizeAnswerText=v=>String(v??'').trim().toLocaleLowerCase().replace(/\s+/g,' ');
  api.expandPracticeRows=rows=>{
    const expanded=[];
    (rows||[]).forEach(r=>{
      const subjects=String(r?.[0]??'').split('/').map(x=>x.trim()).filter(Boolean);
      if(subjects.length>1)subjects.forEach(subject=>expanded.push({subject,answer:r[1]}));
      else expanded.push({subject:r?.[0],answer:r?.[1]});
    });
    return expanded;
  };
  api.shuffleArray=arr=>{
    const a=[...(arr||[])];
    for(let i=a.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  };
  window.COQ_VERB_REGISTRY=registry;
  window.COQ_CONJ_UTILS=api;
})();
