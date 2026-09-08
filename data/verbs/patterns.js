// COQ — catálogo y resolución de patrones de conjugación.
// Este módulo declara metadatos y resuelve el patrón aplicable a un infinitivo.
// La generación pertenece exclusivamente a COQ_PATTERN_REGISTRY + COQ_CONJ_ENGINE.
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
  function normalize(value){return String(value||'').trim().toLowerCase();}
  function isPronominal(verb){return normalize(verb).startsWith('se ');}
  function baseVerb(verb){
    const key=normalize(verb),record=verbs[key];
    if(record&&record.verbeBase&&verbs[normalize(record.verbeBase)])return normalize(record.verbeBase);
    if(isPronominal(key))return key.slice(3).trim();
    return key;
  }
  function resolvePattern(verb){
    const key=normalize(verb);
    const base=baseVerb(key);
    const record=verbs[key]||verbs[base];
    if(record&&record.pattern&&patterns[record.pattern])return record.pattern;
    if(/ger$/.test(base))return'er-ger';
    if(/cer$/.test(base))return'er-cer';
    if(/yer$/.test(base))return'yer';
    if(/eler$/.test(base))return'er-eler';
    if(/eter$/.test(base))return'er-eter';
    if(/er$/.test(base))return'regular-er';
    return null;
  }
  function inferParticiple(verb,pattern){
    const base=baseVerb(verb);
    if(pattern==='regular-er'||pattern==='er-ger'||pattern==='er-cer'||pattern==='er-eler'||pattern==='er-eter'||pattern==='yer'||pattern==='er-e-accent')return base.replace(/er$/,'é');
    return null;
  }
  function inferredRecord(key,base,pattern,baseRecord){
    const meta=patterns[pattern];
    if(!meta)return null;
    const isPro=isPronominal(key);
    return {
      id:key,
      infinitif:key,
      infinitif_base:base,
      groupe:baseRecord?.groupe??meta.groupe,
      pattern,
      auxiliaire:isPro?'être':'avoir',
      pronominal:isPro,
      construction:isPro?'pronominale':'non-pronominale',
      verbeBase:base,
      participePasse:baseRecord?.participePasse||inferParticiple(base,pattern),
      formePronominale:isPro?key:null,
      _inferred:true,
      ...(isPro&&baseRecord?{_derivedFrom:base}:{} )
    };
  }
  function resolveRecord(verb){
    const key=normalize(verb),base=baseVerb(key),known=verbs[key];
    if(known)return known;
    const pattern=resolvePattern(key);
    if(isPronominal(key)){
      const baseRecord=verbs[base];
      if(pattern)return inferredRecord(key,base,pattern,baseRecord||null);
      return null;
    }
    if(!pattern||!patterns[pattern])return null;
    return inferredRecord(key,base,pattern,null);
  }
  function applyToDatabase(){
    Object.keys(verbs).forEach(function(key){
      const record=verbs[key];
      if(!record)return;
      const pattern=resolvePattern(key);
      if(pattern)record.pattern=pattern;
    });
  }
  function installResolverViews(){
    const U=window.COQ_CONJ_UTILS;
    if(!U||U.__coqResolverViewsInstalled)return;
    const resolve=function(target,key){
      if(typeof key!=='string')return target[key];
      if(Object.prototype.hasOwnProperty.call(target,key))return target[key];
      return resolveRecord(key)||undefined;
    };
    U.conjugations=new Proxy(U.conjugations,{get:resolve});
    U.verbMeta=new Proxy(U.verbMeta,{get:resolve});
    U.__coqResolverViewsInstalled=true;
  }
  window.COQ_PATTERN_RESOLVER={normalize,baseVerb,resolvePattern,resolveRecord,applyToDatabase};
  applyToDatabase();
  installResolverViews();
})();
