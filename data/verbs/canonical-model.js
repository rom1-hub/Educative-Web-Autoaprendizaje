/* COQ — Modelo canónico de datos de Conjugaison.
 *
 * Vista estructural única sobre los datos léxicos de Conjugaison.
 *
 * Jerarquía conceptual:
 * Groupe → Catégorie → Famille → Pattern → Verbe → Variante/Exception
 */
(function(){
  const rawVerbs=window.COQ_VERBS||{};
  const familyCatalog=window.COQ_VERB_FAMILY_CATALOG||{};
  const sourceKeys=new Set([...Object.keys(rawVerbs),...Object.keys(familyCatalog)]);
  const records={};

  function deepFreeze(value){
    if(value&&typeof value==='object'&&!Object.isFrozen(value)){
      Object.values(value).forEach(deepFreeze);
      Object.freeze(value);
    }
    return value;
  }

  function normalizeBaseVerbId(record,key){
    const candidate=String(record?.verbeBase||'').trim();
    return !candidate||candidate===key?null:candidate;
  }

  function normalizeLegacyLexicalData(key,merged){
    if(key==='être'&&merged.pattern==='être'&&merged.participePasse==='été'&&!merged.pronominal){
      return {...merged,auxiliaire:'avoir'};
    }
    return merged;
  }

  sourceKeys.forEach(key=>{
    const raw=rawVerbs[key]||{};
    const family=familyCatalog[key]||{};
    const merged=normalizeLegacyLexicalData(key,{...raw,...family});
    const familyId=typeof merged.familyId==='string'&&merged.familyId.trim()?merged.familyId.trim():null;
    const patternId=typeof merged.patternId==='string'&&merged.patternId.trim()
      ?merged.patternId.trim()
      :(typeof merged.pattern==='string'&&merged.pattern.trim()?merged.pattern.trim():null);
    const baseVerbId=normalizeBaseVerbId(merged,key);
    const variantes=merged.variantes??merged.variante??null;

    records[key]=deepFreeze({
      id:merged.id||key,
      infinitif:merged.infinitif||key,
      infinitifBase:merged.infinitif_base||key,
      groupe:Number.isFinite(Number(merged.groupe))?Number(merged.groupe):null,
      familyId,
      patternId,
      auxiliaire:merged.auxiliaire||null,
      participePasse:merged.participePasse||null,
      construction:merged.construction||'non-pronominale',
      baseVerbId,
      formePronominale:merged.formePronominale||null,
      formeNonPronominale:merged.formeNonPronominale||null,
      pronominal:merged.pronominal===true,
      variantes,
      exceptions:merged.exceptions||null,
      legacyPattern:merged.pattern||null,
      legacyVerbeBase:merged.verbeBase||null,
      legacyFormes:merged.formes||null
    });
  });

  const familyIndex={};
  Object.entries(records).forEach(([verb,record])=>{
    if(!record.familyId)return;
    (familyIndex[record.familyId]||(familyIndex[record.familyId]=[])).push(verb);
  });
  Object.keys(familyIndex).forEach(id=>Object.freeze(familyIndex[id]));

  const api={
    version:'1.0.0',
    records:deepFreeze(records),
    familyIndex:deepFreeze(familyIndex),
    get(verb){return records[String(verb||'').trim()]||null;},
    getFamilyVerbs(familyId){return familyIndex[String(familyId||'').trim()]||[];}
  };

  window.COQ_CONJ_DATA_MODEL=Object.freeze(api);

  // Compatibilidad transitoria durante la migración del Pattern Registry.
  // La fuente sigue siendo exclusivamente el modelo canónico: no se duplica
  // ningún dato léxico. El acceso legado se consume una sola vez y desaparece.
  const legacyVariantCatalog=Object.freeze(Object.fromEntries(
    Object.entries(records)
      .filter(([,record])=>record.variantes!==null&&record.variantes!==undefined)
      .map(([verb,record])=>[verb,Object.freeze({variante:record.variantes})])
  ));
  Object.defineProperty(window,'COQ_VERB_CONSTRUCTION_CATALOG',{
    configurable:true,
    enumerable:false,
    get(){
      delete window.COQ_VERB_CONSTRUCTION_CATALOG;
      return legacyVariantCatalog;
    }
  });
})();
