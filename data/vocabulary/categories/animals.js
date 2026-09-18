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
              { id: 'animal-dog', word: 'chien', translation: 'perro', definition: 'Animal doméstico de la familia de los cánidos.' },
              { id: 'animal-cat', word: 'chat', translation: 'gato', definition: 'Animal doméstico de la familia de los félidos.' },
              { id: 'animal-rabbit', word: 'lapin', translation: 'conejo', definition: 'Pequeño mamífero doméstico de orejas largas.' },
              { id: 'animal-hamster', word: 'hamster', translation: 'hámster', definition: 'Pequeño roedor que puede vivir como animal de compañía.' },
              { id: 'animal-guinea-pig', word: 'cochon d’Inde', translation: 'cobaya', definition: 'Pequeño roedor doméstico también llamado conejillo de Indias.' }
            ]
          },
          {
            id: 'animals-domestic-birds',
            title: 'Aves domésticas',
            entries: [
              { id: 'animal-parakeet', word: 'perruche', translation: 'periquito', definition: 'Pequeña ave que se cría como animal de compañía.' },
              { id: 'animal-canary', word: 'canari', translation: 'canario', definition: 'Pequeña ave doméstica conocida por su canto.' }
            ]
          },
          {
            id: 'animals-domestic-fish',
            title: 'Animales acuáticos domésticos',
            entries: [
              { id: 'animal-goldfish', word: 'poisson rouge', translation: 'pez dorado', definition: 'Pez de agua dulce frecuente en acuarios domésticos.' }
            ]
          },
          {
            id: 'animals-domestic-care',
            title: 'Cuidado y compañía',
            entries: [
              { id: 'animal-pet', word: 'animal de compagnie', translation: 'mascota', definition: 'Animal que vive con las personas como compañero.' },
              { id: 'animal-collar', word: 'collier', translation: 'collar', definition: 'Accesorio que se coloca alrededor del cuello de un animal.' }
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
              { id: 'animal-cow', word: 'vache', translation: 'vaca', definition: 'Hembra adulta del ganado bovino.' },
              { id: 'animal-bull', word: 'taureau', translation: 'toro', definition: 'Macho adulto del ganado bovino.' },
              { id: 'animal-horse', word: 'cheval', translation: 'caballo', definition: 'Mamífero doméstico utilizado tradicionalmente para montar y trabajar.' },
              { id: 'animal-donkey', word: 'âne', translation: 'burro', definition: 'Mamífero doméstico de la familia de los équidos.' },
              { id: 'animal-pig', word: 'cochon', translation: 'cerdo', definition: 'Mamífero doméstico criado principalmente para obtener carne.' },
              { id: 'animal-sheep', word: 'mouton', translation: 'oveja', definition: 'Ovino doméstico criado, entre otras cosas, por su lana y su carne.' },
              { id: 'animal-goat', word: 'chèvre', translation: 'cabra', definition: 'Hembra adulta del ganado caprino.' }
            ]
          },
          {
            id: 'animals-farm-young',
            title: 'Crías',
            entries: [
              { id: 'animal-calf', word: 'veau', translation: 'ternero', definition: 'Cría de la vaca.' },
              { id: 'animal-lamb', word: 'agneau', translation: 'cordero', definition: 'Cría de la oveja.' },
              { id: 'animal-kid', word: 'chevreau', translation: 'cabrito', definition: 'Cría de la cabra.' }
            ]
          },
          {
            id: 'animals-farm-birds',
            title: 'Aves de granja',
            entries: [
              { id: 'animal-chicken', word: 'poule', translation: 'gallina', definition: 'Hembra adulta de la gallina doméstica.' },
              { id: 'animal-rooster', word: 'coq', translation: 'gallo', definition: 'Macho adulto de la gallina doméstica.' },
              { id: 'animal-chick', word: 'poussin', translation: 'pollito', definition: 'Cría de la gallina.' },
              { id: 'animal-duck', word: 'canard', translation: 'pato', definition: 'Ave acuática que también se cría en granjas.' },
              { id: 'animal-goose', word: 'oie', translation: 'ganso', definition: 'Ave acuática doméstica de gran tamaño.' },
              { id: 'animal-turkey', word: 'dindon', translation: 'pavo', definition: 'Ave doméstica de gran tamaño.' }
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
              { id: 'animal-lion', word: 'lion', translation: 'león', definition: 'Gran felino salvaje de África y Asia.' },
              { id: 'animal-elephant', word: 'éléphant', translation: 'elefante', definition: 'Gran mamífero terrestre con trompa.' },
              { id: 'animal-giraffe', word: 'girafe', translation: 'jirafa', definition: 'Mamífero de cuello muy largo que vive en África.' },
              { id: 'animal-zebra', word: 'zèbre', translation: 'cebra', definition: 'Mamífero africano caracterizado por sus rayas.' },
              { id: 'animal-rhinoceros', word: 'rhinocéros', translation: 'rinoceronte', definition: 'Gran mamífero con uno o dos cuernos sobre el hocico.' },
              { id: 'animal-hippopotamus', word: 'hippopotame', translation: 'hipopótamo', definition: 'Gran mamífero semiacuático africano.' }
            ]
          },
          {
            id: 'animals-wild-predators',
            title: 'Depredadores',
            entries: [
              { id: 'animal-tiger', word: 'tigre', translation: 'tigre', definition: 'Gran felino salvaje de pelaje rayado.' },
              { id: 'animal-leopard', word: 'léopard', translation: 'leopardo', definition: 'Felino salvaje de pelaje moteado.' },
              { id: 'animal-wolf', word: 'loup', translation: 'lobo', definition: 'Mamífero carnívoro de la familia de los cánidos.' },
              { id: 'animal-fox', word: 'renard', translation: 'zorro', definition: 'Mamífero carnívoro de la familia de los cánidos.' },
              { id: 'animal-bear', word: 'ours', translation: 'oso', definition: 'Mamífero grande y omnívoro.' }
            ]
          },
          {
            id: 'animals-wild-primates',
            title: 'Primates',
            entries: [
              { id: 'animal-monkey', word: 'singe', translation: 'mono', definition: 'Mamífero primate no humano.' },
              { id: 'animal-gorilla', word: 'gorille', translation: 'gorila', definition: 'Gran primate africano.' },
              { id: 'animal-chimpanzee', word: 'chimpanzé', translation: 'chimpancé', definition: 'Primate africano estrechamente relacionado con los humanos.' }
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
              { id: 'animal-shark', word: 'requin', translation: 'tiburón', definition: 'Pez marino depredador.' },
              { id: 'animal-dolphin', word: 'dauphin', translation: 'delfín', definition: 'Mamífero marino conocido por su inteligencia y comportamiento social.' },
              { id: 'animal-whale', word: 'baleine', translation: 'ballena', definition: 'Gran mamífero marino.' },
              { id: 'animal-seahorse', word: 'hippocampe', translation: 'caballito de mar', definition: 'Pequeño pez marino con una forma característica.' }
            ]
          },
          {
            id: 'animals-marine-invertebrates',
            title: 'Invertebrados marinos',
            entries: [
              { id: 'animal-octopus', word: 'pieuvre', translation: 'pulpo', definition: 'Molusco marino con ocho brazos.' },
              { id: 'animal-squid', word: 'calmar', translation: 'calamar', definition: 'Molusco marino de cuerpo alargado y tentáculos.' },
              { id: 'animal-jellyfish', word: 'méduse', translation: 'medusa', definition: 'Animal marino de cuerpo gelatinoso y tentáculos.' },
              { id: 'animal-crab', word: 'crabe', translation: 'cangrejo', definition: 'Crustáceo marino con caparazón y pinzas.' },
              { id: 'animal-lobster', word: 'homard', translation: 'bogavante', definition: 'Gran crustáceo marino con pinzas.' },
              { id: 'animal-star-fish', word: 'étoile de mer', translation: 'estrella de mar', definition: 'Animal marino con forma de estrella.' }
            ]
          },
          {
            id: 'animals-marine-reptiles',
            title: 'Reptiles marinos',
            entries: [
              { id: 'animal-sea-turtle', word: 'tortue marine', translation: 'tortuga marina', definition: 'Reptil adaptado a la vida en el mar.' }
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
              { id: 'animal-eagle', word: 'aigle', translation: 'águila', definition: 'Ave rapaz de gran tamaño.' },
              { id: 'animal-owl', word: 'hibou', translation: 'búho', definition: 'Ave rapaz nocturna.' },
              { id: 'animal-parrot', word: 'perroquet', translation: 'loro', definition: 'Ave conocida por su pico curvo y su capacidad para imitar sonidos.' },
              { id: 'animal-pigeon', word: 'pigeon', translation: 'paloma', definition: 'Ave frecuente en ciudades y otros hábitats.' },
              { id: 'animal-sparrow', word: 'moineau', translation: 'gorrión', definition: 'Pequeña ave común.' },
              { id: 'animal-crow', word: 'corbeau', translation: 'cuervo', definition: 'Ave de plumaje generalmente negro.' }
            ]
          },
          {
            id: 'animals-birds-water',
            title: 'Aves acuáticas',
            entries: [
              { id: 'animal-swan', word: 'cygne', translation: 'cisne', definition: 'Ave acuática de cuello largo.' },
              { id: 'animal-seagull', word: 'mouette', translation: 'gaviota', definition: 'Ave marina frecuente en las costas.' },
              { id: 'animal-pelican', word: 'pélican', translation: 'pelícano', definition: 'Ave acuática con un gran saco bajo el pico.' },
              { id: 'animal-penguin', word: 'manchot', translation: 'pingüino', definition: 'Ave marina que no vuela y está adaptada a nadar.' }
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
              { id: 'animal-ant', word: 'fourmi', translation: 'hormiga', definition: 'Pequeño insecto social que vive en colonias.' },
              { id: 'animal-bee', word: 'abeille', translation: 'abeja', definition: 'Insecto que visita flores y produce miel.' },
              { id: 'animal-wasp', word: 'guêpe', translation: 'avispa', definition: 'Insecto volador que puede picar.' },
              { id: 'animal-fly', word: 'mouche', translation: 'mosca', definition: 'Insecto volador común.' },
              { id: 'animal-mosquito', word: 'moustique', translation: 'mosquito', definition: 'Pequeño insecto volador cuyas hembras pueden picar.' },
              { id: 'animal-butterfly', word: 'papillon', translation: 'mariposa', definition: 'Insecto con alas cubiertas de escamas.' },
              { id: 'animal-moth', word: 'papillon de nuit', translation: 'polilla', definition: 'Insecto parecido a una mariposa, generalmente activo de noche.' },
              { id: 'animal-beetle', word: 'scarabée', translation: 'escarabajo', definition: 'Insecto con alas anteriores endurecidas.' },
              { id: 'animal-ladybug', word: 'coccinelle', translation: 'mariquita', definition: 'Pequeño escarabajo generalmente redondeado y de colores vivos.' },
              { id: 'animal-grasshopper', word: 'sauterelle', translation: 'saltamontes', definition: 'Insecto conocido por sus grandes patas traseras para saltar.' }
            ]
          },
          {
            id: 'animals-insects-stinging',
            title: 'Insectos que pican',
            entries: [
              { id: 'animal-hornet', word: 'frelon', translation: 'avispón', definition: 'Gran insecto parecido a una avispa.' },
              { id: 'animal-tick', word: 'tique', translation: 'garrapata', definition: 'Parásito externo que se alimenta de sangre.' }
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
              { id: 'animal-snake', word: 'serpent', translation: 'serpiente', definition: 'Reptil de cuerpo alargado y sin patas.' },
              { id: 'animal-lizard', word: 'lézard', translation: 'lagarto', definition: 'Reptil de cuatro patas y cola.' },
              { id: 'animal-crocodile', word: 'crocodile', translation: 'cocodrilo', definition: 'Gran reptil semiacuático de mandíbulas fuertes.' },
              { id: 'animal-turtle', word: 'tortue', translation: 'tortuga', definition: 'Reptil protegido por un caparazón.' },
              { id: 'animal-iguana', word: 'iguane', translation: 'iguana', definition: 'Reptil herbívoro de zonas cálidas.' },
              { id: 'animal-chameleon', word: 'caméléon', translation: 'camaleón', definition: 'Reptil conocido por su lengua larga y su capacidad para cambiar de color.' }
            ]
          },
          {
            id: 'animals-amphibians',
            title: 'Anfibios',
            entries: [
              { id: 'animal-frog', word: 'grenouille', translation: 'rana', definition: 'Anfibio de patas traseras adaptadas para saltar.' },
              { id: 'animal-toad', word: 'crapaud', translation: 'sapo', definition: 'Anfibio parecido a la rana, de piel generalmente más rugosa.' },
              { id: 'animal-salamander', word: 'salamandre', translation: 'salamandra', definition: 'Anfibio de cuerpo alargado y cola.' }
            ]
          }
        ]
      }
    ]
  };

  window.COQ_VOCABULARY_ANIMALS = Object.freeze(animals);
  window.COQ_VOCABULARY_CATEGORIES = Object.freeze([animals]);
})();
