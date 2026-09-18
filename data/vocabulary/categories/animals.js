/*
 * COQ — Vocabulario · Animales
 *
 * Fuente de verdad del contenido de la categoría «Animales».
 * No contiene lógica de interfaz ni lógica de ejercicios.
 *
 * Estructura:
 * categoría → subcategoría → tema → entrada
 *
 * Cada entrada se define una sola vez. Los ejercicios reutilizarán estas
 * entradas mediante sus identificadores.
 *
 * Cada entrada incluye el artículo en francés y en español para mostrar
 * explícitamente el género: un/une + palabra → un/una + traducción.
 */
(function () {
  'use strict';

  const animals = {
    id: 'animals',
    title: 'Animales',
    subcategories: [
      {
        id: 'animals-domestic',
        title: 'Animales domésticos',
        topics: [
          {
            id: 'animals-domestic-common',
            title: 'Animales domésticos comunes',
            entries: [
              { id: 'animal-dog', word: 'chien', translation: 'perro', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-cat', word: 'chat', translation: 'gato', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-rabbit', word: 'lapin', translation: 'conejo', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-hamster', word: 'hamster', translation: 'hámster', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-guinea-pig', word: 'cochon d’Inde', translation: 'cobaya', articleFr: 'un', articleEs: 'una' }
            ]
          },
          {
            id: 'animals-domestic-birds',
            title: 'Aves domésticas',
            entries: [
              { id: 'animal-parakeet', word: 'perruche', translation: 'periquito', articleFr: 'une', articleEs: 'un' },
              { id: 'animal-canary', word: 'canari', translation: 'canario', articleFr: 'un', articleEs: 'un' }
            ]
          },
          {
            id: 'animals-domestic-fish',
            title: 'Animales acuáticos domésticos',
            entries: [
              { id: 'animal-goldfish', word: 'poisson rouge', translation: 'pez dorado', articleFr: 'un', articleEs: 'un' }
            ]
          },
          {
            id: 'animals-domestic-care',
            title: 'Cuidado y compañía',
            entries: [
              { id: 'animal-pet', word: 'animal de compagnie', translation: 'mascota', articleFr: 'un', articleEs: 'una' },
              { id: 'animal-collar', word: 'collier', translation: 'collar', articleFr: 'un', articleEs: 'un' }
            ]
          }
        ]
      },
      {
        id: 'animals-farm',
        title: 'Animales de granja',
        topics: [
          {
            id: 'animals-farm-mammals',
            title: 'Mamíferos de granja',
            entries: [
              { id: 'animal-cow', word: 'vache', translation: 'vaca', articleFr: 'une', articleEs: 'una' },
              { id: 'animal-bull', word: 'taureau', translation: 'toro', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-horse', word: 'cheval', translation: 'caballo', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-donkey', word: 'âne', translation: 'burro', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-pig', word: 'cochon', translation: 'cerdo', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-sheep', word: 'mouton', translation: 'oveja', articleFr: 'un', articleEs: 'una' },
              { id: 'animal-goat', word: 'chèvre', translation: 'cabra', articleFr: 'une', articleEs: 'una' }
            ]
          },
          {
            id: 'animals-farm-young',
            title: 'Crías',
            entries: [
              { id: 'animal-calf', word: 'veau', translation: 'ternero', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-lamb', word: 'agneau', translation: 'cordero', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-kid', word: 'chevreau', translation: 'cabrito', articleFr: 'un', articleEs: 'un' }
            ]
          },
          {
            id: 'animals-farm-birds',
            title: 'Aves de granja',
            entries: [
              { id: 'animal-chicken', word: 'poule', translation: 'gallina', articleFr: 'une', articleEs: 'una' },
              { id: 'animal-rooster', word: 'coq', translation: 'gallo', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-chick', word: 'poussin', translation: 'pollito', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-duck', word: 'canard', translation: 'pato', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-goose', word: 'oie', translation: 'ganso', articleFr: 'une', articleEs: 'un' },
              { id: 'animal-turkey', word: 'dindon', translation: 'pavo', articleFr: 'un', articleEs: 'un' }
            ]
          }
        ]
      },
      {
        id: 'animals-wild',
        title: 'Animales salvajes',
        topics: [
          {
            id: 'animals-wild-africa',
            title: 'Animales de África',
            entries: [
              { id: 'animal-lion', word: 'lion', translation: 'león', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-elephant', word: 'éléphant', translation: 'elefante', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-giraffe', word: 'girafe', translation: 'jirafa', articleFr: 'une', articleEs: 'una' },
              { id: 'animal-zebra', word: 'zèbre', translation: 'cebra', articleFr: 'un', articleEs: 'una' },
              { id: 'animal-rhinoceros', word: 'rhinocéros', translation: 'rinoceronte', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-hippopotamus', word: 'hippopotame', translation: 'hipopótamo', articleFr: 'un', articleEs: 'un' }
            ]
          },
          {
            id: 'animals-wild-predators',
            title: 'Depredadores',
            entries: [
              { id: 'animal-tiger', word: 'tigre', translation: 'tigre', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-leopard', word: 'léopard', translation: 'leopardo', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-wolf', word: 'loup', translation: 'lobo', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-fox', word: 'renard', translation: 'zorro', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-bear', word: 'ours', translation: 'oso', articleFr: 'un', articleEs: 'un' }
            ]
          },
          {
            id: 'animals-wild-primates',
            title: 'Primates',
            entries: [
              { id: 'animal-monkey', word: 'singe', translation: 'mono', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-gorilla', word: 'gorille', translation: 'gorila', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-chimpanzee', word: 'chimpanzé', translation: 'chimpancé', articleFr: 'un', articleEs: 'un' }
            ]
          }
        ]
      },
      {
        id: 'animals-marine',
        title: 'Animales marinos',
        topics: [
          {
            id: 'animals-marine-fish',
            title: 'Peces',
            entries: [
              { id: 'animal-shark', word: 'requin', translation: 'tiburón', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-dolphin', word: 'dauphin', translation: 'delfín', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-whale', word: 'baleine', translation: 'ballena', articleFr: 'une', articleEs: 'una' },
              { id: 'animal-seahorse', word: 'hippocampe', translation: 'caballito de mar', articleFr: 'un', articleEs: 'un' }
            ]
          },
          {
            id: 'animals-marine-invertebrates',
            title: 'Invertebrados marinos',
            entries: [
              { id: 'animal-octopus', word: 'pieuvre', translation: 'pulpo', articleFr: 'une', articleEs: 'un' },
              { id: 'animal-squid', word: 'calmar', translation: 'calamar', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-jellyfish', word: 'méduse', translation: 'medusa', articleFr: 'une', articleEs: 'una' },
              { id: 'animal-crab', word: 'crabe', translation: 'cangrejo', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-lobster', word: 'homard', translation: 'bogavante', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-star-fish', word: 'étoile de mer', translation: 'estrella de mar', articleFr: 'une', articleEs: 'una' }
            ]
          },
          {
            id: 'animals-marine-reptiles',
            title: 'Reptiles marinos',
            entries: [
              { id: 'animal-sea-turtle', word: 'tortue marine', translation: 'tortuga marina', articleFr: 'une', articleEs: 'una' }
            ]
          }
        ]
      },
      {
        id: 'animals-birds',
        title: 'Aves',
        topics: [
          {
            id: 'animals-birds-common',
            title: 'Aves comunes',
            entries: [
              { id: 'animal-eagle', word: 'aigle', translation: 'águila', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-owl', word: 'hibou', translation: 'búho', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-parrot', word: 'perroquet', translation: 'loro', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-pigeon', word: 'pigeon', translation: 'paloma', articleFr: 'un', articleEs: 'una' },
              { id: 'animal-sparrow', word: 'moineau', translation: 'gorrión', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-crow', word: 'corbeau', translation: 'cuervo', articleFr: 'un', articleEs: 'un' }
            ]
          },
          {
            id: 'animals-birds-water',
            title: 'Aves acuáticas',
            entries: [
              { id: 'animal-swan', word: 'cygne', translation: 'cisne', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-seagull', word: 'mouette', translation: 'gaviota', articleFr: 'une', articleEs: 'una' },
              { id: 'animal-pelican', word: 'pélican', translation: 'pelícano', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-penguin', word: 'manchot', translation: 'pingüino', articleFr: 'un', articleEs: 'un' }
            ]
          }
        ]
      },
      {
        id: 'animals-insects',
        title: 'Insectos',
        topics: [
          {
            id: 'animals-insects-common',
            title: 'Insectos comunes',
            entries: [
              { id: 'animal-ant', word: 'fourmi', translation: 'hormiga', articleFr: 'une', articleEs: 'una' },
              { id: 'animal-bee', word: 'abeille', translation: 'abeja', articleFr: 'une', articleEs: 'una' },
              { id: 'animal-wasp', word: 'guêpe', translation: 'avispa', articleFr: 'une', articleEs: 'una' },
              { id: 'animal-fly', word: 'mouche', translation: 'mosca', articleFr: 'une', articleEs: 'una' },
              { id: 'animal-mosquito', word: 'moustique', translation: 'mosquito', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-butterfly', word: 'papillon', translation: 'mariposa', articleFr: 'un', articleEs: 'una' },
              { id: 'animal-moth', word: 'papillon de nuit', translation: 'polilla', articleFr: 'un', articleEs: 'una' },
              { id: 'animal-beetle', word: 'scarabée', translation: 'escarabajo', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-ladybug', word: 'coccinelle', translation: 'mariquita', articleFr: 'une', articleEs: 'una' },
              { id: 'animal-grasshopper', word: 'sauterelle', translation: 'saltamontes', articleFr: 'une', articleEs: 'un' }
            ]
          },
          {
            id: 'animals-insects-stinging',
            title: 'Insectos que pican',
            entries: [
              { id: 'animal-hornet', word: 'frelon', translation: 'avispón', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-tick', word: 'tique', translation: 'garrapata', articleFr: 'une', articleEs: 'una' }
            ]
          }
        ]
      },
      {
        id: 'animals-reptiles-amphibians',
        title: 'Reptiles y anfibios',
        topics: [
          {
            id: 'animals-reptiles',
            title: 'Reptiles',
            entries: [
              { id: 'animal-snake', word: 'serpent', translation: 'serpiente', articleFr: 'une', articleEs: 'una' },
              { id: 'animal-lizard', word: 'lézard', translation: 'lagarto', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-crocodile', word: 'crocodile', translation: 'cocodrilo', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-turtle', word: 'tortue', translation: 'tortuga', articleFr: 'une', articleEs: 'una' },
              { id: 'animal-iguana', word: 'iguane', translation: 'iguana', articleFr: 'un', articleEs: 'una' },
              { id: 'animal-chameleon', word: 'caméléon', translation: 'camaleón', articleFr: 'un', articleEs: 'un' }
            ]
          },
          {
            id: 'animals-amphibians',
            title: 'Anfibios',
            entries: [
              { id: 'animal-frog', word: 'grenouille', translation: 'rana', articleFr: 'une', articleEs: 'una' },
              { id: 'animal-toad', word: 'crapaud', translation: 'sapo', articleFr: 'un', articleEs: 'un' },
              { id: 'animal-salamander', word: 'salamandre', translation: 'salamandra', articleFr: 'une', articleEs: 'una' }
            ]
          }
        ]
      }
    ]
  };

  window.COQ_VOCABULARY_ANIMALS = Object.freeze(animals);
  window.COQ_VOCABULARY_CATEGORIES = Object.freeze([animals]);
})();
