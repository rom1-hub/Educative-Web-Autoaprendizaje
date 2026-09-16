/* COQ — Construcción de base local de verbos.
 * Fuente: conjugation-fr / Verbiste.
 * La aplicación no consulta la fuente externa en producción.
 * Este script descarga los dos datasets, los normaliza al contrato COQ y
 * escribe data/verbs/local-database.js para versionarlo en el repositorio.
 */
const fs=require('fs');
const path=require('path');

const VERSION='0.3.4';
const BASE=`https://cdn.jsdelivr.net/npm/conjugation-fr@${VERSION}/`;
const URLS={verbs:BASE+'verbs-fr.json',templates:BASE+'conjugation-fr.json'};
const OUT=path.resolve(__dirname,'../data/verbs/local-database.js');
const SIMPLE={
  "présent de l'indicatif":['indicative','present'],
  'passé simple':['indicative','simple-past'],
  'imparfait':['indicative','imperfect'],
  'futur simple':['indicative','future'],
  'conditionnel présent':['conditional','present'],
  'subjonctif présent':['subjunctive','present'],
  'subjonctif imparfait':['subjunctive','imperfect'],
  'impératif présent':['imperative','imperative-present']
};
const PRONOUNS=['je','tu','il/elle/on','nous','vous','ils/elles'];

async function getJson(url){
  const response=await fetch(url,{headers:{'user-agent':'COQ-local-database-builder'}});
  if(!response.ok)throw new Error(`${url} HTTP ${response.status}`);
  return response.json();
}
function groupOf(template,verb){
  if(template==='fin:ir')return 2;
  if(/:er$/i.test(String(template||'')) && verb!=='aller')return 1;
  return 3;
}
function category(verb,group){
  if(group===1){
    if(/ger$/i.test(verb))return 'GER';
    if(/cer$/i.test(verb))return 'CER';
    if(/eler$/i.test(verb))return 'ELER';
    if(/eter$/i.test(verb))return 'ETER';
    if(/yer$/i.test(verb))return 'YER';
    if(/e[^aeiouyàâäéèêëîïôöùûüÿç]er$/i.test(verb))return 'E_ACUTE_CONSONANT_ER';
    return 'NORMAL';
  }
  if(group===2)return 'IR_SECOND';
  if(/(?:eindre|aindre|oindre)$/i.test(verb))return 'EINDRE_AINDRE_OINDRE';
  if(/uire$/i.test(verb))return 'UIRE';
  if(/aître$/i.test(verb))return 'AITRE';
  if(/dre$/i.test(verb))return 'DRE';
  if(/ir$/i.test(verb))return 'IR_THIRD';
  return 'IRREGULAR';
}
function familyId(group,cat){
  if(group===1)return ({NORMAL:'er-regular',GER:'er-ger',CER:'er-cer',ELER:'er-eler',ETER:'er-eter',YER:'yer','E_ACUTE_CONSONANT_ER':'er-e-accent'})[cat]||'er-regular';
  if(group===2)return 'ir-regular-2';
  return 'groupe-3';
}
function variants(value){
  const raw=Array.isArray(value)?value:(value&&typeof value==='object'&&'i' in value?value.i:value);
  return (Array.isArray(raw)?raw:[raw]).filter(v=>v!=null).map(String);
}
function applyTemplate(verb,template,value){
  const parts=String(template||'').split(':');
  const suffix=parts.length>1?parts.slice(1).join(':'):'';
  const forms=variants(value).filter(Boolean);
  const stem=suffix&&String(verb).endsWith(suffix)?String(verb).slice(0,-suffix.length):String(verb);
  return forms.map(form=>stem+form);
}
function normalize(verbs,templates){
  const out={};
  Object.entries(verbs||{}).forEach(([verb,meta])=>{
    const template=meta?.t;
    const data=templates?.[template];
    if(!data)return;
    const group=groupOf(template,verb);
    const aux=Array.isArray(meta?.aux)?meta.aux:[meta?.aux||'avoir'];
    const formes={};
    for(const [label,[mode,tense]] of Object.entries(SIMPLE)){
      const rows=data?.[mode]?.[tense];
      if(!Array.isArray(rows)||rows.length<3)continue;
      formes[label]=rows.slice(0,6).map((row)=>applyTemplate(verb,template,row?.i??row)[0]||'');
    }
    const pp=applyTemplate(verb,template,data?.participle?.['past-participle']?.[0]?.i??data?.participle?.['past-participle']?.[0]??'')[0]||null;
    out[verb]={
      id:verb,
      infinitif:verb,
      infinitif_base:verb,
      groupe:group,
      familyId:familyId(group,category(verb,group)),
      sub_category:category(verb,group),
      pattern:template,
      patternId:template,
      auxiliaire:aux[0]||null,
      auxiliaires:aux,
      pronominal:false,
      construction:'non-pronominale',
      participePasse:pp,
      formes,
      variantes:null,
      exceptions:null,
      formePronominale:null,
      formeNonPronominale:null,
      source:{name:'conjugation-fr',version:VERSION,base:'Verbiste'}
    };
  });
  return out;
}
function sortObject(value){return Object.fromEntries(Object.keys(value).sort((a,b)=>a.localeCompare(b,'fr')).map(key=>[key,value[key]]));}
(async()=>{
  const [verbs,templates]=await Promise.all([getJson(URLS.verbs),getJson(URLS.templates)]);
  const data=sortObject(normalize(verbs,templates));
  const payload=`/* AUTO-GENERATED — do not edit manually. Source: conjugation-fr ${VERSION} / Verbiste. */\nwindow.COQ_VERBS_LOCAL=${JSON.stringify(data)};\nwindow.COQ_VERB_DATABASE_VERSION=${JSON.stringify(VERSION)};\n`;
  fs.mkdirSync(path.dirname(OUT),{recursive:true});
  fs.writeFileSync(OUT,payload,'utf8');
  console.log(`Generated ${Object.keys(data).length} verbs at ${OUT}`);
})();
