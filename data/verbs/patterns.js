// COQ — catálogo y resolución de patrones de conjugación.
window.COQ_VERB_PATTERNS={
  "regular-er":{groupe:1,description:"Premier groupe régulier en -ER"},
  "regular-ir":{groupe:2,description:"Deuxième groupe régulier en -IR"},
  "regular-re":{groupe:3,description:"Verbes réguliers en -RE"},
  "er-ger":{groupe:1,description:"Premier groupe avec terminaison -GER"},
  "er-cer":{groupe:1,description:"Premier groupe avec terminaison -CER"},
  "er-eler":{groupe:1,description:"Premier groupe avec alternance en -ELER"},
  "er-eter":{groupe:1,description:"Premier groupe avec alternance en -ETER"},
  "yer":{groupe:1,description:"Premier groupe en -YER"},
  "er-e-accent":{groupe:1,description:"Premier groupe avec alternance E/È + consonne + ER"},
  "avoir":{groupe:3,description:"Verbe irrégulier avoir"},
  "être":{groupe:3,description:"Verbe irrégulier être"},
  "aller":{groupe:3,description:"Verbe irrégulier aller"},
  "prendre":{groupe:3,description:"Famille prendre"},
  "venir":{groupe:3,description:"Famille venir"},
  "faire":{groupe:3,description:"Verbe irrégulier faire"}
};

(function(){
  const verbs=window.COQ_VERBS||{};
  const patterns=window.COQ_VERB_PATTERNS;
  function normalize(v){return String(v||'').trim().toLowerCase();}
  function baseVerb(verb){
    const key=normalize(verb),r=verbs[key];
    if(r&&r.verbeBase&&verbs[normalize(r.verbeBase)])return normalize(r.verbeBase);
    if(key.startsWith('se '))return key.slice(3).trim();
    return key;
  }
  function resolvePattern(verb){
    const key=normalize(verb),base=baseVerb(key),r=verbs[key]||verbs[base];
    if(r&&r.pattern&&patterns[r.pattern])return r.pattern;
    if(/ger$/.test(base))return'er-ger';
    if(/cer$/.test(base))return'er-cer';
    if(/yer$/.test(base))return'yer';
    if(/er$/.test(base))return'regular-er';
    return null;
  }
  function applyToDatabase(){
    Object.keys(verbs).forEach(k=>{const r=verbs[k];if(!r||r.pattern)return;const p=resolvePattern(k);if(p)r.pattern=p;});
  }
  window.COQ_PATTERN_RESOLVER={normalize,baseVerb,resolvePattern,applyToDatabase};
  applyToDatabase();

  const regressionVerbs={
    changer:{id:'changer',infinitif:'changer',infinitif_base:'changer',groupe:1,pattern:'er-ger',auxiliaire:'avoir',pronominal:false,participePasse:'changé',construction:'non-pronominale',verbeBase:'changer'},
    voyager:{id:'voyager',infinitif:'voyager',infinitif_base:'voyager',groupe:1,pattern:'er-ger',auxiliaire:'avoir',pronominal:false,participePasse:'voyagé',construction:'non-pronominale',verbeBase:'voyager'},
    nager:{id:'nager',infinitif:'nager',infinitif_base:'nager',groupe:1,pattern:'er-ger',auxiliaire:'avoir',pronominal:false,participePasse:'nagé',construction:'non-pronominale',verbeBase:'nager'},
    partager:{id:'partager',infinitif:'partager',infinitif_base:'partager',groupe:1,pattern:'er-ger',auxiliaire:'avoir',pronominal:false,participePasse:'partagé',construction:'non-pronominale',verbeBase:'partager'},
    ranger:{id:'ranger',infinitif:'ranger',infinitif_base:'ranger',groupe:1,pattern:'er-ger',auxiliaire:'avoir',pronominal:false,participePasse:'rangé',construction:'non-pronominale',verbeBase:'ranger'},
    corriger:{id:'corriger',infinitif:'corriger',infinitif_base:'corriger',groupe:1,pattern:'er-ger',auxiliaire:'avoir',pronominal:false,participePasse:'corrigé',construction:'non-pronominale',verbeBase:'corriger'},
    placer:{id:'placer',infinitif:'placer',infinitif_base:'placer',groupe:1,pattern:'er-cer',auxiliaire:'avoir',pronominal:false,participePasse:'placé',construction:'non-pronominale',verbeBase:'placer'},
    annoncer:{id:'annoncer',infinitif:'annoncer',infinitif_base:'annoncer',groupe:1,pattern:'er-cer',auxiliaire:'avoir',pronominal:false,participePasse:'annoncé',construction:'non-pronominale',verbeBase:'annoncer'},
    avancer:{id:'avancer',infinitif:'avancer',infinitif_base:'avancer',groupe:1,pattern:'er-cer',auxiliaire:'avoir',pronominal:false,participePasse:'avancé',construction:'non-pronominale',verbeBase:'avancer'},
    prononcer:{id:'prononcer',infinitif:'prononcer',infinitif_base:'prononcer',groupe:1,pattern:'er-cer',auxiliaire:'avoir',pronominal:false,participePasse:'prononcé',construction:'non-pronominale',verbeBase:'prononcer'},
    remplacer:{id:'remplacer',infinitif:'remplacer',infinitif_base:'remplacer',groupe:1,pattern:'er-cer',auxiliaire:'avoir',pronominal:false,participePasse:'remplacé',construction:'non-pronominale',verbeBase:'remplacer'},
    lancer:{id:'lancer',infinitif:'lancer',infinitif_base:'lancer',groupe:1,pattern:'er-cer',auxiliaire:'avoir',pronominal:false,participePasse:'lancé',construction:'non-pronominale',verbeBase:'lancer'},
    essuyer:{id:'essuyer',infinitif:'essuyer',infinitif_base:'essuyer',groupe:1,pattern:'yer',auxiliaire:'avoir',pronominal:false,participePasse:'essuyé',construction:'non-pronominale',verbeBase:'essuyer'},
    appuyer:{id:'appuyer',infinitif:'appuyer',infinitif_base:'appuyer',groupe:1,pattern:'yer',auxiliaire:'avoir',pronominal:false,participePasse:'appuyé',construction:'non-pronominale',verbeBase:'appuyer'},
    ennuyer:{id:'ennuyer',infinitif:'ennuyer',infinitif_base:'ennuyer',groupe:1,pattern:'yer',auxiliaire:'avoir',pronominal:false,participePasse:'ennuyé',construction:'non-pronominale',verbeBase:'ennuyer'},
    nettoyer:{id:'nettoyer',infinitif:'nettoyer',infinitif_base:'nettoyer',groupe:1,pattern:'yer',auxiliaire:'avoir',pronominal:false,participePasse:'nettoyé',construction:'non-pronominale',verbeBase:'nettoyer'},
    payer:{id:'payer',infinitif:'payer',infinitif_base:'payer',groupe:1,pattern:'yer',auxiliaire:'avoir',pronominal:false,participePasse:'payé',construction:'non-pronominale',verbeBase:'payer'},
    essayer:{id:'essayer',infinitif:'essayer',infinitif_base:'essayer',groupe:1,pattern:'yer',auxiliaire:'avoir',pronominal:false,participePasse:'essayé',construction:'non-pronominale',verbeBase:'essayer'}
  };
  Object.keys(regressionVerbs).forEach(k=>{if(!window.COQ_VERBS[k])window.COQ_VERBS[k]=regressionVerbs[k];});
  window.COQ_PATTERN_REGRESSION={
    ger:['manger','changer','voyager','nager','partager','ranger','corriger'],
    cer:['commencer','placer','annoncer','avancer','prononcer','remplacer','lancer'],
    yer:['essuyer','appuyer','ennuyer','nettoyer','payer','essayer'],
    expected:{manger:'er-ger',changer:'er-ger',voyager:'er-ger',nager:'er-ger',partager:'er-ger',ranger:'er-ger',corriger:'er-ger',commencer:'er-cer',placer:'er-cer',annoncer:'er-cer',avancer:'er-cer',prononcer:'er-cer',remplacer:'er-cer',lancer:'er-cer',essuyer:'yer',appuyer:'yer',ennuyer:'yer',nettoyer:'yer',payer:'yer',essayer:'yer'}
  };
  window.COQ_PATTERN_REGRESSION.run=function(){const cases=this.expected;return Object.keys(cases).map(verb=>({verb,expected:cases[verb],actual:resolvePattern(verb),ok:resolvePattern(verb)===cases[verb]}));};

  document.addEventListener('DOMContentLoaded',function(){
    const engine=window.COQ_CONJ_ENGINE;
    if(!engine||typeof engine.conjugate!=='function'||engine.__yerPatch)return;
    const originalConjugate=engine.conjugate.bind(engine);
    const simple=new Set(["présent de l'indicatif",'imparfait','futur simple','conditionnel présent','subjonctif présent','impératif présent']);
    function baseSubject(subject){
      const raw=String(subject||'').trim().toLowerCase(),clean=raw.replace(/\s*\([^)]*\)\s*$/,'').trim();
      if(/^que\s+j['’]$/.test(clean)||/^que\s+je$/.test(clean))return'je';
      if(/^qu['’]il$/.test(clean)||/^que\s+il$/.test(clean))return'il';
      if(/^qu['’]elle$/.test(clean)||/^que\s+elle$/.test(clean))return'elle';
      if(/^qu['’]on$/.test(clean)||/^que\s+on$/.test(clean))return'on';
      if(/^qu['’]ils$/.test(clean)||/^que\s+ils$/.test(clean))return'ils';
      if(/^qu['’]elles$/.test(clean)||/^que\s+elles$/.test(clean))return'elles';
      return clean;
    }
    function generate(verb,tense,subject){
      const key=normalize(verb),base=baseVerb(key),r=verbs[base]||verbs[key];
      if(!r||r.pattern!=='yer'||!simple.has(tense))return null;
      const inf=r.infinitif_base||r.infinitif||base,s=baseSubject(subject),stem=inf.slice(0,-3),yStem=stem+'y',iStem=stem+'i';
      const pe={je:'e',tu:'es',il:'e',elle:'e',on:'e',nous:'ons',vous:'ez',ils:'ent',elles:'ent'};
      const ie={je:'ais',tu:'ais',il:'ait',elle:'ait',on:'ait',nous:'ions',vous:'iez',ils:'aient',elles:'aient'};
      const fe={je:'ai',tu:'as',il:'a',elle:'a',on:'a',nous:'ons',vous:'ez',ils:'ont',elles:'ont'};
      const ce={je:'ais',tu:'ais',il:'ait',elle:'ait',on:'ait',nous:'ions',vous:'iez',ils:'aient',elles:'aient'};
      const se={je:'e',tu:'es',il:'e',elle:'e',on:'e',nous:'ions',vous:'iez',ils:'ent',elles:'ent'};
      if(tense==="présent de l'indicatif")return(s==='nous'||s==='vous'?yStem:iStem)+pe[s];
      if(tense==='imparfait')return yStem+ie[s];
      if(tense==='futur simple')return iStem+'er'+fe[s];
      if(tense==='conditionnel présent')return iStem+'er'+ce[s];
      if(tense==='subjonctif présent')return(s==='nous'||s==='vous'?yStem:iStem)+se[s];
      if(tense==='impératif présent'){if(!['tu','nous','vous'].includes(s))return null;return(s==='nous'||s==='vous'?yStem:iStem)+pe[s].replace(/s$/,'');}
      return null;
    }
    function ayERVariant(form,tense,verb){
      if(!/ayer$/.test(baseVerb(verb)))return form;
      const f=String(form||'');
      if(tense==="présent de l'indicatif"||tense==='futur simple'){
        const variant=f.replace('i','y');
        return variant!==f?f+' / '+variant:f;
      }
      return f;
    }
    engine.conjugate=function(verb,tense,subject,construction){const generated=generate(verb,tense,subject);return generated!=null?ayERVariant(generated,tense,verb):originalConjugate(verb,tense,subject,construction);};
    if(typeof engine.canGenerate==='function'){
      const originalCanGenerate=engine.canGenerate.bind(engine);
      engine.canGenerate=function(verb,tense){if(resolvePattern(verb)==='yer'&&simple.has(tense))return true;return originalCanGenerate(verb,tense);};
    }
    function yerRows(verb,tense,construction){
      if(resolvePattern(verb)!=='yer'||!simple.has(tense))return null;
      const subjects=tense==='impératif présent'?['tu','nous','vous']:['je','tu','il','elle','on','nous','vous','ils','elles'];
      const rows=[];
      subjects.forEach(subject=>{const form=engine.conjugate(verb,tense,subject,construction);if(form!=null&&String(form).trim()!=='')rows.push([subject,form]);});
      return rows;
    }
    function isHMuet(record,verb){return !!(record&&record.hMuet)||!!(window.COQ_H_MUET&&window.COQ_H_MUET[normalize(verb)]);}
    function shouldContractJe(verb,form){
      const r=verbs[baseVerb(verb)]||verbs[normalize(verb)];
      const f=String(form||'').trim().toLowerCase();
      return /^[aeiouyàâäéèêëîïôöùûüÿœæ]/.test(f)||isHMuet(r,verb);
    }
    function applyJeContraction(rows,verb,tense){
      return(rows||[]).map(row=>{
        let subject=row[0],form=row[1];
        if(baseSubject(subject)==='je'&&shouldContractJe(verb,form))subject=String(subject).replace(/^je$/,"j'").replace(/^que je$/,"que j'");
        return[subject,form];
      });
    }
    const originalRowsFor=engine.rowsFor.bind(engine);
    engine.rowsFor=function(verb,tense){
      const generated=yerRows(verb,tense);
      const rows=generated!==null?generated:originalRowsFor(verb,tense);
      return applyJeContraction(rows,verb,tense);
    };
    const originalRowsForLookup=engine.rowsForLookup&&engine.rowsForLookup.bind(engine);
    if(originalRowsForLookup){
      engine.rowsForLookup=function(verb,tense){
        const generated=yerRows(verb,tense);
        const rows=generated!==null?generated:originalRowsForLookup(verb,tense);
        return applyJeContraction(rows,verb,tense);
      };
    }
    engine.__yerPatch=true;
    if(window.COQ_CONJ_UTILS&&typeof window.COQ_CONJ_UTILS.sameAnswer==='function'){
      const originalSameAnswer=window.COQ_CONJ_UTILS.sameAnswer.bind(window.COQ_CONJ_UTILS);
      window.COQ_CONJ_UTILS.sameAnswer=function(answer,q){
        if(q&&q.verb&&resolvePattern(q.verb)==='yer'){
          const normalized=String(answer||'').trim().toLocaleLowerCase(),canonical=String(q.answer||'').trim().toLocaleLowerCase(),alternatives=new Set([canonical]);
          canonical.split(' / ').forEach(v=>alternatives.add(v));
          if(/(?:pa|essa)y/.test(canonical))alternatives.add(canonical.replace(/i/g,'y'));
          if(/^p(?:a|)ie/.test(canonical))alternatives.add(canonical.replace(/ie/,'ye'));
          if(/^essaie/.test(canonical))alternatives.add(canonical.replace(/^essaie/,'essaye'));
          if(/^essaier/.test(canonical))alternatives.add(canonical.replace(/^essaier/,'essayer'));
          if(/^paier/.test(canonical))alternatives.add(canonical.replace(/^paier/,'payer'));
          if(alternatives.has(normalized))return true;
        }
        return originalSameAnswer(answer,q);
      };
    }
  });
})();

(function(){
  if(document.querySelector('link[data-coq-conjugaison-mobile]'))return;
  const link=document.createElement('link');link.rel='stylesheet';link.href='../css/conjugaison-mobile.css';link.dataset.coqConjugaisonMobile='';document.head.appendChild(link);
})();
