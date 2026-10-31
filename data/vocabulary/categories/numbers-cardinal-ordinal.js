/* COQ — Números cardinales y ordinales */
(function () {
  'use strict';

  const makeEntries = (prefix, pairs) => pairs.map(([word, translation], index) => ({
    id: 'numbers-' + prefix + '-' + String(index + 1).padStart(2, '0'),
    word,
    translation
  }));

  const makeOrdinal = (id, word, translation, forms, spanishForms, audioGroups) => ({
    id, word, translation, partOfSpeech: 'adjective',
    detailCategoryLabel: 'Adjetivo numeral',
    adjectiveForms: forms,
    adjectiveSpanishForms: spanishForms,
    audioGroups
  });

  const category = {
    id: 'numbers-cardinal-ordinal',
    title: 'Números cardinales y ordinales',
    subcategories: [
      {
        id: 'cardinal-0-19',
        title: 'Cardinales 0–19',
        entries: makeEntries('cardinal-0-19', [
          ['zéro','cero'],['un','uno'],['deux','dos'],['trois','tres'],['quatre','cuatro'],
          ['cinq','cinco'],['six','seis'],['sept','siete'],['huit','ocho'],['neuf','nueve'],
          ['dix','diez'],['onze','once'],['douze','doce'],['treize','trece'],['quatorze','catorce'],
          ['quinze','quince'],['seize','dieciséis'],['dix-sept','diecisiete'],['dix-huit','dieciocho'],['dix-neuf','diecinueve']
        ])
      },
      {
        id: 'cardinal-20-39',
        title: 'Cardinales 20–39',
        entries: makeEntries('cardinal-20-39', [
          ['vingt','veinte'],['vingt et un','veintiuno'],['vingt-deux','veintidós'],['vingt-trois','veintitrés'],
          ['vingt-quatre','veinticuatro'],['vingt-cinq','veinticinco'],['vingt-six','veintiséis'],['vingt-sept','veintisiete'],
          ['vingt-huit','veintiocho'],['vingt-neuf','veintinueve'],['trente','treinta'],['trente et un','treinta y uno'],
          ['trente-deux','treinta y dos'],['trente-trois','treinta y tres'],['trente-quatre','treinta y cuatro'],
          ['trente-cinq','treinta y cinco'],['trente-six','treinta y seis'],['trente-sept','treinta y siete'],
          ['trente-huit','treinta y ocho'],['trente-neuf','treinta y nueve']
        ])
      },
      {
        id: 'cardinal-40-59',
        title: 'Cardinales 40–59',
        entries: makeEntries('cardinal-40-59', [
          ['quarante','cuarenta'],['quarante et un','cuarenta y uno'],['quarante-deux','cuarenta y dos'],
          ['quarante-trois','cuarenta y tres'],['quarante-quatre','cuarenta y cuatro'],['quarante-cinq','cuarenta y cinco'],
          ['quarante-six','cuarenta y seis'],['quarante-sept','cuarenta y siete'],['quarante-huit','cuarenta y ocho'],
          ['quarante-neuf','cuarenta y nueve'],['cinquante','cincuenta'],['cinquante et un','cincuenta y uno'],
          ['cinquante-deux','cincuenta y dos'],['cinquante-trois','cincuenta y tres'],['cinquante-quatre','cincuenta y cuatro'],
          ['cinquante-cinq','cincuenta y cinco'],['cinquante-six','cincuenta y seis'],['cinquante-sept','cincuenta y siete'],
          ['cinquante-huit','cincuenta y ocho'],['cinquante-neuf','cincuenta y nueve']
        ])
      },
      {
        id: 'cardinal-60-79',
        title: 'Cardinales 60–79',
        entries: makeEntries('cardinal-60-79', [
          ['soixante','sesenta'],['soixante et un','sesenta y uno'],['soixante-deux','sesenta y dos'],
          ['soixante-trois','sesenta y tres'],['soixante-quatre','sesenta y cuatro'],['soixante-cinq','sesenta y cinco'],
          ['soixante-six','sesenta y seis'],['soixante-sept','sesenta y siete'],['soixante-huit','sesenta y ocho'],
          ['soixante-neuf','sesenta y nueve'],['soixante-dix','setenta'],['soixante et onze','setenta y uno'],
          ['soixante-douze','setenta y dos'],['soixante-treize','setenta y tres'],['soixante-quatorze','setenta y cuatro'],
          ['soixante-quinze','setenta y cinco'],['soixante-seize','setenta y seis'],['soixante-dix-sept','setenta y siete'],
          ['soixante-dix-huit','setenta y ocho'],['soixante-dix-neuf','setenta y nueve']
        ])
      },
      {
        id: 'cardinal-80-99',
        title: 'Cardinales 80–99',
        entries: makeEntries('cardinal-80-99', [
          ['quatre-vingts','ochenta'],['quatre-vingt-un','ochenta y uno'],['quatre-vingt-deux','ochenta y dos'],
          ['quatre-vingt-trois','ochenta y tres'],['quatre-vingt-quatre','ochenta y cuatro'],['quatre-vingt-cinq','ochenta y cinco'],
          ['quatre-vingt-six','ochenta y seis'],['quatre-vingt-sept','ochenta y siete'],['quatre-vingt-huit','ochenta y ocho'],
          ['quatre-vingt-neuf','ochenta y nueve'],['quatre-vingt-dix','noventa'],['quatre-vingt-onze','noventa y uno'],
          ['quatre-vingt-douze','noventa y dos'],['quatre-vingt-treize','noventa y tres'],['quatre-vingt-quatorze','noventa y cuatro'],
          ['quatre-vingt-quinze','noventa y cinco'],['quatre-vingt-seize','noventa y seis'],['quatre-vingt-dix-sept','noventa y siete'],
          ['quatre-vingt-dix-huit','noventa y ocho'],['quatre-vingt-dix-neuf','noventa y nueve']
        ])
      },
      {
        id: 'cardinal-round-numbers',
        title: 'Cardinales redondos',
        entries: makeEntries('cardinal-round', [
          ['cent','cien'],['deux cents','doscientos'],['trois cents','trescientos'],['quatre cents','cuatrocientos'],
          ['cinq cents','quinientos'],['six cents','seiscientos'],['sept cents','setecientos'],['huit cents','ochocientos'],
          ['neuf cents','novecientos'],['mille','mil'],['dix mille','diez mil'],['cent mille','cien mil'],
          ['un million','un millón'],['dix millions','diez millones'],['un milliard','mil millones']
        ])
      },
      {
        id: 'ordinal-1-19',
        title: 'Ordinales 1–19',
        entries: [
          makeOrdinal('numbers-ordinal-1-19-01','premier','primero',
            { masculineSingular:'premier', feminineSingular:'première', masculinePlural:'premiers', femininePlural:'premières' },
            { masculineSingular:'primero', feminineSingular:'primera', masculinePlural:'primeros', femininePlural:'primeras' },
            [['masculineSingular','masculinePlural'],['feminineSingular','femininePlural']]),
          makeOrdinal('numbers-ordinal-1-19-03','deuxième','segundo',
            { masculineSingular:'deuxième', feminineSingular:'deuxième', masculinePlural:'deuxièmes', femininePlural:'deuxièmes' },
            { masculineSingular:'segundo', feminineSingular:'segunda', masculinePlural:'segundos', femininePlural:'segundas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-1-19-04','troisième','tercero',
            { masculineSingular:'troisième', feminineSingular:'troisième', masculinePlural:'troisièmes', femininePlural:'troisièmes' },
            { masculineSingular:'tercero', feminineSingular:'tercera', masculinePlural:'terceros', femininePlural:'terceras' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-1-19-05','quatrième','cuarto',
            { masculineSingular:'quatrième', feminineSingular:'quatrième', masculinePlural:'quatrièmes', femininePlural:'quatrièmes' },
            { masculineSingular:'cuarto', feminineSingular:'cuarta', masculinePlural:'cuartos', femininePlural:'cuartas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-1-19-06','cinquième','quinto',
            { masculineSingular:'cinquième', feminineSingular:'cinquième', masculinePlural:'cinquièmes', femininePlural:'cinquièmes' },
            { masculineSingular:'quinto', feminineSingular:'quinta', masculinePlural:'quintos', femininePlural:'quintas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-1-19-07','sixième','sexto',
            { masculineSingular:'sixième', feminineSingular:'sixième', masculinePlural:'sixièmes', femininePlural:'sixièmes' },
            { masculineSingular:'sexto', feminineSingular:'sexta', masculinePlural:'sextos', femininePlural:'sextas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-1-19-08','septième','séptimo',
            { masculineSingular:'septième', feminineSingular:'septième', masculinePlural:'septièmes', femininePlural:'septièmes' },
            { masculineSingular:'séptimo', feminineSingular:'séptima', masculinePlural:'séptimos', femininePlural:'séptimas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-1-19-09','huitième','octavo',
            { masculineSingular:'huitième', feminineSingular:'huitième', masculinePlural:'huitièmes', femininePlural:'huitièmes' },
            { masculineSingular:'octavo', feminineSingular:'octava', masculinePlural:'octavos', femininePlural:'octavas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-1-19-10','neuvième','noveno',
            { masculineSingular:'neuvième', feminineSingular:'neuvième', masculinePlural:'neuvièmes', femininePlural:'neuvièmes' },
            { masculineSingular:'noveno', feminineSingular:'novena', masculinePlural:'novenos', femininePlural:'novenas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-1-19-11','dixième','décimo',
            { masculineSingular:'dixième', feminineSingular:'dixième', masculinePlural:'dixièmes', femininePlural:'dixièmes' },
            { masculineSingular:'décimo', feminineSingular:'décima', masculinePlural:'décimos', femininePlural:'décimas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-1-19-12','onzième','undécimo',
            { masculineSingular:'onzième', feminineSingular:'onzième', masculinePlural:'onzièmes', femininePlural:'onzièmes' },
            { masculineSingular:'undécimo', feminineSingular:'undécima', masculinePlural:'undécimos', femininePlural:'undécimas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-1-19-13','douzième','duodécimo',
            { masculineSingular:'douzième', feminineSingular:'douzième', masculinePlural:'douzièmes', femininePlural:'douzièmes' },
            { masculineSingular:'duodécimo', feminineSingular:'duodécima', masculinePlural:'duodécimos', femininePlural:'duodécimas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-1-19-14','treizième','decimotercero',
            { masculineSingular:'treizième', feminineSingular:'treizième', masculinePlural:'treizièmes', femininePlural:'treizièmes' },
            { masculineSingular:'decimotercero', feminineSingular:'decimotercera', masculinePlural:'decimoterceros', femininePlural:'decimoterceras' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-1-19-15','quatorzième','decimocuarto',
            { masculineSingular:'quatorzième', feminineSingular:'quatorzième', masculinePlural:'quatorzièmes', femininePlural:'quatorzièmes' },
            { masculineSingular:'decimocuarto', feminineSingular:'decimocuarta', masculinePlural:'decimocuartos', femininePlural:'decimocuartas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-1-19-16','quinzième','decimoquinto',
            { masculineSingular:'quinzième', feminineSingular:'quinzième', masculinePlural:'quinzièmes', femininePlural:'quinzièmes' },
            { masculineSingular:'decimoquinto', feminineSingular:'decimoquinta', masculinePlural:'decimoquintos', femininePlural:'decimoquintas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-1-19-17','seizième','decimosexto',
            { masculineSingular:'seizième', feminineSingular:'seizième', masculinePlural:'seizièmes', femininePlural:'seizièmes' },
            { masculineSingular:'decimosexto', feminineSingular:'decimosexta', masculinePlural:'decimosextos', femininePlural:'decimosextas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-1-19-18','dix-septième','decimoséptimo',
            { masculineSingular:'dix-septième', feminineSingular:'dix-septième', masculinePlural:'dix-septièmes', femininePlural:'dix-septièmes' },
            { masculineSingular:'decimoséptimo', feminineSingular:'decimoséptima', masculinePlural:'decimoséptimos', femininePlural:'decimoséptimas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-1-19-19','dix-huitième','decimoctavo',
            { masculineSingular:'dix-huitième', feminineSingular:'dix-huitième', masculinePlural:'dix-huitièmes', femininePlural:'dix-huitièmes' },
            { masculineSingular:'decimoctavo', feminineSingular:'decimoctava', masculinePlural:'decimoctavos', femininePlural:'decimoctavas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-1-19-20','dix-neuvième','decimonoveno',
            { masculineSingular:'dix-neuvième', feminineSingular:'dix-neuvième', masculinePlural:'dix-neuvièmes', femininePlural:'dix-neuvièmes' },
            { masculineSingular:'decimonoveno', feminineSingular:'decimonovena', masculinePlural:'decimonovenos', femininePlural:'decimonovenas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']])
        ]
      },
      {
        id: 'ordinal-tens-and-1000',
        title: 'Ordinales de las decenas y 1000',
        entries: [
          makeOrdinal('numbers-ordinal-tens-and-1000-01','vingtième','vigésimo',
            { masculineSingular:'vingtième', feminineSingular:'vingtième', masculinePlural:'vingtièmes', femininePlural:'vingtièmes' },
            { masculineSingular:'vigésimo', feminineSingular:'vigésima', masculinePlural:'vigésimos', femininePlural:'vigésimas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-tens-and-1000-02','trentième','trigésimo',
            { masculineSingular:'trentième', feminineSingular:'trentième', masculinePlural:'trentièmes', femininePlural:'trentièmes' },
            { masculineSingular:'trigésimo', feminineSingular:'trigésima', masculinePlural:'trigésimos', femininePlural:'trigésimas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-tens-and-1000-03','quarantième','cuadragésimo',
            { masculineSingular:'quarantième', feminineSingular:'quarantième', masculinePlural:'quarantièmes', femininePlural:'quarantièmes' },
            { masculineSingular:'cuadragésimo', feminineSingular:'cuadragésima', masculinePlural:'cuadragésimos', femininePlural:'cuadragésimas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-tens-and-1000-04','cinquantième','quincuagésimo',
            { masculineSingular:'cinquantième', feminineSingular:'cinquantième', masculinePlural:'cinquantièmes', femininePlural:'cinquantièmes' },
            { masculineSingular:'quincuagésimo', feminineSingular:'quincuagésima', masculinePlural:'quincuagésimos', femininePlural:'quincuagésimas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-tens-and-1000-05','soixantième','sexagésimo',
            { masculineSingular:'soixantième', feminineSingular:'soixantième', masculinePlural:'soixantièmes', femininePlural:'soixantièmes' },
            { masculineSingular:'sexagésimo', feminineSingular:'sexagésima', masculinePlural:'sexagésimos', femininePlural:'sexagésimas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-tens-and-1000-06','soixante-dixième','septuagésimo',
            { masculineSingular:'soixante-dixième', feminineSingular:'soixante-dixième', masculinePlural:'soixante-dixièmes', femininePlural:'soixante-dixièmes' },
            { masculineSingular:'septuagésimo', feminineSingular:'septuagésima', masculinePlural:'septuagésimos', femininePlural:'septuagésimas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-tens-and-1000-07','quatre-vingtième','octogésimo',
            { masculineSingular:'quatre-vingtième', feminineSingular:'quatre-vingtième', masculinePlural:'quatre-vingtièmes', femininePlural:'quatre-vingtièmes' },
            { masculineSingular:'octogésimo', feminineSingular:'octogésima', masculinePlural:'octogésimos', femininePlural:'octogésimas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-tens-and-1000-08','quatre-vingt-dixième','nonagésimo',
            { masculineSingular:'quatre-vingt-dixième', feminineSingular:'quatre-vingt-dixième', masculinePlural:'quatre-vingt-dixièmes', femininePlural:'quatre-vingt-dixièmes' },
            { masculineSingular:'nonagésimo', feminineSingular:'nonagésima', masculinePlural:'nonagésimos', femininePlural:'nonagésimas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-tens-and-1000-09','centième','centésimo',
            { masculineSingular:'centième', feminineSingular:'centième', masculinePlural:'centièmes', femininePlural:'centièmes' },
            { masculineSingular:'centésimo', feminineSingular:'centésima', masculinePlural:'centésimos', femininePlural:'centésimas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']]),
          makeOrdinal('numbers-ordinal-tens-and-1000-10','millième','milésimo',
            { masculineSingular:'millième', feminineSingular:'millième', masculinePlural:'millièmes', femininePlural:'millièmes' },
            { masculineSingular:'milésimo', feminineSingular:'milésima', masculinePlural:'milésimos', femininePlural:'milésimas' },
            [['masculineSingular','feminineSingular','masculinePlural','femininePlural']])
        ]
      }
    ]
  };

  if (window.COQ_VOCABULARY_DATABASE_API) {
    window.COQ_VOCABULARY_DATABASE_API.registerCategory(category);
  }
})();