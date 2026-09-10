// COQ — catálogo declarativo de construcciones.
// Este módulo NO almacena datos léxicos de verbos.
window.COQ_PRONOMINAL_RULES={
  'lever':{fonctionDeSe:'COD',accord:'sujet'},
  'promener':{fonctionDeSe:'COD',accord:'sujet'},
  'parler':{fonctionDeSe:'COI',accord:'aucun'}
};
window.COQ_CONSTRUCTION_OPTIONS=Object.freeze([
  {id:'non-pronominale',label:'Verbes non pronominaux'},
  {id:'pronominale',label:'Verbes pronominaux'}
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
  }
});
window.COQ_CONSTRUCTION_RESOLVER=COQ_CONSTRUCTION_RESOLVER;
