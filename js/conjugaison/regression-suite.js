/* COQ — Suite de regresión manual para la arquitectura de Conjugaison.
 * No se carga en producción. Se puede importar desde DevTools para ejecutar
 * comprobaciones contra el motor central y el registro de patrones.
 */
(function(){
  function assert(name,actual,expected,results){
    const ok=actual===expected;
    results.push({name,actual,expected,ok});
    return ok;
  }

  function run(){
    const engine=window.COQ_CONJ_ENGINE;
    const registry=window.COQ_PATTERN_REGISTRY;
    const results=[];
    if(!engine)return [{name:'motor disponible',actual:'ausente',expected:'presente',ok:false}];
    if(!registry)return [{name:'registro disponible',actual:'ausente',expected:'presente',ok:false}];

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
      ['aller',"subjonctif présent",'je','aille']
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
      ['partir','futur antérieur','elles','elles seront parties']
    ];
    compounds.forEach(function(item){
      const actual=engine.conjugate(item[0],item[1],item[2],'non-pronominale');
      assert(item[0]+' · '+item[1]+' · '+item[2],actual,item[3],results);
    });

    const pronominal=[
      ['se lever','passé composé','je (féminin singulier)','je me suis levée'],
      ['se lever','plus-que-parfait','elle (féminin singulier)','elle s\'était levée'],
      ['se lever','conditionnel passé','ils','ils se seraient levés']
    ];
    pronominal.forEach(function(item){
      const actual=engine.conjugate(item[0],item[1],item[2],'pronominale');
      assert(item[0]+' · '+item[1]+' · '+item[2],actual,item[3],results);
    });

    return results;
  }

  window.COQ_CONJ_REGRESSION={run:run};
})();
