/* COQ — Vocabulario · Cuerpo y persona */
(function () {
  'use strict';
  const category = {
    id: 'body-person',
    title: 'Cuerpo y persona',
    subcategories: [
      { id: 'body-parts', title: 'Partes del cuerpo', entries: [
        { id:'body-head', word:'tête', translation:'cabeza', articleFr:'une', articleEs:'una' },
        { id:'body-face', word:'visage', translation:'rostro', articleFr:'un', articleEs:'un' },
        { id:'body-eye', word:'œil', translation:'ojo', articleFr:'un', articleEs:'un' },
        { id:'body-ear', word:'oreille', translation:'oreja', articleFr:'une', articleEs:'una' },
        { id:'body-nose', word:'nez', translation:'nariz', articleFr:'un', articleEs:'una' },
        { id:'body-mouth', word:'bouche', translation:'boca', articleFr:'une', articleEs:'una' },
        { id:'body-tooth', word:'dent', translation:'diente', articleFr:'une', articleEs:'un' },
        { id:'body-neck', word:'cou', translation:'cuello', articleFr:'un', articleEs:'un' },
        { id:'body-shoulder', word:'épaule', translation:'hombro', articleFr:'une', articleEs:'un' },
        { id:'body-arm', word:'bras', translation:'brazo', articleFr:'un', articleEs:'un' },
        { id:'body-hand', word:'main', translation:'mano', articleFr:'une', articleEs:'una' },
        { id:'body-finger', word:'doigt', translation:'dedo', articleFr:'un', articleEs:'un' }
      ]},
      { id: 'body-legs', title: 'Piernas y pies', entries: [
        { id:'body-chest', word:'poitrine', translation:'pecho', articleFr:'une', articleEs:'un' },
        { id:'body-back', word:'dos', translation:'espalda', articleFr:'un', articleEs:'una' },
        { id:'body-belly', word:'ventre', translation:'vientre', articleFr:'un', articleEs:'un' },
        { id:'body-waist', word:'taille', translation:'cintura', articleFr:'une', articleEs:'una' },
        { id:'body-leg', word:'jambe', translation:'pierna', articleFr:'une', articleEs:'una' },
        { id:'body-knee', word:'genou', translation:'rodilla', articleFr:'un', articleEs:'una' },
        { id:'body-foot', word:'pied', translation:'pie', articleFr:'un', articleEs:'un' },
        { id:'body-toe', word:'orteil', translation:'dedo del pie', articleFr:'un', articleEs:'un' }
      ]},
      { id: 'body-person', title: 'Persona', entries: [
        { id:'person-man', word:'homme', translation:'hombre', articleFr:'un', articleEs:'un' },
        { id:'person-woman', word:'femme', translation:'mujer', articleFr:'une', articleEs:'una' },
        { id:'person-child', word:'enfant', translation:'niño / niña', articleFr:'un', articleEs:'un / una' },
        { id:'person-baby', word:'bébé', translation:'bebé', articleFr:'un', articleEs:'un' },
        { id:'person-boy', word:'garçon', translation:'niño', articleFr:'un', articleEs:'un' },
        { id:'person-girl', word:'fille', translation:'niña', articleFr:'une', articleEs:'una' },
        { id:'person-adult', word:'adulte', translation:'adulto', articleFr:'un', articleEs:'un' },
        { id:'person-parent', word:'parent', translation:'padre / madre', articleFr:'un', articleEs:'un / una' }
      ]}
    ]
  };
  if (!window.COQ_VOCABULARY_DATABASE_API) throw new Error('COQ Vocabulario: registro no disponible.');
  window.COQ_VOCABULARY_DATABASE_API.registerCategory(Object.freeze(category));
})();