const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const context=vm.createContext({window:{},document:{querySelector:()=>null,getElementById:()=>null,querySelectorAll:()=>[]},console,Set,Map,Object,Array,Math,String,Number,Boolean,RegExp,JSON});
const files=['data/verbs/verbs.js','data/verbs/verbs-extended.js','data/verbs/family-catalog.js','data/verbs/canonical-model.js','data/verbs/patterns.js','data/verbs/constructions.js','data/verbs/auxiliaries.js','data/verbs/tense-rules.js','js/conjugaison/utils.js','js/conjugaison/pronouns.js','js/conjugaison/compound-tenses.js','js/conjugaison/agreement.js','js/conjugaison/pattern-registry.js','js/conjugaison/engine.js'];
files.forEach(file=>vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file}));
const w=context.window,engine=w.COQ_CONJ_ENGINE,model=w.COQ_CONJ_DATA_MODEL,C=w.COQ_CONJ_COMPOUND,S=w.COQ_CONJ_PRONOUNS;
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
assert(engine&&model&&C&&S,'El motor, el modelo canónico y los modelos de tiempos/sujetos deben estar disponibles.');
const simpleTenses=(C.simpleTenses||[]).filter(tense=>tense!==undefined);
const records=model.records||{};
const subjects=Array.from(new Set([...(S.simpleFallback||[]),...(S.imperative||[]),...(S.subjonctifSimpleFallback||[])]));
assert(simpleTenses.length>0,'Debe existir al menos un tiempo simple.');
assert(subjects.length>0,'Debe existir un conjunto de sujetos para validar generación simple.');
const failures=[];
Object.keys(records).forEach(verb=>{
  const record=records[verb];
  simpleTenses.forEach(tense=>{
    subjects.forEach(subject=>{
      const baseSubject=typeof subject==='string'?String(subject).split('/')[0].trim():subject;
      const result=engine.conjugate(verb,tense,baseSubject,record.pronominal?'pronomiale':'non-pronomiale');
      if(result===null||result===undefined||String(result)==='')failures.push(`${verb} | ${tense} | ${baseSubject}`);
    });
  });
});
if(failures.length){
  console.error(`Combinaciones simples no generables (${failures.length}): ${failures.slice(0,80).join(' ; ')}`);
  throw new Error(`La cobertura del generador simple no es completa: ${failures.length} combinaciones sin forma generada.`);
}
console.log(`✓ Simple generation coverage regression passed — ${Object.keys(records).length} verbos × ${simpleTenses.length} tiempos simples × ${subjects.length} sujetos.`);
