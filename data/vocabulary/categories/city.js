/* COQ — Vocabulario · Ciudad */
(function () {
  'use strict';
  const category = {
    id:'city', title:'Ciudad', subcategories:[
      {id:'city-places',title:'Lugares',entries:[
        {id:'city-street',word:'rue',translation:'calle',articleFr:'une',articleEs:'una'},
        {id:'city-square',word:'place',translation:'plaza',articleFr:'une',articleEs:'una'},
        {id:'city-park',word:'parc',translation:'parque',articleFr:'un',articleEs:'un'},
        {id:'city-school',word:'école',translation:'escuela',articleFr:'une',articleEs:'una'},
        {id:'city-hospital',word:'hôpital',translation:'hospital',articleFr:'un',articleEs:'un'},
        {id:'city-pharmacy',word:'pharmacie',translation:'farmacia',articleFr:'une',articleEs:'una'},
        {id:'city-bank',word:'banque',translation:'banco',articleFr:'une',articleEs:'un'},
        {id:'city-post-office',word:'poste',translation:'oficina de correos',articleFr:'une',articleEs:'una'},
                {id:'city-airport',word:'aéroport',translation:'aeropuerto',articleFr:'un',articleEs:'un'}
      ]},
      {id:'city-shops',title:'Comercios',entries:[
        {id:'city-store',word:'magasin',translation:'tienda',articleFr:'un',articleEs:'una'},
        {id:'city-supermarket',word:'supermarché',translation:'supermercado',articleFr:'un',articleEs:'un'},
        {id:'city-bakery',word:'boulangerie',translation:'panadería',articleFr:'une',articleEs:'una'},
        {id:'city-butcher',word:'boucherie',translation:'carnicería',articleFr:'une',articleEs:'una'},
        {id:'city-market',word:'marché',translation:'mercado',articleFr:'un',articleEs:'un'},
        {id:'city-bookstore',word:'librairie',translation:'librería',articleFr:'une',articleEs:'una'}
      ]},
      {id:'city-buildings',title:'Edificios y servicios',entries:[
        {id:'city-building',word:'bâtiment',translation:'edificio',articleFr:'un',articleEs:'un'},
        {id:'city-town-hall',word:'mairie',translation:'ayuntamiento',articleFr:'une',articleEs:'un'},
        {id:'city-police-station',word:'commissariat',translation:'comisaría',articleFr:'un',articleEs:'una'},
        {id:'city-library',word:'bibliothèque',translation:'biblioteca',articleFr:'une',articleEs:'una'},
        {id:'city-museum',word:'musée',translation:'museo',articleFr:'un',articleEs:'un'},
        {id:'city-cinema',word:'cinéma',translation:'cine',articleFr:'un',articleEs:'un'}
      ]}
    ]
  };
  if (!window.COQ_VOCABULARY_DATABASE_API) throw new Error('COQ Vocabulario: registro no disponible.');
  window.COQ_VOCABULARY_DATABASE_API.registerCategory(Object.freeze(category));
})();