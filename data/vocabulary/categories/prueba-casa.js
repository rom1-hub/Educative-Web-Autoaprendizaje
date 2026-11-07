/* COQ — Vocabulario · Prueba casa
 * Categoría temporal para validar una escena ilustrada e interactiva.
 * Las entradas reutilizan términos ya presentes en la categoría «Casa».
 */
(function () {
  'use strict';

  const category = {
    id: 'prueba-casa',
    title: 'Prueba casa',
    subcategories: [
      {
        id: 'prueba-casa-escena',
        title: 'La casa interactiva',
        scene: 'house-cutaway',
        entries: [
          {id:'test-house-salon',word:'salon',translation:'salón',articleFr:'un',articleEs:'un'},
          {id:'test-house-cuisine',word:'cuisine',translation:'cocina',articleFr:'une',articleEs:'una'},
          {id:'test-house-chambre',word:'chambre',translation:'dormitorio',articleFr:'une',articleEs:'un'},
          {id:'test-house-bathroom',word:'salle de bains',translation:'baño',articleFr:'une',articleEs:'un'},
          {id:'test-house-sofa',word:'canapé',translation:'sofá',articleFr:'un',articleEs:'un'},
          {id:'test-house-fridge',word:'réfrigérateur',translation:'refrigerador',articleFr:'un',articleEs:'un'},
          {id:'test-house-bed',word:'lit',translation:'cama',articleFr:'un',articleEs:'una'},
          {id:'test-house-shower',word:'douche',translation:'ducha',articleFr:'une',articleEs:'una'}
        ]
      }
    ]
  };

  if (!window.COQ_VOCABULARY_DATABASE_API || typeof window.COQ_VOCABULARY_DATABASE_API.registerCategory !== 'function') {
    throw new Error('COQ Vocabulario: el registro de base de datos debe cargarse antes de las categorías.');
  }

  window.COQ_VOCABULARY_DATABASE_API.registerCategory(category);
})();
