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

  function normalize(v){
    return String(v || '').trim().toLowerCase();
  }

  function baseVerb(verb){
    const key = normalize(verb);
    const record = verbs[key];
    if(record && record.verbeBase && verbs[normalize(record.verbeBase)]){
      return normalize(record.verbeBase);
    }
    if(key.startsWith('se ')) return key.slice(3).trim();
    return key;
  }

  function resolvePattern(verb){
    const key = normalize(verb);
    const base = baseVerb(key);
    const record = verbs[key] || verbs[base];

    // La BD peut forzar explícitamente un patrón para una excepción léxica.
    if(record && record.pattern && patterns[record.pattern]){
      return record.pattern;
    }

    // Solo detectamos automáticamente familias productivas que el motor
    // ya sabe generar de forma transversal y que hemos validado.
    if(/ger$/.test(base)) return 'er-ger';
    if(/cer$/.test(base)) return 'er-cer';
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

  window.COQ_PATTERN_RESOLVER = {
    normalize,
    baseVerb,
    resolvePattern,
    applyToDatabase
  };

  // Verbos adicionales de regresión: no declaran pattern a propósito.
  // El resolver debe clasificarlos automáticamente. Se mantienen como datos
  // reales y mínimos para poder probar lookup y generación en la página.
  const regressionVerbs = {
    'changer': {id:'changer', infinitif:'changer', infinitif_base:'changer', groupe:1, auxiliaire:'avoir', pronominal:false, participePasse:'changé', construction:'non-pronominale', verbeBase:'changer'},
    'voyager': {id:'voyager', infinitif:'voyager', infinitif_base:'voyager', groupe:1, auxiliaire:'avoir', pronominal:false, participePasse:'voyagé', construction:'non-pronominale', verbeBase:'voyager'},
    'nager': {id:'nager', infinitif:'nager', infinitif_base:'nager', groupe:1, auxiliaire:'avoir', pronominal:false, participePasse:'nagé', construction:'non-pronominale', verbeBase:'nager'},
    'partager': {id:'partager', infinitif:'partager', infinitif_base:'partager', groupe:1, auxiliaire:'avoir', pronominal:false, participePasse:'partagé', construction:'non-pronominale', verbeBase:'partager'},
    'ranger': {id:'ranger', infinitif:'ranger', infinitif_base:'ranger', groupe:1, auxiliaire:'avoir', pronominal:false, participePasse:'rangé', construction:'non-pronominale', verbeBase:'ranger'},
    'corriger': {id:'corriger', infinitif:'corriger', infinitif_base:'corriger', groupe:1, auxiliaire:'avoir', pronominal:false, participePasse:'corrigé', construction:'non-pronominale', verbeBase:'corriger'},
    'placer': {id:'placer', infinitif:'placer', infinitif_base:'placer', groupe:1, auxiliaire:'avoir', pronominal:false, participePasse:'placé', construction:'non-pronominale', verbeBase:'placer'},
    'annoncer': {id:'annoncer', infinitif:'annoncer', infinitif_base:'annoncer', groupe:1, auxiliaire:'avoir', pronominal:false, participePasse:'annoncé', construction:'non-pronominale', verbeBase:'annoncer'},
    'avancer': {id:'avancer', infinitif:'avancer', infinitif_base:'avancer', groupe:1, auxiliaire:'avoir', pronominal:false, participePasse:'avancé', construction:'non-pronominale', verbeBase:'avancer'},
    'prononcer': {id:'prononcer', infinitif:'prononcer', infinitif_base:'prononcer', groupe:1, auxiliaire:'avoir', pronominal:false, participePasse:'prononcé', construction:'non-pronominale', verbeBase:'prononcer'},
    'remplacer': {id:'remplacer', infinitif:'remplacer', infinitif_base:'remplacer', groupe:1, auxiliaire:'avoir', pronominal:false, participePasse:'remplacé', construction:'non-pronominale', verbeBase:'remplacer'},
    'lancer': {id:'lancer', infinitif:'lancer', infinitif_base:'lancer', groupe:1, auxiliaire:'avoir', pronominal:false, participePasse:'lancé', construction:'non-pronominale', verbeBase:'lancer'}
  };

  Object.keys(regressionVerbs).forEach(key=>{
    if(!verbs[key]) verbs[key]=regressionVerbs[key];
  });

  // Asigna automáticamente solo los patrones productivos ya validados.
  applyToDatabase();

  // Batería de regresión mínima para comprobar que la prioridad específica
  // funciona antes de ampliar la base de datos.
  window.COQ_PATTERN_REGRESSION = {
    ger: ['manger','changer','voyager','nager','partager','ranger','corriger'],
    cer: ['commencer','placer','annoncer','avancer','prononcer','remplacer','lancer'],
    expected: {
      'manger':'er-ger','changer':'er-ger','voyager':'er-ger','nager':'er-ger',
      'partager':'er-ger','ranger':'er-ger','corriger':'er-ger',
      'commencer':'er-cer','placer':'er-cer','annoncer':'er-cer','avancer':'er-cer',
      'prononcer':'er-cer','remplacer':'er-cer','lancer':'er-cer'
    }
  };

  window.COQ_PATTERN_REGRESSION.run = function(){
    const cases = this.expected;
    return Object.keys(cases).map(verb=>({
      verb,
      expected: cases[verb],
      actual: resolvePattern(verb),
      ok: resolvePattern(verb) === cases[verb]
    }));
  };
})();
