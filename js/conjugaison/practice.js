/* COQ — Práctica de conjugación */
(function(){
  const U=window.COQ_CONJ_UTILS;
  const conjugations=U.conjugations, verbGroups=U.verbGroups, verbMeta=U.verbMeta;
  const engine=window.COQ_CONJ_ENGINE;
  let session={questions:[],index:0,correct:0,results:[],locked:false};

  function matchesGroup(v,group){
    if(!group || group==='Todos')return true;
    const m=verbMeta[v]||{};
    const pattern=m.pattern || (window.COQ_PATTERN_RESOLVER&&window.COQ_PATTERN_RESOLVER.resolvePattern?window.COQ_PATTERN_RESOLVER.resolvePattern(v):null);
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
      if(!conjugations[v])return;
      if(!verb&&!matchesGroup(v,group))return;
      if(matchesGroup(v,group)===false)return;
      if(!matchesConstruction(v,construction))return;
      const ts=tense==='Todos los tiempos'?Array.from(new Set([...Object.keys(conjugations[v]),...simpleTenses,...compoundTenses])):[tense];
      ts.forEach(t=>{
        const hasExplicit=!!conjugations[v][t];
        const isSimple=simpleTenses.includes(t);
        const isCompound=compoundTenses.includes(t);
        if(!hasExplicit && !isSimple && !isCompound)return;
        if(!matchesAuxiliary(v,t,auxiliary))return;
        let rows=(engine&&engine.rowsFor)?engine.rowsFor(v,t):conjugations[v][t];
        if(engine&&engine.rowsForConstruction&&construction){
          const constructionRows=engine.rowsForConstruction(v,t,construction);
          rows=constructionRows.length?constructionRows:rows;
        }
        U.expandPracticeRows(rows).forEach(r=>{
          const variants={
            je:['je (féminin singulier)','je (masculin singulier)'],tu:['tu (féminin singulier)','tu (masculin singulier)'],il:['il'],elle:['elle'],
            on:['on (masculin singulier)','on (masculin pluriel)','on (féminin pluriel)'],nous:['nous (masculin pluriel)','nous (féminin pluriel)'],
            vous:['vous (masculin singulier)','vous (féminin singulier)','vous (masculin pluriel)','vous (féminin pluriel)'],ils:['ils'],elles:['elles']
          };
          if(isCompound && variants[PSubject(String(r.subject||'').split(' (')[0].trim())] && engine&&engine.conjugate){
            const baseSubject=PSubject(String(r.subject||'').split(' (')[0].trim());
            variants[baseSubject].forEach(subject=>{
              const answer=engine.conjugate(v,t,subject,construction||((verbMeta[v]||{}).pronominal?'pronominale':'non-pronominale'));
              if(answer!=null)pushQuestion(pool,v,t,formatPracticeSubject(subject,t,true),answer);
            });
          }else{
            const answer=(engine&&engine.conjugate)?engine.conjugate(v,t,r.subject,construction||((verbMeta[v]||{}).pronominal?'pronominale':'non-pronominale')):r.answer;
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
  const compoundTenses=['passé composé','plus-que-parfait','conditionnel passé','futur antérieur','subjonctif passé'];
  const simpleTenses=["présent de l'indicatif",'impératif présent','imparfait','futur simple','conditionnel présent','subjonctif présent'];

  function formatPracticeSubject(subject,tense,isCompound){
    const raw=String(subject||'').trim(),base=PSubject(raw),compound=!!isCompound,isSubjonctif=tense==='subjonctif présent'||tense==='subjonctif passé';
    let variants={};
    if(compound)variants={je:['je (féminin singulier)','je (masculin singulier)'],tu:['tu (féminin singulier)','tu (masculin singulier)'],il:['il'],elle:['elle'],on:['on (masculin singulier)','on (masculin pluriel)','on (féminin pluriel)'],nous:['nous (masculin pluriel)','nous (féminin pluriel)'],vous:['vous (masculin singulier)','vous (féminin singulier)','vous (masculin pluriel)','vous (féminin pluriel)'],ils:['ils'],elles:['elles']};
    const cleanBase=base||raw,suffix=raw.match(/\s*(\([^)]*\))\s*$/)?.[1]||'';
    if(isSubjonctif){const prefix={je:'que je',tu:'que tu',il:"qu'il",elle:"qu'elle",on:"qu'on",nous:'que nous',vous:'que vous',ils:"qu'ils",elles:"qu'elles"}[cleanBase];return prefix?prefix+(suffix?' '+suffix:''):raw;}
    return variants[cleanBase]?.includes(raw)?raw:(variants[cleanBase]?.[0]&&compound?variants[cleanBase][0]:raw);
  }
  function PSubject(subject){let raw=String(subject||'').trim().replace(/\s*\([^)]*\)\s*$/,'').trim().toLowerCase();raw=raw.replace(/^qu['’]/,'').replace(/^que\s+/,'');if(raw==="j'")return 'je';return raw;}
  function formatSubjonctifSubject(subject){const raw=String(subject||'').trim(),match=raw.match(/^([^\s(]+)(.*)$/);if(!match)return raw;const base=match[1].toLowerCase(),suffix=match[2]||'',prefix={"j'":"que j'",je:'que je',tu:'que tu',il:"qu'il",elle:"qu'elle",on:"qu'on",nous:'que nous',vous:'que vous',ils:"qu'ils",elles:"qu'elles"}[base];return prefix?prefix+suffix:raw;}
  function matchesConstruction(v,construction){if(!construction)return true;const m=verbMeta[v]||{};if(construction==='pronominale')return m.pronominal===true;if(construction==='non-pronominale')return m.pronominal!==true;return true;}
  function matchesAuxiliary(v,tense,auxiliary){if(!auxiliary)return true;if(tense==='Todos los tiempos')return true;const m=verbMeta[v]||{};if(!compoundTenses.includes(tense))return true;if(auxiliary==='avec-avoir')return m.auxiliaire==='avoir'&&!m.pronominal;if(auxiliary==='avec-etre')return m.auxiliaire==='être'&&!m.pronominal;if(auxiliary==='avec-avoir-et-etre')return m.auxiliaire==='avoir'||m.auxiliaire==='être';return true;}
  function samePracticeAnswer(value,q){const normalize=U.normalizeAnswerText||function(s){return String(s??'').trim().toLocaleLowerCase().replace(/\s+/g,' ');};const input=normalize(value);if(!input)return false;const accepted=Array.isArray(q?.acceptedAnswers)&&q.acceptedAnswers.length?q.acceptedAnswers:[q?.displayAnswer||q?.answer];return accepted.map(normalize).filter(Boolean).includes(input);}
  function updatePracticeAuxiliaryOptions(){const tense=document.querySelector('#practiceTense')?.value,verb=U.normalizeVerb(document.querySelector('#practiceVerb')?.value),construction=document.querySelector('#practiceConstruction')?.value,aux=document.querySelector('#practiceAuxiliary'),help=document.querySelector('#practiceAuxiliaryHelp');if(!aux)return;aux.innerHTML='';let disabledReason='';if(verb)disabledReason='Déterminé par le verbe sélectionné';else if(construction==='pronominale')disabledReason='Non disponible pour les verbes pronominaux';else if(!tense||!compoundTenses.includes(tense))disabledReason=tense==='Todos los tiempos'?'Disponible uniquement lorsqu’un temps composé est sélectionné.':'Non disponible pour un temps simple';if(disabledReason){aux.disabled=true;const o=document.createElement('option');o.value='';o.selected=true;o.textContent=disabledReason;aux.appendChild(o);if(help){if(verb)help.textContent='Le verbe sélectionné détermine déjà le verbe auxiliaire dans Conjugaison.';else if(construction==='pronominale')help.textContent='La construction pronominale détermine l’auxiliaire dans Conjugaison.';else help.textContent=tense==='Todos los tiempos'?'Disponible uniquement lorsqu’un temps composé est sélectionné.':'Disponible uniquement avec un temps composé.';}return;}aux.disabled=false;[['','- sélectionner -'],['avec-avoir','Avec auxiliaire AVOIR'],['avec-etre','Avec auxiliaire ÊTRE'],['avec-avoir-et-etre','Avec auxiliaire AVOIR et ÊTRE']].forEach(([value,label])=>{const o=document.createElement('option');o.value=value;o.textContent=label;aux.appendChild(o);});if(help)help.textContent='Este filtro se aplica a todos los tiempos compuestos.';}
  function updatePracticeConstructionOptions(){const construction=document.querySelector('#practiceConstruction'),help=document.querySelector('#practiceConstructionHelp'),verb=U.normalizeVerb(document.querySelector('#practiceVerb')?.value);if(!construction)return;if(verb){const meta=verbMeta[verb]||{},isPronominal=meta.pronominal===true||meta.construction==='pronominale'||/^se\s/.test(verb);construction.disabled=true;construction.innerHTML='<option value="'+(isPronominal?'pronominale':'non-pronominale')+'" selected>'+ (isPronominal?'Verbes pronominaux':'Verbes non pronominaux') +'</option>';if(help)help.textContent='Déterminée par le verbe sélectionné.';return;}construction.disabled=false;construction.innerHTML='<option value="" selected>-seleccionar-</option><option value="non-pronominale">Verbes non pronominaux</option><option value="pronominale">Verbes pronominaux</option>';if(help)help.textContent='Puedes elegir una construcción para afinar el ejercicio.';}
  function updatePracticeGroupState(){const verb=U.normalizeVerb(document.querySelector('#practiceVerb')?.value),group=document.querySelector('#practiceGroup'),help=document.querySelector('#practiceGroupHelp');if(!group)return;if(verb){group.disabled=true;group.innerHTML='<option value="" selected>No necesario: verbo concreto</option>';if(help)help.textContent='';}else{group.disabled=false;group.innerHTML='<option value="" selected>-seleccionar-</option><option value="Todos">Todos</option><option>Premier groupe normal</option><option>Premier groupe verbes en GER</option><option>Premier groupe verbes en CER</option><option>Premier groupe verbes en -ELER</option><option>Premier groupe verbes en -ETER</option><option>Premier groupe verbes en -YER</option><option>Premier groupe verbe en -E (È) + consonne + ER</option><option>Deuxième groupe</option><option>Verbes du troisième groupe</option>';if(help)help.textContent='';}}
  function startSession(){const verb=U.normalizeVerb(document.querySelector('#practiceVerb')?.value),tense=document.querySelector('#practiceTense')?.value,group=document.querySelector('#practiceGroup')?.value,construction=document.querySelector('#practiceConstruction')?.value,auxiliary=document.querySelector('#practiceAuxiliary')?.value,msg=document.querySelector('#practiceMessage');if(!msg)return;if(!tense){msg.className='form-message error';msg.textContent='Debes seleccionar un tiempo verbal para comenzar la práctica.';return;}if(verb&&!conjugations[verb]){msg.className='form-message error';msg.textContent='En este prototipo, ese verbo todavía no está en la base de demostración.';return;}const questions=buildQuestions(verb,tense,group,construction,auxiliary);if(questions.length<20){msg.className='form-message error';msg.textContent='No hay suficientes preguntas disponibles para crear una sesión de 20 preguntas con esta configuración.';return;}session={questions,index:0,correct:0,results:[],locked:false};document.querySelector('#practiceSession')?.classList.remove('hidden');document.querySelector('#practiceCriteria').textContent=[verb||'grupo',tense,group||'',construction||'',auxiliary||''].filter(Boolean).join(' · ');showQuestion();document.querySelector('#practiceSession')?.scrollIntoView({behavior:'smooth',block:'start'});}
  function showQuestion(){const q=session.questions[session.index];session.locked=false;q.attempts=0;q.firstError='';q.secondError='';q.mustTypeCorrect=false;document.querySelector('#questionVerb').textContent=`${q.verb} · ${q.tense}`;document.querySelector('#questionSubject').textContent=q.subject;const input=document.querySelector('#answerInput');input.value='';input.className='';input.disabled=false;const fb=document.querySelector('#practiceFeedback');fb.className='feedback-box';fb.textContent='';document.querySelector('#practiceProgressText').textContent=`Question ${session.index+1} / 20`;document.querySelector('#practiceProgressBar').style.width=`${(session.index/20)*100}%`;setTimeout(()=>input.focus(),80);}
  function renderSecondErrorFeedback(q){const fb=document.querySelector('#practiceFeedback');fb.className='feedback-box warn';fb.innerHTML='Réponse incorrecte.<br>Réponse correcte : <strong>'+U.escapeHtml(q.displayAnswer||q.answer)+'</strong><br>Escribe la respuesta correcta para continuar.';}
  function validateAnswer(){if(session.locked)return;const q=session.questions[session.index],input=document.querySelector('#answerInput'),value=input.value.trim();if(!value)return;if(q.mustTypeCorrect){if(samePracticeAnswer(value,q)){input.className='success';const fb=document.querySelector('#practiceFeedback');fb.className='feedback-box ok';fb.textContent='✓ Correcto. Pasamos a la siguiente pregunta.';session.locked=true;setTimeout(()=>{session.index++;session.index>=20?finishSession():showQuestion()},650);}else{input.className='error-second';renderSecondErrorFeedback(q);input.focus();}return;}q.attempts++;if(samePracticeAnswer(value,q)){input.className='success';session.correct++;let outcome;if(q.attempts===1)outcome='correct-first';else if(q.attempts===2)outcome='correct-after-first-error';else outcome='correct-after-help';session.results.push({question:q,finalAnswer:value,outcome});session.locked=true;const fb=document.querySelector('#practiceFeedback');fb.className='feedback-box ok';fb.textContent='✓ Correcto. Pasamos a la siguiente question.';document.querySelector('#practiceProgressBar').style.width=`${((session.index+1)/20)*100}%`;setTimeout(()=>{session.index++;session.index>=20?finishSession():showQuestion()},650);}else if(q.attempts===1){q.firstError=value;input.className='error-first';const fb=document.querySelector('#practiceFeedback');fb.className='feedback-box warn';fb.textContent='Réponse incorrecte. Essaie encore.';}else{q.secondError=value;input.className='error-second';renderSecondErrorFeedback(q);q.mustTypeCorrect=true;session.locked=false;input.value='';input.disabled=false;input.focus();const next=document.querySelector('#nextQuestion');if(next)next.classList.add('hidden');session.results.push({question:q,finalAnswer:value,outcome:'incorrect-twice'});}}
  function nextQuestion(){const q=session.questions[session.index];if(q&&q.mustTypeCorrect)return;document.querySelector('#nextQuestion')?.classList.add('hidden');session.index++;session.index>=20?finishSession():showQuestion();}
  function finishSession(){const score=session.results.reduce((sum,r)=>sum+(r.outcome==='correct-first'?1:r.outcome==='correct-after-first-error'?.5:0),0);const total=20;const correct=session.results.filter(r=>r.outcome!=='incorrect-twice').length;const errors=total-correct;const detail={results:session.results.map(r=>({question:{...r.question,acceptedAnswers:[...(r.question.acceptedAnswers||[]) ]},finalAnswer:r.finalAnswer,outcome:r.outcome})),correct,errors,score};document.dispatchEvent(new CustomEvent('coq:practice-finished',{detail}));}
  function resetPracticeForm(){session={questions:[],index:0,correct:0,results:[],locked:false};const verb=document.querySelector('#practiceVerb'),tense=document.querySelector('#practiceTense'),group=document.querySelector('#practiceGroup'),construction=document.querySelector('#practiceConstruction'),auxiliary=document.querySelector('#practiceAuxiliary'),message=document.querySelector('#practiceMessage');if(verb)verb.value='';if(tense){tense.value='';tense.selectedIndex=0;}if(group){group.value='';group.selectedIndex=0;}if(construction){construction.value='';construction.selectedIndex=0;}if(auxiliary){auxiliary.value='';auxiliary.selectedIndex=0;}if(message){message.textContent='';message.className='form-message';}document.querySelector('#practiceSession')?.classList.add('hidden');document.querySelector('#practiceFeedback')?.replaceChildren();const answer=document.querySelector('#answerInput');if(answer){answer.value='';answer.className='';answer.disabled=false;}document.querySelector('#questionVerb')?.replaceChildren();document.querySelector('#questionSubject')?.replaceChildren();document.querySelector('#practiceProgressText')?.replaceChildren();document.querySelector('#practiceCriteria')?.replaceChildren();const progress=document.querySelector('#practiceProgressBar');if(progress)progress.style.width='0%';document.querySelector('#nextQuestion')?.classList.add('hidden');document.querySelector('#practiceSummary')?.classList.add('hidden');document.querySelector('#practiceResultsBody')?.replaceChildren();updatePracticeGroupState();updatePracticeConstructionOptions();updatePracticeAuxiliaryOptions();}
  function bind(){document.querySelector('#startPractice')?.addEventListener('click',startSession);document.querySelector('#validateAnswer')?.addEventListener('click',validateAnswer);document.querySelector('#nextQuestion')?.addEventListener('click',nextQuestion);document.querySelector('#answerInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')validateAnswer();});document.querySelector('#clearVerb')?.addEventListener('click',resetPracticeForm);document.querySelector('#practiceVerb')?.addEventListener('input',()=>{updatePracticeGroupState();updatePracticeConstructionOptions();updatePracticeAuxiliaryOptions();});document.querySelector('#practiceTense')?.addEventListener('change',updatePracticeAuxiliaryOptions);document.querySelector('#practiceConstruction')?.addEventListener('change',updatePracticeAuxiliaryOptions);updatePracticeGroupState();updatePracticeConstructionOptions();updatePracticeAuxiliaryOptions();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  window.COQ_CONJ_PRACTICE={buildQuestions,updatePracticeGroupState,resetPracticeForm};
})();
