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
        if(!startsWithVowel) variants.add(api.normalizeAnswerText('je '+form));
        if(!/^j['’]/.test(form) && startsWithVowel){
          variants.add(api.normalizeAnswerText("j'"+form));
        }
      }else{
        variants.add(api.normalizeAnswerText(base+' '+form));
      }

      const isSubjonctif=/^subjonctif\s+(présent|passé)$/i.test(String(q.tense||''));
      if(isSubjonctif){
        const queSubject={je:"que je",tu:'que tu',il:"qu'il",elle:"qu'elle",on:"qu'on",nous:'que nous',vous:'que vous',ils:"qu'ils",elles:"qu'elles"}[base];
        if(queSubject){
          if(!(base==='je' && startsWithVowel)){
            variants.add(api.normalizeAnswerText(queSubject+' '+form));
          }
          if(base==='je' && !/^j['’]/.test(form) && startsWithVowel){
            variants.add(api.normalizeAnswerText("que j'"+form));
          }
        }
      }
    });
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
        if(subject==='tu'||subject==='nous'||subject==='vous')subjectCell.textContent=subject+'*';
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

  // Defensa central del patrón -YER: las formas de nous/vous conservan
  // la terminación completa, especialmente la "s" final de -ons/-ez.
  function installYerIntegrityPatch(){
    const engine=window.COQ_CONJ_ENGINE;
    if(!engine||typeof engine.conjugate!=='function')return;
    const originalConjugate=engine.conjugate.bind(engine);
    const originalRowsFor=typeof engine.rowsFor==='function'?engine.rowsFor.bind(engine):null;
    const originalRowsForLookup=typeof engine.rowsForLookup==='function'?engine.rowsForLookup.bind(engine):null;
    const simple=new Set(["présent de l'indicatif",'imparfait','futur simple','conditionnel présent','subjonctif présent','impératif présent']);
    const ends={
      present:{je:'e',tu:'es',il:'e',elle:'e',on:'e',nous:'ons',vous:'ez',ils:'ent',elles:'ent'},
      imparfait:{je:'ais',tu:'ais',il:'ait',elle:'ait',on:'ait',nous:'ions',vous:'iez',ils:'aient',elles:'aient'},
      futur:{je:'ai',tu:'as',il:'a',elle:'a',on:'ons',nous:'ons',vous:'ez',ils:'ont',elles:'ont'},
      conditionnel:{je:'ais',tu:'ais',il:'ait',elle:'ait',on:'ait',nous:'ions',vous:'iez',ils:'aient',elles:'aient'},
      subjonctif:{je:'e',tu:'es',il:'e',elle:'e',on:'e',nous:'ions',vous:'iez',ils:'ent',elles:'ent'}
    };
    function baseSubject(subject){
      const clean=String(subject||'').trim().toLowerCase().replace(/\s*\([^)]*\)\s*$/,'').trim();
      if(clean==="j'"||clean==='je'||clean==="que j'"||clean==='que je')return'je';
      if(/^qu['’]il$/.test(clean)||clean==='que il')return'il';
      if(/^qu['’]elle$/.test(clean)||clean==='que elle')return'elle';
      if(/^qu['’]on$/.test(clean)||clean==='que on')return'on';
      if(/^qu['’]ils$/.test(clean)||clean==='que ils')return'ils';
      if(/^qu['’]elles$/.test(clean)||clean==='que elles')return'elles';
      return clean;
    }
    function isYer(verb){
      const resolver=window.COQ_PATTERN_RESOLVER;
      return !!(resolver&&resolver.resolvePattern&&resolver.resolvePattern(verb)==='yer');
    }
    function yerForm(verb,tense,subject){
      if(!isYer(verb)||!simple.has(tense))return null;
      const catalog=window.COQ_VERBS||{};
      const key=String(verb||'').trim().toLowerCase();
      const r=catalog[key];
      if(!r)return null;
      const inf=r.infinitif_base||r.infinitif||key;
      const s=baseSubject(subject);
      const stem=inf.slice(0,-3),yStem=stem+'y',iStem=stem+'i';
      if(tense==="présent de l'indicatif")return(s==='nous'||s==='vous'?yStem:iStem)+(ends.present[s]||'');
      if(tense==='imparfait')return yStem+(ends.imparfait[s]||'');
      if(tense==='futur simple')return iStem+'er'+(ends.futur[s]||'');
      if(tense==='conditionnel présent')return iStem+'er'+(ends.conditionnel[s]||'');
      if(tense==='subjonctif présent')return(s==='nous'||s==='vous'?yStem:iStem)+(ends.subjonctif[s]||'');
      if(tense==='impératif présent'){
        if(!['tu','nous','vous'].includes(s))return null;
        return(s==='nous'||s==='vous'?yStem:iStem)+(ends.present[s]||'').replace(/s$/,'');
      }
      return null;
    }
    engine.conjugate=function(verb,tense,subject,construction){
      const form=yerForm(verb,tense,subject);
      return form!=null?form:originalConjugate(verb,tense,subject,construction);
    };
    if(originalRowsFor)engine.rowsFor=function(verb,tense,construction){
      if(!isYer(verb)||!simple.has(tense))return originalRowsFor(verb,tense,construction);
      const subjects=tense==='impératif présent'?['tu','nous','vous']:['je','tu','il','elle','on','nous','vous','ils','elles'];
      return subjects.map(subject=>[subject,engine.conjugate(verb,tense,subject,construction)]).filter(row=>row[1]!=null&&String(row[1]).trim()!=='');
    };
    if(originalRowsForLookup)engine.rowsForLookup=function(verb,tense,construction){
      if(!isYer(verb)||!simple.has(tense))return originalRowsForLookup(verb,tense,construction);
      const subjects=tense==='impératif présent'?['tu','nous','vous']:['je','tu','il','elle','on','nous','vous','ils','elles'];
      return subjects.map(subject=>[subject,engine.conjugate(verb,tense,subject,construction)]).filter(row=>row[1]!=null&&String(row[1]).trim()!=='');
    };
    if(typeof window.COQ_CONJ_UTILS.sameAnswer==='function'){
      const oldSameAnswer=window.COQ_CONJ_UTILS.sameAnswer.bind(window.COQ_CONJ_UTILS);
      window.COQ_CONJ_UTILS.sameAnswer=function(answer,q){
        if(q&&isYer(q.verb)&&simple.has(String(q.tense||'').trim())){
          const expected=yerForm(q.verb,q.tense,q.subject);
          if(expected!=null)return api.normalizeAnswerText(answer)===api.normalizeAnswerText(expected);
        }
        return oldSameAnswer(answer,q);
      };
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){initImperativeLookupDecorator();installYerIntegrityPatch();});
  }else{
    initImperativeLookupDecorator();
    installYerIntegrityPatch();
  }

  window.COQ_CONJ_UTILS=api;
})();