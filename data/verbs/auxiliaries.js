// COQ — catálogo declarativo de auxiliares.
// Este módulo NO almacena datos léxicos de verbos.
window.COQ_COMPOUND_AUXILIARY_FILTERS={
  'avec-avoir':{id:'avec-avoir',label:'Avec auxiliaire AVOIR',auxiliaires:['avoir']},
  'avec-etre':{id:'avec-etre',label:'Avec auxiliaire ÊTRE',auxiliaires:['être']},
  'avec-avoir-et-etre':{id:'avec-avoir-et-etre',label:'Avec auxiliaire AVOIR et ÊTRE',auxiliaires:['avoir','être']},
  'verbes-pronominaux':{id:'verbes-pronominaux',label:'Verbes pronominaux',auxiliaires:['être'],pronominal:true}
};
window.COQ_AUXILIARY_OPTIONS=Object.freeze([
  {id:'avec-avoir',label:'Avec auxiliaire AVOIR'},
  {id:'avec-etre',label:'Avec auxiliaire ÊTRE'},
  {id:'avec-avoir-et-etre',label:'Avec auxiliaire AVOIR et ÊTRE'}
]);
const COQ_AUXILIARY_RESOLVER=Object.freeze({
  resolve(record,constructionResolver){
    if(constructionResolver?.isPronominal(record))return 'être';
    return record?.auxiliaire||null;
  },
  matches(record,tense,auxiliary,compoundTenses,constructionResolver){
    if(!auxiliary||tense==='Todos los tiempos')return true;
    if(!compoundTenses.includes(tense))return true;
    const filter=window.COQ_COMPOUND_AUXILIARY_FILTERS?.[auxiliary];
    if(!filter)return true;
    const resolved=this.resolve(record,constructionResolver);
    if(filter.pronominal===true)return constructionResolver?.isPronominal(record)===true;
    return Array.isArray(filter.auxiliaires)?filter.auxiliaires.includes(resolved):true;
  }
});
window.COQ_AUXILIARY_RESOLVER=COQ_AUXILIARY_RESOLVER;
