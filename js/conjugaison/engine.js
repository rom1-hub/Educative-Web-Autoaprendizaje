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
    const pres=pattern==='regular-ir'?presentRegularIr(inf,'nous'):pattern==='regular-re'?presentRegularRe(inf,'nous'):presentRegularEr(inf,'nous');
    const stem=pres.replace(/ons$/,'');
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
  function generateBaseSimple(verb,tense,subject){
    const r=record(verb); if(!r) return null;
    const s=P.baseSubject(subject);
    const pattern=r.pattern;
    const inf=r.infinitif_base||r.infinitif;
    if(pattern==='er-e-accent'){
      if(tense==="présent de l'indicatif") return presentErEAccent(inf,s);
      if(tense==='imparfait') return imparfaitFromPresent(inf,s,pattern);
      if(tense==='futur simple') return futureErEAccent(inf,s);
      if(tense==='conditionnel présent') return conditionalErEAccent(inf,s);
      if(tense==='subjonctif présent') return subjErEAccent(inf,s);
      if(tense==='impératif présent') return s==='tu'?presentErEAccent(inf,s).replace(/s$/,''):presentErEAccent(inf,s);
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
      if(tense==='impératif présent') return s==='tu'?presentRegularIr(inf,s):presentRegularIr(inf,s);
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
    const grouped=rows.find(r=>r[0].split('/').map(x=>x.trim()).includes(base));
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
    else if(base==='on'){ number='singulier'; }
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
    if(isPronominal) form=P.apply(subject,form);
    return form;
  }
  function rowsFor(verb,tense){
    const r=record(verb); if(!r)return [];
    let source=(r.formes||{})[tense]||[];
    const isSimple=simpleTenses.has(tense), isCompound=C&&C.isCompound(tense);
    if(!isSimple && !isCompound) return source.map(x=>[x[0],x[1]]);
    const construction=r.pronominal?'pronominale':(r.construction||'non-pronominale');
    const out=[];
    if(isCompound){
      const canonical=tense==='subjonctif passé' ? ['que je','que tu',"qu'il/elle/on",'que nous','que vous',"qu'ils/elles"] : ['je','tu','il/elle/on','nous','vous','ils/elles'];
      if(!source.length) source=canonical.map(s=>[s,'']);
      source.forEach(row=>{
        const subject=row[0].split('/').map(x=>x.trim()).filter(Boolean)[0];
        const generated=conjugate(verb,tense,subject,construction);
        if(generated!=null) out.push([row[0],generated]);
      });
      if(out.length)return out;
    }
    return source.map(row=>{
      const subjectsIn=row[0].split('/').map(x=>x.trim()).filter(Boolean);
      const subject=subjectsIn[0];
      const generated=conjugate(verb,tense,subject,construction);
      return [row[0],generated==null?row[1]:generated];
    });
  }
  function rowsForConstruction(verb,tense,construction){
    const r=record(verb); if(!r)return [];
    const source=(r.formes||{})[tense]||[];
    const isSimple=simpleTenses.has(tense), isCompound=C&&C.isCompound(tense);
    if(!isSimple && !isCompound)return source.map(x=>[x[0],x[1]]);
    const out=[];
    source.forEach(row=>{
      row[0].split('/').map(x=>x.trim()).filter(Boolean).forEach(subject=>{
        const generated=conjugate(verb,tense,subject,construction);
        if(generated!=null) out.push([subject,generated]);
      });
    });
    return out;
  }
  function canGenerate(verb,tense){
    return !!record(verb)&&simpleTenses.has(tense)&&(!!generateBaseSimple(baseKey(verb),tense,'je') || !!explicitForm(verb,tense,'je'));
  }
  window.COQ_CONJ_ENGINE={conjugate,rowsFor,rowsForConstruction,canGenerate,baseKey,subjects,simpleTenses,compoundTenses:C?C.compoundTenses:[]};
})();
