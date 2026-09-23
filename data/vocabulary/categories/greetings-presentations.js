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
          { id:'greeting-bonjour', word:'bonjour', translation:'buenos días', emoji:'☀️' },
          { id:'greeting-bonsoir', word:'bonsoir', translation:'buenas tardes / buenas noches', emoji:'🌆' },
          { id:'greeting-salut', word:'salut', translation:'hola', emoji:'👋' },
          { id:'greeting-coucou', word:'coucou', translation:'hola (para alguien muy cercano)', emoji:'😊' }
        ]
      },
      {
        id: 'greetings-farewells',
        title: 'Despedidas',
        entries: [
          { id:'farewell-au-revoir', word:'au revoir', translation:'adiós / hasta luego', emoji:'👋' },
          { id:'farewell-salut', word:'salut', translation:'adiós / hasta luego', emoji:'👋' },
          { id:'farewell-a-bientot', word:'à bientôt', translation:'hasta pronto', emoji:'🔜' },
          { id:'farewell-a-plus', word:'à plus', translation:'hasta luego', emoji:'👋' },
          { id:'farewell-bonne-nuit', word:'bonne nuit', translation:'buenas noches', emoji:'🌙' }
        ]
      },
      {
        id: 'greetings-how-are-you',
        title: 'Preguntar y decir cómo está alguien',
        entries: [
          { id:'how-ca-va', word:'ça va', translation:'¿cómo estás?', emoji:'🙂' },
          { id:'how-comment-ca-va', word:'comment ça va', translation:'¿cómo estás?', emoji:'🙂' },
          { id:'how-bof', word:'bof', translation:'más o menos', emoji:'😐' },
          { id:'how-bien', word:'bien', translation:'bien', emoji:'🙂' },
          { id:'how-tres-bien', word:'très bien', translation:'muy bien', emoji:'😄' },
          { id:'how-mal', word:'mal', translation:'mal', emoji:'🙁' },
          { id:'how-comme-ci-comme-ca', word:'comme ci, comme ça', translation:'así así', emoji:'😐' },
          { id:'how-enchante-m', word:'enchanté', translation:'encantado (masculino)', emoji:'🤝' },
          { id:'how-enchantee-f', word:'enchantée', translation:'encantada (femenino)', emoji:'🤝' },
          { id:'how-ravi-m', word:'ravi', translation:'encantado / feliz (masculino)', emoji:'😊' },
          { id:'how-ravie-f', word:'ravie', translation:'encantada / feliz (femenino)', emoji:'😊' },
          { id:'how-heureux-m', word:'heureux', translation:'feliz (masculino)', emoji:'😊' },
          { id:'how-heureuse-f', word:'heureuse', translation:'feliz (femenino)', emoji:'😊' },
          { id:'how-content-m', word:'content', translation:'contento (masculino)', emoji:'😊' },
          { id:'how-contente-f', word:'contente', translation:'contenta (femenino)', emoji:'😊' }
        ]
      },
      {
        id: 'greetings-introduce-yourself',
        title: 'Presentarse',
        entries: [
          { id:'intro-je-mappelle', word:"je m'appelle", translation:'me llamo', emoji:'🙋' },
          { id:'intro-je-suis', word:'je suis', translation:'soy', emoji:'🙋' },
          { id:'intro-moi-cest', word:"moi, c'est", translation:'yo soy / yo me llamo', emoji:'🙋' },
          { id:'intro-mon-nom-est', word:'mon nom est', translation:'mi nombre es', emoji:'🪪' },
        ]
      },
      {
        id: 'greetings-name-identity',
        title: 'Preguntar por el nombre y la identidad',
        entries: [
          { id:'identity-comment-tu-tappelles', word:"comment tu t'appelles", translation:'¿cómo te llamas?', emoji:'❓' },
          { id:'identity-comment-vous-vous-appelez', word:'comment vous vous appelez', translation:'¿cómo se llama?', emoji:'❓' },
          { id:'identity-quel-est-ton-nom', word:'quel est ton nom', translation:'¿cuál es tu nombre?', emoji:'❓' },
          { id:'identity-quel-est-votre-nom', word:'quel est votre nom', translation:'¿cuál es su nombre?', emoji:'❓' },
          { id:'identity-tu-es-qui', word:'tu es qui', translation:'¿quién eres?', emoji:'❓' },
          { id:'identity-vous-etes-qui', word:'vous êtes qui', translation:'¿quién es?', emoji:'❓' },
          { id:'identity-quel-age-tu-as', word:'quel âge tu as', translation:'¿cuántos años tienes?', emoji:'🎂' },
          { id:'identity-quel-age-vous-avez', word:'quel âge avez-vous', translation:'¿cuántos años tiene?', emoji:'🎂' }
        ]
      },
      {
        id: 'greetings-present-others',
        title: 'Presentar a otras personas',
        entries: [
          { id:'present-voici', word:'voici', translation:'aquí está / aquí tienes', emoji:'👉' },
          { id:'present-je-vous-presente', word:'je vous présente', translation:'les presento a', emoji:'🤝' },
          { id:'present-je-te-presente', word:'je te présente', translation:'te presento a', emoji:'🤝' }
        ]
      },
      {
        id: 'greetings-meet-contact',
        title: 'Conocer y establecer contacto',
        entries: [
          { id:'contact-au-plaisir', word:'au plaisir', translation:'hasta luego / será un placer', emoji:'🤝' }
        ]
      },
      {
        id: 'greetings-courtesy-contact',
        title: 'Fórmulas de cortesía y contacto',
        entries: [
          { id:'courtesy-sil-vous-plait', word:"s'il vous plaît", translation:'por favor', emoji:'🙏' },
          { id:'courtesy-sil-te-plait', word:"s'il te plaît", translation:'por favor', emoji:'🙏' },
          { id:'courtesy-merci', word:'merci', translation:'gracias', emoji:'🙏' },
          { id:'courtesy-de-rien', word:'de rien', translation:'de nada', emoji:'😊' },
          { id:'courtesy-desole-m', word:'désolé', translation:'lo siento (masculino)', emoji:'🙏' },
          { id:'courtesy-desolee-f', word:'désolée', translation:'lo siento (femenino)', emoji:'🙏' },
          { id:'courtesy-bienvenue', word:'bienvenue', translation:'bienvenido / bienvenida', emoji:'🏠' },
          { id:'courtesy-tu-habites-ou', word:'tu habites où', translation:'¿dónde vives?', emoji:'🏠' },
          { id:'courtesy-vous-habitez-ou', word:'vous habitez où', translation:'¿dónde vive?', emoji:'🏠' },
          { id:'courtesy-jhabite-a', word:"j'habite à", translation:'vivo en', emoji:'🏠' }
        ]
      }
    ]
  };

  window.COQ_VOCABULARY_REGISTER_CATEGORY(category);
})();