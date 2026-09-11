/* COQ — Práctica de conjugación */
(function(){
  const U=window.COQ_CONJ_UTILS;
  const P=window.COQ_CONJ_PRONOUNS;
  const dataModel=window.COQ_CONJ_DATA_MODEL;
  const conjugations=U.conjugations, verbMeta=U.verbMeta;
  const categoryResolver=window.COQ_CATEGORY_RESOLVER;
  const constructionResolver=window.COQ_CONSTRUCTION_RESOLVER;
  const auxiliaryResolver=window.COQ_AUXILIARY_RESOLVER;
  const engine=window.COQ_CONJ_ENGINE;
  const C=window.COQ_CONJ_COMPOUND;
  const constructionOptions=window.COQ_CONSTRUCTION_OPTIONS||[];
  const auxiliaryOptions=window.COQ_AUXILIARY_OPTIONS||[];
  const getRecord=v=>dataModel?.get?.(v)||null;
  const compoundTenses=C?.compoundTenses||[];
  const simpleTenses=C?.simpleTenses||[];
  const allTenses=C?.allTenses||[];
  const subjectVariants=P?.subjectVariants||{};
  let session={questions:[],index:0,correct:0,results:[],locked:false};
  function matchesCategory(v,category){
    if(!category || category==='all')return true;
    return !!(categoryResolver&&typeof categoryResolver.matchesCategory==='function'&&categoryResolver.matchesCategory(v,category));
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
  function practiceSubjectKey(subject){return P.baseSubject(subject)||String(subject||'').trim().toLowerCase();}
  function practiceVariantKey(subject){return String(subject||'').trim().toLowerCase();}
  function practiceQuestionKey(q){return [q.verb,q.tense,practiceVariantKey(q.subject),q.displayAnswer||q.answer].join('|');}
  function selectPracticeQuestions(pool,limit){
    const unique=[],seen=new Set();
    U.shuffleArray(pool).forEach(q=>{const key=practiceQuestionKey(q);if(seen.has(key))return;seen.add(key);unique.push(q);});
    if(unique.length<=limit)return unique.slice(0,limit);
    const selected=[],remaining=unique.slice();
    const counts={subject:new Map(),variant:new Map(),tense:new Map(),verb:new Map()};
    const count=(map,key)=>map.get(key)||0;
    const increment=(map,key)=>map.set(key,count(map,key)+1);
    while(selected.length<limit&&remaining.length){
      const last=selected[selected.length-1];
      let bestScore=Infinity,best=[];
      remaining.forEach((q,index)=>{
        const subject=practiceSubjectKey(q.subject),variant=practiceVariantKey(q.subject),tense=q.tense,verb=q.verb;
        let score=count(counts.subject,subject)*6+count(counts.variant,variant)*2+count(counts.tense,tense)*4+count(counts.verb,verb);
        if(last){
          if(practiceSubjectKey(last.subject)===subject)score+=100;
          if(last.tense===tense)score+=12;
          if(last.verb===verb)score+=4;
        }
        if(score<bestScore){bestScore=score;best=[index];}
        else if(score===bestScore)best.push(index);
      });
      const pickIndex=best[Math.floor(Math.random()*best.length)];
      const [pick]=remaining.splice(pickIndex,1);
      selected.push({...pick});
      increment(counts.subject,practiceSubjectKey(pick.subject));
      increment(counts.variant,practiceVariantKey(pick.subject));
      increment(counts.tense,pick.tense);
      increment(counts.verb,pick.verb);
    }
    return selected;
  }
  function buildQuestions(verb,tense,category,construction,auxiliary){
    let pool=[];
    const add=v=>{
      const meta=getRecord(v);
      if(!meta)return;
      if(!verb&&!matchesCategory(v,category))return;
      if(!matchesConstruction(v,construction))return;
      const data=meta.legacyFormes||{};
      const ts=tense==='Todos los tiempos'?Array.from(new Set([...Object.keys(data),...allTenses])):[tense];
      ts.forEach(t=>{
        const hasExplicit=!!data[t];
        const isSimple=simpleTenses.includes(t);
        const isCompound=compoundTenses.includes(t);
        if(!hasExplicit && !isSimple && !isCompound)return;
        if(!matchesAuxiliary(v,t,auxiliary))return;
        let rows=(engine&&engine.rowsFor)?engine.rowsFor(v,t):data[t];
        if(engine&&engine.rowsForConstruction&&construction){
          rows=engine.rowsForConstruction(v,t,construction);
          if(!rows.length)return;
        }
        U.expandPracticeRows(rows).forEach(r=>{
          const baseSubject=P.baseSubject(String(r.subject||'').split(' (')[0].trim());
          if(isCompound && subjectVariants[baseSubject] && engine&&engine.conjugate){
            subjectVariants[baseSubject].forEach(subject=>{
              const answer=engine.conjugate(v,t,subject,construction||((meta.pronominal)?'pronominale':'non-pronominale'));
              if(answer!=null)pushQuestion(pool,v,t,P.subjectForMode(subject,(t==='subjonctif présent'||t==='subjonctif passé')?'subjonctif':'normal',answer),answer);
            });
          }else{
            const answer=(engine&&engine.conjugate)?engine.conjugate(v,t,r.subject,construction||((meta.pronominal)?'pronominale':'non-pronominale')):r.answer;
            const finalAnswer=answer==null?r.answer:answer;
            if(finalAnswer!=null && String(finalAnswer).trim()!=='')pushQuestion(pool,v,t,formatPracticeSubject(r.subject,t,isCompound),finalAnswer);
          }
        });
      });
    };
    if(verb)add(verb);else Object.keys(dataModel?.records||{}).forEach(add);
    if(!pool.length)return [];
    return selectPracticeQuestions(pool,20);
  }
  function formatPracticeSubject(subject,tense,isCompound){
    const raw=String(subject||'').trim(),base=P.baseSubject(raw),compound=!!isCompound,isSubjonctif=tense==='subjonctif présent'||tense==='subjonctif passé';
    const variants=compound?subjectVariants:{};
    const normalized=P.subjectForMode(raw,isSubjonctif?'subjonctif':'normal','');
    if(isSubjonctif)return normalized;
    return variants[base]?.includes(raw)?raw:(variants[base]?.[0]&&compound?variants[base][0]:raw);
  }
  function matchesConstruction(v,construction){
    if(!construction)return true;
    const meta=getRecord(v)||{};
    return !!(constructionResolver&&typeof constructionResolver.matchesConstruction==='function'&&constructionResolver.matchesConstruction(meta,construction));
  }
  function matchesAuxiliary(v,tense,auxiliary){
    return !!(auxiliaryResolver&&typeof auxiliaryResolver.matches==='function'&&auxiliaryResolver.matches(getRecord(v)||{},tense,auxiliary,compoundTenses,constructionResolver));
  }
  function samePracticeAnswer(value,q){const normalize=U.normalizeAnswerText||function(s){return String(s??'').trim().toLocaleLowerCase().replace(/\s+/g,' ');};const input=normalize(value);if(!input)return false;const accepted=Array.isArray(q?.acceptedAnswers)&&q.acceptedAnswers.length?q.acceptedAnswers:[q?.displayAnswer||q?.answer];return accepted.map(normalize).filter(Boolean).includes(input);}
  function updatePracticeAuxiliaryOptions(){const tense=document.querySelector('#practiceTense')?.value,verb=U.normalizeVerb(document.querySelector('#practiceVerb')?.value),construction=document.querySelector('#practiceConstruction')?.value,aux=document.querySelector('#practiceAuxiliary'),help=document.querySelector('#practiceAuxiliaryHelp');if(!aux)return;aux.innerHTML='';let disabledReason='';if(verb)disabledReason='Déterminé par le verbe sélectionné';else if(construction==='pronominale')disabledReason='Non disponible pour les verbes pronominaux';else if(!tense||!compoundTenses.includes(tense))disabledReason=tense==='Todos los tiempos'?'Disponible uniquement lorsqu’un temps composé est sélectionné.':'Non disponible pour un temps simple';if(disabledReason){aux.disabled=true;const o=document.createElement('option');o.value='';o.selected=true;o.textContent=disabledReason;aux.appendChild(o);if(help){if(verb)help.textContent='Le verbe sélectionné détermine déjà le verbe auxiliaire dans Conjugaison.';else if(construction==='pronominale')help.textContent='La construction pronominale détermine l’auxiliaire dans Conjugaison.';else help.textContent=tense==='Todos los tiempos'?'Disponible uniquement lorsqu’un temps composé est sélectionné.':'Disponible uniquement avec un temps composé.';}return;}aux.disabled=false;const placeholder=document.createElement('option');placeholder.value='';placeholder.selected=true;placeholder.textContent='- seleccionar -';aux.appendChild(placeholder);auxiliaryOptions.forEach(item=>{const o=document.createElement('option');o.value=U.escapeHtml(item.id);o.textContent=U.escapeHtml(item.label);aux.appendChild(o);});if(help)help.textContent='Este filtro se aplica a todos los tiempos compuestos.';}
  function updatePracticeConstructionOptions(){const construction=document.querySelector('#practiceConstruction'),help=document.querySelector('#practiceConstructionHelp'),verb=U.normalizeVerb(document.querySelector('#practiceVerb')?.value);if(!construction)return;if(verb){const meta=getRecord(verb)||{},isPronominal=constructionResolver?.isPronominal(meta),selectedId=isPronominal?'pronominale':'non-pronominale',selected=constructionOptions.find(item=>item.id===selectedId);construction.disabled=true;construction.innerHTML='';const o=document.createElement('option');o.value=U.escapeHtml(selectedId);o.selected=true;o.textContent=U.escapeHtml(selected?.label||selectedId);construction.appendChild(o);if(help)help.textContent='Déterminée par le verbe sélectionné.';return;}construction.disabled=false;construction.innerHTML='<option value="" selected>-seleccionar-</option>'+constructionOptions.map(item=>'<option value="'+U.escapeHtml(item.id)+'">'+U.escapeHtml(item.label)+'</option>').join('');if(help)help.textContent='Puedes elegir una construcción para afinar el ejercicio.';}
  function updatePracticeGroupState(){
    const verb=U.normalizeVerb(document.querySelector('#practiceVerb')?.value),group=document.querySelector('#practiceGroup'),help=document.querySelector('#practiceGroupHelp');
    if(!group)return;
    if(verb){group.disabled=true;group.innerHTML='<option value="" selected>No necesario: verbo concreto</option>';if(help)help.textContent='';return;}
    group.disabled=false;
    const options=categoryResolver&&typeof categoryResolver.categoryOptions==='function'?categoryResolver.categoryOptions():[];
    group.innerHTML='<option value="" selected>-seleccionar-</option>'+options.map(item=>'<option value="'+U.escapeHtml(item.id)+'">'+U.escapeHtml(item.label)+'</option>').join('');
    if(help)help.textContent='Selecciona una categoría verbal para afinar el ejercicio.';
  }
  function startSession(){const verb=U.normalizeVerb(document.querySelector('#practiceVerb')?.value),tense=document.querySelector('#practiceTense')?.value,group=document.querySelector('#practiceGroup')?.value,construction=document.querySelector('#practiceConstruction')?.value,auxiliary=document.querySelector('#practiceAuxiliary')?.value,msg=document.querySelector('#practiceMessage');if(!msg)return;if(!tense){msg.className='form-message error';msg.textContent='Debes seleccionar un tiempo verbal para comenzar la práctica.';return;}if(verb&&!getRecord(verb)){msg.className='form-message error';msg.textContent='Ese verbo no puede resolverse todavía con los patrones disponibles.';return;}const questions=buildQuestions(verb,tense,group,construction,auxiliary);if(questions.length<20){msg.className='form-message error';msg.textContent='No hay suficientes preguntas disponibles para crear una sesión de 20 preguntas con esta configuración.';return;}session={questions,index:0,correct:0,results:[],locked:false};document.querySelector('#practiceSession')?.classList.remove('hidden');document.querySelector('#practiceCriteria').textContent=[verb||'grupo',tense,group||'',construction||'',auxiliary||''].filter(Boolean).join(' · ');showQuestion();document.querySelector('#practiceSession')?.scrollIntoView({behavior:'smooth',block:'start'});}
  function showQuestion(){const q=session.questions[session.index];session.locked=false;q.attempts=0;q.firstError='';q.secondError='';q.mustTypeCorrect=false;document.querySelector('#questionVerb').textContent=`${q.verb} · ${q.tense}`;document.querySelector('#questionSubject').textContent=q.subject;const input=document.querySelector('#answerInput');input.value='';input.className='';input.disabled=false;const fb=document.querySelector('#practiceFeedback');fb.className='feedback-box';fb.textContent='';document.querySelector('#practiceProgressText').textContent=`Question ${session.index+1} / 20`;document.querySelector('#practiceProgressBar').style.width=`${(session.index/20)*100}%`;setTimeout(()=>input.focus(),80);}
  function renderSecondErrorFeedback(q){const fb=document.querySelector('#practiceFeedback');fb.className='feedback-box warn';fb.innerHTML='Réponse incorrecte.<br>Réponse correcte : <strong>'+U.escapeHtml(q.displayAnswer||q.answer)+'</strong><br>Escribe la respuesta correcta para continuar.';}
  function validateAnswer(){if(session.locked)return;const q=session.questions[session.index],input=document.querySelector('#answerInput'),value=input.value.trim();if(!value)return;if(q.mustTypeCorrect){if(samePracticeAnswer(value,q)){input.className='success';const fb=document.querySelector('#practiceFeedback');fb.className='feedback-box ok';fb.textContent='✓ Correcto. Pasamos a la siguiente pregunta.';session.locked=true;setTimeout(()=>{session.index++;session.index>=20?finishSession():showQuestion()},650);}else{input.className='error-second';renderSecondErrorFeedback(q);input.focus();}return;}q.attempts++;if(samePracticeAnswer(value,q)){input.className='success';if(q.attempts===1)session.correct+=1;else if(q.attempts===2)session.correct+=0.5;let outcome;if(q.attempts===1)outcome='correct-first';else if(q.attempts===2)outcome='correct-after-first-error';else outcome='correct-after-help';session.results.push({question:q,finalAnswer:value,outcome});session.locked=true;const fb=document.querySelector('#practiceFeedback');fb.className='feedback-box ok';fb.textContent=q.attempts===1?'✓ Correcto.':'✓ Correcto en el segundo intento.';setTimeout(()=>{session.index++;session.index>=20?finishSession():showQuestion()},650);return;}input.className='error-first';if(q.attempts===1){q.firstError=value;const fb=document.querySelector('#practiceFeedback');fb.className='feedback-box warn';fb.textContent='Réponse incorrecte. Corrige tu respuesta e inténtalo de nuevo.';input.focus();return;}q.secondError=value;q.mustTypeCorrect=true;session.results.push({question:q,finalAnswer:'',outcome:'incorrect-twice',firstError:q.firstError,secondError:q.secondError});renderSecondErrorFeedback(q);input.focus();}
  function finishSession(){document.querySelector('#practiceProgressBar').style.width='100%';document.querySelector('#practiceScore').textContent=`${session.correct}/20`;const errors=session.results.filter(r=>r.outcome!=='correct-first').length;document.dispatchEvent(new CustomEvent('coq:practice-finished',{detail:{results:session.results,correct:session.results.filter(r=>r.outcome==='correct-first').length,errors,score:session.correct}}));}
  function bind(){
    const button=document.querySelector('#startPractice');
    button?.addEventListener('click',startSession);
    document.querySelector('#answerInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')validateAnswer();});
    document.querySelector('#validateAnswer')?.addEventListener('click',validateAnswer);
    document.querySelector('#practiceVerb')?.addEventListener('input',()=>{updatePracticeGroupState();updatePracticeConstructionOptions();updatePracticeAuxiliaryOptions();});
    document.querySelector('#practiceTense')?.addEventListener('change',updatePracticeAuxiliaryOptions);
    document.querySelector('#practiceConstruction')?.addEventListener('change',updatePracticeAuxiliaryOptions);
    updatePracticeGroupState();updatePracticeConstructionOptions();updatePracticeAuxiliaryOptions();
  }
  document.addEventListener('DOMContentLoaded',bind);
  window.COQ_CONJ_PRACTICE_TESTING={selectPracticeQuestions};
})();
