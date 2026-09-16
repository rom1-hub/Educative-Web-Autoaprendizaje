// COQ — catálogo pedagógico de categorías de grupos verbales.
(function(){
  const categories=[
    {id:'all',label:'Todos',groupes:null,familyIds:null},
    {id:'regular-er',label:'Primer grupo: verbos regulares',groupes:[1],familyIds:['er-regular'],subCategories:['NORMAL']},
    {id:'er-ger',label:'Primer grupo: verbos en -GER',groupes:[1],familyIds:['er-ger'],subCategories:['GER']},
    {id:'er-cer',label:'Primer grupo: verbos en -CER',groupes:[1],familyIds:['er-cer'],subCategories:['CER']},
    {id:'er-eler',label:'Primer grupo: verbos en -ELER',groupes:[1],familyIds:['er-eler-double','er-eler-accent'],subCategories:['ELER']},
    {id:'er-eter',label:'Primer grupo: verbos en -ETER',groupes:[1],familyIds:['er-eter-double','er-eter-accent','er-eter-orthographic'],subCategories:['ETER']},
    {id:'yer',label:'Primer grupo: verbos en -YER',groupes:[1],familyIds:['yer-oyer-uyer','yer-ayer'],subCategories:['YER']},
    {id:'er-e-accent',label:'Primer grupo: verbos en -E (È) + consonante + ER',groupes:[1],familyIds:['er-e-accent'],subCategories:['E_ACUTE_CONSONANT_ER']},
    {id:'groupe-2',label:'Segundo grupo',groupes:[2],familyIds:['ir-regular-2'],subCategories:['IR_SECOND']},
    {id:'groupe-3',label:'Verbos del tercer grupo',groupes:[3],familyIds:['être','avoir','aller-type','prendre-type','faire-type','partir-type','suivre-type','ouvrir-type','venir-type','tenir-type','mettre-type','lire-type','rire-type','vivre-type','conduire-type','courir-type','mourir-type','croire-type','recevoir-type','connaître-type','paraître-type'],subCategories:['DRE','IR_THIRD','UIRE','AITRE','EINDRE_AINDRE_OINDRE','IRREGULAR']}
  ];
  const frozen=Object.freeze(categories.map(category=>Object.freeze({...category,groupes:category.groupes?Object.freeze([...category.groupes]):null,familyIds:category.familyIds?Object.freeze([...category.familyIds]):null,subCategories:category.subCategories?Object.freeze([...category.subCategories]):null})));
  const canonicalRecord=verb=>{const records=window.COQ_CONJ_DATA_MODEL?.records||{};return records[String(verb||'').trim().toLowerCase()]||null;};
  function categoryOptions(){return frozen.map(category=>Object.freeze({...category,groupes:category.groupes?Object.freeze([...category.groupes]):null,familyIds:category.familyIds?Object.freeze([...category.familyIds]):null,subCategories:category.subCategories?Object.freeze([...category.subCategories]):null}));}
  function matchesCategory(verb,categoryId){
    if(!categoryId||categoryId==='all')return true;
    const category=frozen.find(item=>item.id===categoryId);if(!category)return false;
    const record=canonicalRecord(verb);if(!record)return false;
    if(category.familyIds&&category.familyIds.includes(record.familyId))return true;
    if(category.subCategories&&category.subCategories.includes(record.subCategory))return true;
    if((category.id==='groupe-2'||category.id==='groupe-3')&&category.groupes?.length&&category.groupes.includes(Number(record.groupe)))return true;
    return false;
  }
  window.COQ_VERB_CATEGORY_CATALOG=frozen;
  window.COQ_CATEGORY_RESOLVER=Object.freeze({categoryOptions,matchesCategory});
})();