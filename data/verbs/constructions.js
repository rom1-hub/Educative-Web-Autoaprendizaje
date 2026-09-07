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
    'appeler': ['appeler', 'appelé'],
    'rappeler': ['rappeler', 'rappelé'],
    'agneler': ['agneler', 'agnelé'],
    'celer': ['celer', 'celé'],
    'déceler': ['déceler', 'décelé'],
    'receler': ['receler', 'recelé'],
    'ciseler': ['ciseler', 'ciselé'],
    'démanteler': ['démanteler', 'démantelé'],
    'écarteler': ['écarteler', 'écartelé'],
    'encasteler': ['encasteler', 'encastelé'],
    'geler': ['geler', 'gelé'],
    'dégeler': ['dégeler', 'dégelé'],
    'congeler': ['congeler', 'congelé'],
    'surgeler': ['surgeler', 'surgelé'],
    'marteler': ['marteler', 'martelé'],
    'modeler': ['modeler', 'modelé'],
    'peler': ['peler', 'pelé'],
    'ficeler': ['ficeler', 'ficelé']
  };

  Object.keys(elerVerbs).forEach(function(key){
    if(verbs[key]){
      verbs[key].pattern = 'er-eler';
      return;
    }
    const item = elerVerbs[key];
    verbs[key] = {
      id: key,
      infinitif: item[0],
      infinitif_base: item[0],
      groupe: 1,
      pattern: 'er-eler',
      auxiliaire: 'avoir',
      pronominal: false,
      participePasse: item[1],
      construction: 'non-pronominale',
      verbeBase: key
    };
  });
})();

document.addEventListener('DOMContentLoaded', function(){
  const engine = window.COQ_CONJ_ENGINE;
  const verbs = window.COQ_VERBS || {};
  if(!engine || typeof engine.rowsForLookup !== 'function') return;

  const U = window.COQ_CONJ_UTILS;

  // La interfaz puede mostrar "j'" como sujeto separado del campo de respuesta.
  // La validación debe aceptar entonces tanto la forma canónica del verbo
  // ("ai appelé") como la frase completa contraída ("j'ai appelé").
  if(U && typeof U.sameAnswer === 'function' && !U.__coqJContractionPatched){
    const originalSameAnswer = U.sameAnswer.bind(U);
    U.sameAnswer = function(value, q){
      if(originalSameAnswer(value, q)) return true;

      const subject = String(q && q.subject || '').trim();
      const expected = String(q && q.answer || '').trim();
      const base = subject.replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase();
      const startsWithVowel = /^[aeiouyàâäéèêëîïôöùûüÿœæ]/i.test(expected);

      if(startsWithVowel && base === "j'"){
        return String(value || '').trim().toLocaleLowerCase() === ("j'" + expected).toLocaleLowerCase();
      }

      if(startsWithVowel && base === "que j'"){
        return String(value || '').trim().toLocaleLowerCase() === ("que j'" + expected).toLocaleLowerCase();
      }

      return false;
    };
    U.__coqJContractionPatched = true;
  }

  const originalRowsForLookup = engine.rowsForLookup.bind(engine);
  const simpleTenses = new Set([
    "présent de l'indicatif",
    'imparfait',
    'futur simple',
    'conditionnel présent',
    'subjonctif présent'
  ]);

  function isEler(verb){
    const key = String(verb || '').trim().toLowerCase();
    const record = verbs[key];
    const base = record && record.verbeBase ? String(record.verbeBase).toLowerCase() : key;
    return /eler$/.test(base);
  }

  function applyCompoundJeContraction(rows, tense){
    if(!window.COQ_CONJ_COMPOUND || !window.COQ_CONJ_COMPOUND.isCompound(tense)) return rows;
    return (rows || []).map(function(row){
      let subject = String(row[0] || '').trim();
      const form = String(row[1] || '').trim().toLowerCase();
      const annotated = subject.match(/^(que\s+)?je\s*(\([^)]*\))?$/i);
      const startsWithVowel = /^[aeiouyàâäéèêëîïôöùûüÿœæ]/.test(form);
      if(annotated && startsWithVowel){
        const prefix = annotated[1] ? 'que j\'' : "j'";
        subject = prefix + (annotated[2] ? ' ' + annotated[2] : '');
      }
      return [subject, row[1]];
    });
  }

  engine.rowsForLookup = function(verb, tense, construction){
    const rows = applyCompoundJeContraction(originalRowsForLookup(verb, tense, construction) || [], tense);
    if(!isEler(verb) || !simpleTenses.has(tense)) return rows;

    const result = [];
    let groupedIl = [];
    let groupedIls = [];
    rows.forEach(function(row){
      const subject = String(row[0] || '').trim().toLowerCase();
      if(subject === 'il' || subject === 'elle' || subject === 'on'){
        groupedIl.push(row);
        return;
      }
      if(subject === 'ils' || subject === 'elles'){
        groupedIls.push(row);
        return;
      }
      result.push(row);
    });

    if(groupedIl.length){
      const answers = groupedIl.map(row => String(row[1] || ''));
      const same = answers.every(answer => answer === answers[0]);
      if(same) result.splice(2, 0, ['il/elle/on', answers[0]]);
      else groupedIl.forEach(row => result.push(row));
    }
    if(groupedIls.length){
      const answers = groupedIls.map(row => String(row[1] || ''));
      const same = answers.every(answer => answer === answers[0]);
      if(same) result.push(['ils/elles', answers[0]]);
      else groupedIls.forEach(row => result.push(row));
    }
    return result;
  };

  const practiceSubject = document.querySelector('#questionSubject');
  const practiceVerb = document.querySelector('#questionVerb');
  if(practiceSubject && practiceVerb){
    const observer = new MutationObserver(function(){
      const subject = practiceSubject.textContent.trim();
      const parts = practiceVerb.textContent.split(' · ');
      const verb = (parts[0] || '').trim().toLowerCase();
      const tense = (parts[1] || '').trim();
      if(!window.COQ_CONJ_COMPOUND || !window.COQ_CONJ_COMPOUND.isCompound(tense)) return;
      const base = subject.replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase();
      if(base !== 'je' && base !== 'que je') return;
      const suffix = subject.match(/\s*(\([^)]*\))\s*$/)?.[1] || '';
      const meta = verbs[verb] || {};
      const construction = meta.pronominal === true || meta.construction === 'pronominale' ? 'pronominale' : 'non-pronominale';
      const generated = engine.conjugate ? engine.conjugate(verb, tense, subject, construction) : null;
      if(/^[aeiouyàâäéèêëîïôöùûüÿœæ]/i.test(String(generated || '').trim())){
        practiceSubject.textContent = (base === 'que je' ? "que j'" : "j'") + (suffix ? ' ' + suffix : '');
      }
    });
    observer.observe(practiceSubject, {childList:true, characterData:true, subtree:true});
  }
});