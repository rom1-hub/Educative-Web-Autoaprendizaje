/* COQ — Modelo canónico de datos de Conjugaison.
 *
 * Fase 1 del refactor: define una vista estructural única sobre los datos
 * existentes sin cambiar todavía el comportamiento del motor.
 *
 * Jerarquía conceptual:
 * Groupe → Catégorie → Famille → Pattern → Verbe → Variante/Exception
 *
 * En esta fase:
 * - familyId y patternId se introducen como conceptos explícitos.
 * - baseVerbId reemplaza semánticamente a la relación ambigua verbeBase.
 * - auxiliaire y participePasse siguen siendo propiedades del verbo.
 * - las formas históricas (formes) se conservan por compatibilidad, pero no
 *   forman parte de la autoridad conceptual del nuevo modelo.
 * - no se infieren familias nuevas a partir de sufijos, prefijos o patterns.
 * - los familyId todavía no declarados explícitamente permanecen en null;
 *   la migración del catálogo de familias será el siguiente bloque.
 */
(function(){
  const rawVerbs=window.COQ_VERBS||{};
  const familyCatalog=window.COQ_VERB_FAMILY_CATALOG||{};
  const constructionCatalog=window.COQ_VERB_CONSTRUCTION_CATALOG||{};

  const sourceKeys=new Set([
    ...Object.keys(rawVerbs),
    ...Object.keys(familyCatalog),
    ...Object.keys(constructionCatalog)
  ]);

  const records={};

  function clone(value){
    if(Array.isArray(value))return value.map(clone);
    if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,clone(v)]));
    return value;
  }

  function deepFreeze(value){
    if(value&&typeof value==='object'&&!Object.isFrozen(value)){
      Object.values(value).forEach(deepFreeze);
      Object.freeze(value);
    }
    return value;
  }

  function normalizeBaseVerbId(record,key){
    const candidate=String(record?.verbeBase||'').trim();
    if(!candidate||candidate===key)return null;
    return candidate;
  }

  sourceKeys.forEach(key=>{
    const raw=rawVerbs[key]||{};
    const family=familyCatalog[key]||{};
    const construction=constructionCatalog[key]||{};
    const merged={...raw,...family,...construction};
    const familyId=typeof merged.familyId==='string'&&merged.familyId.trim()?merged.familyId.trim():null;
    const patternId=typeof merged.patternId==='string'&&merged.patternId.trim()
      ?merged.patternId.trim()
      :(typeof merged.pattern==='string'&&merged.pattern.trim()?merged.pattern.trim():null);
    const baseVerbId=normalizeBaseVerbId(merged,key);

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
      variantes:merged.variantes||null,
      exceptions:merged.exceptions||null,
      // Compatibilidad únicamente: no es fuente de verdad del nuevo modelo.
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
})();
