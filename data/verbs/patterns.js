// COQ — catálogo y resolución de patrones de conjugación.
//
// Responsabilidad única:
//   Pattern → mecanismo técnico de generación
//
// Los filtros pedagógicos viven en category-catalog.js y apuntan a familias.
// Este módulo nunca utiliza un pattern como sustituto de una familia.
window.COQ_VERB_PATTERNS={"regular-er":{groupe:1,description:"Premier groupe régulier en -ER"},"regular-ir":{groupe:2,description:"Deuxième groupe régulier en -IR"},"regular-re":{groupe:3,description:"Verbes réguliers en -RE"},"er-ger":{groupe:1,description:"Premier groupe avec terminaison -GER"},"er-cer":{groupe:1,description:"Premier groupe avec terminaison -CER"},"er-eler":{groupe:1,description:"Premier groupe avec alternance en -ELER"},"er-eter":{groupe:1,description:"Premier groupe avec alternance en -ETER"},"yer":{groupe:1,description:"Premier groupe en -YER"},"er-e-accent":{groupe:1,description:"Premier groupe avec alternance E/È + consonne + ER"},"e-accent":{groupe:1,description:"Premier groupe avec alternance E/È"},"avoir":{groupe:3,description:"Verbe irrégulier avoir"},"être":{groupe:3,description:"Verbe irrégulier être"},"aller-type":{groupe:3,description:"Verbe irrégulier aller"},"prendre":{groupe:3,description:"Pattern de la famille prendre"},"faire":{groupe:3,description:"Verbe irrégulier faire"},"partir-type":{groupe:3,description:"Pattern de la famille partir"},"suivre-type":{groupe:3,description:"Pattern de la famille suivre"},"ouvrir-type":{groupe:3,description:"Pattern de la famille ouvrir"},"venir-type":{groupe:3,description:"Pattern de la famille venir"},"tenir-type":{groupe:3,description:"Pattern de la famille tenir"},"mettre-type":{groupe:3,description:"Pattern de la famille mettre"},"lire-type":{groupe:3,description:"Pattern de la famille lire"},"rire-type":{groupe:3,description:"Pattern de la famille rire"},"vivre-type":{groupe:3,description:"Pattern de la famille vivre"},"conduire-type":{groupe:3,description:"Pattern de la famille en -UIRE"},"courir-type":{groupe:3,description:"Pattern de la famille courir"},"mourir-type":{groupe:3,description:"Verbe mourir"},"croire-type":{groupe:3,description:"Pattern de la famille croire"},"recevoir-type":{groupe:3,description:"Pattern de la famille recevoir"},"connaître-type":{groupe:3,description:"Pattern de la famille connaître"},"paraître-type":{groupe:3,description:"Pattern de la famille paraître"}};
(function(){
  const dataModel=window.COQ_CONJ_DATA_MODEL;
  const records=dataModel?.records||{};
  const families=window.COQ_VERB_FAMILIES||{};
  const categories=window.COQ_VERB_CATEGORY_CATALOG||[];
  const patterns=window.COQ_VERB_PATTERNS;
  const normalize=value=>String(value||'').trim().toLowerCase();
  function canonicalRecord(verb){return records[normalize(verb)]||null;}
  function baseVerb(verb){const record=canonicalRecord(verb);return record?.baseVerbId||normalize(verb);}
  function resolvePattern(verb){return canonicalRecord(verb)?.patternId||null;}
  function resolveRecord(verb){return canonicalRecord(verb);}
  function categoryOptions(){
    return categories.map(category=>Object.freeze({
      ...category,
      groupes:category.groupes?Object.freeze([...category.groupes]):null,
      familyIds:category.familyIds?Object.freeze([...category.familyIds]):null
    }));
  }
  function groupOptions(){return categoryOptions();}
  function matchesGroup(verb,categoryId){
    if(!categoryId||categoryId==='all')return true;
    const category=categories.find(item=>item.id===categoryId);
    if(!category)return false;
    const record=canonicalRecord(verb);
    if(!record)return false;
    if(category.familyIds){
      if(!category.familyIds.includes(record.familyId))return false;
      return true;
    }
    if(category.groupes&&category.groupes.length){
      return category.groupes.includes(Number(record.groupe));
    }
    return false;
  }
  function familyOptions(){
    return Object.values(families).map(family=>Object.freeze({...family,verbs:Object.freeze([...family.verbs])}));
  }
  function resolveFamily(verb){
    const record=canonicalRecord(verb);
    return record?.familyId?families[record.familyId]||null:null;
  }
  window.COQ_PATTERN_RESOLVER={normalize,baseVerb,resolvePattern,resolveRecord,categoryOptions,groupOptions,familyOptions,resolveFamily,matchesGroup};
})();