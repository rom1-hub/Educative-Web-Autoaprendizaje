/*
 * COQ — Registro de la base de datos de Vocabulario
 *
 * Este archivo compone las categorías disponibles.
 * El contenido de cada categoría vive en su propio archivo dentro de
 * data/vocabulary/categories/.
 *
 * Camino:
 * categoría → subcategoría → tema → entrada
 *
 * Los ejercicios no se almacenan aquí: reutilizarán los identificadores
 * de las entradas mediante el motor común de ejercicios.
 */
(function () {
  'use strict';

  const categories = Array.isArray(window.COQ_VOCABULARY_CATEGORIES)
    ? window.COQ_VOCABULARY_CATEGORIES
    : [];

  const database = Object.freeze({
    version: '2.0.0',
    categories: Object.freeze(categories)
  });

  window.COQ_VOCABULARY_DATABASE = database;
  window.COQ_VOCABULARY_DATABASE_READY = Promise.resolve(database);
})();
