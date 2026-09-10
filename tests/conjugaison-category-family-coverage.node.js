const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const context=vm.createContext({window:{},document:{querySelector:()=>null,getElementById:()=>null,querySelectorAll:()=>[]},console,Set,Map,Object,Array,Math,String,Number,Boolean,RegExp,JSON});
const files=['data/verbs/verbs.js','data/verbs/verbs-extended.js','data/verbs/family-catalog.js','data/verbs/category-catalog.js','data/verbs/canonical-model.js'];
files.forEach(file=>vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file}));
const w=context.window;
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const families=w.COQ_VERB_FAMILIES||{};
const categories=w.COQ_VERB_CATEGORY_CATALOG||[];
assert(Object.keys(families).length>0,'El catálogo de familias no puede estar vacío.');
const categoryCoverage=new Map(Object.keys(families).map(familyId=>[familyId,0]));
categories.filter(category=>category.id!=='all').forEach(category=>{
  (category.familyIds||[]).forEach(familyId=>{
    assert(families[familyId],`La categoría ${category.id} referencia una familia inexistente: ${familyId}.`);
    categoryCoverage.set(familyId,(categoryCoverage.get(familyId)||0)+1);
  });
});
Object.entries(families).forEach(([familyId,family])=>{
  assert(categoryCoverage.get(familyId)>0,`La familia ${familyId} (${family.patternId}) debe estar cubierta por al menos una categoría pedagógica.`);
});
console.log(`✓ Category-family coverage regression passed — ${Object.keys(families).length} familias cubiertas.`);