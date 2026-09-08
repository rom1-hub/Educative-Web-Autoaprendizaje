// COQ — catálogo y resolución de patrones de conjugación.
// Los verbos y sus familias se declaran en COQ_VERBS + family-catalog.
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
  "e-accent":{groupe:1,description:"Premier groupe avec alternance E/È"},
  "avoir":{groupe:3,description:"Verbe irrégulier avoir"},
  "être":{groupe:3,description:"Verbe irrégulier être"},
  "aller-type":{groupe:3,description:"Verbe irrégulier aller"},
  "prendre":{groupe:3,description:"Famille prendre"},
  "faire":{groupe:3,description:"Verbe irrégulier faire"},
  "partir-type":{groupe:3,description:"Famille partir"},
  "suivre-type":{groupe:3,description:"Famille suivre"},
  "ouvrir-type":{groupe:3,description:"Famille ouvrir"},
  "venir-type":{groupe:3,description:"Famille venir"},
  "tenir-type":{groupe:3,description:"Famille tenir"},
  "mettre-type":{groupe:3,description:"Famille mettre"},
  "lire-type":{groupe:3,description:"Famille lire"},
  "rire-type":{groupe:3,description:"Famille rire"},
  "vivre-type":{groupe:3,description:"Famille vivre"},
  "conduire-type":{groupe:3,description:"Famille en -UIRE"},
  "courir-type":{groupe:3,description:"Famille courir"},
  "mourir-type":{groupe:3,description:"Verbe mourir"},
  "croire-type":{groupe:3,description:"Famille croire"},
  "recevoir-type":{groupe:3,description:"Famille recevoir"},
  "connaître-type":{groupe:3,description:"Famille connaître"},
  "paraître-type":{groupe:3,description:"Famille paraître"}
};

(function(){
  const verbs=window.COQ_VERBS||{};
  const patterns=window.COQ_VERB_PATTERNS;
  function normalize(value){return String(value||'').trim().toLowerCase();}
  function isPronominal(verb){return normalize(verb).startsWith('se ');}
  function baseVerb(verb){const key=normalize(verb),record=verbs[key];if(record&&record.verbeBase&&verbs[normalize(record.verbeBase)])return normalize(record.verbeBase);if(isPronominal(key))return key.slice(3).trim();return key;}
  function resolvePattern(verb){const key=normalize(verb),base=baseVerb(key),record=verbs[key]||verbs[base];if(record&&record.pattern&&(patterns[record.pattern]||window.COQ_PATTERN_REGISTRY?.get?.(record.pattern)))return record.pattern;if(/ger$/.test(base))return'er-ger';if(/cer$/.test(base))return'er-cer';if(/yer$/.test(base))return'yer';if(/eler$/.test(base))return'er-eler';if(/eter$/.test(base))return'er-eter';if(/er$/.test(base))return'regular-er';return null;}
  function inferParticiple(verb,pattern){const base=baseVerb(verb);if(['regular-er','er-ger','er-cer','er-eler','er-eter','yer','er-e-accent','e-accent'].includes(pattern))return base.replace(/er$/,'é');const known={
    'partir-type':{partir:'parti',sortir:'sorti',dormir:'dormi',servir:'servi'},
    'suivre-type':{suivre:'suivi'},
    'ouvrir-type':{ouvrir:'ouvert',rouvrir:'rouvert',couvrir:'couvert',découvrir:'découvert',recouvrir:'recouvert',offrir:'offert',souffrir:'souffert'},
    'venir-type':{venir:'venu',revenir:'revenu',devenir:'devenu',parvenir:'parvenu',intervenir:'intervenu',convenir:'convenu',provenir:'provenu',survenir:'survenu',prévenir:'prévenu'},
    'tenir-type':{tenir:'tenu',retenir:'retenu',soutenir:'soutenu',obtenir:'obtenu',maintenir:'maintenu',contenir:'contenu',détenir:'détenu',appartenir:'appartenu'},
    'mettre-type':{mettre:'mis',remettre:'remis',permettre:'permis',promettre:'promis',admettre:'admis',transmettre:'transmis',soumettre:'soumis'},
    'lire-type':{lire:'lu',relire:'relu'},
    'rire-type':{rire:'ri',sourire:'souri'},
    'vivre-type':{vivre:'vécu',revivre:'revécu',survivre:'survécu'},
    'conduire-type':{conduire:'conduit',traduire:'traduit',produire:'produit',construire:'construit',détruire:'détruit',réduire:'réduit',cuire:'cuit'},
    'courir-type':{courir:'couru',accourir:'accouru',recourir:'recouru'},
    'mourir-type':{mourir:'mort'},
    'croire-type':{croire:'cru'},
    'recevoir-type':{recevoir:'reçu'},
    'connaître-type':{connaître:'connu',reconnaître:'reconnu',méconnaître:'méconnu'},
    'paraître-type':{paraître:'paru',apparaître:'apparu',disparaître:'disparu',reparaître:'reparu',transparaître:'transparu',comparaître:'comparu'}
  };return known[pattern]?.[base]||null;}
  function inferredRecord(key,base,pattern,baseRecord){const meta=patterns[pattern]||window.COQ_PATTERN_REGISTRY?.get?.(pattern);if(!meta)return null;const familyAux={'partir-type':{partir:'être',sortir:'être',dormir:'avoir',servir:'avoir'},'venir-type':{venir:'être',revenir:'être',devenir:'être',parvenir:'être',intervenir:'être',convenir:'être',provenir:'être',survenir:'être',prévenir:'avoir'},'mourir-type':{mourir:'être'}};const auxiliary=familyAux[pattern]?.[base]||'avoir';return {id:key,infinitif:key,infinitif_base:base,groupe:baseRecord?.groupe??meta.groupe,pattern,auxiliaire:isPronominal(key)?'être':auxiliary,pronominal:isPronominal(key),construction:isPronominal(key)?'pronominale':'non-pronominale',verbeBase:base,participePasse:baseRecord?.participePasse||inferParticiple(base,pattern),formePronominale:isPronominal(key)?key:null,_inferred:true,...(isPronominal(key)&&baseRecord?{_derivedFrom:base}:{})};}
  function resolveRecord(verb){const key=normalize(verb),base=baseVerb(key),known=verbs[key];if(known)return known;const pattern=resolvePattern(key);if(isPronominal(key)){const baseRecord=verbs[base];if(pattern)return inferredRecord(key,base,pattern,baseRecord||null);return null;}if(!pattern||!patterns[pattern]&&!window.COQ_PATTERN_REGISTRY?.get?.(pattern))return null;return inferredRecord(key,base,pattern,null);}
  function applyToDatabase(){Object.keys(verbs).forEach(function(key){const record=verbs[key];if(!record)return;const pattern=resolvePattern(key);if(pattern)record.pattern=pattern;});}
  function installResolverViews(U){U=U||window.COQ_CONJ_UTILS;if(!U||U.__coqResolverViewsInstalled)return;const resolve=function(target,key){if(typeof key!=='string')return target[key];if(Object.prototype.hasOwnProperty.call(target,key))return target[key];return resolveRecord(key)||undefined;};U.conjugations=new Proxy(U.conjugations,{get:resolve});U.verbMeta=new Proxy(U.verbMeta,{get:resolve});U.__coqResolverViewsInstalled=true;}
  window.COQ_PATTERN_RESOLVER={normalize,baseVerb,resolvePattern,resolveRecord,applyToDatabase,installResolverViews};
  applyToDatabase();
  installResolverViews();
})();
