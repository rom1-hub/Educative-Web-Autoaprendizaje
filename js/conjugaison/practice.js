/* COQ — Práctica de conjugación */
(function(){
  const U=window.COQ_CONJ_UTILS;
  const conjugations=U.conjugations, verbGroups=U.verbGroups, verbMeta=U.verbMeta;
  let session={questions:[],index:0,correct:0,results:[],locked:false};

  function buildQuestions(verb,tense,group,mode){
    let pool=[];
    const add=v=>{
      if(!conjugations[v])return;
      if(!verb&&group&&group!=='Todos'&&verbGroups[v]!==group)return;
      if(!matchesPracticeMode(v,tense,mode))return;
      const ts=tense==='Todos los tiempos'?Object.keys(conjugations[v]):[tense];
      ts.forEach(t=>{
        if(!conjugations[v][t])return;
        U.expandPracticeRows(conjugations[v][t]).forEach(r=>{
          if(t==='passé composé'&&(verbMeta[v]||{}).auxiliaire==='être'){
            const agree=(answer,gender,number)=>answer.replace(/\(e\)\(s\)/g,()=>number==='pluriel'?(gender==='féminin'?'es':'s'):(gender==='féminin'?'e':'')).replace(/\(e\)s/g,()=>number==='pluriel'?(gender==='féminin'?'es':'s'):(gender==='féminin'?'e':'')).replace(/\(e\)/g,()=>gender==='féminin'?'e':'');
            const variants={
              je:[['je (féminin singulier)',agree(r.answer,'féminin','singulier')],['je (masculin singulier)',agree(r.answer,'masculin','singulier')]],
              tu:[['tu (féminin singulier)',agree(r.answer,'féminin','singulier')],['tu (masculin singulier)',agree(r.answer,'masculin','singulier')]],
              nous:[['nous (féminin pluriel)',agree(r.answer,'féminin','pluriel')],['nous (masculin pluriel)',agree(r.answer,'masculin','pluriel')]],
              vous:[['vous (féminin singulier)',agree(r.answer,'féminin','singulier')],['vous (masculin singulier)',agree(r.answer,'masculin','singulier')],['vous (féminin pluriel)',agree(r.answer,'féminin','pluriel')],['vous (masculin pluriel)',agree(r.answer,'masculin','pluriel')]],
              il:[['il',agree(r.answer,'masculin','singulier')]],elle:[['elle',agree(r.answer,'féminin','singulier')]],
              ils:[['ils',agree(r.answer,'masculin','pluriel')]],elles:[['elles',agree(r.answer,'féminin','pluriel')]]
            };
            if(variants[r.subject])variants[r.subject].forEach(([subject,answer])=>pool.push({verb:v,tense:t,subject,answer}));
            else pool.push({verb:v,tense:t,subject:r.subject,answer:agree(r.answer,'masculin','singulier')});
          }else pool.push({verb:v,tense:t,subject:r.subject,answer:r.answer});
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
  function matchesPracticeMode(v,tense,mode){const m=verbMeta[v]||{};if(mode==='pronominal')return m.pronominal===true;if(mode==='pc-avoir')return tense==='passé composé'&&m.auxiliaire==='avoir'&&!m.pronominal;if(mode==='pc-etre')return tense==='passé composé'&&m.auxiliaire==='être';if(mode==='pc-both')return tense==='passé composé'&&(m.auxiliaire==='avoir'||m.auxiliaire==='être');return true;}

  function updatePracticeModeOptions(){
    const tense=document.querySelector('#practiceTense')?.value,mode=document.querySelector('#practiceMode'),help=document.querySelector('#practiceModeHelp');if(!mode)return;
    const verb=U.normalizeVerb(document.querySelector('#practiceVerb')?.value);mode.innerHTML='';
    if(!tense){mode.disabled=true;mode.innerHTML='<option value="" selected>-seleccionar un tiempo primero-</option>';if(help)help.textContent='Elige primero un tiempo verbal.';return;}
    if(verb){mode.disabled=true;const o=document.createElement('option');o.value='';o.textContent='No necesario: verbo concreto';o.selected=true;mode.appendChild(o);if(help)help.textContent='Con un verbo concreto no necesitas seleccionar un entrenamiento.';return;}
    mode.disabled=false;const opts=tense==='passé composé'?[['','-seleccionar-'],['pc-avoir','Passé composé — avec AVOIR'],['pc-etre','Passé composé — avec ÊTRE'],['pc-both','Passé composé — AVOIR + ÊTRE'],['pronominal','Verbes pronominaux']]:[['','-seleccionar-'],['all','Tous les verbes'],['pronominal','Verbes pronominaux']];
    opts.forEach(([v,l])=>{const o=document.createElement('option');o.value=v;o.textContent=l;mode.appendChild(o);});
    if(help)help.textContent=tense==='passé composé'?'Practica al azar con AVOIR, ÊTRE o ambos.':'Practica al azar con todos los verbos o solo con los verbes pronominaux.';
  }
  function updatePracticeGroupState(){
    const verb=U.normalizeVerb(document.querySelector('#practiceVerb')?.value),group=document.querySelector('#practiceGroup'),help=document.querySelector('#practiceGroupHelp');if(!group)return;
    if(verb){group.disabled=true;group.innerHTML='<option value="" selected>No necesario: verbo concreto</option>';if(help)help.textContent='';}
    else{group.disabled=false;group.innerHTML='<option value="" selected>-seleccionar-</option><option value="Todos">Todos</option><option>Premier groupe normal</option><option>Premier groupe verbes en -ELER</option><option>Premier groupe verbes en -ETER</option><option>Premier groupe verbes en -GER</option><option>Premier groupe verbe en -CER</option><option>Premier groupe verbes en -YER</option><option>Premier groupe verbe en -E (È) + consonne + ER</option><option>Deuxième groupe</option><option>Verbes du troisième groupe</option>';if(help)help.textContent='';}
  }
  function startSession(){
    const verb=U.normalizeVerb(document.querySelector('#practiceVerb')?.value),tense=document.querySelector('#practiceTense')?.value,group=document.querySelector('#practiceGroup')?.value,mode=document.querySelector('#practiceMode')?.value,msg=document.querySelector('#practiceMessage');if(!msg)return;
    if(!tense){msg.className='form-message error';msg.textContent='Debes seleccionar un tiempo verbal para comenzar la práctica.';return;}
    if(!verb&&!mode){msg.className='form-message error';msg.textContent='Debes seleccionar el tipo de entrenamiento cuando no has indicado un verbo concreto.';return;}
    if(verb&&!conjugations[verb]){msg.className='form-message error';msg.textContent='En este prototipo, ese verbo todavía no está en la base de demostración.';return;}
    const questions=buildQuestions(verb,tense,group,mode);if(questions.length<20){msg.className='form-message error';msg.textContent='No hay suficientes preguntas disponibles para crear una sesión de 20 preguntas con esta configuración.';return;}
    session={questions,index:0,correct:0,results:[],locked:false};document.querySelector('#practiceSession')?.classList.remove('hidden');document.querySelector('#practiceCriteria').textContent=[verb||'grupo',tense,mode,group||''].filter(Boolean).join(' · ');showQuestion();document.querySelector('#practiceSession')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function showQuestion(){
    const q=session.questions[session.index];session.locked=false;q.attempts=0;q.firstError='';q.secondError='';document.querySelector('#questionVerb').textContent=`${q.verb} · ${q.tense}`;document.querySelector('#questionSubject').textContent=q.subject;const input=document.querySelector('#answerInput');input.value='';input.className='';input.disabled=false;const fb=document.querySelector('#practiceFeedback');fb.className='feedback-box';fb.textContent='';document.querySelector('#practiceProgressText').textContent=`Question ${session.index+1} / 20`;document.querySelector('#practiceProgressBar').style.width=`${(session.index/20)*100}%`;setTimeout(()=>input.focus(),80);
  }
  function validateAnswer(){
    if(session.locked)return;const q=session.questions[session.index],input=document.querySelector('#answerInput'),value=input.value.trim();if(!value)return;q.attempts++;
    if(U.sameAnswer(value,q)){input.className='success';session.correct++;let outcome;if(q.attempts===1)outcome='correct-first';else if(q.attempts===2)outcome='correct-after-first-error';else outcome='correct-after-help';session.results.push({question:q,finalAnswer:value,outcome});session.locked=true;const fb=document.querySelector('#practiceFeedback');fb.className='feedback-box ok';fb.textContent='✓ Correcto. Pasamos a la siguiente pregunta.';document.querySelector('#practiceProgressBar').style.width=`${((session.index+1)/20)*100}%`;setTimeout(()=>{session.index++;session.index>=20?finishSession():showQuestion()},650);
    }else if(q.attempts===1){q.firstError=value;input.className='error-first';const fb=document.querySelector('#practiceFeedback');fb.className='feedback-box warn';fb.textContent='⚠ Cuidado, hay una falta. Corrige tu respuesta y vuelve a validar.';}
    else{q.secondError=value;input.className='error-help';const fb=document.querySelector('#practiceFeedback');fb.className='feedback-box help';fb.innerHTML=`Te ayudamos: es <span class="help-answer">${U.escapeHtml(q.answer)}</span>. Escríbela en la barra de respuesta y valida para continuar.`;}
  }
  function finishSession(){
    document.querySelector('#practiceProgressBar').style.width='100%';document.querySelector('#practiceProgressText').textContent='Session terminée · 20 / 20';const firstCorrect=session.results.filter(r=>r.outcome==='correct-first').length;const withErrors=session.results.filter(r=>r.outcome!=='correct-first').length;const score=session.results.reduce((sum,r)=>sum+(r.outcome==='correct-first'?1:r.outcome==='correct-after-first-error'?.5:0),0);document.querySelector('#finalCorrect').textContent=firstCorrect;document.querySelector('#finalWrong').textContent=withErrors;document.querySelector('#finalScore').textContent=score.toFixed(1).replace('.0','')+' / 20';const tbody=document.querySelector('#resultRows');tbody.innerHTML='';session.results.forEach((r,i)=>{const q=r.question;let user='',outcome='';if(r.outcome==='correct-after-first-error'){user=`<span class="error-first-cell">${U.escapeHtml(q.firstError)}</span><div class="attempt-detail">→ corregida: <span class="correct-cell">${U.escapeHtml(r.finalAnswer)}</span></div>`;outcome=`<span class="error-first-cell">↺ Primer error · corregida sola</span>`;}else if(r.outcome==='correct-after-help'){user=`<span class="error-first-cell">${U.escapeHtml(q.firstError)}</span><div class="attempt-detail">→ 2.º intento: <span class="error-help-cell">${U.escapeHtml(q.secondError)}</span></div><div class="attempt-detail">→ con ayuda: <span class="correct-cell">${U.escapeHtml(r.finalAnswer)}</span></div>`;outcome=`<span class="error-help-cell">✗ Ayuda necesaria</span>`;}else user=`<span class="correct-cell">${U.escapeHtml(r.finalAnswer)}</span>`;const tr=document.createElement('tr');tr.innerHTML=`<td data-label="#">${i+1}</td><td data-label="Verbe">${U.escapeHtml(q.verb)}</td><td data-label="Sujet">${U.escapeHtml(q.subject)}</td><td data-label="Temps">${U.escapeHtml(q.tense)}</td><td data-label="Ta réponse">${user}</td><td data-label="Réponse correcte" class="correct-answer">${U.escapeHtml(q.answer)}</td><td data-label="Résultat">${outcome}</td>`;tbody.appendChild(tr);});const modal=document.querySelector('#resultModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');
  }
  function resetPractice(){const verbInput=document.querySelector('#practiceVerb');if(!verbInput)return;verbInput.value='';document.querySelector('#practiceTense').value='';document.querySelector('#practiceMode').value='';updatePracticeGroupState();updatePracticeModeOptions();const msg=document.querySelector('#practiceMessage');msg.className='form-message';msg.textContent='';verbInput.focus();}
  function init(){
    updatePracticeGroupState();
    document.querySelector('#practiceTense')?.addEventListener('change',()=>{updatePracticeModeOptions();const m=document.querySelector('#practiceMessage');m.className='form-message';m.textContent='';});
    document.querySelector('#practiceVerb')?.addEventListener('input',()=>{const verb=U.normalizeVerb(document.querySelector('#practiceVerb').value);if(!verb)document.querySelector('#practiceMode').value='';updatePracticeGroupState();updatePracticeModeOptions();const m=document.querySelector('#practiceMessage');m.className='form-message';m.textContent='';});
    document.querySelector('#validateAnswer')?.addEventListener('click',validateAnswer);
    document.querySelector('#answerInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();validateAnswer();}});
    document.querySelector('#reviewDone')?.addEventListener('click',()=>{document.querySelector('#resultModal').classList.remove('open');document.querySelector('#resultModal').setAttribute('aria-hidden','true');document.querySelector('#practiceSession').classList.add('hidden');document.querySelector('#practiceVerb').focus();});
    document.querySelector('#startPractice')?.addEventListener('click',startSession);
    document.querySelector('#clearVerb')?.addEventListener('click',resetPractice);
  }
  window.COQ_CONJ_PRACTICE={init,updatePracticeGroupState,updatePracticeModeOptions,startSession};
})();
