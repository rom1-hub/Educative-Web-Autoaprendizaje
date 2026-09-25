const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const context=vm.createContext({window:{},console,Object,Array,Set,Map,String,Number,Boolean,RegExp,JSON});
const load=file=>vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
load('data/verbs/pronominal-catalog.js');
load('data/verbs/local-database.js');
const verbs=context.window.COQ_VERBS;
const catalog=context.window.COQ_PRONOMINAL_CATALOG||[];
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
assert(verbs&&typeof verbs==='object','La base local debe exponer COQ_VERBS.');
const keys=Object.keys(verbs);
assert(keys.length>=7000,'La base local debe contener el catálogo completo.');
assert(catalog.length===109,'El catálogo pedagógico debe contener 105 verbos pronominales.');
const seen=new Set();
for(const entry of catalog){
  assert(entry&&entry.infinitif&&entry.base,'Entrada pronominal incompleta.');
  assert(!seen.has(entry.infinitif),'Verbo pronominal duplicado: '+entry.infinitif);
  seen.add(entry.infinitif);
  const record=verbs[entry.infinitif];
  assert(record&&record.pronominal===true,entry.infinitif+' debe estar en la base local como pronominal.');
  assert(record.construction==='pronomiale',entry.infinitif+' debe tener construcción pronomiale.');
  assert(record.infinitif_base,'Falta infinitif_base en '+entry.infinitif);
  assert(record.auxiliaire==='être',entry.infinitif+' debe usar être.');
  assert(record.formes&&record.formes["présent de l'indicatif"],'Falta el presente de '+entry.infinitif+'.');
}
assert(verbs['servir']&&!verbs['servir'].pronominal,'servir no debe clasificarse como pronominal.');
assert(verbs['se servir']&&verbs['se servir'].pronominal===true,'se servir debe estar en la base local como pronominal.');

// Control lingüístico de grupos: los verbos en -ER son del primer grupo,
// salvo aller y envoyer, que pertenecen al tercero.
const erThirdGroup=keys.filter(key=>/er$/i.test(key)&&Number(verbs[key]?.groupe)===3);
assert(erThirdGroup.every(key=>{
  const base=String(verbs[key]?.infinitif_base||key).trim().toLowerCase();
  return ['aller','envoyer'].includes(base);
}), 'El tercer grupo no puede contener verbos en -ER fuera de aller/envoyer y sus formas pronominales: '+erThirdGroup.slice(0,20).join(', '));
for(const key of ['acheter','appeler','aboyer','aller','envoyer','prendre','finir']){
  assert(verbs[key]&&Number.isFinite(Number(verbs[key].groupe)),'Falta clasificación de grupo para '+key+'.');
}
assert(Number(verbs['acheter'].groupe)===1,'acheter debe pertenecer al primer grupo.');
assert(Number(verbs['appeler'].groupe)===1,'appeler debe pertenecer al primer grupo.');
assert(Number(verbs['aboyer'].groupe)===1,'aboyer debe pertenecer al primer grupo.');
assert(Number(verbs['aller'].groupe)===3,'aller debe pertenecer al tercer grupo.');
assert(Number(verbs['envoyer'].groupe)===3,'envoyer debe pertenecer al tercer grupo.');
assert(Number(verbs['prendre'].groupe)===3,'prendre debe pertenecer al tercer grupo.');
assert(Number(verbs['finir'].groupe)===2,'finir debe pertenecer al segundo grupo.');
const pronominal=keys.filter(key=>verbs[key]?.pronominal===true);
assert(pronominal.length>=catalog.length,'La base debe contener todos los pronominales del catálogo.');
for(const key of pronominal){
  const record=verbs[key];
  assert(record.construction==='pronomiale','Entrada pronominal sin construcción canónica: '+key);
  assert(record.infinitif_base,'Entrada pronominal sin infinitif_base: '+key);
  assert(record.auxiliaire,'Entrada pronominal sin auxiliar: '+key);
}
for(const key of ['être','avoir','prendre','finir','aller','se lever']){
  const record=verbs[key];
  assert(record&&record.formes&&Object.keys(record.formes).length>0,'Faltan conjugaciones locales para '+key+'.');
  assert(record.formes["présent de l'indicatif"],'Falta el presente de '+key+'.');
}
console.log('Local database regression passed: '+keys.length+' verbs, '+pronominal.length+' pronominal entries');
