// COQ — catálogo de familias léxicas.
// Solo registra verbos y metadatos. La generación pertenece al registro de patrones.
(function(){
  const verbs=window.COQ_VERBS||(window.COQ_VERBS={});
  const families={
    'être':{être:['été','avoir']},
    'partir-type':{
      partir:['parti','être'], sortir:['sorti','être'], dormir:['dormi','avoir'], servir:['servi','avoir']
    },
    'suivre-type':{suivre:['suivi','avoir']},
    'ouvrir-type':{
      ouvrir:['ouvert','avoir'], rouvrir:['rouvert','avoir'], couvrir:['couvert','avoir'],
      découvrir:['découvert','avoir'], recouvrir:['recouvert','avoir'], offrir:['offert','avoir'], souffrir:['souffert','avoir']
    },
    'venir-type':{
      venir:['venu','être'], revenir:['revenu','être'], devenir:['devenu','être'], parvenir:['parvenu','être'],
      intervenir:['intervenu','être'], convenir:['convenu','être'], provenir:['provenu','être'], survenir:['survenu','être'], prévenir:['prévenu','avoir']
    },
    'tenir-type':{
      tenir:['tenu','avoir'], retenir:['retenu','avoir'], soutenir:['soutenu','avoir'], obtenir:['obtenu','avoir'],
      maintenir:['maintenu','avoir'], contenir:['contenu','avoir'], détenir:['détenu','avoir'], appartenir:['appartenu','avoir']
    },
    'mettre-type':{
      mettre:['mis','avoir'], remettre:['remis','avoir'], permettre:['permis','avoir'], promettre:['promis','avoir'],
      admettre:['admis','avoir'], transmettre:['transmis','avoir'], soumettre:['soumis','avoir']
    },
    'lire-type':{lire:['lu','avoir'], relire:['relu','avoir']},
    'rire-type':{rire:['ri','avoir'], sourire:['souri','avoir']},
    'vivre-type':{vivre:['vécu','avoir'], revivre:['revécu','avoir'], survivre:['survécu','avoir']},
    'conduire-type':{
      conduire:['conduit','avoir'], traduire:['traduit','avoir'], produire:['produit','avoir'], construire:['construit','avoir'],
      détruire:['détruit','avoir'], réduire:['réduit','avoir'], cuire:['cuit','avoir']
    },
    'courir-type':{courir:['couru','avoir'], accourir:['accouru','avoir'], recourir:['recouru','avoir']},
    'mourir-type':{mourir:['mort','être']},
    'croire-type':{croire:['cru','avoir']},
    'recevoir-type':{recevoir:['reçu','avoir']},
    'connaître-type':{connaître:['connu','avoir'], reconnaître:['reconnu','avoir'], méconnaître:['méconnu','avoir']},
    'paraître-type':{
      paraître:['paru','avoir'], apparaître:['apparu','avoir'], disparaître:['disparu','avoir'],
      reparaître:['reparu','avoir'], transparaître:['transparu','avoir'], comparaître:['comparu','avoir']
    }
  };

  Object.keys(families).forEach(pattern=>{
    Object.keys(families[pattern]).forEach(infinitif=>{
      if(verbs[infinitif]){
        // Las familias son la autoridad para la asignación de patrones y metadatos comunes.
        verbs[infinitif].pattern=pattern;
        verbs[infinitif].auxiliaire=families[pattern][infinitif][1];
        verbs[infinitif].participePasse=families[pattern][infinitif][0];
        return;
      }
      const [participePasse,auxiliaire]=families[pattern][infinitif];
      verbs[infinitif]={
        id:infinitif,
        infinitif,
        infinitif_base:infinitif,
        groupe:3,
        pattern,
        auxiliaire,
        pronominal:false,
        participePasse,
        construction:'non-pronominale',
        verbeBase:infinitif
      };
    });
  });

  // Estas formas -ER se registran explícitamente porque ya pertenecían al catálogo anterior.
  const explicitEr={nettoyer:'nettoyé',essuyer:'essuyé'};
  Object.keys(explicitEr).forEach(infinitif=>{
    if(verbs[infinitif])return;
    verbs[infinitif]={
      id:infinitif,
      infinitif,
      infinitif_base:infinitif,
      groupe:1,
      pattern:'yer',
      auxiliaire:'avoir',
      pronominal:false,
      participePasse:explicitEr[infinitif],
      construction:'non-pronominale',
      verbeBase:infinitif
    };
  });
})();
