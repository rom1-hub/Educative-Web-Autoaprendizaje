/* COQ — Modelo canónico de datos de Conjugaison.
 *
 * Vista estructural única sobre los datos léxicos de Conjugaison.
 *
 * Jerarquía conceptual:
 * Groupe → Catégorie → Famille → Pattern → Verbe → Variante/Exception
 */
(function(){
  const rawVerbs=window.COQ_VERBS||{};
  const familyResolver=window.COQ_FAMILY_RESOLVER;
  const sourceKeys=Object.keys(rawVerbs);
  const records={};
  function deepFreeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(deepFreeze);Object.freeze(value);}return value;}
  function normalizeBaseVerbId(record,key){const candidate=String(record?.verbeBase||'').trim();return !candidate||candidate===key?null:candidate;}
  function normalizeLegacyLexicalData(key,merged){if(key==='être'&&merged.pattern==='être'&&merged.participePasse==='été'&&!merged.pronominal)return {...merged,auxiliaire:'avoir'};return merged;}
  sourceKeys.forEach(key=>{
    const raw=rawVerbs[key]||{};
    const family=familyResolver?.resolve(key);
    const merged=normalizeLegacyLexicalData(key,{...raw,...(family?{familyId:family.id,patternId:family.patternId,groupe:family.groupe}: {})});
    const familyId=typeof merged.familyId==='string'&&merged.familyId.trim()?merged.familyId.trim():null;
    const patternId=typeof merged.patternId==='string'&&merged.patternId.trim()?merged.patternId.trim():null;
    const baseVerbId=normalizeBaseVerbId(merged,key);
    const variantes=merged.variantes??merged.variante??null;
    records[key]=deepFreeze({id:merged.id||key,infinitif:merged.infinitif||key,infinitifBase:merged.infinitif_base||key,groupe:Number.isFinite(Number(merged.groupe))?Number(merged.groupe):null,familyId,patternId,auxiliaire:merged.auxiliaire||null,participePasse:merged.participePasse||null,construction:merged.construction||'non-pronominale',baseVerbId,formePronominale:merged.formePronominale||null,formeNonPronominale:merged.formeNonPronominale||null,pronominal:merged.pronominal===true,variantes,exceptions:merged.exceptions||null});
  });
  const api={version:'1.0.0',records:deepFreeze(records),get(verb){return records[String(verb||'').trim()]||null;}};
  window.COQ_CONJ_DATA_MODEL=Object.freeze(api);
})();
