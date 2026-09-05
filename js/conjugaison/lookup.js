/* COQ — Consulta de conjugaciones */
(function(){
  const U=window.COQ_CONJ_UTILS;
  const conjugations=U.conjugations;
  const verbMeta=U.verbMeta;
  const engine=window.COQ_CONJ_ENGINE;

  const displayOrder=[
    "présent de l'indicatif",
    'impératif présent',
    'passé composé',
    'imparfait',
    'futur simple',
    'conditionnel présent',
    'plus-que-parfait',
    'conditionnel passé',
    'futur antérieur',
    'subjonctif présent',
    'subjonctif passé'
  ];

  function counterpart(verb){
    const m=verbMeta[verb]||{};

    if(
      m.pronominal &&
      m.verbeBase &&
      (conjugations[m.verbeBase] || verbMeta[m.verbeBase])
    ){
      return m.verbeBase;
    }

    if(
      !m.pronominal &&
      m.formePronominale &&
      m.formePronominale.infinitif &&
      (conjugations[m.formePronominale.infinitif] || verbMeta[m.formePronominale.infinitif])
    ){
      return m.formePronominale.infinitif;
    }

    if(
      !m.pronominal &&
      m.verbeBase &&
      (conjugations['se '+m.verbeBase] || verbMeta['se '+m.verbeBase])
    ){
      return 'se '+m.verbeBase;
    }

    return null;
  }

  function toggleLabel(verb){
    return (verbMeta[verb]||{}).pronominal
      ? 'Voir sa forme non pronominale'
      : 'Voir sa forme pronominale';
  }

  function verbExists(verb){
    return !!conjugations[verb] || !!verbMeta[verb];
  }

  function rowsForTense(verb,tense){
  if(engine&&typeof engine.rowsForLookup==='function'){
    return engine.rowsForLookup(verb,tense)||[];
  }

  if(engine&&typeof engine.rowsFor==='function'){
    return engine.rowsFor(verb,tense)||[];
  }

  return (conjugations[verb]||{})[tense]||[];
}

  function renderConjugation(verb){
    const result=document.querySelector('#conjResult');
    if(!result)return;

    result.classList.remove('hidden');

    const data=conjugations[verb]||{};
    const selectedTense=document.querySelector('#lookupTense')?.value || '';
    const other=counterpart(verb);

    let html=`
      <div class="card verb-summary" style="background:var(--soft-blue);border-color:#CBEAF4">
        <span class="tag">Conjugaison</span>
        <div class="conj-result-head">
          <div>
            <h2 style="margin-top:10px">${U.escapeHtml(verb)}</h2>
            <p class="muted">
              ${(verbMeta[verb]||{}).pronominal
                ? 'Forme pronominale'
                : 'Forme non pronominale'}
            </p>
          </div>

          <div class="conj-actions">
    `;

    if(other){
      html+=`
        <button
          class="btn secondary"
          type="button"
          id="togglePronominal"
          data-target-verb="${U.escapeHtml(other)}"
        >
          ${toggleLabel(verb)}
        </button>
      `;
    }

    html+=`
        <button
          class="btn secondary"
          type="button"
          id="speakVerb"
          aria-label="Escuchar el verbo"
        >
          🔊 Escuchar el verbo
        </button>

        <button
          class="btn tiny secondary"
          type="button"
          id="practiceThisVerb"
        >
          Practicar este verbo
        </button>
      </div>
    </div>
  </div>
    `;

    if(selectedTense){

      const orderIndex=t=>{
        const i=displayOrder.indexOf(t);
        return i===-1 ? displayOrder.length : i;
      };

      const sourceEntries=Object.entries(data);

      const isCompound=t=>!!(
        window.COQ_CONJ_COMPOUND &&
        window.COQ_CONJ_COMPOUND.isCompound(t)
      );

      let timesToShow=[];

      if(selectedTense==='Todos los tiempos'){

        const allTimes=Array.from(
          new Set([
            ...Object.keys(data),
            ...displayOrder
          ])
        );

        timesToShow=allTimes
          .sort((a,b)=>orderIndex(a)-orderIndex(b))
          .map(t=>[t,data[t]||[]]);

      }else if(
        sourceEntries.some(([t])=>t===selectedTense)
      ){

        timesToShow=sourceEntries.filter(
          ([t])=>t===selectedTense
        );

      }else if(
        engine &&
        typeof engine.rowsFor==='function' &&
        (
          engine.canGenerate?.(verb,selectedTense) ||
          isCompound(selectedTense)
        )
      ){

        timesToShow=[
          [selectedTense,[]]
        ];

      }else{

        timesToShow=[];

      }

function lookupSubjectLabel(label){
  return String(label||'')
    .replace(/\s*\([^)]*\)/g,'')
    .trim();
}

function commonPrefix(values){
  if(!values.length)return '';

  let prefix=String(values[0]||'');

  for(let i=1;i<values.length;i++){
    const value=String(values[i]||'');
    let j=0;

    while(
      j<prefix.length &&
      j<value.length &&
      prefix[j]===value[j]
    ){
      j++;
    }

    prefix=prefix.slice(0,j);

    if(!prefix)break;
  }

  return prefix;
}

function mergeAgreementForms(rows,tense){
  const isCompound=!!(
    window.COQ_CONJ_COMPOUND &&
    window.COQ_CONJ_COMPOUND.isCompound(tense)
  );

  if(!isCompound)return rows;

  const groups=new Map();

  rows.forEach(row=>{
    const rawSubject=String(row[0]||'').trim();

    // Para la visualización eliminamos únicamente
    // las indicaciones pedagógicas de género/número.
    const subject=rawSubject
      .replace(/\s*\([^)]*\)/g,'')
      .trim();

    if(!groups.has(subject))groups.set(subject,[]);
    groups.get(subject).push(row);
  });

  const result=[];

  groups.forEach(group=>{
    const subject=String(group[0][0]||'')
      .replace(/\s*\([^)]*\)/g,'')
      .trim();

    const answers=group.map(row=>String(row[1]||''));

    // Si todas las formas son iguales, no necesitamos marcador.
    const allSame=answers.every(answer=>answer===answers[0]);

    if(allSame){
      result.push([subject,answers[0]]);
      return;
    }

    /*
     * Las variantes ya vienen correctamente generadas
     * por el motor:
     *
     * masculin singulier
     * féminin singulier
     * masculin pluriel
     * féminin pluriel
     *
     * Aquí solamente las convertimos en la notación
     * compacta utilizada en "Ver un verbo".
     */

    const unique=[...new Set(answers)];

   const baseSubject=subject
  .replace(/^que\s+/,'')
  .replace(/^qu['’]/,'');

if(baseSubject==='je' || baseSubject==='tu'){
  if(unique.length>1){
    const base=unique[0].replace(/e$/,'');
    result.push([subject,base+'(e)']);
  }else{
    result.push([subject,unique[0]]);
  }
  return;
}

if(baseSubject==='on'){
  if(unique.length>1){
    const base=unique[0].replace(/e?s$/,'');
    result.push([subject,base+'(e)(s)']);
  }else{
    result.push([subject,unique[0]]);
  }
  return;
}

if(baseSubject==='nous'){
  if(unique.length>1){
    const base=unique[0].replace(/es$/,'').replace(/s$/,'');
    result.push([subject,base+'(e)s']);
  }else{
    result.push([subject,unique[0]]);
  }
  return;
}

if(baseSubject==='vous'){
  if(unique.length>1){
    const base=unique[0].replace(/e?s$/,'');
    result.push([subject,base+'(e)(s)']);
  }else{
    result.push([subject,unique[0]]);
  }
  return;
}
    

    // il / elle / ils / elles permanecen separados
    // y muestran su forma gramatical real.
    result.push([subject,answers[0]]);
  });

  return result;
}
const generatedTimes=timesToShow
  .map(([t,rows])=>[
    t,
    mergeAgreementForms(rowsForTense(verb,t),t)
  ])
  .filter(([,rows])=>rows&&rows.length);

      html+=`
        <div class="conj-toolbar">
          <span class="muted">
            ${selectedTense==='Todos los tiempos'
              ? 'Todos los tiempos'
              : 'Tiempo seleccionado'}
          </span>
        </div>
      `;

      if(!generatedTimes.length){

        html+=`
          <div class="callout">
            Todavía no hay una conjugación disponible para
            <strong>${U.escapeHtml(verb)}</strong>
            en el tiempo
            «${U.escapeHtml(selectedTense)}».
          </div>
        `;

      }else{

        html+=`
          <div class="conj-times" id="conjTimes">
        `;

        generatedTimes.forEach(([t,rows])=>{

          html+=`
            <div class="tense-block">
              <div class="tense-head">
                <h3>${U.escapeHtml(t)}</h3>

                <button
                  class="btn tiny secondary"
                  type="button"
                  data-speak-tense="${U.escapeHtml(t)}"
                >
                  🔊
                </button>
              </div>

              <table class="tense-table">
                <tbody>
          `;

          rows.forEach(r=>{
            html+=`
              <tr>
                <td>${U.escapeHtml(r[0])}</td>
                <td>${U.escapeHtml(r[1])}</td>
              </tr>
            `;
          });

          html+=`
                </tbody>
              </table>
            </div>
          `;

        });

        html+=`
          </div>
        `;
      }

    }else{

      html+=`
        <div class="callout">
          Selecciona un tiempo verbal para mostrar la conjugación.
        </div>
      `;

    }

    result.innerHTML=html;

    const speak=
      window.Coqaudio&&window.Coqaudio.speak
        ? window.Coqaudio.speak
        : function(){};

    document
      .querySelector('#speakVerb')
      ?.addEventListener('click',()=>speak(verb));

    document
      .querySelector('#togglePronominal')
      ?.addEventListener('click',e=>{
        const target=e.currentTarget.dataset.targetVerb;

        document.querySelector('#lookupVerb').value=target;

        if(
          window.COQ_CONJ_LOOKUP &&
          typeof window.COQ_CONJ_LOOKUP.renderConjugation==='function'
        ){
          window.COQ_CONJ_LOOKUP.renderConjugation(target);
        }else{
          renderConjugation(target);
        }

        setLookupMessage(
          (
            document.querySelector('#lookupTense')?.value==='Todos los tiempos'
              ? 'Conjugación de todos los tiempos verbales cargada para «'
              : 'Conjugación cargada para «'
          )+
          target+
          '».',
          'form-message info'
        );
      });

    document
      .querySelectorAll('[data-speak-tense]')
      .forEach(button=>{
        button.addEventListener('click',()=>{
          const tense=button.dataset.speakTense;
          const rows=rowsForTense(verb,tense);

          speak(
            rows
              .map(r=>(r[0]+' '+r[1]).trim())
              .join('. ')
          );
        });
      });
  }

  function setLookupMessage(message,kind){
    const msg=document.querySelector('#lookupMessage');

    if(msg){
      msg.className=kind||'';
      msg.textContent=message||'';
    }
  }

  function hideResult(){
    document
      .querySelector('#conjResult')
      ?.classList.add('hidden');
  }

  function lookup(){

    const input=document.querySelector('#lookupVerb');
    const tenseSelect=document.querySelector('#lookupTense');

    const v=U.normalizeVerb(
      input&&input.value
    );

    if(!v){
      setLookupMessage('','');
      hideResult();
      return;
    }

    if(!verbExists(v)){
      setLookupMessage('','');
      hideResult();
      return;
    }

    const tense=tenseSelect?.value;

    if(!tense){
      setLookupMessage('','');
      hideResult();
      return;
    }

    setLookupMessage(
      tense==='Todos los tiempos'
        ? 'Conjugación de todos los tiempos verbales cargada para «'+v+'».'
        : 'Conjugación del «'+tense+'» cargada para «'+v+'».',
      'form-message info'
    );

    if(
      window.COQ_CONJ_LOOKUP &&
      typeof window.COQ_CONJ_LOOKUP.renderConjugation==='function'
    ){
      window.COQ_CONJ_LOOKUP.renderConjugation(v);
    }else{
      renderConjugation(v);
    }
  }

  function init(){

    const lookupTense=document.querySelector('#lookupTense');

    lookupTense?.addEventListener(
      'change',
      ()=>lookup()
    );

    document
      .querySelector('#lookupVerb')
      ?.addEventListener(
        'change',
        lookup
      );

    document
      .querySelector('#lookupVerb')
      ?.addEventListener(
        'keydown',
        e=>{
          if(e.key==='Enter')lookup();
        }
      );

    document
      .querySelectorAll('.suggestion')
      .forEach(button=>{
        button.addEventListener(
          'click',
          ()=>{
            document.querySelector('#lookupVerb').value=
              button.dataset.verb;

            lookup();
          }
        );
      });

    const verbInput=document.getElementById('lookupVerb');

    if(verbInput){

      let timer=null;

      verbInput.addEventListener(
        'input',
        ()=>{
          clearTimeout(timer);

          timer=setTimeout(
            ()=>{
              const v=U.normalizeVerb(
                verbInput.value
              );

              if(
                v &&
                verbExists(v) &&
                document.querySelector('#lookupTense')?.value
              ){
                lookup();
              }else{
                hideResult();
                setLookupMessage('','');
              }
            },
            300
          );
        }
      );
    }
  }

  window.COQ_CONJ_LOOKUP={
    lookup,
    renderConjugation,
    init
  };
})();
