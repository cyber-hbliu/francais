// Method content (original): survival kit and speaking/writing prompts per vocabulary unit.
// Built on Paul Nation, "What do you need to know to learn a foreign language?" (2014):
// survival vocabulary first, four balanced strands, spaced retrieval, avoiding interference, fluency work.

// Kit de survie — learn first (Nation ch. 2: ~120 survival items cover a beginner's basic needs)
const SURV = [
 ["Saluer et être poli", [["Bonjour.", "Hello. / Good morning."], ["Bonsoir.", "Good evening."], ["Salut !", "Hi! (informal)"], ["Au revoir.", "Goodbye."], ["À bientôt !", "See you soon!"], ["S'il vous plaît.", "Please. (formal)"], ["S'il te plaît.", "Please. (informal)"], ["Merci beaucoup.", "Thank you very much."], ["De rien.", "You're welcome."], ["Excusez-moi.", "Excuse me."], ["Pardon !", "Sorry! / Pardon?"], ["Je suis désolé(e).", "I'm sorry."], ["Oui. / Non.", "Yes. / No."], ["D'accord.", "OK."], ["Bonne journée !", "Have a nice day!"]]],
 ["Contrôler la conversation", [["Je ne comprends pas.", "I don't understand."], ["Vous pouvez répéter, s'il vous plaît ?", "Can you repeat, please?"], ["Plus lentement, s'il vous plaît.", "More slowly, please."], ["Qu'est-ce que ça veut dire ?", "What does that mean?"], ["Comment dit-on « … » en français ?", "How do you say '…' in French?"], ["Vous parlez anglais ?", "Do you speak English?"], ["Je parle un peu français.", "I speak a little French."], ["Vous pouvez l'écrire ?", "Can you write it down?"], ["Je ne sais pas.", "I don't know."], ["Un moment, s'il vous plaît.", "One moment, please."]]],
 ["Parler de soi", [["Je m'appelle …", "My name is …"], ["Je suis chinois(e).", "I'm Chinese."], ["Je viens de Chine.", "I come from China."], ["J'habite à …", "I live in …"], ["Je suis étudiant(e).", "I'm a student."], ["Je travaille dans …", "I work in …"], ["Je suis ici pour les vacances.", "I'm here on holiday."], ["Je suis ici pour le travail.", "I'm here for work."], ["J'apprends le français.", "I'm learning French."], ["Et vous ?", "And you?"]]],
 ["Nombres, prix, heure", [["un, deux, trois, quatre, cinq", "1, 2, 3, 4, 5"], ["six, sept, huit, neuf, dix", "6, 7, 8, 9, 10"], ["onze, douze, quinze, vingt", "11, 12, 15, 20"], ["trente, cinquante, cent", "30, 50, 100"], ["C'est combien ?", "How much is it?"], ["Ça fait dix euros.", "That's ten euros."], ["C'est trop cher.", "It's too expensive."], ["Quelle heure est-il ?", "What time is it?"], ["Il est trois heures.", "It's three o'clock."], ["À quelle heure ?", "At what time?"], ["aujourd'hui / demain / hier", "today / tomorrow / yesterday"]]],
 ["Faire des achats", [["Je voudrais …", "I would like …"], ["Je cherche …", "I'm looking for …"], ["Vous avez … ?", "Do you have …?"], ["Je prends ça.", "I'll take this."], ["Je peux payer par carte ?", "Can I pay by card?"], ["En espèces.", "In cash."], ["Un sac, s'il vous plaît.", "A bag, please."], ["C'est tout, merci.", "That's all, thanks."], ["Je regarde seulement.", "I'm just looking."]]],
 ["Au café, au restaurant", [["Une table pour deux, s'il vous plaît.", "A table for two, please."], ["La carte, s'il vous plaît.", "The menu, please."], ["Un café, s'il vous plaît.", "A coffee, please."], ["Une carafe d'eau, s'il vous plaît.", "A jug of water, please."], ["Qu'est-ce que vous me conseillez ?", "What do you recommend?"], ["Je suis végétarien(ne).", "I'm vegetarian."], ["Je suis allergique à …", "I'm allergic to …"], ["C'était délicieux !", "It was delicious!"], ["L'addition, s'il vous plaît.", "The bill, please."], ["Où sont les toilettes ?", "Where are the toilets?"]]],
 ["Se déplacer", [["Où est … ?", "Where is …?"], ["Où est la gare ?", "Where is the station?"], ["C'est loin ?", "Is it far?"], ["C'est près d'ici.", "It's near here."], ["À gauche / à droite", "On the left / on the right"], ["Tout droit.", "Straight ahead."], ["Un billet pour Lyon, s'il vous plaît.", "A ticket to Lyon, please."], ["Aller simple / aller-retour", "One way / return"], ["Le train part à quelle heure ?", "What time does the train leave?"], ["Je suis perdu(e).", "I'm lost."], ["Arrêtez-vous ici, s'il vous plaît.", "Stop here, please."]]],
 ["Se loger", [["J'ai une réservation.", "I have a reservation."], ["Au nom de …", "Under the name …"], ["Vous avez une chambre libre ?", "Do you have a free room?"], ["Pour une nuit / deux nuits.", "For one night / two nights."], ["Le petit-déjeuner est compris ?", "Is breakfast included?"], ["Quel est le code wifi ?", "What's the wifi code?"], ["La clé, s'il vous plaît.", "The key, please."]]],
 ["Urgences et santé", [["Au secours !", "Help!"], ["Appelez un médecin !", "Call a doctor!"], ["J'ai mal ici.", "It hurts here."], ["Je suis malade.", "I'm ill."], ["Où est la pharmacie ?", "Where is the pharmacy?"], ["J'ai perdu mon passeport.", "I've lost my passport."], ["Appelez la police !", "Call the police!"]]],
 ["Conversation simple", [["Ça va ? — Ça va bien, merci.", "How are you? — Fine, thanks."], ["Il fait beau aujourd'hui.", "The weather is nice today."], ["Il fait froid !", "It's cold!"], ["J'aime beaucoup …", "I really like …"], ["C'est super !", "That's great!"], ["Enchanté(e).", "Nice to meet you."], ["Vous êtes d'où ?", "Where are you from?"], ["Bon week-end !", "Have a good weekend!"]]]
];
window.SURVIVAL = [];
SURV.forEach(([cat, items], ci) => items.forEach(([fr, en], k) =>
  SURVIVAL.push({ id: `sv${ci}_${k}`, unit: 0, sec: "sv" + ci, cat, theme: "0. Kit de survie · " + cat, fr, en, level: "A1", audio: "" })));

// Speaking (3/2/1½ talk, memorized sentences) and writing prompts for each Vocabulaire progressif unit
window.PROMPTS = {
 0: ["Présentez-vous à quelqu'un dans un café.", ["Bonjour, je m'appelle …", "Je viens de …", "J'habite à …", "Je suis … (profession)", "J'apprends le français parce que …"]],
 1: ["Vous arrivez chez des amis français : saluez, remerciez, prenez congé.", ["Bonjour, comment allez-vous ?", "Merci pour l'invitation.", "Je vous présente …", "Il est tard, je dois partir.", "Merci, à bientôt !"]],
 2: ["Présentez votre famille.", ["Dans ma famille, il y a …", "Mon père s'appelle … Il a … ans.", "J'ai … frère(s) / sœur(s).", "Ma mère est …", "Je suis marié(e) / célibataire."]],
 3: ["Parlez d'une personne que vous aimez et de ce que vous ressentez.", ["J'aime beaucoup …", "Je suis content(e) quand …", "Je suis triste quand …", "Il / Elle est …", "Nous sommes amis depuis …"]],
 4: ["Décrivez votre caractère et celui d'un(e) ami(e).", ["Je suis plutôt …", "Je ne suis pas très …", "Mon ami(e) est …", "Il / Elle est plus … que moi.", "Nous sommes tous les deux …"]],
 5: ["Vous téléphonez pour prendre un rendez-vous.", ["Allô, bonjour, c'est …", "Je voudrais parler à …", "Est-ce que je peux laisser un message ?", "Vous pouvez répéter ?", "Mon numéro, c'est le …"]],
 6: ["Expliquez vos gestes du matin (se lever, marcher, s'asseoir…).", ["Je me lève à …", "Je marche jusqu'à …", "Je m'assois et …", "Je lève le bras …", "Le soir, je suis fatigué(e)."]],
 7: ["Chez le médecin : expliquez ce qui ne va pas.", ["Bonjour docteur, j'ai mal à …", "Depuis deux jours, …", "J'ai de la fièvre.", "Je suis fatigué(e).", "Qu'est-ce que je dois faire ?"]],
 8: ["Décrivez physiquement trois personnes que vous connaissez.", ["Il est grand / petit.", "Elle a les cheveux …", "Il a les yeux …", "Elle porte des lunettes.", "Il a environ … ans."]],
 9: ["Dans un magasin de vêtements : demandez, essayez, achetez.", ["Je cherche un pull …", "Vous l'avez en bleu ?", "Je fais du …", "Je peux l'essayer ?", "C'est un peu grand. Je le prends."]],
 10: ["Décrivez votre logement.", ["J'habite dans un appartement / une maison.", "Il y a … pièces.", "Ma chambre est …", "Dans le salon, il y a …", "J'aime mon logement parce que …"]],
 11: ["Racontez une journée normale.", ["Je me réveille à …", "Je prends le petit-déjeuner …", "Je travaille / j'étudie de … à …", "Le soir, je …", "Je me couche à …"]],
 12: ["Au marché : achetez les ingrédients d'un repas.", ["Je voudrais un kilo de …", "Vous avez des … ?", "C'est combien, le kilo ?", "Et avec ça ? — C'est tout.", "Je vais à la boulangerie pour …"]],
 13: ["Préparez une liste de courses et faites les courses.", ["Il me faut …", "un litre de …, un paquet de …", "beaucoup de … / un peu de …", "Il n'y a plus de …", "Ça fait combien ?"]],
 14: ["Parlez de vos repas et de votre plat préféré.", ["Au petit-déjeuner, je mange …", "À midi, je déjeune …", "Mon plat préféré, c'est …", "Je ne mange pas de …", "Pour faire …, il faut …"]],
 15: ["Parlez de votre semaine et de vos horaires.", ["Le lundi, je …", "À … heures, je …", "Le week-end, je …", "Ce mois-ci, …", "Mon anniversaire, c'est le …"]],
 16: ["Parlez de vos études.", ["J'étudie … à …", "Mon cours préféré, c'est …", "J'ai cours le … de … à …", "Le professeur est …", "J'apprends le français depuis …"]],
 17: ["Parlez de votre métier (ou de votre métier idéal).", ["Je suis …", "Je travaille dans …", "Je commence à … et je finis à …", "J'aime mon travail parce que …", "Plus tard, je voudrais être …"]],
 18: ["Parlez de votre usage du téléphone, d'Internet et des médias.", ["Je regarde … à la télévision.", "J'écoute la radio …", "Sur Internet, je …", "J'envoie des messages à …", "Je lis les informations sur …"]],
 19: ["À la banque : ouvrez un compte, retirez de l'argent.", ["Je voudrais ouvrir un compte.", "Où est le distributeur ?", "Je voudrais changer de l'argent.", "Je paie par carte.", "C'est cher / ce n'est pas cher."]],
 20: ["À la poste ou à la mairie : envoyez un colis, remplissez un formulaire.", ["Je voudrais envoyer ce colis en …", "Un timbre pour …, s'il vous plaît.", "Nom, prénom, adresse …", "Ma date de naissance, c'est le …", "Où est-ce que je signe ?"]],
 21: ["Présentez votre pays et un pays francophone.", ["Mon pays, c'est …", "La capitale est …", "On parle … en …", "Au nord, il y a …", "Je voudrais visiter …"]],
 22: ["Présentez la météo de la semaine.", ["Aujourd'hui, il fait …", "Demain, il va pleuvoir.", "En hiver, chez moi, il fait …", "Ma saison préférée, c'est …", "Il y a du vent / du soleil."]],
 23: ["Comparez la ville et la campagne.", ["J'habite en ville / à la campagne.", "En ville, il y a …", "À la campagne, c'est plus …", "Je préfère … parce que …", "Il n'y a pas de …"]],
 24: ["Expliquez à un touriste le chemin de chez vous à la gare.", ["Vous allez tout droit.", "Vous tournez à gauche / à droite.", "C'est à côté de …", "C'est en face de …", "C'est à cinq minutes à pied."]],
 25: ["Parlez de vos transports quotidiens.", ["Je prends le bus / le métro …", "Je vais au travail à pied / à vélo.", "Le trajet dure …", "Je préfère le train parce que …", "Un billet, s'il vous plaît."]],
 26: ["Racontez vos dernières vacances.", ["L'été dernier, je suis allé(e) à …", "J'ai visité …", "Il faisait …", "J'ai mangé …", "C'était super !"]],
 27: ["Parlez de vos loisirs et de vos sports.", ["Je fais du / de la …", "Je joue au / à la …", "Le week-end, j'aime …", "Je fais ça depuis …", "Je n'aime pas …"]],
 28: ["Parlez d'un film, d'un concert ou d'une exposition.", ["J'ai vu …", "C'est un film / un spectacle de …", "L'histoire, c'est …", "J'ai aimé … parce que …", "Je vous le conseille !"]]
};

// Why each step exists (shown in the UI)
window.WHY = {
  study: "Étude ciblée (≈ ¼ du temps) : cartes en rappel actif + répétition espacée. Chaque rappel réussi renforce le lien forme ↔ sens ; voir la réponse tout de suite n'en est pas un.",
  input: "Écoute & lecture (≈ ¼) : de l'input compréhensible. Lire en écoutant (texte + enregistrement) aide plus que l'écoute seule.",
  output: "Production (≈ ¼) : parler et écrire révèle ce qui vous manque, ce qui rend la prochaine écoute plus utile. Phrases mémorisées = accès rapide et sûr.",
  fluency: "Fluidité (≈ ¼) : du matériel facile, déjà connu, avec une pression pour aller plus vite. On ne s'arrête pas sur les erreurs."
};

// Prepared talks about Bing's own life (Nation 4.3: work, hobbies, family — write, memorise, practise)
window.PERSO = [
 ["Présentez votre travail : l'analyse spatiale des villes et les cartes.", ["Je travaille dans l'analyse spatiale urbaine.", "Je fais des cartes de la ville.", "J'étudie comment les gens utilisent l'espace.", "J'utilise des données et un ordinateur.", "Ce que j'aime dans mon travail, c'est …"]],
 ["Parlez de la musique que vous aimez.", ["J'écoute beaucoup de …", "Mon chanteur / ma chanteuse préféré(e), c'est …", "J'écoute de la musique quand …", "En ce moment, j'aime une chanson qui s'appelle …", "Je voudrais aller à un concert de …"]],
 ["Parlez d'un film que vous aimez.", ["Mon film préféré, c'est …", "C'est un film de …", "L'histoire se passe à …", "J'aime ce film parce que …", "Je l'ai vu … fois !"]],
 ["Parlez de la photographie.", ["Je fais de la photo depuis …", "J'aime photographier les villes / les gens / la lumière.", "J'utilise un appareil … / mon téléphone.", "Ma meilleure photo, c'est …", "Le week-end, je sors pour prendre des photos."]],
 ["Présentez votre chat.", ["J'ai un chat. Il / Elle s'appelle …", "Il / Elle a … ans.", "Il / Elle est …(couleur), avec des yeux …", "Mon chat adore … et déteste …", "Le matin, il / elle me réveille à … heures !"]]
];
// one correction focus per week (Nation ch. 4: give feedback a particular focus)
window.FOCUS = ["les finales muettes (-s, -t, -ent ne se prononcent pas)", "/y/ (tu) et /u/ (tout)", "les voyelles nasales : an / on / in", "le /R/ français", "la liaison (les_amis, vous_avez)", "le e muet (je m'appelle, samedi)", "l'intonation des questions", "l'accord masculin / féminin", "le genre des noms : le ou la ?", "l'élision : j', l', n', d'"];
