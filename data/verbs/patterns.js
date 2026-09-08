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

  // Familles lexicales sûres: elles étaient auparavant enregistrées como
  // metadatos en módulos de familias. Se conservan aquí como catálogo de
  // resolución, sin reintroducir ningún parche de ejecución.
  const FAMILY_PATTERNS={
    'partir-type':['partir','sortir','dormir','servir'],
    'suivre-type':['suivre'],
    'ouvrir-type':['ouvrir','rouvrir','couvrir','découvrir','recouvrir','offrir','souffrir'],
    'venir-type':['venir','revenir','devenir','parvenir','intervenir','convenir','provenir','survenir','prévenir'],
    'tenir-type':['tenir','retenir','soutenir','obtenir','maintenir','contenir','détenir','appartenir'],
    'mettre-type':['mettre','remettre','permettre','promettre','admettre','transmettre','soumettre'],
    'lire-type':['lire','relire'],
    'rire-type':['rire','sourire'],
    'vivre-type':['vivre','revivre','survivre'],
    'conduire-type':['conduire','traduire','produire','construire','détruire','réduire','cuire'],
    'courir-type':['courir','accourir','recourir'],
    'mourir-type':['mourir'],
    'croire-type':['croire'],
    'recevoir-type':['recevoir'],
    'connaître-type':['connaître','reconnaître','méconnaître'],
    'paraître-type':['paraître','apparaître','disparaître','reparaître','transparaître','comparaître']
  };

  const FAMILY_BY_VERB={};
  Object.keys(FAMILY_PATTERNS).forEach(pattern=>FAMILY_PATTERNS[pattern].forEach(verb=>{FAMILY_BY_VERB[verb]=pattern;}));

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
    if(FAMILY_BY_VERB[base])return FAMILY_BY_VERB[base];
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
    const known={
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
    };
    return known[pattern]?.[base]||null;
  }

  function inferredRecord(key,base,pattern,baseRecord){
    const meta=patterns[pattern] || window.COQ_PATTERN_REGISTRY?.get?.(pattern);
    if(!meta)return null;
    const isPro=isPronominal(key);
    const familyAux={
      'partir-type':{partir:'être',sortir:'être',dormir:'avoir',servir:'avoir'},
      'venir-type':{venir:'être',revenir:'être',devenir:'être',parvenir:'être',intervenir:'être',convenir:'être',provenir:'être',survenir:'être',prévenir:'avoir'},
      'mourir-type':{mourir:'être'}
    };
    const auxiliary=familyAux[pattern]?.[base]||'avoir';
    return {
      id:key,
      infinitif:key,
      infinitif_base:base,
      groupe:baseRecord?.groupe??meta.groupe,
      pattern,
      auxiliaire:isPro?'être':auxiliary,
      pronominal:isPro,
      construction:isPro?'pronominale':'non-pronominale',
      verbeBase:base,
      participePasse:baseRecord?.participePasse||inferParticiple(base,pattern),
      formePronominale:isPro?key:null,
      _inferred:true,
      ...(isPro&&baseRecord?{_derivedFrom:base}:{})
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
    if(!pattern||!patterns[pattern]&&!window.COQ_PATTERN_REGISTRY?.get?.(pattern))return null;
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