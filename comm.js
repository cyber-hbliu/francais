// Third book: unit order of « Communication progressive du français – niveau débutant » (40 actes de parole, 6 parts).
// Each unit keeps the book's speech act and situation; expressions, dialogues and role-play tasks below are original.
// C(n, acte de parole, situation, goal, expressions [fr, en], dialogue [speaker, line], role-play task, level)
window.COMM_PARTS = [["Faire les courses", 1, 7], ["Renseigner, se renseigner", 8, 14], ["Parler des lieux et des objets", 15, 20], ["Parler aux autres", 21, 28], ["Parler de soi", 29, 33], ["Parler des autres", 34, 40]];
window.COMM = [];
function C(n, title, sit, goal, ex, dlg, task, level) { COMM.push({ n, title, sit, goal, ex, dlg, task, level: level || "A1" }); }

// I Faire les courses
C(1, "Demander des articles", "À la boulangerie-pâtisserie · À la poste", "Demander poliment ce qu'on veut acheter.",
 [["Je voudrais une baguette, s'il vous plaît.", "I'd like a baguette, please."], ["Deux croissants et un pain au chocolat.", "Two croissants and a pain au chocolat."], ["Vous avez des tartes aux pommes ?", "Do you have apple tarts?"], ["Un timbre pour la Chine, s'il vous plaît.", "A stamp for China, please."], ["Je voudrais envoyer ce colis.", "I'd like to send this parcel."], ["Ce sera tout, merci.", "That will be all, thanks."]],
 [["A", "Bonjour madame, vous désirez ?"], ["B", "Une baguette bien cuite, s'il vous plaît."], ["A", "Et avec ceci ?"], ["B", "Deux éclairs au café. Ce sera tout."]],
 "Achetez à la boulangerie le petit-déjeuner pour trois personnes, puis envoyez une carte postale à la poste.");
C(2, "Parler des quantités", "Au marché · À l'épicerie", "Demander une quantité précise ou non précise.",
 [["Un kilo de tomates, s'il vous plaît.", "A kilo of tomatoes, please."], ["Une livre de cerises.", "Half a kilo of cherries."], ["Une bouteille d'huile d'olive.", "A bottle of olive oil."], ["Un paquet de riz et du sucre.", "A packet of rice and some sugar."], ["Je voudrais un peu de fromage.", "I'd like a little cheese."], ["C'est trop ! Un peu moins, s'il vous plaît.", "That's too much! A bit less, please."]],
 [["A", "Bonjour ! Qu'est-ce que je vous sers ?"], ["B", "Un kilo de pommes de terre et trois citrons."], ["A", "Voilà. Et avec ça ?"], ["B", "Un peu de persil, s'il vous plaît."]],
 "Préparez la liste pour une soupe de légumes et achetez chaque produit avec sa quantité.");
C(3, "Demander le prix", "Dans une papeterie", "Demander et comprendre un prix.",
 [["Combien coûte ce cahier ?", "How much is this notebook?"], ["C'est combien, les stylos ?", "How much are the pens?"], ["Ça fait combien en tout ?", "How much is it altogether?"], ["Ça coûte trois euros cinquante.", "It costs €3.50."], ["C'est un peu cher.", "It's a bit expensive."], ["Vous avez moins cher ?", "Do you have anything cheaper?"]],
 [["A", "Pardon, ce classeur, il coûte combien ?"], ["B", "Quatre euros vingt."], ["A", "Et les crayons ?"], ["B", "Un euro pièce, ou cinq euros les six."], ["A", "Je prends le classeur et six crayons."]],
 "Achetez 4 articles de papeterie pour la rentrée ; demandez chaque prix et le total.");
C(4, "Passer une commande", "Chez le poissonnier · Au café", "Commander dans un magasin ou au café.",
 [["Je vais prendre des crevettes.", "I'll have some prawns."], ["C'est pour quatre personnes.", "It's for four people."], ["Un café et un croissant, s'il vous plaît.", "A coffee and a croissant, please."], ["Pour moi, un jus d'orange.", "For me, an orange juice."], ["Qu'est-ce que vous avez comme sandwichs ?", "What kind of sandwiches do you have?"], ["L'addition, s'il vous plaît.", "The bill, please."]],
 [["A", "Bonjour, vous avez choisi ?"], ["B", "Oui, un thé au citron et une tartine."], ["A", "Et pour madame ?"], ["C", "Un grand crème, s'il vous plaît."]],
 "Au café avec un ami : commandez boissons et snacks pour deux, puis demandez l'addition.");
C(5, "Faire une réservation", "À l'hôtel · À la gare", "Réserver une chambre ou un billet de train.",
 [["Je voudrais réserver une chambre pour deux nuits.", "I'd like to book a room for two nights."], ["Une chambre double avec salle de bains.", "A double room with a bathroom."], ["Quel est le prix de la chambre ?", "What's the price of the room?"], ["Un aller-retour pour Bordeaux, s'il vous plaît.", "A return to Bordeaux, please."], ["Quel train part le matin ?", "Which train leaves in the morning?"], ["En première ou en seconde classe ?", "First or second class?"]],
 [["A", "Hôtel du Parc, bonjour."], ["B", "Bonjour, je voudrais réserver une chambre pour le 12 mai."], ["A", "Pour combien de nuits ?"], ["B", "Deux nuits. Quel est le prix ?"], ["A", "Quatre-vingt-dix euros la nuit, petit-déjeuner compris."]],
 "Réservez par téléphone une chambre d'hôtel, puis un billet de train aller-retour au guichet.");
C(6, "Faire des achats", "Dans une boutique de vêtements · Dans un magasin de chaussures", "Choisir, essayer, dire si ça va.",
 [["Je cherche une veste.", "I'm looking for a jacket."], ["Je peux essayer ce pantalon ?", "Can I try on these trousers?"], ["C'est trop grand / trop petit.", "It's too big / too small."], ["Vous avez la taille au-dessus ?", "Do you have the next size up?"], ["Je fais du 39.", "I'm a size 39 (shoes)."], ["Ces chaussures sont assez confortables.", "These shoes are comfortable enough."]],
 [["A", "Je peux vous aider ?"], ["B", "Oui, je voudrais essayer ces baskets en 40."], ["A", "Voilà. Elles vont bien ?"], ["B", "Elles sont un peu trop serrées. Vous avez du 41 ?"]],
 "Dans une boutique : essayez deux vêtements et une paire de chaussures, avec « trop » et « assez ».");
C(7, "Hésiter", "Au magasin d'informatique", "Montrer qu'on hésite et demander conseil.",
 [["Je ne sais pas…", "I don't know…"], ["J'hésite entre ces deux ordinateurs.", "I'm torn between these two computers."], ["Je crois que je préfère celui-ci.", "I think I prefer this one."], ["Qu'est-ce que vous me conseillez ?", "What do you recommend?"], ["Je vais réfléchir.", "I'll think about it."], ["Euh… peut-être.", "Er… maybe."]],
 [["A", "Alors, vous avez choisi ?"], ["B", "Euh… j'hésite. Celui-ci est léger, mais l'autre est moins cher."], ["A", "Pour un étudiant, je vous conseille le léger."], ["B", "Je ne sais pas… je vais réfléchir."]],
 "Vous devez acheter un téléphone : hésitez entre deux modèles, posez des questions, demandez conseil.");

// II Renseigner, se renseigner
C(8, "Prendre rendez-vous", "Chez le dentiste · Au cabinet médical", "Prendre, changer ou confirmer un rendez-vous.",
 [["Je voudrais prendre rendez-vous avec le docteur Dubois.", "I'd like an appointment with Dr Dubois."], ["C'est urgent, j'ai très mal aux dents.", "It's urgent, I have bad toothache."], ["Le plus tôt possible, s'il vous plaît.", "As soon as possible, please."], ["Mercredi à 14 heures, ça vous convient ?", "Wednesday at 2 p.m., does that suit you?"], ["Je dois déplacer mon rendez-vous.", "I need to move my appointment."], ["C'est à quel nom ?", "Under what name?"]],
 [["A", "Cabinet dentaire, bonjour."], ["B", "Bonjour, j'ai mal à une dent. C'est possible aujourd'hui ?"], ["A", "Aujourd'hui, c'est complet. Demain à 9 heures ?"], ["B", "D'accord, c'est parfait."], ["A", "C'est à quel nom ?"]],
 "Appelez le dentiste pour un rendez-vous urgent ; le premier horaire ne vous va pas.");
C(9, "Demander des renseignements", "Dans une station de métro · Dans une association sportive · À l'office du tourisme", "Poser des questions pratiques : trajet, horaires, inscriptions.",
 [["Pour aller à l'Opéra, s'il vous plaît ?", "How do I get to the Opéra, please?"], ["Je dois changer à quelle station ?", "Where do I have to change?"], ["Le dernier métro est à quelle heure ?", "What time is the last metro?"], ["Comment est-ce qu'on s'inscrit ?", "How do you sign up?"], ["Les cours ont lieu quand ?", "When do the classes take place?"], ["Qu'est-ce qu'il y a pour le 14 juillet ?", "What's on for 14 July?"]],
 [["A", "Pardon, pour aller à la tour Eiffel ?"], ["B", "Prenez la ligne 6, direction Étoile."], ["A", "Je dois changer ?"], ["B", "Non, c'est direct. Descendez à Bir-Hakeim."]],
 "Renseignez-vous dans un club de sport : jours, horaires, prix, documents pour s'inscrire.");
C(10, "Exprimer une obligation", "Dans une administration", "Dire ce qu'il faut faire, ce qu'on doit faire.",
 [["Il faut remplir ce formulaire.", "You have to fill in this form."], ["Vous devez apporter une photo.", "You must bring a photo."], ["Je dois payer combien ?", "How much do I have to pay?"], ["Il faut une pièce d'identité.", "You need an ID."], ["C'est obligatoire ?", "Is it compulsory?"], ["N'oubliez pas de signer ici.", "Don't forget to sign here."]],
 [["A", "Bonjour, je viens pour ma carte de séjour."], ["B", "Il faut d'abord remplir ce formulaire."], ["A", "Je dois apporter quels documents ?"], ["B", "Votre passeport, deux photos et un justificatif de domicile."]],
 "À la préfecture : demandez ce qu'il faut faire pour un titre de séjour ; l'employé liste les obligations.");
C(11, "Autoriser et interdire", "Dans une station de ski", "Demander si c'est permis, autoriser, interdire.",
 [["Est-ce qu'on peut … ?", "Are we allowed to …?"], ["Oui, vous pouvez.", "Yes, you can."], ["Il est interdit de skier ici.", "Skiing is forbidden here."], ["C'est dangereux, ne passez pas par là !", "It's dangerous, don't go that way!"], ["Défense de fumer.", "No smoking."], ["Ce n'est pas permis.", "It's not allowed."]],
 [["A", "Pardon, on peut prendre cette piste ?"], ["B", "Non, elle est fermée aujourd'hui. C'est dangereux."], ["A", "Et la piste bleue ?"], ["B", "Oui, vous pouvez, elle est très facile."]],
 "Vous êtes moniteur de ski : dites à des débutants ce qui est autorisé et interdit.");
C(12, "Vérifier", "Dans une station balnéaire", "Vérifier une information, faire confirmer.",
 [["C'est bien ici, la piscine municipale ?", "Is this the municipal pool?"], ["Vous êtes sûr ?", "Are you sure?"], ["Si j'ai bien compris, …", "If I understood correctly, …"], ["La plage est surveillée, n'est-ce pas ?", "The beach is supervised, isn't it?"], ["Vous pouvez confirmer l'horaire ?", "Can you confirm the time?"], ["Donc, c'est ouvert jusqu'à 19 heures ?", "So it's open until 7 p.m.?"]],
 [["A", "C'est bien le club de voile ?"], ["B", "Oui, c'est ici."], ["A", "Si j'ai bien compris, le cours commence à 10 heures ?"], ["B", "C'est ça, à 10 heures précises."]],
 "En vacances au bord de la mer : vérifiez trois informations (horaires de la piscine, cours, prix).");
C(13, "Protester", "Au camping", "Se plaindre poliment d'un problème.",
 [["Excusez-moi, mais il y a un problème.", "Excuse me, but there's a problem."], ["Ce n'est pas normal !", "That's not right!"], ["Nos voisins font trop de bruit.", "Our neighbours are too noisy."], ["La douche ne marche pas.", "The shower doesn't work."], ["Je vais me plaindre au directeur.", "I'm going to complain to the manager."], ["Vous allez faire quelque chose ?", "Are you going to do something?"]],
 [["A", "Bonsoir, il y a beaucoup de bruit à côté de notre tente."], ["B", "Je suis désolé, madame."], ["A", "Ce n'est pas normal, il est minuit !"], ["B", "Je vais leur parler tout de suite."]],
 "Au camping, rien ne va (bruit, douche froide, emplacement sale) : protestez à l'accueil.");
C(14, "Exprimer des intentions, des projets", "Louer des vélos · À la banque", "Dire ce qu'on va faire ou ce qu'on fera.",
 [["Je vais louer un vélo pour la journée.", "I'm going to hire a bike for the day."], ["Demain, nous ferons le tour du lac.", "Tomorrow we'll go around the lake."], ["J'ai l'intention d'ouvrir un compte.", "I intend to open an account."], ["L'année prochaine, je partirai au Canada.", "Next year I'll go to Canada."], ["On compte rester une semaine.", "We plan to stay a week."], ["Je voudrais faire un virement.", "I'd like to make a transfer."]],
 [["A", "Bonjour, je voudrais louer deux vélos."], ["B", "Pour combien de temps ?"], ["A", "Pour trois jours. Nous allons visiter les châteaux."], ["B", "Très bien. Il me faut une pièce d'identité."]],
 "Parlez de vos projets pour les prochaines vacances (futur proche et futur simple), puis louez des vélos.");

// III Parler des lieux et des objets
C(15, "Localiser", "Aux Galeries Lafayette · À la campagne · Un objet perdu", "Dire où se trouve quelque chose ou quelqu'un.",
 [["Le rayon des parfums est au rez-de-chaussée.", "Perfume is on the ground floor."], ["La caisse est à côté de l'escalier.", "The till is next to the stairs."], ["L'église est au centre du village.", "The church is in the middle of the village."], ["J'ai perdu mon portefeuille.", "I've lost my wallet."], ["Je l'ai laissé sur la table.", "I left it on the table."], ["C'est en face, à droite de l'ascenseur.", "It's opposite, to the right of the lift."]],
 [["A", "Pardon, où sont les chaussures pour enfants ?"], ["B", "Au deuxième étage, à côté des jouets."], ["A", "Et les caisses ?"], ["B", "Il y en a à chaque étage, près des escaliers."]],
 "Vous avez perdu votre sac dans un grand magasin : expliquez où vous êtes allé(e) et où vous l'avez posé.");
C(16, "S'informer par téléphone", "Une maison à louer", "Téléphoner pour avoir des informations.",
 [["J'appelle pour l'annonce de la maison.", "I'm calling about the house ad."], ["Elle est encore libre ?", "Is it still available?"], ["Il y a combien de chambres ?", "How many bedrooms are there?"], ["Il y a un garage ? — Oui, il y en a un.", "Is there a garage? — Yes, there is one."], ["Le loyer est de combien par mois ?", "How much is the rent per month?"], ["Je peux venir la voir samedi ?", "Can I come and see it on Saturday?"]],
 [["A", "Allô, bonjour, j'appelle pour la maison à louer."], ["B", "Oui, elle est toujours libre."], ["A", "Il y a un jardin ?"], ["B", "Oui, il y en a un petit, derrière."], ["A", "Je peux la visiter demain ?"]],
 "Appelez pour une maison à louer : posez 5 questions et prenez rendez-vous pour la visite.");
C(17, "Comparer", "À propos des vacances", "Comparer des lieux, des choses, des moments.",
 [["La mer est plus reposante que la ville.", "The sea is more relaxing than the city."], ["L'hôtel est moins cher que l'appartement.", "The hotel is cheaper than the flat."], ["Il fait aussi chaud qu'en Espagne.", "It's as hot as in Spain."], ["C'était mieux l'année dernière.", "It was better last year."], ["C'est la plus belle plage de la région.", "It's the most beautiful beach in the area."]],
 [["A", "Tu préfères la montagne ou la mer pour les vacances ?"], ["B", "La montagne. C'est plus calme et moins cher."], ["A", "Mais il fait moins chaud !"], ["B", "C'est vrai, mais l'air est meilleur."]],
 "Comparez deux destinations de vacances (prix, climat, activités) et choisissez-en une.");
C(18, "Caractériser", "Avant une fête d'anniversaire", "Décrire et choisir des objets (couleur, forme, matière).",
 [["Je préfère celle-ci, la nappe rouge.", "I prefer this one, the red tablecloth."], ["Ces verres-là sont plus jolis.", "Those glasses are prettier."], ["On prend les assiettes en carton ?", "Shall we take the paper plates?"], ["Celui-là est trop petit.", "That one is too small."], ["C'est un gâteau au chocolat, rond, avec des bougies.", "It's a round chocolate cake with candles."]],
 [["A", "Pour la fête, on prend quelles assiettes ?"], ["B", "Celles-ci, les bleues. Elles sont jolies."], ["A", "Et pour les verres ?"], ["B", "Ceux-là, en plastique, c'est plus pratique."]],
 "Vous préparez un anniversaire : choisissez avec un ami la vaisselle, la décoration et le gâteau (celui-ci, celle-là…).");
C(19, "Exprimer une condition", "Le temps qu'il fait", "Dire ce qu'on fera si…",
 [["S'il fait beau, on ira à la plage.", "If it's nice, we'll go to the beach."], ["S'il pleut, nous resterons à la maison.", "If it rains, we'll stay at home."], ["Si tu as froid, prends un pull.", "If you're cold, take a jumper."], ["Il va faire chaud demain.", "It's going to be hot tomorrow."], ["La météo annonce de l'orage.", "The forecast says thunderstorms."]],
 [["A", "Qu'est-ce qu'on fait dimanche ?"], ["B", "S'il fait beau, on fait un pique-nique."], ["A", "Et s'il pleut ?"], ["B", "S'il pleut, on va au cinéma !"]],
 "Organisez un week-end avec deux programmes : « s'il fait beau… » / « s'il pleut… ».");
C(20, "Parler d'un besoin", "Dans un nouveau bureau", "Dire ce dont on a besoin.",
 [["J'ai besoin d'un ordinateur.", "I need a computer."], ["Il me faut un mot de passe pour le wifi.", "I need a wifi password."], ["Il faudrait une imprimante.", "We'd need a printer."], ["Il faut que je téléphone au client.", "I have to call the client."], ["Tu as besoin d'aide ?", "Do you need help?"]],
 [["A", "Bienvenue dans ton nouveau bureau ! Tu as besoin de quelque chose ?"], ["B", "Oui, il me faut un téléphone et une chaise."], ["A", "D'accord. Et pour l'ordinateur ?"], ["B", "J'ai besoin d'un mot de passe."]],
 "Premier jour au travail : dites à votre collègue 5 choses dont vous avez besoin.", "A2");

// IV Parler aux autres
C(21, "Saluer et présenter", "Dans la rue", "Saluer quelqu'un qu'on rencontre et présenter une personne.",
 [["Tiens, bonjour ! Comment vas-tu ?", "Oh, hello! How are you?"], ["Je te présente ma voisine, Claire.", "This is my neighbour, Claire."], ["Enchanté(e), moi c'est Paul.", "Nice to meet you, I'm Paul."], ["Vous vous connaissez ?", "Do you know each other?"], ["On se voit bientôt !", "See you soon!"], ["Ça fait longtemps !", "It's been a long time!"]],
 [["A", "Salut Marc ! Ça fait longtemps !"], ["B", "Salut ! Je te présente Julie, une collègue."], ["A", "Enchantée, Julie."], ["C", "Enchantée. Vous vous connaissez depuis longtemps ?"]],
 "Dans la rue, vous rencontrez un ami avec une personne inconnue : saluez et faites les présentations.");
C(22, "Excuser et s'excuser", "Monsieur « Catastrophe »", "S'excuser d'une maladresse et accepter des excuses.",
 [["Oh, pardon ! Je suis vraiment désolé(e).", "Oh, sorry! I'm really sorry."], ["Excusez-moi, je ne l'ai pas fait exprès.", "Sorry, I didn't do it on purpose."], ["Ce n'est rien.", "It's nothing."], ["Ne vous inquiétez pas.", "Don't worry."], ["Je vais tout nettoyer.", "I'll clean everything up."], ["Ça arrive à tout le monde.", "It happens to everyone."]],
 [["A", "Oh non ! J'ai renversé mon café sur votre dossier !"], ["B", "Ce n'est pas grave."], ["A", "Je suis vraiment désolé, je ne l'ai pas fait exprès."], ["B", "Ne vous inquiétez pas, j'ai une copie."]],
 "Vous êtes « Monsieur Catastrophe » : trois maladresses dans la journée ; excusez-vous à chaque fois.", "A2");
C(23, "Téléphoner", "Un ami téléphone · Dans une entreprise", "Appeler un ami ou une entreprise, laisser un message.",
 [["Allô, c'est moi !", "Hello, it's me!"], ["Je pourrais parler à madame Leroy ?", "Could I speak to Mrs Leroy?"], ["C'est de la part de qui ?", "Who's calling?"], ["Ne quittez pas, je vous la passe.", "Hold on, I'll put you through."], ["Elle n'est pas là. Vous voulez laisser un message ?", "She's not here. Do you want to leave a message?"], ["Je te rappelle plus tard.", "I'll call you back later."]],
 [["A", "Société Lumière, bonjour."], ["B", "Bonjour, je voudrais parler à monsieur Simon."], ["A", "C'est de la part de qui ?"], ["B", "De Li Wang."], ["A", "Ne quittez pas… Désolée, il est en réunion."]],
 "Appelez une entreprise : la personne est absente ; laissez un message avec votre nom et votre numéro.");
C(24, "Donner des instructions", "Au club de gym · Dans un jardin public", "Dire à quelqu'un ce qu'il doit faire.",
 [["Levez les bras !", "Raise your arms!"], ["Pliez les genoux, doucement.", "Bend your knees, gently."], ["Respirez profondément.", "Breathe deeply."], ["Attends ton tour !", "Wait your turn!"], ["Ne cours pas, tu vas tomber !", "Don't run, you'll fall!"], ["Fais attention !", "Be careful!"]],
 [["A", "Allez, on commence ! Mettez-vous debout."], ["B", "Comme ça ?"], ["A", "Oui. Maintenant, levez les bras et respirez."], ["B", "C'est difficile !"], ["A", "Continuez, encore cinq fois !"]],
 "Vous êtes professeur de gym (impératif « vous »), puis parent au jardin public (impératif « tu »).");
C(25, "Nier", "Une mère et son fils", "Dire que ce n'est pas vrai, qu'on n'a pas fait quelque chose.",
 [["Non, ce n'est pas moi !", "No, it wasn't me!"], ["Je n'ai pas mangé le gâteau.", "I didn't eat the cake."], ["Je n'ai rien fait !", "I didn't do anything!"], ["Mais si ! Je l'ai rangé.", "Yes I did! I tidied it."], ["Pas du tout.", "Not at all."], ["Je n'ai jamais dit ça.", "I never said that."]],
 [["A", "Tu as rangé ta chambre ?"], ["B", "Oui, maman !"], ["A", "Et tes devoirs ? Tu ne les as pas faits !"], ["B", "Si, je les ai faits, ils sont dans mon sac."]],
 "Votre colocataire vous accuse (vaisselle, bruit, lait fini) : niez au passé composé.");
C(26, "Inviter, accepter, refuser", "Entre voisins · Au travail", "Faire une invitation et y répondre.",
 [["Vous êtes libres samedi soir ?", "Are you free on Saturday evening?"], ["On organise un apéritif chez nous.", "We're having drinks at our place."], ["Avec plaisir, c'est très gentil !", "With pleasure, that's very kind!"], ["Désolé, on n'est pas libres ce soir-là.", "Sorry, we're not free that evening."], ["On déjeune ensemble demain ?", "Shall we have lunch together tomorrow?"], ["Une autre fois, avec plaisir.", "Another time, gladly."]],
 [["A", "Bonjour ! On fait une petite fête samedi, vous venez ?"], ["B", "Avec plaisir ! À quelle heure ?"], ["A", "Vers sept heures, chez nous, au troisième."], ["B", "Parfait. On apporte un dessert !"]],
 "Invitez vos voisins pour un apéritif ; un collègue vous invite à déjeuner mais vous refusez poliment.");
C(27, "Demander à quelqu'un de faire quelque chose", "Au bureau", "Faire une demande polie.",
 [["Tu peux m'envoyer le fichier ?", "Can you send me the file?"], ["Vous pourriez fermer la porte, s'il vous plaît ?", "Could you close the door, please?"], ["Ça vous dérange d'attendre un moment ?", "Do you mind waiting a moment?"], ["Il m'a demandé de rappeler le client.", "He asked me to call the client back."], ["Bien sûr, tout de suite.", "Of course, right away."]],
 [["A", "Claire, tu pourrais faire des photocopies pour la réunion ?"], ["B", "Oui, bien sûr. Combien ?"], ["A", "Vingt, s'il te plaît. Et dis à Marc que la réunion est à trois heures."], ["B", "D'accord, je lui dis."]],
 "Au bureau, demandez trois services à vos collègues, puis répétez à un autre ce qu'on vous a demandé.", "A2");
C(28, "Proposer", "La préparation d'un pique-nique", "Proposer une idée, une aide.",
 [["Si on faisait un pique-nique ?", "How about a picnic?"], ["On pourrait aller au bord de la rivière.", "We could go by the river."], ["Je peux apporter des sandwichs.", "I can bring sandwiches."], ["Tu veux que je prenne la voiture ?", "Do you want me to take the car?"], ["Bonne idée !", "Good idea!"], ["Et pourquoi pas au parc ?", "And why not in the park?"]],
 [["A", "Il fait beau. Si on faisait un pique-nique dimanche ?"], ["B", "Bonne idée ! On pourrait aller au lac."], ["A", "J'apporte le pain et le fromage."], ["B", "Et moi, les boissons et les fruits."]],
 "Organisez un pique-nique à trois : chacun propose un lieu, une heure et ce qu'il apporte.");

// V Parler de soi
C(29, "Parler de sa santé", "À la pharmacie · Une jambe cassée · Chez le médecin", "Dire où on a mal, raconter un accident, comprendre le médecin.",
 [["J'ai mal à la gorge.", "I have a sore throat."], ["Vous avez quelque chose contre la toux ?", "Do you have something for a cough?"], ["Je suis tombé(e) et je me suis cassé la jambe.", "I fell and broke my leg."], ["J'ai de la fièvre depuis hier.", "I've had a fever since yesterday."], ["Prenez deux comprimés par jour.", "Take two tablets a day."], ["Voici votre ordonnance.", "Here's your prescription."]],
 [["A", "Bonjour docteur. Je ne me sens pas bien."], ["B", "Qu'est-ce qui ne va pas ?"], ["A", "J'ai mal à la tête et j'ai de la fièvre."], ["B", "Depuis quand ?"], ["A", "Depuis deux jours."]],
 "Chez le médecin : décrivez vos symptômes ; puis à la pharmacie, demandez un médicament.");
C(30, "Parler de ses goûts", "Entre amis", "Dire ce qu'on aime faire et ce qu'on a envie de faire.",
 [["J'adore écouter du jazz.", "I love listening to jazz."], ["J'ai envie de voir un film.", "I feel like watching a film."], ["J'ai arrêté de jouer au foot.", "I've stopped playing football."], ["Je n'aime pas du tout danser.", "I don't like dancing at all."], ["Je viens de commencer la guitare.", "I've just started the guitar."], ["Ça me passionne.", "I'm passionate about it."]],
 [["A", "Qu'est-ce que tu aimes faire le week-end ?"], ["B", "J'adore faire de la randonnée. Et toi ?"], ["A", "Moi, j'ai décidé d'apprendre la photo."], ["B", "Super, on pourrait faire les deux ensemble !"]],
 "Entre amis, parlez de 3 passe-temps : ce que vous aimez, avez arrêté, avez envie de commencer.");
C(31, "Parler de son curriculum vitae", "Une baby-sitter", "Présenter son expérience et ses compétences.",
 [["J'ai travaillé deux ans comme baby-sitter.", "I worked two years as a babysitter."], ["Je sais faire la cuisine.", "I can cook."], ["Je connais bien les enfants.", "I know children well."], ["J'ai un diplôme de secourisme.", "I have a first-aid certificate."], ["Je parle anglais et chinois.", "I speak English and Chinese."], ["Je suis disponible le soir.", "I'm available in the evenings."]],
 [["A", "Vous avez déjà gardé des enfants ?"], ["B", "Oui, pendant deux ans, deux petites filles."], ["A", "Vous savez nager ?"], ["B", "Oui, et je connais les premiers secours."]],
 "Entretien pour un petit boulot : présentez expérience, études, langues et disponibilités (savoir / connaître).");
C(32, "Demander et donner son opinion", "Entre collègues", "Demander l'avis de quelqu'un et donner le sien.",
 [["Qu'est-ce que tu en penses ?", "What do you think about it?"], ["À mon avis, c'est trop cher.", "In my opinion, it's too expensive."], ["Je pense que c'est une bonne idée.", "I think it's a good idea."], ["Je ne suis pas d'accord.", "I don't agree."], ["Tu as raison.", "You're right."], ["Je viens de lire le rapport.", "I've just read the report."]],
 [["A", "Je viens de voir le budget. Qu'est-ce que tu en penses ?"], ["B", "À mon avis, on dépense trop pour la publicité."], ["A", "Je ne suis pas d'accord, c'est important."], ["B", "Peut-être, mais il faut faire des économies."]],
 "Avec un collègue, donnez votre avis sur 3 propositions (horaires, budget, nouveau logo).");
C(33, "Exprimer la surprise", "Une fête d'anniversaire", "Réagir à une surprise, bonne ou mauvaise.",
 [["Surprise !", "Surprise!"], ["Ça alors ! Je ne m'y attendais pas !", "Wow! I wasn't expecting that!"], ["C'est pas vrai !", "No way!"], ["Quelle surprise !", "What a surprise!"], ["Oh, c'est trop gentil !", "Oh, that's so kind!"], ["Vraiment ? Tu es sûr ?", "Really? Are you sure?"]],
 [["A", "Surprise ! Joyeux anniversaire !"], ["B", "Ça alors ! Vous êtes tous là !"], ["A", "Tiens, c'est pour toi."], ["B", "Oh, quelle surprise ! Merci, c'est trop gentil !"]],
 "Vous recevez trois nouvelles surprenantes (une fête, un cadeau, un départ) : réagissez.");

// VI Parler des autres
C(34, "Exprimer la certitude ou l'incertitude", "Entre deux mères · Enquête policière", "Dire qu'on est sûr ou pas sûr.",
 [["Je suis sûr(e) qu'il a raison.", "I'm sure he's right."], ["Je ne suis pas certain(e).", "I'm not certain."], ["Peut-être qu'il est malade.", "Maybe he's ill."], ["C'est possible.", "It's possible."], ["Sans doute.", "Probably."], ["Ce qui m'inquiète, c'est le bruit.", "What worries me is the noise."]],
 [["A", "Votre fils est dans la classe de madame Roux ?"], ["B", "Je crois, mais je ne suis pas sûre."], ["A", "Moi, je suis certaine que c'est la meilleure."], ["B", "Peut-être… On verra !"]],
 "Jouez un détective : à propos d'un vol, dites ce qui est sûr, probable ou impossible.", "A2");
C(35, "Décrire", "Au commissariat de police", "Décrire physiquement une personne et raconter ce qui s'est passé.",
 [["Il était grand et brun.", "He was tall with dark hair."], ["Elle portait un manteau noir.", "She was wearing a black coat."], ["Il avait une barbe et des lunettes.", "He had a beard and glasses."], ["Il est parti en courant.", "He ran away."], ["C'était vers huit heures du soir.", "It was around 8 p.m."], ["J'étais devant la banque.", "I was in front of the bank."]],
 [["A", "Décrivez-moi l'homme, s'il vous plaît."], ["B", "Il était assez petit, il avait les cheveux gris."], ["A", "Il portait quoi ?"], ["B", "Une veste bleue et une casquette."], ["A", "Et ensuite ?"], ["B", "Il a pris mon sac et il est parti en courant !"]],
 "Au commissariat : on vous a volé votre téléphone ; décrivez le voleur et racontez (imparfait / passé composé).", "A2");
C(36, "Faire des compliments", "Un dîner entre amies", "Faire un compliment et y répondre.",
 [["Ton collier est vraiment magnifique !", "Your necklace is really beautiful!"], ["Ça te va très bien !", "It really suits you!"], ["C'est délicieux, bravo !", "It's delicious, well done!"], ["Tu cuisines vraiment bien.", "You cook really well."], ["Merci, c'est gentil.", "Thank you, that's kind."], ["Tu trouves ? Je l'ai acheté hier.", "You think so? I bought it yesterday."]],
 [["A", "Oh, ta robe est très jolie !"], ["B", "Merci, tu trouves ?"], ["A", "Oui, elle te va parfaitement."], ["B", "C'est gentil. Et ton gratin est délicieux !"]],
 "Pendant un dîner, faites 4 compliments (tenue, bijou, repas, appartement) et répondez à ceux qu'on vous fait.");
C(37, "Féliciter", "Bonnes nouvelles !", "Féliciter quelqu'un pour un événement heureux.",
 [["Félicitations !", "Congratulations!"], ["Toutes mes félicitations pour ton mariage !", "All my congratulations on your wedding!"], ["Bravo pour ton examen !", "Well done on your exam!"], ["Je suis très content(e) pour toi.", "I'm very happy for you."], ["Tous nos vœux de bonheur !", "All our best wishes!"], ["C'est une excellente nouvelle !", "That's excellent news!"]],
 [["A", "Tu sais, j'ai eu mon diplôme !"], ["B", "C'est vrai ? Félicitations !"], ["A", "Merci ! Et je commence un travail lundi."], ["B", "Bravo, je suis très contente pour toi !"]],
 "Félicitez trois personnes : une naissance, un mariage, un nouveau travail.");
C(38, "Consoler et encourager", "Après un match", "Consoler quelqu'un et lui donner du courage.",
 [["Ce n'est pas grave, ça ira mieux la prochaine fois.", "It's OK, it'll go better next time."], ["Courage !", "Hang in there!"], ["Tu as très bien joué quand même.", "You played very well anyway."], ["Ne t'inquiète pas.", "Don't worry."], ["Tu vas y arriver !", "You'll make it!"], ["Allez, on continue !", "Come on, let's keep going!"]],
 [["A", "On a perdu trois à zéro…"], ["B", "Ce n'est pas grave, l'autre équipe était très forte."], ["A", "J'ai mal joué."], ["B", "Mais non ! Courage, vous gagnerez le prochain match !"]],
 "Un ami a raté son examen de conduite : consolez-le et encouragez-le.");
C(39, "Critiquer", "À la sortie d'un match", "Dire ce qui ne va pas et expliquer pourquoi.",
 [["C'était nul !", "It was rubbish!"], ["L'arbitre n'a rien vu.", "The referee didn't see anything."], ["Ils ont perdu parce qu'ils n'ont pas couru.", "They lost because they didn't run."], ["Je ne suis pas content du tout.", "I'm not happy at all."], ["À cause de la pluie, le jeu était mauvais.", "Because of the rain, the game was poor."]],
 [["A", "Alors, le match ?"], ["B", "Nul ! On a perdu à cause de l'arbitre."], ["A", "Tu exagères, l'équipe n'a pas bien joué."], ["B", "C'est vrai, ils étaient fatigués."]],
 "À la sortie d'un match, critiquez l'équipe, l'arbitre et le stade (parce que, à cause de).");
C(40, "Exprimer l'admiration", "À la sortie d'un spectacle", "Dire qu'on admire et nuancer.",
 [["C'était magnifique !", "It was magnificent!"], ["Quel talent !", "What talent!"], ["La chanteuse est extraordinaire.", "The singer is extraordinary."], ["J'ai adoré, même si c'était long.", "I loved it, even though it was long."], ["Les costumes étaient superbes, mais la musique un peu forte.", "The costumes were superb, but the music a bit loud."]],
 [["A", "Alors, tu as aimé le spectacle ?"], ["B", "C'était génial ! Les danseurs sont incroyables."], ["A", "Moi aussi, même si la fin était un peu longue."], ["B", "Quel talent, vraiment !"]],
 "À la sortie d'un concert ou d'un film, dites ce que vous avez admiré et ce qui vous a moins plu (mais, même si).");

// End-of-part reviews: not in the book (it ends with communicative activities and a test) — added here
window.COMM_BILANS = COMM_PARTS.map((p, i) => ({ i, title: p[0], from: p[1], to: p[2] }));
// Expressions become review cards (phrases, learned as whole blocks)
window.COMM_PHRASES = [];
COMM.forEach(c => c.ex.forEach(([fr, en], k) => COMM_PHRASES.push({ id: `cm${c.n}_${k}`, unit: "c" + c.n, sec: "c" + c.n, theme: `Communication ${c.n} · ${c.title}`, fr, en, level: c.level, audio: "" })));

// Topic map (book's grammar & vocabulary columns → the other resources). [pages, Grammaire chapters, Vocabulaire units, FI chapter, Tex topics]
// Lessons 1–14 are the A1 phase, 15–40 the A2 phase. Grammar points the A1 grammar book doesn't cover have no chapter (→ Tex).
const CMAP = {
 1: [[8, 11], [5, 10, 11], [12, 20], 5, ["gender of nouns", "plural of nouns", "yes/no questions"]],
 2: [[12, 15], [31, 32], [12, 13], 5, ["partitive articles", "expressions of quantity"]],
 3: [[16, 17], [28], [13], 5, ["numbers", "infinitive"]],
 4: [[18, 21], [19, 39, 42], [12, 14], 5, ["avoir", "prendre", "aller"]],
 5: [[22, 25], [2, 3, 16, 52], [25, 26], 3, ["adjectives", "quel"]],
 6: [[26, 29], [23, 32], [9], 10, ["trop assez", "prepositions of place"]],
 7: [[30, 31], [38, 40], [18], 9, ["savoir connaître", "vouloir pouvoir"]],
 8: [[32, 35], [34, 47], [7, 15], 10, ["superlative", "imparfait"]],
 9: [[36, 41], [40, 50, 51, 52], [25, 26, 27], 6, ["devoir pouvoir", "time expressions", "interrogative"]],
 10: [[42, 43], [40, 58], [20], 2, ["devoir", "indirect object pronouns"]],
 11: [[44, 45], [26, 27], [27, 22], 3, ["c'est il est"]],
 12: [[46, 47], [13], [27, 26], 3, ["de + article", "possession de"]],
 13: [[48, 49], [43], [26], 3, ["futur proche"]],
 14: [[50, 53], [57, 58, 48], [25, 19], 13, ["object pronouns", "futur simple"]],
 15: [[54, 59], [21, 23, 60, 57], [23, 12], 6, ["prepositions of place", "relative pronoun qui", "direct object pronouns passé composé"]],
 16: [[60, 61], [55], [10], 8, ["pronoun en"]],
 17: [[62, 63], [33, 34], [26], 3, ["comparative"]],
 18: [[64, 65], [15], [14, 10], 7, ["demonstrative pronouns"]],
 19: [[66, 67], [48], [22], 3, ["si clauses", "weather"]],
 20: [[68, 69], [], [18, 17], 9, ["subjunctive"]],
 21: [[70, 71], [9], [1, 2], 1, ["pronominal verbs"]],
 22: [[72, 73], [], [11], 4, ["pluperfect"]],
 23: [[74, 77], [58], [5, 18], 9, ["indirect object pronouns", "double object pronouns"]],
 24: [[78, 81], [], [6, 27], 10, ["imperative"]],
 25: [[82, 83], [54, 53], [11], 8, ["negation passé composé"]],
 26: [[84, 87], [14, 4], [27, 1], 7, ["possessive adjectives", "on"]],
 27: [[88, 89], [], [15, 17], 12, ["indirect discourse"]],
 28: [[90, 91], [], [14, 27], 5, ["conditional"]],
 29: [[92, 97], [46], [7, 6], 10, ["indefinite pronouns", "passé composé être", "gerund"]],
 30: [[98, 99], [6], [27, 28], 2, ["verb + de + infinitive"]],
 31: [[100, 101], [38], [17], 12, ["savoir connaître"]],
 32: [[102, 103], [], [19, 17], 12, ["passé récent venir de"]],
 33: [[104, 105], [], [3], 7, ["nominalization"]],
 34: [[106, 109], [60], [16], 11, ["ce qui ce que", "impersonal expressions"]],
 35: [[110, 111], [47, 49], [8], 4, ["passé composé imparfait"]],
 36: [[112, 113], [], [9, 8], 10, ["adverbs"]],
 37: [[114, 115], [], [2, 3], 13, ["tout toute tous"]],
 38: [[116, 117], [], [27], 10, ["passive voice"]],
 39: [[118, 119], [51], [27], 10, ["cause parce que"]],
 40: [[120, 121], [], [28], 9, ["opposition mais"]]
};
COMM.forEach(c => { const m = CMAP[c.n]; Object.assign(c, { bookPages: m[0], grammar: m[1], vocabUnits: m[2], fiChapter: m[3], texTopics: m[4], level: c.n <= 14 ? "A1" : "A2", bookAudio: `audio/comm/${String(c.n).padStart(2, "0")}.mp3` }); });
COMM_PHRASES.forEach(p => p.level = +p.unit.slice(1) <= 14 ? "A1" : "A2");
window.TEX = "https://utexas.pressbooks.pub/texfrenchgrammar/";

// One dialogue per situation (the book has 57 across the 40 acts): the dialogues above cover one situation of each act,
// these cover the others. [act, situation index, dialogue]
const EXTRA = [
 [1, 1, [["A", "Bonjour, je voudrais envoyer cette lettre en Chine."], ["B", "En prioritaire ?"], ["A", "Oui. C'est combien ?"], ["B", "Un timbre à 1,96 €. Autre chose ?"], ["A", "Un carnet de timbres pour la France, s'il vous plaît."]]],
 [2, 1, [["A", "Bonjour monsieur, vous avez du riz ?"], ["B", "Oui, en paquet d'un kilo."], ["A", "Un paquet, et une bouteille de lait."], ["B", "Et avec ça ?"], ["A", "Un peu de beurre et six œufs. C'est tout."]]],
 [4, 0, [["A", "Bonjour, je voudrais des crevettes, s'il vous plaît."], ["B", "Combien ?"], ["A", "Pour quatre personnes."], ["B", "Alors, 600 grammes. Et du saumon ?"], ["A", "Oui, deux tranches pour moi."]]],
 [5, 1, [["A", "Un aller-retour pour Bordeaux, s'il vous plaît."], ["B", "Pour quel jour ?"], ["A", "Vendredi matin, retour dimanche soir."], ["B", "En seconde classe ?"], ["A", "Oui. Quel est le prix ?"], ["B", "Quatre-vingt-cinq euros."]]],
 [6, 0, [["A", "Bonjour, je cherche une chemise blanche."], ["B", "Vous faites quelle taille ?"], ["A", "Du 38. Je peux l'essayer ?"], ["B", "Bien sûr, la cabine est là."], ["A", "Elle est trop grande. Vous avez la taille en dessous ?"]]],
 [8, 1, [["A", "Cabinet médical, bonjour."], ["B", "Bonjour, je voudrais voir le docteur Martin."], ["A", "C'est pour une consultation ?"], ["B", "Oui, j'ai de la fièvre depuis hier."], ["A", "Cet après-midi à 17 heures, ça vous va ?"], ["B", "Parfait, merci."]]],
 [9, 1, [["A", "Bonjour, je voudrais m'inscrire au cours de natation."], ["B", "Les cours ont lieu le mardi et le jeudi soir."], ["A", "Il faut quels documents ?"], ["B", "Une photo et un certificat médical."], ["A", "Et le prix pour l'année ?"]]],
 [9, 2, [["A", "Bonjour, qu'est-ce qu'il y a pour le 14 juillet ?"], ["B", "Un défilé le matin et un bal le soir, place de la mairie."], ["A", "Et le feu d'artifice ?"], ["B", "À 23 heures, au bord de la rivière."], ["A", "Merci beaucoup !"]]],
 [14, 1, [["A", "Bonjour, je voudrais ouvrir un compte."], ["B", "Vous avez une pièce d'identité et un justificatif de domicile ?"], ["A", "Oui, les voici."], ["B", "Vous voulez une carte bancaire ?"], ["A", "Oui, et je ferai des virements vers la Chine."]]],
 [15, 1, [["A", "Pardon, où est l'église du village ?"], ["B", "Au bout de cette rue, à côté de la boulangerie."], ["A", "Et la ferme qui vend du fromage ?"], ["B", "Derrière l'église, près de la rivière."]]],
 [15, 2, [["A", "Bonjour, j'ai perdu mon portefeuille."], ["B", "Où l'avez-vous perdu ?"], ["A", "Dans le bus, ce matin. Je l'ai posé sur le siège."], ["B", "Il est comment ?"], ["A", "Noir, en cuir. Il y a ma carte bancaire dedans."]]],
 [23, 0, [["A", "Allô, Léa ? C'est Tom."], ["B", "Salut Tom ! Ça va ?"], ["A", "Oui. Tu as le numéro de Paul ?"], ["B", "Oui, je te l'envoie par SMS."], ["A", "Merci ! Je l'appelle ce soir."]]],
 [24, 1, [["A", "Léo, attends ton tour pour le toboggan !"], ["B", "Mais maman, c'est long !"], ["A", "Ne pousse pas les autres enfants."], ["B", "D'accord…"], ["A", "Et fais attention, ne cours pas !"]]],
 [26, 1, [["A", "Tu viens déjeuner avec nous à midi ?"], ["B", "Désolé, j'ai une réunion."], ["A", "Et demain ?"], ["B", "Demain, avec plaisir ! On va où ?"], ["A", "Au petit restaurant en face du bureau."]]],
 [29, 0, [["A", "Bonjour, vous avez quelque chose contre la toux ?"], ["B", "Oui, un sirop. Vous avez de la fièvre ?"], ["A", "Non, juste mal à la gorge."], ["B", "Alors prenez aussi ces pastilles, trois fois par jour."]]],
 [29, 1, [["A", "Qu'est-ce qui t'est arrivé ?"], ["B", "Je suis tombée dans l'escalier."], ["A", "Tu t'es cassé la jambe ?"], ["B", "Oui, je dois porter un plâtre pendant six semaines."], ["A", "Oh là là, bon courage !"]]],
 [34, 1, [["A", "Vous êtes sûr que c'est cet homme ?"], ["B", "Je ne suis pas certain… Il était plus grand, je crois."], ["A", "Vous l'avez vu à quelle heure ?"], ["B", "Peut-être vers dix heures. Il faisait nuit."], ["A", "Ce qui est sûr, c'est qu'il portait un chapeau ?"], ["B", "Oui, ça, j'en suis sûr."]]]
];
const MAINSIT = { 4: 1, 6: 1, 23: 1, 29: 2 }; // which situation the act's first dialogue belongs to (default 0)
COMM.forEach(c => {
  const sits = c.sit.split(" · "), main = MAINSIT[c.n] || 0;
  c.dlgs = sits.map((s, k) => ({ sit: s, lines: (k === main ? c.dlg : (EXTRA.find(e => e[0] === c.n && e[1] === k) || [0, 0, c.dlg])[2]).map(([who, text]) => ({ who, text })) }));
});
