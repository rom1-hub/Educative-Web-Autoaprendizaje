// COQ — catálogo y resolución de patrones de conjugación.
// La resolución es pura: este módulo nunca modifica los datos de origen.
window.COQ_VERB_PATTERNS={
  "regular-er":{groupe:1,description:"Premier groupe régulier en -ER"},"regular-ir":{groupe:2,description:"Deuxième groupe régulier en -IR"},"regular-re":{groupe:3,description:"Verbes réguliers en -RE"},
  "er-ger":{groupe:1,description:"Premier groupe avec terminaison -GER"},"er-cer":{groupe:1,description:"Premier groupe avec terminaison -CER"},"er-eler":{groupe:1,description:"Premier groupe avec alternance en -ELER"},"er-eter":{groupe:1,description:"Premier groupe avec alternance en -ETER"},"yer":{groupe:1,description:"Premier groupe en -YER"},"er-e-accent":{groupe:1,description:"Premier groupe avec alternance E/È + consonne + ER"},"e-accent":{groupe:1,description:"Premier groupe avec alternance E/È"},
  "avoir":{groupe:3,description:"Verbe irrégulier avoir"},"être":{groupe:3,description:"Verbe irrégulier être"},"aller-type":{groupe:3,description:"Verbe irrégulier aller"},"prendre":{groupe:3,description:"Famille prendre"},"faire":{groupe:3,description:"Verbe irrégulier faire"},
  "partir-type":{groupe:3,description:"Famille partir"},"suivre-type":{groupe:3,description:"Famille suivre"},"ouvrir-type":{groupe:3,description:"Famille ouvrir"},"venir-type":{groupe:3,description:"Famille venir"},"tenir-type":{groupe:3,description:"Famille tenir"},"mettre-type":{groupe:3,description:"Famille mettre"},"lire-type":{groupe:3,description:"Famille lire"},"rire-type":{groupe:3,description:"Famille rire"},"vivre-type":{groupe:3,description:"Famille vivre"},"conduire-type":{groupe:3,description:"Famille en -UIRE"},"courir-type":{groupe:3,description:"Famille courir"},"mourir-type":{groupe:3,description:"Verbe mourir"},"croire-type":{groupe:3,description:"Famille croire"},"recevoir-type":{groupe:3,description:"Famille recevoir"},"connaître-type":{groupe:3,description:"Famille connaître"},"paraître-type":{groupe:3,description:"Famille paraître"},"explicit-er":{groupe:1,description:"Verbes en -YER enregistrés explicitement"}
};

(function(){
  const baseData=window.COQ_VERBS||{};
  const familyCatalog=window.COQ_VERB_FAMILY_CATALOG||{};
  const patterns=window.COQ_VERB_PATTERNS;
  const normalize=value=>String(value||'').trim().toLowerCase();
  const isPronominal=verb=>normalize(verb).startsWith('se ');
  function familyRecord(key){const record=familyCatalog[key];return record?{...record}:null;}
  function baseVerb(verb){const key=normalize(verb),record=baseData[key]||familyCatalog[key];if(record&&record.verbeBase)return normalize(record.verbeBase);if(isPronominal(key))return key.slice(3).trim();return key;}
  function resolvePattern(verb){const key=normalize(verb),base=baseVerb(key),record=baseData[key]||familyCatalog[key];if(record?.pattern&&(patterns[record.pattern]||window.COQ_PATTERN_REGISTRY?.get?.(record.pattern)))return record.pattern;if(/ger$/.test(base))return'er-ger';if(/cer$/.test(base))return'er-cer';if(/yer$/.test(base))return'yer';if(/eler$/.test(base))return'er-eler';if(/eter$/.test(base))return'er-eter';if(/er$/.test(base))return'regular-er';return null;}
  function inferParticiple(verb,pattern){const base=baseVerb(verb);if(['regular-er','er-ger','er-cer','er-eler','er-eter','yer','er-e-accent','e-accent'].includes(pattern))return base.replace(/er$/,'é');return familyCatalog[base]?.participePasse||null;}
  function resolveRecord(verb){
    const key=normalize(verb),base=baseVerb(key),source=baseData[key]||familyCatalog[key];
    if(source&&!isPronominal(key))return {...source,...familyRecord(key),id:key,infinitif:key};
    const pattern=resolvePattern(key);
    if(isPronominal(key)){
      const baseRecord=baseData[base]||familyCatalog[base];
      if(!pattern)return null;
      return {id:key,infinitif:key,infinitif_base:base,groupe:baseRecord?.groupe??3,pattern,auxiliaire:'être',pronominal:true,construction:'pronominale',verbeBase:base,participePasse:baseRecord?.participePasse||inferParticiple(base,pattern),formePronominale:key,_inferred:true};
    }
    if(!pattern||!patterns[pattern]&&!window.COQ_PATTERN_REGISTRY?.get?.(pattern))return null;
    const meta=patterns[pattern]||window.COQ_PATTERN_REGISTRY?.get?.(pattern);
    return {id:key,infinitif:key,infinitif_base:key,groupe:meta.groupe,pattern,auxiliaire:'avoir',pronominal:false,construction:'non-pronominale',verbeBase:key,participePasse:inferParticiple(key,pattern),_inferred:true};
  }
  window.COQ_PATTERN_RESOLVER={normalize,baseVerb,resolvePattern,resolveRecord};
})();
