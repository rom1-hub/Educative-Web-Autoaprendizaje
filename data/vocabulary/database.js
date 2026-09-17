/*
 * COQ — Base de datos de Vocabulario
 *
 * Fuente de verdad estructural del vocabulario.
 * La interfaz no contiene categorías ni subcategorías hardcodeadas.
 *
 * Jerarquía:
 * categoría → subcategoría → tema → palabras → ejercicios
 */
(function () {
  'use strict';

  const database = {
    version: '1.0.0',
    categories: [
      {
        id: 'animals',
        title: 'Animales',
        subcategories: [
          { id: 'animals-domestic', title: 'Animales domésticos', topics: [] },
          { id: 'animals-farm', title: 'Animales de granja', topics: [] },
          { id: 'animals-wild', title: 'Animales salvajes', topics: [] },
          { id: 'animals-marine', title: 'Animales marinos', topics: [] },
          { id: 'animals-birds', title: 'Aves', topics: [] },
          { id: 'animals-insects', title: 'Insectos', topics: [] },
          { id: 'animals-reptiles-amphibians', title: 'Reptiles y anfibios', topics: [] }
        ]
      }
    ]
  };

  window.COQ_VOCABULARY_DATABASE = Object.freeze(database);
  window.COQ_VOCABULARY_DATABASE_READY = Promise.resolve(database);
})();
