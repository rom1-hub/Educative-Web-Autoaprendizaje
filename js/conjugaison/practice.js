/* COQ — Práctica de conjugación */
(function(){
  const U=window.COQ_CONJ_UTILS;
  const P=window.COQ_CONJ_PRONOUNS;
  const dataModel=window.COQ_CONJ_DATA_MODEL;
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
  const compoundTenseSet=new Set(compoundTenses);
  const simpleTenseSet=new Set(simpleTenses);
  const allTenses=C?.allTenses||[];
  const subjectVariants=P?.subjectVariants||{};
  let session={questions:[],index:0,correct:0,results:[],locked:false};
  function matchesCategory(v,category){if(!category || category==='all')return true;return !!(categoryResolver&&typeof categoryResolver.matchesCategory==='function'&&categoryResolver.matchesCategory(v,category));}
  function answerModel(answer){const normalize=U.normalizeAnswerText||function(v){return String(v||'').trim().toLowerCase().replace(/\s+/g,' ');};const accepted=String(answer??'').split(/\s+\/\s+/).map(normalize).filter(Boolean);const unique=[...new Set(accepted)];return {displayAnswer:unique[0]||'',acceptedAnswers:unique};}
  function pushQuestion(pool,verb,tense,subject,answer){const model=answerModel(answer);if(!model.displayAnswer)return;pool.push({verb,tense,subject,answer:model.displayAnswer,displayAnswer:model.displayAnswer,acceptedAnswers:model.acceptedAnswers});}
  function practiceSubjectKey(subject){return P.baseSubject(subject)||String(subject||'').trim().toLowerCase();}
  function practiceVariantKey(subject){return String(subject||'').trim().toLowerCase();}
  function practiceQuestionKey(q){return [q.verb,q.tense,practiceVariantKey(q.subject),q.displayAnswer||q.answer].join('|');}
  function selectPracticeQuestions(pool,limit){const unique=[],uniqueMeta=[],seen=new Set();U.shuffleArray(pool).forEach(q=>{const key=practiceQuestionKey(q);if(seen.has(key))return;seen.add(key);unique.push(q);uniqueMeta.push({key,subject:practiceSubjectKey(q.subject),variant:practiceVariantKey(q.subject),tense:q.tense,verb:practiceVariantKey(q.verb)});});const target=Math.max(0,Number(limit)||0);if(!target||!unique.length)return [];const selected=[],selectedMeta=[];const counts={subject:new Map(),variant:new Map(),tense:new Map(),verb:new Map()};const count=(map,key)=>map.get(key)||0;const increment=(map,key)=>map.set(key,count(map,key)+1);let available=new Set(unique.map((_,index)=>index));let previousKey='';while(selected.length<target){if(!available.size){available=new Set(unique.map((_,index)=>index));if(available.size>1){const previousIndex=uniqueMeta.findIndex(meta=>meta.key===previousKey);if(previousIndex>=0)available.delete(previousIndex);}}let bestScore=Infinity,best=[];available.forEach(index=>{const meta=uniqueMeta[index];let score=count(counts.subject,meta.subject)*6+count(counts.variant,meta.variant)*2+count(counts.tense,meta.tense)*4+count(counts.verb,meta.verb);if(meta.key===previousKey)score+=1000;if(selectedMeta.length){const lastMeta=selectedMeta[selectedMeta.length-1];if(lastMeta.subject===meta.subject)score+=100;if(lastMeta.tense===meta.tense)score+=12;if(lastMeta.verb===meta.verb)score+=4;}if(score<bestScore){bestScore=score;best=[index];}else if(score===bestScore)best.push(index);});const pickIndex=best[Math.floor(Math.random()*best.length)];const pick={...unique[pickIndex]};available.delete(pickIndex);selected.push(pick);selectedMeta.push(uniqueMeta[pickIndex]);previousKey=uniqueMeta[pickIndex].key;increment(counts.subject,uniqueMeta[pickIndex].subject);increment(counts.variant,uniqueMeta[pickIndex].variant);increment(counts.tense,uniqueMeta[pickIndex].tense);increment(counts.verb,uniqueMeta[pickIndex].verb);}return selected;}
  function sampleMatchingVerbs(target,predicate){const wanted=Math.max(0,Number(target)||0);if(!wanted)return [];const selected=[];let seen=0;for(const v of Object.keys(dataModel?.records||{})){if(!predicate(v))continue;seen+=1;if(selected.length<wanted){selected.push(v);continue;}const index=Math.floor(Math.random()*seen);if(index<wanted)selected[index]=v;}return selected;}
  function sampleMatchingVerbsByGroup(targets,predicate){const groups=new Map(Object.entries(targets||{}).map(([group,target])=>[Number(group),{target:Math.max(0,Number(target)||0),selected:[],seen:0}]));if(!groups.size)return [];for(const v of Object.keys(dataModel?.records||{})){if(!predicate(v))continue;const group=Number(getRecord(v)?.groupe);const bucket=groups.get(group);if(!bucket||!bucket.target)continue;bucket.seen+=1;if(bucket.selected.length<bucket.target){bucket.selected.push(v);continue;}const index=Math.floor(Math.random()*bucket.seen);if(index<bucket.target)bucket.selected[index]=v;}
    return [...groups.values()].flatMap(bucket=>bucket.selected);
  }
  function buildQuestions(verb,tense,category,construction,auxiliary){
    let pool=[];
    const add=(v,requestedTenses=null,filtersAlreadyMatched=false)=>{
      const meta=getRecord(v);
      if(!meta)return;
      if(!filtersAlreadyMatched){
        if(!verb&&!matchesCategory(v,category))return;
        if(!matchesConstruction(meta,construction))return;
      }
      const isPronominal=!!(constructionResolver?.isPronominal?.(meta));
      const ts=requestedTenses|| (tense==='Todos los tiempos'?allTenses:[tense]);
      ts.forEach(t=>{
        const isSimple=simpleTenseSet.has(t),isCompound=compoundTenseSet.has(t);
        if(!isSimple&&!isCompound)return;
        if(!matchesAuxiliary(meta,t,auxiliary))return;
        const effectiveAuxiliary=isCompound?auxiliaryResolver?.resolve?.(meta,constructionResolver):null;
        let rows=[];
        if(isCompound&&effectiveAuxiliary==='être'){
          rows=Object.keys(subjectVariants).map(subject=>[subject,'']);
        }else if(engine&&engine.rowsForConstruction&&construction){
          rows=engine.rowsForConstruction(v,t,construction);
          if(!rows.length)return;
        }else if(engine&&engine.rowsFor){
          rows=engine.rowsFor(v,t);
        }
        U.expandPracticeRows(rows).forEach(r=>{
          const baseSubject=P.baseSubject(String(r.subject||'').split(' (')[0].trim());
          if(isCompound&&effectiveAuxiliary==='être'&&subjectVariants[baseSubject]&&engine&&engine.conjugate){
            subjectVariants[baseSubject].forEach(subject=>{
              const answer=engine.conjugate(v,t,subject,construction||(isPronominal?'pronomiale':'non-pronomiale'));
              if(answer!=null)pushQuestion(pool,v,t,P.subjectForMode(subject,(t==='subjonctif présent'||t==='subjonctif passé')?'subjonctif':'normal',answer),answer);
            });
          }else{
            const rowAnswer=r.answer;
            const answer=rowAnswer!=null&&String(rowAnswer).trim()!==''
              ?rowAnswer
              :(engine&&engine.conjugate?engine.conjugate(v,t,r.subject,construction||(isPronominal?'pronomiale':'non-pronomiale')):null);
            if(answer!=null&&String(answer).trim()!==''){
              const displaySubject=isCompound&&effectiveAuxiliary==='avoir'?P.subjectForMode(baseSubject,(t==='subjonctif présent'||t==='subjonctif passé')?'subjonctif':'normal',answer):formatPracticeSubject(r.subject,t,isCompound,answer);
              pushQuestion(pool,v,t,displaySubject,answer);
            }
          }
        });
      });
    };

    if(verb){
      add(verb);
    }else{
      const predicate=v=>matchesCategory(v,category)&&matchesConstruction(v,construction);
      let selectedVerbs;
      if(category==='all'){
        // Muestreo por depósito: evita crear y barajar el catálogo completo.
        // Conserva la cobertura pedagógica actual: 3/3/2 entre los grupos.
        const groupOrder=U.shuffleArray([1,2,3]);
        const targets=new Map([[groupOrder[0],3],[groupOrder[1],3],[groupOrder[2],2]]);
        selectedVerbs=sampleMatchingVerbsByGroup(Object.fromEntries(targets),predicate);
      }else{
        selectedVerbs=sampleMatchingVerbs(8,predicate);
      }

      const requestedTenses=tense==='Todos los tiempos'?allTenses:[tense];
      selectedVerbs.forEach(v=>add(v,requestedTenses,true));
    }

    if(!pool.length)return [];
    return selectPracticeQuestions(pool,20);
  }
  function formatPracticeSubject(subject,tense,isCompound,form){const raw=String(subject||'').trim(),base=P.baseSubject(raw),compound=!!isCompound,isSubjonctif=tense==='subjonctif présent'||tense==='subjonctif passé';const variants=compound?subjectVariants:{};const normalized=P.subjectForMode(raw,isSubjonctif?'subjonctif':'normal',compound?'':form||'');if(isSubjonctif)return normalized;return variants[base]?.includes(raw)?raw:(variants[base]?.[0]&&compound?variants[base][0]:normalized);}
  function matchesConstruction(record,construction){if(!construction)return true;return !!(constructionResolver&&typeof constructionResolver.matchesConstruction==='function'&&constructionResolver.matchesConstruction(record||{},construction));}
  function matchesAuxiliary(record,tense,auxiliary){if(!auxiliary||!compoundTenseSet.has(tense))return true;return !!(auxiliaryResolver&&typeof auxiliaryResolver.matches==='function'&&auxiliaryResolver.matches(record||{},tense,auxiliary,compoundTenses,constructionResolver));}
  function samePracticeAnswer(value,q){const normalize=U.normalizeAnswerText||function(s){return String(s??'').trim().toLocaleLowerCase().replace(/\s+/g,' ');};const input=normalize(value);if(!input)return false;const accepted=Array.isArray(q?.acceptedAnswers)&&q.acceptedAnswers.length?q.acceptedAnswers:[q?.displayAnswer||q?.answer];return accepted.map(normalize).filter(Boolean).includes(input);}
  function updatePracticeAuxiliaryOptions(){const tense=document.querySelector('#practiceTense')?.value,verb=U.normalizeVerb(document.querySelector('#practiceVerb')?.value),construction=document.querySelector('#practiceConstruction')?.value,aux=document.querySelector('#practiceAuxiliary'),help=document.querySelector('#practiceAuxiliaryHelp');if(!aux)return;aux.innerHTML='';let disabledReason='';if(verb)disabledReason='Determinado por el verbo seleccionado';else if(construction==='pronomiale')disabledReason='No disponible para los verbos pronominales';else if(!tense||!compoundTenses.includes(tense))disabledReason=tense==='Todos los tiempos'?'Disponible únicamente cuando se selecciona un tiempo compuesto.':'No disponible para un tiempo simple';if(disabledReason){aux.disabled=true;const o=document.createElement('option');o.value='';o.selected=true;o.textContent=disabledReason;aux.appendChild(o);if(help){if(verb)help.textContent='El verbo seleccionado ya determina el verbo auxiliar en Conjugación.';else if(construction==='pronomiale')help.textContent='La construcción pronominal determina el verbo auxiliar en Conjugación.';else help.textContent=tense==='Todos los tiempos'?'Disponible únicamente cuando se selecciona un tiempo compuesto.':'Disponible únicamente con un tiempo compuesto.';}return;}aux.disabled=false;const placeholder=document.createElement('option');placeholder.value='';placeholder.selected=true;placeholder.textContent='- seleccionar -';aux.appendChild(placeholder);auxiliaryOptions.forEach(item=>{const o=document.createElement('option');o.value=U.escapeHtml(item.id);o.textContent=U.escapeHtml(item.label);aux.appendChild(o);});if(help)help.textContent='Este filtro se aplica a todos los tiempos compuestos.';}
  function updatePracticeConstructionOptions(){const construction=document.querySelector('#practiceConstruction'),help=document.querySelector('#practiceConstructionHelp'),verb=U.normalizeVerb(document.querySelector('#practiceVerb')?.value);if(!construction)return;if(verb){const meta=getRecord(verb)||{};const isPronominal=!!(constructionResolver&&typeof constructionResolver.isPronominal==='function'&&constructionResolver.isPronominal(meta));const selectedId=isPronominal?'pronomiale':'non-pronomiale';const selected=constructionOptions.find(item=>item.id===selectedId);const selectedLabel=isPronominal?'Verbos pronominales':'Verbos no pronominales';construction.disabled=true;construction.innerHTML='';const o=document.createElement('option');o.value=selectedId;o.selected=true;o.textContent=selectedLabel;construction.appendChild(o);if(help)help.textContent='Determinada por el verbo seleccionado.';return;}construction.disabled=false;construction.innerHTML='<option value="" selected>Verbos pronominales y no pronominales</option>'+constructionOptions.map(item=>'<option value="'+U.escapeHtml(item.id)+'">'+U.escapeHtml(item.label)+'</option>').join('');if(help)help.textContent='Puedes elegir una construcción para afinar el ejercicio.';}
  function updatePracticeGroupState(){const verb=U.normalizeVerb(document.querySelector('#practiceVerb')?.value),group=document.querySelector('#practiceGroup'),help=document.querySelector('#practiceGroupHelp');if(!group)return;if(verb){group.disabled=true;group.innerHTML='<option value="" selected>No necesario: verbo concreto</option>';if(help)help.textContent='';return;}group.disabled=false;const options=categoryResolver&&typeof categoryResolver.categoryOptions==='function'?categoryResolver.categoryOptions():[];const first=options.find(item=>!item.section&&item.id==='all');const sections=[...new Set(options.map(item=>item.section).filter(Boolean))];const optionHtml=item=>'<option value="'+U.escapeHtml(item.id)+'">'+U.escapeHtml(item.label)+'</option>';group.innerHTML=(first?optionHtml(first):'<option value="all">Todos los grupos</option>')+sections.map(section=>'<optgroup label="'+U.escapeHtml(section)+'">'+options.filter(item=>item.section===section).map(optionHtml).join('')+'</optgroup>').join('');const placeholder=document.createElement('option');placeholder.value='';placeholder.selected=true;placeholder.disabled=true;placeholder.textContent='-Seleccionar-';group.insertBefore(placeholder,group.firstChild);if(help)help.textContent='Selecciona una categoría verbal para afinar el ejercicio.';}
  function resetPracticeSession(){session={questions:[],index:0,correct:0,results:[],locked:false};document.querySelector('#practiceSession')?.classList.add('hidden');const input=document.querySelector('#answerInput');if(input){input.value='';input.className='';input.disabled=false;}const feedback=document.querySelector('#practiceFeedback');if(feedback){feedback.className='feedback-box';feedback.textContent='';}const progressText=document.querySelector('#practiceProgressText');if(progressText)progressText.textContent='Pregunta 1 / 20';const progressBar=document.querySelector('#practiceProgressBar');if(progressBar)progressBar.style.width='0%';const criteria=document.querySelector('#practiceCriteria');if(criteria)criteria.textContent='—';}
  function clearPracticeForm(){const verbInput=document.querySelector('#practiceVerb');if(verbInput)verbInput.value='';const tense=document.querySelector('#practiceTense');if(tense){tense.value='';if(tense.options.length)tense.selectedIndex=0;}const group=document.querySelector('#practiceGroup');if(group)group.value='';const construction=document.querySelector('#practiceConstruction');if(construction)construction.value='';const auxiliary=document.querySelector('#practiceAuxiliary');if(auxiliary)auxiliary.value='';const message=document.querySelector('#practiceMessage');if(message){message.className='form-message';message.textContent='';}resetPracticeSession();updatePracticeGroupState();updatePracticeConstructionOptions();updatePracticeAuxiliaryOptions();verbInput?.focus();verbInput?.scrollIntoView({behavior:'smooth',block:'center'});}
  function constructionLabel(id){const option=constructionOptions.find(item=>item.id===id);if(option?.label)return option.label;if(id==='pronomiale')return 'Verbos pronominales';if(id==='non-pronomiale'||id==='non-pronominale')return 'Verbos no pronomiales';return id;}
  function startSession(){const verb=U.normalizeVerb(document.querySelector('#practiceVerb')?.value),tense=document.querySelector('#practiceTense')?.value,group=document.querySelector('#practiceGroup')?.value,construction=document.querySelector('#practiceConstruction')?.value,auxiliary=document.querySelector('#practiceAuxiliary')?.value,msg=document.querySelector('#practiceMessage');if(!msg)return;if(!tense){msg.className='form-message error';msg.textContent='Debes seleccionar un tiempo verbal para comenzar la práctica.';return;}if(verb&&!getRecord(verb)){msg.className='form-message error';msg.textContent='Ese verbo no puede resolverse todavía con los patrones disponibles.';return;}const questions=buildQuestions(verb,tense,group,construction,auxiliary);if(questions.length<20){msg.className='form-message error';msg.textContent='No hay suficientes preguntas disponibles para crear una sesión de 20 preguntas con esta configuración.';return;}session={questions,index:0,correct:0,results:[],locked:false};msg.className='form-message';msg.textContent='';document.querySelector('#practiceSession')?.classList.remove('hidden');const summaryGroup=({'all':'Todos los verbos','groupe-1-all':'Todos los verbos del primer grupo','groupe-2-all':'Todos los verbos del segundo grupo','groupe-3-all':'Todos los verbos del tercer grupo'}[group]||group||'');const summaryConstruction=constructionLabel(construction);document.querySelector('#practiceCriteria').textContent=[tense,summaryGroup,summaryConstruction,auxiliary||''].filter(Boolean).join(' · ');showQuestion();document.querySelector('#practiceSession')?.scrollIntoView({behavior:'smooth',block:'start'});}
  function showQuestion(){const q=session.questions[session.index];session.locked=false;q.attempts=0;q.firstError='';q.secondError='';q.mustTypeCorrect=false;document.querySelector('#questionVerb').textContent=`${q.verb} · ${q.tense}`;document.querySelector('#questionSubject').textContent=q.subject;const input=document.querySelector('#answerInput');input.value='';input.className='';input.disabled=false;const fb=document.querySelector('#practiceFeedback');fb.className='feedback-box';fb.textContent='';document.querySelector('#practiceProgressText').textContent=`Pregunta ${session.index+1} / 20`;document.querySelector('#practiceProgressBar').style.width=`${(session.index/20)*100}%`;setTimeout(()=>input.focus(),80);}
  function renderSecondErrorFeedback(q){const fb=document.querySelector('#practiceFeedback');fb.className='feedback-box warn';fb.innerHTML='Respuesta incorrecta.<br>Respuesta correcta: <strong>'+U.escapeHtml(q.displayAnswer||q.answer)+'</strong><br>Escribe la respuesta correcta para continuar.';}
  function validateAnswer(){if(session.locked)return;const q=session.questions[session.index],input=document.querySelector('#answerInput'),value=input.value.trim();if(!value)return;if(q.mustTypeCorrect){if(samePracticeAnswer(value,q)){input.className='success';const fb=document.querySelector('#practiceFeedback');fb.className='feedback-box ok';fb.textContent='✓ Correcto. Pasamos a la siguiente pregunta.';session.locked=true;setTimeout(()=>{session.index++;session.index>=20?finishSession():showQuestion()},650);}else{input.className='error-second';renderSecondErrorFeedback(q);input.focus();}return;}q.attempts++;if(samePracticeAnswer(value,q)){input.className='success';if(q.attempts===1)session.correct+=1;else if(q.attempts===2)session.correct+=0.5;let outcome;if(q.attempts===1)outcome='correct-first';else if(q.attempts===2)outcome='correct-after-first-error';else outcome='correct-after-help';session.results.push({question:q,finalAnswer:value,outcome});session.locked=true;const fb=document.querySelector('#practiceFeedback');fb.className='feedback-box ok';fb.textContent=q.attempts===1?'✓ Correcto.':'✓ Correcto en el segundo intento.';setTimeout(()=>{session.index++;session.index>=20?finishSession():showQuestion()},650);return;}input.className='error-first';if(q.attempts===1){q.firstError=value;const fb=document.querySelector('#practiceFeedback');fb.className='feedback-box warn';fb.textContent='Respuesta incorrecta. Corrige tu respuesta e inténtalo de nuevo.';input.focus();return;}q.secondError=value;q.mustTypeCorrect=true;session.results.push({question:q,finalAnswer:'',outcome:'incorrect-twice',firstError:q.firstError,secondError:q.secondError});renderSecondErrorFeedback(q);input.focus();}
  function finishSession(){document.querySelector('#practiceProgressBar').style.width='100%';const errors=session.results.filter(r=>r.outcome!=='correct-first').length;document.dispatchEvent(new CustomEvent('coq:practice-finished',{detail:{...session,results:session.results,correct:session.results.filter(r=>r.outcome==='correct-first').length,score:session.correct,errors}}));}
  window.COQ_CONJ_PRACTICE=Object.freeze({bind,buildQuestions,selectPracticeQuestions});
  window.COQ_CONJ_PRACTICE_TESTING=Object.freeze({buildQuestions,selectPracticeQuestions});
  function bind(){document.querySelector('#practiceVerb')?.addEventListener('input',()=>{updatePracticeGroupState();updatePracticeConstructionOptions();updatePracticeAuxiliaryOptions();});document.querySelector('#practiceTense')?.addEventListener('change',updatePracticeAuxiliaryOptions);document.querySelector('#practiceGroup')?.addEventListener('change',updatePracticeAuxiliaryOptions);document.querySelector('#practiceConstruction')?.addEventListener('change',updatePracticeAuxiliaryOptions);document.querySelector('#startPractice')?.addEventListener('click',startSession);document.querySelector('#validateAnswer')?.addEventListener('click',validateAnswer);document.querySelector('#answerInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')validateAnswer();});document.querySelector('#clearVerb')?.addEventListener('click',clearPracticeForm);document.querySelector('#reviewDone')?.addEventListener('click',clearPracticeForm);updatePracticeGroupState();updatePracticeConstructionOptions();updatePracticeAuxiliaryOptions();}
})();
