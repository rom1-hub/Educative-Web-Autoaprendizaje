/* COQ — Adaptador de datos de conjugación open-source.
 * Fuente: conjugation-fr 0.3.4 (Verbiste), GPL-2.0-or-later.
 * Descarga los JSON de plantillas y verbos y los normaliza al contrato COQ.
 * La aplicación conserva su UI y su motor de ejercicios; solo cambia la fuente de datos.
 */
(function(){
  const VERSION='0.3.4';
  const BASE=`https://cdn.jsdelivr.net/npm/conjugation-fr@${VERSION}/`;
  const urls={verbs:BASE+'verbs-fr.json',templates:BASE+'conjugation-fr.json'};

  function valueOf(value){
    if(Array.isArray(value))return value[0]??'';
    if(value&&typeof value==='object'&&'i' in value)return valueOf(value.i);
    return String(value??'');
  }
  function variantsOf(value){
    const raw=Array.isArray(value)?value:(value&&typeof value==='object'&&'i' in value?value.i:value);
    return Array.isArray(raw)?raw.map(String):[String(raw??'')];
  }
  function applyTemplate(verb,template,ending){
    const parts=String(template||'').split(':');
    const templateSuffix=parts.length>1?parts.slice(1).join(':'):String(template||'');
    const prefix=parts.length>1?parts[0]:'';
    const forms=variantsOf(ending).filter(Boolean);
    if(prefix==='')return forms;
    const stem=String(verb).endsWith(templateSuffix)?String(verb).slice(0,-templateSuffix.length):prefix;
    return forms.map(form=>stem+form);
  }
  function firstForm(verb,template,value){return applyTemplate(verb,template,value)[0]||'';}
  function category(verb,template,group){
    const v=String(verb);
    if(group===1){
      if(/ger$/i.test(v))return 'GER';
      if(/cer$/i.test(v))return 'CER';
      if(/eler$/i.test(v))return 'ELER';
      if(/eter$/i.test(v))return 'ETER';
      if(/yer$/i.test(v))return 'YER';
      if(/e[^aeiouyàâäéèêëîïôöùûüÿç]{1}er$/i.test(v))return 'E_ACUTE_CONSONANT_ER';
      return 'NORMAL';
    }
    if(group===3){
      if(/(?:e|a|o)indre$/i.test(v))return 'EINDRE_AINDRE_OINDRE';
      if(/uire$/i.test(v))return 'UIRE';
      if(/aître$/i.test(v))return 'AITRE';
      if(/dre$/i.test(v))return 'DRE';
      if(/ir$/i.test(v))return 'IR_THIRD';
      return 'IRREGULAR';
    }
    return group===2?'IR_SECOND':null;
  }
  function familyId(group,cat){
    if(group===1){
      return ({NORMAL:'er-regular',GER:'er-ger',CER:'er-cer',ELER:'er-eler',ETER:'er-eter',YER:'yer','E_ACUTE_CONSONANT_ER':'er-e-accent'})[cat]||'er-regular';
    }
    if(group===2)return 'ir-regular-2';
    return 'groupe-3';
  }
  function normalize(verbs,templates){
    const out={};
    Object.entries(verbs||{}).forEach(([verb,meta])=>{
      const template=meta?.t;
      const data=templates?.[template];
      if(!data)return;
      const group=template==='fin:ir'?2:(/er$/i.test(verb)&&verb!=='aller'?1:3);
      const cat=category(verb,template,group);
      const aux=Array.isArray(meta?.aux)?meta.aux:[meta?.aux||'avoir'];
      const formes={};
      const put=(label,mode,tense)=>{
        const rows=data?.[mode]?.[tense];
        if(!Array.isArray(rows)||rows.length<3)return;
        const values=rows.slice(0,6).map(row=>firstForm(verb,template,row?.i??row));
        if(values.some(Boolean))formes[label]=values;
      };
      put("présent de l'indicatif",'indicative','present');
      put('imparfait','indicative','imperfect');
      put('futur simple','indicative','future');
      put('passé simple','indicative','simple-past');
      put('conditionnel présent','conditional','present');
      put('subjonctif présent','subjunctive','present');
      put('subjonctif imparfait','subjunctive','imperfect');
      put('impératif présent','imperative','imperative-present');
      const pp=data?.participle?.['past-participle'];
      const participePasse=firstForm(verb,template,pp?.[0]?.i??pp?.[0]??'');
      const variants={};
      Object.entries(formes).forEach(([tense,values])=>{
        const raw=data?.[tense.includes('indicatif')?'indicative':tense.includes('conditionnel')?'conditional':tense.includes('subjonctif')?'subjunctive':tense.includes('impératif')?'imperative':'']?.[({"présent de l'indicatif":'present',imparfait:'imperfect','futur simple':'future','passé simple':'simple-past','conditionnel présent':'present','subjonctif présent':'present','subjonctif imparfait':'imperfect','impératif présent':'imperative-present'})[tense]];
        if(!raw)return;
        raw.forEach((row,index)=>{
          const vs=variantsOf(row?.i??row).map(v=>firstForm(verb,template,v)).filter(Boolean);
          if(vs.length>1)variants[`${tense}:${index}`]=vs;
        });
      });
      out[verb]={
        id:verb,
        infinitif:verb,
        infinitif_base:verb,
        groupe:group,
        pattern:template,
        patternId:template,
        familyId:familyId(group,cat),
        sub_category:cat,
        auxiliaire:aux[0],
        auxiliaires:aux,
        pronominal:false,
        participePasse,
        formes,
        variantes:Object.keys(variants).length?variants:null,
        construction:'non-pronominale',
        verbeBase:verb,
        formePronominale:null,
        source:{name:'conjugation-fr',version:VERSION,base:'Verbiste'}
      };
    });
    return out;
  }

  const existing=window.COQ_VERBS||{};
  window.COQ_VERB_PROVIDER_READY=Promise.all([fetch(urls.verbs).then(r=>{if(!r.ok)throw new Error(`verbs-fr.json HTTP ${r.status}`);return r.json();}),fetch(urls.templates).then(r=>{if(!r.ok)throw new Error(`conjugation-fr.json HTTP ${r.status}`);return r.json();})])
    .then(([verbs,templates])=>{
      const normalized=normalize(verbs,templates);
      window.COQ_VERBS=normalized;
      window.COQ_VERB_PROVIDER_STATUS=Object.freeze({ready:true,count:Object.keys(normalized).length,source:'conjugation-fr',version:VERSION});
      return normalized;
    })
    .catch(error=>{
      console.error('[COQ] No se pudo cargar la base open-source; se mantiene el dataset local.',error);
      window.COQ_VERBS=existing;
      window.COQ_VERB_PROVIDER_STATUS=Object.freeze({ready:false,count:Object.keys(existing).length,source:'local-fallback',error:String(error?.message||error)});
      return existing;
    });
})();