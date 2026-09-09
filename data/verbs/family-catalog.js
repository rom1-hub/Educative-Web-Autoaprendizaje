// COQ — catálogo declarativo de familias léxicas.
// Este módulo NO modifica COQ_VERBS. Solo publica metadatos que el registro
// normalizado fusionará una vez terminada la carga de datos.
(function(){
  const families={
    'être':{être:['été','avoir']},
    'partir-type':{partir:['parti','être'],sortir:['sorti','être'],dormir:['dormi','avoir'],servir:['servi','avoir']},
    'suivre-type':{suivre:['suivi','avoir']},
    'ouvrir-type':{ouvrir:['ouvert','avoir'],rouvrir:['rouvert','avoir'],couvrir:['couvert','avoir'],découvrir:['découvert','avoir'],recouvrir:['recouvert','avoir'],offrir:['offert','avoir'],souffrir:['souffert','avoir']},
    'venir-type':{venir:['venu','être'],revenir:['revenu','être'],devenir:['devenu','être'],parvenir:['parvenu','être'],intervenir:['intervenu','être'],convenir:['convenu','être'],provenir:['provenu','être'],survenir:['survenu','être'],prévenir:['prévenu','avoir']},
    'tenir-type':{tenir:['tenu','avoir'],retenir:['retenu','avoir'],soutenir:['soutenu','avoir'],obtenir:['obtenu','avoir'],maintenir:['maintenu','avoir'],contenir:['contenu','avoir'],détenir:['détenu','avoir'],appartenir:['appartenu','avoir']},
    'mettre-type':{mettre:['mis','avoir'],remettre:['remis','avoir'],permettre:['permis','avoir'],promettre:['promis','avoir'],admettre:['admis','avoir'],transmettre:['transmis','avoir'],soumettre:['soumis','avoir']},
    'lire-type':{lire:['lu','avoir'],relire:['relu','avoir']},
    'rire-type':{rire:['ri','avoir'],sourire:['souri','avoir']},
    'vivre-type':{vivre:['vécu','avoir'],revivre:['revécu','avoir'],survivre:['survécu','avoir']},
    'conduire-type':{conduire:['conduit','avoir'],traduire:['traduit','avoir'],produire:['produit','avoir'],construire:['construit','avoir'],détruire:['détruit','avoir'],réduire:['réduit','avoir'],cuire:['cuit','avoir']},
    'courir-type':{courir:['couru','avoir'],accourir:['accouru','avoir'],recourir:['recouru','avoir']},
    'mourir-type':{mourir:['mort','être']},
    'croire-type':{croire:['cru','avoir']},
    'recevoir-type':{recevoir:['reçu','avoir']},
    'connaître-type':{connaître:['connu','avoir'],reconnaître:['reconnu','avoir'],méconnaître:['méconnu','avoir']},
    'paraître-type':{paraître:['paru','avoir'],apparaître:['apparu','avoir'],disparaître:['disparu','avoir'],reparaître:['reparu','avoir'],transparaître:['transparu','avoir'],comparaître:['comparu','avoir']},
    'yer-explicit':{nettoyer:['nettoyé','avoir'],essuyer:['essuyé','avoir']}
  };
  const catalog={};
  const baseVerbs=window.COQ_VERBS||{};
  Object.entries(families).forEach(([pattern,verbs])=>Object.entries(verbs).forEach(([infinitif,[participePasse,auxiliaire]])=>{
    if(Object.prototype.hasOwnProperty.call(baseVerbs,infinitif))return;
    catalog[infinitif]={infinitif,infinitif_base:infinitif,groupe:pattern==='yer-explicit'?1:3,pattern:pattern==='yer-explicit'?'yer':pattern,auxiliaire,pronominal:false,participePasse,construction:'non-pronominale',verbeBase:infinitif};
  }));
  window.COQ_VERB_FAMILY_CATALOG=Object.freeze(catalog);
})();
