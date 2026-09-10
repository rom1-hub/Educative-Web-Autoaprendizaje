// COQ — catálogo pedagógico de categorías de grupos verbales.
//
// Responsabilidad única:
//   Groupe → Catégorie pédagogique → Famille
//
// Las categorías nunca apuntan directamente a patterns. Una categoría puede
// contener varias familias y varias familias pueden compartir un mismo pattern.
(function(){
  const categories=[
    {id:'all',label:'Todos',groupes:null,familyIds:null},
    {id:'regular-er',label:'Premier groupe normal',groupes:[1],familyIds:['er-regular']},
    {id:'er-ger',label:'Premier groupe verbes en GER',groupes:[1],familyIds:['er-ger']},
    {id:'er-cer',label:'Premier groupe verbes en CER',groupes:[1],familyIds:['er-cer']},
    {id:'er-eler',label:'Premier groupe verbes en -ELER',groupes:[1],familyIds:['er-eler-double','er-eler-accent']},
    {id:'er-eter',label:'Premier groupe verbes en -ETER',groupes:[1],familyIds:['er-eter-double','er-eter-accent','er-eter-orthographic']},
    {id:'yer',label:'Premier groupe verbes en -YER',groupes:[1],familyIds:['yer-oyer-uyer','yer-ayer']},
    {id:'er-e-accent',label:'Premier groupe verbe en -E (È) + consonne + ER',groupes:[1],familyIds:['er-e-accent']},
    {id:'groupe-2',label:'Deuxième groupe',groupes:[2],familyIds:['ir-regular-2']},
    {id:'groupe-3',label:'Verbes du troisième groupe',groupes:[3],familyIds:[
      'être','avoir','aller-type','prendre-type','faire-type','partir-type','suivre-type','ouvrir-type',
      'venir-type','tenir-type','mettre-type','lire-type','rire-type','vivre-type',
      'conduire-type','courir-type','mourir-type','croire-type','recevoir-type',
      'connaître-type','paraître-type'
    ]}
  ];

  const frozen=categories.map(category=>Object.freeze({
    id:category.id,
    label:category.label,
    groupes:category.groupes?Object.freeze([...category.groupes]):null,
    familyIds:category.familyIds?Object.freeze([...category.familyIds]):null
  }));

  window.COQ_VERB_CATEGORY_CATALOG=Object.freeze(frozen);
})();
