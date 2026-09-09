/* COQ — Motor de conjugación.
 * Responsabilidad exclusiva: resolver y generar formas; la UI decide cómo presentarlas.
 */
(function(){
  const P=window.COQ_CONJ_PRONOUNS,C=window.COQ_CONJ_COMPOUND,A=window.COQ_CONJ_AGREEMENT,R=window.COQ_PATTERN_REGISTRY,resolver=window.COQ_PATTERN_RESOLVER,verbs=window.COQ_VERB_REGISTRY||{};
  const LOOKUP_COMPOUND_SUBJECTS=['je','tu','il/elle/on','nous','vous','ils/elles'];
  const PRACTICE_SUBJECTS=['je','tu','il','elle','on','nous','vous','ils','elles'];
  const SUBJONCTIF_PRACTICE_SUBJECTS=['que je','que tu',"qu'il","qu'elle","qu'on",'que nous','que vous',"qu'ils","qu'elles"];
  const SIMPLE_FALLBACK_SUBJECTS=['je','tu','il/elle/on','nous','vous','ils/elles'];
  const SUBJONCTIF_SIMPLE_FALLBACK_SUBJECTS=['que je','que tu',"qu'il/elle/on",'que nous','que vous',"qu'ils/elles"];
  const SUBJONCTIF_CONSTRUCTION_FALLBACK_SUBJECTS=['que je','que tu',"qu'il",'que nous','que vous',"qu'ils"];
  const IMPERATIVE_SUBJECTS=['tu','nous','vous'];
  function baseKey(verb){const v=verbs[verb];if(v&&v.verbeBase&&verbs[v.verbeBase])return v.verbeBase;if(resolver&&typeof resolver.baseVerb==='function')return resolver.baseVerb(verb);return verb;}
  function record(verb){return verbs[verb]||(resolver&&typeof resolver.resolveRecord==='function'?resolver.resolveRecord(verb):null);}
  function subjectInfo(subject){const label=String(subject||'').trim(),base=P.baseSubject(label),match=label.match(/\(([^)]+)\)/);let gender='masculin',number='singulier';if(match){const details=match[1].toLowerCase();if(details.includes('féminin'))gender='féminin';if(details.includes('pluriel'))number='pluriel';}else if(base==='elle'){gender='féminin';}else if(base==='ils'){gender='masculin';number='pluriel';}else if(base==='elles'){gender='féminin';number='pluriel';}else if(base==='nous'||base==='vous'){number='pluriel';}return {label,base,gender,number};}
  function generatedSimple(verb,tense,subject){const r=record(verb);if(!r||!R||typeof R.generate!=='function')return null;return R.generate(r.pattern,r.infinitif_base||r.infinitif,P.baseSubject(subject),tense);}
  function explicitForm(verb,tense,subject){const rows=(record(verb)?.formes||{})[tense]||[];const exact=rows.find(r=>r[0]===subject);if(exact)return exact[1];const base=P.baseSubject(subject);const grouped=rows.find(r=>String(r[0]).split('/').map(x=>x.trim()).some(label=>P.baseSubject(label)===base));return grouped?grouped[1]:null;}
  function simpleForm(verb,tense,subject){const generated=generatedSimple(verb,tense,subject);if(generated!==null&&generated!==undefined&&String(generated)!=='')return generated;return explicitForm(verb,tense,subject);}
  function participle(verb){const r=record(baseKey(verb));return r&&r.participePasse?r.participePasse:null;}
  function applyAgreement(pp,info,base,isPronominal,auxiliary){
    if(!A)return pp;
    if(isPronominal){
      const rule=window.COQ_PRONOMINAL_RULES?.[base];
      if(rule?.accord==='sujet'&&typeof A.applySubjectAgreement==='function')return A.applySubjectAgreement(pp,{gender:info.gender,number:info.number});
      return typeof A.stripAgreementMarkers==='function'?A.stripAgreementMarkers(pp):pp;
    }
    if(auxiliary==='être'&&typeof A.applySubjectAgreement==='function')return A.applySubjectAgreement(pp,{gender:info.gender,number:info.number});
    return typeof A.stripAgreementMarkers==='function'?A.stripAgreementMarkers(pp):pp;
  }
  function compoundForm(verb,tense,subject,construction){if(!C||!C.isCompound(tense))return null;const r=record(verb);if(!r)return null;const base=baseKey(verb),info=subjectInfo(subject),isPronominal=construction==='pronomiale'||r.pronominal===true||r.construction==='pronomiale',auxiliary=isPronominal?'être':r.auxiliaire;if(!auxiliary)return null;const auxTense=C.auxiliaryTense(tense),auxForm=simpleForm(auxiliary,auxTense,info.base);if(!auxForm)return null;const pp=participle(base);if(!pp)return null;const agreed=applyAgreement(pp,info,base,isPronominal,auxiliary);if(isPronominal){const pron=P.pronounFor(info.base);if(!pron)return null;const contracted=P.contractPronoun(pron,auxForm);return contracted+(contracted.endsWith("'")?'':' ')+auxForm+' '+agreed;}return auxForm+' '+agreed;}
  function conjugate(verb,tense,subject,construction){const r=record(verb);if(!r)return null;const isPronominal=construction==='pronomiale'||r.pronominal===true||(r.construction==='pronomiale'&&construction!=='non-pronomiale');if(C&&C.isCompound(tense))return compoundForm(verb,tense,subject,isPronominal?'pronomiale':'non-pronomiale');let form=simpleForm(baseKey(verb),tense,subject);if(form==null)return null;if(isPronominal){if(tense==='impératif présent'){const imperativePronoun={tu:'toi',nous:'nous',vous:'vous'}[P.baseSubject(subject)];if(!imperativePronoun)return form;return form+'-'+imperativePronoun;}form=P.apply(subject,form);}return form;}
  function practiceCompoundSubjects(tense){return tense==='subjonctif passé'?SUBJONCTIF_PRACTICE_SUBJECTS:PRACTICE_SUBJECTS;}
  function rowsForLookup(verb,tense){const r=record(verb);if(!r)return [];if(!(C&&C.isCompound(tense)))return rowsFor(verb,tense);const construction=r.pronominal?'pronomiale':(r.construction||'non-pronomiale');return LOOKUP_COMPOUND_SUBJECTS.map(subject=>[subject,conjugate(verb,tense,P.baseSubject(subject),construction)]).filter(row=>row[1]!=null);}
  function rowsFor(verb,tense){const r=record(verb);if(!r)return [];const source=(r.formes||{})[tense]||[],isSimple=C?.isSimple?.(tense),isCompound=C?.isCompound?.(tense);if(!isSimple&&!isCompound)return source.map(x=>[x[0],x[1]]);const construction=r.pronominal?'pronomiale':(r.construction||'non-pronomiale');if(isCompound)return practiceCompoundSubjects(tense).map(subject=>[subject,conjugate(verb,tense,subject,construction)]).filter(row=>row[1]!=null);const fallback=tense==='impératif présent'?IMPERATIVE_SUBJECTS:tense==='subjonctif présent'?SUBJONCTIF_SIMPLE_FALLBACK_SUBJECTS:SIMPLE_FALLBACK_SUBJECTS,rows=source.length?source:fallback.map(subject=>[subject,'']);return rows.map(row=>{const subject=String(row[0]).split('/').map(x=>x.trim()).filter(Boolean)[0],generated=conjugate(verb,tense,subject,construction);return generated!=null?[row[0],generated]:null;}).filter(Boolean);}
  function rowsForConstruction(verb,tense,construction){const r=record(verb);if(!r)return [];if(C?.isCompound?.(tense))return practiceCompoundSubjects(tense).map(subject=>[subject,conjugate(verb,tense,subject,construction)]).filter(row=>row[1]!=null);const source=(r.formes||{})[tense]||[];if(!C?.isSimple?.(tense))return source.map(x=>[x[0],x[1]]);const fallback=tense==='impératif présent'?IMPERATIVE_SUBJECTS:tense==='subjonctif présent'?SUBJONCTIF_CONSTRUCTION_FALLBACK_SUBJECTS:['je','tu','il','elle','on','nous','vous','ils','elles'],rows=source.length?source:fallback.map(subject=>[subject,'']);return rows.map(row=>{const subject=String(row[0]).split('/').map(x=>x.trim()).filter(Boolean)[0],generated=conjugate(verb,tense,subject,construction);return generated!=null?[row[0],generated]:null;}).filter(Boolean);}
  function canGenerate(verb,tense){const r=record(verb);if(!r)return false;if(C?.isCompound?.(tense))return !!(r.auxiliaire||r.pronominal||r.construction==='pronomiale');return !!C?.isSimple?.(tense)&&!!R&&typeof R.generate==='function';}
  window.COQ_CONJ_ENGINE={conjugate,rowsFor,rowsForLookup,rowsForConstruction,canGenerate,subjectInfo};
})();
