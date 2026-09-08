/* COQ — Utilidades de Conjugación
 *
 * Responsabilidad exclusiva:
 * - normalización y escapado de datos;
 * - variantes de respuesta compartidas;
 * - expansión y mezcla de filas de práctica;
 * - utilidades puras de soporte.
 *
 * Este módulo NO modifica el motor, NO observa el DOM y NO instala parches
 * de conjugación. La presentación pertenece a table-presentation.js.
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

  api.answerVariants=function(q){
    const expected=api.normalizeAnswerText(q.answer);
    const expectedVariants=expected.split(/\s+\/\s+/).map(v=>v.trim()).filter(Boolean);
    const variants=new Set(expectedVariants);
    const rawSubject=String(q.subject||'').trim();
    if(!rawSubject)return variants;

    if(String(q.tense||'').trim()==='impératif présent')return variants;

    const withoutGender=rawSubject.replace(/\s*\([^)]*\)\s*$/,'').trim();
    const baseMap={"j'":'je',je:'je',tu:'tu',il:'il',elle:'elle',on:'on',nous:'nous',vous:'vous',ils:'ils',elles:'elles'};
    let base=withoutGender.toLowerCase();
    if(/^qu['’]il$/.test(base))base='il';
    else if(/^qu['’]elle$/.test(base))base='elle';
    else if(/^qu['’]on$/.test(base))base='on';
    else if(/^qu['’]ils$/.test(base))base='ils';
    else if(/^qu['’]elles$/.test(base))base='elles';
    else if(/^que\s+j['’]$/.test(base))base='je';
    else if(/^que\s+je$/.test(base))base='je';
    else if(/^que\s+tu$/.test(base))base='tu';
    else if(/^que\s+nous$/.test(base))base='nous';
    else if(/^que\s+vous$/.test(base))base='vous';
    else base=baseMap[base]||base;
    if(!baseMap[base])return variants;

    expectedVariants.forEach(function(form){
      const startsWithVowel=/^[aeiouyàâäéèêëîïôöùûüÿœæ]/i.test(form);
      if(base==='je'){
        if(!startsWithVowel)variants.add(api.normalizeAnswerText('je '+form));
        if(!/^j['’]/.test(form)&&startsWithVowel)variants.add(api.normalizeAnswerText("j'"+form));
      }else{
        variants.add(api.normalizeAnswerText(base+' '+form));
      }

      const isSubjonctif=/^subjonctif\s+(présent|passé)$/i.test(String(q.tense||''));
      if(isSubjonctif){
        const queSubject={je:"que je",tu:'que tu',il:"qu'il",elle:"qu'elle",on:"qu'on",nous:'que nous',vous:'que vous',ils:"qu'ils",elles:"qu'elles"}[base];
        if(queSubject){
          if(!(base==='je'&&startsWithVowel))variants.add(api.normalizeAnswerText(queSubject+' '+form));
          if(base==='je'&&!/^j['’]/.test(form)&&startsWithVowel)variants.add(api.normalizeAnswerText("que j'"+form));
        }
      }
    });
    return variants;
  };

  api.sameAnswer=function(a,q){return api.answerVariants(q).has(api.normalizeAnswerText(a));};

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

  /* Donnée héritée conservée pendant la migration du catalogue.
   * Les formes de faire doivent à terme rejoindre la source de données,
   * mais ce changement est volontairement séparé de la suppression des
   * patches runtime.
   */
  const faire=window.COQ_VERBS&&window.COQ_VERBS['faire'];
  if(faire){
    faire.formes=faire.formes||{};
    Object.assign(faire.formes,{
      "imparfait":[["je","faisais"],["tu","faisais"],["il/elle/on","faisait"],["nous","faisions"],["vous","faisiez"],["ils/elles","faisaient"]],
      "futur simple":[["je","ferai"],["tu","feras"],["il/elle/on","fera"],["nous","ferons"],["vous","ferez"],["ils/elles","feront"]],
      "conditionnel présent":[["je","ferais"],["tu","ferais"],["il/elle/on","ferait"],["nous","ferions"],["vous","feriez"],["ils/elles","feraient"]],
      "subjonctif présent":[["que je","fasse"],["que tu","fasses"],["qu'il/elle/on","fasse"],["que nous","fassions"],["que vous","fassiez"],["qu'ils/elles","fassent"]],
      "impératif présent":[["tu","fais"],["nous","faisons"],["vous","faites"]]
    });
  }

  window.COQ_CONJ_UTILS=api;
})();
