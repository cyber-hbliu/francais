"use strict";
// ───────────── the 8-week plan (from your Nation-based schedule). Weeks follow LESSON numbers, so a missed day just shifts everything. ─────────────
const WEEKS = [
  { w: 1, lessons: [1, 7], fi: 0, fiName: "00 Bienvenue", grammar: "Phonology, alphabet, subject pronouns, être, tu/vous, greetings", output: "Memorise a 30-second self-introduction. Numbers 0–20: record a shuffled list and listen again and again.", topic: "Je me présente", mono: "Introduce yourself: name, country, age, city, job/studies, why French." },
  { w: 2, lessons: [8, 14], fi: 1, fiName: "01 Bonjour", grammar: "Noun gender, articles, -er verbs (present), avoir, il y a", output: "A 1-minute self-introduction (DELF speaking part 1).", topic: "Mon identité", mono: "Say who you are and what you do in a day." },
  { w: 3, lessons: [15, 21], fi: 2, fiName: "02 Me voici", grammar: "Negation ne…pas, three question forms, possessive adjectives, family", output: "A 1.5-minute introduction of your family. Form-filling practice.", topic: "Ma famille", mono: "Present your family (or friends): who, age, job, what they like." },
  { w: 4, lessons: [22, 28], fi: 3, fiName: "03", grammar: "aller, faire, venir, near future, prepositions with cities/countries, time, weather, numbers 70–100", output: "Diagnostic test: DELF A1 sample listening and reading. (Thanksgiving week: lighter load is fine.)", topic: "Mes projets et le temps", mono: "Say where you go this weekend, what the weather is like, what you will do." },
  { w: 5, lessons: [29, 35], fi: 4, fiName: "04 Les gens", grammar: "Adjective agreement & position, c’est vs il est, nationalities", output: "Describe a person (3/2/1.5 monologue). Write a 40-word postcard.", topic: "Une personne", mono: "Describe a person you know: look, character, nationality, job." },
  { w: 6, lessons: [36, 42], fi: 5, fiName: "05 Bon appétit", grammar: "Partitive articles, quantities, prendre/boire/vouloir/pouvoir, ordering, shopping, prices", output: "Shopping role-play with Claude (DELF speaking part 3).", topic: "Au restaurant, au marché", mono: "Order a meal and buy food; ask prices; pay." },
  { w: 7, lessons: [43, 49], fi: 6, fiName: "06 La ville", grammar: "Asking the way, imperative, place prepositions, transport, passé composé intro (common avoir verbs)", output: "First full four-skill mock exam, timed.", topic: "Ma ville", mono: "Describe your town and give directions to the station." },
  { w: 8, lessons: [50, 56], fi: 6, fiName: "Review", grammar: "Review: reinforce the weakest skill from the mock. Second wave starts: lessons 1–7 from English back to French.", output: "Repeat form and postcard writing; rehearse the three speaking parts one by one.", topic: "Ma journée", mono: "Tell your typical day from morning to night." },
];
const WEEK_TOPICS = ["Mes habitudes", "Mon week-end", "Mes vacances", "Mon travail ou mes études", "Mon logement", "Mes goûts", "Un souvenir", "Mes projets"];
function weekInfo(w) {
  if (WEEKS[w - 1]) return WEEKS[w - 1];
  const a = (w - 1) * 7 + 1, b = Math.min(100, w * 7);
  return { w, lessons: [a, b], fi: Math.min(13, w - 2), fiName: "", grammar: `Assimil lessons ${a}–${b}${w >= 15 ? "" : ""}`, output: "Keep the cycle: second wave, 10-minute writing, 3/2/1.5 monologue on a new topic.", topic: WEEK_TOPICS[(w - 9) % WEEK_TOPICS.length], mono: "Talk about this topic for 3, then 2, then 1½ minutes." };
}
const weekOf = n => Math.min(15, Math.max(1, Math.ceil(n / 7)));
const isReviewDay = n => n % 7 === 0;
const NL = 100;
const L = n => (window.LESSONS || [])[n];
const lessonTitle = n => (L(n) && L(n).title) || `Lesson ${n}`;

function lessonDone(n) { return !!(S.lessons[n] && S.lessons[n].done); }
function currentLesson() { for (let n = 1; n <= NL; n++) if (!lessonDone(n)) return n; return NL + 1; }
function doneCount() { let c = 0; for (let n = 1; n <= NL; n++) if (lessonDone(n)) c++; return c; }
// the lesson the calendar expects today (start date + n-1); used only for the gentle "ahead / behind" line
function scheduledLesson() { return Math.max(0, Math.min(NL, dayNum() - dayNum(S.start) + 1)); }
function weekDates(w) { const a = addDays(S.start, (w - 1) * 7); return [a, addDays(a, 6)]; }

// ───────────── FI material for a lesson-day: this week's chapter, spread over its 7 days ─────────────
function fiItems(ch) {
  const out = [];
  (window.FI_VOC || []).filter(v => v.ch === ch && (v.words.length || v.audio)).forEach(v => out.push({ t: "voc", ref: v }));
  (window.FI_LISTEN || []).filter(x => x.ch === ch).forEach(x => out.push({ t: "listen", ref: x }));
  return out;
}
function fiForDay(n) {
  const wk = weekInfo(weekOf(n)), items = fiItems(wk.fi), k = (n - 1) % 7, len = items.length;
  return { week: wk, ch: wk.fi, items: items.slice(Math.floor(k * len / 7), Math.floor((k + 1) * len / 7)) };
}
const FI_URL = "https://www.laits.utexas.edu/fi/";

// ───────────── the day's steps ─────────────
// kinds are rendered in session.js; min = suggested minutes (the timer is a guide, not a wall)
function buildSteps(n, mode = "full") {
  const rev = isReviewDay(n), s = (id, strand, title, min, extra = {}) => ({ id, strand, title, min, ...extra });
  const hasOld3 = n > 3, second = n >= 50;
  if (mode === "lite") return [
    s("listen-closed", "input", "Listen twice, book closed", 8),
    s("cards", "focus", "Cards: reviews + 5 new", 5, { lite: true }),
    s("retell", "output", "Say 3 lines from memory", 4, { lite: true }),
  ];
  if (rev) return [
    s("listen-closed", "input", "Revision lesson: listen twice, book closed", 8),
    s("listen-fr", "input", "Listen again, French text on screen", 6),
    s("fi-context", "input", "Français interactif: this week’s word lists and listening", 10, { all: true }),
    s("notes", "focus", "Read the revision notes", 10),
    s("fi-gram", "focus", "Tex grammar and dialogues: the whole chapter", 8),
    s("cards", "focus", "Clear the card backlog", 15, { backlog: true }),
    s("exercises", "output", "Exercises 1 and 2", 6),
    s("write10", "output", "10-minute free writing", 10),
    s("relisten", "fluency", "Re-listen to older lessons (1.1–1.25×)", 10),
    s("weekly", "output", "Week review + send your writing for correction", 10),
  ];
  return [
    s("listen-closed", "input", "Listen twice, book closed", 6),
    s("listen-en", "input", "Listen with the English translation", 7),
    s("listen-fr", "input", "Listen with the French text", 7),
    s("fi-context", "input", "Français interactif word list (optional)", 8, { optional: true }),
    s("notes", "focus", "Read the notes", 6),
    s("shadow", "focus", "Repeat sentence by sentence", 8),
    s("fi-gram", "focus", "Tex grammar dialogue (optional)", 6, { optional: true }),
    s("cards", "focus", "Cards: reviews, then new", 12),
    s("exercises", "output", "Exercises 1 and 2", 6),
    s("retell", "output", "Retell the dialogue, book closed", 8),
    s("write", "output", "Write 5–8 sentences about your life", second ? 8 : 14),
    second ? s("second-wave", "output", `Second wave: lesson ${n - 49}, English → French, spoken and written`, 10) : null,
    s("relisten", "fluency", hasOld3 ? "Re-listen to lessons " + [n - 3, n - 7].filter(x => x >= 1).join(" and ") + " (1.1–1.25×)" : "Listen to today’s lesson again, faster", 10),
    s("readaloud", "fluency", "Read an old lesson aloud, timed", 8),
    s("monologue", "fluency", "3 / 2 / 1½ minute monologue", 12),
  ].filter(Boolean);
}
const totalMin = steps => steps.reduce((a, x) => a + x.min, 0);

// ───────────── acceptance standard for "solid A1" ─────────────
// after lesson 100 the book sends you back to lesson 51: second wave over the second half
const WAVE2_START = 51;
function wave2Next() { const d = S.wave2 || (S.wave2 = { done: {} }); for (let m = WAVE2_START; m <= NL; m++) if (!d.done[m]) return m; return NL + 1; }
const A1_STANDARD = [
  { id: "mock", text: "Second full mock: total ≥ 75 and every skill ≥ 17 of 25" },
  { id: "intro", text: "Self-introduction, questions and a shopping dialogue delivered without notes" },
  { id: "words", text: "About 700 words actively known (mature cards)", auto: true },
  { id: "audio30", text: "Assimil lessons 1–30: understand about 90% by ear, without the book", auto: true },
];
function weekTargets() { return Object.assign({ cards: 90, lessons: 7, listen: 90, words: 80 }, S.settings.targets || {}); }
function weekStats(mon) {
  const days = []; for (let i = 0; i < 7; i++) days.push(S.days[addDays(mon, i)]);
  const sum = f => days.reduce((a, d) => a + (d ? f(d) : 0), 0);
  const end = addDays(mon, 6);
  return {
    mon, cards: sum(d => d.newCards), reviews: sum(d => d.reviews), lessons: sum(d => d.lessons.length), listen: Math.round(sum(d => d.listen) / 60),
    study: Math.round(sum(d => Object.values(d.sec).reduce((x, y) => x + y, 0)) / 60), active: days.filter(d => d && (d.sessions || d.lite)).length,
    words: S.writing.filter(x => x.date >= mon && x.date <= end).reduce((a, x) => a + x.words, 0),
    sec: ["input", "focus", "output", "fluency"].reduce((o, k) => (o[k] = sum(d => d.sec[k] || 0), o), {}),
  };
}
