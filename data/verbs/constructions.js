// COQ — catálogo declarativo de construcciones y familias especiales.
// Este módulo NO modifica COQ_VERBS.
window.COQ_CONSTRUCTIONS={
  'non-pronominale':{id:'non-pronominale',label:'Forme non pronominale',pronom:false},
  'pronominale':{id:'pronominale',label:'Forme pronominale',pronom:true}
};
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
(function(){
  const catalog={};
  const add=(key,pattern,participePasse)=>{catalog[key]={id:key,infinitif:key,infinitif_base:key,groupe:1,pattern,auxiliaire:'avoir',pronominal:false,participePasse,construction:'non-pronominale',verbeBase:key};};
  const eler={appeler:'appelé',rappeler:'rappelé',agneler:'agnelé',celer:'celé',déceler:'décelé',receler:'recelé',ciseler:'ciselé',démanteler:'démantelé',écarteler:'écartelé',encasteler:'encastelé',geler:'gelé',dégeler:'dégelé',congeler:'congelé',surgeler:'surgelé',marteler:'martelé',modeler:'modelé',peler:'pelé',ficeler:'ficelé'};
  Object.entries(eler).forEach(([key,pp])=>add(key,'er-eler',pp));
  const eter={jeter:'jeté',projeter:'projeté',rejeter:'rejeté',déjeter:'déjeté',surjeter:'surjeté',acheter:'acheté',racheter:'racheté',bégueter:'bégueté',corseter:'corseté',crocheter:'crocheté',fileter:'fileté',fureter:'fureté',haleter:'haleté',feuilleter:'feuilleté'};
  Object.entries(eter).forEach(([key,pp])=>add(key,'er-eter',pp));
  window.COQ_VERB_CONSTRUCTION_CATALOG=Object.freeze(catalog);
})();
