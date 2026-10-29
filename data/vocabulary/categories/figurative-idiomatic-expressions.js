/* COQ — Expresiones figuradas e idiomáticas */
(function () {
  'use strict';

  const category = {
    id: 'figurative-idiomatic-expressions',
    title: 'Expresiones figuradas e idiomáticas',
    subcategories: [
      {
        id: 'relations-behavior',
        title: 'Relaciones, personas y comportamiento',
        entries: [
          ['poser-un-lapin','poser un lapin','dejar plantado a alguien'],
          ['faire-connaissance','faire connaissance','conocerse'],
          ['se-mettre-dans-la-peau','se mettre dans la peau de quelqu’un','ponerse en el lugar de alguien'],
          ['etre-dans-les-petits-papiers','être dans les petits papiers de quelqu’un','estar en gracia de alguien'],
          ['avoir-quelqu-un-dans-le-nez','avoir quelqu’un dans le nez','tenerle manía a alguien'],
          ['ne-pas-pouvoir-voir-en-peinture','ne pas pouvoir voir quelqu’un en peinture','no poder ni ver a alguien'],
          ['faire-bande-a-part','faire bande à part','ir por separado'],
          ['tirer-les-vers-du-nez','tirer les vers du nez','sacarle información a alguien'],
          ['mettre-quelqu-un-a-l-aise','mettre quelqu’un à l’aise','hacer que alguien se sienta cómodo'],
          ['tenir-compagnie','tenir compagnie','hacer compañía'],
          ['se-foutre-de-quelqu-un','se foutre de quelqu’un','burlarse de alguien / que alguien te importe un bledo'],
          ['tomber-sur-quelqu-un','tomber sur quelqu’un','encontrarse con alguien por casualidad'],
          ['mettre-un-rateau','mettre un râteau','rechazar a alguien / dar calabazas'],
          ['casser-les-oreilles','casser les oreilles','molestar / hacer ruido insoportable']
        ]
      },
      {
        id: 'emotions-moods',
        title: 'Emociones y estados de ánimo',
        entries: [
          ['broyer-du-noir','broyer du noir','estar deprimido / estar de bajón'],
          ['avoir-le-moral-dans-les-chaussettes','avoir le moral dans les chaussettes','estar de bajón'],
          ['etre-aux-anges','être aux anges','estar encantado / estar en las nubes'],
          ['etre-de-mauvaise-humeur','être de mauvaise humeur','estar de mal humor'],
          ['etre-de-bonne-humeur','être de bonne humeur','estar de buen humor'],
          ['prendre-son-mal-en-patience','prendre son mal en patience','armarse de paciencia'],
          ['avoir-le-coeur-gros','avoir le cœur gros','estar triste / tener el corazón apesadumbrado'],
          ['avoir-le-coeur-leger','avoir le cœur léger','sentirse aliviado / despreocupado'],
          ['etre-rouge-de-honte','être rouge de honte','estar rojo de vergüenza'],
          ['etre-vert-de-rage','être vert de rage','estar verde de rabia'],
          ['humour-noir','l’humour noir','humor negro']
        ]
      },
      {
        id: 'daily-life-events',
        title: 'Vida cotidiana y acontecimientos',
        entries: [
          ['pendre-la-cremaillere','pendre la crémaillère','hacer una fiesta de inauguración de una casa'],
          ['faire-une-nuit-blanche','faire une nuit blanche','pasar una noche en vela'],
          ['faire-la-grasse-matinee','faire la grasse matinée','dormir hasta tarde'],
          ['tomber-dans-les-pommes','tomber dans les pommes','desmayarse'],
          ['avoir-un-coup-de-barre','avoir un coup de barre','tener un bajón de energía'],
          ['prendre-un-pot','prendre un pot','tomar algo juntos'],
          ['faire-les-quatre-cents-coups','faire les quatre cents coups','hacer de las suyas'],
          ['mettre-les-pieds-dans-le-plat','mettre les pieds dans le plat','meter la pata'],
          ['faire-tout-un-plat','faire tout un plat de quelque chose','hacer un drama de algo'],
          ['mettre-les-petits-plats-dans-les-grands','mettre les petits plats dans les grands','esmerarse / poner toda la carne en el asador'],
          ['avoir-des-fourmis-dans-les-jambes','avoir des fourmis dans les jambes','tener hormigueo en las piernas']
        ]
      },
      {
        id: 'difficulties-problems',
        title: 'Dificultades, problemas y situaciones',
        entries: [
          ['etre-dans-le-petrin','être dans le pétrin','estar en un buen lío'],
          ['etre-au-pied-du-mur','être au pied du mur','estar contra las cuerdas / estar ante una situación límite'],
          ['se-mettre-dans-de-beaux-draps','se mettre dans de beaux draps','meterse en un buen lío'],
          ['sortir-du-petrin','sortir du pétrin','salir del apuro'],
          ['tourner-en-rond','tourner en rond','dar vueltas sin avanzar'],
          ['faire-fausse-route','faire fausse route','equivocarse de camino / ir por mal camino'],
          ['mettre-la-charrue-avant-les-boeufs','mettre la charrue avant les bœufs','poner el carro delante de los bueyes'],
          ['jeter-de-l-huile-sur-le-feu','jeter de l’huile sur le feu','echar leña al fuego'],
          ['mettre-de-l-eau-dans-son-vin','mettre de l’eau dans son vin','moderar sus exigencias'],
          ['mettre-du-beurre-dans-les-epinards','mettre du beurre dans les épinards','mejorar la situación económica / conseguir un ingreso extra']
        ]
      },
      {
        id: 'communication-language',
        title: 'Comunicación, comprensión y secretos',
        entries: [
          ['donner-sa-langue-au-chat','donner sa langue au chat','darse por vencido / no saber la respuesta'],
          ['mettre-les-points-sur-les-i','mettre les points sur les i','dejar las cosas claras'],
          ['tourner-autour-du-pot','tourner autour du pot','andarse con rodeos'],
          ['parler-a-tort-et-a-travers','parler à tort et à travers','hablar sin ton ni son'],
          ['raconter-des-salades','raconter des salades','contar mentiras / inventar historias'],
          ['dire-ses-quatre-verites','dire ses quatre vérités à quelqu’un','decirle a alguien sus cuatro verdades'],
          ['tenir-sa-langue','tenir sa langue','mantener la boca cerrada'],
          ['avoir-un-mot-sur-le-bout-de-la-langue','avoir un mot sur le bout de la langue','tener una palabra en la punta de la lengua'],
          ['passer-un-coup-de-fil','passer un coup de fil','hacer una llamada telefónica'],
          ['jeter-un-oeil','jeter un œil sur quelque chose','echar un vistazo a algo'],
          ['mettre-les-bouchees-doubles','mettre les bouchées doubles','redoblar los esfuerzos'],
          ['appeler-un-chat-un-chat','appeler un chat un chat','llamar a las cosas por su nombre'],
          ['chercher-midi-a-quatorze-heures','chercher midi à quatorze heures','buscarle tres pies al gato'],
          ['couper-les-cheveux-en-quatre','couper les cheveux en quatre','hilar demasiado fino']
        ]
      },
      {
        id: 'money-success-effort',
        title: 'Dinero, éxito, trabajo y esfuerzo',
        entries: [
          ['couter-les-yeux-de-la-tete','coûter les yeux de la tête','costar un ojo de la cara'],
          ['couter-un-bras','coûter un bras','costar un dineral'],
          ['jeter-l-argent-par-les-fenetres','jeter l’argent par les fenêtres','tirar el dinero'],
          ['vivre-au-dessus-de-ses-moyens','vivre au-dessus de ses moyens','vivir por encima de sus posibilidades'],
          ['mettre-la-main-a-la-pate','mettre la main à la pâte','poner manos a la obra'],
          ['faire-quelque-chose-les-doigts-dans-le-nez','faire quelque chose les doigts dans le nez','hacer algo con los ojos cerrados / muy fácilmente'],
          ['se-couper-en-quatre','se couper en quatre','desvivirse por alguien / hacer todo lo posible'],
          ['retrousser-ses-manches','retrousser ses manches','ponerse manos a la obra'],
          ['travailler-d-arrache-pied','travailler d’arrache-pied','trabajar duramente'],
          ['faire-des-pieds-et-des-mains','faire des pieds et des mains','hacer todo lo posible'],
          ['faire-d-une-pierre-deux-coups','faire d’une pierre deux coups','matar dos pájaros de un tiro'],
          ['avoir-plusieurs-cordes-a-son-arc','avoir plusieurs cordes à son arc','tener varios recursos'],
          ['tirer-son-epingle-du-jeu','tirer son épingle du jeu','salir airoso de una situación'],
          ['prendre-le-taureau-par-les-cornes','prendre le taureau par les cornes','coger el toro por los cuernos'],
          ['jeter-l-eponge','jeter l’éponge','tirar la toalla'],
          ['baisser-les-bras','baisser les bras','darse por vencido'],
          ['tenir-le-coup','tenir le coup','aguantar'],
          ['ne-pas-etre-sorti-de-l-auberge','ne pas être sorti de l’auberge','no haber salido todavía del problema']
        ]
      },
      {
        id: 'source-animals',
        title: 'Animales',
        entries: [
          ['avoir-du-toupet','avoir du toupet','tener mucho descaro'],
          ['avoir-les-deux-pieds-dans-le-meme-sabot','avoir les deux pieds dans le même sabot','ser torpe o poco resolutivo'],
          ['avoir-une-haleine-de-chacal','avoir une haleine de chacal','tener un aliento horrible'],
          ['ca-ne-casse-pas-trois-pattes-a-un-canard','ça ne casse pas trois pattes à un canard','no es nada del otro mundo'],
          ['etre-meduse','être médusé','quedarse estupefacto'],
          ['le-serpent-se-mord-la-queue','c’est le serpent qui se mord la queue','es un círculo vicioso'],
          ['clouer-le-bec','clouer le bec','hacer callar a alguien'],
          ['comme-un-poisson-dans-leau','être comme un poisson dans l’eau','sentirse como pez en el agua'],
          ['copains-comme-cochons','être copains comme cochons','ser uña y carne'],
          ['vent-a-decorner-les-boeufs','du vent à décorner les bœufs','un viento fortísimo'],
          ['faire-lautruche','faire l’autruche','hacer el avestruz / ignorar un problema'],
          ['faire-une-queue-de-poisson','faire une queue de poisson','cerrarle el paso a alguien con el coche'],
          ['anguille-sous-roche','il y a anguille sous roche','aquí hay gato encerrado'],
          ['chiens-ne-font-pas-des-chats','les chiens ne font pas des chats','de tal palo, tal astilla'],
          ['mere-poule','être une mère poule','ser una madre sobreprotectora'],
          ['mettre-la-puce-a-loreille','mettre la puce à l’oreille','hacer sospechar'],
          ['monter-sur-ses-grands-chevaux','monter sur ses grands chevaux','ponerse hecho una furia'],
          ['pas-gardé-les-cochons','nous n’avons pas gardé les cochons ensemble','no tenemos tanta confianza'],
          ['vache-espagnole','parler français comme une vache espagnole','hablar francés muy mal'],
          ['passer-du-coq-a-lane','passer du coq à l’âne','saltar de un tema a otro'],
          ['pleuvoir-vache-qui-pisse','pleuvoir comme vache qui pisse','llover a cántaros'],
          ['quand-les-poules-auront-des-dents','quand les poules auront des dents','cuando las ranas críen pelo'],
          ['reprendre-du-poil-de-la-bete','reprendre du poil de la bête','recuperarse / volver a remontar'],
          ['gueule-du-loup','se jeter dans la gueule du loup','meterse en la boca del lobo'],
          ['chiens-de-faience','se regarder en chiens de faïence','mirarse con hostilidad sin decir nada'],
          ['tete-de-linotte','être une tête de linotte','ser un despistado'],
          ['larmes-de-crocodile','verser des larmes de crocodile','llorar lágrimas de cocodrilo']
        ]
      },
      {
        id: 'source-nature',
        title: 'Naturaleza y clima',
        entries: [
          ['appuyer-sur-le-champignon','appuyer sur le champignon','pisar el acelerador'],
          ['au-ras-des-paquerettes','être au ras des pâquerettes','ser muy bajo / de poca calidad'],
          ['tete-dans-les-nuages','avoir la tête dans les nuages','estar en las nubes'],
          ['a-fleur-de-peau','être à fleur de peau','estar a flor de piel'],
          ['cest-le-bouquet','c’est le bouquet','esto ya es el colmo'],
          ['mer-a-boire','ce n’est pas la mer à boire','no es para tanto'],
          ['aiguille-botte-de-foin','chercher une aiguille dans une botte de foin','buscar una aguja en un pajar'],
          ['couper-lherbe-sous-le-pied','couper l’herbe sous le pied','quitarle la oportunidad a alguien'],
          ['decouvrir-le-pot-aux-roses','découvrir le pot aux roses','descubrir el pastel'],
          ['deplacer-des-montagnes','déplacer des montagnes','mover montañas'],
          ['pas-le-feu-au-lac','il n’y a pas le feu au lac','no hay ninguna prisa'],
          ['jeter-la-pierre','jeter la pierre à quelqu’un','echarle la culpa a alguien'],
          ['ciel-tombe-sur-la-tete','le ciel nous tombe sur la tête','se nos viene el mundo encima'],
          ['monde-est-petit','le monde est petit','el mundo es un pañuelo'],
          ['mariage-pluvieux','mariage pluvieux, mariage heureux','boda lluviosa, boda dichosa'],
          ['pluie-et-beau-temps','parler de la pluie et du beau temps','hablar del tiempo y de cosas triviales'],
          ['se-sentir-pousser-des-ailes','se sentir pousser des ailes','sentirse capaz de todo'],
          ['six-pieds-sous-terre','être six pieds sous terre','estar muerto / bajo tierra'],
          ['soleil-de-plomb','un soleil de plomb','un sol de justicia'],
          ['souffler-chaud-et-froid','souffler le chaud et le froid','dar señales contradictorias'],
          ['toucher-du-bois','toucher du bois','tocar madera']
        ]
      },
      {
        id: 'source-food',
        title: 'Comida y cocina',
        entries: [
          ['aller-se-faire-cuire-un-oeuf','aller se faire cuire un œuf','mandar a alguien a freír espárragos'],
          ['avoir-la-dalle','avoir la dalle','tener un hambre tremenda'],
          ['avoir-la-patate','avoir la patate / avoir la frite','estar lleno de energía'],
          ['coeur-dartichaut','avoir un cœur d’artichaut','enamorarse con facilidad'],
          ['tasse-de-the','ce n’est pas ma tasse de thé','no es lo mío'],
          ['courir-sur-le-haricot','courir sur le haricot à quelqu’un','sacarle de quicio a alguien'],
          ['cucul-la-praline','être cucul la praline','ser cursi / ñoño'],
          ['tout-un-fromage','en faire tout un fromage','hacer una montaña de un grano de arena'],
          ['fin-des-haricots','c’est la fin des haricots','es el fin de todo / ya no hay solución'],
          ['lacher-la-grappe','lâcher la grappe à quelqu’un','dejar a alguien en paz'],
          ['carottes-sont-cuites','les carottes sont cuites','todo está perdido'],
          ['marcher-sur-des-oeufs','marcher sur des œufs','andar con pies de plomo'],
          ['grain-de-sel','mettre son grain de sel','meter baza'],
          ['mi-figue-mi-raisin','être mi-figue mi-raisin','estar entre dos aguas / tener sentimientos encontrados'],
          ['pedaler-dans-la-semoule','pédaler dans la semoule','estar atascado y no avanzar'],
          ['pleurer-comme-madeleine','pleurer comme une madeleine','llorar a moco tendido'],
          ['porter-un-toast','porter un toast','brindar'],
          ['ramener-sa-fraise','ramener sa fraise','meterse donde no lo llaman'],
          ['rouler-dans-la-farine','rouler quelqu’un dans la farine','engañar a alguien'],
          ['se-fendre-la-poire','se fendre la poire','partirse de risa'],
          ['soupe-au-lait','être soupe au lait','tener un carácter explosivo']
        ]
      },
      {
        id: 'source-body',
        title: 'Cuerpo y gestos',
        entries: [
          ['peur-au-ventre','avoir la peur au ventre','estar muerto de miedo'],
          ['tete-en-lair','avoir la tête en l’air','ser despistado'],
          ['coeur-sur-la-main','avoir le cœur sur la main','tener un corazón de oro'],
          ['chevilles-enflent','avoir les chevilles qui enflent','tener humos / creérselo demasiado'],
          ['dents-rayent-parquet','avoir les dents qui rayent le parquet','tener una ambición desmedida'],
          ['jambes-en-coton','avoir les jambes en coton','tener las piernas temblorosas'],
          ['oreilles-qui-sifflent','avoir les oreilles qui sifflent','que te piten los oídos'],
          ['yeux-plus-gros-ventre','avoir les yeux plus gros que le ventre','comer por los ojos'],
          ['case-en-moins','avoir une case en moins','faltarle un tornillo'],
          ['dormir-comme-bebe','dormir comme un bébé','dormir como un tronco'],
          ['etre-culotte','être culotté','tener mucho morro'],
          ['cuillere-argent-bouche','être né avec une cuillère d’argent dans la bouche','nacer en cuna de oro'],
          ['jupes-de-sa-mere','être toujours dans les jupes de sa mère','estar siempre pegado a las faldas de su madre'],
          ['garder-son-sang-froid','garder son sang-froid','mantener la sangre fría'],
          ['huile-de-coude','mettre de l’huile de coude','darle al codo / esforzarse físicamente'],
          ['monde-au-balcon','avoir du monde au balcon','tener mucho pecho'],
          ['moutarde-monte-au-nez','la moutarde lui monte au nez','estar empezando a enfadarse'],
          ['bras-men-tombent','les bras m’en tombent','me quedo de piedra'],
          ['murs-ont-des-oreilles','les murs ont des oreilles','las paredes oyen'],
          ['petit-doigt-ma-dit','mon petit doigt m’a dit','me lo ha dicho un pajarito'],
          ['yeux-en-face-trous','ne pas avoir les yeux en face des trous','no ver ni torta'],
          ['pied-danser','ne pas savoir sur quel pied danser','no saber a qué atenerse'],
          ['poudre-aux-yeux','jeter de la poudre aux yeux','deslumbrar con falsas apariencias'],
          ['sans-queue-ni-tete','être sans queue ni tête','no tener ni pies ni cabeza'],
          ['creper-le-chignon','se crêper le chignon','tirarse de los pelos'],
          ['se-dorer-la-pilule','se dorer la pilule','tomar el sol / vaguear al sol'],
          ['sang-dencre','se faire un sang d’encre','comerse la cabeza de preocupación'],
          ['pied-gauche','se lever du pied gauche','levantarse con el pie izquierdo'],
          ['se-plier-en-quatre','se plier en quatre','hacer lo imposible por alguien'],
          ['se-prendre-la-tete','se prendre la tête','comerse la cabeza'],
          ['tomber-des-nues','tomber des nues','quedarse de piedra'],
          ['vendre-la-meche','vendre la mèche','irse de la lengua / revelar el secreto']
        ]
      },
      {
        id: 'source-love',
        title: 'Amor y relaciones',
        entries: [
          ['atomes-croches','avoir des atomes crochus avec quelqu’un','tener mucha química con alguien'],
          ['loin-des-yeux-pres-du-coeur','loin des yeux, près du cœur','ojos que no ven, corazón que no siente (o el cariño perdura en la distancia)'],
          ['lune-de-miel','lune de miel','luna de miel'],
          ['tenir-la-chandelle','tenir la chandelle','hacer de sujetavelas'],
          ['perle-rare','trouver la perle rare','encontrar una joya / a alguien excepcional'],
          ['vivre-amour-eau-fraiche','vivre d’amour et d’eau fraîche','vivir del amor y del aire']
        ]
      },
      {
        id: 'source-money',
        title: 'Dinero y gastos',
        entries: [
          ['arrondir-fins-de-mois','arrondir les fins de mois','llegar mejor a fin de mes'],
          ['oursins-dans-poches','avoir des oursins dans les poches','ser un agarrado'],
          ['couter-peau-fesses','coûter la peau des fesses','costar un ojo de la cara'],
          ['argent-brule-doigts','l’argent lui brûle les doigts','no poder conservar el dinero'],
          ['payer-rubis-sur-ongle','payer rubis sur l’ongle','pagar al contado y sin falta'],
          ['toucher-pactole','toucher le pactole','llevarse un buen premio / ganar mucho dinero'],
          ['trois-francs-six-sous','trois francs six sous','cuatro perras']
        ]
      },
      {
        id: 'source-material',
        title: 'Objetos y situaciones cotidianas',
        entries: [
          ['amuser-galerie','amuser la galerie','hacer reír al público / buscar llamar la atención'],
          ['arrondir-angles','arrondir les angles','suavizar las diferencias'],
          ['ca-fait-des-lustres','ça fait des lustres','hace muchísimo tiempo'],
          ['pointe-technologie','être à la pointe de la technologie','estar a la vanguardia tecnológica'],
          ['cinquieme-roue-carrosse','être la cinquième roue du carrosse','sentirse como un cero a la izquierda'],
          ['hopital-charite','c’est l’hôpital qui se fout de la charité','le dijo la sartén al cazo'],
          ['cest-royal','c’est royal','es estupendo / es de lujo'],
          ['porte-pas-a-cote','ce n’est pas la porte à côté','está muy lejos'],
          ['chapeau-bas','chapeau bas','me quito el sombrero'],
          ['couper-les-ponts','couper les ponts','romper todo contacto'],
          ['cul-de-sac','être dans un cul-de-sac','estar en un callejón sin salida'],
          ['pas-prendre-pincettes','ne pas être à prendre avec des pincettes','tener muy mal genio'],
          ['croix-et-banniere','c’est la croix et la bannière','es un calvario'],
          ['goutte-eau-vase','la goutte d’eau qui fait déborder le vase','la gota que colma el vaso'],
          ['clou-spectacle','le clou du spectacle','el plato fuerte del espectáculo'],
          ['lumiere-etages','ne pas avoir la lumière à tous les étages','no tener todas las luces'],
          ['peigne-fin','passer quelque chose au peigne fin','examinar algo con lupa'],
          ['lettre-a-la-poste','passer comme une lettre à la poste','pasar sin problemas'],
          ['passer-leponge','passer l’éponge','hacer borrón y cuenta nueva'],
          ['peter-un-cable','péter un câble','perder los estribos'],
          ['emmeler-les-pinceaux','s’emmêler les pinceaux','hacerse un lío'],
          ['chapeaux-de-roues','sur les chapeaux de roues','a toda velocidad'],
          ['baton-se-faire-battre','tendre le bâton pour se faire battre','buscarse problemas'],
          ['tirer-sur-la-corde','tirer sur la corde','abusar de una situación'],
          ['moulin-a-paroles','être un moulin à paroles','hablar por los codos'],
          ['voir-midi-a-sa-porte','voir midi à sa porte','ver las cosas desde su propio punto de vista']
        ]
      },
      {
        id: 'source-clothes',
        title: 'Ropa y apariencia',
        entries: [
          ['habille-pour-hiver','être habillé pour l’hiver','recibir críticas por todas partes'],
          ['habit-ne-fait-pas-moine','l’habit ne fait pas le moine','el hábito no hace al monje'],
          ['se-mettre-sur-son-31','se mettre sur son trente-et-un','vestirse de punta en blanco'],
          ['trouver-chaussure-pied','trouver chaussure à son pied','encontrar la horma de su zapato'],
          ['vider-son-sac','vider son sac','soltarlo todo / desahogarse']
        ]
      },
      {
        id: 'source-society',
        title: 'Sociedad y vida cotidiana',
        entries: [
          ['cage-doree','une cage dorée','una jaula de oro'],
          ['faire-greve','faire grève','hacer huelga'],
          ['reve-americain','le rêve américain','el sueño americano'],
          ['metro-boulot-dodo','métro, boulot, dodo','casa, trabajo y dormir; la rutina diaria'],
          ['coup-de-vieux','prendre un coup de vieux','sentirse de golpe más viejo'],
          ['regarder-realite-face','regarder la réalité en face','afrontar la realidad']
        ]
      },
      {
        id: 'source-mystery',
        title: 'Expresiones culturales y misteriosas',
        entries: [
          ['epee-de-damocles','une épée de Damoclès','una espada de Damocles'],
          ['vrai-zombie','être un vrai zombie','estar como un zombi'],
          ['eponge-emotionnelle','être une éponge émotionnelle','ser una esponja emocional'],
          ['avocat-du-diable','jouer l’avocat du diable','hacer de abogado del diablo'],
          ['boite-de-pandore','ouvrir la boîte de Pandore','abrir la caja de Pandora'],
          ['eglise-milieu-village','remettre l’église au milieu du village','poner las cosas en su sitio'],
          ['sainte-nitouche','être une sainte-nitouche','hacerse el santo / la santa'],
          ['cuisse-jupiter','se croire sorti de la cuisse de Jupiter','creerse el ombligo del mundo'],
          ['tirer-diable-queue','tirer le diable par la queue','andar muy justo de dinero'],
          ['un-ange-passe','un ange passe','se hace un silencio incómodo']
        ]
      },
      {
        id: 'source-travel',
        title: 'Viajes y caminos',
        entries: [
          ['aller-a-vau-leau','aller à vau-l’eau','ir a la deriva / ir cuesta abajo'],
          ['quatre-coins-monde','aux quatre coins du monde','por los cuatro rincones del mundo'],
          ['chateaux-en-espagne','bâtir des châteaux en Espagne','hacer castillos en el aire'],
          ['mal-barre','être mal barré','ir por mal camino'],
          ['perdre-le-nord','perdre le nord','perder el norte'],
          ['chemins-mènent-rome','tous les chemins mènent à Rome','todos los caminos llevan a Roma']
        ]
      },
      {
        id: 'source-literature',
        title: 'Literatura y lenguaje',
        entries: [
          ['allo','allô','¿diga? / ¿hola? (al contestar el teléfono)'],
          ['au-pied-de-la-lettre','prendre au pied de la lettre','tomar al pie de la letra'],
          ['article-de-la-mort','être à l’article de la mort','estar al borde de la muerte'],
          ['as-orthographe','être un as de l’orthographe','ser un as de la ortografía'],
          ['de-fil-en-aiguille','de fil en aiguille','poco a poco / de hilo en hilo'],
          ['long-large-travers','en long, en large et en travers','de arriba abajo / por todas partes'],
          ['lire-entre-les-lignes','lire entre les lignes','leer entre líneas'],
          ['par-dessus-marche','par-dessus le marché','encima / para colmo'],
          ['appeler-arthur','se faire appeler Arthur','recibir una reprimenda'],
          ['un-de-ces-quatre','un de ces quatre','uno de estos días']
        ]
      },
      {
        id: 'source-colors',
        title: 'Colores y emociones',
        entries: [
          ['eau-de-rose','à l’eau de rose','romántico y empalagoso'],
          ['en-voir-toutes-couleurs','en voir de toutes les couleurs','pasarlas canutas'],
          ['fleur-bleue','être fleur bleue','ser muy romántico / sentimental'],
          ['noir-de-monde','noir de monde','abarrotado de gente'],
          ['rire-jaune','rire jaune','reírse por compromiso'],
        ]
      },
      {
        id: 'source-proverbs',
        title: 'Proverbios y refranes',
        entries: [
          ['bonne-etoile','être né sous une bonne étoile','nacer con buena estrella'],
          ['peau-ours-avant-tuer','il ne faut pas vendre la peau de l’ours avant de l’avoir tué','no hay que vender la piel del oso antes de cazarlo'],
          ['bave-crapaud-colombe','la bave du crapaud n’atteint pas la blanche colombe','las calumnias no manchan a quien es inocente'],
          ['nuit-porte-conseil','la nuit porte conseil','consultarlo con la almohada'],
          ['avenir-mains','l’avenir est entre vos mains','el futuro está en tus manos'],
          ['cordonniers-mal-chausses','les cordonniers sont toujours les plus mal chaussés','en casa del herrero, cuchillo de palo'],
          ['chat-absent-souris-dansent','quand le chat n’est pas là, les souris dansent','cuando el gato no está, los ratones bailan'],
          ['tous-gouts-nature','tous les goûts sont dans la nature','hay gustos para todo']
        ]
      },
      {
        id: 'source-risque',
        title: 'Expresiones coloquiales y de doble sentido',
        entries: [
          ['grimper-au-rideau','grimper au rideau','ponerse a cien / alcanzar el orgasmo'],
          ['prendre-son-pied','prendre son pied','disfrutar muchísimo / alcanzar el orgasmo'],
          ['rouler-une-pelle','rouler une pelle / rouler un patin','dar un beso con lengua'],
          ['envoyer-en-lair','s’envoyer en l’air','tener relaciones sexuales'],
          ['tailler-une-pipe','tailler une pipe','hacer una felación']
        ]
      },
      {
        id: 'source-vulgar',
        title: 'Expresiones vulgares',
        entries: [
          ['merde-dans-les-yeux','avoir de la merde dans les yeux','estar ciego / no querer ver lo evidente'],
          ['tete-dans-le-cul','avoir la tête dans le cul','estar hecho polvo / tener resaca'],
          ['cul-borde-de-nouilles','avoir le cul bordé de nouilles','tener una suerte increíble'],
          ['cul-entre-deux-chaises','avoir le cul entre deux chaises','estar entre dos aguas'],
          ['feu-au-cul','avoir le feu au cul','ser muy inquieto / tener muchas ganas de sexo'],
          ['gout-de-chiottes','avoir un goût de chiottes','tener un gusto horrible'],
          ['ca-me-gonfle','ça me gonfle','me toca las narices'],
          ['chier-dans-la-colle','chier dans la colle','meter la pata de forma garrafal'],
          ['chier-des-bulles','chier des bulles','estar muy enfadado (vulgar)'],
          ['cul-et-chemise','être comme cul et chemise','ser uña y carne'],
          ['etre-dans-la-merde','être dans la merde','estar en la mierda / en un buen lío'],
          ['tomber-de-la-merde','il va tomber de la merde','va a caer una buena (vulgar)'],
          ['couille-dans-le-pate','il y a une couille dans le pâté','hay algo que no cuadra (vulgar)'],
          ['lacher-une-caisse','lâcher une caisse','tirarse un pedo'],
          ['leche-cul','un lèche-cul','un lameculos'],
          ['trou-du-cul-du-monde','le trou du cul du monde','el culo del mundo'],
          ['mangez-vos-morts','mangez vos morts','insulto vulgar: iros a la mierda'],
          ['chier-une-pendule','ne pas nous en chier une pendule','no montar un numerito por eso (vulgar)'],
          ['peter-plus-haut-que-son-cul','péter plus haut que son cul','ser un creído / darse aires'],
          ['pisser-dans-un-violon','pisser dans un violon','predicar en el desierto'],
          ['rire-cul-par-terre','rire à se taper le cul par terre','partirse el culo de risa'],
          ['beurre-argent-cremiere','vouloir le beurre, l’argent du beurre et le cul de la crémière','quererlo todo sin renunciar a nada (vulgar)']
        ]
      },
    ].map((subcategory) => ({
      ...subcategory,
      entries: subcategory.entries.map(([id, word, translation]) => ({
        id: 'idiom-' + id,
        word,
        translation
      }))
    }))
  };

  if (window.COQ_VOCABULARY_DATABASE_API) {
    window.COQ_VOCABULARY_DATABASE_API.registerCategory(category);
  }
})();