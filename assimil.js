"use strict";
// Assimil — French (With Ease series, by Anthony Bulger, 2020): the course of this toolkit, one lesson a day, 100 lessons;
// every 7th lesson is a revision; from lesson 50, the second wave (the lesson of 49 days before, from English back to French).
// Like the other books, the text of the lessons comes only from your own PDF, read in your browser (Plus → Livres) and kept
// with your progress (S.book.assimil, never published); the recordings are yours too (audio/assimil, private repository).
window.AS_N = 100;
const AS_OFFSET = 16; // PDF page = book page + 16
// book pages of each lesson (left page in French, right page in English)
const AS_PAGES = [[1, 4], [3, 8], [7, 10], [9, 14], [13, 16], [17, 20], [19, 24], [25, 28], [29, 32], [31, 34], [35, 38], [37, 42], [41, 46], [45, 50], [51, 54], [55, 60], [59, 64], [63, 70], [69, 74], [73, 78], [79, 84], [85, 90], [89, 96], [95, 100], [99, 106], [105, 110], [109, 116], [115, 122], [123, 128], [127, 132], [133, 138], [137, 144], [143, 148], [149, 154], [153, 162], [161, 168], [167, 174], [173, 180], [179, 186], [187, 192], [193, 200], [199, 206], [207, 214], [213, 220], [219, 226], [225, 232], [231, 238], [239, 246], [245, 254], [255, 262], [261, 268], [267, 274], [275, 280], [281, 288], [287, 294], [293, 302], [301, 308], [307, 314], [315, 322], [323, 330], [329, 338], [337, 344], [343, 352], [353, 360], [359, 366], [367, 374], [373, 380], [381, 388], [387, 394], [395, 404], [403, 410], [411, 418], [417, 424], [425, 432], [431, 440], [439, 446], [445, 456], [455, 462], [463, 470], [469, 476], [477, 484], [485, 492], [491, 498], [499, 508], [509, 516], [515, 524], [523, 532], [531, 540], [539, 546], [545, 554], [553, 564], [563, 572], [571, 578], [579, 586], [585, 594], [593, 602], [601, 610], [609, 620], [621, 628], [627, 634]];
const AS_GRAMMAR = [636, 665], AS_LEXICON = [669, 738]; // Grammatical overview; French–English lexicon
// the lesson titles (the contents page of the book)
const AS_TITLES = ["Comment allez-vous ?", "Le café", "Présentations", "L'heure", "Je cherche le métro", "À l'hôtel", "Révision",
  "Une visite", "À la mairie", "C'est très simple !", "Au marché (première partie)", "Au marché (deuxième partie)", "Un cadeau", "Révision",
  "Un tour dans Paris (première partie)", "Un tour dans Paris (deuxième partie)", "Quels sont vos projets ?", "Prenons rendez-vous avec le banquier", "Un bel endroit pour une fête", "Un monde idéal", "Révision",
  "Réfléchissez, choisissez, jouez", "Comment réussir au loto", "Je ne vais pas bien du tout", "Déjeunons ensemble", "Déjeunons ensemble (suite)", "« Hôtel complet »", "Révision",
  "Comment vas-tu ?", "J'ai un truc à te demander…", "J'en ai besoin rapidement", "Je ne peux plus continuer comme ça", "Je n'ai rien dans ma garde-robe", "Les randonneurs", "Révision",
  "J'espère que je n'ai rien oublié…", "J'ai réfléchi à la question du loyer…", "C'est de la part de qui ?", "Le septième art", "Tu es si impatient !", "Un accueil désagréable", "Révision",
  "Le foot féminin", "Perturbations dans les transports…", "Il n'y a pas de métiers inutiles", "Depuis, je n'ai aucune nouvelle", "Un déménagement", "Ça ne me dit rien", "Révision",
  "Je m'ennuie…", "Hâtez-vous lentement !", "Nous nous sommes bien amusés !", "Je ne ferai plus jamais ça !", "Votez pour moi : vous ne le regretterez pas…", "Mais c'est horrible, ton film !", "Révision",
  "Vive les Bretons !", "Un grincheux", "Il ne gagnait (presque) jamais", "Le voisinage est de plus en plus dangereux !", "La célébrité ne me dit pas grand-chose", "J'ai mis le doigt sur ton problème…", "Révision",
  "Je crains le pire…", "Cent pour cent des gagnants ont tenté leur chance !", "Président d'un jour", "L'encre la plus pâle…", "La visite de la petite-fille", "« Les animaux ne mentent pas… »", "Révision",
  "« La Dame de fer »", "Ça ne se fait pas !", "Je n'en peux plus !", "Les soldes", "Le Prix « Accord majeur »", "« Culture générale » : le jeu radiophonique", "Révision",
  "« Les voyages forment la jeunesse »", "Il faut que je trouve une bonne excuse…", "« Notre action ne dépend que de vous. »", "La réaction des patrons", "Qu'ils sont idiots !", "Du beurre dans les épinards…", "Révision",
  "Comment ça, je massacre le français ?", "Un entretien avec un chasseur de têtes", "Le commissaire Périer mène l'enquête", "Le commissaire Périer mène l'enquête (suite)", "Il faut le faire !", "« Le » ou « la » ? – Les deux !", "Révision",
  "Un magazine littéraire", "Un cours d'histoire : « Le jour de gloire est arrivé ! »", "Les inconvénients du travail à domicile", "Le JT du soir", "Une émission-débat : « Réinventons le rire »", "En plein dans le mille !", "Révision",
  "Incroyable mais vrai…", "La langue française"];
window.isRevision = k => k % 7 === 0;
// the second wave: from lesson 50, the lesson of 49 days before is done again, actively (Assimil's « productive phase »)
window.wave2Of = k => k >= 50 ? k - 49 : 0;

// ---------- Français interactif (UT Austin, CC BY): each lesson gets the FI material on its topic ----------
// index in FI_VOC → Assimil lesson (by the topic of the dialogue); FI_PHO lesson n → Assimil lesson; FI_LISTEN by chapter
const FI_VOC_AT = [3, 10, 7, 69, 1, 3, 10, 22, 6, 18, 9, 9, 8, 29, 4, 21, 17, 20, 20, 48, 85, 16, 57, 57, 34, 44, 15, 31, 24, 33, 68, 58, 21, 50,
  25, 11, 12, 53, 53, 29, 2, 26, 41, 12, 23, 23, 15, 31, 5, 8, 46, 36, 42, 78, 19, 19, 72, 37, 37, 47, 6, 36, 36, 94, 94, 51, 60, 60, 51, 52,
  39, 43, 52, 45, 30, 38, 55, 59, 14, 74, 40, 34, 24, 73, 89, 79, 61, 93, 62, 62, 32, 45, 86, 86, 83, 97, 81, 81, 79, 79, 65];
const FI_PHO_AT = [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 15];
const FI_LISTEN_FROM = { 1: 8, 2: 12, 3: 16, 4: 24, 5: 25, 6: 36, 7: 43, 8: 47, 9: 52, 10: 57, 11: 61, 12: 64, 13: 72 };
window.FI_OF = Array.from({ length: AS_N + 1 }, () => ({ voc: [], pho: [], listen: [] }));
(window.FI_VOC || []).forEach((s, i) => { const k = FI_VOC_AT[i]; if (k) FI_OF[k].voc.push(i); });
FI_PHO_AT.forEach((k, i) => FI_OF[k].pho.push(i + 1));
{ let next = 1; (window.FI_LISTEN || []).forEach((x, i) => { let k = Math.max(next, FI_LISTEN_FROM[x.ch] || 1); while (isRevision(k)) k++; FI_OF[Math.min(AS_N, k)].listen.push(i); next = k + 1; }); }

// ---------- the content of the lessons, from your import (S.book.assimil) ----------
// fields are plain text, one item per line, so that you can check and correct them by hand:
//   dlg « 1 - Monsieur, madame, vous désirez ? » · trad « 1 - Sir, Madam, what would you like? » (same numbers)
//   ex1 « phrase | answer » · ex2 « English sentence | French with … for the gaps | missing words separated by – »
window.AS = [];
const asLines = t => String(t || "").split("\n").map(x => x.trim()).filter(Boolean);
const asPair = l => l.split("|").map(x => x.trim());
const asNum = l => { const m = l.match(/^(\d{1,2})\s*(.*)$/); return m ? [+m[1], m[2]] : [0, l]; };
window.applyAssimil = S => {
  const E = (S.book || {}).assimil || {};
  AS.length = 0;
  for (let k = 1; k <= AS_N; k++) {
    const e = E[k] && !E[k].cleared ? E[k] : {}, tr = {};
    asLines(e.trad).forEach(l => { const [n, t] = asNum(l); if (n) tr[n] = t; });
    const dlg = asLines(e.dlg).map(l => { const [n, t] = asNum(l); return { n, text: t.replace(/^[-–]\s*/, ""), turn: /^[-–]/.test(t), en: (tr[n] || "").replace(/^[-–]\s*/, "") }; });
    AS[k] = { k, title: e.title || AS_TITLES[k - 1], titleEn: e.titleEn || "", pages: AS_PAGES[k - 1], rev: isRevision(k), entered: !!e.dlg, draft: !!e.draft,
      dlg, pron: e.pron || "", notes: e.notes || "", culture: e.culture || "", revText: e.rev || "",
      ex1: asLines(e.ex1).map(asPair), ex2: asLines(e.ex2).map(l => { const [en, tpl, ans] = asPair(l); return { en, tpl: tpl || "", ans: (ans || "").split(/\s+[-–]\s+|^[-–]\s*|\s*[-–]$/).map(x => x.trim()).filter(Boolean) }; }) };
  }
  // the words of Français interactif on the lesson's topic: cards only once you add them (☆, carnet)
  (window.FI_VOC || []).forEach((s, i) => { const k = FI_VOC_AT[i]; if (k) s.words.forEach(([fr, en], j) => VOCAB.push({ id: "fi" + i + "_" + j, fr, en, unit: "fi" + k, theme: s.title, level: "A1", src: "FI", audio: s.audio })); });
  // the lexicon of the book: each word is a card of the lesson where it first appears
  ((((S.book || {}).alex || {})[1] || {}).words || []).forEach(([fr, pos, en, ls], i) => {
    const k = Math.min(...ls); if (!(k >= 1 && k <= AS_N)) return;
    VOCAB.push({ id: "as" + i + "_" + asSlug(fr), fr, en, pos, unit: "a" + k, theme: "Assimil " + k, level: "A1", src: "livre", lessons: ls });
  });
};
const asSlug = s => stripAccB(String(s).toLowerCase()).replace(/[^a-z]+/g, "").slice(0, 16);
window.asPdf = () => pdfGet("assimil");

// ---------- import: the whole PDF is read once (text layer), split into lessons, then each lesson into its parts ----------
// lines of a page, with the size of their characters; the small numbers of the notes (⁽1⁾) are kept apart
const asRows = items => {
  const it = items.filter(i => i.str.trim()).map(i => [i.str, Math.round(i.transform[4]), Math.round(i.transform[5]), Math.round(Math.hypot(i.transform[0], i.transform[1])), i.fontName])
    .sort((a, b) => b[2] - a[2] || a[1] - b[1]);
  const rows = [];
  for (const i of it) { const r = rows.find(r => Math.abs(r.y - i[2]) <= Math.max(3, r.s * 0.45)); if (r) r.items.push(i); else rows.push({ y: i[2], s: i[3], items: [i] }); }
  rows.sort((a, b) => b.y - a.y);
  return rows.map(r => { const sz = r.items.map(i => i[3]).sort((a, b) => a - b), med = sz[sz.length >> 1], items = r.items.sort((a, b) => a[1] - b[1]);
    return { y: r.y, s: med, x: items[0][1], f: items[0][4], items, t: items.map(i => i[3] < med * 0.8 && /^\d{1,2}$/.test(i[0].trim()) ? `⁽${i[0].trim()}⁾` : i[0]).join(" ").replace(/\s+/g, " ").trim() }; });
};
const nsp = s => s.replace(/\s+/g, "");
// the page numbers at the foot of the pages: « 5 • cinq [sah"k] », « [seess] six • 6 », « cent dix • 110 »
const asFooter = t => /•\s*\d[\d ]*$/.test(t) && /\[|^[a-zéèêûç\- ]+•/.test(t) || /^\d[\d ]*\s*•/.test(t) && /\[|•\s*[a-zéèêûç\- ]+$/.test(t);
// the lesson number in the running head of a left page (« 12 / Douzième leçon »)
const asHead = L => { const t = nsp(L[0] ? L[0].t : ""); if (!/le[çc]on$/i.test(t)) return null; const d = t.match(/^(\d{1,3})/); return d ? +d[1] : t[0] === "S" ? 5 : null; };
const asIsTitle = (side, l) => side === "fr" ? /[eé][çc]on/i.test(nsp(l.t)) && (l.s >= 12 || /\[/.test(l.t))
  : /[lt\\]?es+on$/i.test(nsp(l.t).replace(/[-_.,�G)(CD0o]+$/, "")) && l.s >= 11 && !/\/|phase/i.test(l.t);
const asSep = t => nsp(t).replace(/[^A-Za-zÀ-ÿ]/g, "").length < 3 && !/\d/.test(t) || /^\*+$/.test(nsp(t));
// left pages (French) and right pages (English) are split apart: the number in the running head of the left page says
// which lesson is under way at the bottom of the spread; a page without a running head starts a lesson
function asSplit(P, side) {
  const out = {}; let cur = 0;
  for (let n = AS_PAGES[0][0] + AS_OFFSET; n <= AS_GRAMMAR[0] + AS_OFFSET - 1; n++) {
    if ((n % 2 ? "fr" : "en") !== side || !P[n]) continue;
    const L = P[n], h = asHead(P[side === "fr" ? n : n - 1] || []);
    const hasHead = side === "fr" ? h !== null : /[lt\\]es+on[\/I!|1]?\d+$/i.test(nsp(L[0] ? L[0].t : ""));
    let body = L.filter(l => !asFooter(l.t)); if (hasHead) body = body.slice(1);
    if (h === null || h > cur) {
      let split = 0;
      if (h !== null) { const ti = body.findIndex(l => asIsTitle(side, l)); split = Math.max(0, ti); while (split > 0 && asSep(body[split - 1].t)) split--; }
      (out[cur] = out[cur] || []).push(...body.slice(0, split).map(l => ({ ...l, p: n })));
      cur = h === null ? cur + 1 : h; body = body.slice(split);
    }
    (out[cur] = out[cur] || []).push(...body.map(l => ({ ...l, p: n })));
  }
  return out;
}
// the OCR of the book cut many words with spaces (« u n e », « breto n n e », « s i m ple »): pieces are joined again
// when the joined word is in the dictionary, or when they are mostly single letters
let AS_W = null;
function asWords() {
  if (AS_W) return AS_W;
  const W = new Set(["a", "à", "y", "i", "ô", "o", "1"]);
  const ER = ["e", "es", "ent", "ons", "ez", "é", "ée", "és", "ées", "ais", "ait", "ions", "iez", "aient", "erai", "eras", "era", "erons", "erez", "eront", "erais", "erait", "eraient", "ant", "er"],
    IR = ["is", "it", "issons", "issez", "issent", "i", "ie", "is", "ies", "issait", "ira", "irai", "ons", "ez", "ent", "u", "ue", "us", "ues", "ant"];
  (window.DICT || []).forEach(e => { const w = e.w.toLowerCase(); W.add(w);
    if (/er$/.test(w)) ER.forEach(x => W.add(w.slice(0, -2) + x)); else if (/ir$/.test(w)) IR.forEach(x => W.add(w.slice(0, -2) + x));
    else ["s", "e", "es", "x"].forEach(x => W.add(w + x));
    if (/(en|on)$/.test(w)) ["ne", "nes"].forEach(x => W.add(w + x));
    (e.s || []).forEach(([, gl]) => gl.forEach(g => g.toLowerCase().split(/[^a-zà-ÿœ']+/).forEach(x => { if (x) { W.add(x); W.add(x + "s"); } }))); });
  (typeof VERBS !== "undefined" ? VERBS : []).forEach(v => { try { if (Array.isArray(v)) { String(v[2]).split(" ").forEach(f => W.add(f)); W.add(v[3]); return; } (v.pres || []).forEach(f => W.add(f)); if (v.pp) W.add(v.pp);
    ["imp", "fut"].forEach(t => [0, 1, 2, 3, 4, 5].forEach(p => conjForm(v, t, p).forEach(f => W.add(String(f).toLowerCase())))); } catch (e) { } });
  return AS_W = W;
}
const asCore = w => w.toLowerCase().replace(/[’]/g, "'").replace(/^[^a-zà-ÿœ0-9]+|[^a-zà-ÿœ0-9]+$/g, "");
const asKnown = (W, w) => { const c = asCore(w); if (!c) return true; if (/^\d+$/.test(c) || W.has(c)) return true;
  const parts = c.split(/['_-]/).filter(Boolean); return parts.length > 1 && parts.every(x => W.has(x) || W.has(x + "'") || x.length === 1 && /[ldjmnstc]/.test(x)); };
function asFix(t) {
  const W = asWords(); if (W.size < 1000) return t;
  // the OCR reads two signs as « � »: « ft » in English (a�er, o�en), the liaison mark in French (mon�ami → mon_ami)
  t = t.replace(/([A-Za-zÀ-ÿ]*)�([A-Za-zÀ-ÿ]*)/g, (m, a, b) => asKnown(W, a + "ft" + b) ? a + "ft" + b : a + "_" + b);
  const T = t.split(" "), n = T.length, best = new Array(n + 1).fill(-1e9), from = new Array(n + 1).fill(0); best[0] = 0;
  for (let i = 1; i <= n; i++) for (let j = Math.max(0, i - 9); j < i; j++) {
    const ps = T.slice(j, i), w = ps.join(""), c = asCore(w), L = c.length || 1;
    let sc;
    // a word as printed counts a little more than the same letters joined (« de main » stays apart, « s i m ple » is joined)
    if (ps.length === 1) sc = asKnown(W, w) ? L ** 1.5 + (L > 1 ? 2 : 0) : L === 1 ? -2 : L === 2 ? -0.5 : 0;
    else if (ps.some(x => !asCore(x)) || ps.some((x, q) => q && /^[-A-ZÀ-Ý]/.test(x) || q < ps.length - 1 && /-$/.test(x)) || ps.some(x => /^\d+$/.test(x)) && ps.some(x => /\D/.test(x)) || /[.!?;:,»)]$/.test(ps.slice(0, -1).join(" ")) || /[(«]/.test(ps.slice(1).join(""))) sc = -1e6; // never across punctuation
    // (never after a circled 0, never across a compound: « au rez-de-chaussée »; two pieces only when the word is known)
    else if (ps[0] === "0" || ps.some(x => /\p{L}-\p{L}/u.test(x) && x.length > 4)) sc = -1e6;
    else sc = asKnown(W, w) ? L ** 1.5 : ps.length > 2 && ps.filter(x => asCore(x).length <= 1).length * 2 >= ps.length ? L * 0.5 : -9;
    if (best[j] + sc > best[i]) { best[i] = best[j] + sc; from[i] = j; }
  }
  const out = []; for (let i = n; i > 0; i = from[i]) out.unshift(T.slice(from[i], i).join(""));
  return out.join(" ");
}
const NUMV = { S: "5", s: "5", I: "1", l: "1", O: "0", o: "0" };
// the number of a dialogue line (the OCR reads 5 as S, 1 as I, 10 as « 1 0 »)
// (« 3 On » is line 3, « 1 0 » line 10: the number that is expected decides)
const asLineNo = (t, want) => { const m = t.match(/^(?:⁽(\d{1,2})⁾|([0-9SIlOo])(?:\s?([0-9Oo])(?=\s|$|-))?)(?=\s|$|-|[A-ZÀ-Ý])/); if (!m) return null; if (m[1]) return +m[1];
  const a = NUMV[m[2]] || m[2], b = m[3] ? a + (NUMV[m[3]] || m[3]) : null;
  if (b && /^\d+$/.test(b) && (+b === want || +a !== want)) return +b; return /^\d$/.test(a) ? +a : null; };
const asNoStrip = (t, no) => no >= 10 ? t.replace(/^(?:⁽\d+⁾|[0-9SIlOo]\s?[0-9Oo])\s*/, "") : t.replace(/^(?:⁽\d+⁾|[0-9SIlOo])\s*/, "");
// the circled numbers of the exercises, as the OCR reads them (0, O, f), @, 8, 6, C…)
const BUL = /^(?:[068]|O|@|[ftT][)}\]]|0\)|\(D|CD|[❶-❿]|ü|€)$/;
const asBul = t => { const w = t.split(/\s/)[0]; return BUL.test(w) && /\s/.test(t); };
// five exercise items in running text, split at the circled numbers
// (in the answers to exercise 2, every circled number counts: the missing words end with « - »)
const asItems = (txt, loose) => {
  const T = String(txt || "").split(/\s+/).filter(Boolean), at = [];
  T.forEach((w, i) => { if (BUL.test(w) && (i === 0 || loose || /[.!?…»"'):\]-]$|[a-z]7$/.test(T[i - 1]) || /^[0-9@Oo]$/.test(w) && /[a-zà-ÿ]$/.test(T[i - 1]))) at.push(i); });
  let cut = at; if (cut.length > 5) cut = cut.filter((i, j) => j === 0 || /[.!?…»"']$/.test(T[i - 1])); if (cut.length > 5) cut = cut.slice(0, 5);
  return cut.map((i, j) => T.slice(i + 1, cut[j + 1] ?? T.length).join(" "));
};
// one lesson: French side (dialogue, pronunciation, notes, exercises), then English side (translation, notes, answers)
function asParse(k, FRL, ENL) {
  const rev = isRevision(k), o = { title: "", titleEn: "", dlg: [], trad: [], pron: [], notes: [], ex1: "", ans1: "", ex2: [], ans2: "", culture: [], rev: [], rtrad: "" };
  let st = "head", cur = null, exp = 1, lastP = 0, top = false, seen1 = false;
  const newEx2 = t => o.ex2.push({ en: t.replace(/^\S+\s+/, ""), tpl: "" });
  for (const l of FRL) {
    const t = l.t, n = nsp(t).toLowerCase();
    if (l.p !== lastP) { lastP = l.p; top = true; }
    // a dialogue goes on at the top of the next page
    if (/^\d+$/.test(n) && l.s <= 7) continue; // note numbers on their own line
    if (top && o.dlg.length && !seen1 && /^(notes|pron|misc)$/.test(st) && asLineNo(t, exp) === exp) st = st === "misc" && rev ? "rdlg" : "dlg";
    top = false;
    if (st === "head") { if (asIsTitle("fr", l)) st = "title"; continue; }
    if (st === "title") { if (asSep(t)) continue; o.title = t.replace(/^[0OoGC]\s+/, ""); st = rev ? "rev" : "dlg"; continue; }
    if (/^•?pro?nunc/.test(n) && n.length < 20) { st = "pron"; continue; }
    if (/^.{0,4}notes?$/.test(n)) { st = "notes"; continue; }
    if (/exerc.?ce1/.test(n)) { st = "ex1"; seen1 = true; continue; }
    if (/exerc.?ce2/.test(n)) { st = "ex2"; continue; }
    if (/^exercise2/.test(n)) continue;
    if (/dialoguedev?r[ée]vision/.test(n)) { st = "rdlg"; exp = 1; continue; }
    if (/^\*+$/.test(n)) { if (st !== "rev") st = st === "ex2" ? "culture" : "misc"; continue; }
    if (/^\S{0,3}\s?Notes?\s/.test(t) && st !== "notes") { st = "notes"; o.notes.push(t.replace(/^\S{0,3}\s?Notes?\s/, "")); continue; }
    if (st === "dlg" || st === "rdlg") {
      const no = asLineNo(t, exp);
      if (no === exp && !(cur && l.x >= cur.x + 8)) { cur = { t: asNoStrip(t, no), n: no, x: l.x, p: l.p }; o.dlg.push(cur); exp++; continue; }
      if (cur && l.x >= cur.x + 8 && l.p === cur.p) { cur.t += " " + t; continue; }
      if (!cur && st === "dlg") { o.title += " " + t; continue; } // a title on two lines
      if (/^•/.test(t)) { st = "pron"; o.pron.push(t.replace(/^•\s*/, "")); continue; }
      if (cur) { cur.t += " " + t; continue; }
      if (st === "rdlg") { o.rev.push(t); continue; }
    }
    if (st === "pron") { o.pron.push(t); continue; }
    if (st === "notes" || st === "misc" && /^:?\s?\d/.test(t)) { st = "notes"; o.notes.push(t); continue; }
    if (st === "ex1") { o.ex1 += " " + t; continue; }
    if (st === "ex2") { if (asBul(t)) newEx2(t); else if (o.ex2.length) { const it = o.ex2[o.ex2.length - 1]; if (/\.\s?\./.test(t) || it.tpl) it.tpl += " " + t; else it.en += " " + t; } continue; }
    if (st === "rev") { o.rev.push(t); continue; }
    o.culture.push(t);
  }
  const N = o.dlg.length; let e = 1, tx = null; st = "head"; lastP = 0;
  for (const l of ENL) {
    const t = l.t, n = nsp(t).toLowerCase();
    if (l.p !== lastP) { lastP = l.p; if (/^(notes|pnotes|misc)$/.test(st) && e > 1 && e <= N && !rev) st = "trad"; if (st === "ans1") st = "ex2"; }
    if (/^\d+$/.test(n) && l.s <= 7) continue;
    if (/productivephase|secondwave/.test(n)) continue;
    if (st === "head") { if (asIsTitle("en", l)) st = "title"; continue; }
    if (st === "title") { if (asSep(t)) continue; o.titleEn = t; st = rev ? "rev" : "trad"; continue; }
    if (/^pronunciationnotes/.test(n)) { st = "pnotes"; continue; }
    if (/answerstoexerc?i?se?[17]/.test(n)) { st = "ans1"; continue; }
    if (/answerstoexerc?i?se?2/.test(n)) { st = "ans2"; continue; }
    if (/^tra?nslation$/.test(n)) { st = "rtrad"; continue; }
    if (/^\*+$/.test(n)) { st = st === "ans2" ? "culture" : st === "rev" ? "rev" : "misc"; continue; }
    if (/^\S{0,3}\s?Notes?\s/.test(t) && st === "trad") { st = "notes"; o.notes.push(t.replace(/^\S{0,3}\s?Notes?\s/, "")); continue; }
    if (st === "trad") {
      const no = asLineNo(t, e);
      // on the same page, a translation line goes on indented; a line at another margin starts the notes
      if (tx && l.p === tx.p) {
        if (l.x >= tx.x + 10 && e > 1) { o.trad[e - 2] += " " + t; continue; }
        if (no === e && e <= N && (Math.abs(l.x - tx.x) <= 4 || no >= 10 && l.x >= tx.x - 9 && l.x <= tx.x)) { o.trad[e - 1] = asNoStrip(t, no); tx = l; e++; continue; }
        st = "notes"; o.notes.push(t); continue;
      }
      if (tx && l.p !== tx.p && no !== e) { st = "notes"; o.notes.push(t); continue; } // the top of a page that is not the translation
      if (no === e && e <= N) { o.trad[e - 1] = asNoStrip(t, no); tx = l; e++; continue; }
      if (e === 1 && no === null && l.s >= 11) { o.titleEn += " " + t; continue; }
      if (no !== null || e === 1) { st = "notes"; o.notes.push(t); continue; }
      o.trad[e - 2] += " " + t; continue;
    }
    if (st === "rtrad") { o.rtrad += " " + t; continue; }
    if (st === "pnotes") { if (asLineNo(t) !== null && !/^\(/.test(t)) { st = "notes"; o.notes.push(t); } else o.pron.push(t); continue; }
    // after the answers to exercise 1, the end of exercise 2 (its last items are often on the right page)
    if (st === "misc" && o.ans1 && !o.ans2 && o.ex2.length < 5 && (asBul(t) || /\.\s?\.\s?\./.test(t))) st = "ex2";
    if (st === "notes" || st === "misc") { o.notes.push(t); st = "notes"; continue; }
    if (st === "ans1") { o.ans1 += " " + t; continue; }
    if (st === "ans2") { o.ans2 += " " + t; continue; }
    if (st === "ex2") { if (asBul(t)) newEx2(t); else if (o.ex2.length) o.ex2[o.ex2.length - 1].tpl += " " + t; continue; }
    if (st === "rev") { o.rev.push(t); continue; }
    o.culture.push(t);
  }
  return o;
}

// ---------- from the parse to the fields you check (plain text, one item per line) ----------
const asGaps = t => String(t || "").replace(/(?:\.\s?){2,}\.?/g, " … ").replace(/\s*•\s*$/, "").replace(/\s+/g, " ").replace(/ ([.,?!])/g, "$1").trim();
const asClean = t => String(t || "").replace(/\s*□\s*$/, "").replace(/\s*[-_]{3,}\S*\s*$/, "").replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
// notes: a new note starts with its number (« : 3 », « 3 », « (3) » for the pronunciation notes)
const asParas = lines => { const out = []; lines.forEach(t => { t = t.replace(/^[:;]\s*(?=\d|:i)/, "").replace(/^:i\s/, "3 ");
  if (!out.length || /^(\d{1,2}|\(\d{1,2}\s?\)(,\s?\(\d{1,2}\s?\))*)\s/.test(t)) out.push(t); else out[out.length - 1] += " " + t; });
  return out.map(asClean).join("\n"); };
// the translation of the revision dialogue is in running text: « 1 - Hello Chloé, how are you? 2 - Very well… »
const asRunning = (txt, N) => { const out = []; let rest = " " + txt;
  for (let i = 1; i <= N; i++) { const m = rest.match(new RegExp(`\\s${String(i).split("").join("\\s?")}\\s?(?=[-–A-Z"«(\\[])`)); if (!m) break; rest = rest.slice(m.index + m[0].length);
    const nx = rest.match(new RegExp(`\\s${String(i + 1).split("").join("\\s?")}\\s?(?=[-–A-Z"«(\\[])`)); out.push(asClean(nx ? rest.slice(0, nx.index) : rest)); }
  return out; };
function asFields(k, o) {
  const f = { title: asClean(o.title), titleEn: asClean(o.titleEn), page: AS_PAGES[k - 1].join("–") };
  const trad = o.rtrad ? asRunning(o.rtrad, o.dlg.length) : o.trad;
  f.dlg = o.dlg.map(d => `${d.n} ${asClean(d.t)}`).join("\n");
  f.trad = o.dlg.map((d, i) => trad[i] ? `${d.n} ${asClean(trad[i])}` : "").filter(Boolean).join("\n");
  f.pron = asClean(o.pron.join(" "));
  f.notes = asParas(o.notes);
  f.rev = rev(k) ? asParas(o.rev) : "";
  const e1 = asItems(o.ex1), a1 = asItems(o.ans1);
  f.ex1 = e1.map((x, i) => `${asClean(x)} | ${asClean(a1[i] || "")}`).join("\n");
  const a2 = asItems(o.ans2, true);
  f.ex2 = o.ex2.slice(0, 5).map((x, i) => `${asClean(x.en)} | ${asGaps(x.tpl)} | ${asClean(a2[i] || "")}`).join("\n");
  // what follows the answers of exercise 2 is the cultural note
  const tail = asItems(o.ans2, true)[4] || "", cut = tail.search(/\s[A-Z][a-z]+(\s[a-z]+){3}/);
  f.culture = asParas([...(cut > 0 ? [tail.slice(cut)] : []), ...o.culture]).replace(/\n/g, " ");
  if (cut > 0) f.ex2 = f.ex2.replace(asClean(tail), asClean(tail.slice(0, cut)));
  return f;
}
const rev = isRevision;
const AS_FIELDS = ["title", "titleEn", "dlg", "trad", "pron", "notes", "ex1", "ex2", "culture", "rev"];
// the French–English lexicon: « adresse (f) address 8 » · « agent (m) agent 37; officer 46 » → [word, category, English, lessons]
const AS_POS = { m: "n.m.", f: "n.f.", fj: "n.f.", pl: "pl.", vb: "v.", "m/f": "n.", "f/m": "n.", "m pl": "n.m. pl.", "f pl": "n.f. pl.", adj: "adj.", adv: "adv." };
function asLexicon(rows) {
  const out = [], x0 = {}; let cur = null;
  rows.forEach(r => { x0[r.p] = Math.min(x0[r.p] ?? 1e9, r.x); }); // the left margin of each page
  for (const r of rows) {
    if (asFooter(r.t) || /^(French|English)\s*-\s*(English|French)/i.test(r.t)) continue;
    if (r.x > x0[r.p] + 6 && cur) { cur.rest += " " + r.t; continue; }
    const it = r.items, hw = asClean(asFix(it[0][0])); let i = 1, pos = "";
    const pm = hw.match(/\s\((m|f|fJ|pl|vb|m\/f|f\/m|m pl|f pl)\)$/i);
    let word = hw; if (pm) { pos = AS_POS[pm[1].toLowerCase()] || ""; word = hw.slice(0, pm.index); }
    else if (it[1] && /^\((m|f|fJ|pl|vb|m\/f|f\/m|m pl|f pl)\)$/i.test(it[1][0].trim())) { pos = AS_POS[it[1][0].trim().slice(1, -1).toLowerCase()] || ""; i = 2; }
    cur = { word, pos, rest: it.slice(i).map(x => x[0]).join(" ") }; out.push(cur);
  }
  return out.map(e => { const senses = asFix(e.rest.replace(/\s+/g, " ").trim()).split(/;\s*/), en = [], ls = [];
    senses.forEach(s => { const m = s.match(/^(.*?)\s*((?:\d[\d ]*)(?:,\s*\d[\d ]*)*)$/); if (!m) { if (s) en.push(s); return; } if (m[1]) en.push(m[1]); m[2].split(",").forEach(n => { const v = +n.replace(/\s/g, ""); if (v >= 1 && v <= AS_N) ls.push(v); }); });
    // a category the OCR left at the start of the English: « (j) abbey » = (f)
    let pos = e.pos, gl = en.join("; "); const pm = !pos && gl.match(/^\((m|f|fJ|j|f\}|pl)\)\s*/i); if (pm) { pos = AS_POS[pm[1].toLowerCase().replace(/^(fj|j|f\})$/, "f")] || ""; gl = gl.slice(pm[0].length); }
    return [e.word.replace(/\s+/g, " "), pos, gl.replace(/\s+,/g, ","), [...new Set(ls)]]; }).filter(e => e[0] && e[3].length);
}
let AS_STOP = false;
window.asStop = () => { AS_STOP = true; };
const asSt = t => { const el = document.getElementById("bkall_assimil"); if (el) el.textContent = t; };
async function asReadPages(doc, a, b, st) {
  await loadDict(); asWords(); const P = [];
  for (let n = a; n <= b && !AS_STOP; n++) { if (st && n % 10 === 0) st(`Lecture du livre : page ${n - AS_OFFSET} / ${b - AS_OFFSET}…`);
    const tc = await (await doc.getPage(n)).getTextContent(); P[n] = asRows(tc.items).map(l => Object.assign(l, { t: asFix(l.t) })); }
  return P;
}
// a lesson you checked: nothing you saved is touched, only its empty fields are filled
const asMerge = (k, f) => {
  S.book = S.book || {}; const E = S.book.assimil = S.book.assimil || {}, old = E[k];
  if (old && !old.draft && !old.cleared) { const add = AS_FIELDS.filter(x => !String(old[x] || "").trim() && String(f[x] || "").trim());
    add.forEach(x => old[x] = f[x]); if (add.length) { old.fresh = [...new Set((old.fresh || []).concat(add))]; old.at = Date.now(); } return; }
  E[k] = Object.assign({ at: Date.now(), draft: true }, f);
};
window.asImportAll = async () => {
  const doc = await bookDoc("assimil"); if (!doc) { asSt("Choisissez d'abord le PDF."); return; }
  AS_STOP = false;
  const P = await asReadPages(doc, AS_PAGES[0][0] + AS_OFFSET, AS_LEXICON[1] + AS_OFFSET, asSt); if (AS_STOP) { asSt("Arrêté."); return; }
  const F = asSplit(P, "fr"), E = asSplit(P, "en");
  for (let k = 1; k <= AS_N; k++) asMerge(k, asFields(k, asParse(k, F[k] || [], E[k] || [])));
  asLexImport(P); save();
  asSt(`Terminé : ${AS_N} leçons et ${(((S.book.alex || {})[1] || {}).words || []).length} mots du lexique. Rechargement…`);
  setTimeout(() => location.reload(), 800);
};
function asLexImport(P) {
  const rows = []; for (let n = AS_LEXICON[0] + AS_OFFSET; n <= AS_LEXICON[1] + AS_OFFSET; n++) rows.push(...(P[n] || []).map(r => Object.assign(r, { p: n })));
  const words = asLexicon(rows), old = ((S.book || {}).alex || {})[1];
  if (old && old.words && old.words.length && !old.draft && !old.cleared) return; // a lexicon you checked is kept
  S.book.alex = { 1: { at: Date.now(), draft: true, words } };
}
window.asLexOnly = async () => {
  const doc = await bookDoc("assimil"); if (!doc) { asSt("Choisissez d'abord le PDF."); return; }
  AS_STOP = false; const P = await asReadPages(doc, AS_LEXICON[0] + AS_OFFSET, AS_LEXICON[1] + AS_OFFSET, asSt); if (AS_STOP) return;
  S.book = S.book || {}; asLexImport(P); save(); asSt("Lexique importé. Rechargement…"); setTimeout(() => location.reload(), 800);
};
// « Lire ces pages dans le PDF » on the check page of one lesson: the spread around it, split the same way
window.asReadOne = async (k, st) => {
  const doc = await bookDoc("assimil"); if (!doc) { st("Choisissez d'abord le PDF du livre (à droite)."); return null; }
  const [a, b] = AS_PAGES[k - 1], P = await asReadPages(doc, a + AS_OFFSET - 4, b + AS_OFFSET + 1);
  // (the running heads give the lesson numbers; the pages before the lesson give the number of a page without one)
  const F = asSplit(P, "fr"), E = asSplit(P, "en");
  return F[k] ? asFields(k, asParse(k, F[k], E[k] || [])) : null;
};
PDF_OFFSET.assimil = AS_OFFSET;
