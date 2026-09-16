// COQ — catálogo declarativo de construcciones.
// Este módulo NO almacena datos léxicos de verbos.
window.COQ_PRONOMINAL_RULES={
  'lever':{fonctionDeSe:'COD',accord:'sujet'},
  'promener':{fonctionDeSe:'COD',accord:'sujet'},
  'parler':{fonctionDeSe:'COI',accord:'aucun'}
};
window.COQ_CONSTRUCTION_OPTIONS=Object.freeze([
  {id:'non-pronomiale',label:'Verbos no pronominales'},
  {id:'pronomiale',label:'Verbos pronominales'}
]);
const COQ_CONSTRUCTION_RESOLVER=Object.freeze({
  isPronominal(record){
    // La pronominalidad es un dato léxico del registro canónico.
    // Nunca se infiere del texto introducido ni del filtro solicitado.
    return record?.pronominal===true||record?.construction==='pronomiale'||record?.construction==='pronominale';
  },
  matchesConstruction(record,construction){
    if(!construction)return true;
    const isPronominal=this.isPronominal(record);
    if(construction==='pronomiale')return isPronominal;
    if(construction==='non-pronomiale'||construction==='non-pronominale')return !isPronominal;
    return true;
  }
});
window.COQ_CONSTRUCTION_RESOLVER=COQ_CONSTRUCTION_RESOLVER;
