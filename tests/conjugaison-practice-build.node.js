const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const context={
  window:{},
  document:{readyState:'loading',addEventListener(){},querySelector(){return null;}},
  console,setTimeout,clearTimeout,Promise,Set,Map,Object,Array,Math,String,Number,Boolean,RegExp,JSON
};
context.globalThis=context;
vm.createContext(context);

const files=[
  'data/verbs/local-database.js',
  'data/verbs/local-auxiliary-overrides.js',
  'data/verbs/family-catalog.js',
  'data/verbs/category-catalog.js',
  'data/verbs/pronominal-catalog.js',
  'data/verbs/canonical-model.js',
  'data/verbs/patterns.js',
  'data/verbs/constructions.js',
  'data/verbs/auxiliaries.js',
  'data/verbs/tense-rules.js',
  'js/conjugaison/utils.js',
  'js/conjugaison/pronouns.js',
  'js/conjugaison/compound-tenses.js',
  'js/conjugaison/agreement.js',
  'js/conjugaison/pattern-registry.js',
  'js/conjugaison/engine.js',
  'js/conjugaison/practice.js'
];

files.forEach(file=>vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file}));

const api=context.window.COQ_CONJ_PRACTICE_TESTING;
assert(api,'API de pruebas de práctica no disponible.');
assert.strictEqual(typeof api.buildQuestions,'function','buildQuestions debe estar expuesto para regresión.');

const tenses=context.window.COQ_CONJ_COMPOUND.displayOrder;
for(const tense of tenses){
  const questions=api.buildQuestions('',tense,'all','', '');
  assert.strictEqual(questions.length,20,`El tiempo «${tense}» debe generar 20 preguntas; obtuvo ${questions.length}.`);
  assert(questions.every(q=>q.tense===tense),`Las preguntas de «${tense}» no deben mezclar otros tiempos.`);
}

const allQuestions=api.buildQuestions('',"présent de l'indicatif",'all','','');
assert.strictEqual(allQuestions.length,20,'Todos los grupos debe generar 20 preguntas.');
const allGroups=new Set(allQuestions.map(q=>Number(records[q.verb]?.groupe)));
assert.deepStrictEqual([...allGroups].sort((a,b)=>a-b),[1,2,3],'Todos los grupos debe representar los tres grupos verbales.');

const groupCases=[
  ['groupe-1-all','primer grupo',1],
  ['groupe-2-all','segundo grupo',2],
  ['groupe-3-all','tercer grupo',3]
];
const records=context.window.COQ_CONJ_DATA_MODEL.records;

for(const tense of tenses){
  for(const [id,label,expectedGroup] of groupCases){
    const questions=api.buildQuestions('',tense,id,'','');
    assert.strictEqual(questions.length,20,'El tiempo «'+tense+'» con el '+label+' debe generar 20 preguntas; obtuvo '+questions.length+'.');
    assert(questions.every(q=>q.tense===tense),'El tiempo «'+tense+'» con el '+label+' no debe mezclar otros tiempos.');
    assert(questions.every(q=>Number(records[q.verb]?.groupe)===expectedGroup),'El tiempo «'+tense+'» con el '+label+' no debe incluir verbos de otro grupo.');
  }
}

console.log('conjugaison-practice-build: OK — cada tiempo específico genera 20 preguntas con todos los grupos y respeta los filtros.');
