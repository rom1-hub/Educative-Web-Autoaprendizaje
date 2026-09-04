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
    const subject=(q.subject||'').split(' (')[0].trim();
    if(!subject)return variants;
    const isPronominalStart=/^(me |m\'|te |t\'|se |s\'|nous |vous )/.test(expected);
    let withSubject='';
    if(subject==='je'){
      if(/^((me )|(m\'))/.test(expected)) withSubject='je '+expected;
      else if(/^[aeiouyàâäéèêëîïôöùûüÿh]/i.test(expected)) withSubject="j'"+expected;
      else withSubject='je '+expected;
    }else if(subject==="j'"){
      withSubject="j'"+expected;
    }else{
      withSubject=subject+' '+expected;
    }
    variants.add(api.normalizeAnswerText(withSubject));
    if(isPronominalStart) variants.add(api.normalizeAnswerText(subject+' '+expected));
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
