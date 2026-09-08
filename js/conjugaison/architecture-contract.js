/* COQ — Contrato arquitectónico de Conjugaison.
 * No se carga en producción.
 *
 * Objetivo: detectar regresiones cuando se eliminen las rutas de compatibilidad
 * del motor. La generación debe pertenecer al registro central de patrones;
 * los formularios explícitos quedan reservados para excepciones reales.
 */
(function(){
  const SIMPLE_TENSES=[
    "présent de l'indicatif",
    'imparfait',
    'futur simple',
    'conditionnel présent',
    'subjonctif présent',
    'impératif présent'
  ];

  function run(){
    const registry=window.COQ_PATTERN_REGISTRY;
    const verbs=window.COQ_VERBS||{};
    const results=[];
    const push=(name,ok,actual,expected)=>results.push({name,ok,actual,expected});

    push('registro central disponible',!!registry,'presente','presente');
    if(!registry)return results;

    const supportedPatterns=new Set(Object.keys(registry.definitions||{}));
    Object.keys(verbs).forEach(infinitif=>{
      const record=verbs[infinitif]||{};
      const pattern=record.pattern;
      if(!pattern)return;
      if(['être','avoir','prendre'].includes(pattern)){
        push('patrón explícito '+infinitif,true,pattern,'excepción explícita');
        return;
      }
      push(
        'patrón registrado · '+infinitif,
        supportedPatterns.has(pattern),
        pattern,
        'definición en COQ_PATTERN_REGISTRY'
      );
    });

    supportedPatterns.forEach(pattern=>{
      const definition=registry.get(pattern);
      if(!definition||typeof definition.generate!=='function')return;
      const representative=Object.keys(verbs).find(v=>verbs[v]&&verbs[v].pattern===pattern);
      if(!representative)return;
      SIMPLE_TENSES.forEach(tense=>{
        ['je','nous','vous'].forEach(subject=>{
          const value=registry.generate(pattern,representative,subject,tense);
          push(
            'generación central · '+pattern+' · '+tense+' · '+subject,
            value!==null&&value!==undefined,
            value,
            'forma generada o null explícito'
          );
        });
      });
    });

    return results;
  }

  window.COQ_CONJ_ARCHITECTURE_CONTRACT={run};
})();
