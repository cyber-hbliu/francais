"use strict";
// Dates and the ramp-up. There is no calendar plan any more: what is open follows the unit you are in (units.js),
// and the end of the A1 is projected from your own pace (unitPace in units.js).

const dParse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d, 12).getTime(); };
const dAdd = (s, n) => dstr(dParse(s) + n * DAY);
const isSun = s => new Date(dParse(s)).getDay() === 0;
function studyDays(a, b) { const out = []; for (let s = a; s <= b; s = dAdd(s, 1)) if (!isSun(s)) out.push(s); return out; }
const fmtDate = s => new Date(dParse(s)).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const START = "2026-10-28";
const cal = () => ({ start: START });
const isDone = id => !!(S.todo[id] && S.todo[id].done);
// weeks since the start (the correction focus turns every week)
const weekOf = d => d < START ? 0 : Math.floor((dParse(d) - dParse(START)) / (7 * DAY));
// zero-start ramp-up, by unit: shorter chunks and slower speech in the first units, the full retelling from unit 7
function phase() {
  const k = window.curUnit ? curUnit() : 1, w = k <= 2 ? 0 : k <= 4 ? 1 : k <= 6 ? 2 : 3;
  return [{ w, rate: 0.7, cover: () => false, retell: { mode: "intro", secs: [60, 45, 30] }, zh: true },
    { w, rate: 0.8, cover: r => r > 1, retell: { mode: "je", secs: [90, 60, 45] }, zh: true },
    { w, rate: 0.9, cover: () => true, retell: { mode: "3e", secs: [90, 60, 45] }, zh: false },
    { w, rate: 1, cover: () => true, retell: { mode: "3e", secs: [180, 120, 90] }, zh: false }][w];
}
window.phase = phase;
const sitsLeft = n => { const c = COMM.find(x => x.n === n); return c.dlgs.map((_, k) => k).filter(k => !(S.dlgDone || {})[n + "." + k]); };
const sitOfDay = n => { const l = sitsLeft(n); return l.length ? l[0] : 0; };
// a dialogue is done when it was worked through to the end; the act is done when all its dialogues are
function doneDialogue(n, k) { S.dlgDone = S.dlgDone || {}; S.dlgDone[n + "." + k] = true; if (!sitsLeft(n).length && !isDone("comm:" + n)) S.todo["comm:" + n] = { done: true, at: Date.now() }; save(); }
// the Communication act of the current unit
const lessonOfDay = () => window.PARCOURS ? PARCOURS[curUnit() - 1].c[0] : 1;
