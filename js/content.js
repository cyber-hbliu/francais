"use strict";
// Static teaching content taken from your study plan (Nation's principles applied to Mandarin → French).
const SOUNDS = [
  { id: "y", title: "/y/ — tu, rue, du", tip: "Same as pinyin ü (as in 绿 lǜ). Nothing to practise: just remember that French u = ü.", words: ["tu", "rue", "du", "sur", "une"], easy: true },
  { id: "oe", title: "/ø/ and /œ/ — deux, heure", tip: "Rounded e: say “e” (as in 个 gè) with your lips rounded like “o”. No Mandarin equivalent, so give it daily practice. /ø/ (deux, peu, bleu) is closed; /œ/ (heure, sœur, fleur) is more open.", words: ["deux", "peu", "bleu", "heure", "sœur", "fleur", "neuf", "veux"] },
  { id: "nasal", title: "Nasal vowels — an/en, on, in", tip: "The vowel is nasalised; the tongue does NOT touch the roof of the mouth. Mandarin speakers tend to add an n or ng at the end (“bon” → “bonng”). Stop at the vowel.", words: ["dans", "vent", "bon", "long", "vin", "pain", "un", "enfant", "maintenant"] },
  { id: "unasp", title: "p t k are NOT aspirated", tip: "French p/t/k sound close to pinyin b/d/g (no puff of air). French b/d/g are truly voiced: the vocal cords vibrate before the release. Hold a hand in front of your mouth: “pas” should give almost no puff.", words: ["pas", "tout", "car", "bas", "doux", "gare", "papa", "tante", "café"] },
  { id: "r", title: "/ʁ/ — the French r", tip: "Uvular: a soft friction at the back of the throat, like gargling gently (similar to a voiced version of Mandarin h in 喝 hē, further back). Not the pinyin r.", words: ["rue", "rouge", "mer", "merci", "rire", "arriver", "très"] },
  { id: "final", title: "Silent final consonants", tip: "Most final consonants are silent (petit, grand, vous, trois, parlent). Exceptions to listen for: c, r, f, l (“CaReFuL”): bonjour, avec, neuf, sel. Liaison joins them before a vowel: vous_avez.", words: ["petit", "grand", "vous", "trois", "parlent", "bonjour", "avec", "neuf", "vous avez"] },
  { id: "rhythm", title: "Syllable-timed rhythm", tip: "Like Mandarin, French gives syllables roughly equal length, and stress falls only on the last syllable of a phrase. This part is easier for you than for English speakers: no reduced vowels.", words: ["je m’appelle Marie", "j’habite à Paris", "il y a un café"] },
];
const MIN_PAIRS = [
  ["pas", "bas", "p / b"], ["tout", "doux", "t / d"], ["car", "gare", "k / g"], ["pain", "bain", "p / b"], ["pont", "bond", "p / b"], ["tante", "dente", "t / d"],
  ["rue", "loup", "r / l"], ["roue", "lou", "r / l"], ["tu", "tout", "y / u"], ["rue", "roue", "y / u"], ["dessus", "dessous", "y / u"],
  ["bon", "beau", "on / o"], ["vin", "vent", "in / an"], ["vent", "vont", "an / on"], ["un", "on", "un / on"], ["deux", "do", "ø / o"], ["peu", "pu", "ø / y"], ["sœur", "sur", "œ / y"],
];
const COGNATES = [
  ["-tion → -tion", "nation, information, question, attention", "same spelling; say it the French way"],
  ["-té → -ty", "université, nationalité, qualité, liberté", "feminine nouns"],
  ["-ment (adverb) → -ly", "rapidement, certainement, seulement", "often built from the feminine adjective + ment"],
  ["-eur / -euse → -or / -er", "acteur, directeur, serveur", ""],
  ["-ique → -ic", "magique, électrique, pratique", ""],
  ["-ant / -ent → -ing / -ent", "important, intéressant, différent", ""],
  ["-ible / -able → same", "possible, impossible, agréable", ""],
  ["é- / ê- → s- (lost s)", "école (school), étudier (study), hôpital (hospital), forêt (forest)", "a circumflex or é often replaces an old s"],
  ["-eux / -euse → -ous", "sérieux, curieux, délicieux", ""],
];
const FALSE_FRIENDS = [
  ["librairie", "bookshop (not library → bibliothèque)"], ["actuellement", "at present (not actually → en fait)"], ["éventuellement", "possibly (not eventually → finalement)"],
  ["sensible", "sensitive (not sensible → raisonnable)"], ["rester", "to stay (not to rest → se reposer)"], ["assister à", "to attend (not to assist → aider)"],
  ["attendre", "to wait for (not to attend)"], ["blesser", "to wound (not to bless)"], ["coin", "corner (not coin → pièce)"], ["demander", "to ask (not to demand → exiger)"],
  ["journée", "the whole day (jour = day as a unit)"], ["lecture", "reading (not lecture → cours, conférence)"], ["location", "rental (not location → endroit)"],
  ["monnaie", "change / currency (not money → argent)"], ["passer un examen", "to take an exam (not to pass → réussir)"], ["préservatif", "condom (not preservative → conservateur)"],
  ["sympathique", "nice, friendly (not sympathetic → compatissant)"], ["chair", "flesh (chaise = chair)"], ["crayon", "pencil (not crayon)"], ["pain", "bread (not pain → douleur)"],
  ["terrible", "terrible or great, depending on context"], ["déception", "disappointment (not deception → tromperie)"], ["formidable", "great, wonderful (not formidable)"],
];
// speaking scripts to personalise (week 1–3 outputs)
const SCRIPTS = {
  intro30: {
    title: "30-second self-introduction (week 1)",
    text: "Bonjour, je m’appelle … . Je suis … (chinois / chinoise). J’ai … ans.\nJ’habite à … . Je suis étudiant(e) / Je travaille comme … .\nJ’apprends le français parce que … . Enchanté(e) !",
  },
  intro60: {
    title: "1-minute self-introduction (week 2, DELF speaking part 1)",
    text: "Bonjour, je m’appelle … . Je suis … et j’habite à … .\nJ’ai … ans. Je suis … (étudiant(e) / ingénieur …).\nJ’ai … frère(s) et … sœur(s). / Je suis fils unique / fille unique.\nJ’aime … et je n’aime pas … .\nJe parle chinois et anglais. J’apprends le français depuis … .\nMon objectif : … . Merci !",
  },
  family: {
    title: "1.5-minute family introduction (week 3)",
    text: "Voici ma famille. Mon père s’appelle … , il a … ans, il est … .\nMa mère s’appelle … , elle a … ans, elle est … .\nJ’ai … frère(s) / sœur(s) …\nNous habitons à … . Le week-end, nous … .",
  },
  shopping: {
    title: "Shopping role-play (DELF speaking part 3)",
    text: "— Bonjour, madame / monsieur. Je voudrais … , s’il vous plaît.\n— Voilà. Et avec ça ?\n— C’est combien ?\n— Ça fait … euros.\n— Voici. Merci, au revoir !",
  },
  postcard: {
    title: "40-word postcard (week 5)",
    text: "Chère … / Cher … ,\nJe suis à … . Il fait … . L’hôtel est … et la nourriture est … .\nDemain, je vais … . Je pense à toi !\nGrosses bises, …",
  },
};
const DELF_PARTS = [
  { k: "listening", label: "Listening", zh: "听力" }, { k: "reading", label: "Reading", zh: "阅读" },
  { k: "writing", label: "Writing", zh: "写作" }, { k: "speaking", label: "Speaking", zh: "口语" },
];
const INTERFERENCE = "Related words learned together get confused. The app holds back members of closed sets (days, months, colours, numbers, family, food lists…) so that no more than 2 per set enter in the same week; the rest wait for a later week.";
