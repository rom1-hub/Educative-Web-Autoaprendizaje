/* COQ — Inicialización de la página de Conjugación */
(function(){
  function initTabs(){const tabButtons=[...document.querySelectorAll('.tab')];tabButtons.forEach(btn=>btn.addEventListener('click',()=>{tabButtons.forEach(b=>b.classList.remove('active'));document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));btn.classList.add('active');document.querySelector('#tab-'+btn.dataset.tab)?.classList.add('active')}))}
  function updateLookupStatus(){const input=document.getElementById('lookupVerb'),status=document.getElementById('lookupStatus'),tense=document.getElementById('lookupTense');if(!input||!status)return;const value=input.value.trim();if(!value){status.className='lookup-status empty';status.textContent='Escribe el infinitivo de un verbo francés.';status.hidden=false;return}const hasResult=document.getElementById('lookupResult')||document.querySelector('.verb-card');if(!hasResult){status.className='lookup-status empty';status.textContent=tense&&tense.value?'Escribe el verbo (en infinitivo) que quieras consultar. No estás limitado a una lista.':'Ahora selecciona un tiempo verbal.';status.hidden=false}}
  function initLookupStatus(){document.addEventListener('input',e=>{if(e.target&&e.target.id==='lookupVerb')updateLookupStatus()});document.addEventListener('change',e=>{if(e.target&&(e.target.id==='lookupVerb'||e.target.id==='lookupTense'))setTimeout(updateLookupStatus,30)})}
  function initPracticeShortcut(){document.addEventListener('click',function(e){const button=e.target.closest('#practiceThisVerb');if(!button)return;const verbInput=document.getElementById('lookupVerb'),practiceTab=document.querySelector('.tab[data-tab="practice"]'),practicePanel=document.getElementById('tab-practice'),practiceInput=document.getElementById('practiceVerb');if(practiceInput&&verbInput){practiceInput.value=verbInput.value.trim();practiceInput.dispatchEvent(new Event('input',{bubbles:true}));practiceInput.dispatchEvent(new Event('change',{bubbles:true}))}if(practiceTab)practiceTab.click();else if(practicePanel){document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));practicePanel.classList.add('active')}setTimeout(()=>{const panel=document.getElementById('tab-practice');if(panel)panel.scrollIntoView({behavior:'smooth',block:'start'})},50)})}
  function initPracticeSummary(){
    document.addEventListener('coq:practice-finished',function(event){
      const detail=event.detail||{},ordered=Array.isArray(detail.results)?detail.results:[];
      if(ordered.length!==20)return;
      const correct=Number(detail.correct)||0,errors=Number(detail.errors)||20-correct,score=Number(detail.score)||0;
      const note=Number.isInteger(score)?String(score):score.toFixed(1);
      const finalCorrect=document.getElementById('finalCorrect'),finalWrong=document.getElementById('finalWrong'),finalScore=document.getElementById('finalScore');
      if(finalCorrect)finalCorrect.textContent=String(correct);
      if(finalWrong)finalWrong.textContent=String(errors);
      if(finalScore)finalScore.textContent=`${note} / 20`;
      const tbody=document.getElementById('resultRows');
      if(tbody){
        tbody.innerHTML='';
        ordered.forEach((r,i)=>{
          const q=r.question||{},tr=document.createElement('tr'),isWrong=r.outcome==='incorrect-twice',isFirstError=r.outcome==='correct-after-first-error',result=isWrong?'Corrigé avec aide':isFirstError?'Corrigé sans aide':'Correct';
          const values=[i+1,q.verb||'—',q.subject||'—',q.tense||'—',(q.attempts&&q.attempts.length?q.attempts.join(' → '):r.finalAnswer||'—'),q.displayAnswer||q.answer||'—',result];
          values.forEach((value,index)=>{const td=document.createElement('td');td.textContent=value;if(index===0)td.setAttribute('data-label','#');if(index===1)td.setAttribute('data-label','Verbe');if(index===2)td.setAttribute('data-label','Sujet');if(index===3)td.setAttribute('data-label','Temps');if(index===4)td.setAttribute('data-label','Ta réponse');if(index===5)td.setAttribute('data-label','Réponse correcte');if(index===6)td.setAttribute('data-label','Résultat');if(index===4){td.style.fontWeight='800';td.style.color=isWrong?'var(--red)':isFirstError?'var(--orange)':'var(--green)'}if(index===5){td.style.fontWeight='700';td.style.color='var(--green)'}if(index===6){td.style.fontWeight='800';td.style.color=isWrong?'var(--red)':isFirstError?'var(--orange)':'var(--green)'}tr.appendChild(td)});
          tbody.appendChild(tr);
        });
      }
      const modal=document.getElementById('resultModal');
      if(modal){modal.classList.add('open');modal.setAttribute('aria-hidden','false');modal.style.display='flex';}
    });
    function closeSummary(){const modal=document.getElementById('resultModal');if(!modal)return;modal.classList.remove('open');modal.setAttribute('aria-hidden','true');modal.style.display='none';if(window.COQ_CONJ_PRACTICE&&typeof window.COQ_CONJ_PRACTICE.resetPracticeForm==='function')window.COQ_CONJ_PRACTICE.resetPracticeForm();}
    document.getElementById('reviewDone')?.addEventListener('click',closeSummary);
    document.getElementById('resultModal')?.addEventListener('click',e=>{if(e.target===e.currentTarget)closeSummary()});
  }
  function init(){initTabs();window.COQ_CONJ_LOOKUP.init();initLookupStatus();initPracticeShortcut();initPracticeSummary()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()
})();
