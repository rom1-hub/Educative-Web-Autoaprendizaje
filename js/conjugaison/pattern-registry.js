/* COQ — Registre central des patrons de conjugaison.
 * Première étape de migration : familles simples et régulières.
 * Ce module ne modifie pas le moteur et ne contient aucun monkey-patch.
 */
(function(){
  const subjects={
    je:'e',tu:'es',il:'e',elle:'e',on:'e',nous:'ons',vous:'ez',ils:'ent',elles:'ent'
  };
  const imparfait={
    je:'ais',tu:'ais',il:'ait',elle:'ait',on:'ait',nous:'ions',vous:'iez',ils:'aient',elles:'aient'
  };
  const futur={
    je:'ai',tu:'as',il:'a',elle:'a',on:'a',nous:'ons',vous:'ez',ils:'ont',elles:'ont'
  };
  const conditionnel={
    je:'ais',tu:'ais',il:'ait',elle:'ait',on:'ait',nous:'ions',vous:'iez',ils:'aient'
  };
  const subjonctif={
    je:'e',tu:'es',il:'e',elle:'e',on:'e',nous:'ions',vous:'iez',ils:'ent',elles:'ent'
  };

  function stemEr(inf){return inf.replace(/er$/,'');}
  function presentEr(inf,s){return stemEr(inf)+subjects[s];}
  function presentGer(inf,s){
    const stem=stemEr(inf);
    return s==='nous' ? stem+'eons' : stem+subjects[s];
  }
  function presentCer(inf,s){
    const stem=stemEr(inf);
    return s==='nous' ? stem.slice(0,-1)+'çons' : stem+subjects[s];
  }
  function presentIr(inf,s){
    const stem=inf.replace(/ir$/,'');
    const end={je:'is',tu:'is',il:'it',elle:'it',on:'it',nous:'issons',vous:'issez',ils:'issent',elles:'issent'}[s];
    return stem+end;
  }
  function presentRe(inf,s){
    const stem=inf.replace(/re$/,'');
    const end={je:'s',tu:'s',il:'',elle:'',on:'',nous:'ons',vous:'ez',ils:'ent',elles:'ent'}[s];
    return stem+end;
  }
  function imparfaitFromPresent(inf,s,kind){
    const present=kind==='regular-ir' ? presentIr(inf,'nous') : kind==='regular-re' ? presentRe(inf,'nous') : kind==='er-ger' ? presentGer(inf,'nous') : kind==='er-cer' ? presentCer(inf,'nous') : presentEr(inf,'nous');
    let stem=present.replace(/ons$/,'');
    if(kind==='er-ger') stem=stem.replace(/e$/,'');
    if(kind==='er-cer') stem=stem.replace(/ç$/,'c');
    return stem+imparfait[s];
  }
  function futureFromInfinitive(inf,s){return inf+futur[s];}
  function conditionalFromInfinitive(inf,s){return inf+conditionnel[s];}
  function subjEr(inf,s){
    const stem=presentEr(inf,'ils').replace(/ent$/,'');
    return stem+subjonctif[s];
  }
  function subjIr(inf,s){
    const stem=presentIr(inf,'ils').replace(/issent$/,'iss');
    return stem+subjonctif[s];
  }
  function imperativeEr(inf,s){
    if(!['tu','nous','vous'].includes(s)) return null;
    const form=presentEr(inf,s);
    return s==='tu' ? form.replace(/s$/,'') : form;
  }

  function simpleGenerator(inf,s,tense,kind){
    if(kind==='regular-er'||kind==='er-ger'||kind==='er-cer'){
      if(tense==="présent de l'indicatif") return kind==='er-ger' ? presentGer(inf,s) : kind==='er-cer' ? presentCer(inf,s) : presentEr(inf,s);
      if(tense==='imparfait') return imparfaitFromPresent(inf,s,kind);
      if(tense==='futur simple') return futureFromInfinitive(inf,s);
      if(tense==='conditionnel présent') return conditionalFromInfinitive(inf,s);
      if(tense==='subjonctif présent') return subjEr(inf,s);
      if(tense==='impératif présent') return imperativeEr(inf,s);
    }
    if(kind==='regular-ir'){
      if(tense==="présent de l'indicatif") return presentIr(inf,s);
      if(tense==='imparfait') return imparfaitFromPresent(inf,s,kind);
      if(tense==='futur simple') return futureFromInfinitive(inf,s);
      if(tense==='conditionnel présent') return conditionalFromInfinitive(inf,s);
      if(tense==='subjonctif présent') return subjIr(inf,s);
      if(tense==='impératif présent') return presentIr(inf,s);
    }
    if(kind==='regular-re'){
      if(tense==="présent de l'indicatif") return presentRe(inf,s);
      if(tense==='imparfait') return imparfaitFromPresent(inf,s,kind);
      if(tense==='futur simple') return futureFromInfinitive(inf,s);
      if(tense==='conditionnel présent') return conditionalFromInfinitive(inf,s);
    }
    return null;
  }

  function erEAccent(inf,s,tense){
    const stem=stemEr(inf);
    const accented=stem.replace(/e([^e]*)$/,'è$1');
    if(tense==="présent de l'indicatif"){
      if(['nous','vous'].includes(s)) return stem+subjects[s];
      return accented+subjects[s];
    }
    if(tense==='imparfait') return imparfaitFromPresent(inf,s,'regular-er');
    if(tense==='futur simple') return accented+'er'+futur[s];
    if(tense==='conditionnel présent') return accented+'er'+conditionnel[s];
    if(tense==='subjonctif présent'){
      if(['nous','vous'].includes(s)) return stem+subjonctif[s];
      return accented+subjonctif[s];
    }
    if(tense==='impératif présent'){
      if(!['tu','nous','vous'].includes(s)) return null;
      if(s==='tu') return accented+subjects[s].replace(/s$/,'');
      return stem+subjects[s];
    }
    return null;
  }

  function eAccent(inf,s,tense){
    return erEAccent(inf,s,tense);
  }

  const definitions={
    'regular-er':{groupe:1,description:'Premier groupe régulier en -ER',generate:(inf,s,t)=>simpleGenerator(inf,s,t,'regular-er')},
    'regular-ir':{groupe:2,description:'Deuxième groupe régulier en -IR',generate:(inf,s,t)=>simpleGenerator(inf,s,t,'regular-ir')},
    'regular-re':{groupe:3,description:'Verbes réguliers en -RE',generate:(inf,s,t)=>simpleGenerator(inf,s,t,'regular-re')},
    'er-ger':{groupe:1,description:'Premier groupe avec terminaison -GER',generate:(inf,s,t)=>simpleGenerator(inf,s,t,'er-ger')},
    'er-cer':{groupe:1,description:'Premier groupe avec terminaison -CER',generate:(inf,s,t)=>simpleGenerator(inf,s,t,'er-cer')},
    'er-e-accent':{groupe:1,description:'Premier groupe avec alternance E/È + consonne + ER',generate:erEAccent},
    'e-accent':{groupe:1,description:'Premier groupe avec alternance E/È',generate:eAccent}
  };

  function get(pattern){return definitions[pattern]||null;}
  function generate(pattern,infinitive,subject,tense){
    const definition=get(pattern);
    return definition&&typeof definition.generate==='function' ? definition.generate(infinitive,subject,tense) : null;
  }

  window.COQ_PATTERN_REGISTRY={definitions,get,generate};
})();
