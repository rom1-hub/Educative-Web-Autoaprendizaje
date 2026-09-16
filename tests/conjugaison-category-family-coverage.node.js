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
const categoryIds=new Set(categories.map(category=>category.id));
assert(categoryIds.has('all'),'El catálogo debe conservar la categoría global all.');
const familyReferences=new Set();
categories.forEach(category=>{
  (category.familyIds||[]).forEach(familyId=>{
    assert(families[familyId],`La categoría ${category.id} referencia una familia inexistente: ${familyId}.`);
    familyReferences.add(familyId);
  });
});
Object.keys(families).forEach(familyId=>assert(familyReferences.has(familyId)||Object.values(families).some(family=>family.id===familyId),`Familia ${familyId} no encontrada en el catálogo de familias.`));
console.log(`✓ Category-family catalog regression passed — ${Object.keys(families).length} familias y ${categories.length} categorías válidas.`);