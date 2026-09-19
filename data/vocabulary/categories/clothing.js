/* COQ — Vocabulario · Ropa */
(function () {
  'use strict';
  const category = {
    id:'clothing', title:'Ropa', subcategories:[
      {id:'clothing-main',title:'Prendas',entries:[
        {id:'clothing-shirt',word:'chemise',translation:'camisa',articleFr:'une',articleEs:'una'},
        {id:'clothing-tshirt',word:'tee-shirt',translation:'camiseta',articleFr:'un',articleEs:'una'},
        {id:'clothing-pants',word:'pantalon',translation:'pantalón',articleFr:'un',articleEs:'un'},
        {id:'clothing-jeans',word:'jean',translation:'vaquero / jean',articleFr:'un',articleEs:'un'},
        {id:'clothing-skirt',word:'jupe',translation:'falda',articleFr:'une',articleEs:'una'},
        {id:'clothing-dress',word:'robe',translation:'vestido',articleFr:'une',articleEs:'un'},
        {id:'clothing-jacket',word:'veste',translation:'chaqueta',articleFr:'une',articleEs:'una'},
        {id:'clothing-coat',word:'manteau',translation:'abrigo',articleFr:'un',articleEs:'un'},
        {id:'clothing-sweater',word:'pull',translation:'suéter / jersey',articleFr:'un',articleEs:'un'},
        {id:'clothing-shorts',word:'short',translation:'pantalón corto',articleFr:'un',articleEs:'un'}
      ]},
      {id:'clothing-shoes',title:'Calzado',entries:[
        {id:'clothing-shoe',word:'chaussure',translation:'zapato',articleFr:'une',articleEs:'un'},
        {id:'clothing-boot',word:'botte',translation:'bota',articleFr:'une',articleEs:'una'},
        {id:'clothing-sandal',word:'sandale',translation:'sandalia',articleFr:'une',articleEs:'una'},
        {id:'clothing-sneaker',word:'basket',translation:'zapatilla deportiva',articleFr:'une',articleEs:'una'},
        {id:'clothing-slipper',word:'pantoufle',translation:'zapatilla de casa',articleFr:'une',articleEs:'una'},
        {id:'clothing-sock',word:'chaussette',translation:'calcetín',articleFr:'une',articleEs:'un'}
      ]},
      {id:'clothing-accessories',title:'Accesorios',entries:[
        {id:'clothing-hat',word:'chapeau',translation:'sombrero',articleFr:'un',articleEs:'un'},
        {id:'clothing-cap',word:'casquette',translation:'gorra',articleFr:'une',articleEs:'una'},
        {id:'clothing-scarf',word:'écharpe',translation:'bufanda',articleFr:'une',articleEs:'una'},
        {id:'clothing-glove',word:'gant',translation:'guante',articleFr:'un',articleEs:'un'},
        {id:'clothing-belt',word:'ceinture',translation:'cinturón',articleFr:'une',articleEs:'un'},
        {id:'clothing-bag',word:'sac',translation:'bolso / bolsa',articleFr:'un',articleEs:'un'}
      ]}
    ]
  };
  if (!window.COQ_VOCABULARY_DATABASE_API) throw new Error('COQ Vocabulario: registro no disponible.');
  window.COQ_VOCABULARY_DATABASE_API.registerCategory(Object.freeze(category));
})();