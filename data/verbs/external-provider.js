/* COQ — proveedor externo de verbos.
 * Fuente: gauthier-th/conjugation-fr (Verbiste).
 * Convierte el dataset de patrones en el contrato COQ existente.
 * No modifica la UI ni el motor de ejercicios.
 */
(function(){
  const VERBS_URL='https://raw.githubusercontent.com/gauthier-th/conjugation-fr/master/verbs-fr.json';
  const CONJ_URL='https://raw.githubusercontent.com/gauthier-th/conjugation-fr/master/conjugation-fr.json';
  const SIMPLE={
    'présent de l\'indicatif':['indicative','present'],
    'imparfait':['indicative','imperfect'],
    'futur simple':['indicative','future'],
    'conditionnel présent':['conditional','present'],
    'subjonctif présent':['subjunctive','present'],
    'impératif présent':['imperative','imperative-present']
  };
  const PRONOUNS=['je','tu','il/elle/on','nous','vous','ils/elles'];
  function groupOf(infinitif,t){
    if(t==='fin:ir')return 2;
    if(/:er$/.test(t))return 1;
    return 3;
  }
  function subCategoryOf(infinitif,t,group){
    if(group===1){
      if(/:ger$/.test(t))return 'GER';
      if(/:cer$/.test(t))return 'CER';
      if(/yer$/i.test(infinitif))return 'YER';
      if(/eler$/i.test(infinitif))return 'ELER';
      if(/eter$/i.test(infinitif))return 'ETER';
      if(/e[^aeiouy]er$/i.test(infinitif))return 'E_ACUTE_CONSONANT_ER';
      return 'NORMAL';
    }
    if(group===2)return 'IR_SECOND';
    if(/dre$/i.test(infinitif))return 'DRE';
    if(/uir(e)?$/i.test(infinitif))return 'UIRE';
    if(/a[iî]tre$/i.test(infinitif))return 'AITRE';
    if(/(?:eindre|aindre|oindre)$/i.test(infinitif))return 'EINDRE_AINDRE_OINDRE';
    if(/ir$/i.test(infinitif))return 'IR_THIRD';
    return 'IRREGULAR';
  }
  function stem(infinitif,t){
    if(typeof t!=='string'||!t.includes(':'))return '';
    const suffix=t.slice(t.indexOf(':')+1);
    return infinitif.endsWith(suffix)?infinitif.slice(0,-suffix.length):infinitif;
  }
  function termText(term,ant){
    if(!term)return '';
    const value=term.i!==undefined?term.i:term[Object.keys(term)[0]];
    if(Array.isArray(value))return value.map(v=>ant+v).join('/');
    return typeof value==='string'?ant+value:'';
  }
  function formsFor(infinitif,t,conjugation){
    const pattern=conjugation[t];if(!pattern)return {};
    const ant=stem(infinitif,t),formes={};
    Object.entries(SIMPLE).forEach(([coq,[mode,tense]])=>{
      const terms=pattern?.[mode]?.[tense];if(!Array.isArray(terms))return;
      formes[coq]=terms.map((term,i)=>[PRONOUNS[i]||'',termText(term,ant)]);
    });
    const pp=pattern?.participle?.['past-participle'];
    if(pp){
      const value=Array.isArray(pp)?pp[0]?.i:pp.i;
      const past=Array.isArray(value)?value[0]:value;
      if(typeof past==='string')formes.participePasse=ant+past;
    }
    return formes;
  }
  function normalize(record,infinitif,conjugation){
    const t=record?.t,group=groupOf(infinitif,t),formes=formsFor(infinitif,t,conjugation),aux=Array.isArray(record?.aux)?record.aux:[record?.aux].filter(Boolean);
    return {
      id:infinitif,infinitif,infinitif_base:infinitif,groupe:group,sub_category:subCategoryOf(infinitif,t,group),
      pattern:t,patternId:'external:'+t,auxiliaire:aux[0]||null,auxiliaires:aux,
      pronominal:false,construction:'non-pronominale',participePasse:formes.participePasse||null,
      formes:Object.fromEntries(Object.entries(formes).filter(([k])=>k!=='participePasse')),
      source:'conjugation-fr/Verbiste'
    };
  }
  async function load(){
    try{
      const [vr,cr]=await Promise.all([fetch(VERBS_URL,{cache:'no-cache'}),fetch(CONJ_URL,{cache:'no-cache'})]);
      if(!vr.ok||!cr.ok)throw new Error('No se pudo descargar la base externa de verbos.');
      const [verbs,conjugation]=await Promise.all([vr.json(),cr.json()]);
      const external={};
      Object.keys(verbs||{}).forEach(infinitif=>{
        const normalized=normalize(verbs[infinitif],infinitif,conjugation);
        if(Object.keys(normalized.formes).length)external[infinitif]=normalized;
      });
      const local=window.COQ_VERBS||{};
      const merged={...local,...external};
      window.COQ_VERBS=merged;
      window.COQ_VERB_PROVIDER_STATS={source:'conjugation-fr/Verbiste',count:Object.keys(external).length,localCount:Object.keys(local).length};
      return merged;
    }catch(error){
      console.error('[COQ] No se pudo cargar la base externa:',error);
      return window.COQ_VERBS||{};
    }
  }
  window.COQ_VERB_PROVIDER_READY=load();
})();