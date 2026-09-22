/* COQ — Vocabulario · Tecnología y comunicación */
(function () {
  'use strict';

  const category = {
    id: 'technology-communication',
    title: 'Tecnología y comunicación',
    subcategories: [
      {
        id: 'tech-devices',
        title: 'Informática y dispositivos',
        entries: [
          ['ordinateur','ordinateur','ordenador','un','un'],
          ['ordinateur-portable','ordinateur portable','ordenador portátil','un','un'],
          ['tablette','tablette','tableta','une','una'],
          ['telephone-portable','téléphone portable','teléfono móvil','un','un'],
          ['smartphone','smartphone','smartphone','un','un'],
          ['ecran','écran','pantalla','un','una'],
          ['clavier','clavier','teclado','un','el'],
          ['souris','souris','ratón','une','el'],
          ['imprimante','imprimante','impresora','une','la'],
          ['casque','casque','auriculares','un','unos'],
          ['haut-parleur','haut-parleur','altavoz','un','el'],
          ['webcam','webcam','cámara web','une','la'],
          ['chargeur','chargeur','cargador','un','el'],
          ['batterie','batterie','batería','une','una'],
          ['cable','câble','cable','un','el']
        ]
      },
      {
        id: 'tech-internet',
        title: 'Internet y navegación',
        entries: [
          ['internet','Internet','internet'],
          ['site-web','site web','sitio web','un','el'],
          ['page-web','page web','página web','une','la'],
          ['lien','lien','enlace','un','el'],
          ['moteur-de-recherche','moteur de recherche','motor de búsqueda','un','el'],
          ['navigateur','navigateur','navegador','un','el'],
          ['compte','compte','cuenta','un','la'],
          ['profil','profil','perfil','un','el'],
          ['mot-de-passe','mot de passe','contraseña','un','la'],
          ['adresse-electronique','adresse électronique','dirección de correo electrónico','une','la'],
          ['reseau','réseau','red','un','la'],
          ['connexion','connexion','conexión','une','la'],
          ['telechargement','téléchargement','descarga','un','la'],
          ['fichier','fichier','archivo','un','el'],
          ['dossier','dossier','carpeta','un','la']
        ]
      },
      {
        id: 'tech-digital-communication',
        title: 'Comunicación digital',
        entries: [
          ['message','message','mensaje','un','el'],
          ['courriel','courriel','correo electrónico','un','el'],
          ['sms','SMS','SMS','un','el'],
          ['appel','appel','llamada','un','la'],
          ['appel-video','appel vidéo','videollamada','un','la'],
          ['conversation','conversation','conversación','une','la'],
          ['notification','notification','notificación','une','la'],
          ['piece-jointe','pièce jointe','archivo adjunto','une','el'],
          ['destinataire','destinataire','destinatario','un','el'],
          ['destinataire-f','destinataire','destinataria','une','la'],
          ['expediteur','expéditeur','remitente','un','el'],
          ['expeditrice','expéditrice','remitente','une','la'],
          ['envoyer','envoyer','enviar'],
          ['recevoir','recevoir','recibir'],
          ['repondre','répondre','responder'],
          ['transferer','transférer','reenviar'],
          ['telecharger','télécharger','descargar']
        ]
      },
      {
        id: 'tech-social-networks',
        title: 'Redes sociales',
        entries: [
          ['reseau-social','réseau social','red social','un','la'],
          ['publication','publication','publicación','une','la'],
          ['commentaire','commentaire','comentario','un','el'],
          ['photo-de-profil','photo de profil','foto de perfil','une','la'],
          ['abonne-m','abonné','seguidor','un','el'],
          ['abonne-f','abonnée','seguidora','une','la'],
          ['influenceur','influenceur','influencer','un','el'],
          ['influenceuse','influenceuse','influencer','une','la'],
          ['createur-contenu','créateur de contenu','creador de contenido','un','el'],
          ['creatrice-contenu','créatrice de contenu','creadora de contenido','une','la'],
          ['partage','partage','contenido compartido','un','el'],
          ['jaime','« j’aime »','« me gusta »','un','un'],
          ['publier','publier','publicar'],
          ['partager','partager','compartir'],
          ['suivre','suivre','seguir'],
          ['sabonner','s’abonner','suscribirse']
        ]
      },
      {
        id: 'tech-software-apps',
        title: 'Programas y aplicaciones',
        entries: [
          ['logiciel','logiciel','software / programa','un','el'],
          ['application','application','aplicación','une','la'],
          ['programme','programme','programa','un','el'],
          ['mise-a-jour','mise à jour','actualización','une','la'],
          ['version','version','versión','une','la'],
          ['systeme-exploitation','système d’exploitation','sistema operativo','un','el'],
          ['icone','icône','icono','une','el'],
          ['menu','menu','menú','un','el'],
          ['bouton','bouton','botón','un','el'],
          ['fenetre','fenêtre','ventana','une','la'],
          ['installer','installer','instalar'],
          ['desinstaller','désinstaller','desinstalar'],
          ['mettre-a-jour','mettre à jour','actualizar'],
          ['ouvrir','ouvrir','abrir'],
          ['fermer','fermer','cerrar']
        ]
      },
      {
        id: 'tech-data-storage',
        title: 'Datos, archivos y almacenamiento',
        entries: [
          ['donnee','donnée','dato','une','el'],
          ['document','document','documento','un','el'],
          ['image','image','imagen','une','la'],
          ['video','vidéo','vídeo','une','el'],
          ['audio','audio','audio','un','el'],
          ['fichier-pdf','fichier PDF','archivo PDF','un','el'],
          ['copie','copie','copia','une','la'],
          ['sauvegarde','sauvegarde','copia de seguridad','une','la'],
          ['stockage','stockage','almacenamiento','un','el'],
          ['disque-dur','disque dur','disco duro','un','el'],
          ['cle-usb','clé USB','memoria USB','une','la'],
          ['enregistrer','enregistrer','guardar'],
          ['supprimer','supprimer','eliminar'],
          ['copier','copier','copiar'],
          ['coller','coller','pegar']
        ]
      },
      {
        id: 'tech-security-privacy',
        title: 'Seguridad y privacidad digital',
        entries: [
          ['securite','sécurité','seguridad','une','la'],
          ['confidentialite','confidentialité','privacidad','une','la'],
          ['virus','virus','virus','un','el'],
          ['antivirus','antivirus','antivirus','un','el'],
          ['piratage','piratage','pirateo / hackeo','un','el'],
          ['pirate-informatique','pirate informatique','hacker','un','el'],
          ['arnaque','arnaque','estafa','une','la'],
          ['fraude','fraude','fraude','une','la'],
          ['risque','risque','riesgo','un','el'],
          ['autorisation','autorisation','autorización','une','la'],
          ['acces','accès','acceso','un','el'],
          ['bloquer','bloquer','bloquear'],
          ['proteger','protéger','proteger'],
          ['verifier','vérifier','verificar'],
          ['se-connecter','se connecter','iniciar sesión / conectarse'],
          ['se-deconnecter','se déconnecter','cerrar sesión / desconectarse']
        ]
      },
      {
        id: 'tech-actions-concepts',
        title: 'Acciones y conceptos tecnológicos',
        entries: [
          ['communiquer','communiquer','comunicar(se)'],
          ['contacter','contacter','contactar'],
          ['rechercher','rechercher','buscar'],
          ['cliquer','cliquer','hacer clic'],
          ['selectionner','sélectionner','seleccionar'],
          ['saisir','saisir','introducir'],
          ['taper','taper','escribir / teclear'],
          ['imprimer','imprimer','imprimir'],
          ['scanner','scanner','escanear'],
          ['sauvegarder','sauvegarder','guardar'],
          ['connecter','connecter','conectar'],
          ['deconnecter','déconnecter','desconectar'],
          ['recherche','recherche','búsqueda','une','la'],
          ['utilisateur-m','utilisateur','usuario','un','el'],
          ['utilisatrice','utilisatrice','usuaria','une','la']
        ]
      }
    ].map((subcategory) => ({
      ...subcategory,
      entries: subcategory.entries.map(([id, word, translation, articleFr, articleEs]) => ({
        id: 'tech-' + id,
        word,
        translation,
        ...(articleFr ? {articleFr} : {}),
        ...(articleEs ? {articleEs} : {})
      }))
    }))
  };

  if (window.COQ_VOCABULARY_DATABASE_API) {
    window.COQ_VOCABULARY_DATABASE_API.registerCategory(category);
  }
})();