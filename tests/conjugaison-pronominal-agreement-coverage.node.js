const fs=require('fs');
const vm=require('vm');
const context={window:{},console};
vm.createContext(context);
['data/verbs/pronominal-catalog.js','data/verbs/constructions.js'].forEach(file=>vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file}));
const catalog=context.window.COQ_PRONOMINAL_CATALOG||[];
const rules=context.window.COQ_PRONOMINAL_RULES||{};
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
assert(catalog.length===99,`El catálogo pronominal debe contener 99 verbos; obtenido ${catalog.length}.`);
assert(Object.keys(rules).length===catalog.length,`Cada pronominal debe tener una regla explícita de concordancia: ${Object.keys(rules).length}/${catalog.length}.`);
for(const entry of catalog){
  const rule=rules[entry.base];
  assert(rule,`Falta regla de concordancia para ${entry.infinitif} (${entry.base}).`);
  assert(['COD','COI','aucune'].includes(rule.fonctionDeSe),`Función de se inválida para ${entry.infinitif}: ${rule.fonctionDeSe}`);
  assert(['sujet','aucun'].includes(rule.accord),`Política de concordancia inválida para ${entry.infinitif}: ${rule.accord}`);
}
assert(rules.parler?.fonctionDeSe==='COI'&&rules.parler?.accord==='aucun','se parler debe permanecer sin concordancia: se es COI.');
assert(rules.téléphoner?.fonctionDeSe==='COI'&&rules.téléphoner?.accord==='aucun','se téléphoner debe permanecer sin concordancia: se es COI.');
assert(rules.demander?.fonctionDeSe==='COI'&&rules.demander?.accord==='aucun','se demander debe permanecer sin concordancia en su construcción pedagógica canónica.');
assert(rules.douter?.fonctionDeSe==='COI'&&rules.douter?.accord==='aucun','se douter debe permanecer sin concordancia.');
assert(rules.lever?.accord==='sujet','se lever debe concordar con el sujeto.');
assert(rules.inscrire?.accord==='sujet','s’inscrire debe concordar con el sujeto.');
assert(rules.réveiller?.accord==='sujet','se réveiller debe concordar con el sujeto.');
assert(rules.essuyer?.accord==='sujet','s’essuyer debe concordar con el sujeto.');
console.log(`✓ Concordance pronominale complète: ${catalog.length}/${catalog.length} verbes couverts.`);
