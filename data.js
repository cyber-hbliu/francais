// Course structure follows the unit order of « Grammaire progressive du français – débutant (A1) » (60 units, 8 bilans)
// and « Vocabulaire progressif du français – A1 » (28 units). Titles and pages come from the books' tables of contents (book_toc.js);
// the content of each unit is only what you enter from your own book (book.js).
// Vocabulary words and audio come from Français interactif (UT Austin, COERLL/LAITS), CC BY 3.0 — see fi_data.js.
window.FI_BASE = "https://www.laits.utexas.edu/fi/toc/";
window.TV5 = "https://apprendre.tv5monde.com/fr";

const FICH = {1:1,2:1,3:1,4:1,5:1,6:2,7:2,8:5,9:4,10:1,11:1,12:1,13:3,14:2,15:4,16:4,17:4,18:10,19:2,20:2,21:6,22:3,23:6,24:1,25:1,26:4,27:4,28:3,29:2,30:3,31:5,32:5,33:7,34:7,35:4,36:5,37:9,38:9,39:5,40:4,41:3,42:3,43:3,44:6,45:6,46:6,47:7,48:11,49:7,50:10,51:2,52:10,53:6,54:6,55:9,56:9,57:8,58:8,59:9,60:9};
window.LESSONS = [];
// title, sub-headings and page from the book's Sommaire (book_toc.js); rules, examples and exercises come only from your
// entry of the book (S.book.gram, filled in by applyBook in book.js) — nothing is shown for a chapter not yet entered
GTOC.forEach(([n, title, subs, page]) => LESSONS.push({ id: "g" + String(n).padStart(2, "0"), n, level: "A1", fi: FICH[n], title, subs, page, rules: [], examples: [], ex: [], entered: false }));

// Bilans after these units (book order)
window.BILANS = GBILANS.map(([to, , page], i) => [i ? GBILANS[i - 1][0] + 1 : 1, to, page]);

// Vocabulaire progressif A1 units → Français interactif vocabulary sections (by FI section index in FI_VOC)
const VP = VTOC.map(v => v[1]);
// Section ids (FI numbering, with chapter for the duplicated ids)
const MAP = {
 1: ["001", "005", "006", "012"], 2: ["013", "014"], 3: ["100", "101", "13:102"], 4: ["033"], 5: ["008", "077", "078", "10:102"],
 6: ["084", "030"], 7: ["083", "087"], 8: ["032", "034", "085"], 9: ["081", "031"], 10: ["060", "061", "062", "063", "064", "065", "8:066", "067", "069", "070"],
 11: ["035", "071", "072", "8:066b", "028", "059"], 12: ["037", "038", "039", "041", "042", "050"], 13: ["046", "047", "048"], 14: ["036", "043", "044", "045"], 15: ["009", "010", "016", "017", "019", "029"],
 16: ["002", "007", "088", "089", "11:090", "11:090b"], 17: ["092", "093", "094", "095"], 18: ["074", "075", "076", "079", "080"], 19: ["096", "097", "098", "099"], 20: ["011", "053", "054", "055"],
 21: ["020", "023", "024", "025", "003"], 22: ["021", "022"], 23: ["049", "004"], 24: ["051", "052"], 25: ["027"],
 26: ["056", "058"], 27: ["018", "026", "082", "086"], 28: ["073"]};
window.VP_UNITS = VP.map((t, i) => ({ n: i + 1, title: t, page: VTOC[i][2], secs: [], book: [], texte: [], exos: [] }));
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

// the cards: the kit de survie, then the book's words and phrases from your entries (applyBook).
// Français interactif words are not cards: FI only lends its recordings to the book's words (book.js).
window.VOCAB = SURVIVAL.slice();
window.PLAN = []; // the calendar plan is gone: the units of units.js say what comes next
