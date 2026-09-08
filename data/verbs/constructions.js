// COQ — catálogo de construcciones verbales.
// Este archivo contiene únicamente metadatos de construcción y registro de
// familias especiales que necesitan información adicional en la base de verbos.
window.COQ_CONSTRUCTIONS = {
  'non-pronominale': { id: 'non-pronominale', label: 'Forme non pronominale', pronom: false },
  'pronominale': { id: 'pronominale', label: 'Forme pronominale', pronom: true }
};

window.COQ_PRONOMINAL_RULES = {
  'lever': { fonctionDeSe: 'COD', accord: 'sujet' },
  'promener': { fonctionDeSe: 'COD', accord: 'sujet' },
  'parler': { fonctionDeSe: 'COI', accord: 'aucun' }
};

window.COQ_COMPOUND_CONSTRUCTION_FILTERS = {
  'avec-avoir': { id: 'avec-avoir', label: 'Avec auxiliaire AVOIR', auxiliaires: ['avoir'], pronominal: false },
  'avec-etre': { id: 'avec-etre', label: 'Avec auxiliaire ÊTRE', auxiliaires: ['être'], pronominal: false },
  'avec-avoir-et-etre': { id: 'avec-avoir-et-etre', label: 'Avec auxiliaire AVOIR et ÊTRE', auxiliaires: ['avoir', 'être'], pronominal: null },
  'verbes-pronominaux': { id: 'verbes-pronominaux', label: 'Verbes pronominaux', auxiliaires: ['être'], pronominal: true }
};

(function(){
  const verbs = window.COQ_VERBS || (window.COQ_VERBS = {});

  const elerVerbs = {
    'appeler': ['appeler', 'appelé'], 'rappeler': ['rappeler', 'rappelé'],
    'agneler': ['agneler', 'agnelé'], 'celer': ['celer', 'celé'],
    'déceler': ['déceler', 'décelé'], 'receler': ['receler', 'recelé'],
    'ciseler': ['ciseler', 'ciselé'], 'démanteler': ['démanteler', 'démantelé'],
    'écarteler': ['écarteler', 'écartelé'], 'encasteler': ['encasteler', 'encastelé'],
    'geler': ['geler', 'gelé'], 'dégeler': ['dégeler', 'dégelé'],
    'congeler': ['congeler', 'congelé'], 'surgeler': ['surgeler', 'surgelé'],
    'marteler': ['marteler', 'martelé'], 'modeler': ['modeler', 'modelé'],
    'peler': ['peler', 'pelé'], 'ficeler': ['ficeler', 'ficelé']
  };

  Object.keys(elerVerbs).forEach(function(key){
    if(verbs[key]){
      verbs[key].pattern = 'er-eler';
      return;
    }
    const item = elerVerbs[key];
    verbs[key] = {
      id: key,
      infinitif: item[0],
      infinitif_base: item[0],
      groupe: 1,
      pattern: 'er-eler',
      auxiliaire: 'avoir',
      pronominal: false,
      participePasse: item[1],
      construction: 'non-pronominale',
      verbeBase: key
    };
  });

  // -ETER : las reglas de generación viven en COQ_PATTERN_REGISTRY.
  // Este catálogo solo registra los verbos y sus metadatos.
  const eterVerbs = {
    'jeter': 'jeté', 'projeter': 'projeté', 'rejeter': 'rejeté', 'déjeter': 'déjeté', 'surjeter': 'surjeté',
    'acheter': 'acheté', 'racheter': 'racheté',
    'bégueter': 'bégueté', 'corseter': 'corseté', 'crocheter': 'crocheté', 'fileter': 'fileté', 'fureter': 'fureté', 'haleter': 'haleté',
    'feuilleter': 'feuilleté'
  };

  Object.keys(eterVerbs).forEach(function(key){
    if(verbs[key]){
      verbs[key].pattern = 'er-eter';
      return;
    }
    verbs[key] = {
      id: key,
      infinitif: key,
      infinitif_base: key,
      groupe: 1,
      pattern: 'er-eter',
      auxiliaire: 'avoir',
      pronominal: false,
      participePasse: eterVerbs[key],
      construction: 'non-pronominale',
      verbeBase: key
    };
  });
})();
