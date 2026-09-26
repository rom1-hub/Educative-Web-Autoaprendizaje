// COQ — catálogo declarativo de auxiliares.
// Este módulo NO almacena datos léxicos de verbos.
window.COQ_COMPOUND_AUXILIARY_FILTERS={
  'avec-avoir':{id:'avec-avoir',label:'Con el auxiliar AVOIR',auxiliaires:['avoir']},
  'avec-etre':{id:'avec-etre',label:'Con el auxiliar ÊTRE',auxiliaires:['être']},
  'avec-avoir-et-etre':{id:'avec-avoir-et-etre',label:'Con los auxiliares AVOIR y ÊTRE',auxiliaires:['avoir','être']},
  'verbes-pronominaux':{id:'verbes-pronominaux',label:'Verbos pronominales',auxiliaires:['être'],pronominal:true}
};
const COQ_AUXILIARY_COMPOUND_TENSE_CACHE=new WeakMap();
function compoundTenseSet(compoundTenses){if(!Array.isArray(compoundTenses))return null;let set=COQ_AUXILIARY_COMPOUND_TENSE_CACHE.get(compoundTenses);if(!set){set=new Set(compoundTenses);COQ_AUXILIARY_COMPOUND_TENSE_CACHE.set(compoundTenses,set);}return set;}
window.COQ_AUXILIARY_OPTIONS=Object.freeze([
  {id:'avec-avoir',label:'Con el auxiliar AVOIR'},
  {id:'avec-etre',label:'Con el auxiliar ÊTRE'},
  {id:'avec-avoir-et-etre',label:'Con los auxiliares AVOIR y ÊTRE'}
]);
const COQ_AUXILIARY_RESOLVER=Object.freeze({
  resolve(record,constructionResolver){
    if(constructionResolver?.isPronominal(record))return 'être';
    return record?.auxiliaire||null;
  },
  matches(record,tense,auxiliary,compoundTenses,constructionResolver){
    if(!auxiliary||tense==='Todos los tiempos')return true;
    const compoundTenseSetValue=compoundTenseSet(compoundTenses);if(!compoundTenseSetValue?.has(tense))return true;
    const filter=window.COQ_COMPOUND_AUXILIARY_FILTERS?.[auxiliary];
    if(!filter)return true;
    const resolved=this.resolve(record,constructionResolver);
    if(filter.pronominal===true)return constructionResolver?.isPronominal(record)===true;
    return Array.isArray(filter.auxiliaires)?filter.auxiliaires.includes(resolved):true;
  }
});
window.COQ_AUXILIARY_RESOLVER=COQ_AUXILIARY_RESOLVER;
