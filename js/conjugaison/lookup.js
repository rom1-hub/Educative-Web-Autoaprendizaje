/* COQ — Consulta de conjugaciones. La resolución de verbos pasa por el resolver y el motor. */
(function(){
  const U=window.COQ_CONJ_UTILS;
  const conjugations=U.conjugations;
  const resolver=window.COQ_PATTERN_RESOLVER;
  const engine=window.COQ_CONJ_ENGINE;
  const displayOrder=["présent de l'indicatif",'impératif présent','passé composé','imparfait','futur simple','conditionnel présent','plus-que-parfait','conditionnel passé','futur antérieur','subjonctif présent','subjonctif passé'];
  const record=v=>((resolver&&typeof resolver.resolveRecord==='function')?resolver.resolveRecord(v):null)||conjugations[v]||null;
  const meta=v=>record(v)||{};
  function counterpart(verb){const m=meta(verb);if(m.pronominal&&m.verbeBase&&record(m.verbeBase))return m.verbeBase;if(!m.pronominal&&m.formePronominale&&m.formePronominale.infinitif&&record(m.formePronominale.infinitif))return m.formePronominale.infinitif;if(!m.pronominal&&m.verbeBase&&record('se '+m.verbeBase))return 'se '+m.verbeBase;return null;}
  function toggleLabel(verb){return meta(verb).pronominal?'Voir sa forme non pronominale':'Voir sa forme pronominale';}
  function verbExists(verb){return !!record(verb);}
  function rowsForTense(verb,tense){if(engine&&typeof engine.rowsForLookup==='function')return engine.rowsForLookup(verb,tense)||[];if(engine&&typeof engine.rowsFor==='function')return engine.rowsFor(verb,tense)||[];return (conjugations[verb]||{})[tense]||[];}
  function isCompound(tense){return !!(window.COQ_CONJ_COMPOUND&&window.COQ_CONJ_COMPOUND.isCompound(tense));}
  function mergeAgreementForms(rows,tense){if(!isCompound(tense))return rows;const groups=new Map();rows.forEach(row=>{const subject=String(row[0]||'').replace(/\s*\([^)]*\)/g,'').trim();if(!groups.has(subject))groups.set(subject,[]);groups.get(subject).push(row);});const result=[];groups.forEach(group=>{const subject=String(group[0][0]||'').replace(/\s*\([^)]*\)/g,'').trim(),answers=group.map(row=>String(row[1]||'')),allSame=answers.every(answer=>answer===answers[0]);if(allSame){result.push([subject,answers[0]]);return;}const unique=[...new Set(answers)],baseSubject=subject.replace(/^que\s+/,'').replace(/^qu['’]/,'');if(baseSubject==='je'||baseSubject==='tu'){result.push([subject,unique.length>1?unique[0].replace(/e$/,'')+'(e)':unique[0]]);return;}if(baseSubject==='on'){result.push([subject,unique.length>1?unique[0].replace(/e?s$/,'')+'(e)(s)':unique[0]]);return;}if(baseSubject==='nous'){result.push([subject,unique.length>1?unique[0].replace(/es$/,'').replace(/s$/,'')+'(e)s':unique[0]]);return;}if(baseSubject==='vous'){result.push([subject,unique.length>1?unique[0].replace(/e?s$/,'')+'(e)(s)':unique[0]]);return;}result.push([subject,answers[0]]);});return result;}
  function speechForm(form){return String(form||'').replace(/\([^)]*\)/g,'').replace(/\s+/g,' ').trim();}
  function renderConjugation(verb){
    const result=document.querySelector('#conjResult');if(!result)return;result.classList.remove('hidden');
    const data=meta(verb).formes||conjugations[verb]||{};const selectedTense=document.querySelector('#lookupTense')?.value||'';const other=counterpart(verb);
    let html=`<div class="card verb-summary" style="background:var(--soft-blue);border-color:#CBEAF4"><span class="tag">Conjugaison</span><div class="conj-result-head"><div><h2 style="margin-top:10px">${U.escapeHtml(verb)}</h2><p class="muted">${meta(verb).pronominal?'Forme pronominale':'Forme non pronominale'}</p></div><div class="conj-actions">`;
    if(other)html+=`<button class="btn secondary" type="button" id="togglePronominal" data-target-verb="${U.escapeHtml(other)}">${toggleLabel(verb)}</button>`;
    html+=`<button class="btn secondary" type="button" id="speakVerb" aria-label="Escuchar el verbo">🔊 Escuchar el verbo</button><button class="btn tiny secondary" type="button" id="practiceThisVerb">Practicar este verbo</button></div></div></div>`;
    if(selectedTense){
      const orderIndex=t=>{const i=displayOrder.indexOf(t);return i===-1?displayOrder.length:i;};let timesToShow=[];
      if(selectedTense==='Todos los tiempos'){timesToShow=displayOrder.map(t=>[t,data[t]||[]]);Object.keys(data).filter(t=>!displayOrder.includes(t)).forEach(t=>timesToShow.push([t,data[t]]));}
      else if(Object.prototype.hasOwnProperty.call(data,selectedTense))timesToShow=[[selectedTense,data[selectedTense]]];
      else if(engine&&typeof engine.rowsFor==='function'&&(engine.canGenerate?.(verb,selectedTense)||isCompound(selectedTense)))timesToShow=[[selectedTense,[]]];
      timesToShow.sort((a,b)=>orderIndex(a[0])-orderIndex(b[0]));
      const generatedTimes=timesToShow.map(([t])=>[t,mergeAgreementForms(rowsForTense(verb,t),t)]).filter(([,rows])=>rows&&rows.length);
      html+=`<div class="conj-toolbar"><span class="muted">${selectedTense==='Todos los tiempos'?'Todos los tiempos':'Tiempo seleccionado'}</span></div>`;
      if(!generatedTimes.length)html+=`<div class="callout">Todavía no hay una conjugación disponible para <strong>${U.escapeHtml(verb)}</strong> en el tiempo «${U.escapeHtml(selectedTense)}».</div>`;
      else{html+=`<div class="conj-times" id="conjTimes">`;generatedTimes.forEach(([t,rows])=>{html+=`<div class="tense-block"><div class="tense-head"><h3>${U.escapeHtml(t)}</h3><button class="btn tiny secondary" type="button" data-speak-tense="${U.escapeHtml(t)}">🔊</button></div><table class="tense-table"><tbody>`;rows.forEach(r=>{html+=`<tr><td>${U.escapeHtml(r[0])}</td><td>${U.escapeHtml(r[1])}</td></tr>`;});html+=`</tbody></table></div>`;});html+=`</div>`;}
    }else html+=`<div class="callout">Selecciona un tiempo verbal para mostrar la conjugación.</div>`;
    result.innerHTML=html;
    const speak=window.Coqaudio&&window.Coqaudio.speak?window.Coqaudio.speak:function(){};
    document.querySelector('#speakVerb')?.addEventListener('click',()=>speak(verb));
    document.querySelector('#togglePronominal')?.addEventListener('click',e=>{const target=e.currentTarget.dataset.targetVerb;document.querySelector('#lookupVerb').value=target;if(window.COQ_CONJ_LOOKUP&&typeof window.COQ_CONJ_LOOKUP.renderConjugation==='function')window.COQ_CONJ_LOOKUP.renderConjugation(target);setLookupMessage((document.querySelector('#lookupTense')?.value==='Todos los tiempos'?'Conjugación de todos los tiempos verbales cargada para «':'Conjugación cargada para «')+target+'».','form-message info');});
    document.querySelectorAll('[data-speak-tense]').forEach(button=>button.addEventListener('click',()=>{const tense=button.dataset.speakTense,rows=rowsForTense(verb,tense),speechRows=[];if(tense==='impératif présent')rows.forEach(r=>{const form=speechForm(r[1]);if(form)speechRows.push(form);});else{const compound=isCompound(tense),seenSubjects=new Set();rows.forEach(r=>{const subject=String(r[0]||'').replace(/\s*\([^)]*\)\s*/g,'').trim(),form=speechForm(r[1]);if(!subject||!form)return;if(compound&&seenSubjects.has(subject))return;seenSubjects.add(subject);speechRows.push((subject+' '+form).trim());});}speak(speechRows.filter(Boolean).join('. '));}));
  }
  function setLookupMessage(message,kind){const msg=document.querySelector('#lookupMessage');if(msg){msg.className=kind||'';msg.textContent=message||'';}}
  function hideResult(){document.querySelector('#conjResult')?.classList.add('hidden');}
  function lookup(){const input=document.querySelector('#lookupVerb'),tenseSelect=document.querySelector('#lookupTense'),v=U.normalizeVerb(input&&input.value);if(!v){setLookupMessage('','');hideResult();return;}if(!verbExists(v)){setLookupMessage('','');hideResult();return;}const tense=tenseSelect?.value;if(!tense){setLookupMessage('','');hideResult();return;}setLookupMessage(tense==='Todos los tiempos'?'Conjugación de todos los tiempos verbales cargada para «'+v+'».':'Conjugación del «'+tense+'» cargada para «'+v+'».','form-message info');renderConjugation(v);}
  function init(){document.querySelector('#lookupTense')?.addEventListener('change',lookup);document.querySelector('#lookupVerb')?.addEventListener('change',lookup);document.querySelector('#lookupVerb')?.addEventListener('keydown',e=>{if(e.key==='Enter')lookup();});document.querySelectorAll('.suggestion').forEach(button=>button.addEventListener('click',()=>{document.querySelector('#lookupVerb').value=button.dataset.verb;lookup();}));const verbInput=document.getElementById('lookupVerb');if(verbInput){let timer=null;verbInput.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{const v=U.normalizeVerb(verbInput.value);if(v&&verbExists(v)&&document.querySelector('#lookupTense')?.value)lookup();else{hideResult();setLookupMessage('','');}},300);});}}
  window.COQ_CONJ_LOOKUP={lookup,renderConjugation,init};
})();
