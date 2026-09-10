/* COQ — Motor de conjugación.
 * Responsabilidad exclusiva: resolver y generar formas; la UI decide cómo presentarlas.
 */
(function(){
  const P=window.COQ_CONJ_PRONOUNS,C=window.COQ_CONJ_COMPOUND,A=window.COQ_CONJ_AGREEMENT,R=window.COQ_PATTERN_REGISTRY,resolver=window.COQ_PATTERN_RESOLVER,dataModel=window.COQ_CONJ_DATA_MODEL,verbs=window.COQ_VERB_REGISTRY||{};
  const LOOKUP_COMPOUND_SUBJECTS=['je','tu','il/elle/on','nous','vous','ils/elles'];
  const PRACTICE_SUBJECTS=['je','tu','il','elle','on','nous','vous','ils','elles'];
  const SUBJONCTIF_PRACTICE_SUBJECTS=['que je','que tu',"qu'il","qu'elle","qu'on",'que nous','que vous',"qu'ils","qu'elles"];
  const SIMPLE_FALLBACK_SUBJECTS=['je','tu','il/elle/on','nous','vous','ils/elles'];
  const SUBJONCTIF_SIMPLE_FALLBACK_SUBJECTS=['que je','que tu',"qu'il/elle/on",'que nous','que vous',"qu'ils/elles"];
  const SUBJONCTIF_CONSTRUCTION_FALLBACK_SUBJECTS=['que je','que tu',"qu'il",'que nous','que vous',"qu'ils"];
  const IMPERATIVE_SUBJECTS=['tu','nous','vous'];
  function canonicalRecord(verb){return dataModel&&typeof dataModel.get==='function'?dataModel.get(verb):null;}
  function baseKey(verb){const canonical=canonicalRecord(verb);if(canonical&&canonical.baseVerbId)return canonical.baseVerbId;const v=verbs[verb];if(v&&v.verbeBase&&verbs[v.verbeBase])return v.verbeBase;if(resolver&&typeof resolver.baseVerb==='function')return resolver.baseVerb(verb);return verb;}
  function record(verb){return canonicalRecord(verb)||(verbs[verb]||(resolver&&typeof resolver.resolveRecord==='function'?resolver.resolveRecord(verb):null));}
  function generatedSimple(verb,tense,subject){const r=record(verb);if(!r||!R||typeof R.generate!=='function')return null;const pattern=r.patternId||r.pattern;const infinitif=r.infinitifBase||r.infinitif_base||r.infinitif;return R.generate(pattern,infinitif,P.baseSubject(subject),tense,r);}
  function explicitForm(verb,tense,subject){const r=record(verb);const rows=(r?.legacyFormes||r?.formes||{})[tense]||[];const exact=rows.find(r=>r[0]===subject);if(exact)return exact[1];const base=P.baseSubject(subject);const grouped=rows.find(r=>String(r[0]).split('/').map(x=>x.trim()).some(label=>P.baseSubject(label)===base));return grouped?grouped[1]:null;}
  function simpleForm(verb,tense,subject){const generated=generatedSimple(verb,tense,subject);if(generated!==null&&generated!==undefined&&String(generated)!=='')return generated;return explicitForm(verb,tense,subject);}
  function participle(verb){const r=record(baseKey(verb));return r&&r.participePasse?r.participePasse:null;}
  function applyAgreement(pp,info,base,isPronominal,auxiliary,recordData){
    if(!A)return pp;
    if(isPronominal){
      const ruleBase=base||recordData?.baseVerbId||recordData?.legacyVerbeBase||recordData?.infinitifBase;
      const rule=window.COQ_PRONOMINAL_RULES?.[ruleBase];
      if(rule?.accord==='sujet'&&typeof A.applySubjectAgreement==='function')return A.applySubjectAgreement(pp,{gender:info.gender,number:info.number});
      return typeof A.stripAgreementMarkers==='function'?A.stripAgreementMarkers(pp):pp;
    }
    if(auxiliary==='être'&&typeof A.applySubjectAgreement==='function')return A.applySubjectAgreement(pp,{gender:info.gender,number:info.number});
    return typeof A.stripAgreementMarkers==='function'?A.stripAgreementMarkers(pp):pp;
  }
  function compoundForm(verb,tense,subject,construction){if(!C||!C.isCompound(tense))return null;const r=record(verb);if(!r)return null;const base=baseKey(verb),info=P.subjectInfo(subject),isPronominal=construction==='pronominale'||r.pronominal===true||r.construction==='pronominale',auxiliary=isPronominal?'être':r.auxiliaire;if(!auxiliary)return null;const auxTense=C.auxiliaryTense(tense),auxForm=simpleForm(auxiliary,auxTense,info.base);if(!auxForm)return null;const pp=participle(base);if(!pp)return null;const agreed=applyAgreement(pp,info,base,isPronominal,auxiliary,r);if(isPronominal){const pron=P.pronounFor(info.base);if(!pron)return null;const contracted=P.contractPronoun(pron,auxForm);return contracted+(contracted.endsWith("'")?'':' ')+auxForm+' '+agreed;}return auxForm+' '+agreed;}
  function conjugate(verb,tense,subject,construction){const r=record(verb);if(!r)return null;const isPronominal=construction==='pronominale'||r.pronominal===true||(r.construction==='pronominale'&&construction!=='non-pronominale');if(C&&C.isCompound(tense))return compoundForm(verb,tense,subject,isPronominal?'pronominale':'non-pronominale');let form=simpleForm(baseKey(verb),tense,subject);if(form==null)return null;if(isPronominal){if(tense==='impératif présent'){const imperativePronoun=P.imperativePronounFor?.(subject);if(!imperativePronoun)return form;return form+'-'+imperativePronoun;}form=P.apply(subject,form);}return form;}
  function practiceCompoundSubjects(tense){return tense==='subjonctif passé'?SUBJONCTIF_PRACTICE_SUBJECTS:PRACTICE_SUBJECTS;}
  function rowsForLookup(verb,tense){const r=record(verb);if(!r)return [];if(!(C&&C.isCompound(tense)))return rowsFor(verb,tense);const construction=r.pronominal?'pronominale':(r.construction||'non-pronominale');return LOOKUP_COMPOUND_SUBJECTS.map(subject=>[subject,conjugate(verb,tense,P.baseSubject(subject),construction)]).filter(row=>row[1]!=null);}
  function rowsFor(verb,tense){const r=record(verb);if(!r)return [];const source=(r.legacyFormes||r.formes||{})[tense]||[],isSimple=C?.isSimple?.(tense),isCompound=C?.isCompound?.(tense);if(!isSimple&&!isCompound)return source.map(x=>[x[0],x[1]]);const construction=r.pronominal?'pronominale':(r.construction||'non-pronominale');if(isCompound)return practiceCompoundSubjects(tense).map(subject=>[subject,conjugate(verb,tense,subject,construction)]).filter(row=>row[1]!=null);const fallback=tense==='impératif présent'?IMPERATIVE_SUBJECTS:tense==='subjonctif présent'?SUBJONCTIF_SIMPLE_FALLBACK_SUBJECTS:SIMPLE_FALLBACK_SUBJECTS,rows=source.length?source:fallback.map(subject=>[subject,'']);return rows.map(row=>{const subject=String(row[0]).split('/').map(x=>x.trim()).filter(Boolean)[0],generated=conjugate(verb,tense,subject,construction);return generated!=null?[row[0],generated]:null;}).filter(Boolean);}
  function rowsForConstruction(verb,tense,construction){const r=record(verb);if(!r)return [];if(C?.isCompound?.(tense))return practiceCompoundSubjects(tense).map(subject=>[subject,conjugate(verb,tense,subject,construction)]).filter(row=>row[1]!=null);const source=(r.legacyFormes||r.formes||{})[tense]||[];if(!C?.isSimple?.(tense))return source.map(x=>[x[0],x[1]]);const fallback=tense==='impératif présent'?IMPERATIVE_SUBJECTS:tense==='subjonctif présent'?SUBJONCTIF_CONSTRUCTION_FALLBACK_SUBJECTS:['je','tu','il','elle','on','nous','vous','ils','elles'],rows=source.length?source:fallback.map(subject=>[subject,'']);return rows.map(row=>{const subject=String(row[0]).split('/').map(x=>x.trim()).filter(Boolean)[0],generated=conjugate(verb,tense,subject,construction);return generated!=null?[row[0],generated]:null;}).filter(Boolean);}
  function canGenerate(verb,tense){const r=record(verb);if(!r)return false;if(C?.isCompound?.(tense))return !!(r.auxiliaire||r.pronominal||r.construction==='pronominale');return !!C?.isSimple?.(tense)&&!!R&&typeof R.generate==='function';}
  window.COQ_CONJ_ENGINE={conjugate,rowsFor,rowsForLookup,rowsForConstruction,canGenerate,subjectInfo:P.subjectInfo};
})();
