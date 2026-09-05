/* COQ — Inicialización de la página de Conjugación */
(function(){
  function initTabs(){
    const tabButtons=[...document.querySelectorAll('.tab')];
    tabButtons.forEach(btn=>btn.addEventListener('click',()=>{
      tabButtons.forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector('#tab-'+btn.dataset.tab)?.classList.add('active');
    }));
  }
  function updateLookupStatus(){
    const input=document.getElementById('lookupVerb'),status=document.getElementById('lookupStatus'),tense=document.getElementById('lookupTense');
    if(!input||!status)return;
    const value=input.value.trim();
    if(!value){status.className='lookup-status empty';status.textContent='Escribe el infinitivo de un verbo francés.';status.hidden=false;return;}
    const hasResult=document.getElementById('lookupResult')||document.querySelector('.verb-card');
    if(!hasResult){status.className='lookup-status empty';status.textContent=tense&&tense.value?'Escribe el verbo (en infinitivo) que quieras consultar. No estás limitado a una lista.':'Ahora selecciona un tiempo verbal.';status.hidden=false;}
  }
  function initLookupStatus(){
    document.addEventListener('input',e=>{if(e.target&&e.target.id==='lookupVerb')updateLookupStatus();});
    document.addEventListener('change',e=>{if(e.target&&(e.target.id==='lookupVerb'||e.target.id==='lookupTense'))setTimeout(updateLookupStatus,30);});
  }
  function initPracticeShortcut(){
    document.addEventListener('click',function(e){
      const button=e.target.closest('#practiceThisVerb');if(!button)return;
      const verbInput=document.getElementById('lookupVerb'),practiceTab=document.querySelector('.tab[data-tab="practice"]'),practicePanel=document.getElementById('tab-practice'),practiceInput=document.getElementById('practiceVerb');
      if(practiceInput&&verbInput){practiceInput.value=verbInput.value.trim();practiceInput.dispatchEvent(new Event('input',{bubbles:true}));practiceInput.dispatchEvent(new Event('change',{bubbles:true}));}
      if(practiceTab)practiceTab.click();else if(practicePanel){document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));practicePanel.classList.add('active');}
      setTimeout(()=>{const panel=document.getElementById('tab-practice');if(panel)panel.scrollIntoView({behavior:'smooth',block:'start'});},50);
    });
  }

  function initSubjonctifPasseLabels(){
    const lookup=window.COQ_CONJ_LOOKUP;
    const engine=window.COQ_CONJ_ENGINE;
    const utils=window.COQ_CONJ_UTILS;
    if(!lookup||!engine||typeof lookup.renderConjugation!=='function')return;
    const originalRender=lookup.renderConjugation;
    const variants={
      je:['je (masculin singulier)','je (féminin singulier)'],
      tu:['tu (masculin singulier)','tu (féminin singulier)'],
      il:['il'],
      elle:['elle'],
      on:['on (masculin singulier)','on (masculin pluriel)','on (féminin pluriel)'],
      nous:['nous (masculin pluriel)','nous (féminin pluriel)'],
      vous:['vous (masculin singulier)','vous (féminin singulier)','vous (masculin pluriel)','vous (féminin pluriel)'],
      ils:['ils'],
      elles:['elles']
    };
    const orderedBases=['je','tu','il','elle','on','nous','vous','ils','elles'];
    lookup.renderConjugation=function(verb){
      originalRender(verb);
      const selected=document.querySelector('#lookupTense')?.value||'';
      if(selected!=='subjonctif passé'&&selected!=='Tous los tiempos')return;
      const blocks=[...document.querySelectorAll('#conjTimes .tense-block')];
      const block=blocks.find(b=>b.querySelector('.tense-head h3')?.textContent.trim()==='subjonctif passé');
      if(!block)return;
      const tbody=block.querySelector('tbody');
      if(!tbody)return;
      const record=window.COQ_VERBS?.[verb]||{};
      const construction=record.pronominal?'pronominale':(record.construction||'non-pronominale');
      const rows=[];
      orderedBases.forEach(base=>{
        (variants[base]||[base]).forEach(label=>{
          const form=engine.conjugate(verb,'subjonctif passé',label,construction);
          if(form!=null&&String(form).trim()!=='')rows.push([label,form]);
        });
      });
      if(!rows.length)return;
      const escape=utils&&utils.escapeHtml?utils.escapeHtml:(value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])));
      tbody.innerHTML=rows.map(([subject,form])=>`<tr><td>${escape(subject)}</td><td>${escape(form)}</td></tr>`).join('');
    };
  }

  function init(){
    initTabs();
    window.COQ_CONJ_LOOKUP.init();
    window.COQ_CONJ_PRACTICE.init();
    initSubjonctifPasseLabels();
    initLookupStatus();
    initPracticeShortcut();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
