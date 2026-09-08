/* COQ — metadatos de familias adicionales del 3.º grupo.
 *
 * Responsabilidad exclusiva:
 * - registrar metadatos mínimos de verbos pertenecientes a familias
 * - asociar cada verbo a un patrón del registro central
 *
 * La generación pertenece exclusivamente a COQ_PATTERN_REGISTRY + COQ_CONJ_ENGINE.
 * Este módulo NO modifica métodos del motor y NO contiene lógica de presentación.
 */
(function(){
  const FAMILY_VERBS={
    'mettre-type':{
      mettre:{auxiliaire:'avoir',pp:'mis'},
      remettre:{auxiliaire:'avoir',pp:'remis'},
      permettre:{auxiliaire:'avoir',pp:'permis'},
      promettre:{auxiliaire:'avoir',pp:'promis'},
      admettre:{auxiliaire:'avoir',pp:'admis'},
      transmettre:{auxiliaire:'avoir',pp:'transmis'},
      soumettre:{auxiliaire:'avoir',pp:'soumis'}
    },
    'lire-type':{
      lire:{auxiliaire:'avoir',pp:'lu'},
      relire:{auxiliaire:'avoir',pp:'relu'}
    },
    'rire-type':{
      rire:{auxiliaire:'avoir',pp:'ri'},
      sourire:{auxiliaire:'avoir',pp:'souri'}
    },
    'vivre-type':{
      vivre:{auxiliaire:'avoir',pp:'vécu'},
      revivre:{auxiliaire:'avoir',pp:'revécu'},
      survivre:{auxiliaire:'avoir',pp:'survécu'}
    },
    'conduire-type':{
      conduire:{auxiliaire:'avoir',pp:'conduit'},
      traduire:{auxiliaire:'avoir',pp:'traduit'},
      produire:{auxiliaire:'avoir',pp:'produit'},
      construire:{auxiliaire:'avoir',pp:'construit'},
      détruire:{auxiliaire:'avoir',pp:'détruit'},
      réduire:{auxiliaire:'avoir',pp:'réduit'},
      cuire:{auxiliaire:'avoir',pp:'cuit'}
    },
    'courir-type':{
      courir:{auxiliaire:'avoir',pp:'couru'},
      accourir:{auxiliaire:'avoir',pp:'accouru'},
      recourir:{auxiliaire:'avoir',pp:'recouru'}
    },
    'mourir-type':{
      mourir:{auxiliaire:'être',pp:'mort'}
    },
    'croire-type':{
      croire:{auxiliaire:'avoir',pp:'cru'}
    },
    'recevoir-type':{
      recevoir:{auxiliaire:'avoir',pp:'reçu'}
    }
  };

  const PATTERN_META={
    'mettre-type':{groupe:3,description:'Famille mettre'},
    'lire-type':{groupe:3,description:'Famille lire'},
    'rire-type':{groupe:3,description:'Famille rire'},
    'vivre-type':{groupe:3,description:'Famille vivre'},
    'conduire-type':{groupe:3,description:'Famille en -UIRE'},
    'courir-type':{groupe:3,description:'Famille courir'},
    'mourir-type':{groupe:3,description:'Verbe mourir'},
    'croire-type':{groupe:3,description:'Famille croire'},
    'recevoir-type':{groupe:3,description:'Famille recevoir'}
  };

  window.COQ_VERB_PATTERNS=window.COQ_VERB_PATTERNS||{};
  Object.keys(PATTERN_META).forEach(function(pattern){
    window.COQ_VERB_PATTERNS[pattern]=PATTERN_META[pattern];
  });

  function ensureRecord(verb,pattern,meta){
    const verbs=window.COQ_VERBS||(window.COQ_VERBS={});
    const existing=verbs[verb];
    if(existing){
      existing.pattern=pattern;
      if(meta.auxiliaire)existing.auxiliaire=meta.auxiliaire;
      if(meta.pp)existing.participePasse=meta.pp;
      return existing;
    }
    return verbs[verb]={
      id:verb,
      infinitif:verb,
      infinitif_base:verb,
      groupe:3,
      pattern:pattern,
      auxiliaire:meta.auxiliaire||'avoir',
      pronominal:false,
      participePasse:meta.pp||'',
      construction:'non-pronominale',
      verbeBase:verb
    };
  }

  function register(){
    Object.keys(FAMILY_VERBS).forEach(function(pattern){
      const family=FAMILY_VERBS[pattern];
      Object.keys(family).forEach(function(verb){ensureRecord(verb,pattern,family[verb]);});
    });
    const verbs=window.COQ_VERBS||{};
    const utils=window.COQ_CONJ_UTILS;
    if(utils){
      Object.assign(utils.conjugations,verbs);
      Object.assign(utils.verbMeta,verbs);
    }
  }

  function waitForRegistry(){
    register();
    if(!window.COQ_PATTERN_REGISTRY&&(waitForRegistry.attempts||0)<100){
      waitForRegistry.attempts=(waitForRegistry.attempts||0)+1;
      setTimeout(waitForRegistry,25);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',waitForRegistry);else waitForRegistry();
  window.COQ_FAMILY_METADATA=window.COQ_FAMILY_METADATA||{};
  window.COQ_FAMILY_METADATA.register=register;
  window.COQ_FAMILY_METADATA.patterns=PATTERN_META;
  window.COQ_FAMILY_METADATA.families=FAMILY_VERBS;
})();
