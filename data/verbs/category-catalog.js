// COQ — catálogo pedagógico de categorías de grupos verbales.
(function(){
  const categories=[
    {id:'all',label:'Todos los grupos',groupes:null,familyIds:null,subCategories:null},
    {id:'groupe-1-all',label:'Primer grupo: todos los verbos',groupes:[1],familyIds:null,subCategories:null},
    {id:'regular-er',label:'Primer grupo: verbos normales',groupes:[1],familyIds:['er-regular'],subCategories:['NORMAL']},
    {id:'er-ger',label:'Primer grupo: verbos en -GER',groupes:[1],familyIds:['er-ger'],subCategories:['GER']},
    {id:'er-cer',label:'Primer grupo: verbos en -CER',groupes:[1],familyIds:['er-cer'],subCategories:['CER']},
    {id:'er-eler',label:'Primer grupo: verbos en -ELER',groupes:[1],familyIds:['er-eler-double','er-eler-accent'],subCategories:['ELER']},
    {id:'er-eter',label:'Primer grupo: verbos en -ETER',groupes:[1],familyIds:['er-eter-double','er-eter-accent','er-eter-orthographic'],subCategories:['ETER']},
    {id:'yer',label:'Primer grupo: verbos en -YER',groupes:[1],familyIds:['yer-oyer-uyer','yer-ayer'],subCategories:['YER']},
    {id:'er-e-accent',label:'Primer grupo: verbos en -E (È) + consonante + ER',groupes:[1],familyIds:['er-e-accent'],subCategories:['E_ACUTE_CONSONANT_ER']},
    {id:'groupe-2-all',label:'Segundo grupo: todos los verbos',groupes:[2],familyIds:null,subCategories:null},
    {id:'groupe-3-all',label:'Tercer grupo: todos los verbos',groupes:[3],familyIds:null,subCategories:null},
    {id:'groupe-3-dre',label:'Tercer grupo: verbos en -DRE',groupes:[3],familyIds:null,subCategories:['DRE'],endings:['dre']},
    {id:'groupe-3-ir',label:'Tercer grupo: verbos en -IR',groupes:[3],familyIds:null,subCategories:['IR_THIRD'],endings:['ir']},
    {id:'groupe-3-uire',label:'Tercer grupo: verbos en -UIRE',groupes:[3],familyIds:['conduire-type'],subCategories:['UIRE'],endings:['uire']},
    {id:'groupe-3-aitre',label:'Tercer grupo: verbos en -AÎTRE',groupes:[3],familyIds:['connaître-type','paraître-type'],subCategories:['AITRE'],endings:['aître']},
    {id:'groupe-3-eindre-aindre-oindre',label:'Tercer grupo: verbos en -EINDRE, -AINDRE, -OINDRE',groupes:[3],familyIds:null,subCategories:['EINDRE_AINDRE_OINDRE'],endings:['eindre','aindre','oindre']},
    {id:'groupe-3-common',label:'Tercer grupo: verbos más comunes',groupes:[3],familyIds:['être','avoir','aller-type','prendre-type','faire-type','partir-type','venir-type','tenir-type','mettre-type','lire-type','connaître-type','paraître-type'],subCategories:['IRREGULAR']}
  ];
  const frozen=Object.freeze(categories.map(category=>Object.freeze({...category,
    groupes:category.groupes?Object.freeze([...category.groupes]):null,
    familyIds:category.familyIds?Object.freeze([...category.familyIds]):null,
    subCategories:category.subCategories?Object.freeze([...category.subCategories]):null,
    endings:category.endings?Object.freeze([...category.endings]):null
  })));
  const canonicalRecord=verb=>{
    const records=window.COQ_CONJ_DATA_MODEL?.records||{};
    return records[String(verb||'').trim().toLowerCase()]||null;
  };
  function categoryOptions(){
    return frozen.map(category=>Object.freeze({...category,
      groupes:category.groupes?Object.freeze([...category.groupes]):null,
      familyIds:category.familyIds?Object.freeze([...category.familyIds]):null,
      subCategories:category.subCategories?Object.freeze([...category.subCategories]):null,
      endings:category.endings?Object.freeze([...category.endings]):null
    }));
  }
  function matchesCategory(verb,categoryId){
    if(!categoryId||categoryId==='all')return true;
    const category=frozen.find(item=>item.id===categoryId);if(!category)return false;
    const record=canonicalRecord(verb);if(!record)return false;
    const groupeMatches=!category.groupes?.length||category.groupes.includes(Number(record.groupe));
    if(!groupeMatches)return false;
    if(category.familyIds?.includes(record.familyId))return true;
    if(category.subCategories?.includes(record.subCategory))return true;
    if(category.endings?.length){
      const infinitif=String(record.infinitif||verb||'').trim().toLowerCase();
      if(category.endings.some(ending=>infinitif.endsWith(ending)))return true;
    }
    if(category.id==='groupe-1-all'||category.id==='groupe-2-all'||category.id==='groupe-3-all')return true;
    return false;
  }
  window.COQ_VERB_CATEGORY_CATALOG=frozen;
  window.COQ_CATEGORY_RESOLVER=Object.freeze({categoryOptions,matchesCategory});
})();