/* COQ — Motor de conjugación.
 * 3F1: genera tiempos simples a partir del verbo y su patrón.
 * Para patrones/tiempos todavía no migrados, conserva una ruta de compatibilidad
 * hacia las formas explícitas de la base de datos.
 */
(function(){
  const U=window.COQ_CONJ_UTILS;
  const P=window.COQ_CONJ_PRONOUNS;
  const C=window.COQ_CONJ_COMPOUND;
  const A=window.COQ_CONJ_AGREEMENT;
  const R=window.COQ_PATTERN_REGISTRY;
  const verbs=window.COQ_VERBS||{};
  const patterns=window.COQ_VERB_PATTERNS||{};
  const simpleTenses=new Set([
    "présent de l'indicatif",'imparfait','futur simple','conditionnel présent','subjonctif présent','impératif présent'
  ]);
  const subjects=['je','tu','il','elle','on','nous','vous','ils','elles'];

  function baseKey(verb){
    const v=verbs[verb];
    return v&&v.verbeBase&&verbs[v.verbeBase] ? v.verbeBase : verb;
  }
  function record(verb){return verbs[verb]||null;}
  function stemEr(inf){return inf.replace(/er$/,'');}
  function presentRegularEr(inf,s){
    let stem=stemEr(inf);
    if(/ger$/.test(inf)&&s==='nous') return stem+'eons';
    if(/cer$/.test(inf)&&s==='nous') return stem.slice(0,-1)+'çons';
    const end={je:'e',tu:'es',il:'e',elle:'e',on:'e',nous:'ons',vous:'ez',ils:'ent',elles:'ent'}[s];
    return stem+end;
  }
  function presentRegularIr(inf,s){
    const stem=inf.replace(/ir$/,'');
    const end={je:'is',tu:'is',il:'it',elle:'it',on:'it',nous:'issons',vous:'issez',ils:'issent',elles:'issent'}[s];
    return stem+end;
  }
  function presentRegularRe(inf,s){
    const stem=inf.replace(/re$/,'');
    const end={je:'s',tu:'s',il:'',elle:'',on:'',nous:'ons',vous:'ez',ils:'ent',elles:'ent'}[s];
    return stem+end;
  }
  function presentErEAccent(inf,s){
    const stem=stemEr(inf);
    const accented=/[eè]$/.test(stem) ? stem : stem.replace(/e([^e]*)$/,'è$1');
    if(['je','tu','il','elle','on','ils','elles'].includes(s)) return accented+({je:'e',tu:'es',il:'e',elle:'e',on:'e',ils:'ent',elles:'ent'}[s]);
    return stem+({nous:'ons',vous:'ez'}[s]);
  }

  function presentEAccent(inf,s){
    const stem=stemEr(inf);
    const accented=stem.replace(/e([^e]*)$/,'è$1');
    if(['je','tu','il','elle','on','ils','elles'].includes(s)){
      const end={je:'e',tu:'es',il:'e',elle:'e',on:'e',ils:'ent',elles:'ent'}[s];
      return accented+end;
    }
    return stem+({nous:'ons',vous:'ez'}[s]);
  }

  function futureEAccent(inf,s){
    const base=inf.replace(/er$/,'');
    const stem=base.replace(/e([^e]*)$/,'è$1');
    const end={je:'ai',tu:'as',il:'a',elle:'a',on:'a',nous:'ons',vous:'ez',ils:'ont',elles:'ont'}[s];
    return stem+'er'+end;
  }

  function conditionalEAccent(inf,s){
    const base=inf.replace(/er$/,'');
    const stem=base.replace(/e([^e]*)$/,'è$1');
    const end={je:'ais',tu:'ais',il:'ait',elle:'ait',on:'ait',nous:'ions',vous:'iez',ils:'aient',elles:'aient'}[s];
    return stem+'er'+end;
  }

  function subjEAccent(inf,s){
    const stem=stemEr(inf);
    const accented=stem.replace(/e([^e]*)$/,'è$1');
    if(['je','tu','il','elle','on'].includes(s)){
      const end={je:'e',tu:'es',il:'e',elle:'e',on:'e'}[s];
      return accented+end;
    }
    if(s==='nous') return stem+'ions';
    if(s==='vous') return stem+'iez';
    return accented+'ent';
  }

  function subjErEAccent(inf,s){
    const stem=stemEr(inf);
    const singular=stem.replace(/e([^e]*)$/,'è$1');
    if(['je','tu','il','elle','on'].includes(s)) return singular+({je:'e',tu:'es',il:'e',elle:'e',on:'e'}[s]);
    if(['nous','vous'].includes(s)) return stem+({nous:'ions',vous:'iez'}[s]);
    return singular+'ent';
  }
  function futureErEAccent(inf,s){
    const base=inf.replace(/er$/,'');
    const stem=base.replace(/e([^e]*)$/,'è$1');
    const end={je:'ai',tu:'as',il:'a',elle:'a',on:'a',nous:'ons',vous:'ez',ils:'ont',elles:'ont'}[s];
    return stem+'er'+end;
  }
  function conditionalErEAccent(inf,s){
    const base=futureErEAccent(inf,s);
    return base.replace(/(er)(ai|as|a|ons|ez|ont)$/,'er'+({je:'ais',tu:'ais',il:'ait',elle:'ait',on:'ait',nous:'ions',vous:'iez',ils:'aient',elles:'aient'}[s]));
  }
  function imparfaitFromPresent(inf,s,pattern){
    const pres=pattern==='regular-ir'
      ? presentRegularIr(inf,'nous')
      : pattern==='regular-re'
        ? presentRegularRe(inf,'nous')
        : presentRegularEr(inf,'nous');
    let stem=pres.replace(/ons$/,'');
    if(pattern==='er-ger' && (s==='nous' || s==='vous')) stem=stem.replace(/e$/,'');
    if(pattern==='er-cer' && (s==='nous' || s==='vous')) stem=stem.replace(/ç$/,'c');
    const end={je:'ais',tu:'ais',il:'ait',elle:'ait',on:'ait',nous:'ions',vous:'iez',ils:'aient',elles:'aient'}[s];
    return stem+end;
  }
  function futurFromInfinitive(inf,s){
    const end={je:'ai',tu:'as',il:'a',elle:'a',on:'a',nous:'ons',vous:'ez',ils:'ont',elles:'ont'}[s];
    return inf+end;
  }
  function conditionalFromFuture(inf,s){
    const end={je:'ais',tu:'ais',il:'ait',elle:'ait',on:'ait',nous:'ions',vous:'iez',ils:'aient',elles:'aient'}[s];
    return inf+end;
  }
  function subjRegularEr(inf,s){
    const stem=presentRegularEr(inf,'ils').replace(/ent$/,'');
    const end={je:'e',tu:'es',il:'e',elle:'e',on:'e',nous:'ions',vous:'iez',ils:'ent',elles:'ent'}[s];
    return stem+end;
  }
  function subjRegularIr(inf,s){
    const stem=presentRegularIr(inf,'ils').replace(/issent$/,'iss');
    const end={je:'e',tu:'es',il:'e',elle:'e',on:'e',nous:'ions',vous:'iez',ils:'ent',elles:'ent'}[s];
    return stem+end;
  }
  function imperative(inf,s){
    if(!['tu','nous','vous'].includes(s)) return null;
    let form=presentRegularEr(inf,s);
    if(s==='tu' && /er$/.test(inf) && !/aller$/.test(inf)) form=form.replace(/s$/,'');
    return form;
  }
  function imperativeIrregular(inf,s){
    if(!['tu','nous','vous'].includes(s)) return null;
    const forms={
      'être':{tu:'sois',nous:'soyons',vous:'soyez'},
      'avoir':{tu:'aie',nous:'ayons',vous:'ayez'},
      'prendre':{tu:'prends',nous:'prenons',vous:'prenez'},
      'aller':{tu:'va',nous:'allons',vous:'allez'},
      'venir':{tu:'viens',nous:'venons',vous:'venez'}
    }[inf];
    return forms ? forms[s] : null;
  }
  function generateBaseSimple(verb,tense,subject){
    const r=record(verb); if(!r) return null;
    const s=P.baseSubject(subject);
    const pattern=r.pattern;
    const inf=r.infinitif_base||r.infinitif;
    if(tense==='impératif présent'){
      const irregular=imperativeIrregular(inf,s);
      if(irregular)return irregular;
    }
    const registryResult=R && R.generate(pattern,inf,s,tense);
    if(registryResult!==null && registryResult!==undefined) return registryResult;
    if(pattern==='er-e-accent'){
      if(tense==="présent de l'indicatif") return presentErEAccent(inf,s);
      if(tense==='imparfait') return imparfaitFromPresent(inf,s,pattern);
      if(tense==='futur simple') return futureErEAccent(inf,s);
      if(tense==='conditionnel présent') return conditionalErEAccent(inf,s);
      if(tense==='subjonctif présent') return subjErEAccent(inf,s);
      if(tense==='impératif présent') return s==='tu'?presentErEAccent(inf,s).replace(/s$/,''):presentErEAccent(inf,s);
    }
    if(pattern==='e-accent'){
      if(tense==="présent de l'indicatif") return presentEAccent(inf,s);
      if(tense==='imparfait') return imparfaitFromPresent(inf,s,pattern);
      if(tense==='futur simple') return futureEAccent(inf,s);
      if(tense==='conditionnel présent') return conditionalEAccent(inf,s);
      if(tense==='subjonctif présent') return subjEAccent(inf,s);
      if(tense==='impératif présent') return s==='tu' ? presentEAccent(inf,s).replace(/s$/,'') : presentEAccent(inf,s);
    }
    if(pattern==='regular-er'||pattern==='er-ger'||pattern==='er-cer'){
      if(tense==="présent de l'indicatif") return presentRegularEr(inf,s);
      if(tense==='imparfait') return imparfaitFromPresent(inf,s,pattern);
      if(tense==='futur simple') return futurFromInfinitive(inf,s);
      if(tense==='conditionnel présent') return conditionalFromFuture(inf,s);
      if(tense==='subjonctif présent') return subjRegularEr(inf,s);
      if(tense==='impératif présent') return imperative(inf,s);
    }
    if(pattern==='regular-ir'){
      if(tense==="présent de l'indicatif") return presentRegularIr(inf,s);
      if(tense==='imparfait') return imparfaitFromPresent(inf,s,pattern);
      if(tense==='futur simple') return futurFromInfinitive(inf,s);
      if(tense==='conditionnel présent') return conditionalFromFuture(inf,s);
      if(tense==='subjonctif présent') return subjRegularIr(inf,s);
      if(tense==='impératif présent') return presentRegularIr(inf,s);
    }
    if(pattern==='regular-re'){
      if(tense==="présent de l'indicatif") return presentRegularRe(inf,s);
      if(tense==='imparfait') return imparfaitFromPresent(inf,s,pattern);
      if(tense==='futur simple') return futurFromInfinitive(inf,s);
      if(tense==='conditionnel présent') return conditionalFromFuture(inf,s);
    }
    return null;
  }
  function explicitForm(verb,tense,subject){
    const rows=(record(verb)?.formes||{})[tense]||[];
    const exact=rows.find(r=>r[0]===subject);
    if(exact) return exact[1];
    const base=P.baseSubject(subject);
    const grouped=rows.find(r=>r[0].split('/').map(x=>x.trim()).some(label=>P.baseSubject(label)===base));
    return grouped?grouped[1]:null;
  }
  function simpleForm(verb,tense,subject){
    const base=baseKey(verb);
    return generateBaseSimple(base,tense,subject) || explicitForm(base,tense,subject) || explicitForm(verb,tense,subject);
  }
  function subjectInfo(subject){
    const label=String(subject||'').trim();
    const base=P.baseSubject(label);
    const match=label.match(/\(([^)]+)\)/);
    let gender='masculin', number='singulier';
    if(match){
      const parts=match[1].toLowerCase();
      if(parts.includes('féminin')) gender='féminin';
      if(parts.includes('pluriel')) number='pluriel';
    }else if(base==='elle') gender='féminin';
    else if(base==='ils') {gender='masculin';number='pluriel';}
    else if(base==='elles') {gender='féminin';number='pluriel';}
    else if(base==='nous') number='pluriel';
    else if(base==='vous') number='pluriel';
    else if(base==='on') number='singulier';
    return {label,base,gender,number};
  }
  function participle(verb){
    const r=record(baseKey(verb));
    return r&&r.participePasse ? r.participePasse : null;
  }
  function compoundForm(verb,tense,subject,construction){
    if(!C || !C.isCompound(tense)) return null;
    const r=record(verb); if(!r) return null;
    const base=baseKey(verb);
    const info=subjectInfo(subject);
    const isPronominal=construction==='pronominale' || r.pronominal===true || r.construction==='pronominale';
    const auxiliary=isPronominal ? 'être' : r.auxiliaire;
    if(!auxiliary) return null;
    const auxForm=simpleForm(auxiliary,C.auxiliaryTense(tense),info.base);
    if(!auxForm) return null;
    let pp=participle(base); if(!pp) return null;
    if(A) pp=A.agree(pp,{gender:info.gender,number:info.number},{type:isPronominal?'pronominale':'non-pronominale',baseVerb:base,auxiliaire:auxiliary});
    if(isPronominal){
      const pron=P.pronounFor(info.base);
      if(!pron) return null;
      const cp=P.contractPronoun(pron,auxForm);
      return cp+(cp.endsWith("'")?'':' ')+auxForm+' '+pp;
    }
    return auxForm+' '+pp;
  }
  function conjugate(verb,tense,subject,construction){
    const r=record(verb); if(!r) return null;
    const isPronominal=construction==='pronominale' || r.pronominal===true || (r.construction==='pronominale' && construction!== 'non-pronominale');
    if(C && C.isCompound(tense)) return compoundForm(verb,tense,subject,isPronominal?'pronominale':'non-pronominale');
    const target=baseKey(verb);
    let form=simpleForm(target,tense,subject);
    if(form==null) form=explicitForm(verb,tense,subject);
    if(form==null) return null;
    if(isPronominal){
      if(tense==='impératif présent'){
        const imperativePronoun={tu:'toi',nous:'nous',vous:'vous'}[P.baseSubject(subject)];
        if(!imperativePronoun) return form;
        return form+'-'+imperativePronoun;
      }
      form=P.apply(subject,form);
    }
    return form;
  }

function lookupCompoundSubjects(tense){
  if(tense==='subjonctif passé'){
    return [
      'que je (masculin singulier)','que je (féminin singulier)','que tu (masculin singulier)','que tu (féminin singulier)',"qu'il","qu'elle","qu'on (masculin singulier)","qu'on (masculin pluriel)","qu'on (féminin pluriel)",'que nous (masculin pluriel)','que nous (féminin pluriel)','que vous (masculin singulier)','que vous (féminin singulier)','que vous (masculin pluriel)','que vous (féminin pluriel)',"qu'ils","qu'elles"
    ];
  }
  return [
    'je (masculin singulier)','je (féminin singulier)','tu (masculin singulier)','tu (féminin singulier)','il','elle','on (masculin singulier)','on (masculin pluriel)','on (féminin pluriel)','nous (masculin pluriel)','nous (féminin pluriel)','vous (masculin singulier)','vous (féminin singulier)','vous (masculin pluriel)','vous (féminin pluriel)','ils','elles'
  ];
}

function rowsForLookup(verb,tense){
  const r=record(verb); if(!r)return [];
  const isCompound=C&&C.isCompound(tense);
  if(!isCompound)return rowsFor(verb,tense);
  const construction=r.pronominal?'pronominale':(r.construction||'non-pronominale');
  const out=[];
  lookupCompoundSubjects(tense).forEach(subject=>{
    const generated=conjugate(verb,tense,subject,construction);
    if(generated!=null)out.push([subject,generated]);
  });
  return out;
}

function rowsFor(verb,tense){
  const r=record(verb); if(!r)return [];
  let source=(r.formes||{})[tense]||[];
  const isSimple=simpleTenses.has(tense);
  const isCompound=C&&C.isCompound(tense);
  if(!isSimple&&!isCompound)return source.map(x=>[x[0],x[1]]);
  const construction=r.pronominal?'pronominale':(r.construction||'non-pronominale');
  const out=[];
  if(isSimple&&!source.length){
    if(tense==='impératif présent')source=[['tu',''],['nous',''],['vous','']];
    else if(tense==='subjonctif présent')source=[['que je',''],['que tu','',[...[]]],["qu'il/elle/on",''],['que nous',''],['que vous',''],["qu'ils/elles",'']];
    else source=[['je',''],['tu',''],['il/elle/on',''],['nous',''],['vous',''],['ils/elles','']];
  }
  if(isCompound&&tense==='subjonctif passé'){
    lookupCompoundSubjects(tense).forEach(subject=>{
      const generated=conjugate(verb,tense,subject,construction);
      if(generated!=null)out.push([subject,generated]);
    });
    if(out.length)return out;
  }
  const canonical=['je','tu','il/elle/on','nous','vous','ils/elles'];
  if(!source.length)source=canonical.map(s=>[s,'']);
  source.forEach(row=>{
    const subject=row[0].split('/').map(x=>x.trim()).filter(Boolean)[0];
    const generated=conjugate(verb,tense,subject,construction);
    if(generated!=null)out.push([row[0],generated]);
  });
  return out;
}

function rowsForConstruction(verb,tense,construction){
  const r=record(verb); if(!r)return [];
  const source=(r.formes||{})[tense]||[];
  const isSimple=simpleTenses.has(tense),isCompound=C&&C.isCompound(tense);
  if(!isSimple&&!isCompound)return source.map(x=>[x[0],x[1]]);
  const out=[];
  source.forEach(row=>{
    const subject=row[0].split('/').map(x=>x.trim()).filter(Boolean)[0];
    const generated=conjugate(verb,tense,subject,construction);
    if(generated!=null)out.push([row[0],generated]);
  });
  return out;
}

  function canGenerate(verb,tense){
    const r=record(verb); if(!r)return false;
    if(C&&C.isCompound(tense))return!!r.auxiliaire;
    return simpleTenses.has(tense);
  }

  window.COQ_CONJ_ENGINE={
    conjugate,
    rowsFor,
    rowsForLookup,
    rowsForConstruction,
    canGenerate
  };
})();
