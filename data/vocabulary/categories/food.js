/* COQ — Vocabulario · Alimentación */
(function () {
  'use strict';
  const category = {
    id:'food', title:'Alimentación', subcategories:[
      {id:'food-fruits',title:'Frutas',entries:[
        {id:'food-apple',word:'pomme',translation:'manzana',articleFr:'une',articleEs:'una'},
        {id:'food-banana',word:'banane',translation:'banana',articleFr:'une',articleEs:'una'},
        {id:'food-orange',word:'orange',translation:'naranja',articleFr:'une',articleEs:'una'},
        {id:'food-strawberry',word:'fraise',translation:'fresa',articleFr:'une',articleEs:'una'},
        {id:'food-grape',word:'raisin',translation:'uva',articleFr:'un',articleEs:'una'},
        {id:'food-lemon',word:'citron',translation:'limón',articleFr:'un',articleEs:'un'},
        {id:'food-peach',word:'pêche',translation:'melocotón / durazno',articleFr:'une',articleEs:'un'},
        {id:'food-pear',word:'poire',translation:'pera',articleFr:'une',articleEs:'una'}
      ]},
      {id:'food-vegetables',title:'Verduras',entries:[
        {id:'food-carrot',word:'carotte',translation:'zanahoria',articleFr:'une',articleEs:'una'},
        {id:'food-potato',word:'pomme de terre',translation:'patata / papa',articleFr:'une',articleEs:'una'},
        {id:'food-tomato',word:'tomate',translation:'tomate',articleFr:'une',articleEs:'un'},
        {id:'food-onion',word:'oignon',translation:'cebolla',articleFr:'un',articleEs:'una'},
        {id:'food-garlic',word:'ail',translation:'ajo',articleFr:'un',articleEs:'un'},
        {id:'food-lettuce',word:'laitue',translation:'lechuga',articleFr:'une',articleEs:'una'},
        {id:'food-pepper',word:'poivron',translation:'pimiento',articleFr:'un',articleEs:'un'},
        {id:'food-cucumber',word:'concombre',translation:'pepino',articleFr:'un',articleEs:'un'}
      ]},
      {id:'food-staples',title:'Alimentos básicos',entries:[
        {id:'food-bread',word:'pain',translation:'pan',articleFr:'un',articleEs:'un'},
        {id:'food-cheese',word:'fromage',translation:'queso',articleFr:'un',articleEs:'un'},
        {id:'food-egg',word:'œuf',translation:'huevo',articleFr:'un',articleEs:'un'},
        {id:'food-yogurt',word:'yaourt',translation:'yogur',articleFr:'un',articleEs:'un'},
        {id:'food-cake',word:'gâteau',translation:'pastel / torta',articleFr:'un',articleEs:'una'},
        {id:'food-sandwich',word:'sandwich',translation:'sándwich',articleFr:'un',articleEs:'un'},
        {id:'food-biscuit',word:'biscuit',translation:'galleta',articleFr:'un',articleEs:'una'},
        {id:'food-chocolate',word:'chocolat',translation:'chocolate',articleFr:'un',articleEs:'un'}
      ]}
    ]
  };
  if (!window.COQ_VOCABULARY_DATABASE_API) throw new Error('COQ Vocabulario: registro no disponible.');
  window.COQ_VOCABULARY_DATABASE_API.registerCategory(Object.freeze(category));
})();