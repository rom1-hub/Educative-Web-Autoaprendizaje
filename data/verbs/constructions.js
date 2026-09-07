// COQ — catálogo de construcciones verbales.
// Una construcción pronominal es una variante relacionada con el verbo base.
window.COQ_CONSTRUCTIONS = {
  'non-pronominale': { id: 'non-pronominale', label: 'Forme non pronominale', pronom: false },
  'pronominale': { id: 'pronominale', label: 'Forme pronominale', pronom: true }
};

window.COQ_PRONOMINAL_RULES = {
  'lever': { fonctionDeSe: 'COD', accord: 'sujet' },
  'promener': { fonctionDeSe: 'COD', accord: 'sujet' },
  'parler': { fonctionDeSe: 'COI', accord: 'aucun' }
};

window.COQ_COMPOUND_CONSTRUCTION_FILTERS = {
  'avec-avoir': { id: 'avec-avoir', label: 'Avec auxiliaire AVOIR', auxiliaires: ['avoir'], pronominal: false },
  'avec-etre': { id: 'avec-etre', label: 'Avec auxiliaire ÊTRE', auxiliaires: ['être'], pronominal: false },
  'avec-avoir-et-etre': { id: 'avec-avoir-et-etre', label: 'Avec auxiliaire AVOIR et ÊTRE', auxiliaires: ['avoir', 'être'], pronominal: null },
  'verbes-pronominaux': { id: 'verbes-pronominaux', label: 'Verbes pronominaux', auxiliaires: ['être'], pronominal: true }
};

(function(){
  const verbs = window.COQ_VERBS || (window.COQ_VERBS = {});
  const elerVerbs = {
    'appeler': ['appeler', 'appelé'], 'rappeler': ['rappeler', 'rappelé'],
    'agneler': ['agneler', 'agnelé'], 'celer': ['celer', 'celé'],
    'déceler': ['déceler', 'décelé'], 'receler': ['receler', 'recelé'],
    'ciseler': ['ciseler', 'ciselé'], 'démanteler': ['démanteler', 'démantelé'],
    'écarteler': ['écarteler', 'écartelé'], 'encasteler': ['encasteler', 'encastelé'],
    'geler': ['geler', 'gelé'], 'dégeler': ['dégeler', 'dégelé'],
    'congeler': ['congeler', 'congelé'], 'surgeler': ['surgeler', 'surgelé'],
    'marteler': ['marteler', 'martelé'], 'modeler': ['modeler', 'modelé'],
    'peler': ['peler', 'pelé'], 'ficeler': ['ficeler', 'ficelé']
  };
  Object.keys(elerVerbs).forEach(function(key){
    if(verbs[key]){ verbs[key].pattern = 'er-eler'; return; }
    const item = elerVerbs[key];
    verbs[key] = {id:key, infinitif:item[0], infinitif_base:item[0], groupe:1, pattern:'er-eler', auxiliaire:'avoir', pronominal:false, participePasse:item[1], construction:'non-pronominale', verbeBase:key};
  });
})();

document.addEventListener('DOMContentLoaded', function(){
  const engine = window.COQ_CONJ_ENGINE;
  const verbs = window.COQ_VERBS || {};
  if(!engine || typeof engine.rowsForLookup !== 'function') return;

  const U = window.COQ_CONJ_UTILS;

  // Validación de j' en tiempos compuestos.
  // La pregunta conserva internamente "je (...)" aunque la interfaz muestre "j' (...)".
  // Por eso la regla debe basarse en q.subject + q.tense y no únicamente en el DOM.
  if(U && typeof U.sameAnswer === 'function' && !U.__coqCompoundContractionPatched){
    const originalSameAnswer = U.sameAnswer.bind(U);
    U.sameAnswer = function(value, q){
      const rawSubject = String(q && q.subject || '').trim();
      const expected = String(q && q.answer || '').trim();
      const normalizedValue = String(value || '').trim().toLocaleLowerCase();
      const normalizedExpected = expected.toLocaleLowerCase();
      const base = rawSubject.replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase();
      const tense = String(q && q.tense || '').trim();
      const isCompound = !!window.COQ_CONJ_COMPOUND && window.COQ_CONJ_COMPOUND.isCompound(tense);
      const startsWithVowel = /^[aeiouyàâäéèêëîïôöùûüÿœæ]/i.test(expected);

      if(isCompound && startsWithVowel && (base === 'je' || base === "j'")){
        // AVOIR: "j'ai appelé" o "ai appelé".
        // Nunca: "je ai appelé".
        if(normalizedValue === normalizedExpected) return true;
        if(normalizedValue === ("j'" + normalizedExpected)) return true;
        return false;
      }

      if(isCompound && startsWithVowel && (base === 'que je' || base === "que j'")){
        // Subjonctif passé: "que j'aie appelé" o "aie appelé".
        // Nunca: "que je aie appelé".
        if(normalizedValue === normalizedExpected) return true;
        if(normalizedValue === ("que j'" + normalizedExpected)) return true;
        return false;
      }

      return originalSameAnswer(value, q);
    };
    U.__coqCompoundContractionPatched = true;
  }

  const originalRowsForLookup = engine.rowsForLookup.bind(engine);
  const simpleTenses = new Set(["présent de l'indicatif",'imparfait','futur simple','conditionnel présent','subjonctif présent']);

  function isEler(verb){
    const key=String(verb||'').trim().toLowerCase();
    const record=verbs[key];
    const base=record&&record.verbeBase?String(record.verbeBase).toLowerCase():key;
    return /eler$/.test(base);
  }

  function applyCompoundJeContraction(rows, tense){
    if(!window.COQ_CONJ_COMPOUND || !window.COQ_CONJ_COMPOUND.isCompound(tense)) return rows;
    return (rows||[]).map(function(row){
      let subject=String(row[0]||'').trim();
      const form=String(row[1]||'').trim().toLowerCase();
      const annotated=subject.match(/^(que\s+)?je\s*(\([^)]*\))?$/i);
      if(annotated && /^[aeiouyàâäéèêëîïôöùûüÿœæ]/.test(form)){
        subject=(annotated[1]?'que j\'':"j'")+(annotated[2]?' '+annotated[2]:'');
      }
      return [subject,row[1]];
    });
  }

  engine.rowsForLookup=function(verb,tense,construction){
    const rows=applyCompoundJeContraction(originalRowsForLookup(verb,tense,construction)||[],tense);
    if(!isEler(verb)||!simpleTenses.has(tense)) return rows;
    const result=[];let groupedIl=[],groupedIls=[];
    rows.forEach(function(row){
      const subject=String(row[0]||'').trim().toLowerCase();
      if(subject==='il'||subject==='elle'||subject==='on'){groupedIl.push(row);return;}
      if(subject==='ils'||subject==='elles'){groupedIls.push(row);return;}
      result.push(row);
    });
    if(groupedIl.length){const answers=groupedIl.map(row=>String(row[1]||''));const same=answers.every(answer=>answer===answers[0]);if(same)result.splice(2,0,['il/elle/on',answers[0]]);else groupedIl.forEach(row=>result.push(row));}
    if(groupedIls.length){const answers=groupedIls.map(row=>String(row[1]||''));const same=answers.every(answer=>answer===answers[0]);if(same)result.push(['ils/elles',answers[0]]);else groupedIls.forEach(row=>result.push(row));}
    return result;
  };

  const practiceSubject=document.querySelector('#questionSubject');
  const practiceVerb=document.querySelector('#questionVerb');
  if(practiceSubject&&practiceVerb){
    const observer=new MutationObserver(function(){
      const subject=practiceSubject.textContent.trim();
      const parts=practiceVerb.textContent.split(' · ');
      const verb=(parts[0]||'').trim().toLowerCase();
      const tense=(parts[1]||'').trim();
      if(!window.COQ_CONJ_COMPOUND||!window.COQ_CONJ_COMPOUND.isCompound(tense))return;
      const base=subject.replace(/\s*\([^)]*\)\s*$/,'').trim().toLowerCase();
      if(base!=='je'&&base!=='que je')return;
      const suffix=subject.match(/\s*(\([^)]*\))\s*$/)?.[1]||'';
      const meta=verbs[verb]||{};
      const construction=meta.pronominal===true||meta.construction==='pronominale'?'pronominale':'non-pronominale';
      const generated=engine.conjugate?engine.conjugate(verb,tense,subject,construction):null;
      if(/^[aeiouyàâäéèêëîïôöùûüÿœæ]/i.test(String(generated||'').trim())){
        practiceSubject.textContent=(base==='que je'?"que j'":"j'")+(suffix?' '+suffix:'');
      }
    });
    observer.observe(practiceSubject,{childList:true,characterData:true,subtree:true});
  }
});

// Corrección del flujo tras el segundo error:
// el alumno ve la respuesta correcta, pero debe escribirla él mismo para poder continuar.
document.addEventListener('DOMContentLoaded', function(){
  const button=document.querySelector('#validateAnswer');
  const input=document.querySelector('#answerInput');
  const feedback=document.querySelector('#practiceFeedback');
  const next=document.querySelector('#nextQuestion');
  const questionVerb=document.querySelector('#questionVerb');
  const questionSubject=document.querySelector('#questionSubject');
  const U=window.COQ_CONJ_UTILS;
  if(!button||!input||!feedback||!questionVerb||!questionSubject||!U)return;

  let questionKey='';
  let attempts=0;

  function currentKey(){
    return questionVerb.textContent.trim()+'|'+questionSubject.textContent.trim();
  }

  function syncQuestion(){
    const key=currentKey();
    if(key!==questionKey){
      questionKey=key;
      attempts=0;
    }
  }

  const observer=new MutationObserver(syncQuestion);
  observer.observe(questionVerb,{childList:true,characterData:true,subtree:true});
  observer.observe(questionSubject,{childList:true,characterData:true,subtree:true});
  syncQuestion();

  button.addEventListener('click', function(event){
    syncQuestion();
    attempts++;

    // Primer intento: lo gestiona normalmente practice.js.
    if(attempts===1)return;

    // Segundo intento: dejamos que practice.js registre el segundo error.
    // Después retiramos "Siguiente" y obligamos a escribir la respuesta.
    if(attempts===2){
      setTimeout(function(){
        if(next && !next.classList.contains('hidden')){
          next.classList.add('hidden');
          input.value='';
          input.disabled=false;
          input.className='error-second';
          input.focus();
        }
      },0);
      return;
    }

    // Desde aquí practice.js dejó la sesión bloqueada después del segundo error.
    // Interceptamos el clic y solo permitimos continuar cuando el alumno
    // escribe correctamente la respuesta que ya fue mostrada.
    event.preventDefault();
    event.stopImmediatePropagation();

    const correctNode=feedback.querySelector('strong');
    const correctText=correctNode
      ? correctNode.textContent.replace(/^Réponse correcte\s*:\s*/i,'').trim()
      : '';

    if(!correctText)return;

    const q={
      subject:questionSubject.textContent.trim(),
      answer:correctText,
      tense:(questionVerb.textContent.split(' · ')[1]||'').trim()
    };

    if(U.sameAnswer(input.value.trim(),q)){
      input.className='success';
      feedback.className='feedback-box ok';
      feedback.textContent='✓ Correcto. Pasamos a la siguiente pregunta.';
      // nextQuestion() no depende de session.locked, por lo que puede avanzar
      // y conserva el resultado "incorrect-twice" que practice.js ya registró.
      setTimeout(function(){
        if(next)next.click();
      },650);
    }else{
      input.className='error-second';
      feedback.className='feedback-box error';
      feedback.innerHTML='Réponse incorrecte.<br><strong>Réponse correcte : '+U.escapeHtml(correctText)+'</strong><br>Écris la réponse correcte pour continuer.';
      input.focus();
    }
  },true);
});