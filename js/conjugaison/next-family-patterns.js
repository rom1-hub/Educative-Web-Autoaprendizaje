/* COQ — metadatos de familias connaître / paraître.
 * La generación pertenece exclusivamente a COQ_PATTERN_REGISTRY + COQ_CONJ_ENGINE.
 */
(function(){
  const FAMILY_VERBS={
    'connaître-type':{
      connaître:{auxiliaire:'avoir',pp:'connu'},
      reconnaître:{auxiliaire:'avoir',pp:'reconnu'},
      méconnaître:{auxiliaire:'avoir',pp:'méconnu'}
    },
    'paraître-type':{
      paraître:{auxiliaire:'avoir',pp:'paru'},
      apparaître:{auxiliaire:'avoir',pp:'apparu'},
      disparaître:{auxiliaire:'avoir',pp:'disparu'},
      reparaître:{auxiliaire:'avoir',pp:'reparu'},
      transparaître:{auxiliaire:'avoir',pp:'transparu'},
      comparaître:{auxiliaire:'avoir',pp:'comparu'}
    }
  };

  const PATTERN_META={
    'connaître-type':{groupe:3,description:'Famille connaître'},
    'paraître-type':{groupe:3,description:'Famille paraître'}
  };

  window.COQ_VERB_PATTERNS=window.COQ_VERB_PATTERNS||{};
  Object.keys(PATTERN_META).forEach(function(pattern){window.COQ_VERB_PATTERNS[pattern]=PATTERN_META[pattern];});

  function ensureRecord(verb,pattern,meta){
    const verbs=window.COQ_VERBS||(window.COQ_VERBS={});
    const existing=verbs[verb];
    if(existing){
      existing.pattern=pattern;
      existing.auxiliaire=meta.auxiliaire||existing.auxiliaire||'avoir';
      existing.participePasse=meta.pp||existing.participePasse||'';
      return existing;
    }
    return verbs[verb]={id:verb,infinitif:verb,infinitif_base:verb,groupe:3,pattern,auxiliaire:meta.auxiliaire||'avoir',pronominal:false,participePasse:meta.pp||'',construction:'non-pronominale',verbeBase:verb};
  }

  function register(){
    Object.keys(FAMILY_VERBS).forEach(function(pattern){
      Object.keys(FAMILY_VERBS[pattern]).forEach(function(verb){ensureRecord(verb,pattern,FAMILY_VERBS[pattern][verb]);});
    });
    const verbs=window.COQ_VERBS||{};
    const utils=window.COQ_CONJ_UTILS;
    if(utils){Object.assign(utils.conjugations,verbs);Object.assign(utils.verbMeta,verbs);}
  }

  function wait(){
    register();
    if(!window.COQ_PATTERN_REGISTRY&&!wait.done){
      wait.attempts=(wait.attempts||0)+1;
      if(wait.attempts<100)setTimeout(wait,25);else wait.done=true;
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wait);else wait();
  window.COQ_NEXT_FAMILY_METADATA={register:register,patterns:PATTERN_META,families:FAMILY_VERBS};
})();
