// COQ — catálogo declarativo de construcciones y familias especiales.
// Este módulo NO modifica COQ_VERBS.
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
  const add=(key,pattern,participePasse,variante)=>{catalog[key]={id:key,infinitif:key,infinitif_base:key,groupe:1,pattern,auxiliaire:'avoir',pronominal:false,participePasse,construction:'non-pronomiale',verbeBase:key,variante};};
  const addPronominal=(key,base,pattern,participePasse,accord,fonctionDeSe)=>{catalog[key]={id:key,infinitif:key,infinitif_base:base,groupe:1,pattern,auxiliaire:'être',pronominal:true,participePasse,construction:'pronomiale',verbeBase:base,formePronominale:{infinitif:key},accord,fonctionDeSe};};
  addPronominal('se lever','lever','regular-er','levé','sujet','COD');
  addPronominal('se promener','promener','regular-er','promené','sujet','COD');
  addPronominal('se parler','parler','regular-er','parlé','aucun','COI');
  const eler={
    appeler:['appelé','appeler'],rappeler:['rappelé','appeler'],
    agneler:['agnelé','eler'],celer:['celé','eler'],déceler:['décelé','eler'],receler:['recelé','eler'],ciseler:['ciselé','eler'],démanteler:['démantelé','eler'],écarteler:['écartelé','eler'],encasteler:['encastelé','eler'],geler:['gelé','eler'],dégeler:['dégelé','eler'],congeler:['congelé','eler'],surgeler:['surgelé','eler'],marteler:['martelé','eler'],modeler:['modelé','eler'],peler:['pelé','eler'],ficeler:['ficelé','double']
  };
  Object.entries(eler).forEach(([key,[pp,variante]])=>add(key,'er-eler',pp,variante));
  const eter={
    jeter:['jeté','jeter'],projeter:['projeté','double'],rejeter:['rejeté','double'],déjeter:['déjeté','double'],surjeter:['surjeté','double'],
    acheter:['acheté','accent'],racheter:['racheté','accent'],bégueter:['bégueté','accent'],corseter:['corseté','accent'],crocheter:['crocheté','accent'],fileter:['fileté','accent'],fureter:['fureté','accent'],haleter:['haleté','accent'],feuilleter:['feuilleté','double']
  };
  Object.entries(eter).forEach(([key,[pp,variante]])=>add(key,'er-eter',pp,variante));
  window.COQ_VERB_CONSTRUCTION_CATALOG=Object.freeze(catalog);
})();
