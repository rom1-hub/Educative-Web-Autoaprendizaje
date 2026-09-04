/* COQ — Consulta de conjugaciones */
(function(){
  const U=window.COQ_CONJ_UTILS;
  const conjugations=U.conjugations;
  const displayOrder=["présent de l'indicatif",'impératif présent','passé composé','imparfait','futur simple','conditionnel présent','plus-que-parfait','conditionnel passé','futur antérieur','subjonctif présent','subjonctif passé'];

  function renderConjugation(verb){
    const result=document.querySelector('#conjResult');
    if(!result)return;
    result.classList.remove('hidden');
    const data=conjugations[verb];
    const selectedTense=document.querySelector('#lookupTense')?.value || '';
    let html=`<div class="card verb-summary" style="background:var(--soft-blue);border-color:#CBEAF4"><span class="tag">Conjugaison</span><div class="conj-result-head"><div><h2 style="margin-top:10px">${U.escapeHtml(verb)}</h2><p class="muted">Prototipo de consulta. La base definitiva mostrará todos los tiempos previstos.</p></div><button class="btn secondary" type="button" id="speakVerb" aria-label="Escuchar el verbo">🔊 Escuchar el verbo</button><button class="btn tiny secondary" type="button" id="practiceThisVerb">Practicar este verbo</button></div></div>`;
    if(data && selectedTense){
      const orderIndex=t=>{const i=displayOrder.indexOf(t);return i===-1?displayOrder.length:i;};
      const timesToShow=selectedTense==='Todos los tiempos' ? Object.entries(data).sort((a,b)=>orderIndex(a[0])-orderIndex(b[0])) : Object.entries(data).filter(([t])=>t===selectedTense);
      html+=`<div class="conj-toolbar"><span class="muted">${selectedTense==='Todos los tiempos'?'Todos los tiempos':'Tiempo seleccionado'}</span></div>`;
      if(!timesToShow.length){
        html+=`<div class="callout">Todavía no hay una conjugación disponible para <strong>${U.escapeHtml(verb)}</strong> en el tiempo «${U.escapeHtml(selectedTense)}» en esta versión.</div>`;
      }else{
        html+=`<div class="conj-times" id="conjTimes">`;
        timesToShow.forEach(([t,rows])=>{
          html+=`<div class="tense-block"><div class="tense-head"><h3>${U.escapeHtml(t)}</h3><button class="btn tiny secondary" type="button" data-speak-tense="${U.escapeHtml(t)}" aria-label="Escuchar todas las formas de ${U.escapeHtml(t)}">🔊</button></div><table class="tense-table"><thead><tr><th>Sujeto</th><th>Forma</th><th>Audio</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${U.escapeHtml(r[0])}</td><td><strong>${U.escapeHtml(r[1])}</strong></td><td><button class="audio-btn" type="button" data-speak="${U.escapeHtml((r[0]+' '+r[1]).trim())}" aria-label="Escuchar ${U.escapeHtml((r[0]+' '+r[1]).trim())}">▶</button></td></tr>`).join('')}</tbody></table></div>`;
        });
        html+=`</div><div class="conj-tip">💡 Pulsa <strong>▶</strong> para escuchar cada forma con su sujeto. La pronunciación se reproducirá en francés.</div>`;
      }
    }else if(data && !selectedTense) html+=`<div class="callout">Selecciona un tiempo verbal para mostrar la conjugación.</div>`;
    else html+=`<div class="callout"><strong>Verbo introducido:</strong> ${U.escapeHtml(verb)}. En la versión completa el motor consultará la gran base de datos.</div>`;
    result.innerHTML=html;

    const speak=window.Coqaudio&&window.Coqaudio.speak ? window.Coqaudio.speak : function(){};
    const vb=document.querySelector('#speakVerb');
    if(vb)vb.addEventListener('click',()=>speak(verb));
    document.querySelectorAll('[data-speak]').forEach(b=>b.addEventListener('click',()=>speak(b.dataset.speak)));
    document.querySelectorAll('[data-speak-tense]').forEach(b=>b.addEventListener('click',()=>{const rows=data[b.dataset.speakTense]||[];speak(rows.map(r=>(r[0]+' '+r[1]).trim()).join('. '));}));
  }

  function setLookupMessage(message,kind){
    const msg=document.querySelector('#lookupMessage');
    if(!msg)return;
    msg.className=kind||'';
    msg.textContent=message||'';
  }
  function hideResult(){const result=document.querySelector('#conjResult');if(result)result.classList.add('hidden');}

  function lookup(){
    const input=document.querySelector('#lookupVerb');
    const tenseSelect=document.querySelector('#lookupTense');
    const v=U.normalizeVerb(input&&input.value);
    if(!v){setLookupMessage('','');hideResult();return;}
    if(!conjugations[v]){setLookupMessage('','');hideResult();return;}
    const tense=tenseSelect&&tenseSelect.value;
    if(!tense){setLookupMessage('','');hideResult();return;}
    setLookupMessage(tense==='Todos los tiempos'?'Conjugación de todos los tiempos verbales cargada para «'+v+'».':'Conjugación del «'+tense+'» cargada para «'+v+'».','form-message info');
    renderConjugation(v);
  }

  function init(){
    const lookupTense=document.querySelector('#lookupTense');
    lookupTense?.addEventListener('change',()=>{
      const verb=U.normalizeVerb(document.querySelector('#lookupVerb')?.value);
      if(!verb){setLookupMessage('Escribe un verbo para consultar su conjugación.','form-message error');hideResult();return;}
      if(!conjugations[verb] || !lookupTense.value){setLookupMessage('','');hideResult();return;}
      lookup();
    });
    document.querySelector('#lookupVerb')?.addEventListener('change',lookup);
    document.querySelector('#lookupVerb')?.addEventListener('keydown',e=>{if(e.key==='Enter')lookup();});
    document.querySelectorAll('.suggestion').forEach(b=>b.addEventListener('click',()=>{document.querySelector('#lookupVerb').value=b.dataset.verb;lookup();}));

    const verbInput=document.getElementById('lookupVerb');
    const tenseSelect=document.getElementById('lookupTense');
    if(verbInput&&tenseSelect){
      let timer=null;
      verbInput.addEventListener('input',()=>{
        clearTimeout(timer);
        timer=setTimeout(()=>{
          const verb=U.normalizeVerb(verbInput.value);
          if(verb&&conjugations[verb]&&tenseSelect.value)lookup();
          else {hideResult();setLookupMessage('','');}
        },300);
      });
    }
  }

  window.COQ_CONJ_LOOKUP={lookup,renderConjugation,init};
})();
