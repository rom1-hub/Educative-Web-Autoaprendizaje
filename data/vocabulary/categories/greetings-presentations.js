/* COQ — Saludos y presentaciones */
(function () {
  'use strict';

  const category = {
    id: 'greetings-presentations',
    title: 'Saludos y presentaciones',
    subcategories: [
      {
        id: 'greetings-basic',
        title: 'Saludos básicos',
        entries: [
          { id:'greeting-bonjour', word:'bonjour', translation:'buenos días', partOfSpeech:'interjection', emoji:'☀️' },
          { id:'greeting-salut', word:'salut', translation:'hola', partOfSpeech:'interjection', emoji:'👋' },
          { id:'greeting-bonsoir', word:'bonsoir', translation:'buenas tardes / buenas noches', partOfSpeech:'interjection', emoji:'🌆' },
          { id:'greeting-bonne-nuit', word:'bonne nuit', translation:'buenas noches', partOfSpeech:'expression', emoji:'🌙' },
          { id:'greeting-bienvenue', word:'bienvenue', translation:'bienvenido / bienvenida', partOfSpeech:'interjection', emoji:'🏠' },
          { id:'greeting-enchante-m', word:'enchanté', translation:'encantado', partOfSpeech:'adjective', adjectiveForms:{ masculineSingular:'enchanté', feminineSingular:'enchantée', masculinePlural:'enchantés', femininePlural:'enchantées' }, adjectiveSpanishForms:{ masculineSingular:'encantado', feminineSingular:'encantada', masculinePlural:'encantados', femininePlural:'encantadas' }, audioGroups:[['masculineSingular','feminineSingular','masculinePlural','femininePlural']], emoji:'🤝' },
          { id:'greeting-ravi-de-vous-rencontrer-m', word:'ravi de vous rencontrer', translation:'encantado de conocerle/la', partOfSpeech:'expression', adjectiveForms:{ masculineSingular:'ravi de vous rencontrer', feminineSingular:'ravie de vous rencontrer', masculinePlural:'ravis de vous rencontrer', femininePlural:'ravies de vous rencontrer' }, adjectiveSpanishForms:{ masculineSingular:'encantado de conocerle/la', feminineSingular:'encantada de conocerle/la', masculinePlural:'encantados de conocerle/la', femininePlural:'encantadas de conocerle/la' }, audioGroups:[['masculineSingular','feminineSingular','masculinePlural','femininePlural']], emoji:'🤝' },
          { id:'greeting-heureux-de-vous-rencontrer-m', word:'heureux de vous rencontrer', translation:'me alegra conocerle/la', partOfSpeech:'expression', adjectiveForms:{ masculineSingular:'heureux de vous rencontrer', feminineSingular:'heureuse de vous rencontrer', masculinePlural:'heureux de vous rencontrer', femininePlural:'heureuses de vous rencontrer' }, audioGroups:[['masculineSingular','masculinePlural'],['feminineSingular','femininePlural']], emoji:'🤝' },
          { id:'greeting-coucou', word:'coucou', translation:'hola (para alguien muy cercano)', partOfSpeech:'interjection', emoji:'😊' }
        ]
      },
      {
        id: 'greetings-farewells',
        title: 'Despedidas',
        entries: [
          { id:'farewell-au-revoir', word:'au revoir', translation:'adiós / hasta luego', emoji:'👋' },
          { id:'farewell-a-bientot', word:'à bientôt', translation:'hasta pronto', emoji:'🔜' },
          { id:'farewell-a-plus-tard', word:'à plus tard', translation:'hasta luego', emoji:'👋' },
          { id:'farewell-a-tout-a-lheure', word:'à tout à l’heure', translation:'Hasta dentro de un rato', emoji:'👋' },
          { id:'farewell-a-demain', word:'à demain', translation:'hasta mañana', emoji:'🌙' },
          { id:'farewell-a-lundi', word:'à lundi', translation:'hasta el lunes', emoji:'📅' },
          { id:'farewell-a-la-prochaine', word:'à la prochaine', translation:'hasta la próxima', emoji:'👋' },
          { id:'farewell-bonne-journee', word:'bonne journée', translation:'que tenga un buen día', emoji:'☀️' },
          { id:'farewell-bonne-soiree', word:'bonne soirée', translation:'que pase una buena tarde / noche', emoji:'🌆' },
          { id:'farewell-bon-week-end', word:'bon week-end', translation:'buen fin de semana', emoji:'📅' },
          { id:'farewell-a-plus', word:'à plus', translation:'hasta luego', emoji:'👋' },
          { id:'farewell-salut', word:'salut', translation:'adiós / hasta luego', partOfSpeech:'interjection', emoji:'👋' }
        ]
      },
      {
        id: 'greetings-how-are-you',
        title: 'Preguntar y decir cómo está alguien',
        entries: [
          { id:'how-ca-va', word:'ça va ?', translation:'¿qué tal?', partOfSpeech:'expression', emoji:'🙂' },
          { id:'how-comment-allez-vous', word:'comment allez-vous ?', translation:'¿cómo está usted?', partOfSpeech:'expression', emoji:'🙂' },
          { id:'how-comment-vas-tu', word:'comment vas-tu ?', translation:'¿cómo estás?', partOfSpeech:'expression', emoji:'🙂' },
          { id:'how-comment-ca-va', word:'comment ça va ?', translation:'¿cómo estás? / ¿cómo está todo?', partOfSpeech:'expression', emoji:'🙂' },
          { id:'how-tu-vas-bien', word:'tu vas bien ?', translation:'¿estás bien?', partOfSpeech:'expression', emoji:'🙂' },
          { id:'how-vous-allez-bien', word:'vous allez bien ?', translation:'¿está usted bien?', partOfSpeech:'expression', emoji:'🙂' },
          { id:'how-ca-va-bien', word:'ça va bien', translation:'estoy bien / todo va bien', partOfSpeech:'expression', emoji:'🙂' },
          { id:'how-ca-va-tres-bien', word:'ça va très bien', translation:'estoy muy bien', partOfSpeech:'expression', emoji:'😄' },
          { id:'how-ca-va-mal', word:'ça va mal', translation:'estoy mal', partOfSpeech:'expression', emoji:'🙁' },
          { id:'how-comme-ci-comme-ca', word:'comme ci, comme ça', translation:'así así', partOfSpeech:'expression', emoji:'😐' },
          { id:'how-bof', word:'bof', translation:'más o menos', partOfSpeech:'interjection', emoji:'😐' },
          { id:'how-pas-mal', word:'pas mal', translation:'no está mal', partOfSpeech:'expression', emoji:'🙂' }
        ]
      },
      {
        id: 'greetings-introduce-yourself',
        title: 'Presentarse',
        entries: [
          { id:'intro-je-mappelle', word:"je m'appelle", translation:'me llamo', partOfSpeech:'expression', emoji:'🙋' },
          { id:'intro-mon-nom-est', word:'mon nom est', translation:'mi nombre es', partOfSpeech:'expression', emoji:'🪪' },
          { id:'intro-moi-cest', word:"moi, c'est", translation:'yo soy / yo me llamo', partOfSpeech:'expression', emoji:'🙋' },
          { id:'intro-je-suis', word:'je suis', translation:'soy', partOfSpeech:'expression', emoji:'🙋' },
          { id:'intro-permettez-moi-de-me-presenter', word:'permettez-moi de me présenter', translation:'permítame presentarme', partOfSpeech:'expression', emoji:'🙋' },
          { id:'intro-je-vous-presente', word:'je vous présente', translation:'le presento a', partOfSpeech:'expression', emoji:'🤝' },
          { id:'intro-je-te-presente', word:'je te présente', translation:'te presento a', partOfSpeech:'expression', emoji:'🤝' },
          { id:'intro-voici', word:'voici', translation:'este / esta es', partOfSpeech:'expression', emoji:'👉' },
          { id:'intro-enchante-faire-votre-connaissance', word:'enchanté de faire votre connaissance', translation:'encantado de conocerle/la', partOfSpeech:'expression', adjectiveForms:{ masculineSingular:'enchanté de faire votre connaissance', feminineSingular:'enchantée de faire votre connaissance', masculinePlural:'enchantés de faire votre connaissance', femininePlural:'enchantées de faire votre connaissance' }, adjectiveSpanishForms:{ masculineSingular:'encantado de conocerle/la', feminineSingular:'encantada de conocerle/la', masculinePlural:'encantados de conocerle/la', femininePlural:'encantadas de conocerle/la' }, audioGroups:[['masculineSingular','feminineSingular','masculinePlural','femininePlural']], emoji:'🤝' }
        ]
      },
      {
        id: 'greetings-name-identity',
        title: 'Preguntar por el nombre y la identidad',
        entries: [
          { id:'identity-comment-vous-appelez-vous', word:'comment vous appelez-vous ?', translation:'¿cómo se llama?', partOfSpeech:'expression', emoji:'❓' },
          { id:'identity-comment-tu-tappelles', word:"comment tu t'appelles ?", translation:'¿cómo te llamas?', partOfSpeech:'expression', emoji:'❓' },
          { id:'identity-quel-est-votre-nom', word:'quel est votre nom ?', translation:'¿cuál es su apellido?', partOfSpeech:'expression', emoji:'❓' },
          { id:'identity-quel-est-ton-nom', word:'quel est ton nom ?', translation:'¿cuál es tu apellido?', partOfSpeech:'expression', emoji:'❓' },
          { id:'identity-quel-est-votre-prenom', word:'quel est votre prénom ?', translation:'¿cuál es su nombre?', partOfSpeech:'expression', emoji:'❓' },
          { id:'identity-quel-est-ton-prenom', word:'quel est ton prénom ?', translation:'¿cuál es tu nombre?', partOfSpeech:'expression', emoji:'❓' },
          { id:'identity-qui-etes-vous', word:'qui êtes-vous ?', translation:'¿quién es usted?', partOfSpeech:'expression', emoji:'❓' },
          { id:'identity-qui-es-tu', word:'qui es-tu ?', translation:'¿quién eres?', partOfSpeech:'expression', emoji:'❓' },
          { id:'identity-vous-etes-qui', word:'vous êtes qui ?', translation:'¿y usted quién es?', partOfSpeech:'expression', emoji:'❓' },
          { id:'identity-tu-es-qui', word:'tu es qui ?', translation:'¿y tú quién eres?', partOfSpeech:'expression', emoji:'❓' }
        ]
      },
      {
        id: 'greetings-present-others',
        title: 'Presentar a otras personas',
        entries: [
          { id:'present-voici-mon-ami', word:'voici mon ami', translation:'este es mi amigo', partOfSpeech:'expression', audioGroupId:'present-voici-mon-ami-audio', emoji:'👨' },
          { id:'present-voici-mon-amie', word:'voici mon amie', translation:'esta es mi amiga', partOfSpeech:'expression', audioGroupId:'present-voici-mon-ami-audio', emoji:'👩' },
          { id:'present-je-vous-presente-mon-ami', word:'je vous présente mon ami', translation:'le presento a mi amigo', partOfSpeech:'expression', audioGroupId:'present-je-vous-presente-mon-ami-audio', emoji:'🤝' },
          { id:'present-je-vous-presente-mon-amie', word:'je vous présente mon amie', translation:'le presento a mi amiga', partOfSpeech:'expression', audioGroupId:'present-je-vous-presente-mon-ami-audio', emoji:'🤝' },
          { id:'present-je-te-presente-mon-ami', word:'je te présente mon ami', translation:'te presento a mi amigo', partOfSpeech:'expression', audioGroupId:'present-je-te-presente-mon-ami-audio', emoji:'🤝' },
          { id:'present-je-te-presente-mon-amie', word:'je te présente mon amie', translation:'te presento a mi amiga', partOfSpeech:'expression', audioGroupId:'present-je-te-presente-mon-ami-audio', emoji:'🤝' },
          { id:'present-cest-mon-frere', word:"c'est mon frère", translation:'es mi hermano', partOfSpeech:'expression', emoji:'👨' },
          { id:'present-cest-ma-soeur', word:"c'est ma sœur", translation:'es mi hermana', partOfSpeech:'expression', emoji:'👩' },
          { id:'present-cest-mon-collegue', word:"c'est mon collègue", translation:'es mi compañero de trabajo', partOfSpeech:'expression', emoji:'👨‍💼' },
          { id:'present-cest-ma-collegue', word:"c'est ma collègue", translation:'es mi compañera de trabajo', partOfSpeech:'expression', emoji:'👩‍💼' }
        ]
      },
      {
        id: 'greetings-meet-contact',
        title: 'Conocer y establecer contacto',
        entries: [
          { id:'contact-faire-connaissance', word:'faire connaissance', translation:'conocerse / entablar conocimiento', partOfSpeech:'expression', emoji:'🤝' },
          { id:'contact-ravi-faire-votre-connaissance', word:'ravi de faire votre connaissance', translation:'encantado de conocerle/la', partOfSpeech:'expression', adjectiveForms:{ masculineSingular:'ravi de faire votre connaissance', feminineSingular:'ravie de faire votre connaissance', masculinePlural:'ravis de faire votre connaissance', femininePlural:'ravies de faire votre connaissance' }, adjectiveSpanishForms:{ masculineSingular:'encantado de conocerle', feminineSingular:'encantada de conocerle', masculinePlural:'encantados de conocerle', femininePlural:'encantadas de conocerle' }, audioGroups:[['masculineSingular','feminineSingular','masculinePlural','femininePlural']], emoji:'🤝' },
          { id:'contact-ravi-faire-ta-connaissance', word:'ravi de faire ta connaissance', translation:'encantado de conocerte', partOfSpeech:'expression', adjectiveForms:{ masculineSingular:'ravi de faire ta connaissance', feminineSingular:'ravie de faire ta connaissance', masculinePlural:'ravis de faire ta connaissance', femininePlural:'ravies de faire ta connaissance' }, adjectiveSpanishForms:{ masculineSingular:'encantado de conocerte', feminineSingular:'encantada de conocerte', masculinePlural:'encantados de conocerte', femininePlural:'encantadas de conocerte' }, audioGroups:[['masculineSingular','feminineSingular','masculinePlural','femininePlural']], emoji:'🤝' },
          { id:'contact-content-vous-rencontrer', word:'content de vous rencontrer', translation:'contento de conocerle/la', partOfSpeech:'expression', adjectiveForms:{ masculineSingular:'content de vous rencontrer', feminineSingular:'contente de vous rencontrer', masculinePlural:'contents de vous rencontrer', femininePlural:'contentes de vous rencontrer' }, adjectiveSpanishForms:{ masculineSingular:'contento de conocerle/la', feminineSingular:'contenta de conocerle/la', masculinePlural:'contentos de conocerle/la', femininePlural:'contentas de conocerle/la' }, audioGroups:[['masculineSingular','masculinePlural'],['feminineSingular','femininePlural']], emoji:'😊' },
          { id:'contact-content-te-rencontrer', word:'content de te rencontrer', translation:'contento de conocerte', partOfSpeech:'expression', adjectiveForms:{ masculineSingular:'content de te rencontrer', feminineSingular:'contente de te rencontrer', masculinePlural:'contents de te rencontrer', femininePlural:'contentes de te rencontrer' }, adjectiveSpanishForms:{ masculineSingular:'contento de conocerte', feminineSingular:'contenta de conocerte', masculinePlural:'contentos de conocerte', femininePlural:'contentas de conocerte' }, audioGroups:[['masculineSingular','masculinePlural'],['feminineSingular','femininePlural']], emoji:'😊' },
          { id:'contact-ca-fait-plaisir-de-vous-voir', word:'ça fait plaisir de vous voir', translation:'me alegra verle/la', partOfSpeech:'expression', emoji:'😊' },
          { id:'contact-ca-fait-plaisir-de-te-voir', word:'ça fait plaisir de te voir', translation:'me alegra verte', partOfSpeech:'expression', emoji:'😊' },
          { id:'contact-on-se-connait', word:'on se connaît ?', translation:'¿nos conocemos?', partOfSpeech:'expression', emoji:'❓' }
        ]
      },
      {
        id: 'greetings-courtesy-contact',
        title: 'Fórmulas de cortesía y contacto',
        entries: [
          { id:'courtesy-sil-vous-plait', word:"s'il vous plaît", translation:'por favor (tratamiento formal)', partOfSpeech:'expression', emoji:'🙏' },
          { id:'courtesy-sil-te-plait', word:"s'il te plaît", translation:'por favor (tratamiento informal)', partOfSpeech:'expression', emoji:'🙏' },
          { id:'courtesy-merci', word:'merci', translation:'gracias', partOfSpeech:'interjection', emoji:'🙏' },
          { id:'courtesy-merci-beaucoup', word:'merci beaucoup', translation:'muchas gracias', partOfSpeech:'expression', emoji:'🙏' },
          { id:'courtesy-de-rien', word:'de rien', translation:'de nada', partOfSpeech:'expression', emoji:'😊' },
          { id:'courtesy-avec-plaisir', word:'avec plaisir', translation:'con mucho gusto', partOfSpeech:'expression', emoji:'😊' },
          { id:'courtesy-je-vous-en-prie', word:'je vous en prie', translation:'de nada (formal)', partOfSpeech:'expression', emoji:'🙏' },
          { id:'courtesy-excusez-moi', word:'excusez-moi', translation:'disculpe', partOfSpeech:'expression', emoji:'🙏' },
          { id:'courtesy-excuse-moi', word:'excuse-moi', translation:'disculpa', partOfSpeech:'expression', emoji:'🙏' },
          { id:'courtesy-pardon', word:'pardon', translation:'perdón', partOfSpeech:'interjection', emoji:'🙏' },
          { id:'courtesy-desole-m', word:'désolé', translation:'lo siento (masculino)', partOfSpeech:'adjective', audioGroupId:'courtesy-desole-audio', emoji:'🙏' },
          { id:'courtesy-desolee-f', word:'désolée', translation:'lo siento (femenino)', partOfSpeech:'adjective', audioGroupId:'courtesy-desole-audio', emoji:'🙏' },
          { id:'courtesy-tu-habites-ou', word:'tu habites où ?', translation:'¿dónde vives?', partOfSpeech:'expression', emoji:'🏠' },
          { id:'courtesy-vous-habitez-ou', word:'vous habitez où ?', translation:'¿dónde vive?', partOfSpeech:'expression', emoji:'🏠' },
          { id:'courtesy-jhabite-a', word:"j'habite à", translation:'vivo en', partOfSpeech:'expression', emoji:'🏠' }
        ]
      }

    ]
  };

  if (window.COQ_VOCABULARY_DATABASE_API) {
    window.COQ_VOCABULARY_DATABASE_API.registerCategory(category);
  }
})();