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
const COQ_CONSTRUCTION_RESOLVER=Object.freeze({
  isPronominal(record,construction){
    return construction==='pronominale'||record?.pronominal===true||record?.construction==='pronominale';
  },
  matchesConstruction(record,construction){
    if(!construction)return true;
    const isPronominal=this.isPronominal(record,construction);
    if(construction==='pronominale')return isPronominal;
    if(construction==='non-pronominale')return !isPronominal;
    return true;
  },
  matchesAuxiliary(record,tense,auxiliary,compoundTenses){
    if(!auxiliary||tense==='Todos los tiempos')return true;
    if(!compoundTenses.includes(tense))return true;
    const filter=window.COQ_COMPOUND_CONSTRUCTION_FILTERS?.[auxiliary];
    if(!filter)return true;
    const isPronominal=this.isPronominal(record);
    if(filter.pronominal===true)return isPronominal;
    if(filter.pronominal===false&&isPronominal)return false;
    const effectiveAuxiliary=isPronominal?'être':record?.auxiliaire;
    return Array.isArray(filter.auxiliaires)?filter.auxiliaires.includes(effectiveAuxiliary):true;
  }
});
window.COQ_CONSTRUCTION_RESOLVER=COQ_CONSTRUCTION_RESOLVER;
