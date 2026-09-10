// COQ — catálogo declarativo de construcciones.
// Este módulo NO almacena datos léxicos de verbos.
window.COQ_PRONOMINAL_RULES={
  'lever':{fonctionDeSe:'COD',accord:'sujet'},
  'promener':{fonctionDeSe:'COD',accord:'sujet'},
  'parler':{fonctionDeSe:'COI',accord:'aucun'}
};
window.COQ_COMPOUND_CONSTRUCTION_FILTERS={
  'avec-avoir':{id:'avec-avoir',label:'Avec auxiliaire AVOIR',auxiliaires:['avoir'],pronominal:false},
  'avec-etre':{id:'avec-etre',label:'Avec auxiliaire ÊTRE',auxiliaires:['être'],pronominal:false},
  'avec-avoir-et-etre':{id:'avec-avoir-et-etre',label:'Avec auxiliaire AVOIR et ÊTRE',auxiliaires:['avoir','être'],pronominal:null},
  'verbes-pronominaux':{id:'verbes-pronominaux',label:'Verbes pronominaux',auxiliaires:['être'],pronominal:true}
};
window.COQ_CONSTRUCTION_OPTIONS=Object.freeze([
  {id:'non-pronominale',label:'Verbes non pronominaux'},
  {id:'pronominale',label:'Verbes pronominaux'}
]);
window.COQ_AUXILIARY_OPTIONS=Object.freeze([
  {id:'avec-avoir',label:'Avec auxiliaire AVOIR'},
  {id:'avec-etre',label:'Avec auxiliaire ÊTRE'},
  {id:'avec-avoir-et-etre',label:'Avec auxiliaire AVOIR et ÊTRE'}
]);
