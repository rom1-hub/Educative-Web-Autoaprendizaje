// COQ — catálogo de construcciones verbales.
// Una construcción pronominal es una variante relacionada con el verbo base.
window.COQ_CONSTRUCTIONS = {
  'non-pronominale': { id: 'non-pronominale', label: 'Forme non pronominale', pronom: false },
  'pronominale': { id: 'pronominale', label: 'Forme pronominale', pronom: true }
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

// Contrat futuro de búsqueda: tanto 'parler' como 'se parler' deben poder resolverse
// hacia la misma identidad de verbo base, conservando la construcción solicitada.
// La implementación del buscador/conmutador se hará en una fase posterior.
