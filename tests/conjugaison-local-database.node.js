const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'data/verbs/local-database.js'),'utf8');
const context=vm.createContext({window:{},console,Object,Array,Set,Map,String,Number,Boolean,RegExp,JSON});
vm.runInContext(source,context,{filename:'data/verbs/local-database.js'});
const verbs=context.window.COQ_VERBS;
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
assert(verbs&&typeof verbs==='object','La base local debe exponer COQ_VERBS.');
const keys=Object.keys(verbs);
assert(keys.length>=7000,`La base local debe contener el catálogo completo; encontrados ${keys.length}.`);
assert(verbs['servir']&&!verbs['servir'].pronominal,'servir no debe clasificarse como pronominal.');
assert(verbs['se lever']&&verbs['se lever'].pronominal===true,'se lever debe estar marcado como pronominal en la base.');
assert(verbs['se lever'].construction==='pronominale','se lever debe tener construcción pronominale.');
const pronominal=keys.filter(key=>verbs[key]?.pronominal===true);
assert(pronominal.length>0,'La base local debe contener entradas pronominales.');
for(const key of pronominal){
  const record=verbs[key];
  assert(record.construction==='pronominale',`Entrada pronominal sin construcción canónica: ${key}`);
  assert(record.infinitif_base,'Entrada pronominal sin infinitif_base: '+key);
  assert(record.auxiliaire,'Entrada pronominal sin auxiliar: '+key);
}
for(const key of ['être','avoir','prendre','finir','aller','se lever']){
  const record=verbs[key];
  assert(record&&record.formes&&Object.keys(record.formes).length>0,`Faltan conjugaciones locales para ${key}.`);
  assert(record.formes["présent de l'indicatif"],`Falta el presente de ${key}.`);
}
console.log(`✓ Local database regression passed: ${keys.length} verbs, ${pronominal.length} pronominal entries`);
