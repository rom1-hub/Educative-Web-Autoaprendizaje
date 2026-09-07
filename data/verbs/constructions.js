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

  // -ETER : les trois familles demandées pour COQ.
  // 1. JETER et ses dérivés : doublement obligatoire du T.
  // 2. Liste fermée : alternance E/È uniquement.
  // 3. Tous les autres -ETER : les deux orthographes sont acceptées.
  const eterVerbs = {
    'jeter': 'jeté', 'projeter': 'projeté', 'rejeter': 'rejeté', 'déjeter': 'déjeté', 'surjeter': 'surjeté',
    'acheter': 'acheté', 'racheter': 'racheté',
    'bégueter': 'bégueté', 'corseter': 'corseté', 'crocheter': 'crocheté', 'fileter': 'fileté', 'fureter': 'fureté', 'haleter': 'haleté',
    'feuilleter': 'feuilleté'
  };
  Object.keys(eterVerbs).forEach(function(key){
    if(verbs[key]){ verbs[key].pattern = 'er-eter'; return; }
    verbs[key] = {id:key, infinitif:key, infinitif_base:key, groupe:1, pattern:'er-eter', auxiliaire:'avoir', pronominal:false, participePasse:eterVerbs[key], construction:'non-pronominale', verbeBase:key};
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
        if(normalizedValue === normalizedExpected) return true;
        if(normalizedValue === ("j'" + normalizedExpected)) return true;
        return false;
      }

      if(isCompound && startsWithVowel && (base === 'que je' || base === "que j'")){
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
        subject=(annotated[1]?"que j'":"j'")+(annotated[2]?' '+annotated[2]:'');
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

  // -------------------- PATTERN -ETER --------------------
  const eterAccentOnly = new Set(['acheter','racheter','bégueter','corseter','crocheter','fileter','fureter','haleter']);
  const eterJeterFamily = /jeter$/;
  const eterTenses = new Set(["présent de l'indicatif",'imparfait','futur simple','conditionnel présent','subjonctif présent','impératif présent']);

  function eterBase(verb){
    const key=String(verb||'').trim().toLowerCase();
    const r=verbs[key];
    if(r&&r.verbeBase) return String(r.verbeBase).trim().toLowerCase();
    if(key.indexOf('se ')===0) return key.slice(3).trim();
    return key;
  }

  function eterType(verb){
    const base=eterBase(verb);
    if(!/eter$/.test(base)) return null;
    if(eterJeterFamily.test(base)) return 'jeter';
    if(eterAccentOnly.has(base)) return 'accent';
    return 'double';
  }

  function eterSubject(subject){
    const raw=String(subject||'').trim().toLowerCase().replace(/\s*\([^)]*\)\s*$/,'').trim();
    if(/^que\s+j['’]$/.test(raw)||/^que\s+je$/.test(raw)) return 'je';
    if(/^qu['’]il$/.test(raw)||/^que\s+il$/.test(raw)) return 'il';
    if(/^qu['’]elle$/.test(raw)||/^que\s+elle$/.test(raw)) return 'elle';
    if(/^qu['’]on$/.test(raw)||/^que\s+on$/.test(raw)) return 'on';
    if(/^qu['’]ils$/.test(raw)||/^que\s+ils$/.test(raw)) return 'ils';
    if(/^qu['’]elles$/.test(raw)||/^que\s+elles$/.test(raw)) return 'elles';
    return raw;
  }

  function eterForms(verb,tense,subject){
    const type=eterType(verb);
    if(!type||!eterTenses.has(tense)) return null;
    const base=eterBase(verb);
    const stem=base.replace(/er$/,'');
    const s=eterSubject(subject);
    const presentEnd={je:'e',tu:'es',il:'e',elle:'e',on:'e',nous:'ons',vous:'ez',ils:'ent',elles:'ent'}[s];
    const imperfectEnd={je:'ais',tu:'ais',il:'ait',elle:'ait',on:'ait',nous:'ions',vous:'iez',ils:'aient',elles:'aient'}[s];
    const futureEnd={je:'ai',tu:'as',il:'a',elle:'a',on:'a',nous:'ons',vous:'ez',ils:'ont',elles:'ont'}[s];
    const conditionalEnd={je:'ais',tu:'ais',il:'ait',elle:'ait',on:'ait',nous:'ions',vous:'iez',ils:'aient',elles:'aient'}[s];
    const subjEnd={je:'e',tu:'es',il:'e',elle:'e',on:'e',nous:'ions',vous:'iez',ils:'ent',elles:'ent'}[s];
    const accentStem=stem.replace(/e([^e]*)$/,'è$1');
    const doubleStem=stem+'t';
    const variant=(accent,double)=>accent===double?accent:accent+' / '+double;

    if(tense==="présent de l'indicatif"){
      if(s==='nous'||s==='vous') return stem+presentEnd;
      const accent=accentStem+presentEnd;
      const doubled=doubleStem+presentEnd;
      if(type==='accent') return accent;
      if(type==='jeter') return doubled;
      return variant(accent,doubled);
    }
    if(tense==='imparfait') return stem+imperfectEnd;
    if(tense==='futur simple'){
      if(type==='accent') return accentStem+'er'+futureEnd;
      if(type==='jeter') return stem+'ter'+futureEnd;
      return variant(accentStem+'er'+futureEnd,stem+'ter'+futureEnd);
    }
    if(tense==='conditionnel présent'){
      if(type==='accent') return accentStem+'er'+conditionalEnd;
      if(type==='jeter') return stem+'ter'+conditionalEnd;
      return variant(accentStem+'er'+conditionalEnd,stem+'ter'+conditionalEnd);
    }
    if(tense==='subjonctif présent'){
      if(s==='nous'||s==='vous') return stem+subjEnd;
      const accent=accentStem+subjEnd;
      const doubled=doubleStem+subjEnd;
      if(type==='accent') return accent;
      if(type==='jeter') return doubled;
      return variant(accent,doubled);
    }
    if(tense==='impératif présent'){
      if(!['tu','nous','vous'].includes(s)) return null;
      if(s==='nous'||s==='vous') return stem+presentEnd;
      const accent=accentStem+'e';
      const doubled=doubleStem+'e';
      if(type==='accent') return accent;
      if(type==='jeter') return doubled;
      return variant(accent,doubled);
    }
    return null;
  }

  const originalConjugate=engine.conjugate.bind(engine);
  if(!engine.__eterPatternPatchInstalled){
    engine.conjugate=function(verb,tense,subject,construction){
      const generated=eterForms(verb,tense,subject);
      if(generated!=null){
        const base=eterBase(verb);
        const r=verbs[base]||verbs[verb]||{};
        const isPronominal=construction==='pronominale'||r.pronominal===true||r.construction==='pronominale';
        if(isPronominal && window.COQ_CONJ_PRONOUNS){
          const s=window.COQ_CONJ_PRONOUNS.baseSubject(subject);
          if(tense==='impératif présent'){
            const pronoun={tu:'toi',nous:'nous',vous:'vous'}[s];
            if(pronoun) return generated+'-'+pronoun;
          }else{
            const pron=window.COQ_CONJ_PRONOUNS.pronounFor(s);
            if(pron) return window.COQ_CONJ_PRONOUNS.apply(subject,generated);
          }
        }
        return generated;
      }
      return originalConjugate(verb,tense,subject,construction);
    };
    engine.__eterPatternPatchInstalled=true;
  }

  const previousRowsForLookup=engine.rowsForLookup.bind(engine);
  engine.rowsForLookup=function(verb,tense,construction){
    return previousRowsForLookup(verb,tense,construction);
  };

  window.COQ_ETER_PATTERN={
    type:eterType,
    base:eterBase,
    forms:eterForms,
    accentOnly:Array.from(eterAccentOnly),
    jeterFamily:'jeter et ses dérivés',
    orthographicVariants:'accent / double consonne'
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