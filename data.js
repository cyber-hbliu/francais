// Course structure follows the unit order of « Grammaire progressive du français – débutant (A1) » (60 units, 8 bilans)
// and « Vocabulaire progressif du français – A1 » (28 units). Explanations, examples and exercises below are original.
// Vocabulary words and audio come from Français interactif (UT Austin, COERLL/LAITS), CC BY 3.0 — see fi_data.js.
window.FI_BASE = "https://www.laits.utexas.edu/fi/toc/";
window.TV5 = "https://apprendre.tv5monde.com/fr";

const LV2 = new Set([47, 48, 49, 50, 55, 56, 57, 58, 60]);
const FICH = {1:1,2:1,3:1,4:1,5:1,6:2,7:2,8:5,9:4,10:1,11:1,12:1,13:3,14:2,15:4,16:4,17:4,18:10,19:2,20:2,21:6,22:3,23:6,24:1,25:1,26:4,27:4,28:3,29:2,30:3,31:5,32:5,33:7,34:7,35:4,36:5,37:9,38:9,39:5,40:4,41:3,42:3,43:3,44:6,45:6,46:6,47:7,48:11,49:7,50:10,51:2,52:10,53:6,54:6,55:9,56:9,57:8,58:8,59:9,60:9};
window.LESSONS = [];
function G(n, title, rules, examples, ex) {
  LESSONS.push({ id: "g" + String(n).padStart(2, "0"), n, level: LV2.has(n) ? "A2" : "A1", fi: FICH[n], title, rules, examples, ex });
}

G(1, "Se présenter : nationalité et profession",
 ["«Je suis» + nationalité : Je suis «japonais» / «japonaise».", "Profession sans article après être : Il est «médecin» (pas « un médecin »).", "Questions : «Vous êtes» de quelle nationalité ? Vous faites quoi ?"],
 [["Je «suis» canadienne.", "I'm Canadian."], ["Il «est» professeur.", "He is a teacher."], ["«Vous êtes» chinois ?", "Are you Chinese?"]],
 [["Je ___ italien. (être)", "suis"], ["Elle est ___ . (doctor — no article)", "médecin"], ["___ êtes anglais ? (formal you)", "vous"], ["Tu ___ étudiant ? (être)", "es"]]);
G(2, "Masculin et féminin des adjectifs",
 ["Règle générale : + «-e» : grand → grand«e».", "Déjà en -e : pas de changement : un homme «calme», une femme «calme».", "Formes spéciales : -eux → «-euse», -if → «-ive», -en → «-enne», -er → «-ère», beau → «belle»."],
 [["Il est petit. Elle est «petite».", "He/She is small."], ["Un garçon «sportif», une fille «sportive».", "A sporty boy, a sporty girl."], ["Il est italien, elle est «italienne».", "He/She is Italian."]],
 [["Il est grand. Elle est ___ .", "grande"], ["Il est heureux. Elle est ___ .", "heureuse"], ["Il est canadien. Elle est ___ .", "canadienne"], ["Il est cher. La robe est ___ .", "chère"]]);
G(3, "Singulier et pluriel des adjectifs",
 ["Pluriel : + «-s» : grand → grand«s», grande → grande«s».", "Finale -s ou -x : pas de changement : il est «français», ils sont «français».", "-eau → «-eaux», -al → «-aux» : beau → beaux, national → nationaux."],
 [["Ils sont «grands».", "They are tall."], ["Elles sont «contentes».", "They (f.) are happy."], ["Des hommes «heureux».", "Happy men."]],
 [["Il est petit. Ils sont ___ .", "petits"], ["Elle est blonde. Elles sont ___ .", "blondes"], ["Il est anglais. Ils sont ___ .", "anglais"], ["Il est beau. Ils sont ___ .", "beaux"]]);
G(4, "Le verbe être ; vous/tu, nous/on",
 ["être : je «suis», tu «es», il/elle/on «est», nous «sommes», vous «êtes», ils/elles «sont».", "«tu» = familier ; «vous» = poli ou pluriel.", "À l'oral, «on» remplace souvent «nous» : «On est» prêts."],
 [["Nous «sommes» à Lyon.", "We are in Lyon."], ["«On est» en retard !", "We're late!"], ["Vous «êtes» d'où ?", "Where are you from?"]],
 [["Nous ___ amis. (être)", "sommes"], ["On ___ fatigués. (être)", "est"], ["Ils ___ en classe. (être)", "sont"], ["Vous ___ prêts ? (être)", "êtes"]]);
G(5, "Interrogation simple et négation ne … pas",
 ["Question par intonation : Vous êtes japonais«?»", "Avec «est-ce que» : «Est-ce que» vous êtes japonais ? (est-ce qu' devant voyelle)", "Négation : «ne» + verbe + «pas» ; ne → «n'» devant voyelle."],
 [["«Est-ce qu'»il est marié ?", "Is he married?"], ["Non, je «ne» suis «pas» marié.", "No, I'm not married."], ["Elle «n'»est «pas» là.", "She isn't here."]],
 [["___ vous êtes étudiant ? (est-ce que)", "est-ce que"], ["Je ___ suis ___ français. (négation)", "ne pas"], ["Il ___ est ___ grand. (négation, voyelle)", "n' pas"], ["___ elle est prête ? (est-ce que + voyelle)", "est-ce qu'"]]);
G(6, "Les verbes en -er (1) ; le verbe aimer",
 ["Terminaisons au singulier : je parl«e», tu parl«es», il parl«e» — prononcées pareil.", "«aimer» + nom : J'aime «le» chocolat (article défini).", "«aimer» + infinitif : J'aime «danser»."],
 [["J'«aime» la musique.", "I like music."], ["Tu «regardes» la télé.", "You watch TV."], ["Elle «aime» voyager.", "She likes travelling."]],
 [["Je ___ le français. (parler)", "parle"], ["Tu ___ le cinéma ? (aimer)", "aimes"], ["Il ___ la radio. (écouter)", "écoute"], ["J'aime ___ café. (article défini)", "le"]]);
G(7, "Les verbes en -er (2) : conjugaison complète",
 ["nous parl«ons», vous parl«ez», ils parl«ent» (-ent est muet).", "Révision : Est-ce que vous «parlez» anglais ? — Non, je «ne» parle «pas» anglais.", "Devant voyelle : j'«habite», ils_«aiment» (liaison z)."],
 [["Nous «habitons» à Paris.", "We live in Paris."], ["Vous «travaillez» le samedi ?", "Do you work on Saturdays?"], ["Elles «ne» dansent «pas».", "They don't dance."]],
 [["Nous ___ nos clés. (chercher)", "cherchons"], ["Vous ___ ici ? (habiter)", "habitez"], ["Ils ___ beaucoup. (travailler)", "travaillent"], ["Elles ___ du piano. (jouer)", "jouent"]]);
G(8, "Les verbes en -er (3) : particularités",
 ["acheter, se lever : è aux formes muettes : j'«achète», nous «achetons».", "préférer : é → «è» : je «préfère», nous «préférons».", "manger → nous «mangeons» ; commencer → nous «commençons» ; appeler → j'«appelle»."],
 [["J'«achète» du pain.", "I buy bread."], ["Nous «mangeons» à midi.", "We eat at noon."], ["Vous «préférez» le thé ?", "Do you prefer tea?"]],
 [["J'___ des fruits. (acheter)", "achète"], ["Nous ___ à 8 h. (commencer)", "commençons"], ["Tu ___ le rouge ? (préférer)", "préfères"], ["Nous ___ ensemble. (manger)", "mangeons"]]);
G(9, "Les verbes pronominaux en -er",
 ["Pronom réfléchi : je «me», tu «te», il «se», nous «nous», vous «vous», ils «se».", "Devant voyelle : «m', t', s'» : je «m'»appelle.", "Négation : je «ne me» lève «pas»."],
 [["Je «me lave».", "I wash (myself)."], ["Il «s'appelle» Marc.", "His name is Marc."], ["Nous «nous levons» tôt.", "We get up early."]],
 [["Je ___ réveille à 7 h.", "me"], ["Tu ___ appelles comment ?", "t'"], ["Ils ___ couchent tard.", "se"], ["Vous ___ habillez vite.", "vous"]]);
G(10, "Le nom et l'article ; masculin et féminin des noms",
 ["Chaque nom a un genre : «un» homme, «une» femme, «un» arbre, «une» route.", "Personnes : + «-e» (un ami / une amie) ; -eur → «-euse» ; -teur → «-trice» ; -ien → «-ienne».", "Souvent féminins : -tion, -té, -ure ; souvent masculins : -ment, -age, -eau."],
 [["«Un» étudiant, «une» étudiante.", "A student (m./f.)."], ["«Un» chanteur, «une» chanteuse.", "A singer (m./f.)."], ["«Une» nation, «un» gâteau.", "A nation, a cake."]],
 [["Un acteur, une ___ .", "actrice"], ["Un vendeur, une ___ .", "vendeuse"], ["Un musicien, une ___ .", "musicienne"], ["___ voiture (indéfini)", "une"]]);
G(11, "Singulier et pluriel des noms",
 ["Pluriel : + «-s» (muet) : un livre → des livre«s».", "-s, -x, -z : invariable : un prix → des «prix».", "-eau → «-eaux», -al → «-aux», -eu → «-eux» ; irrégulier : un œil → des «yeux»."],
 [["Des «arbres» et des «fleurs».", "Trees and flowers."], ["Des «oiseaux».", "Birds."], ["Des «journaux».", "Newspapers."]],
 [["Un gâteau → des ___", "gâteaux"], ["Un animal → des ___", "animaux"], ["Un nez → des ___", "nez"], ["Un œil → des ___", "yeux"]]);
G(12, "Article indéfini et article défini",
 ["Indéfini «un, une, des» : on introduit une chose.", "Défini «le, la, l', les» : chose connue, unique ou générale.", "Une tour → «la» tour Eiffel ; un pont → «le» pont Neuf."],
 [["Il y a «une» tour. C'est «la» tour Eiffel.", "There's a tower. It's the Eiffel Tower."], ["J'ai «des» amis à Rome.", "I have friends in Rome."], ["«L'»hôtel est cher.", "The hotel is expensive."]],
 [["Voici ___ livre. C'est le livre de Léa.", "un"], ["___ soleil brille. (défini)", "le"], ["___ enfants jouent. (défini pl.)", "les"], ["C'est ___ église. (défini, voyelle)", "l'"]]);
G(13, "à et de + articles définis (au, aux, du, des)",
 ["à + le = «au» ; à + les = «aux» ; à la, à l' ne changent pas.", "de + le = «du» ; de + les = «des» ; de la, de l' ne changent pas.", "Je vais «au» musée ; je viens «du» musée."],
 [["Je suis «au» Louvre.", "I'm at the Louvre."], ["Une carte «du» Louvre.", "A postcard of the Louvre."], ["Il parle «aux» enfants.", "He speaks to the children."]],
 [["Je vais ___ cinéma. (à + le)", "au"], ["Elle rentre ___ bureau. (de + le)", "du"], ["Il téléphone ___ parents. (à + les)", "aux"], ["La porte ___ maison. (de + la)", "de la"]]);
G(14, "Les adjectifs possessifs",
 ["mon/ma/mes, ton/ta/tes, son/sa/ses ; notre/nos, votre/vos, leur/leurs.", "Accord avec l'objet possédé : «son» père, «sa» mère (de lui ou d'elle).", "Féminin + voyelle → «mon, ton, son» : «mon» amie."],
 [["«Mon» père est grand.", "My father is tall."], ["«Ta» sœur est là ?", "Is your sister here?"], ["«Leurs» enfants sont petits.", "Their children are small."]],
 [["___ frère s'appelle Tom. (my)", "mon"], ["Elle aime ___ père. (her)", "son"], ["C'est ___ école. (my, f. + voyelle)", "mon"], ["___ amis arrivent. (our)", "nos"]]);
G(15, "Les démonstratifs ce, cet, cette, ces",
 ["«ce» + masculin : ce chat ; «cet» + masculin à voyelle : cet arbre.", "«cette» + féminin : cette voiture.", "«ces» + pluriel : ces arbres."],
 [["«Ce» chat est noir.", "This cat is black."], ["«Cet» hôtel est calme.", "This hotel is quiet."], ["«Ces» fleurs sont belles.", "These flowers are beautiful."]],
 [["___ livre (m.)", "ce"], ["___ ami (m. + voyelle)", "cet"], ["___ maison (f.)", "cette"], ["___ enfants (pl.)", "ces"]]);
G(16, "La possession avec avoir ; place de l'adjectif",
 ["«avoir» + nom : J'«ai» une voiture.", "La plupart des adjectifs se placent après le nom : une voiture «rouge».", "Avant le nom : «beau, joli, bon, petit, grand, jeune, vieux, nouveau» : une «belle» voiture. des + adj. → «de» : de belles voitures."],
 [["J'ai une voiture «rouge».", "I have a red car."], ["Vous avez une «belle» maison.", "You have a beautiful house."], ["C'est un «petit» chien «noir».", "It's a small black dog."]],
 [["Une maison ___ . (blanc)", "blanche"], ["Un ___ appartement. (beau, m. + voyelle)", "bel"], ["Une ___ ville. (grand)", "grande"], ["J'___ un vélo. (avoir)", "ai"]]);
G(17, "Caractéristiques physiques et âge",
 ["«avoir» + «les» + partie du corps + adjectif : Elle a «les yeux noirs».", "«avoir» + «des» cheveux longs (adj. avant → de).", "L'âge : «avoir» + nombre + «ans» : Il a trois ans."],
 [["Ma fille «a les yeux» bleus.", "My daughter has blue eyes."], ["Il «a les cheveux» courts.", "He has short hair."], ["Mon fils «a trois ans».", "My son is three."]],
 [["Elle ___ vingt ans. (avoir)", "a"], ["Il a ___ yeux verts. (article)", "les"], ["Tu as quel ___ ? (age)", "âge"], ["Nous ___ les cheveux bruns. (avoir)", "avons"]]);
G(18, "Avoir mal à… ; avoir faim, froid…",
 ["«avoir mal à» + partie du corps : J'ai mal «à la» tête, «au» dos, «aux» dents.", "Sensations sans article : avoir «faim», «soif», «froid», «chaud», «sommeil», «peur».", "Négation : Je n'ai pas faim."],
 [["Il «a mal à la» tête.", "He has a headache."], ["J'«ai mal au» ventre.", "I have a stomach ache."], ["Ils «ont froid».", "They are cold."]],
 [["J'ai mal ___ dos. (à + le)", "au"], ["Elle a mal ___ dents. (à + les)", "aux"], ["Tu as ___ ? Voici de l'eau. (thirsty)", "soif"], ["Nous ___ faim. (avoir)", "avons"]]);
G(19, "Le verbe avoir ; interrogation et négation",
 ["avoir : j'«ai», tu «as», il «a», nous «avons», vous «avez», ils «ont».", "Attention : ils «sont» (être) ≠ ils «ont» (avoir) — liaison z dans ils_ont.", "«Est-ce que» vous avez un stylo ? — Non, je «n'ai pas» de stylo."],
 [["Tu «as» un frère ?", "Do you have a brother?"], ["Ils «ont» une maison.", "They have a house."], ["«Est-ce que» vous «avez» l'heure ?", "Do you have the time?"]],
 [["Vous ___ des enfants ? (avoir)", "avez"], ["Ils ___ un chien. (avoir)", "ont"], ["Tu ___ faim ? (avoir)", "as"], ["Je ___ pas de voiture. (n'ai)", "n'ai"]]);
G(20, "La négation et les articles : pas le / pas de",
 ["Article défini : il ne change pas : Je n'aime pas «le» café.", "Article indéfini (un, une, des) → «de/d'» : Je n'ai pas «de» chat.", "Avec être, pas de changement : Ce n'est pas «un» chat."],
 [["Je n'ai pas «la» télévision.", "I don't have the TV (on/service)."], ["Je n'ai pas «de» chat.", "I don't have a cat."], ["Il n'a pas «d'»amis ici.", "He has no friends here."]],
 [["J'ai un vélo. → Je n'ai pas ___ vélo.", "de"], ["J'aime la viande. → Je n'aime pas ___ viande.", "la"], ["Il a des enfants. → Il n'a pas ___ enfants.", "d'"], ["C'est un livre. → Ce n'est pas ___ livre.", "un"]]);
G(21, "Localisation : à, de, chez, près de, loin de",
 ["«être de» = origine : Dino est «de» Rome.", "«être à» = lieu (ville) : Il est «à» Paris.", "«chez» + personne : chez moi, «chez» le médecin. «près de» / «loin de» : près «du» parc."],
 [["Elle est «de» Lyon.", "She's from Lyon."], ["Je suis «chez» Paul.", "I'm at Paul's."], ["J'habite «loin de» la gare.", "I live far from the station."]],
 [["Il est ___ Madrid. (origine)", "de"], ["Nous sommes ___ Berlin. (lieu)", "à"], ["Je vais ___ le dentiste.", "chez"], ["C'est près ___ musée. (de + le)", "du"]]);
G(22, "Villes et pays : à, au, en, aux",
 ["Ville : «à» Paris, «à» Tokyo.", "Pays féminin (souvent en -e) : «en» France ; pays commençant par voyelle : «en» Iran.", "Pays masculin : «au» Japon ; pluriel : «aux» États-Unis."],
 [["J'habite «en» Espagne.", "I live in Spain."], ["Il travaille «au» Canada.", "He works in Canada."], ["Ils sont «aux» Pays-Bas.", "They are in the Netherlands."]],
 [["Je vais ___ Italie.", "en"], ["Elle habite ___ Portugal.", "au"], ["Nous sommes ___ Londres.", "à"], ["Il voyage ___ États-Unis.", "aux"]]);
G(23, "dans, sur, sous, devant, derrière…",
 ["«dans» = à l'intérieur ; «sur» = dessus ; «sous» = dessous.", "«devant» / «derrière» ; «entre» … et … ; «à côté de».", "à côté «du» lit, en face «de la» poste."],
 [["Le chien est «sous» la table.", "The dog is under the table."], ["Les clés sont «dans» le sac.", "The keys are in the bag."], ["La banque est «à côté de» la poste.", "The bank is next to the post office."]],
 [["Le livre est ___ la table. (on)", "sur"], ["Le chat dort ___ le lit. (under)", "sous"], ["Je t'attends ___ le cinéma. (in front of)", "devant"], ["Le jardin est ___ la maison. (behind)", "derrière"]]);
G(24, "Il y a ; qu'est-ce qu'il y a ? ; il n'y a pas de",
 ["«Il y a» + nom (singulier ou pluriel) : existence.", "Question : «Qu'est-ce qu'il y a» dans le frigo ?", "Négation : «Il n'y a pas de» lait."],
 [["«Il y a» un éléphant au bord de l'eau.", "There's an elephant by the water."], ["«Qu'est-ce qu'il y a» sur la table ?", "What is there on the table?"], ["«Il n'y a pas d'»eau.", "There's no water."]],
 [["___ trois chambres. (there are)", "il y a"], ["Il n'y a pas ___ pain.", "de"], ["Qu'est-ce qu'il ___ ? (y a)", "y a"], ["Il n'y a pas ___ arbres. (voyelle)", "d'"]]);
G(25, "Qui est-ce ? Qu'est-ce que c'est ?",
 ["Personne : «Qui est-ce» ? — «C'est» une amie.", "Chose : «Qu'est-ce que c'est» ? — C'est un vase.", "Négation : «Ce n'est pas» un vase, c'est une lampe."],
 [["— «Qui est-ce» ? — C'est mon voisin.", "Who is it? It's my neighbour."], ["— «Qu'est-ce que c'est» ? — C'est un cadeau.", "What is it? It's a gift."], ["«Ce n'est pas» mon sac.", "It's not my bag."]],
 [["___ ? — C'est Marie. (question personne)", "qui est-ce"], ["___ ? — C'est une clé. (question chose)", "qu'est-ce que c'est"], ["Ce ___ pas mon livre.", "n'est"], ["___ sont mes parents. (ce …)", "ce"]]);
G(26, "C'est / il est : identification et description",
 ["«C'est» + déterminant + nom : C'est «un» homme.", "«Il est» + adjectif : Il est grand.", "Profession : «Il est» médecin / «C'est un» médecin."],
 [["«C'est» un sac. «Il est» grand.", "It's a bag. It's big."], ["«C'est» ma sœur. «Elle est» gentille.", "It's my sister. She's kind."], ["«Ce sont» des Italiens.", "They're Italians."]],
 [["___ un ami. (c'est / il est)", "c'est"], ["___ intelligent. (c'est / il est)", "il est"], ["___ une voiture. Elle est rapide.", "c'est"], ["___ des étudiants. (pluriel)", "ce sont"]]);
G(27, "C'est + adjectif : le commentaire général",
 ["«C'est» + adjectif masculin = jugement général : C'est «beau» !", "L'adjectif ne s'accorde pas : La mer, c'est «beau».", "Comparez : Cette robe est «chère» / C'est «cher» !"],
 [["Paris, «c'est beau» !", "Paris is beautiful!"], ["Le français, «c'est difficile».", "French is hard."], ["«C'est cher», ce restaurant.", "It's expensive, this restaurant."]],
 [["La montagne, c'est ___ ! (beau)", "beau"], ["Cette robe est ___ . (cher)", "chère"], ["Les vacances, c'est ___ ! (génial)", "génial"], ["La cuisine italienne, c'est ___ . (bon)", "bon"]]);
G(28, "Les nombres ; la date",
 ["0–20 : zéro, un, deux… vingt ; 70 = «soixante-dix», 80 = «quatre-vingts», 90 = «quatre-vingt-dix».", "Ordinaux : premier, deuxième, troisième… (+ «-ième»).", "Date : «le» + nombre + mois : le 14 juillet ; mais «le premier» mai."],
 [["J'ai «vingt et un» ans.", "I'm 21."], ["Il habite au «troisième» étage.", "He lives on the third floor."], ["Nous sommes «le premier» janvier.", "It's January 1st."]],
 [["70 = ___", "soixante-dix"], ["80 = ___", "quatre-vingts"], ["5 → ___ (ordinal)", "cinquième"], ["Le 1er mai = le ___ mai", "premier"]]);
G(29, "L'heure",
 ["«Il est» + nombre + «heure(s)» : Il est cinq heures.", "«et quart» (:15), «et demie» (:30), «moins le quart» (:45), «midi», «minuit».", "Question : «Quelle heure est-il ?» / À quelle heure… ?"],
 [["«Il est» huit heures «et demie».", "It's 8:30."], ["Le cours commence «à» neuf heures.", "Class starts at nine."], ["Il est midi «moins le quart».", "It's 11:45."]],
 [["Quelle ___ est-il ?", "heure"], ["8:15 → Il est huit heures et ___ .", "quart"], ["12:00 (jour) → Il est ___ .", "midi"], ["6:45 → Il est sept heures ___ le quart.", "moins"]]);
G(30, "La météo ; les mois et les saisons",
 ["«Il fait» + adjectif : Il fait «froid», «beau», «chaud».", "«Il pleut», «il neige», «il y a du vent».", "«en» + mois / saison (en hiver, en été, en automne) ; mais «au printemps»."],
 [["«Il fait froid» en hiver.", "It's cold in winter."], ["«Il fait beau» en juillet.", "The weather is nice in July."], ["«Au» printemps, «il pleut» souvent.", "In spring it often rains."]],
 [["Il ___ chaud aujourd'hui. (faire)", "fait"], ["___ printemps (in spring)", "au"], ["___ hiver (in winter)", "en"], ["Il ___ . (rain)", "pleut"]]);
G(31, "Les partitifs : du, de la, des",
 ["Quantité non précise : «du» (m.), «de la» (f.), «de l'» (voyelle), «des» (pl.).", "Avec manger, boire, acheter, vouloir : Je mange «de la» salade.", "Goût général → article défini : J'aime «le» poisson."],
 [["Je mange «de la» salade.", "I eat (some) salad."], ["Il boit «du» lait.", "He drinks milk."], ["Nous achetons «des» fruits.", "We buy (some) fruit."]],
 [["Je bois ___ café.", "du"], ["Tu veux ___ eau ?", "de l'"], ["Elle mange ___ soupe.", "de la"], ["J'aime ___ fromage. (goût général)", "le"]]);
G(32, "La quantité : un kilo de, beaucoup de, pas de",
 ["Quantité précise + «de» : un litre «de» lait, un kilo «de» pommes.", "Adverbes + «de» : «beaucoup de», «peu de», «trop de», «assez de».", "Négation : «pas de» farine."],
 [["Un litre «de» lait.", "A litre of milk."], ["Il y a «beaucoup de» beurre.", "There's a lot of butter."], ["Il n'y a «pas de» farine.", "There's no flour."]],
 [["Un kilo ___ tomates.", "de"], ["Beaucoup ___ amis. (voyelle)", "d'"], ["Je n'ai pas ___ sucre.", "de"], ["Une bouteille ___ eau. (voyelle)", "d'"]]);
G(33, "La comparaison : plus, moins, aussi … que",
 ["«plus» + adjectif + «que» ; «moins» … «que» ; «aussi» … «que».", "bon → «meilleur» (pas « plus bon »).", "Pronom tonique après que : plus grand «que moi»."],
 [["Paul est «plus grand que» Léa.", "Paul is taller than Léa."], ["Le train est «moins cher que» l'avion.", "The train is cheaper than the plane."], ["Ce vin est «meilleur que» l'autre.", "This wine is better than the other."]],
 [["Elle est ___ grande que sa sœur. (more)", "plus"], ["Il est ___ rapide que moi. (as)", "aussi"], ["Ce gâteau est ___ que l'autre. (bon +)", "meilleur"], ["Le bus est ___ cher que le taxi. (less)", "moins"]]);
G(34, "Comparer des quantités ; le superlatif",
 ["«plus de», «moins de», «autant de» + nom (+ que).", "Avec un verbe : il travaille «plus», «moins», «autant».", "Superlatif : «le/la/les plus» + adjectif ; «le meilleur» ; «le plus» + verbe : C'est lui qui travaille le plus."],
 [["J'ai «plus de» livres que toi.", "I have more books than you."], ["Il a «autant d'»amis que moi.", "He has as many friends as me."], ["C'est «la plus» belle ville.", "It's the most beautiful city."]],
 [["Il y a ___ touristes en été. (more)", "plus de"], ["J'ai ___ travail que lui. (as much)", "autant de"], ["C'est le ___ grand musée. (most)", "plus"], ["C'est la ___ pizza de Rome. (best)", "meilleure"]]);
G(35, "Verbes en -ir à deux formes (finir, grandir)",
 ["Singulier : je fin«is», tu fin«is», il fin«it».", "Pluriel avec «-iss-» : nous fin«issons», vous fin«issez», ils fin«issent».", "Même modèle : choisir, réussir, grandir, grossir, maigrir."],
 [["Je «finis» à six heures.", "I finish at six."], ["Les enfants «grandissent» vite.", "Children grow fast."], ["Vous «choisissez» quoi ?", "What do you choose?"]],
 [["Nous ___ le travail. (finir)", "finissons"], ["Tu ___ un dessert ? (choisir)", "choisis"], ["Ils ___ l'examen. (réussir)", "réussissent"], ["Il ___ vite. (grandir)", "grandit"]]);
G(36, "Verbes en -ir type partir",
 ["Singulier sans consonne finale du radical : je «pars», tu «pars», il «part».", "Pluriel avec la consonne : nous «partons», vous «partez», ils «partent».", "Même modèle : sortir (je sors), dormir (je dors), sentir."],
 [["Je «pars» demain.", "I'm leaving tomorrow."], ["Vous «sortez» ce soir ?", "Are you going out tonight?"], ["Le bébé «dort».", "The baby is sleeping."]],
 [["Nous ___ en vacances. (partir)", "partons"], ["Tu ___ beaucoup ? (dormir)", "dors"], ["Ils ___ du cinéma. (sortir)", "sortent"], ["Il ___ à 8 h. (partir)", "part"]]);
G(37, "Verbes en -re type écrire",
 ["Singulier : j'«écris», tu «écris», il «écrit».", "Pluriel avec v : nous «écrivons», vous «écrivez», ils «écrivent».", "Modèles proches : lire (lisons), dire (disons, mais vous «dites»), conduire (conduisons)."],
 [["J'«écris» une lettre.", "I'm writing a letter."], ["Nous «lisons» le journal.", "We read the newspaper."], ["Vous «conduisez» bien.", "You drive well."]],
 [["Vous ___ un e-mail. (écrire)", "écrivez"], ["Ils ___ des romans. (lire)", "lisent"], ["Nous ___ la voiture. (conduire)", "conduisons"], ["Elle ___ une carte. (écrire)", "écrit"]]);
G(38, "Savoir, connaître, croire, voir",
 ["savoir : je «sais», nous «savons» — un fait, ou + infinitif (je sais nager).", "connaître : je «connais», il «connaît», nous «connaissons» — une personne, un lieu.", "croire : je «crois», nous «croyons» ; voir : je «vois», nous «voyons»."],
 [["Je «sais» parler anglais.", "I can speak English."], ["Tu «connais» Marie ?", "Do you know Marie?"], ["Nous «voyons» la mer.", "We see the sea."]],
 [["Je ___ la réponse. (savoir)", "sais"], ["Vous ___ Paris ? (connaître)", "connaissez"], ["Nous ___ le film demain. (voir)", "voyons"], ["Ils ___ que c'est vrai. (croire)", "croient"]]);
G(39, "Verbes à trois formes : boire, prendre, venir",
 ["boire : je «bois», nous «buvons», ils «boivent».", "prendre : je «prends», nous «prenons», ils «prennent» (apprendre, comprendre).", "venir : je «viens», nous «venons», ils «viennent»."],
 [["Je «bois» du thé.", "I drink tea."], ["Ils «prennent» le métro.", "They take the metro."], ["Elles «viennent» ce soir.", "They're coming tonight."]],
 [["Nous ___ de l'eau. (boire)", "buvons"], ["Ils ___ le train. (prendre)", "prennent"], ["Tu ___ avec nous ? (venir)", "viens"], ["Vous ___ le français ? (comprendre)", "comprenez"]]);
G(40, "Vouloir, pouvoir, devoir + infinitif",
 ["vouloir : je «veux», nous «voulons», ils «veulent».", "pouvoir : je «peux», nous «pouvons», ils «peuvent».", "devoir : je «dois», nous «devons», ils «doivent» — suivis d'un infinitif."],
 [["Je «veux partir» !", "I want to leave!"], ["Je «peux partir» ?", "May I leave?"], ["Je «dois partir».", "I must leave."]],
 [["Tu ___ venir ? (vouloir)", "veux"], ["Nous ___ entrer ? (pouvoir)", "pouvons"], ["Ils ___ travailler. (devoir)", "doivent"], ["Elles ___ sortir. (pouvoir)", "peuvent"]]);
G(41, "Faire et dire",
 ["faire : je «fais», nous «faisons», vous «faites», ils «font».", "Activités : faire «du» tennis, «de la» danse, «la» cuisine, «les» courses.", "dire : je «dis», nous «disons», vous «dites», ils «disent»."],
 [["Je «fais du» tennis.", "I play tennis."], ["Tu «fais la» cuisine.", "You do the cooking."], ["Qu'est-ce que vous «dites» ?", "What are you saying?"]],
 [["Vous ___ du sport ? (faire)", "faites"], ["Ils ___ les courses. (faire)", "font"], ["Il fait ___ piano. (de + le)", "du"], ["Vous ___ la vérité. (dire)", "dites"]]);
G(42, "Le verbe aller au présent",
 ["aller : je «vais», tu «vas», il «va», nous «allons», vous «allez», ils «vont».", "aller + à + lieu : Je vais «à» Rome, «au» marché.", "Ça va ? — Ça «va» bien."],
 [["Je «vais» à Rome.", "I'm going to Rome."], ["Tu «vas» à Londres.", "You're going to London."], ["Ils «vont» à la plage.", "They're going to the beach."]],
 [["Nous ___ au théâtre. (aller)", "allons"], ["Ils ___ en Grèce. (aller)", "vont"], ["Tu ___ bien ? (aller)", "vas"], ["Je ___ ___ marché. (aller + à + le)", "vais au"]]);
G(43, "Le futur proche",
 ["«aller» au présent + infinitif : Je «vais manger».", "Négation autour de aller : Je «ne vais pas» manger.", "Futur immédiat ou projet : Il «va pleuvoir»."],
 [["Je «vais manger» à midi.", "I'm going to eat at noon."], ["Nous «allons voyager» en été.", "We're going to travel in summer."], ["Elle «ne va pas» venir.", "She's not going to come."]],
 [["Tu ___ partir ? (aller)", "vas"], ["Ils ___ dormir. (aller)", "vont"], ["Il va ___ . (pleuvoir — infinitif)", "pleuvoir"], ["Je ___ vais ___ sortir. (négation)", "ne pas"]]);
G(44, "Passé composé avec avoir : verbes en -er",
 ["«avoir» au présent + participe passé.", "Verbes en -er : participe en «-é» : manger → «mangé».", "Négation : Je «n'ai pas» mangé."],
 [["J'«ai mangé» une pomme.", "I ate an apple."], ["Tu «as regardé» le film ?", "Did you watch the film?"], ["Nous «avons travaillé» hier.", "We worked yesterday."]],
 [["Hier, j'___ dansé. (avoir)", "ai"], ["Elle a ___ Paul. (appeler)", "appelé"], ["Vous ___ visité Rome ? (avoir)", "avez"], ["Ils ont ___ français. (parler)", "parlé"]]);
G(45, "Passé composé avec avoir : verbes en -ir, -re, -oir",
 ["-ir → «-i» : fini, dormi ; beaucoup en -re/-oir → «-u» : vu, bu, lu, voulu, pu.", "Irréguliers : «fait», «mis», «pris», «dit», «écrit», «eu», «été».", "J'ai «vu», j'ai «mis», j'ai «fait»."],
 [["J'«ai vu» un bon film.", "I saw a good film."], ["Elle «a mis» son manteau.", "She put on her coat."], ["Nous «avons fait» les courses.", "We did the shopping."]],
 [["Il a ___ son travail. (finir)", "fini"], ["J'ai ___ un café. (boire)", "bu"], ["Tu as ___ le bus ? (prendre)", "pris"], ["Nous avons ___ une lettre. (écrire)", "écrit"]]);
G(46, "Passé composé avec être",
 ["Verbes de mouvement/changement : aller, venir, arriver, partir, entrer, sortir, monter, descendre, naître, mourir, rester, tomber, (re)venir…", "Accord avec le sujet : il est arrivé, elle est arrivé«e», ils sont arrivé«s».", "Verbes pronominaux aussi : je «me suis» levé(e)."],
 [["Il «est arrivé» hier.", "He arrived yesterday."], ["Elle «est partie» tôt.", "She left early."], ["Nous «sommes allés» au cinéma.", "We went to the cinema."]],
 [["Elle est ___ à 8 h. (arriver)", "arrivée"], ["Nous ___ restés chez nous. (être)", "sommes"], ["Ils sont ___ . (partir)", "partis"], ["Je ___ suis levé tôt.", "me"]]);
G(47, "L'imparfait",
 ["Radical de «nous» au présent : nous parl-ons → je parl«ais».", "Terminaisons : «-ais, -ais, -ait, -ions, -iez, -aient» ; être → j'«étais».", "Description et habitude au passé : Quand j'«étais» petit, j'«avais» un chien."],
 [["Quand j'«étais» petit, j'«avais» un chien.", "When I was little, I had a dog."], ["Il «faisait» beau.", "The weather was nice."], ["Nous «habitions» à la campagne.", "We used to live in the country."]],
 [["Enfant, je ___ à Lyon. (habiter)", "habitais"], ["Tu ___ content. (être)", "étais"], ["Ils ___ souvent. (sortir)", "sortaient"], ["Il ___ froid. (faire)", "faisait"]]);
G(48, "Le futur simple",
 ["Infinitif + «-ai, -as, -a, -ons, -ez, -ont» : je parler«ai».", "-re : on enlève le e : prendre → je «prendrai».", "Irréguliers : être → «ser-», avoir → «aur-», aller → «ir-», faire → «fer-», venir → «viendr-», pouvoir → «pourr-»."],
 [["Quand je «serai» grand, je «serai» président.", "When I grow up I'll be president."], ["Nous «partirons» demain.", "We'll leave tomorrow."], ["Il «fera» chaud.", "It will be hot."]],
 [["Demain, je ___ . (travailler)", "travaillerai"], ["Tu ___ riche. (être)", "seras"], ["Nous ___ en Italie. (aller)", "irons"], ["Ils ___ du ski. (faire)", "feront"]]);
G(49, "Présent, passé, futur : résumé",
 ["Présent : je mange ; futur proche : je «vais manger» ; futur simple : je «mangerai».", "Passé composé : j'«ai mangé» (action terminée).", "Imparfait : je «mangeais» (habitude, description)."],
 [["Je «mange» maintenant.", "I'm eating now."], ["Hier, j'«ai mangé» au restaurant.", "Yesterday I ate at a restaurant."], ["Demain, je «mangerai» chez Paul.", "Tomorrow I'll eat at Paul's."]],
 [["Hier, nous ___ le musée. (visiter, passé composé)", "avons visité"], ["Avant, je ___ beaucoup. (lire, imparfait)", "lisais"], ["Ce soir, je vais ___ . (dormir)", "dormir"], ["L'an prochain, tu ___ . (venir, futur)", "viendras"]]);
G(50, "Il y a, pendant, depuis, dans : le temps",
 ["«il y a» + durée = moment passé : Je suis arrivé «il y a» deux ans.", "«pendant» = durée limitée ; «depuis» + présent = action qui continue.", "«dans» + durée = moment futur : Je pars «dans» deux jours."],
 [["Il est parti «il y a» deux ans.", "He left two years ago."], ["J'habite ici «depuis» deux ans.", "I've lived here for two years."], ["Il revient «dans» deux ans.", "He's coming back in two years."]],
 [["J'apprends le français ___ un an. (and still)", "depuis"], ["Il a dormi ___ huit heures. (durée finie)", "pendant"], ["Le train part ___ dix minutes. (futur)", "dans"], ["Je l'ai vu ___ une semaine. (ago)", "il y a"]]);
G(51, "L'interrogation (2) : où, quand, comment, combien, pourquoi",
 ["Lieu «où», temps «quand», manière «comment», quantité «combien (de)», cause «pourquoi» → «parce que».", "Trois registres : Tu vas «où» ? / «Où est-ce que» tu vas ? / «Où» vas-tu ?", "Inversion : verbe-sujet avec trait d'union : Où habitez-vous ?"],
 [["«Où» habitez-vous ?", "Where do you live?"], ["«Quand est-ce que» tu pars ?", "When are you leaving?"], ["«Pourquoi» tu ris ? — «Parce que» c'est drôle.", "Why are you laughing? Because it's funny."]],
 [["___ vas-tu ? — À Paris.", "où"], ["___ ça coûte ? — Dix euros.", "combien"], ["___ allez-vous ? — Bien, merci.", "comment"], ["Pourquoi ? — ___ je suis malade.", "parce que"]]);
G(52, "L'interrogation (3) : qui, que, quel",
 ["Personne : «Qui» habite ici ? / Tu vois «qui» ?", "Chose : «Qu'est-ce que» tu fais ? / «Que» fais-tu ? / Tu fais «quoi» ?", "«Quel, quelle, quels, quelles» + nom : «Quelle» est sa profession ?"],
 [["«Qui» habite ici ?", "Who lives here?"], ["«Qu'est-ce qu'»il fait ?", "What is he doing?"], ["«Quelle» est sa profession ?", "What is his job?"]],
 [["___ est ton adresse ? (quel, f.)", "quelle"], ["___ tu manges ? (qu'est-ce que)", "qu'est-ce que"], ["___ parle ? — Marie.", "qui"], ["Tu aimes ___ films ? (quel, m. pl.)", "quels"]]);
G(53, "La négation (2) : rien, jamais, plus, personne",
 ["ne … «rien» (≠ quelque chose) ; ne … «personne» (≠ quelqu'un).", "ne … «jamais» (≠ toujours, souvent) ; ne … «plus» (≠ encore).", "En début de phrase : «Personne ne» vient. «Rien n'»est simple."],
 [["Il «ne» dit «rien».", "He says nothing."], ["Il «ne» sort «jamais».", "He never goes out."], ["Il «ne» rit «plus».", "He doesn't laugh anymore."]],
 [["Je ne vois ___ . (nobody)", "personne"], ["Elle ne mange ___ . (nothing)", "rien"], ["Il ne fume ___ . (no longer)", "plus"], ["Nous ne sortons ___ . (never)", "jamais"]]);
G(54, "Négation et interrogation au passé composé",
 ["La négation entoure l'auxiliaire : Il «n'a pas» mangé. Il «n'est pas» sorti.", "ne … rien/jamais/plus : Il «n'a rien» dit. Mais : Je n'ai vu «personne».", "Inversion : «As-tu» mangé ? «Est-elle» partie ?"],
 [["Il «n'a pas» mangé.", "He didn't eat."], ["Il «n'est pas» sorti.", "He didn't go out."], ["«Avez-vous» vu le film ?", "Have you seen the film?"]],
 [["Elle ___ pas venue. (n'est)", "n'est"], ["Je n'ai ___ compris. (nothing)", "rien"], ["Tu n'as ___ visité Paris ? (never)", "jamais"], ["Je n'ai vu ___ . (nobody)", "personne"]]);
G(55, "Le pronom en",
 ["«en» remplace du, de la, des + nom : Tu manges du poisson ? — Oui, j'«en» mange.", "Avec une quantité : J'«en» ai deux. Il y «en» a beaucoup.", "Négation : Je «n'en» mange pas."],
 [["— Elle mange du poisson ? — Oui, elle «en» mange.", "Does she eat fish? Yes, she does."], ["J'«en» veux trois.", "I want three (of them)."], ["Il «n'en» a pas.", "He doesn't have any."]],
 [["Tu bois du café ? — Oui, j'___ bois.", "en"], ["Vous avez des enfants ? — J'___ ai deux.", "en"], ["Il veut de l'eau ? — Non, il n'___ veut pas.", "en"], ["Il y a des pommes ? — Oui, il y ___ a.", "en"]]);
G(56, "Le pronom y",
 ["«y» remplace un lieu (à, au, en, dans, chez…) : Je vais au cinéma. J'«y» vais à six heures.", "Place avant le verbe : Tu «y» vas ? Je «n'y» vais pas.", "Futur proche : Je vais «y» aller."],
 [["Je vais au cinéma. J'«y» vais à six heures.", "I'm going to the cinema, at six."], ["Tu habites à Nice ? Oui, j'«y» habite.", "Do you live in Nice? Yes."], ["Il «n'y» va jamais.", "He never goes there."]],
 [["Tu vas à Rome ? — Oui, j'___ vais.", "y"], ["Elle est chez Paul ? — Oui, elle ___ est.", "y"], ["Vous allez au parc ? — Non, nous n'___ allons pas.", "y"], ["Je vais ___ aller demain.", "y"]]);
G(57, "Les pronoms COD : le, la, les",
 ["Remplacent une personne ou une chose directe : Il regarde Marie → Il «la» regarde.", "«le» (m.), «la» (f.), «l'» (voyelle), «les» (pl.) — avant le verbe.", "Négation : Il «ne la» regarde «pas»."],
 [["Il «le» regarde.", "He looks at him/it."], ["Il «la» regarde.", "He looks at her/it."], ["Il «les» regarde.", "He looks at them."]],
 [["Tu prends le bus ? — Oui, je ___ prends.", "le"], ["Il aime Julie ? — Oui, il ___ aime.", "l'"], ["Vous voyez les enfants ? — Oui, nous ___ voyons.", "les"], ["Tu écoutes la radio ? — Non, je ne ___ écoute pas.", "l'"]]);
G(58, "Les pronoms COI : lui, leur",
 ["Remplacent «à» + personne : Il parle à Marie → Il «lui» parle.", "«lui» = à lui / à elle ; «leur» = à eux / à elles.", "Verbes : parler à, téléphoner à, écrire à, donner à, dire à."],
 [["Il «lui» parle.", "He talks to him/her."], ["Il «leur» parle.", "He talks to them."], ["Je «lui» téléphone ce soir.", "I'll call him/her tonight."]],
 [["Tu écris à ta mère ? — Oui, je ___ écris.", "lui"], ["Il parle à ses amis ? — Oui, il ___ parle.", "leur"], ["Vous téléphonez à Paul ? — Oui, nous ___ téléphonons.", "lui"], ["Elle dit bonjour aux voisins ? — Oui, elle ___ dit bonjour.", "leur"]]);
G(59, "Les pronoms toniques : moi, toi, lui…",
 ["moi, toi, lui, elle, nous, vous, eux, elles.", "Pour insister : «Moi», je suis français.", "Après une préposition : avec «moi», chez «toi», pour «eux» ; et après c'est : C'est «lui»."],
 [["«Moi», j'aime le thé.", "Me, I like tea."], ["Tu viens avec «moi» ?", "Are you coming with me?"], ["C'est «eux» !", "It's them!"]],
 [["Je dîne chez ___ . (him)", "lui"], ["___ , tu es fou ! (you)", "toi"], ["C'est pour ___ . (them, m.)", "eux"], ["Elle part avec ___ . (us)", "nous"]]);
G(60, "Les relatifs qui et que",
 ["«qui» = sujet du verbe suivant : L'homme «qui» passe.", "«que/qu'» = complément d'objet : L'homme «que» je regarde.", "Astuce : après qui vient un verbe ; après que vient un sujet."],
 [["L'homme «qui» passe est mon voisin.", "The man walking by is my neighbour."], ["L'homme «que» je regarde est acteur.", "The man I'm looking at is an actor."], ["Le livre «qu'»il lit est bon.", "The book he's reading is good."]],
 [["La fille ___ chante est ma sœur.", "qui"], ["Le film ___ je préfère est italien.", "que"], ["Le pain ___ il achète est frais.", "qu'"], ["C'est un ami ___ habite à Lyon.", "qui"]]);

// Bilans after these units (book order)
window.BILANS = [[1, 9], [10, 20], [21, 27], [28, 34], [35, 42], [43, 49], [50, 54], [55, 60]];

// Vocabulaire progressif A1 units → Français interactif vocabulary sections (by FI section index in FI_VOC)
const VP = [
 "Les usages – la politesse", "La famille – les périodes de la vie", "L'amour – les émotions", "Le caractère", "La communication",
 "Le corps – les mouvements", "La santé", "La description physique", "Les vêtements – les couleurs", "La maison – le logement",
 "Les activités quotidiennes", "Les produits alimentaires – les commerces", "Faire les courses", "La cuisine – les repas", "Le temps qui passe",
 "L'école – l'enseignement", "Les professions", "La technologie – les médias", "L'argent – la banque", "La poste – les services – l'administration",
 "La géographie – la francophonie", "La météo", "La ville – la campagne", "Les directions", "Les transports",
 "Le tourisme – les voyages – les vacances", "Les loisirs – les sports – les jeux", "Les arts – les spectacles"];
// Section ids (FI numbering, with chapter for the duplicated ids)
const MAP = {
 1: ["001", "005", "006", "012"], 2: ["013", "014"], 3: ["100", "101", "13:102"], 4: ["033"], 5: ["008", "077", "078", "10:102"],
 6: ["084", "030"], 7: ["083", "087"], 8: ["032", "034", "085"], 9: ["081", "031"], 10: ["060", "061", "062", "063", "064", "065", "8:066", "067", "069", "070"],
 11: ["035", "071", "072", "8:066b", "028", "059"], 12: ["037", "038", "039", "041", "042", "050"], 13: ["046", "047", "048"], 14: ["036", "043", "044", "045"], 15: ["009", "010", "016", "017", "019", "029"],
 16: ["002", "007", "088", "089", "11:090", "11:090b"], 17: ["092", "093", "094", "095"], 18: ["074", "075", "076", "079", "080"], 19: ["096", "097", "098", "099"], 20: ["011", "053", "054", "055"],
 21: ["020", "023", "024", "025", "003"], 22: ["021", "022"], 23: ["049", "004"], 24: ["051", "052"], 25: ["027"],
 26: ["056", "058"], 27: ["018", "026", "082", "086"], 28: ["073"]};
window.VP_UNITS = VP.map((t, i) => ({ n: i + 1, title: t, secs: [] }));
// resolve section keys → indices into FI_VOC (handles duplicated ids by chapter and order)
(function () {
  const seen = {};
  const keyed = FI_VOC.map((s, i) => {
    const base = s.ch + ":" + s.id; seen[base] = (seen[base] || 0) + 1;
    return { i, keys: [s.id, base + (seen[base] > 1 ? "b" : "")] };
  });
  const used = new Set();
  for (const [u, list] of Object.entries(MAP)) for (const k of list) {
    const hit = keyed.find(x => !used.has(x.i) && (k.includes(":") ? x.keys[1] === k : x.keys[0] === k));
    if (hit) { used.add(hit.i); VP_UNITS[u - 1].secs.push(hit.i); }
  }
  window.FI_UNMAPPED = FI_VOC.map((_, i) => i).filter(i => !used.has(i));
})();

window.VOCAB = SURVIVAL.concat(COMM_PHRASES);
VP_UNITS.forEach(u => u.secs.forEach(si => {
  const s = FI_VOC[si];
  s.words.forEach((w, k) => VOCAB.push({ id: `fi${si}_${k}`, unit: u.n, theme: `${u.n}. ${u.title}`, sec: si, fr: w[0], en: w[1], level: s.ch <= 6 ? "A1" : "A2", audio: s.audio, ex: "" }));
}));

// ---------- Study plan items, each with a stream; planner.js gives every item a date from the deadlines ----------
// Streams: survival (week 0) · pho (first two weeks) · gram (A1 phase, linear) · comm (main line: 1–14 in A1, 15–40 in A2)
// vocab units hang on the Communication lesson that uses them · listen (whole period) · exam (fixed check weeks)
window.PLAN = [];
const P = (type, target, title, stream, extra) => PLAN.push(Object.assign({ id: `${type}:${target}`, type, target, title, stream }, extra || {}));
P("vocab", 0, "Kit de survie · les ~100 phrases les plus utiles", "survival");
FI_PHO.forEach((x, i) => P("pho", i + 1, `Prononciation ${i + 1} · ${x.title}`, "pho"));
let bi = 0;
LESSONS.forEach(l => {
  P("lesson", l.id, `Grammaire ${l.n} · ${l.title}`, "gram");
  if (BILANS[bi] && l.n === BILANS[bi][1]) { P("bilan", bi, `Bilan n° ${bi + 1} (grammaire ${BILANS[bi][0]}–${BILANS[bi][1]})`, "gram"); bi++; }
});
COMM_PARTS.forEach(([part, a, b], i) => {
  COMM.filter(c => c.n >= a && c.n <= b).forEach(c => P("comm", c.n, `Communication ${c.n} · ${c.title}`, c.n <= 14 ? "commA1" : "commA2"));
  P("cbilan", i, `Révision communication ${i + 1} · ${part}`, b <= 14 ? "commA1" : "commA2");
});
// a vocabulary unit goes with the first Communication lesson that uses it; the others are spread over the A1 phase
const vocabHost = {};
COMM.forEach(c => c.vocabUnits.forEach(u => { if (!(u in vocabHost)) vocabHost[u] = c.n; }));
VP_UNITS.forEach(u => P("vocab", u.n, `Vocabulaire ${u.n} · ${u.title}`, vocabHost[u.n] ? "host" : "vocabA1", { host: vocabHost[u.n] }));
FI_LISTEN.forEach((x, i) => P("listen", i, `Écoute FI ch. ${String(x.ch).padStart(2, "0")} · ${x.t}`, "listen", { ch: x.ch }));
P("exam", "A1", "Semaine de validation : sujet officiel DELF A1 (écoute + lecture)", "exam");
P("exam", "A2", "Semaine de validation : sujet officiel DELF A2 (écoute + lecture)", "exam");
