"use strict";
// ───────────── cards: base cards come from the lessons, custom ones from the user ─────────────
// SRS state per card in S.cards[id] = {s:"new"|"learn"|"rev", due (day number), ivl, ease, reps, lapses, intro (ymd), my (own mnemonic), off}
const OPEN_CLUSTERS = new Set(["", "other", "greetings"]);   // clusters that do not interfere
let _cardIdx = null;
function allCards() {
  if (_cardIdx) return _cardIdx;
  const out = [];
  (window.LESSONS || []).forEach(L => { if (L) (L.cards || []).forEach((c, i) => out.push({ ...c, id: `L${L.n}-${i}`, lesson: L.n, src: "lesson" })); });
  S.custom.forEach(c => out.push({ ...c, src: c.src || "custom", lesson: c.lesson || 0 }));
  _cardIdx = out; return out;
}
const cardById = id => allCards().find(c => c.id === id);
function invalidateCards() { _cardIdx = null; }
function addCustomCard(c) {
  const id = "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  if (S.custom.some(x => x.fr === c.fr)) { toast("Already in your cards"); return null; }
  S.custom.push({ id, zh: "", cog: "", ff: "", kw: "", ex: "", exEn: "", cluster: "", ...c }); invalidateCards(); save(); toast("Added to your new cards ☆"); return id;
}
const st = id => S.cards[id];
const today = () => dayNum();
function introducedOn(date) { return Object.entries(S.cards).filter(([, v]) => v.intro === date).length; }
function newToday() { return introducedOn(ymd()); }

// closed-set interference: max 2 per cluster per calendar week (Mon–Sun) and per day
function clusterLoad(date) {
  const mon = mondayOf(date), end = addDays(mon, 6), week = {}, day = {};
  for (const [id, v] of Object.entries(S.cards)) {
    if (!v.intro) continue;
    const c = cardById(id); if (!c || OPEN_CLUSTERS.has(c.cluster || "")) continue;
    if (v.intro >= mon && v.intro <= end) week[c.cluster] = (week[c.cluster] || 0) + 1;
    if (v.intro === date) day[c.cluster] = (day[c.cluster] || 0) + 1;
  }
  return { week, day };
}
function pickNew(limit, currentLesson) {
  const date = ymd(), load = clusterLoad(date), picked = [], held = [];
  const pool = allCards().filter(c => !st(c.id) && (c.src !== "lesson" || c.lesson <= Math.max(currentLesson, 1)));
  // order: starred custom first, then the current lesson, then older lessons (backlog)
  pool.sort((a, b) => rank(a) - rank(b) || a.lesson - b.lesson);
  function rank(c) { return c.src === "lesson" ? (c.lesson === currentLesson ? 1 : 2) : 0; }
  for (const c of pool) {
    if (picked.length >= limit) break;
    const cl = c.cluster || "";
    if (!OPEN_CLUSTERS.has(cl) && ((load.week[cl] || 0) >= 2 || (load.day[cl] || 0) >= 2)) { held.push(c); continue; }
    picked.push(c); if (!OPEN_CLUSTERS.has(cl)) { load.week[cl] = (load.week[cl] || 0) + 1; load.day[cl] = (load.day[cl] || 0) + 1; }
  }
  return { picked, held: held.length };
}
function dueCards() {
  const t = today();
  return allCards().filter(c => { const v = st(c.id); return v && !v.off && v.s !== "new" && v.due <= t; });
}
function counts(currentLesson) {
  const due = dueCards().length, left = Math.max(0, (S.settings.newPerDay || 15) - newToday());
  const avail = pickNew(left, currentLesson).picked.length;
  return { due, newLeft: left, newAvail: avail };
}
function mature() { return Object.values(S.cards).filter(v => v.s === "rev" && v.ivl >= 21).length; }
function learned() { return Object.values(S.cards).filter(v => v.s === "rev").length; }

// build a review queue: due reviews (shuffled) then new cards (shuffled in groups)
function buildQueue(currentLesson, opt = {}) {
  const due = shuffle(dueCards()).slice(0, opt.maxReviews || 60);
  const left = opt.noNew ? 0 : Math.max(0, Math.min(opt.newLimit ?? 99, (S.settings.newPerDay || 15) - newToday()));
  const { picked, held } = left ? pickNew(left, currentLesson) : { picked: [], held: 0 };
  return { due, fresh: shuffle(picked), held };
}

// q: 0 again, 1 hard, 2 good, 3 easy  → returns minutes-ish hint for UI and whether to requeue in this session
function rate(card, q) {
  let v = S.cards[card.id];
  const first = !v;
  if (!v) v = S.cards[card.id] = { s: "new", due: today(), ivl: 0, ease: 2.5, reps: 0, lapses: 0, intro: ymd() };
  const d = dayRec();
  if (first || v.s === "new") d.newCards++; else d.reviews++;
  let requeue = false;
  if (v.s === "new" || v.s === "learn") {
    if (q <= 1) { v.s = "learn"; requeue = true; }
    else { const keep = v.relearn ? Math.max(1, v.ivl || 1) : (q === 3 ? 4 : 1); v.s = "rev"; v.relearn = false; v.ivl = keep; v.due = today() + keep; v.reps++; }
  } else {
    v.reps++;
    if (q === 0) { v.s = "learn"; v.relearn = true; v.lapses++; v.ease = Math.max(1.3, v.ease - 0.2); v.ivl = Math.max(1, Math.round(v.ivl * 0.35)); requeue = true; }
    else {
      const f = q === 1 ? 1.2 : q === 2 ? v.ease : v.ease * 1.35;
      if (q === 1) v.ease = Math.max(1.3, v.ease - 0.15); if (q === 3) v.ease += 0.12;
      const n = Math.max(v.ivl + 1, Math.round(v.ivl * f * (0.95 + Math.random() * 0.1)));
      v.ivl = n; v.due = today() + n;
    }
  }
  save();
  return { requeue, ivl: v.ivl };
}
function nextHint(card) {   // what each button would do (for labels)
  const v = S.cards[card.id];
  if (!v || v.s === "new" || v.s === "learn") return ["again", "soon", "1 d", "4 d"];
  const g = f => Math.max(v.ivl + 1, Math.round(v.ivl * f));
  const lab = n => n < 30 ? n + " d" : Math.round(n / 30) + " mo";
  return ["again", lab(g(1.2)), lab(g(v.ease)), lab(g(v.ease * 1.35))];
}
