/* COQ — Registre central des patrons de conjugaison.
 * Source unique des règles de génération par famille.
 * Ce module ne modifie pas le moteur et ne contient aucun monkey-patch.
 */
(function(){
  const subjects={je:'e',tu:'es',il:'e',elle:'e',on:'e',nous:'ons',vous:'ez',ils:'ent',elles:'ent'};
  const imparfait={je:'ais',tu:'ais',il:'ait',elle:'ait',on:'ait',nous:'ions',vous:'iez',ils:'aient',elles:'aient'};
  const futur={je:'ai',tu:'as',il:'a',elle:'a',on:'a',nous:'ons',vous:'ez',ils:'ont',elles:'ont'};
  const conditionnel={je:'ais',tu:'ais',il:'ait',elle:'ait',on:'ait',nous:'ions',vous:'iez',ils:'aient'};
  const subjonctif={je:'e',tu:'es',il:'e',elle:'e',on:'e',nous:'ions',vous:'iez',ils:'ent',elles:'ent'};
  const presentIr={je:'is',tu:'is',il:'it',elle:'it',on:'it',nous:'issons',vous:'issez',ils:'issent',elles:'issent'};
  const presentRe={je:'s',tu:'s',il:'',elle:'',on:'',nous:'ons',vous:'ez',ils:'ent',elles:'ent'};
  const imperativeSubjects=['tu','nous','vous'];

  function stemEr(inf){return inf.replace(/er$/,'');}
  function presentEr(inf,s){return stemEr(inf)+subjects[s];}
  function presentGer(inf,s){const stem=stemEr(inf);return s==='nous'?stem+'eons':stem+subjects[s];}
  function presentCer(inf,s){const stem=stemEr(inf);return s==='nous'?stem.slice(0,-1)+'çons':stem+subjects[s];}
  function presentIrForm(inf,s){return inf.replace(/ir$/,'')+presentIr[s];}
  function presentReForm(inf,s){return inf.replace(/re$/,'')+presentRe[s];}
  function imparfaitFromPresent(inf,s,kind){
    const present=kind==='regular-ir'?presentIrForm(inf,'nous'):kind==='regular-re'?presentReForm(inf,'nous'):kind==='er-ger'?presentGer(inf,'nous'):kind==='er-cer'?presentCer(inf,'nous'):presentEr(inf,'nous');
    let stem=present.replace(/ons$/,'');
    if(kind==='er-ger')stem=stem.replace(/e$/,'');
    if(kind==='er-cer')stem=stem.replace(/ç$/,'c');
    return stem+imparfait[s];
  }
  function futureFromInfinitive(inf,s){return inf+futur[s];}
  function conditionalFromInfinitive(inf,s){return inf+conditionnel[s];}
  function subjEr(inf,s){const stem=presentEr(inf,'ils').replace(/ent$/,'');return stem+subjonctif[s];}
  function subjIr(inf,s){const stem=presentIrForm(inf,'ils').replace(/issent$/,'iss');return stem+subjonctif[s];}
  function imperativeEr(inf,s){if(!imperativeSubjects.includes(s))return null;const form=presentEr(inf,s);return s==='tu'?form.replace(/s$/,''):form;}
  function imperativeIr(inf,s){return imperativeSubjects.includes(s)?presentIrForm(inf,s):null;}

  function simpleGenerator(inf,s,tense,kind){
    if(kind==='regular-er'||kind==='er-ger'||kind==='er-cer'){
      if(tense==="présent de l'indicatif")return kind==='er-ger'?presentGer(inf,s):kind==='er-cer'?presentCer(inf,s):presentEr(inf,s);
      if(tense==='imparfait')return imparfaitFromPresent(inf,s,kind);
      if(tense==='futur simple')return futureFromInfinitive(inf,s);
      if(tense==='conditionnel présent')return conditionalFromInfinitive(inf,s);
      if(tense==='subjonctif présent')return subjEr(inf,s);
      if(tense==='impératif présent')return imperativeEr(inf,s);
    }
    if(kind==='regular-ir'){
      if(tense==="présent de l'indicatif")return presentIrForm(inf,s);
      if(tense==='imparfait')return imparfaitFromPresent(inf,s,kind);
      if(tense==='futur simple')return futureFromInfinitive(inf,s);
      if(tense==='conditionnel présent')return conditionalFromInfinitive(inf,s);
      if(tense==='subjonctif présent')return subjIr(inf,s);
      if(tense==='impératif présent')return imperativeIr(inf,s);
    }
    if(kind==='regular-re'){
      if(tense==="présent de l'indicatif")return presentReForm(inf,s);
      if(tense==='imparfait')return imparfaitFromPresent(inf,s,kind);
      if(tense==='futur simple')return futureFromInfinitive(inf,s);
      if(tense==='conditionnel présent')return conditionalFromInfinitive(inf,s);
    }
    return null;
  }

  function erEAccent(inf,s,tense){
    const stem=stemEr(inf),accented=stem.replace(/e([^e]*)$/,'è$1');
    if(tense==="présent de l'indicatif")return ['nous','vous'].includes(s)?stem+subjects[s]:accented+subjects[s];
    if(tense==='imparfait')return imparfaitFromPresent(inf,s,'regular-er');
    if(tense==='futur simple')return accented+'er'+futur[s];
    if(tense==='conditionnel présent')return accented+'er'+conditionnel[s];
    if(tense==='subjonctif présent')return ['nous','vous'].includes(s)?stem+subjonctif[s]:accented+subjonctif[s];
    if(tense==='impératif présent'){if(!imperativeSubjects.includes(s))return null;return s==='tu'?accented:stem+subjects[s];}
    return null;
  }

  function partirType(inf,s,tense){
    const radical=inf.replace(/ir$/,''),singular=radical.slice(0,-1);
    if(tense==="présent de l'indicatif")return ['je','tu','il','elle','on'].includes(s)?singular+{je:'s',tu:'s',il:'t',elle:'t',on:'t'}[s]:radical+{nous:'ons',vous:'ez',ils:'ent',elles:'ent'}[s];
    if(tense==='imparfait')return radical+imparfait[s];
    if(tense==='futur simple')return inf+futur[s];
    if(tense==='conditionnel présent')return inf+conditionnel[s];
    if(tense==='subjonctif présent')return radical+subjonctif[s];
    if(tense==='impératif présent'){if(!imperativeSubjects.includes(s))return null;return s==='tu'?singular+'s':radical+{nous:'ons',vous:'ez'}[s];}
    return null;
  }

  function suivreType(inf,s,tense){
    const singularStem='sui',pluralStem='suiv';
    if(tense==="présent de l'indicatif"){
      const end={je:'s',tu:'s',il:'t',elle:'t',on:'t',nous:'ons',vous:'ez',ils:'ent',elles:'ent'}[s];
      return (['je','tu','il','elle','on'].includes(s)?singularStem:pluralStem)+end;
    }
    if(tense==='imparfait')return pluralStem+imparfait[s];
    if(tense==='futur simple')return inf+futur[s];
    if(tense==='conditionnel présent')return inf+conditionnel[s];
    if(tense==='subjonctif présent')return pluralStem+subjonctif[s];
    if(tense==='impératif présent'){if(!imperativeSubjects.includes(s))return null;return s==='tu'?'suis':pluralStem+{nous:'ons',vous:'ez'}[s];}
    return null;
  }

  function ouvrirType(inf,s,tense){
    const stem=inf.replace(/ir$/,''),present={je:'e',tu:'es',il:'e',elle:'e',on:'e',nous:'ons',vous:'ez',ils:'ent',elles:'ent'};
    if(tense==="présent de l'indicatif")return stem+present[s];
    if(tense==='imparfait')return stem+imparfait[s];
    if(tense==='futur simple')return inf+futur[s];
    if(tense==='conditionnel présent')return inf+conditionnel[s];
    if(tense==='subjonctif présent')return stem+subjonctif[s];
    if(tense==='impératif présent'){if(!imperativeSubjects.includes(s))return null;return s==='tu'?stem+'e':stem+present[s];}
    return null;
  }

  function venirType(inf,s,tense){
    const stem=inf.replace(/ir$/,''),singular=stem.replace(/ven$/,'vien'),subjSingular=stem.replace(/ven$/,'vienn'),future=inf.replace(/enir$/,'iendr');
    if(tense==="présent de l'indicatif"){
      if(['je','tu','il','elle','on','ils','elles'].includes(s))return singular+{je:'s',tu:'s',il:'t',elle:'t',on:'t',nous:'ons',vous:'ez',ils:'ent',elles:'ent'}[s];
      return stem+{je:'s',tu:'s',il:'t',elle:'t',on:'t',nous:'ons',vous:'ez',ils:'ent',elles:'ent'}[s];
    }
    if(tense==='imparfait')return stem+imparfait[s];
    if(tense==='futur simple')return future+futur[s];
    if(tense==='conditionnel présent')return future+conditionnel[s];
    if(tense==='subjonctif présent'){
      if(['je','tu','il','elle','on','ils','elles'].includes(s))return subjSingular+subjonctif[s];
      return stem+subjonctif[s];
    }
    if(tense==='impératif présent'){
      if(!imperativeSubjects.includes(s))return null;
      return singular+{je:'s',tu:'s',il:'t',elle:'t',on:'t',nous:'ons',vous:'ez',ils:'ent',elles:'ent'}[s];
    }
    return null;
  }

  function tenirType(inf,s,tense){
    const stem=inf.replace(/ir$/,''),singular=stem.replace(/ten$/,'tien'),subjSingular=stem.replace(/ten$/,'tienn'),future=inf.replace(/enir$/,'iendr');
    if(tense==="présent de l'indicatif"){
      if(['je','tu','il','elle','on','ils','elles'].includes(s))return singular+{je:'s',tu:'s',il:'t',elle:'t',on:'t',nous:'ons',vous:'ez',ils:'ent',elles:'ent'}[s];
      return stem+{je:'s',tu:'s',il:'t',elle:'t',on:'t',nous:'ons',vous:'ez',ils:'ent',elles:'ent'}[s];
    }
    if(tense==='imparfait')return stem+imparfait[s];
    if(tense==='futur simple')return future+futur[s];
    if(tense==='conditionnel présent')return future+conditionnel[s];
    if(tense==='subjonctif présent'){
      if(['je','tu','il','elle','on','ils','elles'].includes(s))return subjSingular+subjonctif[s];
      return stem+subjonctif[s];
    }
    if(tense==='impératif présent'){
      if(!imperativeSubjects.includes(s))return null;
      return singular+{je:'s',tu:'s',il:'t',elle:'t',on:'t',nous:'ons',vous:'ez',ils:'ent',elles:'ent'}[s];
    }
    return null;
  }

  const definitions={
    'regular-er':{groupe:1,description:'Premier groupe régulier en -ER',generate:(inf,s,t)=>simpleGenerator(inf,s,t,'regular-er')},
    'regular-ir':{groupe:2,description:'Deuxième groupe régulier en -IR',generate:(inf,s,t)=>simpleGenerator(inf,s,t,'regular-ir')},
    'regular-re':{groupe:3,description:'Verbes réguliers en -RE',generate:(inf,s,t)=>simpleGenerator(inf,s,t,'regular-re')},
    'er-ger':{groupe:1,description:'Premier groupe avec terminaison -GER',generate:(inf,s,t)=>simpleGenerator(inf,s,t,'er-ger')},
    'er-cer':{groupe:1,description:'Premier groupe avec terminaison -CER',generate:(inf,s,t)=>simpleGenerator(inf,s,t,'er-cer')},
    'er-e-accent':{groupe:1,description:'Premier groupe avec alternance E/È + consonne + ER',generate:erEAccent},
    'e-accent':{groupe:1,description:'Premier groupe avec alternance E/È',generate:erEAccent},
    'partir-type':{groupe:3,description:'Famille partir : alternance du radical au présent',generate:partirType},
    'suivre-type':{groupe:3,description:'Famille suivre : radical sui-/suiv-',generate:suivreType},
    'ouvrir-type':{groupe:3,description:'Famille ouvrir : présent en -e/-es/-e, pluriel en -ons/-ez/-ent',generate:ouvrirType},
    'venir-type':{groupe:3,description:'Famille venir : alternance vien-/ven- au présent et viendr- au futur',generate:venirType},
    'tenir-type':{groupe:3,description:'Famille tenir : alternance tien-/ten- au présent et tiendr- au futur',generate:tenirType}
  };

  function get(pattern){return definitions[pattern]||null;}
  function generate(pattern,infinitive,subject,tense){const definition=get(pattern);return definition&&typeof definition.generate==='function'?definition.generate(infinitive,subject,tense):null;}
  window.COQ_PATTERN_REGISTRY={definitions,get,generate};
})();
