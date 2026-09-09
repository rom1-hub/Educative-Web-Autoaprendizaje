// COQ — catálogo y resolución de patrones de conjugación.
// La resolución es pura: este módulo nunca modifica los datos de origen.
window.COQ_VERB_PATTERNS={"regular-er":{groupe:1,description:"Premier groupe régulier en -ER"},"regular-ir":{groupe:2,description:"Deuxième groupe régulier en -IR"},"regular-re":{groupe:3,description:"Verbes réguliers en -RE"},"er-ger":{groupe:1,description:"Premier groupe avec terminaison -GER"},"er-cer":{groupe:1,description:"Premier groupe avec terminaison -CER"},"er-eler":{groupe:1,description:"Premier groupe avec alternance en -ELER"},"er-eter":{groupe:1,description:"Premier groupe avec alternance en -ETER"},"yer":{groupe:1,description:"Premier groupe en -YER"},"er-e-accent":{groupe:1,description:"Premier groupe avec alternance E/È + consonne + ER"},"e-accent":{groupe:1,description:"Premier groupe avec alternance E/È"},"avoir":{groupe:3,description:"Verbe irrégulier avoir"},"être":{groupe:3,description:"Verbe irrégulier être"},"aller-type":{groupe:3,description:"Verbe irrégulier aller"},"prendre":{groupe:3,description:"Famille prendre"},"faire":{groupe:3,description:"Verbe irrégulier faire"},"partir-type":{groupe:3,description:"Famille partir"},"suivre-type":{groupe:3,description:"Famille suivre"},"ouvrir-type":{groupe:3,description:"Famille ouvrir"},"venir-type":{groupe:3,description:"Famille venir"},"tenir-type":{groupe:3,description:"Famille tenir"},"mettre-type":{groupe:3,description:"Famille mettre"},"lire-type":{groupe:3,description:"Famille lire"},"rire-type":{groupe:3,description:"Famille rire"},"vivre-type":{groupe:3,description:"Famille vivre"},"conduire-type":{groupe:3,description:"Famille en -UIRE"},"courir-type":{groupe:3,description:"Famille courir"},"mourir-type":{groupe:3,description:"Verbe mourir"},"croire-type":{groupe:3,description:"Famille croire"},"recevoir-type":{groupe:3,description:"Famille recevoir"},"connaître-type":{groupe:3,description:"Famille connaître"},"paraître-type":{groupe:3,description:"Famille paraître"}};
// Fuente única de verdad para los filtros pedagógicos de grupos/familias.
// La UI y el motor consultan este catálogo; no duplican etiquetas ni reglas.
window.COQ_VERB_GROUP_CATALOG=Object.freeze([
  {id:'all',label:'Todos',patterns:null,groupes:null},
  {id:'regular-er',label:'Premier groupe normal',patterns:['regular-er'],groupes:[1]},
  {id:'er-ger',label:'Premier groupe verbes en GER',patterns:['er-ger'],groupes:[1]},
  {id:'er-cer',label:'Premier groupe verbes en CER',patterns:['er-cer'],groupes:[1]},
  {id:'er-eler',label:'Premier groupe verbes en -ELER',patterns:['er-eler'],groupes:[1]},
  {id:'er-eter',label:'Premier groupe verbes en -ETER',patterns:['er-eter'],groupes:[1]},
  {id:'yer',label:'Premier groupe verbes en -YER',patterns:['yer'],groupes:[1]},
  {id:'er-e-accent',label:'Premier groupe verbe en -E (È) + consonne + ER',patterns:['er-e-accent'],groupes:[1]},
  {id:'groupe-2',label:'Deuxième groupe',patterns:null,groupes:[2]},
  {id:'groupe-3',label:'Verbes du troisième groupe',patterns:null,groupes:[3]}
]);
(function(){
  const baseData=window.COQ_VERBS||{},patterns=window.COQ_VERB_PATTERNS;
  const normalize=value=>String(value||'').trim().toLowerCase();
  function sourceRecord(key){const familyCatalog=window.COQ_VERB_FAMILY_CATALOG||{},constructionCatalog=window.COQ_VERB_CONSTRUCTION_CATALOG||{},base=baseData[key]||{},family=familyCatalog[key]||{},construction=constructionCatalog[key]||{};if(!Object.keys(base).length&&!Object.keys(family).length&&!Object.keys(construction).length)return null;return {...base,...family,...construction};}
  function baseVerb(verb){const key=normalize(verb),record=sourceRecord(key);return record?.verbeBase?normalize(record.verbeBase):key;}
  function resolvePattern(verb){const key=normalize(verb),base=baseVerb(key),record=sourceRecord(key);if(record?.pattern&&(patterns[record.pattern]||window.COQ_PATTERN_REGISTRY?.get?.(record.pattern)))return record.pattern;if(/ger$/.test(base))return'er-ger';if(/cer$/.test(base))return'er-cer';if(/yer$/.test(base))return'yer';if(/eler$/.test(base))return'er-eler';if(/eter$/.test(base))return'er-eter';if(/er$/.test(base))return'regular-er';return null;}
  function inferParticiple(verb,pattern){const base=baseVerb(verb);if(['regular-er','er-ger','er-cer','er-eler','er-eter','yer','er-e-accent','e-accent'].includes(pattern))return base.replace(/er$/,'é');return sourceRecord(base)?.participePasse||null;}
  function resolveRecord(verb){const key=normalize(verb),source=sourceRecord(key);if(!source)return null;const base=baseVerb(key);if(source.pronominal===true){if(!source.pattern||!source.participePasse)return null;return {...source,id:key,infinitif:key,infinitif_base:base,auxiliaire:'être',pronominal:true,construction:'pronominale',verbeBase:base,formePronominale:source.formePronominale||{infinitif:key},_inferred:false};}if(key.startsWith('se '))return null;if(source.pattern)return {...source,id:key,infinitif:key};const pattern=resolvePattern(key);if(!pattern||!patterns[pattern]&&!window.COQ_PATTERN_REGISTRY?.get?.(pattern))return null;const meta=patterns[pattern]||window.COQ_PATTERN_REGISTRY?.get?.(pattern);return {id:key,infinitif:key,infinitif_base:key,groupe:meta.groupe,pattern,auxiliaire:'avoir',pronominal:false,construction:'non-pronominale',verbeBase:key,participePasse:inferParticiple(key,pattern),_inferred:true};}
  const groups=window.COQ_VERB_GROUP_CATALOG;
  function groupOptions(){return groups.map(group=>Object.freeze({...group,patterns:group.patterns?Object.freeze([...group.patterns]):null,groupes:group.groupes?Object.freeze([...group.groupes]):null}));}
  function matchesGroup(verb,groupId){
    if(!groupId||groupId==='all')return true;
    const group=groups.find(item=>item.id===groupId);
    if(!group)return false;
    const record=resolveRecord(verb)||{};
    if(group.patterns&&group.patterns.length&&!group.patterns.includes(record.pattern))return false;
    if(group.groupes&&group.groupes.length&&!group.groupes.includes(Number(record.groupe)))return false;
    return true;
  }
  window.COQ_PATTERN_RESOLVER={normalize,baseVerb,resolvePattern,resolveRecord,groupOptions,matchesGroup};
})();
