// COQ — datos de conjugación extraídos de V43.
// Esta fase separa únicamente los datos; no modifica su contenido.
window.COQ_VERB_DATA = {
  conjugations: {
 être:{"présent de l'indicatif":[["je","suis"],["tu","es"],["il/elle/on","est"],["nous","sommes"],["vous","êtes"],["ils/elles","sont"]],"imparfait":[["j'","étais"],["tu","étais"],["il/elle/on","était"],["nous","étions"],["vous","étiez"],["ils/elles","étaient"]],"futur simple":[["je","serai"],["tu","seras"],["il/elle/on","sera"],["nous","serons"],["vous","serez"],["ils/elles","seront"]]},
 avoir:{"passé composé":[["j'","ai eu"],["tu","as eu"],["il/elle/on","a eu"],["nous","avons eu"],["vous","avez eu"],["ils/elles","ont eu"]],"présent de l'indicatif":[["j'","ai"],["tu","as"],["il/elle/on","a"],["nous","avons"],["vous","avez"],["ils/elles","ont"]],"imparfait":[["j'","avais"],["tu","avais"],["il/elle/on","avait"],["nous","avions"],["vous","aviez"],["ils/elles","avaient"]],"futur simple":[["j'","aurai"],["tu","auras"],["il/elle/on","aura"],["nous","aurons"],["vous","aurez"],["ils/elles","auront"]]},
 prendre:{"passé composé":[["je","ai pris"],["tu","as pris"],["il/elle/on","a pris"],["nous","avons pris"],["vous","avez pris"],["ils/elles","ont pris"]],"présent de l'indicatif":[["je","prends"],["tu","prends"],["il/elle/on","prend"],["nous","prenons"],["vous","prenez"],["ils/elles","prennent"]],"imparfait":[["je","prenais"],["tu","prenais"],["il/elle/on","prenait"],["nous","prenions"],["vous","preniez"],["ils/elles","prenaient"]],"futur simple":[["je","prendrai"],["tu","prendras"],["il/elle/on","prendra"],["nous","prendrons"],["vous","prendrez"],["ils/elles","prendront"]]},
 finir:{"présent de l'indicatif":[["je","finis"],["tu","finis"],["il/elle/on","finit"],["nous","finissons"],["vous","finissez"],["ils/elles","finissent"]],"imparfait":[["je","finissais"],["tu","finissais"],["il/elle/on","finissait"],["nous","finissions"],["vous","finissiez"],["ils/elles","finissaient"]]},
 aller:{"passé composé":[["je","suis allé(e)"],["tu","es allé(e)"],["il/elle/on","est allé(e)"],["nous","sommes allé(e)s"],["vous","êtes allé(e)(s)"],["ils/elles","sont allé(e)s"]],"présent de l'indicatif":[["je","vais"],["tu","vas"],["il/elle/on","va"],["nous","allons"],["vous","allez"],["ils/elles","vont"]]},
 parler:{"présent de l'indicatif":[["je","parle"],["tu","parles"],["il/elle/on","parle"],["nous","parlons"],["vous","parlez"],["ils/elles","parlent"]]},
 manger:{"présent de l'indicatif":[["je","mange"],["tu","manges"],["il/elle/on","mange"],["nous","mangeons"],["vous","mangez"],["ils/elles","mangent"]]},
 commencer:{"présent de l'indicatif":[["je","commence"],["tu","commences"],["il/elle/on","commence"],["nous","commençons"],["vous","commencez"],["ils/elles","commencent"]]},
 venir:{"passé composé":[["je","suis venu(e)"],["tu","es venu(e)"],["il/elle/on","est venu(e)"],["nous","sommes venu(e)s"],["vous","êtes venu(e)(s)"],["ils/elles","sont venu(e)s"]],"présent de l'indicatif":[["je","viens"],["tu","viens"],["il/elle/on","vient"],["nous","venons"],["vous","venez"],["ils/elles","viennent"]]},
 faire:{"passé composé":[["je","ai fait"],["tu","as fait"],["il/elle/on","a fait"],["nous","avons fait"],["vous","avez fait"],["ils/elles","ont fait"]],"présent de l'indicatif":[["je","fais"],["tu","fais"],["il/elle/on","fait"],["nous","faisons"],["vous","faites"],["ils/elles","font"]]}
},
  verbGroups: {
  être:'Verbes du troisième groupe', avoir:'Verbes du troisième groupe', prendre:'Verbes du troisième groupe', aller:'Verbes du troisième groupe', venir:'Verbes du troisième groupe', faire:'Verbes du troisième groupe',
  finir:'deuxième groupe', parler:'premier groupe normal', manger:'premier groupe verbes en -GER', commencer:'premier groupe verbe en -CER', 'se lever':'premier groupe normal'
},
  verbMeta: {être:{pronominal:false,auxiliaire:'être'},avoir:{pronominal:false,auxiliaire:'avoir'},prendre:{pronominal:false,auxiliaire:'avoir'},finir:{pronominal:false,auxiliaire:'avoir'},aller:{pronominal:false,auxiliaire:'être'},parler:{pronominal:false,auxiliaire:'avoir'},manger:{pronominal:false,auxiliaire:'avoir'},commencer:{pronominal:false,auxiliaire:'avoir'},venir:{pronominal:false,auxiliaire:'être'},faire:{pronominal:false,auxiliaire:'avoir'},'se lever':{pronominal:true,auxiliaire:'être'}}
};

// El verbo pronominal se conserva exactamente como estaba en V43.
window.COQ_VERB_DATA.conjugations['se lever'] = {"présent de l'indicatif":[["je","me lève"],["tu","te lèves"],["il/elle/on","se lève"],["nous","nous levons"],["vous","vous levez"],["ils/elles","se lèvent"]],"passé composé":[["je","me suis levé(e)"],["tu","t'es levé(e)"],["il/elle/on","s'est levé(e)"],["nous","nous sommes levé(e)s"],["vous","vous êtes levé(e)(s)"],["ils/elles","se sont levé(e)s"]]};
