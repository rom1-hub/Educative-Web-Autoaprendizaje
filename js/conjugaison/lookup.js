/* COQ — Consulta de conjugaciones */
(function(){
  const U=window.COQ_CONJ_UTILS;
  const conjugations=U.conjugations;
  const verbMeta=U.verbMeta;
  const engine=window.COQ_CONJ_ENGINE;
  const displayOrder=["présent de l'indicatif",'impératif présent','passé composé','imparfait','futur simple','conditionnel présent','plus-que-parfait','conditionnel passé','futur antérieur','subjonctif présent','subjonctif passé'];

  function counterpart(verb){
    const m=verbMeta[verb]||{};
    if(m.pronominal && m.verbeBase && conjugations[m.verbeBase]) return m.verbeBase;
    if(!m.pronominal && m.formePronominale && m.formePronominale.infinitif && conjugations[m.formePronominale.infinitif]) return m.formePronominale.infinitif;
    if(!m.pronominal && m.verbeBase && conjugations['se '+m.verbeBase]) return 'se '+m.verbeBase;
    return null;
  }
  function toggleLabel(verb){return (verbMeta[verb]||{}).pronominal?'Voir sa forme non pronominale':'Voir sa forme pronominale';}

  function renderConjugation(verb){
    const result=document.querySelector('#conjResult'); if(!result)return;
    result.classList.remove('hidden');
    const data=conjugations[verb];
    const selectedTense=document.querySelector('#lookupTense')?.value || '';
    const other=counterpart(verb);
    let html=`<div class="card verb-summary" style="background:var(--soft-blue);border-color:#CBEAF4"><span class="tag">Conjugaison</span><div class="conj-result-head"><div><h2 style="margin-top:10px">${U.escapeHtml(verb)}</h2><p class="muted">${(verbMeta[verb]||{}).pronominal?'Forme pronominale':'Forme non pronominale'}</p></div><div class="conj-actions">`;
    if(other) html+=`<button class="btn secondary" type="button" id="togglePronominal" data-target-verb="${U.escapeHtml(other)}">${toggleLabel(verb)}</button>`;
    html+=`<button class="btn secondary" type="button" id="speakVerb" aria-label="Escuchar el verbo">🔊 Escuchar el verbo</button><button class="btn tiny secondary" type="button" id="practiceThisVerb">Practicar este verbo</button></div></div></div>`;
    if(data && selectedTense){
      const orderIndex=t=>{const i=displayOrder.indexOf(t);return i===-1?displayOrder.length:i;};
      const sourceEntries=Object.entries(data);
      const isCompound=t=>!!(window.COQ_CONJ_COMPOUND&&window.COQ_CONJ_COMPOUND.isCompound(t));
      let timesToShow;
      if(selectedTense==='Todos los tiempos'){
        const allTimes=Array.from(new Set([...Object.keys(data),...displayOrder]));
        timesToShow=allTimes.sort((a,b)=>orderIndex(a)-orderIndex(b)).map(t=>[t,data[t]||[]]);
      }else if(sourceEntries.some(([t])=>t===selectedTense)){
        timesToShow=sourceEntries.filter(([t])=>t===selectedTense);
      }else if(isCompound(selectedTense)){
        timesToShow=[[selectedTense,[]]];
      }else{
        timesToShow=[];
      }
      const generatedTimes=timesToShow.map(([t,rows])=>[t,(engine&&engine.rowsFor?engine.rowsFor(verb,t):rows)]).filter(([,rows])=>rows&&rows.length);
      html+=`<div class="conj-toolbar"><span class="muted">${selectedTense==='Todos los tiempos'?'Todos los tiempos':'Tiempo seleccionado'}</span></div>`;
      if(!timesToShow.length) html+=`<div class="callout">Todavía no hay una conjugación disponible para <strong>${U.escapeHtml(verb)}</strong> en el tiempo «${U.escapeHtml(selectedTense)}».</div>`;
      else { html+=`<div class="conj-times" id="conjTimes">`; generatedTimes.forEach(([t,rows])=>{ html+=`<div class="tense-block"><div class="tense-head"><h3>${U.escapeHtml(t)}</h3><button class="btn tiny secondary" type="button" data-speak-tense="${U.escapeHtml(t)}">🔊</button></div><table class="tense-table"><tbody>`; rows.forEach(r=>html+=`<tr><td>${U.escapeHtml(r[0])}</td><td>${U.escapeHtml(r[1])}</td></tr>`); html+=`</tbody></table></div>`; }); html+=`</div>`; }
    } else if(data && !selectedTense) html+=`<div class="callout">Selecciona un tiempo verbal para mostrar la conjugación.</div>`;
    else html+=`<div class="callout"><strong>Verbo introducido:</strong> ${U.escapeHtml(verb)}.</div>`;
    result.innerHTML=html;
    const speak=window.Coqaudio&&window.Coqaudio.speak ? window.Coqaudio.speak : function(){};
    document.querySelector('#speakVerb')?.addEventListener('click',()=>speak(verb));
    document.querySelector('#togglePronominal')?.addEventListener('click',e=>{const target=e.currentTarget.dataset.targetVerb; document.querySelector('#lookupVerb').value=target; if(window.COQ_CONJ_LOOKUP&&typeof window.COQ_CONJ_LOOKUP.renderConjugation==='function') window.COQ_CONJ_LOOKUP.renderConjugation(target); else renderConjugation(target); setLookupMessage((document.querySelector('#lookupTense')?.value==='Todos los tiempos'?'Conjugación de todos los tiempos verbales cargada para «':'Conjugación cargada para «')+target+'».','form-message info');});
    document.querySelectorAll('[data-speak-tense]').forEach(b=>b.addEventListener('click',()=>{const rows=data[b.dataset.speakTense]||[];speak(rows.map(r=>(r[0]+' '+r[1]).trim()).join('. '));}));
  }
  function setLookupMessage(message,kind){const msg=document.querySelector('#lookupMessage');if(msg){msg.className=kind||'';msg.textContent=message||'';}}
  function hideResult(){document.querySelector('#conjResult')?.classList.add('hidden');}
  function lookup(){const input=document.querySelector('#lookupVerb'),tenseSelect=document.querySelector('#lookupTense'),v=U.normalizeVerb(input&&input.value);if(!v){setLookupMessage('','');hideResult();return;}if(!conjugations[v]){setLookupMessage('','');hideResult();return;}const tense=tenseSelect?.value;if(!tense){setLookupMessage('','');hideResult();return;}setLookupMessage(tense==='Todos los tiempos'?'Conjugación de todos los tiempos verbales cargada para «'+v+'».':'Conjugación del «'+tense+'» cargada para «'+v+'».','form-message info');if(window.COQ_CONJ_LOOKUP&&typeof window.COQ_CONJ_LOOKUP.renderConjugation==='function') window.COQ_CONJ_LOOKUP.renderConjugation(v);else renderConjugation(v);}
  function init(){const lookupTense=document.querySelector('#lookupTense');lookupTense?.addEventListener('change',()=>lookup());document.querySelector('#lookupVerb')?.addEventListener('change',lookup);document.querySelector('#lookupVerb')?.addEventListener('keydown',e=>{if(e.key==='Enter')lookup();});document.querySelectorAll('.suggestion').forEach(b=>b.addEventListener('click',()=>{document.querySelector('#lookupVerb').value=b.dataset.verb;lookup();}));const verbInput=document.getElementById('lookupVerb');if(verbInput){let timer=null;verbInput.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{const v=U.normalizeVerb(verbInput.value);if(v&&conjugations[v]&&document.querySelector('#lookupTense')?.value)lookup();else{hideResult();setLookupMessage('','');}},300);});}}
  window.COQ_CONJ_LOOKUP={lookup,renderConjugation,init};
})();
