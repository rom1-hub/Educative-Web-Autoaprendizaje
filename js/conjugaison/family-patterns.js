/* COQ — metadatos de familias irregulares del 3.º grupo.
 *
 * Responsabilidad exclusiva:
 * - registrar metadatos mínimos de verbos pertenecientes a familias
 * - asociar cada verbo a un patrón del registro central
 *
 * La generación de formas pertenece a COQ_PATTERN_REGISTRY + COQ_CONJ_ENGINE.
 * Este módulo NO modifica métodos del motor y NO contiene lógica de presentación.
 */
(function(){
  const FAMILY_VERBS={
    'partir-type':{
      partir:{auxiliaire:'être',pp:'parti'},sortir:{auxiliaire:'être',pp:'sorti'},dormir:{auxiliaire:'avoir',pp:'dormi'},servir:{auxiliaire:'avoir',pp:'servi'}
    },
    'suivre-type':{suivre:{auxiliaire:'avoir',pp:'suivi'}},
    'ouvrir-type':{
      ouvrir:{auxiliaire:'avoir',pp:'ouvert'},rouvrir:{auxiliaire:'avoir',pp:'rouvert'},couvrir:{auxiliaire:'avoir',pp:'couvert'},découvrir:{auxiliaire:'avoir',pp:'découvert'},recouvrir:{auxiliaire:'avoir',pp:'recouvert'},offrir:{auxiliaire:'avoir',pp:'offert'},souffrir:{auxiliaire:'avoir',pp:'souffert'}
    },
    'venir-type':{
      venir:{auxiliaire:'être',pp:'venu'},revenir:{auxiliaire:'être',pp:'revenu'},devenir:{auxiliaire:'être',pp:'devenu'},parvenir:{auxiliaire:'être',pp:'parvenu'},intervenir:{auxiliaire:'être',pp:'intervenu'},convenir:{auxiliaire:'être',pp:'convenu'},provenir:{auxiliaire:'être',pp:'provenu'},survenir:{auxiliaire:'être',pp:'survenu'},prévenir:{auxiliaire:'avoir',pp:'prévenu'}
    },
    'tenir-type':{
      tenir:{auxiliaire:'avoir',pp:'tenu'},retenir:{auxiliaire:'avoir',pp:'retenu'},soutenir:{auxiliaire:'avoir',pp:'soutenu'},obtenir:{auxiliaire:'avoir',pp:'obtenu'},maintenir:{auxiliaire:'avoir',pp:'maintenu'},contenir:{auxiliaire:'avoir',pp:'contenu'},détenir:{auxiliaire:'avoir',pp:'détenu'},appartenir:{auxiliaire:'avoir',pp:'appartenu'}
    }
  };

  const PATTERN_META={
    'partir-type':{groupe:3,description:'Famille partir'},
    'suivre-type':{groupe:3,description:'Famille suivre'},
    'ouvrir-type':{groupe:3,description:'Famille ouvrir'},
    'venir-type':{groupe:3,description:'Famille venir'},
    'tenir-type':{groupe:3,description:'Famille tenir'},
    'aller-type':{groupe:3,description:'Verbe aller'}
  };

  window.COQ_VERB_PATTERNS=window.COQ_VERB_PATTERNS||{};
  Object.keys(PATTERN_META).forEach(function(pattern){window.COQ_VERB_PATTERNS[pattern]=PATTERN_META[pattern];});

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
    ensureRecord('aller','aller-type',{auxiliaire:'être',pp:'allé'});

    const verbs=window.COQ_VERBS||{};
    const utils=window.COQ_CONJ_UTILS;
    if(utils){
      Object.assign(utils.conjugations,verbs);
      Object.assign(utils.verbMeta,verbs);
    }
  }

  function syncWhenReady(){
    register();
    if(!window.COQ_PATTERN_REGISTRY){
      if((syncWhenReady.attempts||0)<100){
        syncWhenReady.attempts=(syncWhenReady.attempts||0)+1;
        setTimeout(syncWhenReady,25);
      }
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',syncWhenReady);else syncWhenReady();
  window.COQ_FAMILY_METADATA={register:register,patterns:PATTERN_META,families:FAMILY_VERBS};
})();
