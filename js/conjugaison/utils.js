/* COQ — Utilidades de Conjugación
 * Solo funciones compartidas. No contiene interfaz ni flujo de práctica.
 */
(function(){
  const data=window.COQ_VERB_DATA||{};
  const api={
    conjugations:data.conjugations||{},
    verbGroups:data.verbGroups||{},
    verbMeta:data.verbMeta||{}
  };

  api.normalizeVerb=function(v){return String(v||'').trim().toLowerCase();};
  api.escapeHtml=function(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));};
  api.normalizeAnswerText=function(v){return String(v||'').trim().toLocaleLowerCase().replace(/\s+/g,' ');};
  api.answerVariants=function(q){
    const expected=api.normalizeAnswerText(q.answer);
    const variants=new Set([expected]);
    const rawSubject=String(q.subject||'').trim();
    if(!rawSubject)return variants;

    // El sujeto mostrado puede incluir "que" y/o una indicación de género/número.
    // Para validar, trabajamos siempre con el sujeto gramatical de base.
    const withoutGender=rawSubject.replace(/\s*\([^)]*\)\s*$/,'').trim();
    const subject=(withoutGender.split(' ').pop()||withoutGender).trim();
    const baseMap={
      "j'":'je', je:'je', tu:'tu', il:'il', elle:'elle', on:'on',
      nous:'nous', vous:'vous', ils:'ils', elles:'elles'
    };
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

    // 1) verbo solamente (forma canónica).
    // 2) sujeto + verbo.
    if(base==='je')variants.add(api.normalizeAnswerText('je '+expected));
    else variants.add(api.normalizeAnswerText(base+' '+expected));

    // 3) En ambos subjuntivos, también aceptamos "que + sujeto + verbo".
    const isSubjonctif=/^subjonctif\s+(présent|passé)$/i.test(String(q.tense||''));
    if(isSubjonctif){
      const queSubject={
        je:"que je", tu:'que tu', il:"qu'il", elle:"qu'elle", on:"qu'on",
        nous:'que nous', vous:'que vous', ils:"qu'ils", elles:"qu'elles"
      }[base];
      if(queSubject)variants.add(api.normalizeAnswerText(queSubject+' '+expected));
    }
    return variants;
  };
  api.sameAnswer=function(a,q){return api.answerVariants(q).has(api.normalizeAnswerText(a));};

  api.expandPracticeRows=function(rows){
    const expanded=[];
    rows.forEach(r=>{
      const subjects=r[0].split('/').map(x=>x.trim()).filter(Boolean);
      if(subjects.length>1) subjects.forEach(subject=>expanded.push({subject,answer:r[1]}));
      else expanded.push({subject:r[0],answer:r[1]});
    });
    return expanded;
  };
  api.shuffleArray=function(arr){
    const a=[...arr];
    for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return a;
  };
  window.COQ_CONJ_UTILS=api;
})();
