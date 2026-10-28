"use strict";
// Third book: « Communication progressive du français, débutant », 2e édition (ISBN 9782090384451) — 40 actes de parole,
// 57 dialogues (one per situation), 6 parts. Titles, situations and pages come from the book's « Table des contenus »
// (book_toc.js). Dialogues, « Manières de dire » and the book's activity are only what you enter from your own book
// (S.book.comm, filled in by applyBook in book.js): an act not yet entered shows its title, pages and the entry button.
window.COMM_PARTS = [["Faire les courses", 1, 7], ["Renseigner, se renseigner", 8, 14], ["Parler des lieux et des objets", 15, 20], ["Parler aux autres", 21, 28], ["Parler de soi", 29, 33], ["Parler des autres", 34, 40]];
window.COMM = CTOC.map(([n, title, sits, gramCol, vocCol]) => ({ n, title, sit: sits.map(s => s[0]).join(" · "), gramCol, vocCol,
  ex: [], task: "", entered: false, dlgs: sits.map(([sit, page]) => ({ sit, page, lines: [], track: "" })) }));
// End-of-part reviews: not in the book (it ends with communicative activities and a test) — added here
window.COMM_BILANS = COMM_PARTS.map((p, i) => ({ i, title: p[0], from: p[1], to: p[2] }));
// « Manières de dire » become review cards (whole phrases) once entered — see applyBook
window.COMM_PHRASES = [];

// Topic map (book's grammar & vocabulary columns → the other resources). [pages (unused: taken from CTOC), Grammaire chapters, Vocabulaire units, FI chapter, Tex topics]
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
COMM.forEach(c => { const m = CMAP[c.n], next = CTOC[c.n] ? CTOC[c.n][2][0][1] : 122;
  Object.assign(c, { bookPages: [c.dlgs[0].page, next - 1], grammar: m[1], vocabUnits: m[2], fiChapter: m[3], texTopics: m[4], level: c.n <= 14 ? "A1" : "A2" }); });
window.TEX = "https://utexas.pressbooks.pub/texfrenchgrammar/";
