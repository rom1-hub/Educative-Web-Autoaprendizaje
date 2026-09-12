const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const context=vm.createContext({window:{},console,Object,Array,Set,Map,String,Number,Boolean,RegExp,JSON});
[
  'data/verbs/verbs.js',
  'data/verbs/verbs-extended.js',
  'data/verbs/family-catalog.js',
  'data/verbs/canonical-model.js',
  'data/verbs/patterns.js',
  'js/conjugaison/pattern-registry.js'
].forEach(file=>vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file}));
const w=context.window;
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const catalog=w.COQ_VERBS||{};
const model=w.COQ_CONJ_DATA_MODEL;
const patterns=w.COQ_VERB_PATTERNS||{};
const registry=w.COQ_PATTERN_REGISTRY||{};
assert(model&&typeof model.get==='function','El modelo canónico debe exponer get().');
assert(typeof registry.get==='function','El registro de patterns debe exponer get().');
assert(Object.keys(catalog).length>0,'El catálogo de verbos no debe estar vacío.');
const validConstructions=new Set(['non-pronomiale','pronomiale']);
Object.keys(catalog).forEach(key=>{
  const raw=catalog[key]||{};
  const record=model.get(key);
  assert(record,`Falta registro canónico para ${key}.`);
  assert(record.id===raw.id||record.id===key,`ID canónico incoherente para ${key}.`);
  assert(record.infinitif,`Falta infinitif canónico para ${key}.`);
  assert(record.infinitifBase,`Falta infinitifBase canónico para ${key}.`);
  assert(Number.isFinite(record.groupe),`Falta groupe canónico para ${key}.`);
  assert(typeof record.familyId==='string'&&record.familyId,`Falta familyId canónico para ${key}.`);
  assert(typeof record.patternId==='string'&&record.patternId,`Falta patternId canónico para ${key}.`);
  assert(patterns[record.patternId],`El pattern ${record.patternId} de ${key} no existe en el catálogo.`);
  assert(registry.get(record.patternId)&&typeof registry.get(record.patternId).generate==='function',`El pattern ${record.patternId} de ${key} no tiene generador.`);
  assert(validConstructions.has(record.construction),`Construcción inválida para ${key}: ${record.construction}.`);
  assert(typeof record.pronominal==='boolean',`pronominal debe ser booleano para ${key}.`);
  assert(!Object.prototype.hasOwnProperty.call(record,'formes'),`El modelo canónico no debe exponer formas conjugadas legacy para ${key}.`);
  if(record.pronominal){
    assert(record.baseVerbId&&model.get(record.baseVerbId),`El verbo pronominal ${key} debe apuntar a un verbo base válido.`);
  }
});
console.log(`✓ Canonical integrity regression passed (${Object.keys(catalog).length} verb records)`);
