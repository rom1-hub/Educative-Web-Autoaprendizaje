/* COQ — Utilidades de Conjugación
 * Solo funciones compartidas. No contiene interfaz ni flujo de práctica.
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
    const variants=new Set([expected]);
    const rawSubject=String(q.subject||'').trim();
    if(!rawSubject)return variants;

    // En impératif, le sujet no hace parte de la respuesta escrita.
    // La única respuesta válida es la forma verbal sola: parle, prends, sois, etc.
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

    const startsWithVowel=/^[aeiouyàâäéèêëîïôöùûüÿœæ]/i.test(expected);
    if(base==='je'){
      // Para una forma que empieza por vocal, la forma escrita debe llevar la
      // elisión: "j'ai", nunca "je ai". Para consonantes se conserva "je ...".
      if(!startsWithVowel) variants.add(api.normalizeAnswerText('je '+expected));
      if(!/^j['’]/.test(expected) && startsWithVowel){
        variants.add(api.normalizeAnswerText("j'"+expected));
      }
    }else{
      variants.add(api.normalizeAnswerText(base+' '+expected));
    }

    const isSubjonctif=/^subjonctif\s+(présent|passé)$/i.test(String(q.tense||''));
    if(isSubjonctif){
      const queSubject={je:"que je",tu:'que tu',il:"qu'il",elle:"qu'elle",on:"qu'on",nous:'que nous',vous:'que vous',ils:"qu'ils",elles:"qu'elles"}[base];
      if(queSubject){
        // En subjonctif, "que je aie" / "que je sois" es incorrecto:
        // delante de vocal se exige la elisión "que j'aie" / "que je sois".
        if(!(base==='je' && startsWithVowel)){
          variants.add(api.normalizeAnswerText(queSubject+' '+expected));
        }
        if(base==='je' && !/^j['’]/.test(expected) && startsWithVowel){
          variants.add(api.normalizeAnswerText("que j'"+expected));
        }
      }
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

  // "Ver un verbo": marca los sujetos del imperativo y añade la nota explicativa.
  function decorateImperativeLookup(){
    document.querySelectorAll('#conjResult .tense-block').forEach(block=>{
      const title=block.querySelector('.tense-head h3');
      const table=block.querySelector('.tense-table');
      if(!title||!table||title.textContent.trim()!=='impératif présent')return;
      if(table.dataset.imperativeDecorated==='true')return;

      table.querySelectorAll('tbody tr').forEach(row=>{
        const subjectCell=row.querySelector('td:first-child');
        if(!subjectCell)return;
        const subject=subjectCell.textContent.trim();
        if(subject==='tu'||subject==='nous'||subject==='vous'){
          subjectCell.textContent=subject+'*';
        }
      });

      const tbody=table.querySelector('tbody');
      if(tbody){
        const noteRow=document.createElement('tr');
        const noteCell=document.createElement('td');
        noteCell.colSpan=2;
        noteCell.textContent='* En el imperativo los sujetos desaparecen. No se pronuncian, ni se escriben.';
        noteRow.appendChild(noteCell);
        tbody.appendChild(noteRow);
      }

      table.dataset.imperativeDecorated='true';
    });
  }

  function initImperativeLookupDecorator(){
    const result=document.querySelector('#conjResult');
    if(!result)return;
    decorateImperativeLookup();
    new MutationObserver(decorateImperativeLookup).observe(result,{childList:true,subtree:true});
  }

  // faire: completar los tiempos simples que faltaban en el catálogo.
  // Los cinco tiempos compuestos se generan automáticamente a partir de
  // passé composé → présent, plus-que-parfait → imparfait,
  // conditionnel passé → conditionnel présent, futur antérieur → futur simple
  // y subjonctif passé → subjonctif présent.
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

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',initImperativeLookupDecorator);
  }else{
    initImperativeLookupDecorator();
  }

  window.COQ_CONJ_UTILS=api;
})();