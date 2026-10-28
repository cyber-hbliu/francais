"use strict";
// Plan engine: every plan item gets a date, counted back from the deadlines (A1 by a1End, A2 by a2End).
// Sundays are review only. Each day's load = remaining items ÷ remaining study days, recomputed on every open;
// today's list is frozen at the first open so it doesn't grow while you work. Falling behind never shows a debt.

const dParse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d, 12).getTime(); };
const dAdd = (s, n) => dstr(dParse(s) + n * DAY);
const isSun = s => new Date(dParse(s)).getDay() === 0;
function studyDays(a, b) { const out = []; for (let s = a; s <= b; s = dAdd(s, 1)) if (!isSun(s)) out.push(s); return out; }
const fmtDate = s => new Date(dParse(s)).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

// one-time move to the study rhythm of the design brief (160 min/day, 20 new cards per block)
if (!S.settings.briefV) { S.settings.minutes = 160; S.settings.newPerDay = 20; S.settings.objective = S.settings.objective === "ecrit" ? "ecrit" : "tcf"; S.settings.briefV = 1; save(); }

function cal() {
  const s = S.settings, sh = s.shift || 0;
  return { start: "2026-10-28", w0End: "2026-11-01", w1: "2026-11-02", phoEnd: dAdd("2026-11-08", 0),
    a1End: dAdd(s.a1End || "2026-11-29", sh), a2End: dAdd(s.a2End || "2026-12-27", sh), b1: dAdd("2027-01-04", sh) };
}
const isDone = id => !!(S.todo[id] && S.todo[id].done);
// zero-start ramp-up: the phase follows the date (week 0 → week 3+); minutes scale with the daily setting
function phase(T = dstr()) {
  const w = weekOf(T), f = minutesPerDay() / 160;
  const P = w === 0 ? { w, total: 90, rate: 0.7, cover: () => false, retell: { mode: "intro", secs: [60, 45, 30] }, zh: true, newCards: 15 }
    : w === 1 ? { w, total: 120, rate: 0.8, cover: r => r > 1, retell: { mode: "je", secs: [90, 60, 45] }, zh: true, newCards: 15 }
    : w === 2 ? { w, total: 140, rate: 0.9, cover: () => true, retell: { mode: "3e", secs: [90, 60, 45] }, zh: false, newCards: 15 }
    : { w, total: 160, rate: 1, cover: () => true, retell: { mode: "3e", secs: [180, 120, 90] }, zh: false, newCards: 30 };
  if (T === cal().start) P.newCards = 10; // day 1: 10 survival cards
  P.total = Math.round(P.total * f); return P;
}
window.phase = phase;
const sitsLeft = n => { const c = COMM.find(x => x.n === n); return c.dlgs.map((_, k) => k).filter(k => !(S.dlgDone || {})[n + "." + k]); };
const sitOfDay = n => { const l = sitsLeft(n); return l.length ? l[0] : 0; };
// a dialogue is done when its retelling is done; the act is done when all its dialogues are
function doneDialogue(n, k) { S.dlgDone = S.dlgDone || {}; S.dlgDone[n + "." + k] = true; if (!sitsLeft(n).length && !isDone("comm:" + n)) S.todo["comm:" + n] = { done: true, at: Date.now() }; save(); }
const weekOf = d => { const c = cal(); return d < c.w1 ? 0 : Math.floor((dParse(d) - dParse(c.w1)) / (7 * DAY)) + 1; };

function schedule() {
  const T = dstr(), C = cal();
  S.dayplan = S.dayplan || {};
  const frozen = S.dayplan[T], fz = new Set(frozen || []), from = frozen || isSun(T) ? dAdd(T, 1) : T;
  PLAN.forEach(p => { p.date = isDone(p.id) ? dstr(S.todo[p.id].at) : fz.has(p.id) ? T : null; });
  // a Communication act counts once per dialogue it still has (one situation = one day's dialogue)
  const weight = p => p.type === "comm" ? Math.max(1, sitsLeft(p.target).length) : 1;
  const spread = (items, a, b) => {
    items = items.filter(p => !p.date); if (!items.length) return;
    const start = a > from ? a : from;
    let days = studyDays(start, b);
    if (!days.length) days = studyDays(start, dAdd(start, 6)); // behind: spread over the coming week, no debt shown
    const W = items.reduce((s, p) => s + weight(p), 0); let acc = 0;
    items.forEach(p => { p.date = days[Math.min(days.length - 1, Math.floor(acc * days.length / W))]; acc += weight(p); });
  };
  const st = s => PLAN.filter(p => p.stream === s);
  spread(st("survival"), C.start, C.w0End);
  spread(st("pho"), C.start, C.phoEnd);
  // week 0: one grammar chapter a day and Communication 1–2; then the rest of A1 from week 1
  const g = st("gram"), n0 = studyDays(C.start, C.w0End).length;
  spread(g.slice(0, n0), C.start, C.w0End); spread(g.slice(n0), C.w1, C.a1End);
  spread(st("commA1").filter(p => p.type === "comm" && p.target <= 2), C.start, C.w0End);
  spread(st("commA1"), C.w1, C.a1End);
  spread(st("vocabA1"), C.w1, C.a1End);
  const a1Over = st("commA1").concat(st("gram")).every(p => isDone(p.id));
  spread(st("commA2"), a1Over ? from : dAdd(C.a1End, 1), C.a2End);
  spread(st("listen"), C.start, C.a2End);
  PLAN.filter(p => p.stream === "host" && !p.date).forEach(p => { const h = PLAN.find(q => q.id === "comm:" + p.host); p.date = h.date && h.date >= from ? h.date : from; });
  // check weeks: DELF A1 on the Sunday ending week 4, DELF A2 on the Sunday ending week 9
  PLAN.filter(p => p.type === "exam" && !p.date).forEach(p => { let d = p.target === "A1" ? C.a1End : dAdd(C.a2End, 7); if (d < T) d = from; p.date = d; });
  PLAN.forEach(p => p.week = weekOf(p.date));
}
const PLAN_V = 2; // bump when the plan's shape changes: today's list is recomputed if nothing was done yet
function freezeToday() {
  const T = dstr();
  S.dayplan = S.dayplan || {};
  if (S.planV !== PLAN_V) { const r = (S.run || {})[T]; if (!r || !r.blocks.some(b => b.done)) { delete S.dayplan[T]; if (S.run) delete S.run[T]; } S.planV = PLAN_V; }
  if (!(T in S.dayplan)) { schedule(); S.dayplan[T] = PLAN.filter(p => p.date === T && !isDone(p.id) && (!isSun(T) || p.type === "exam")).map(p => p.id); save(); }
  schedule();
}
freezeToday();
const isReached = id => { const p = PLAN.find(q => q.id === id); return isDone(id) || !!(p && p.date && p.date <= dstr()); };
const todayIds = () => (S.dayplan || {})[dstr()] || [];
window.isReached = isReached; window.todayIds = () => todayIds();
const todayOf = type => todayIds().map(id => PLAN.find(p => p.id === id)).filter(p => p && p.type === type);
window.postponeWeek = () => { S.settings.shift = (S.settings.shift || 0) + 7; save(); schedule(); go(tab); };

// the Communication lesson of the day: today's, else the next one not done, else the last one
function lessonOfDay() {
  const t = todayOf("comm")[0];
  if (t) return t.target;
  const next = PLAN.filter(p => p.type === "comm" && !isDone(p.id)).sort((a, b) => (a.date || "") < (b.date || "") ? -1 : 1)[0];
  return next ? next.target : 40;
}
// projected finish of the current phase, from the pace of the last 7 days
function projection() {
  const C = cal(), T = dstr(), phase = T <= C.a1End ? "A1" : "A2", end = phase === "A1" ? C.a1End : C.a2End;
  const main = PLAN.filter(p => phase === "A1" ? ["gram", "commA1", "vocabA1", "survival"].includes(p.stream) || (p.stream === "host" && p.host <= 14) : p.stream === "commA2" || (p.stream === "host" && p.host > 14));
  const left = main.filter(p => !isDone(p.id)).length, wk = Date.now() - 7 * DAY;
  const pace = main.filter(p => isDone(p.id) && S.todo[p.id].at >= wk).length / 6;
  if (!left) return { phase, date: T, done: true };
  if (pace < 0.5) return { phase, date: end, planned: true };
  const need = Math.ceil(left / pace), days = studyDays(dAdd(T, 1), dAdd(T, need * 2 + 7));
  return { phase, date: days[Math.min(need, days.length) - 1] || end, late: (days[need - 1] || end) > end };
}
