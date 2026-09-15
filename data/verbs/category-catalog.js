// COQ — catálogo pedagógico de categorías de grupos verbales.
(function(){
  const categories=[
    {id:'all',label:'Todos',groupes:null,familyIds:null},
    {id:'regular-er',label:'Premier groupe normal',groupes:[1],familyIds:['er-regular']},
    {id:'er-ger',label:'Premier groupe verbes en GER',groupes:[1],familyIds:['er-ger']},
    {id:'er-cer',label:'Premier groupe verbes en CER',groupes:[1],familyIds:['er-cer']},
    {id:'er-eler',label:'Premier groupe verbes en -ELER',groupes:[1],familyIds:['er-eler-double','er-eler-accent','er-eler']},
    {id:'er-eter',label:'Premier groupe verbes en -ETER',groupes:[1],familyIds:['er-eter-double','er-eter-accent','er-eter-orthographic','er-eter']},
    {id:'yer',label:'Premier groupe verbes en -YER',groupes:[1],familyIds:['yer-oyer-uyer','yer-ayer','yer']},
    {id:'er-e-accent',label:'Premier groupe verbe en -E (È) + consonne + ER',groupes:[1],familyIds:['er-e-accent']},
    {id:'groupe-2',label:'Deuxième groupe',groupes:[2],familyIds:['ir-regular-2']},
    {id:'groupe-3',label:'Verbes du troisième groupe',groupes:[3],familyIds:['être','avoir','aller-type','prendre-type','faire-type','partir-type','suivre-type','ouvrir-type','venir-type','tenir-type','mettre-type','lire-type','rire-type','vivre-type','conduire-type','courir-type','mourir-type','croire-type','recevoir-type','connaître-type','paraître-type','groupe-3']}
  ];
  const frozen=Object.freeze(categories.map(c=>Object.freeze({id:c.id,label:c.label,groupes:c.groupes?Object.freeze([...c.groupes]):null,familyIds:c.familyIds?Object.freeze([...c.familyIds]):null})));
  const canonicalRecord=verb=>{const records=window.COQ_CONJ_DATA_MODEL?.records||{};return records[String(verb||'').trim().toLowerCase()]||null;};
  function categoryOptions(){return frozen.map(c=>Object.freeze({...c,groupes:c.groupes?Object.freeze([...c.groupes]):null,familyIds:c.familyIds?Object.freeze([...c.familyIds]):null}));}
  function matchesCategory(verb,categoryId){if(!categoryId||categoryId==='all')return true;const category=frozen.find(x=>x.id===categoryId);if(!category)return false;const record=canonicalRecord(verb);if(!record)return false;const sub=String(record.subCategory||'').toUpperCase();const bySub={regular:'NORMAL',NORMAL:'NORMAL','er-ger':'GER','er-cer':'CER','er-eler':'ELER','er-eter':'ETER',yer:'YER','er-e-accent':'E_ACUTE_CONSONANT_ER','groupe-2':'IR_SECOND','groupe-3':'IRREGULAR'};if(categoryId==='groupe-3')return Number(record.groupe)===3;if(categoryId==='groupe-2')return Number(record.groupe)===2;if(categoryId==='regular-er')return Number(record.groupe)===1&&sub==='NORMAL';if(categoryId==='er-ger')return Number(record.groupe)===1&&sub==='GER';if(categoryId==='er-cer')return Number(record.groupe)===1&&sub==='CER';if(categoryId==='er-eler')return Number(record.groupe)===1&&sub==='ELER';if(categoryId==='er-eter')return Number(record.groupe)===1&&sub==='ETER';if(categoryId==='yer')return Number(record.groupe)===1&&sub==='YER';if(categoryId==='er-e-accent')return Number(record.groupe)===1&&sub==='E_ACUTE_CONSONANT_ER';if(category.familyIds&&category.familyIds.includes(record.familyId))return true;if(category.groupes?.length)return category.groupes.includes(Number(record.groupe));return false;}
  window.COQ_VERB_CATEGORY_CATALOG=frozen;window.COQ_CATEGORY_RESOLVER=Object.freeze({categoryOptions,matchesCategory});
})();