// COQ — catálogo de construcciones verbales.
// Una construcción pronominal es una variante relacionada con el verbo base.
window.COQ_CONSTRUCTIONS = {
  'non-pronominale': { id: 'non-pronominale', label: 'Forme non pronominale', pronom: false },
  'pronominale': { id: 'pronominale', label: 'Forme pronominale', pronom: true }
};

// Règles de construction pronominale utiles à Conjugaison.
// Les cas complexes (COD antérieur/postérieur, etc.) serán tratados dans une leçon dédiée.
window.COQ_PRONOMINAL_RULES = {
  'lever': { fonctionDeSe: 'COD', accord: 'sujet' },
  'promener': { fonctionDeSe: 'COD', accord: 'sujet' },
  'parler': { fonctionDeSe: 'COI', accord: 'aucun' }
};

// Filtros comunes reutilizables por TODOS los tiempos composés.
// 'avec-avoir-et-etre' significa que el conjunto de práctica acepta verbos con uno u otro auxiliaire;
// no significa que un mismo verbo utilice ambos auxiliaires simultáneamente.
window.COQ_COMPOUND_CONSTRUCTION_FILTERS = {
  'avec-avoir': { id: 'avec-avoir', label: 'Avec auxiliaire AVOIR', auxiliaires: ['avoir'], pronominal: false },
  'avec-etre': { id: 'avec-etre', label: 'Avec auxiliaire ÊTRE', auxiliaires: ['être'], pronominal: false },
  'avec-avoir-et-etre': { id: 'avec-avoir-et-etre', label: 'Avec auxiliaire AVOIR et ÊTRE', auxiliaires: ['avoir', 'être'], pronominal: null },
  'verbes-pronominaux': { id: 'verbes-pronominaux', label: 'Verbes pronominaux', auxiliaires: ['être'], pronominal: true }
};

// Contrato futuro de búsqueda: tanto 'parler' como 'se parler' deben poder resolverse
// hacia la misma identidad de verbo base, conservando la construcción solicitada.
// La implementación del buscador/conmutador se hará en una fase posterior.

// Regresión técnica del patrón -ELER.
// Estos verbos no forman parte todavía del catálogo pedagógico definitivo,
// pero deben estar disponibles para probar y validar el patrón.
(function(){
  const verbs = window.COQ_VERBS || (window.COQ_VERBS = {});
  const elerVerbs = {
    'appeler': ['appeler', 'appelé'],
    'rappeler': ['rappeler', 'rappelé'],
    'agneler': ['agneler', 'agnelé'],
    'celer': ['celer', 'celé'],
    'déceler': ['déceler', 'décelé'],
    'receler': ['receler', 'recelé'],
    'ciseler': ['ciseler', 'ciselé'],
    'démanteler': ['démanteler', 'démantelé'],
    'écarteler': ['écarteler', 'écartelé'],
    'encasteler': ['encasteler', 'encastelé'],
    'geler': ['geler', 'gelé'],
    'dégeler': ['dégeler', 'dégelé'],
    'congeler': ['congeler', 'congelé'],
    'surgeler': ['surgeler', 'surgelé'],
    'marteler': ['marteler', 'martelé'],
    'modeler': ['modeler', 'modelé'],
    'peler': ['peler', 'pelé'],
    'ficeler': ['ficeler', 'ficelé']
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
})();
