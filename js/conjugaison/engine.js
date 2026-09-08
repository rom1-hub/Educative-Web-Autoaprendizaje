/* COQ — Motor de conjugación.
 *
 * Responsabilidad exclusiva:
 * - resolver el verbo;
 * - generar formas simples mediante el registro de patrones;
 * - construir tiempos compuestos a partir de COQ_CONJ_COMPOUND;
 * - aplicar concordancia y pronombres cuando corresponde.
 *
 * No contiene listas duplicadas de tiempos ni lógica de presentación.
 */
(function(){
  const P=window.COQ_CONJ_PRONOUNS;
  const C=window.COQ_CONJ_COMPOUND;
  const A=window.COQ_CONJ_AGREEMENT;
  const R=window.COQ_PATTERN_REGISTRY;
  const resolver=window.COQ_PATTERN_RESOLVER;
  const verbs=window.COQ_VERB_REGISTRY||window.COQ_VERBS||{};

  function baseKey(verb){
    const v=verbs[verb];
    if(v&&v.verbeBase&&verbs[v.verbeBase])return v.verbeBase;
    if(resolver&&typeof resolver.baseVerb==='function')return resolver.baseVerb(verb);
    return verb;
  }
  function record(verb){
    return verbs[verb]||(resolver&&typeof resolver.resolveRecord==='function'?resolver.resolveRecord(verb):null);
  }
  function subjectInfo(subject){
    const label=String(subject||'').trim();
    const base=P.baseSubject(label);
    const match=label.match(/\(([^)]+)\)/);
    let gender='masculin',number='singulier';
    if(match){const details=match[1].toLowerCase();if(details.includes('féminin'))gender='féminin';if(details.includes('pluriel'))number='pluriel';}
    else if(base==='elle'){gender='féminin';}
    else if(base==='ils'){gender='masculin';number='pluriel';}
    else if(base==='elles'){gender='féminin';number='pluriel';}
    else if(base==='nous'||base==='vous'){number='pluriel';}
    return {label,base,gender,number};
  }
  function generatedSimple(verb,tense,subject){const r=record(verb);if(!r||!R||typeof R.generate!=='function')return null;return R.generate(r.pattern,r.infinitif_base||r.infinitif,P.baseSubject(subject),tense);}
  function explicitForm(verb,tense,subject){const rows=(record(verb)?.formes||{})[tense]||[];const exact=rows.find(r=>r[0]===subject);if(exact)return exact[1];const base=P.baseSubject(subject);const grouped=rows.find(r=>String(r[0]).split('/').map(x=>x.trim()).some(label=>P.baseSubject(label)===base));return grouped?grouped[1]:null;}
  function simpleForm(verb,tense,subject){const explicit=explicitForm(verb,tense,subject);if(explicit!==null&&explicit!==undefined&&String(explicit)!=='')return explicit;return generatedSimple(verb,tense,subject);}
  function participle(verb){const r=record(baseKey(verb));return r&&r.participePasse?r.participePasse:null;}
  function compoundForm(verb,tense,subject,construction){
    if(!C||!C.isCompound(tense))return null;
    const r=record(verb);if(!r)return null;
    const base=baseKey(verb),info=subjectInfo(subject);
    const isPronominal=construction==='pronominale'||r.pronominal===true||r.construction==='pronominale';
    const auxiliary=isPronominal?'être':r.auxiliaire;if(!auxiliary)return null;
    const auxTense=C.auxiliaryTense(tense),auxForm=simpleForm(auxiliary,auxTense,info.base);if(!auxForm)return null;
    const pp=participle(base);if(!pp)return null;
    const agreed=A?A.agree(pp,{gender:info.gender,number:info.number},{type:isPronominal?'pronominale':'non-pronominale',baseVerb:base,auxiliaire:auxiliary}):pp;
    if(isPronominal){
      const pron=P.pronounFor(info.base);if(!pron)return null;
      const contracted=P.contractPronoun(pron,auxForm);
      return contracted+(contracted.endsWith("'")?'':' ')+auxForm+' '+agreed;
    }
    return auxForm+' '+agreed;
  }
  function conjugate(verb,tense,subject,construction){
    const r=record(verb);if(!r)return null;
    const isPronominal=construction==='pronominale'||r.pronominal===true||(r.construction==='pronominale'&&construction!=='non-pronominale');
    if(C&&C.isCompound(tense))return compoundForm(verb,tense,subject,isPronominal?'pronominale':'non-pronominale');
    let form=simpleForm(baseKey(verb),tense,subject);if(form==null)form=explicitForm(verb,tense,subject);if(form==null)return null;
    if(isPronominal){
      if(tense==='impératif présent'){const imperativePronoun={tu:'toi',nous:'nous',vous:'vous'}[P.baseSubject(subject)];if(!imperativePronoun)return form;return form+'-'+imperativePronoun;}
      form=P.apply(subject,form);
    }
    return form;
  }
  function lookupCompoundSubjects(tense){
    if(tense==='subjonctif passé')return ['que je (masculin singulier)','que je (féminin singulier)','que tu (masculin singulier)','que tu (féminin singulier)',"qu'il","qu'elle","qu'on (masculin singulier)","qu'on (masculin pluriel)","qu'on (féminin pluriel)",'que nous (masculin pluriel)','que nous (féminin pluriel)','que vous (masculin singulier)','que vous (féminin singulier)','que vous (masculin pluriel)','que vous (féminin pluriel)',"qu'ils","qu'elles"];
    return ['je (masculin singulier)','je (féminin singulier)','tu (masculin singulier)','tu (féminin singulier)','il','elle','on (masculin singulier)','on (masculin pluriel)','on (féminin pluriel)','nous (masculin pluriel)','nous (féminin pluriel)','vous (masculin singulier)','vous (féminin singulier)','vous (masculin pluriel)','vous (féminin pluriel)','ils','elles'];
  }
  function rowsForLookup(verb,tense){const r=record(verb);if(!r)return [];if(!(C&&C.isCompound(tense)))return rowsFor(verb,tense);const construction=r.pronominal?'pronominale':(r.construction||'non-pronominale');return lookupCompoundSubjects(tense).map(subject=>[subject,conjugate(verb,tense,subject,construction)]).filter(row=>row[1]!=null);}
  function rowsFor(verb,tense){const r=record(verb);if(!r)return [];const source=(r.formes||{})[tense]||[];const isSimple=C?.isSimple?.(tense),isCompound=C?.isCompound?.(tense);if(!isSimple&&!isCompound)return source.map(x=>[x[0],x[1]]);const construction=r.pronominal?'pronominale':(r.construction||'non-pronominale');if(isCompound)return rowsForLookup(verb,tense);const fallback=tense==='impératif présent'?['tu','nous','vous']:tense==='subjonctif présent'?['que je','que tu',"qu'il/elle/on",'que nous','que vous',"qu'ils/elles"]:['je','tu','il/elle/on','nous','vous','ils/elles'];const rows=source.length?source:fallback.map(subject=>[subject,'']);return rows.map(row=>{const subject=String(row[0]).split('/').map(x=>x.trim()).filter(Boolean)[0];const generated=conjugate(verb,tense,subject,construction);return generated!=null?[row[0],generated]:null;}).filter(Boolean);}
  function rowsForConstruction(verb,tense,construction){const r=record(verb);if(!r)return [];if(C?.isCompound?.(tense))return lookupCompoundSubjects(tense).map(subject=>[subject,conjugate(verb,tense,subject,construction)]).filter(row=>row[1]!=null);const source=(r.formes||{})[tense]||[];if(!C?.isSimple?.(tense))return source.map(x=>[x[0],x[1]]);const fallback=tense==='impératif présent'?['tu','nous','vous']:tense==='subjonctif présent'?['que je','que tu',"qu'il",'que nous','que vous',"qu'ils"]:['je','tu','il','elle','on','nous','vous','ils','elles'];const rows=source.length?source:fallback.map(subject=>[subject,'']);return rows.map(row=>{const subject=String(row[0]).split('/').map(x=>x.trim()).filter(Boolean)[0];const generated=conjugate(verb,tense,subject,construction);return generated!=null?[row[0],generated]:null;}).filter(Boolean);}
  function canGenerate(verb,tense){const r=record(verb);if(!r)return false;if(C?.isCompound?.(tense))return !!(r.auxiliaire||r.pronominal||r.construction==='pronominale');return !!C?.isSimple?.(tense)&&!!R&&typeof R.generate==='function';}
  window.COQ_CONJ_ENGINE={conjugate,rowsFor,rowsForLookup,rowsForConstruction,canGenerate,subjectInfo};
})();
