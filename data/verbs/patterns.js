// COQ — catálogo y resolución de patrones de conjugación.
//
// Regla arquitectónica:
// 1) Un patrón explícito de la BD siempre tiene prioridad.
// 2) Si falta, se intenta detectar un patrón productivo ya implementado.
// 3) Los patrones todavía no migrados al motor no se asignan automáticamente.
window.COQ_VERB_PATTERNS = {
  "regular-er": { groupe: 1, description: "Premier groupe régulier en -ER" },
  "regular-ir": { groupe: 2, description: "Deuxième groupe régulier en -IR" },
  "regular-re": { groupe: 3, description: "Verbes réguliers en -RE" },
  "er-ger": { groupe: 1, description: "Premier groupe avec terminaison -GER" },
  "er-cer": { groupe: 1, description: "Premier groupe avec terminaison -CER" },
  "er-eler": { groupe: 1, description: "Premier groupe avec alternance en -ELER" },
  "er-eter": { groupe: 1, description: "Premier groupe avec alternance en -ETER" },
  "yer": { groupe: 1, description: "Premier groupe en -YER" },
  "er-e-accent": { groupe: 1, description: "Premier groupe avec alternance E/È + consonne + ER" },
  "avoir": { groupe: 3, description: "Verbe irrégulier avoir" },
  "être": { groupe: 3, description: "Verbe irrégulier être" },
  "aller": { groupe: 3, description: "Verbe irrégulier aller" },
  "prendre": { groupe: 3, description: "Famille prendre" },
  "venir": { groupe: 3, description: "Famille venir" },
  "faire": { groupe: 3, description: "Verbe irrégulier faire" }
};

(function(){
  const verbs = window.COQ_VERBS || {};
  const patterns = window.COQ_VERB_PATTERNS;

  function normalize(v){ return String(v || '').trim().toLowerCase(); }

  function baseVerb(verb){
    const key = normalize(verb);
    const record = verbs[key];
    if(record && record.verbeBase && verbs[normalize(record.verbeBase)]) return normalize(record.verbeBase);
    if(key.startsWith('se ')) return key.slice(3).trim();
    return key;
  }

  function resolvePattern(verb){
    const key = normalize(verb);
    const base = baseVerb(key);
    const record = verbs[key] || verbs[base];
    if(record && record.pattern && patterns[record.pattern]) return record.pattern;
    if(/ger$/.test(base)) return 'er-ger';
    if(/cer$/.test(base)) return 'er-cer';
    if(/yer$/.test(base)) return 'yer';
    if(/er$/.test(base)) return 'regular-er';
    return null;
  }

  function applyToDatabase(){
    Object.keys(verbs).forEach(key=>{
      const record = verbs[key];
      if(!record || record.pattern) return;
      const resolved = resolvePattern(key);
      if(resolved) record.pattern = resolved;
    });
  }

  window.COQ_PATTERN_RESOLVER = { normalize, baseVerb, resolvePattern, applyToDatabase };
  applyToDatabase();

  // Regresión temporal para validar que las familias ya implementadas y -YER
  // quedan disponibles para búsqueda/conjugación antes de migrarlas al catálogo pedagógico.
  const regressionVerbs = {
    changer:{id:'changer',infinitif:'changer',infinitif_base:'changer',groupe:1,pattern:'er-ger',auxiliaire:'avoir',pronominal:false,participePasse:'changé',construction:'non-pronominale',verbeBase:'changer'},
    voyager:{id:'voyager',infinitif:'voyager',infinitif_base:'voyager',groupe:1,pattern:'er-ger',auxiliaire:'avoir',pronominal:false,participePasse:'voyagé',construction:'non-pronominale',verbeBase:'voyager'},
    nager:{id:'nager',infinitif:'nager',infinitif_base:'nager',groupe:1,pattern:'er-ger',auxiliaire:'avoir',pronominal:false,participePasse:'nagé',construction:'non-pronominale',verbeBase:'nager'},
    partager:{id:'partager',infinitif:'partager',infinitif_base:'partager',groupe:1,pattern:'er-ger',auxiliaire:'avoir',pronominal:false,participePasse:'partagé',construction:'non-pronominale',verbeBase:'partager'},
    ranger:{id:'ranger',infinitif:'ranger',infinitif_base:'ranger',groupe:1,pattern:'er-ger',auxiliaire:'avoir',pronominal:false,participePasse:'rangé',construction:'non-pronominale',verbeBase:'ranger'},
    corriger:{id:'corriger',infinitif:'corriger',infinitif_base:'corriger',groupe:1,pattern:'er-ger',auxiliaire:'avoir',pronominal:false,participePasse:'corrigé',construction:'non-pronominale',verbeBase:'corriger'},
    placer:{id:'placer',infinitif:'placer',infinitif_base:'placer',groupe:1,pattern:'er-cer',auxiliaire:'avoir',pronominal:false,participePasse:'placé',construction:'non-pronominale',verbeBase:'placer'},
    annoncer:{id:'annoncer',infinitif:'annoncer',infinitif_base:'annoncer',groupe:1,pattern:'er-cer',auxiliaire:'avoir',pronominal:false,participePasse:'annoncé',construction:'non-pronominale',verbeBase:'annoncer'},
    avancer:{id:'avancer',infinitif:'avancer',infinitif_base:'avancer',groupe:1,pattern:'er-cer',auxiliaire:'avoir',pronominal:false,participePasse:'avancé',construction:'non-pronominale',verbeBase:'avancer'},
    prononcer:{id:'prononcer',infinitif:'prononcer',infinitif_base:'prononcer',groupe:1,pattern:'er-cer',auxiliaire:'avoir',pronominal:false,participePasse:'prononcé',construction:'non-pronominale',verbeBase:'prononcer'},
    remplacer:{id:'remplacer',infinitif:'remplacer',infinitif_base:'remplacer',groupe:1,pattern:'er-cer',auxiliaire:'avoir',pronominal:false,participePasse:'remplacé',construction:'non-pronominale',verbeBase:'remplacer'},
    lancer:{id:'lancer',infinitif:'lancer',infinitif_base:'lancer',groupe:1,pattern:'er-cer',auxiliaire:'avoir',pronominal:false,participePasse:'lancé',construction:'non-pronominale',verbeBase:'lancer'},
    essuyer:{
      id:'essuyer',infinitif:'essuyer',infinitif_base:'essuyer',groupe:1,pattern:'yer',auxiliaire:'avoir',pronominal:false,participePasse:'essuyé',construction:'non-pronominale',verbeBase:'essuyer',
      formes:{
        "présent de l'indicatif":[['je','essuie'],['tu','essuies'],['il/elle/on','essuie'],['nous','essuyons'],['vous','essuyez'],['ils/elles','essuient']],
        "imparfait":[['je','essuyais'],['tu','essuyais'],['il/elle/on','essuyait'],['nous','essuyions'],['vous','essuyiez'],['ils/elles','essuyaient']],
        "futur simple":[['je','essuierai'],['tu','essuieras'],['il/elle/on','essuiera'],['nous','essuierons'],['vous','essuierez'],['ils/elles','essuieront']],
        "conditionnel présent":[['je','essuierais'],['tu','essuierais'],['il/elle/on','essuierait'],['nous','essuierions'],['vous','essuieriez'],['ils/elles','essuieraient']],
        "subjonctif présent":[['que je','essuie'],['que tu','essuies'],["qu'il/elle/on",'essuie'],['que nous','essuyions'],['que vous','essuyiez'],["qu'ils/elles",'essuient']],
        "impératif présent":[['tu','essuie'],['nous','essuyons'],['vous','essuyez']]
      }
    }
  };

  window.COQ_VERBS = window.COQ_VERBS || {};
  Object.keys(regressionVerbs).forEach(key=>{ if(!window.COQ_VERBS[key]) window.COQ_VERBS[key]=regressionVerbs[key]; });

  window.COQ_PATTERN_REGRESSION={
    ger:['manger','changer','voyager','nager','partager','ranger','corriger'],
    cer:['commencer','placer','annoncer','avancer','prononcer','remplacer','lancer'],
    yer:['essuyer'],
    expected:{
      manger:'er-ger',changer:'er-ger',voyager:'er-ger',nager:'er-ger',partager:'er-ger',ranger:'er-ger',corriger:'er-ger',
      commencer:'er-cer',placer:'er-cer',annoncer:'er-cer',avancer:'er-cer',prononcer:'er-cer',remplacer:'er-cer',lancer:'er-cer',
      essuyer:'yer'
    }
  };

  window.COQ_PATTERN_REGRESSION.run=function(){
    const cases=this.expected;
    return Object.keys(cases).map(verb=>({verb,expected:cases[verb],actual:resolvePattern(verb),ok:resolvePattern(verb)===cases[verb]}));
  };
})();

(function(){
  if(document.querySelector('link[data-coq-conjugaison-mobile]')) return;
  const link=document.createElement('link'); link.rel='stylesheet'; link.href='../css/conjugaison-mobile.css'; link.dataset.coqConjugaisonMobile=''; document.head.appendChild(link);
})();
