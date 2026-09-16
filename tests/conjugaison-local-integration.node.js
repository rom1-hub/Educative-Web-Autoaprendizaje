const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const context={
  window:{},
  document:{
    querySelector(){return null;},
    querySelectorAll(){return [];},
    addEventListener(){},
  },
  console,
  setTimeout,
  clearTimeout,
};
context.globalThis=context;
vm.createContext(context);

const files=[
  'data/verbs/local-database.js',
  'data/verbs/family-catalog.js',
  'data/verbs/canonical-model.js',
  'data/verbs/constructions.js',
  'data/verbs/auxiliaries.js',
  'data/verbs/tense-rules.js',
  'js/conjugaison/utils.js',
  'js/conjugaison/pronouns.js',
  'js/conjugaison/compound-tenses.js',
  'js/conjugaison/agreement.js',
  'js/conjugaison/pattern-registry.js',
  'js/conjugaison/engine.js',
  'js/conjugaison/lookup.js',
  'js/conjugaison/practice.js',
];

files.forEach(file=>vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file}));

const db=context.window.COQ_VERBS;
const model=context.window.COQ_CONJ_DATA_MODEL;
const engine=context.window.COQ_CONJ_ENGINE;
const presentKey="présent de l'indicatif";

assert.ok(db&&Object.keys(db).length>=7000,'La consulta debe partir de la base local completa.');
assert.ok(model&&typeof model.get==='function','El modelo canónico debe leer la base local.');
assert.ok(engine&&typeof engine.conjugate==='function','El motor debe estar conectado al modelo canónico.');

const prendre=model.get('prendre');
assert.ok(prendre,'prendre debe existir en la base local.');
assert.ok(Array.isArray(prendre.conjugations?.[presentKey]),'prendre debe contener su presente en la base local.');
const present=prendre.conjugations[presentKey];
const jeRow=present.find(row=>String(row?.[0]||'').trim()==='je');
assert.ok(jeRow&&jeRow[1],'La forma de je de prendre debe estar almacenada en la base local.');
assert.strictEqual(engine.conjugate('prendre',presentKey,'je'),jeRow[1],'El motor debe usar la forma almacenada en la base local para un tiempo simple.');

const seLever=model.get('se lever');
assert.ok(seLever&&seLever.pronominal===true,'se lever debe conservar su metadata pronominal en la base local.');
assert.strictEqual(engine.conjugate('se lever',presentKey,'je'),'je me lève','El ejercicio debe resolver el verbo pronominal desde los datos locales.');

assert.ok(context.window.COQ_CONJ_LOOKUP&&typeof context.window.COQ_CONJ_LOOKUP.renderConjugation==='function','La consulta debe estar conectada al motor basado en la base local.');
assert.ok(context.window.COQ_CONJ_PRACTICE_TESTING&&typeof context.window.COQ_CONJ_PRACTICE_TESTING.selectPracticeQuestions==='function','La práctica debe conservar su API de ejercicio.');

console.log(`conjugaison-local-integration: OK (${Object.keys(db).length} verbos locales)`);
