/* COQ — Práctica de conjugación */
(function(){
  const U=window.COQ_CONJ_UTILS;
  const conjugations=U.conjugations, verbGroups=U.verbGroups, verbMeta=U.verbMeta;
  const resolver=window.COQ_PATTERN_RESOLVER;
  const engine=window.COQ_CONJ_ENGINE;
  const C=window.COQ_CONJ_COMPOUND;
  const constructions=window.COQ_COMPOUND_CONSTRUCTION_FILTERS||{};
  const getRecord=v=>verbMeta[v]||((resolver&&typeof resolver.resolveRecord==='function')?resolver.resolveRecord(v):null);
  const compoundTenses=C?.compoundTenses||[];
  const simpleTenses=C?.simpleTenses||[];
  const allTenses=C?.allTenses||[];
  const SUBJECT_VARIANTS={
    je:['je (féminin singulier)','je (masculin singulier)'],tu:['tu (féminin singulier)','tu (masculin singulier)'],il:['il'],elle:['elle'],
    on:['on (masculin singulier)','on (masculin pluriel)','on (féminin pluriel)'],nous:['nous (masculin pluriel)','nous (féminin pluriel)'],
    vous:['vous (masculin singulier)','vous (féminin singulier)','vous (masculin pluriel)','vous (féminin pluriel)'],ils:['ils'],elles:['elles']
  };
  let session={questions:[],index:0,correct:0,results:[],locked:false};

  function matchesGroup(v,group){
    if(!group || group==='Todos')return true;
    const m=getRecord(v)||{};
    const pattern=m.pattern || (resolver&&typeof resolver.resolvePattern==='function'?resolver.resolvePattern(v):null);
    const legacy=verbGroups[v];
    if(group==='Premier groupe verbes en -GER' || group==='Premier groupe verbes en GER') return pattern==='er-ger';
    if(group==='Premier groupe verbe en -CER' || group==='Premier groupe verbes en CER' || group==='Premier groupe verbe en CER') return pattern==='er-cer';
    if(group==='Premier groupe verbes en -ELER') return pattern==='er-eler';
    if(group==='Premier groupe verbes en -ETER') return pattern==='er-eter';
    if(group==='Premier groupe verbes en -YER') return pattern==='yer';
    if(group==='Premier groupe verbe en -E (È) + consonne + ER') return pattern==='er-e-accent';
    if(group==='Premier groupe normal') return pattern==='regular-er';
    if(group==='Deuxième groupe') return Number(m.groupe)===2 || legacy==='Deuxième groupe';
    if(group==='Verbes du troisième groupe') return Number(m.groupe)===3 || legacy==='Verbes du troisième groupe';
    return legacy===group || String(m.groupe)===String(group);
  }

  function answerModel(answer){
    const normalize=U.normalizeAnswerText||function(v){return String(v||'').trim().toLowerCase().replace(/\s+/g,' ');};
    const accepted=String(answer??'').split(/\s+\/\s+/).map(normalize).filter(Boolean);
    const unique=[...new Set(accepted)];
    return {displayAnswer:unique[0]||'',acceptedAnswers:unique};
  }

  function pushQuestion(pool,verb,tense,subject,answer){
    const model=answerModel(answer);
    if(!model.displayAnswer)return;
    pool.push({verb,tense,subject,answer:model.displayAnswer,displayAnswer:model.displayAnswer,acceptedAnswers:model.acceptedAnswers});
  }

  function buildQuestions(verb,tense,group,construction,auxiliary){
    let pool=[];
    const add=v=>{
      const meta=getRecord(v);
      if(!meta)return;
      if(!verb&&!matchesGroup(v,group))return;
      if(matchesGroup(v,group)===false)return;
      if(!matchesConstruction(v,construction))return;
      const data=conjugations[v]||{};
      const ts=tense==='Todos los tiempos'?Array.from(new Set([...Object.keys(data),...allTenses])):[tense];
      ts.forEach(t=>{
        const hasExplicit=!!data[t];
        const isSimple=simpleTenses.includes(t);
        const isCompound=compoundTenses.includes(t);
        if(!hasExplicit && !isSimple && !isCompound)return;
        if(!matchesAuxiliary(v,t,auxiliary))return;
        let rows=(engine&&engine.rowsFor)?engine.rowsFor(v,t):data[t];
        if(engine&&engine.rowsForConstruction&&construction){
          const constructionRows=engine.rowsForConstruction(v,t,construction);
          rows=constructionRows.length?constructionRows:rows;
        }
        U.expandPracticeRows(rows).forEach(r=>{
          if(isCompound && SUBJECT_VARIANTS[PSubject(String(r.subject||'').split(' (')[0].trim())] && engine&&engine.conjugate){
            const baseSubject=PSubject(String(r.subject||'').split(' (')[0].trim());
            SUBJECT_VARIANTS[baseSubject].forEach(subject=>{
              const answer=engine.conjugate(v,t,subject,construction||((meta.pronominal)?'pronomiale':'non-pronomiale'));
              if(answer!=null)pushQuestion(pool,v,t,formatPracticeSubject(subject,t,true),answer);
            });
          }else{
            const answer=(engine&&engine.conjugate)?engine.conjugate(v,t,r.subject,construction||((meta.pronominal)?'pronomiale':'non-pronomiale')):r.answer;
            const finalAnswer=answer==null?r.answer:answer;
            if(finalAnswer!=null && String(finalAnswer).trim()!=='')pushQuestion(pool,v,t,formatPracticeSubject(r.subject,t,isCompound),finalAnswer);
          }
        });
      });
    };
    if(verb)add(verb);else Object.keys(conjugations).forEach(add);
    if(!pool.length)return [];
    const buckets=new Map();
    U.shuffleArray(pool).forEach(q=>{if(!buckets.has(q.subject))buckets.set(q.subject,[]);buckets.get(q.subject).push(q);});
    const subjects=U.shuffleArray([...buckets.keys()]),selected=[];
    while(selected.length<20){
      const available=subjects.filter(s=>(buckets.get(s)||[]).length&&(!selected.length||s!==selected[selected.length-1].subject));
      if(!available.length)break;
      const subject=available[selected.length%available.length],bucket=buckets.get(subject);
      selected.push({...bucket.splice(Math.floor(Math.random()*bucket.length),1)[0]});
    }
    if(selected.length<20){
      let leftovers=[];buckets.forEach(list=>leftovers.push(...list));leftovers=U.shuffleArray(leftovers);
      while(selected.length<20&&leftovers.length){let idx=leftovers.findIndex(q=>!selected.length||q.subject!==selected[selected.length-1].subject);if(idx<0)idx=0;selected.push({...leftovers.splice(idx,1)[0]});}
    }
    const reusable=U.shuffleArray(pool);let guard=0;
    while(selected.length<20&&reusable.length&&guard<200){const last=selected[selected.length-1]?.subject;const idx=reusable.findIndex(q=>q.subject!==last);const pick=idx>=0?reusable.splice(idx,1)[0]:reusable.shift();selected.push({...pick});guard++;if(!reusable.length)reusable.push(...U.shuffleArray(pool));}
    return selected.slice(0,20);
  }

  function formatPracticeSubject(subject,tense,isCompound){
    const raw=String(subject||'').trim(),base=PSubject(raw),compound=!!isCompound,isSubjonctif=tense==='subjonctif présent'||tense==='subjonctif passé';
    const variants=compound?SUBJECT_VARIANTS:{};
    const cleanBase=base||raw,suffix=raw.match(/\s*(\([^)]*\))\s*$/)?.[1]||'';
    if(isSubjonctif){const prefix={je:'que je',tu:'que tu',il:"qu'il",elle:"qu'elle",on:"qu'on",nous:'que nous',vous:'que vous',ils:"qu'ils",elles:"qu'elles"}[cleanBase];return prefix?prefix+(suffix?' '+suffix:''):raw;}
    return variants[cleanBase]?.includes(raw)?raw:(variants[cleanBase]?.[0]&&compound?variants[cleanBase][0]:raw);
  }

  function PSubject(subject){let raw=String(subject||'').trim().replace(/\s*\([^)]*\)\s*$/,'').trim().toLowerCase();raw=raw.replace(/^qu['’]/,'').replace(/^que\s+/,'');if(raw==="j'")return 'je';return raw;}
  function matchesConstruction(v,construction){if(!construction)return true;const m=getRecord(v)||{};if(construction==='pronominale')return m.pronominal===true;if(construction==='non-pronominale')return m.pronominal!==true;return true;}
  function matchesAuxiliary(v,tense,auxiliary){
    if(!auxiliary||tense==='Todos los tiempos')return true;
    const m=getRecord(v)||{};
    if(!compoundTenses.includes(tense))return true;