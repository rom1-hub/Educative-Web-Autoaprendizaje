/* COQ — Vocabulario · Casa */
(function () {
  'use strict';
  const category = {
    id: 'house',
    title: 'Casa',
    subcategories: [
      { id:'house-rooms', title:'Habitaciones y espacios', entries:[
        {id:'house-home',word:'maison',translation:'casa',articleFr:'une',articleEs:'una'},
        {id:'house-apartment',word:'appartement',translation:'apartamento',articleFr:'un',articleEs:'un'},
        {id:'house-room',word:'pièce',translation:'habitación / estancia',articleFr:'une',articleEs:'una'},
        {id:'house-bedroom',word:'chambre',translation:'dormitorio',articleFr:'une',articleEs:'un'},
        {id:'house-kitchen',word:'cuisine',translation:'cocina',articleFr:'une',articleEs:'una'},
        {id:'house-bathroom',word:'salle de bains',translation:'baño',articleFr:'une',articleEs:'un'},
        {id:'house-living-room',word:'salon',translation:'salón',articleFr:'un',articleEs:'un'},
        {id:'house-dining-room',word:'salle à manger',translation:'comedor',articleFr:'une',articleEs:'un'},
        {id:'house-hallway',word:'couloir',translation:'pasillo',articleFr:'un',articleEs:'un'},
        {id:'house-balcony',word:'balcon',translation:'balcón',articleFr:'un',articleEs:'un'},
        {id:'house-garden',word:'jardin',translation:'jardín',articleFr:'un',articleEs:'un'},
        {id:'house-garage',word:'garage',translation:'garaje',articleFr:'un',articleEs:'un'}
      ]},
      { id:'house-furniture', title:'Muebles', entries:[
        {id:'house-table',word:'table',translation:'mesa',articleFr:'une',articleEs:'una'},
        {id:'house-chair',word:'chaise',translation:'silla',articleFr:'une',articleEs:'una'},
        {id:'house-sofa',word:'canapé',translation:'sofá',articleFr:'un',articleEs:'un'},
        {id:'house-bed',word:'lit',translation:'cama',articleFr:'un',articleEs:'una'},
        {id:'house-wardrobe',word:'armoire',translation:'armario',articleFr:'une',articleEs:'un'},
        {id:'house-shelf',word:'étagère',translation:'estantería',articleFr:'une',articleEs:'una'},
        {id:'house-desk',word:'bureau',translation:'escritorio',articleFr:'un',articleEs:'un'},
        {id:'house-armchair',word:'fauteuil',translation:'sillón',articleFr:'un',articleEs:'un'}
      ]},
      { id:'house-objects', title:'Objetos de la casa', entries:[
        {id:'house-door',word:'porte',translation:'puerta',articleFr:'une',articleEs:'una'},
        {id:'house-window',word:'fenêtre',translation:'ventana',articleFr:'une',articleEs:'una'},
        {id:'house-key',word:'clé',translation:'llave',articleFr:'une',articleEs:'una'},
        {id:'house-lamp',word:'lampe',translation:'lámpara',articleFr:'une',articleEs:'una'},
        {id:'house-mirror',word:'miroir',translation:'espejo',articleFr:'un',articleEs:'un'},
        {id:'house-clock',word:'horloge',translation:'reloj de pared',articleFr:'une',articleEs:'un'},
        {id:'house-carpet',word:'tapis',translation:'alfombra',articleFr:'un',articleEs:'una'},
        {id:'house-curtain',word:'rideau',translation:'cortina',articleFr:'un',articleEs:'una'}
      ]}
    ]
  };
  if (!window.COQ_VOCABULARY_DATABASE_API) throw new Error('COQ Vocabulario: registro no disponible.');
  window.COQ_VOCABULARY_DATABASE_API.registerCategory(Object.freeze(category));
})();