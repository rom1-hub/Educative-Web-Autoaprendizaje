/*
 * COQ — Base de datos de Vocabulario
 *
 * Fuente de verdad estructural del vocabulario.
 * La interfaz no contiene categorías ni subcategorías hardcodeadas.
 *
 * Jerarquía:
 * categoría → subcategoría → tema → palabras
 * Los ejercicios pertenecen a una subcategoría y/o a un tema.
 */
(function () {
  'use strict';

  const database = {
    version: '1.1.0',
    categories: [
      {
        id: 'animals',
        title: 'Animales',
        subcategories: [
          { id: 'animals-domestic', title: 'Animales domésticos', topics: [], exercises: [] },
          { id: 'animals-farm', title: 'Animales de granja', topics: [], exercises: [] },
          { id: 'animals-wild', title: 'Animales salvajes', topics: [], exercises: [] },
          { id: 'animals-marine', title: 'Animales marinos', topics: [], exercises: [] },
          { id: 'animals-birds', title: 'Aves', topics: [], exercises: [] },
          { id: 'animals-insects', title: 'Insectos', topics: [], exercises: [] },
          { id: 'animals-reptiles-amphibians', title: 'Reptiles y anfibios', topics: [], exercises: [] }
        ]
      }
    ]
  };

  window.COQ_VOCABULARY_DATABASE = Object.freeze(database);
  window.COQ_VOCABULARY_DATABASE_READY = Promise.resolve(database);
})();
