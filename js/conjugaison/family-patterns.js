/* COQ — familias irregulares del 3.º grupo.
 * Estas familias son generativas: un mismo patrón sirve para varios verbos.
 * No reemplaza las reglas existentes; solo amplía el motor de forma modular.
 */
(function(){
  const FAMILY_PATTERNS={
    'partir-type':{groupe:3,description:'Famille partir : alternance du radical au présent'},
    'suivre-type':{groupe:3,description:'Famille suivre : radical suiv- au présent et à l’imparfait/subjonctif'}
  };
  window.COQ_VERB_PATTERNS=window.COQ_VERB_PATTERNS||{};
  Object.keys(FAMILY_PATTERNS).forEach(function(key){window.COQ_VERB_PATTERNS[key]=FAMILY_PATTERNS[key];});

  const SIMPLE=new Set(["présent de l'indicatif",'imparfait','futur simple','conditionnel présent','subjonctif présent','impératif présent']);
  const END={
    present:{je:'s',tu:'s',il:'t',elle:'t',on:'t',nous:'ons',vous:'ez',ils:'ent',elles:'ent'},
    imparfait:{je:'ais',tu:'ais',il:'ait',elle:'ait',on:'ait',nous:'ions',vous:'iez',ils:'aient',elles:'aient'},
    futur:{je:'ai',tu:'as',il:'a',elle:'a',on:'a',nous:'ons',vous:'ez',ils:'ont',elles:'ont'},
    conditionnel:{je:'ais',tu:'ais',il:'ait',elle:'ait',on:'ait',nous:'ions',vous:'iez',ils:'aient',elles:'aient'},
    subjonctif:{je:'e',tu:'es',il:'e',elle:'e',on:'e',nous:'ions',vous:'iez',ils:'ent',elles:'ent'}
  };

  function normalize(value){return String(value||'').trim().toLowerCase();}
  function baseSubject(subject){
    const raw=normalize(subject).replace(/\s*\([^)]*\)\s*$/,'').trim();
    if(/^j['’]$/.test(raw)||raw==='je'||/^que\s+j['’]$/.test(raw)||raw==='que je')return'je';
    if(/^qu['’]il$/.test(raw)||raw==='que il'||raw==='il')return'il';
    if(/^qu['’]elle$/.test(raw)||raw==='que elle'||raw==='elle')return'elle';
    if(/^qu['’]on$/.test(raw)||raw==='que on'||raw==='on')return'on';
    if(/^qu['’]ils$/.test(raw)||raw==='que ils'||raw==='ils')return'ils';
    if(/^qu['’]elles$/.test(raw)||raw==='que elles'||raw==='elles')return'elles';
    return raw;
  }
  function baseVerb(verb){
    const verbs=window.COQ_VERBS||{};
    const key=normalize(verb),r=verbs[key];
    if(r&&r.verbeBase&&verbs[normalize(r.verbeBase)])return normalize(r.verbeBase);
    return key.startsWith('se ')?key.slice(3).trim():key;
  }
  function familyOf(verb){
    const verbs=window.COQ_VERBS||{},base=baseVerb(verb),r=verbs[base];
    return r&&r.pattern;
  }
  function partirType(inf,s,tense){
    const radical=inf.replace(/ir$/,'');
    const singular=radical.slice(0,-1);
    if(tense==="présent de l'indicatif"){
      if(s==='je'||s==='tu')return singular+END.present[s];
      return radical;
    }
    if(tense==='imparfait')return radical+END.imparfait[s];
    if(tense==='futur simple')return inf+END.futur[s];
    if(tense==='conditionnel présent')return inf+END.conditionnel[s];
    if(tense==='subjonctif présent')return radical+END.subjonctif[s];
    if(tense==='impératif présent'){
      if(!['tu','nous','vous'].includes(s))return null;
      return s==='tu' ? singular+'s' : radical+END.present[s];
    }
    return null;
  }
  function suivreType(inf,s,tense){
    const radical=inf.replace(/ir$/,'');
    const singular=radical.slice(0,-1);
    if(tense==="présent de l'indicatif"){
      if(s==='je'||s==='tu')return singular+END.present[s];
      if(s==='il'||s==='elle'||s==='on')return singular+END.present[s];
      return radical+END.present[s];
    }
    if(tense==='imparfait')return radical+END.imparfait[s];
    if(tense==='futur simple')return inf+END.futur[s];
    if(tense==='conditionnel présent')return inf+END.conditionnel[s];
    if(tense==='subjonctif présent')return radical+END.subjonctif[s];
    if(tense==='impératif présent'){
      if(!['tu','nous','vous'].includes(s))return null;
      return s==='tu' ? singular+END.present[s] : radical+END.present[s];
    }
    return null;
  }
  function familyForm(verb,tense,subject){
    const verbs=window.COQ_VERBS||{},base=baseVerb(verb),r=verbs[base];
    if(!r||!SIMPLE.has(tense))return null;
    const s=baseSubject(subject),inf=r.infinitif_base||r.infinitif||base;
    if(r.pattern==='partir-type')return partirType(inf,s,tense);
    if(r.pattern==='suivre-type')return suivreType(inf,s,tense);
    return null;
  }
  function ensureRecords(){
    const verbs=window.COQ_VERBS||(window.COQ_VERBS={});
    const family={
      servir:{pattern:'partir-type',auxiliaire:'avoir',pp:'servi'},
      suivre:{pattern:'suivre-type',auxiliaire:'avoir',pp:'suivi'}
    };
    ['partir','sortir','dormir'].forEach(function(key){if(verbs[key])verbs[key].pattern='partir-type';});
    Object.keys(family).forEach(function(key){
      if(verbs[key])return;
      const x=family[key];
      verbs[key]={id:key,infinitif:key,infinitif_base:key,groupe:3,pattern:x.pattern,auxiliaire:x.auxiliaire,pronominal:false,participePasse:x.pp,construction:'non-pronominale',verbeBase:key};
    });
  }

  function install(){
    ensureRecords();
    const engine=window.COQ_CONJ_ENGINE;
    if(!engine||engine.__familyPatternsInstalled)return false;
    const originalConjugate=engine.conjugate;
    const originalRowsFor=engine.rowsFor;
    const originalRowsForLookup=engine.rowsForLookup;
    const originalRowsForConstruction=engine.rowsForConstruction;
    function isFamilyVerb(verb){return ['partir-type','suivre-type'].includes(familyOf(verb));}
    engine.conjugate=function(verb,tense,subject,construction){
      const r=(window.COQ_VERBS||{})[baseVerb(verb)];
      if(r&&isFamilyVerb(verb)&&SIMPLE.has(tense)&&construction!=='pronominale'){
        const generated=familyForm(verb,tense,subject);
        if(generated!==null)return generated;
      }
      return originalConjugate(verb,tense,subject,construction);
    };
    function subjectFromRow(label){return baseSubject(label);}
    engine.rowsFor=function(verb,tense){
      if(!isFamilyVerb(verb)||!SIMPLE.has(tense))return originalRowsFor(verb,tense);
      const source=originalRowsFor(verb,tense);
      return source.map(function(row){return [row[0],engine.conjugate(verb,tense,subjectFromRow(row[0]),'non-pronominale')];});
    };
    engine.rowsForLookup=function(verb,tense){
      if(!isFamilyVerb(verb)||!SIMPLE.has(tense))return originalRowsForLookup(verb,tense);
      const source=originalRowsForLookup(verb,tense);
      return source.map(function(row){return [row[0],engine.conjugate(verb,tense,subjectFromRow(row[0]),'non-pronominale')];});
    };
    engine.rowsForConstruction=function(verb,tense,construction){
      if(!isFamilyVerb(verb)||!SIMPLE.has(tense))return originalRowsForConstruction(verb,tense,construction);
      if(construction==='pronominale')return originalRowsForConstruction(verb,tense,construction);
      const source=originalRowsForConstruction(verb,tense,construction);
      return source.map(function(row){return [row[0],engine.conjugate(verb,tense,subjectFromRow(row[0]),construction)];});
    };
    engine.__familyPatternsInstalled=true;
    window.COQ_FAMILY_PATTERN_REGRESSION={
      patterns:{partir:['partir','sortir','dormir','servir'],suivre:['suivre']},
      expected:{
        partir:{je:'pars',nous:'partons',ils:'partent'},
        sortir:{je:'sors',nous:'sortons',ils:'sortent'},
        dormir:{je:'dors',nous:'dormons',ils:'dorment'},
        servir:{je:'sers',nous:'servons',ils:'servent'},
        suivre:{je:'suis',nous:'suivons',ils:'suivent'}
      }
    };
    return true;
  }

  function waitForEngine(attempt){
    ensureRecords();
    if(install())return;
    if((attempt||0)<100)setTimeout(function(){waitForEngine((attempt||0)+1);},25);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){waitForEngine(0);});
  else waitForEngine(0);
})();
