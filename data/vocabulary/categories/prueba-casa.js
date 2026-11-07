/* COQ — Vocabulario · Prueba casa
 * Categoría temporal para validar la escena interactiva moderna.
 * El vocabulario se replica desde «Casa · Habitaciones y espacios de la casa»
 * sin modificar la categoría original.
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
          {id:'house-home',word:'maison',translation:'casa',articleFr:'une',articleEs:'una'},
          {id:'house-apartment',word:'appartement',translation:'apartamento',articleFr:'un',articleEs:'un'},
          {id:'house-room',word:'pièce',translation:'habitación / estancia',articleFr:'une',articleEs:'una'},
          {id:'house-bedroom',word:'chambre',translation:'dormitorio',articleFr:'une',articleEs:'un'},
          {id:'house-living-room',word:'salon',translation:'salón',articleFr:'un',articleEs:'un'},
          {id:'house-dining-room',word:'salle à manger',translation:'comedor',articleFr:'une',articleEs:'un'},
          {id:'house-kitchen',word:'cuisine',translation:'cocina',articleFr:'une',articleEs:'una'},
          {id:'house-bathroom',word:'salle de bains',translation:'baño',articleFr:'une',articleEs:'un'},
          {id:'house-shower-room',word:'salle de douche',translation:'cuarto de ducha',articleFr:'une',articleEs:'un'},
          {id:'house-toilet',word:'toilettes',translation:'aseo / baño',articleFr:'les',articleEs:'el'},
          {id:'house-hallway',word:'couloir',translation:'pasillo',articleFr:'un',articleEs:'un'},
          {id:'house-entrance',word:'entrée',translation:'entrada',articleFr:'une',articleEs:'una'},
          {id:'house-balcony',word:'balcon',translation:'balcón',articleFr:'un',articleEs:'un'},
          {id:'house-terrace',word:'terrasse',translation:'terraza',articleFr:'une',articleEs:'una'},
          {id:'house-garden',word:'jardin',translation:'jardín',articleFr:'un',articleEs:'un'},
          {id:'house-garage',word:'garage',translation:'garaje',articleFr:'un',articleEs:'un'},
          {id:'house-cellar',word:'cave',translation:'sótano / bodega',articleFr:'une',articleEs:'un'},
          {id:'house-attic',word:'grenier',translation:'ático / buhardilla',articleFr:'un',articleEs:'un'}
        ]
      }
    ]
  };

  if (!window.COQ_VOCABULARY_DATABASE_API || typeof window.COQ_VOCABULARY_DATABASE_API.registerCategory !== 'function') {
    throw new Error('COQ Vocabulario: el registro de base de datos debe cargarse antes de las categorías.');
  }

  window.COQ_VOCABULARY_DATABASE_API.registerCategory(category);
})();
