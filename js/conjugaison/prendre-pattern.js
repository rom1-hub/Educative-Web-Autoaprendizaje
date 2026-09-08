/* COQ — regla generativa de la familia prendre. */
(function(){
  const SUBJECTS=['je','tu','il','elle','on','nous','vous','ils','elles'];
  const PRESENT={je:'s',tu:'s',il:'d',elle:'d',on:'d',nous:'ons',vous:'ez',ils:'nent',elles:'nent'};
  const CONDITIONAL={je:'ais',tu:'ais',il:'ait',elle:'ait',on:'ait',nous:'ions',vous:'iez',ils:'aient',elles:'aient'};
  const SUBJ={je:'e',tu:'es',il:'e',elle:'e',on:'e',nous:'ions',vous:'iez',ils:'ent',elles:'ent'};

  function normalize(v){return String(v||'').trim().toLowerCase();}
  function baseVerb(v){
    const key=normalize(v), verbs=window.COQ_VERBS||{}, record=verbs[key];
    if(record&&record.verbeBase&&verbs[normalize(record.verbeBase)])return normalize(record.verbeBase);
    return key.startsWith('se ')?key.slice(3).trim():key;
  }
  function subjectBase(s){
    const x=normalize(s).replace(/\s*\([^)]*\)\s*$/,'');
    if(x==='j\''||x==='je'||x==='que je'||x==='que j\'')return 'je';
    if(x==='tu'||x==='que tu')return 'tu';
    if(x==="il"||x==="qu'il"||x==='que il')return 'il';
    if(x==='elle'||x==="qu'elle"||x==='que elle')return 'elle';
    if(x==='on'||x==="qu'on"||x==='que on')return 'on';
    if(x==='nous'||x==='que nous')return 'nous';
    if(x==='vous'||x==='que vous')return 'vous';
    if(x==="ils"||x==="qu'ils"||x==='que ils')return 'ils';
    if(x==='elles'||x==="qu'elles"||x==='que elles')return 'elles';
    return x;
  }
  function form(verb,tense,subject){
    const base=baseVerb(verb), s=subjectBase(subject);
    if(base!=='prendre'||!SUBJECTS.includes(s))return null;
    if(tense==='conditionnel présent')return base+CONDITIONAL[s];
    if(tense==='subjonctif présent'){
      const stem=['je','tu','il','elle','on','ils','elles'].includes(s)?'prenn':'pren';
      return stem+SUBJ[s];
    }
    return null;
  }
  function install(){
    const engine=window.COQ_CONJ_ENGINE;
    if(!engine||engine.__prendrePatternInstalled)return false;
    const originalConjugate=engine.conjugate;
    const originalRowsFor=engine.rowsFor;
    const originalRowsForLookup=engine.rowsForLookup;
    const originalRowsForConstruction=engine.rowsForConstruction;
    const SIMPLE=new Set(['conditionnel présent','subjonctif présent']);
    function isPrendre(v){return baseVerb(v)==='prendre';}
    engine.conjugate=function(verb,tense,subject,construction){
      const generated=form(verb,tense,subject);
      if(isPrendre(verb)&&SIMPLE.has(tense)&&construction!=='pronominale'&&generated!==null)return generated;
      return originalConjugate(verb,tense,subject,construction);
    };
    engine.rowsFor=function(verb,tense){
      if(!isPrendre(verb)||!SIMPLE.has(tense))return originalRowsFor(verb,tense);
      return SUBJECTS.map(s=>[s,form(verb,tense,s)]);
    };
    engine.rowsForLookup=function(verb,tense){
      if(!isPrendre(verb)||!SIMPLE.has(tense))return originalRowsForLookup(verb,tense);
      const rows=SUBJECTS.map(s=>[s,form(verb,tense,s)]);
      if(tense==='subjonctif présent'){
        const prefixes={je:'que je',tu:'que tu',il:"qu'il",elle:"qu'elle",on:"qu'on",nous:'que nous',vous:'que vous',ils:"qu'ils",elles:"qu'elles"};
        return rows.map(r=>[prefixes[r[0]],r[1]]);
      }
      return rows;
    };
    engine.rowsForConstruction=function(verb,tense,construction){
      if(isPrendre(verb)&&SIMPLE.has(tense)&&construction!=='pronominale')return engine.rowsFor(verb,tense);
      return originalRowsForConstruction(verb,tense,construction);
    };
    engine.__prendrePatternInstalled=true;
    window.COQ_PRENDRE_PATTERN_REGRESSION={
      conditionnel:{je:'prendrais',nous:'prendrions',ils:'prendraient'},
      subjonctif:{je:'prenne',nous:'prenions',ils:'prennent'}
    };
    return true;
  }
  function wait(){if(!install())window.setTimeout(wait,25);}
  wait();
})();
