/* COQ — Suite de regresión manual para la arquitectura de Conjugaison.
 * No se carga en producción. Se puede importar desde DevTools para ejecutar
 * comprobaciones contra el motor central, el registro de patrones y la capa
 * de presentación.
 */
(function(){
  function assert(name,actual,expected,results){
    const ok=actual===expected;
    results.push({name,actual,expected,ok});
    return ok;
  }

  function assertTruthy(name,value,results){
    const ok=!!value;
    results.push({name,actual:ok?'presente':'ausente',expected:'presente',ok});
    return ok;
  }

  function run(){
    const engine=window.COQ_CONJ_ENGINE;
    const registry=window.COQ_PATTERN_REGISTRY;
    const presentation=window.COQ_TABLE_PRESENTATION;
    const results=[];
    if(!engine)return [{name:'motor disponible',actual:'ausente',expected:'presente',ok:false}];
    if(!registry)return [{name:'registro disponible',actual:'ausente',expected:'presente',ok:false}];

    assertTruthy('registro expone generate()',typeof registry.generate==='function',results);
    assertTruthy('motor expone conjugate()',typeof engine.conjugate==='function',results);
    assertTruthy('motor expone rowsForLookup()',typeof engine.rowsForLookup==='function',results);
    assertTruthy('presentación central disponible',presentation&&typeof presentation.normalizeTable==='function',results);

    const simple=[
      ['appeler',"présent de l'indicatif",'je','appelle'],
      ['appeler',"présent de l'indicatif",'nous','appelons'],
      ['acheter',"présent de l'indicatif",'je','achète'],
      ['jeter',"présent de l'indicatif",'je','jette'],
      ['feuilleter',"présent de l'indicatif",'je','feuillette'],
      ['partir',"présent de l'indicatif",'je','pars'],
      ['venir',"présent de l'indicatif",'nous','venons'],
      ['tenir',"présent de l'indicatif",'vous','tenez'],
      ['aller',"présent de l'indicatif",'je','vais'],
      ['aller',"subjonctif présent",'je','aille'],
      ['faire',"présent de l'indicatif",'je','fais'],
      ['faire',"présent de l'indicatif",'vous','faites'],
      ['faire','imparfait','nous','faisions'],
      ['faire','futur simple','ils','feront'],
      ['faire','conditionnel présent','je','ferais'],
      ['faire','subjonctif présent','que je','fasse'],
      ['faire','impératif présent','vous','faites']
    ];
    simple.forEach(function(item){
      const actual=engine.conjugate(item[0],item[1],item[2],'non-pronominale');
      assert(item[0]+' · '+item[1]+' · '+item[2],actual,item[3],results);
    });

    const compounds=[
      ['partir','passé composé','je (masculin singulier)','je suis parti'],
      ['partir','passé composé','je (féminin singulier)','je suis partie'],
      ['partir','passé composé','vous (masculin pluriel)','vous êtes partis'],
      ['partir','plus-que-parfait','elle (féminin singulier)','elle était partie'],
      ['partir','conditionnel passé','elle (féminin singulier)','elle serait partie'],
      ['partir','futur antérieur','elles','elles seront parties'],
      ['faire','passé composé','je (masculin singulier)','je ai fait']
    ];
    compounds.forEach(function(item){
      const actual=engine.conjugate(item[0],item[1],item[2],'non-pronominale');
      assert(item[0]+' · '+item[1]+' · '+item[2],actual,item[3],results);
    });

    const pronominal=[
      ['se lever','passé composé','je (féminin singulier)','je me suis levée'],
      ['se lever','plus-que-parfait','elle (féminin singulier)',"elle s'était levée"],
      ['se lever','conditionnel passé','ils','ils se seraient levés']
    ];
    pronominal.forEach(function(item){
      const actual=engine.conjugate(item[0],item[1],item[2],'pronominale');
      assert(item[0]+' · '+item[1]+' · '+item[2],actual,item[3],results);
    });

    const registryFamilies=[
      ['regular-er','parler',"présent de l'indicatif",'je','parle'],
      ['regular-ir','finir',"présent de l'indicatif",'nous','finissons'],
      ['regular-re','vendre',"présent de l'indicatif",'ils','vendent'],
      ['er-ger','manger',"présent de l'indicatif",'nous','mangeons'],
      ['er-cer','commencer',"présent de l'indicatif",'nous','commençons'],
      ['er-eler','appeler',"présent de l'indicatif",'je','appelle'],
      ['er-eter','jeter',"présent de l'indicatif",'je','jette'],
      ['er-e-accent','lever',"présent de l'indicatif",'je','lève'],
      ['partir-type','partir',"présent de l'indicatif",'je','pars'],
      ['suivre-type','suivre',"présent de l'indicatif",'nous','suivons'],
      ['ouvrir-type','ouvrir',"présent de l'indicatif",'je','ouvre'],
      ['venir-type','venir',"présent de l'indicatif",'je','viens'],
      ['tenir-type','tenir',"présent de l'indicatif",'nous','tenons'],
      ['aller-type','aller',"présent de l'indicatif",'je','vais'],
      ['mettre-type','mettre',"présent de l'indicatif",'je','mets'],
      ['lire-type','lire',"présent de l'indicatif",'je','lis'],
      ['rire-type','rire',"présent de l'indicatif",'je','ris'],
      ['vivre-type','vivre',"présent de l'indicatif",'je','vis'],
      ['conduire-type','conduire',"présent de l'indicatif",'je','conduis'],
      ['courir-type','courir',"présent de l'indicatif",'je','cours'],
      ['mourir-type','mourir',"présent de l'indicatif",'je','meurs'],
      ['croire-type','croire',"présent de l'indicatif",'je','crois'],
      ['recevoir-type','recevoir',"présent de l'indicatif",'je','reçois'],
      ['connaître-type','connaître',"présent de l'indicatif",'je','connais'],
      ['paraître-type','paraître',"présent de l'indicatif",'je','parais'],
      ['faire','faire',"présent de l'indicatif",'je','fais']
    ];
    registryFamilies.forEach(function(item){
      const actual=registry.generate(item[0],item[1],item[3],item[2]);
      assert('registro · '+item[0]+' · '+item[1]+' · '+item[2]+' · '+item[3],actual,item[4],results);
    });

    if(presentation){
      const subjRows=presentation.normalizeRows([
        {subject:'je',answer:'je parle'},
        {subject:'il/elle/on',answer:'parle'},
        {subject:'ils/elles',answer:'parlent'}
      ],"présent de l'indicatif");
      assert('presentación separa grupos de sujetos',subjRows.length,5,results);
    }

    return results;
  }

  window.COQ_CONJ_REGRESSION={run:run};
})();
