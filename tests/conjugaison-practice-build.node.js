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
  assert.strictEqual(questions.length,20,\`El tiempo «${tense}» debe generar 20 preguntas; obtuvo ${questions.length}.\`);
  assert(questions.every(q=>q.tense===tense),\`Las preguntas de «${tense}» no deben mezclar otros tiempos.\`);
}

for(const [id,label] of [
  ['groupe-1-all','primer grupo'],
  ['groupe-2-all','segundo grupo'],
  ['groupe-3-all','tercer grupo']
]){
  const questions=api.buildQuestions('',"présent de l'indicatif",id,'','');
  assert.strictEqual(questions.length,20,\`El ${label} debe generar 20 preguntas.\`);
  const records=context.window.COQ_CONJ_DATA_MODEL.records;
  assert(questions.every(q=>Number(records[q.verb]?.groupe)==={"groupe-1-all":1,"groupe-2-all":2,"groupe-3-all":3}[id]),\`El ${label} no debe incluir verbos de otro grupo.\`);
}

console.log('conjugaison-practice-build: OK — todos los tiempos específicos generan 20 preguntas y respetan los filtros.');
