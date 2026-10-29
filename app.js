"use strict";
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const DAY = 864e5, KEY = "fr-toolkit-v1";
const dstr = (t = Date.now()) => { const d = new Date(t); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const stripAcc = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
const normAns = s => s.toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ").replace(/'\s+/g, "'").trim();
const hl = s => esc(s).replace(/«/g, "<mark>").replace(/»/g, "</mark>");
const plain = s => s.replace(/[«»]/g, "");
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; };

// ---------- state ----------
let S;
function load() {
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
  S = Object.assign({ cards: {}, sessions: [], todo: {}, daily: {}, mistakes: [], settings: { newPerDay: 10, speak: true }, lastExport: 0 }, S || {});
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { console.warn(e); } }
load();
applyBook(S); // the content you entered from the three books → LESSONS / COMM / VOCAB (book.js)
// study time is also kept per device (S.dev), so two devices studying on the same day add up after a sync
const DEV = (() => { let d = "local"; try { d = localStorage.getItem("fr-dev"); if (!d) { d = Math.random().toString(36).slice(2, 10); localStorage.setItem("fr-dev", d); } } catch (e) { } return d; })();
if (!S.dev) S.dev = { [DEV]: JSON.parse(JSON.stringify(S.daily)) }; // history so far belongs to this device
function addDay(field, v, strand) {
  const T = dstr(); S.dev = S.dev || {}; S.dev[DEV] = S.dev[DEV] || {};
  for (const o of [S.daily[T] || (S.daily[T] = {}), S.dev[DEV][T] || (S.dev[DEV][T] = {})]) {
    if (strand) { o.st = o.st || {}; o.st[strand] = (o.st[strand] || 0) + v; } else o[field] = (o[field] || 0) + v;
  }
}
// migrate plan ticks from the older week-based ids ("lesson:g01:w1" → "lesson:g01")
Object.keys(S.todo).forEach(k => { const m = k.match(/^((?!tv5:).+):w\d+$/); if (m) { if (!S.todo[m[1]] || S.todo[k].at > S.todo[m[1]].at) S.todo[m[1]] = S.todo[k]; delete S.todo[k]; } });

// ---------- cards ----------
const ITEMS = {};
VOCAB.forEach(v => ITEMS["v:" + v.id] = { id: "v:" + v.id, kind: "v", v, theme: v.theme, unit: v.unit, level: v.level });
LESSONS.forEach(l => l.ex.forEach((e, i) => ITEMS[`g:${l.id}:${i}`] = { id: `g:${l.id}:${i}`, kind: "g", l, q: e[0], a: e[1], inst: e[2] || "", theme: "Grammaire: " + l.title, level: l.level }));
const ALL = Object.keys(ITEMS);
const card = id => S.cards[id];
const isMature = id => card(id) && card(id).interval >= 21;

function grade(id, q) { // 0 again, 1 hard, 2 good, 3 easy  (SM-2 variant with relearning)
  const now = Date.now();
  const c = S.cards[id] || (S.cards[id] = { ease: 2.5, interval: 0, reps: 0, lapses: 0, due: now, first: now });
  if (!c.last) addDay("newSeen", 1);
  if (q === 0) {
    c.lapses++; c.reps = 0; c.interval = 0; c.ease = Math.max(1.3, c.ease - 0.2); c.due = now + 10 * 60e3;
    S.mistakes.push({ id, t: now });
    if (S.mistakes.length > 500) S.mistakes.shift();
  } else {
    c.reps++;
    if (c.reps === 1) c.interval = q === 1 ? 1 : q === 3 ? 4 : 1;
    else if (c.reps === 2) c.interval = q === 1 ? 2 : q === 3 ? 6 : 3;
    else c.interval = Math.max(c.interval + 1, Math.round(c.interval * c.ease * (q === 1 ? 1.2 / c.ease * 1.5 : q === 3 ? 1.3 : 1)));
    c.ease = Math.max(1.3, c.ease + (q === 1 ? -0.15 : q === 3 ? 0.15 : 0));
    c.due = now + c.interval * DAY;
  }
  c.last = now; c.mod = now;
  track("review", "Révision", q > 0); if (window.RUN_STATS) RUN_STATS.cards++;
  save();
}
const isDue = id => { const c = card(id); return c && c.due <= Date.now(); };
const dueIds = () => ALL.filter(isDue);
const leeches = () => ALL.filter(id => card(id) && card(id).lapses >= 2 && card(id).interval < 21).sort((a, b) => card(b).lapses - card(a).lapses);

// ---------- session / time tracking ----------
function track(type, label, ok) {
  const now = Date.now();
  let s = S.sessions[S.sessions.length - 1];
  if (!s || s.type !== type || now - s.end > 10 * 60e3) {
    s = { id: now.toString(36) + Math.random().toString(36).slice(2, 5), type, label, start: now, end: now, total: 0, correct: 0 };
    S.sessions.push(s);
  }
  s.end = now;
  if (ok !== undefined) { s.total++; if (ok) s.correct++; }
  save();
}
let lastAct = Date.now(), curStrand = null; // curStrand: study | input | output | fluency (Nation's four strands)
["click", "keydown", "scroll"].forEach(e => addEventListener(e, () => lastAct = Date.now(), { passive: true }));
// listening (any audio or speech playing) and recording count as study time, even with the page in the background;
// elapsed time is measured, since browsers slow timers down on hidden pages
let lastTick = Date.now();
const AUDIO_ON = new Set();
document.addEventListener("play", e => AUDIO_ON.add(e.target), true);
["pause", "ended"].forEach(ev => document.addEventListener(ev, e => AUDIO_ON.delete(e.target), true));
setInterval(() => {
  const now = Date.now(), dt = Math.min(60, Math.round((now - lastTick) / 1000)); lastTick = now;
  const playing = !player.paused || speechSynthesis.speaking || [...AUDIO_ON].some(a => !a.paused) || [...document.querySelectorAll("audio")].some(a => !a.paused) || (typeof rec !== "undefined" && rec && rec.state === "recording") || window.MIC_ON;
  if (playing) lastAct = now;
  if ((document.visibilityState === "visible" && now - lastAct < 60e3) || playing) {
    addDay("secs", dt); if (curStrand) addDay(null, dt, curStrand);
    save();
  }
}, 15e3);

// ---------- speech ----------
// Per-word audio uses the best installed French voice; full native recordings come from Français interactif.
const frVoices = () => speechSynthesis.getVoices().filter(v => /^fr[-_]FR/i.test(v.lang) || v.lang === "fr");
function bestVoice() {
  const vs = frVoices(), serious = vs.filter(v => !/grandma|grandpa|rocko|eddy|flo|sandy|shelley|reed/i.test(v.name));
  return vs.find(v => v.name === S.settings.voice) ||
    serious.find(v => /premium|enhanced|améliorée|siri/i.test(v.name)) ||
    serious.find(v => /amélie|audrey|aurélie|thomas/i.test(v.name)) || serious.find(v => /marie|daniel/i.test(v.name)) || serious[0] || vs[0];
}
function speak(t) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel(); player.pause();
  const u = new SpeechSynthesisUtterance(plain(t).replace(/\(.*?\)|\.\.\.|…/g, " ")); u.lang = "fr-FR"; u.rate = S.settings.rate || 0.85;
  const v = bestVoice(); if (v) u.voice = v;
  speechSynthesis.speak(u);
}
const player = new Audio();
function playRec(url) { speechSynthesis.cancel(); if (player.src !== url) player.src = url; player.currentTime = 0; player.play(); track("listen", "Écoute FI"); }
window.speak = speak; window.playRec = playRec;
if ("speechSynthesis" in window) speechSynthesis.onvoiceschanged = () => { };
const spk = t => `<button class="b s" onclick='speak(${JSON.stringify(plain(t)).replace(/'/g, "&#39;")})' title="Écouter">🔊</button>`;

// ---------- links ----------
const fiLink = n => `<a target="_blank" rel="noopener" href="${FI_BASE}${String(n).padStart(2, "0")}/">Français interactif ch. ${String(n).padStart(2, "0")}</a>`;
const tv5Link = (label) => `<a target="_blank" rel="noopener" href="${TV5}">TV5MONDE Apprendre le français${label ? " (" + esc(label) + ")" : ""}</a>`;

// ---------- router ----------
const view = $("#view");
let tab = "today";
const PARENT = { uwords: "mots", errs: "mots", dico: "mots", progress: "more", comm: "more", learn: "more", vocab: "more", highlight: "more", recs: "more", method: "more", sync: "more" };
const SUBS = { mots: [["uwords", "Mots de l'unité"], ["errs", "Carnet d'erreurs"], ["dico", "Dictionnaire"]], more: [["progress", "Statistiques"], ["comm", "Communication"], ["learn", "Grammaire"], ["vocab", "Vocabulaire"], ["highlight", "Surligneur"], ["recs", "Enregistrements"], ["method", "Méthode"], ["sync", "Sauvegarde"]] };
function go(t, arg) {
  if (window.stopActivity) stopActivity();
  if (t === "today" && window.RUN_ACTIVE && window.blockReturn) { blockReturn(); return; } // inside a block: back to the block screen
  t = { me: "progress", books: "comm", tools: "highlight", review: "uwords" }[t] || t; // older links
  if (SUBS[t]) t = t === "mots" ? "uwords" : (S.ui || {})[t] || SUBS[t][0][0]; // "Mots" always opens the unit's words
  tab = t; curStrand = { learn: "study", vocab: "study", uwords: "study", errs: "study", dico: "study", comm: "output", journal: "output" }[t] || null;
  const top = PARENT[t] || t; if (PARENT[t]) { S.ui = S.ui || {}; S.ui[top] = t; }
  document.querySelectorAll("#nav button").forEach(b => b.classList.toggle("on", b.dataset.tab === top));
  ({ today: () => renderHome(), uwords: () => renderUnitWords(), errs: () => renderErrors(), journal: () => renderJournal(), method: () => renderMethod(), comm: () => renderComm(), dico: q => renderDico(q), recs: () => renderRecs(), learn: renderLearn, vocab: renderVocab, review: renderReviewHome, highlight: renderHighlight, progress: renderProgress, sync: renderSync })[t](arg);
  if (PARENT[t]) view.insertAdjacentHTML("afterbegin", `<div class="row subnav" style="margin-bottom:10px">${SUBS[top].map(([k, l]) => `<button class="b ${k === t ? "" : "s"}" onclick="go('${k}')">${l}</button>`).join("")}</div>`);
  scrollTo(0, 0);
  document.title = (dueIds().length ? `(${dueIds().length}) ` : "") + "Boîte à outils française";
}
$("#nav").onclick = e => { if (e.target.dataset.tab) go(e.target.dataset.tab); };
window.go = go;

// ---------- Today ----------
function planItemHTML(p) {
  const done = S.todo[p.id] && S.todo[p.id].done;
  return `<div class="todo ${done ? "done" : ""}"><input type="checkbox" ${done ? "checked" : ""} onchange="toggleTodo('${p.id}',this.checked)"><div class="t" style="flex:1">${esc(p.title)}</div><button class="b s" onclick="doPlan('${p.id}')">Go</button></div>`;
}
window.toggleTodo = (id, v) => { S.todo[id] = { done: v, at: Date.now() }; track("todo", "Plan", undefined); if (window.schedule) schedule(); if (v && window.onPlanDone) onPlanDone(id); save(); go(tab); };
window.doPlan = id => {
  const p = PLAN.find(x => x.id === id);
  if (p.type === "lesson") { openLesson(p.target); }
  else if (p.type === "bilan") { startReview("bilan:" + p.target); }
  else if (p.type === "vocab") { openUnit(p.target); }
  else if (p.type === "review") { startReview("due"); }
  else if (p.type === "listen") { openListen(p.target, p.id); }
  else if (p.type === "pho") { openPho(p.target, p.id); }
  else if (p.type === "comm") { openComm(p.target, p.id); }
  else if (p.type === "cbilan") { openCommBilan(p.target, p.id); }
  else if (p.type === "tv5") { track("tv5", "TV5MONDE " + p.target); window.open(TV5, "_blank"); }
  else if (p.type === "exam") { openExam(p.target, p.id); }
};
function today() {
  const due = dueIds().length, tough = leeches().length;
  const weeks = [...new Set(PLAN.map(p => p.week))];
  const cur = weeks.find(w => PLAN.some(p => p.week === w && !(S.todo[p.id] && S.todo[p.id].done))) || weeks[weeks.length - 1];
  const doneN = PLAN.filter(p => S.todo[p.id] && S.todo[p.id].done).length;
  // Progress is saved automatically; this only nudges an export once there is something worth backing up
  const hasProgress = Object.keys(S.cards).length >= 20 || Object.values(S.todo).some(t => t.done);
  const ago = S.lastExport ? Math.floor((Date.now() - S.lastExport) / DAY) : null;
  // and every Sunday (the book entries and the recordings are in the export too)
  const backup = hasProgress && (ago === null || ago > 7 || (new Date().getDay() === 0 && ago > 0)) ? `<div class="card">💾 Votre progression est enregistrée automatiquement dans ce navigateur.
    Dernière sauvegarde exportée : <b>${ago === null ? "jamais" : "il y a " + ago + " jours"}</b>. Exportez-en une pour ne rien perdre si les données du navigateur sont effacées ou si vous changez d'appareil.
    <button class="b s" onclick="go('sync')">Exporter une sauvegarde</button></div>` : "";
  view.innerHTML = `${backup}
  ${progressOverview(due, tough, doneN)}
  ${dailySession()}
  ${weeklyGoals()}
  <div class="card"><h2>Plan — semaine ${cur}</h2>${PLAN.filter(p => p.week === cur).map(planItemHTML).join("")}</div>
  <div class="card"><h3>Toutes les semaines</h3>${weeks.map(w => {
    const items = PLAN.filter(p => p.week === w), d = items.filter(p => S.todo[p.id] && S.todo[p.id].done).length;
    return `<details ${w === cur ? "" : ""}><summary>Semaine ${w} <span class="mut">(${d}/${items.length})</span></summary>${items.map(planItemHTML).join("")}</details>`;
  }).join("")}</div>`;
}
// Total active learning time (counted only while the page is visible and in use)
function timeStats() {
  const days = Object.entries(S.daily).filter(([, v]) => (v.secs || 0) > 0);
  const total = days.reduce((a, [, v]) => a + v.secs, 0), ws = new Date(); ws.setHours(0, 0, 0, 0); ws.setDate(ws.getDate() - ((ws.getDay() + 6) % 7));
  const week = days.filter(([d]) => new Date(d + "T12:00") >= ws).reduce((a, [, v]) => a + v.secs, 0);
  const active = days.filter(([, v]) => v.secs > 60).length;
  return { total, week, today: (S.daily[dstr()] || {}).secs || 0, active, avg: active ? total / active : 0 };
}
const fmtDur = s => { const m = Math.round(s / 60); return m < 60 ? m + " min" : Math.floor(m / 60) + " h " + String(m % 60).padStart(2, "0"); };
// Progress at a glance on the first page; full details stay in the Progrès tab
function progressOverview(due, tough, doneN) {
  const seen = ALL.filter(id => card(id)).length, mat = ALL.filter(isMature).length, known = ALL.filter(id => card(id) && card(id).interval >= 7).length;
  const gram = LESSONS.filter(l => PLAN.some(p => p.type === "lesson" && p.target === l.id && S.todo[p.id] && S.todo[p.id].done)).length;
  const voc = [0, ...VP_UNITS.map(u => u.n)].filter(n => PLAN.some(p => p.type === "vocab" && p.target === n && S.todo[p.id] && S.todo[p.id].done)).length;
  const mins = Math.round(((S.daily[dstr()] || {}).secs || 0) / 60), cw = currentWeek(), W = new Set(PLAN.map(p => p.week)).size;
  const bar = (v, t) => `<div class="bar"><i style="width:${t ? Math.min(100, v / t * 100) : 0}%"></i></div>`;
  return `<div class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">Ma progression vers le A1</h2><a href="#" onclick="go('progress');return false">Détails →</a></div>
   <div class="stats" style="margin:10px 0">
    <div class="stat"><b>${streak()}</b>jours d'affilée</div>
    <div class="stat"><b>${fmtDur(timeStats().total)}</b>temps total · ${mins} min aujourd'hui</div>
    <div class="stat"><b>${due}</b>cartes à réviser</div>
    <div class="stat"><b class="${tough ? "badc" : ""}">${tough}</b>cartes difficiles${tough ? ` · <a href="#" onclick="startReview('mistakes');return false">revoir</a>` : ""}</div></div>
   <p style="margin:6px 0">Semaine <b>${cw}</b> · ${doneN}/${PLAN.length} étapes du plan${bar(doneN, PLAN.length)}</p>
   <p style="margin:6px 0">Grammaire : <b>${gram}</b> / 60 unités${bar(gram, 60)}</p>
   <p style="margin:6px 0">Vocabulaire : <b>${voc}</b> / 29 unités${bar(voc, 29)}</p>
   <p style="margin:6px 0">Communication : <b>${COMM.filter(c => S.todo["comm:" + c.n] && S.todo["comm:" + c.n].done).length}</b> / 40 unités${bar(COMM.filter(c => S.todo["comm:" + c.n] && S.todo["comm:" + c.n].done).length, 40)}</p>
   <p style="margin:6px 0">Mémoire : <b>${seen}</b> cartes vues · <b>${known}</b> retenues (≥ 1 semaine) · <b>${mat}</b> acquises (≥ 3 semaines) / ${ALL.length}${bar(mat, ALL.length)}</p></div>`;
}
function newQuota() { const d = S.daily[dstr()] || {}, q = S.settings.newOverride || (window.phase ? phase().newCards : S.settings.newPerDay); return Math.max(0, q - (d.newSeen || 0)); }
function streak() {
  let n = 0, t = Date.now();
  const active = d => (S.dayDone || {})[d] || S.sessions.some(s => dstr(s.start) === d && s.total > 0) || (S.daily[d] && S.daily[d].secs > 60);
  if (!active(dstr(t))) t -= DAY;
  while (active(dstr(t))) { n++; t -= DAY; }
  return n;
}

// ---------- Learn ----------
function renderLearn() {
  view.innerHTML = `${bookCard("gram")}<div class="card"><h2>Grammaire — 60 unités + 8 bilans</h2><p class="mut">Ordre des unités de la Grammaire progressive du français (débutant). <span class="tag">A2</span> = point qui relève déjà du niveau A2.</p>` +
    BILANS.map((b, bi) => LESSONS.filter(l => l.n >= b[0] && l.n <= b[1]).map(l => {
      const ids = l.ex.map((_, i) => `g:${l.id}:${i}`), m = ids.filter(isMature).length, seen = ids.filter(id => card(id)).length;
      return `<div class="todo"><div style="flex:1"><b>${l.n}.</b> <a href="#" onclick="openLesson('${l.id}');return false">${esc(l.title)}</a> ${l.level === "A2" ? '<span class="tag">A2</span>' : ""}${aSaisir("gram", l.n)} <span class="mut">p. ${l.page}${l.entered ? ` · ${seen}/${ids.length} vus · ${m} acquis` : ""}</span></div></div>`;
    }).join("") + `<div class="todo"><div style="flex:1">📝 <a href="#" onclick="startReview('bilan:${bi}');return false"><b>Bilan n° ${bi + 1}</b></a> <span class="mut">unités ${b[0]}–${b[1]} · p. ${b[2]}</span></div></div>`).join("") + `</div>`;
}
window.openListen = (i, planId) => {
  if (window.stopActivity) stopActivity(); curStrand = "input";
  const x = FI_LISTEN[i]; track("listen", "Écoute FI ch." + x.ch);
  view.innerHTML = `<div class="card"><span class="tag">Français interactif ch. ${String(x.ch).padStart(2, "0")}</span><h2>${esc(x.t)}</h2>
   <audio controls preload="none" src="${x.u}" style="width:100%"></audio>
   <p class="mut">Enregistrement original de Français interactif (UT Austin, CC BY 3.0). Les questions de l'exercice sont sur la page de l'écoute :
   <a target="_blank" rel="noopener" href="https://www.laits.utexas.edu/fi/listening/${String(x.ch).padStart(2, "0")}/">ouvrir l'exercice</a>.</p>
   <p><b>Pour finir :</b> racontez en une ou deux phrases ce que vous avez entendu. ${recWidget("lrec")}</p>
   <p class="row">${planId ? `<button class="b" onclick="toggleTodo('${planId}',true);go('today')">✓ Terminé</button>` : ""}<button class="b s" onclick="go('today')">Retour</button></p></div>`;
  if (typeof REC_CTX !== "undefined") REC_CTX = { kind: "resume", unit: "FI " + x.ch };
  scrollTo(0, 0);
};
window.openLesson = id => {
  const l = LESSONS.find(x => x.id === id); if (window.stopActivity) stopActivity(); tab = "learn"; curStrand = "study";
  document.querySelectorAll("#nav button").forEach(b => b.classList.toggle("on", b.dataset.tab === "learn"));
  track("lesson", "Leçon: " + l.title);
  const head = `<p class="backlink"><a href="#" onclick="go('learn');return false">← Grammaire</a></p>`;
  if (!l.entered) { view.innerHTML = head + notEntered("gram", l.n); scrollTo(0, 0); return; }
  view.innerHTML = head + `<div class="card"><span class="tag">Chapitre ${l.n}</span><span class="tag">${l.level}</span><span class="tag">Livre p. ${esc(l.bookPage || l.page)}</span><h2>${esc(l.title)}</h2>
   <p class="mut" style="margin-top:0">${l.subs.map(esc).join(" · ")}</p>
   <ul>${l.rules.map(r => `<li>${hl(r)}</li>`).join("")}</ul></div>
  ${l.examples.length ? `<div class="card"><h3>Exemples</h3>${l.examples.map(e => `<p>${spk(plain(e[0]))} ${hl(e[0])}${e[1] ? `<br><span class="mut">${esc(e[1])}</span>` : ""}</p>`).join("")}</div>` : ""}
  <div class="card"><p>Faites les exercices <b>à voix haute</b> avant de taper la réponse. Puis écoutez le petit dialogue de Tex sur le même point :
   <a target="_blank" rel="noopener" href="${TEX}?s=${encodeURIComponent(l.subs[0].replace(/[«»]/g, "").split(/[;:(]/)[0].trim())}">Tex's French Grammar · ${esc(l.subs[0])}</a> · ${fiLink(l.fi)}</p></div>
  <p class="row">${l.ex.length ? `<button class="b" onclick="startReview('lesson:${l.id}')">Pratiquer (${l.ex.length} exercices)</button>` : ""}
  <button class="b s" onclick="markLesson('${l.id}')">Marquer la séance comme terminée</button>${saisieBtn("gram", l.n)}</p>`;
  scrollTo(0, 0);
};
window.markLesson = id => { PLAN.filter(p => p.type === "lesson" && p.target === id).forEach(p => S.todo[p.id] = { done: true, at: Date.now() }); save(); go("today"); };
window.markUnit = n => { PLAN.filter(p => p.type === "vocab" && p.target === n).forEach(p => S.todo[p.id] = { done: true, at: Date.now() }); save(); go("today"); };

// ---------- Vocab ----------
const wordState2 = v => { const c = card("v:" + v.id); return !c ? "nouveau" : c.interval >= 21 ? "✅ acquis" : c.lapses > 1 ? "⚠️ difficile" : "en cours"; };
const frHTML = fr => { const g = window.genderOf ? genderOf(fr) : ""; return g ? `<span class="g-${g}">${esc(fr)}</span>` : esc(fr); };
const wordRow = v => `<tr><td>${spk(v.fr)}</td><td><b>${frHTML(v.fr)}</b></td><td>${esc(v.en)}</td><td class="mut">${wordState2(v)}</td></tr>`;
function renderVocab() {
  view.innerHTML = bookCard("vocab") + `<div class="card"><h2>Vocabulaire — kit de survie + 28 unités</h2>
   <p><a href="#" onclick="openSurvival();return false"><b>0. Kit de survie</b></a> <span class="mut">${SURVIVAL.length} phrases essentielles — à apprendre en premier</span></p>
   <p class="mut">Unités du Vocabulaire progressif du français (débutant) : d'abord les mots du livre que vous avez saisis, puis les mots complémentaires de Français interactif (UT Austin, CC BY 3.0) avec leurs enregistrements.</p>
   <input type="text" id="vq" placeholder="Rechercher un mot (français ou anglais)…"></div>
   <div id="vres"></div>`;
  const list = () => VP_UNITS.map(u => {
    const ws = VOCAB.filter(v => v.unit === u.n), m = ws.filter(v => isMature("v:" + v.id)).length;
    return `<div class="todo"><div style="flex:1"><b>${u.n}.</b> <a href="#" onclick="openUnit(${u.n});return false">${esc(u.title)}</a> ${aSaisir("vocab", u.n)} <span class="mut">p. ${u.page} · ${ws.length} mots · ${m} acquis</span></div></div>`;
  }).join("");
  const draw = () => {
    const q = $("#vq").value.trim().toLowerCase();
    if (!q) { $("#vres").innerHTML = `<div class="card">${list()}</div>`; return; }
    const hits = VOCAB.filter(v => (v.fr + " " + v.en).toLowerCase().includes(q)).slice(0, 80);
    $("#vres").innerHTML = `<div class="card" style="overflow-x:auto"><table>${hits.map(wordRow).join("") || "<tr><td>Aucun résultat</td></tr>"}</table></div>`;
  };
  $("#vq").oninput = draw; draw();
}
window.openUnit = n => {
  if (n === 0) return openSurvival();
  const u = VP_UNITS[n - 1], ws = VOCAB.filter(v => v.unit === n);
  if (window.stopActivity) stopActivity(); tab = "vocab"; curStrand = "input"; // reading while listening document.querySelectorAll("#nav button").forEach(b => b.classList.toggle("on", b.dataset.tab === "vocab"));
  track("vocab", "Vocabulaire " + n);
  view.innerHTML = `<p><a href="#" onclick="go('vocab');return false">← Vocabulaire</a></p>
  <div class="card"><span class="tag">Unité ${n}</span><h2>${esc(u.title)}</h2>
   <p class="mut" style="margin-top:0">Livre p. ${esc(u.bookPage || u.page)}</p>
   <p class="row"><button class="b" onclick="startReview('unit:${n}')">Étudier (${ws.length} mots)</button><button class="b s" onclick="markUnit(${n})">Marquer la séance comme terminée</button>${saisieBtn("vocab", n)}</p>
   <p class="mut">🎧 = enregistrement original de Français interactif (toute la liste lue par un locuteur natif). 🔊 = un seul mot, voix française de votre appareil.</p></div>
  <div class="card"><h3>Vocabulaire progressif — les mots du livre</h3>${u.book.length ? `<div style="overflow-x:auto"><table>${u.book.map(wordRow).join("")}</table></div><p class="mut">🎧 sur la carte = le même mot dans Français interactif.</p>` : `<p>Pas encore saisis.</p>`}</div>
  <h2 style="margin:20px 0 8px">Français interactif — mots complémentaires</h2>` +
    u.secs.filter(si => VOCAB.some(v => v.sec === si)).map(si => { const s = FI_VOC[si]; return `<div class="card"><h3>${esc(s.title)} <span class="mut">· FI ch. ${String(s.ch).padStart(2, "0")}</span></h3>
     ${s.audio ? `<audio controls preload="none" src="${s.audio}" style="width:100%"></audio>` : ""}
     <div style="overflow-x:auto"><table>${VOCAB.filter(v => v.sec === si).map(wordRow).join("")}</table></div></div>`; }).join("");
  scrollTo(0, 0);
};

window.openSurvival = () => {
  if (window.stopActivity) stopActivity(); tab = "vocab"; curStrand = "study";
  document.querySelectorAll("#nav button").forEach(b => b.classList.toggle("on", b.dataset.tab === "vocab"));
  const cats = [...new Set(SURVIVAL.map(s => s.cat))];
  view.innerHTML = `<p><a href="#" onclick="go('vocab');return false">← Vocabulaire</a></p>
  <div class="card"><span class="tag">Unité 0</span><h2>Kit de survie</h2>
   <p>Environ ${SURVIVAL.length} phrases qui couvrent les besoins de base (saluer, demander de répéter, acheter, commander, s'orienter, se loger, urgences). À apprendre <b>en premier</b>, comme des blocs entiers, et à dire à voix haute.</p>
   <p class="row"><button class="b" onclick="startReview('unit:0')">Étudier le kit</button><button class="b s" onclick="markUnit(0)">Marquer la séance comme terminée</button></p></div>` +
   cats.map(c => `<div class="card"><h3>${esc(c)}</h3><table>${SURVIVAL.filter(s => s.cat === c).map(wordRow).join("")}</table></div>`).join("");
  scrollTo(0, 0);
};

// ---------- Review ----------
function renderReviewHome() {
  const due = dueIds().length;
  view.innerHTML = `<div class="card"><h2>Réviser</h2>
  <p>${due} cartes à réviser · ${newQuota()} nouvelles cartes disponibles aujourd'hui</p>
  <p class="row"><button class="b" onclick="startReview('due')">▶ Session du jour</button><button class="b s" onclick="startReview('mistakes')">Mes erreurs</button></p>
  <h3>Vocabulaire (unités)</h3><p class="row">${VP_UNITS.map(u => `<button class="b s" onclick="startReview('unit:${u.n}')">${u.n}. ${esc(u.title.split(" – ")[0])}</button>`).join("")}</p>
  <h3>Grammaire — bilans</h3><p class="row">${BILANS.map((b, i) => `<button class="b s" onclick="startReview('bilan:${i}')">Bilan ${i + 1} (${b[0]}–${b[1]})</button>`).join("")}</p></div>`;
}
function currentWeek() { return weekOf(dstr()); }
// New cards are introduced in book order, only from units reached in the plan so far
// and interleaved across lists, max 3 new per list per day, so related words (days, colours…) don't interfere
const groupOf = id => ITEMS[id].kind === "g" ? "g" + ITEMS[id].l.id : "v" + ITEMS[id].v.sec;
// new cards: the book's words before the Français interactif complements, each by frequency
const rankOf = id => { const it = ITEMS[id]; if (it.kind !== "v") return 0; const r = (window.FREQ || {})[it.v.fr], f = r === undefined ? 5000 : r; return it.v.src === "livre" ? f - 1e5 : f; };
const isPhrase = id => ITEMS[id].kind === "v" && /^(sv|cm|d_)/.test(ITEMS[id].v.id) && /\s/.test(ITEMS[id].v.fr);
function newInPlanOrder() {
  const groups = new Map(), t0 = new Date().setHours(0, 0, 0, 0), today = {}, T = dstr();
  Object.entries(S.cards).forEach(([id, c]) => { if (c.first >= t0 && ITEMS[id]) today[groupOf(id)] = (today[groupOf(id)] || 0) + 1; });
  const idsOf = p => p.type === "lesson" ? ALL.filter(id => id.startsWith("g:" + p.target + ":")) : p.type === "vocab" ? ALL.filter(id => ITEMS[id].unit === p.target) : p.type === "comm" ? ALL.filter(id => ITEMS[id].unit === "c" + p.target) : [];
  const todays = PLAN.filter(p => (window.todayIds ? todayIds() : []).includes(p.id));
  // 1) today's dialogue (whole sentences, no per-list cap) and today's grammar exercises
  const first = todays.filter(p => p.type === "comm" || p.type === "lesson").flatMap(idsOf).filter(id => !card(id));
  // 2) everything reached so far, max 3 new per list per day (related words interfere), by frequency
  PLAN.filter(p => (window.isReached ? isReached(p.id) : true) && ["vocab", "comm", "lesson"].includes(p.type)).forEach(p => idsOf(p).filter(id => !card(id) && !first.includes(id)).forEach(id => { const g = groupOf(id); if (!groups.has(g)) groups.set(g, { today: todays.includes(p), ids: [] }); groups.get(g).ids.push(id); }));
  const lists = [...groups.values()].map(g => ({ today: g.today, ids: g.ids.sort((a, b) => rankOf(a) - rankOf(b)), left: Math.max(0, 3 - (today[groupOf(g.ids[0])] || 0)) }));
  lists.sort((a, b) => (b.today - a.today) || (rankOf(a.ids[0]) - rankOf(b.ids[0])));
  const out = first.slice();
  for (let round = 0; round < 3; round++) lists.forEach(l => { if (l.left > 0 && l.ids.length) { out.push(l.ids.shift()); l.left--; } });
  return out;
}
function buildQueue(mode) {
  if (mode === "block" || mode === "blockmin") { // a card block: due cards + at most 20 new; no new cards when the backlog is large
    const due = dueIds().sort((a, b) => card(a).due - card(b).due);
    const nn = due.length > 150 ? 0 : Math.min(mode === "blockmin" ? 10 : 20, newQuota());
    return due.slice(0, mode === "blockmin" ? 40 : 200).concat(parcoursNew().slice(0, nn));
  }
  if (mode === "due") {
    const due = dueIds().sort((a, b) => card(a).due - card(b).due);
    return due.concat(parcoursNew().slice(0, newQuota()));
  }
  if (mode.startsWith("pu:")) { // one unit of the parcours: its due cards, then ≤ 20 new ones (book words first, by frequency)
    const ids = unitWordIds(+mode.slice(3));
    return ids.filter(isDue).concat(ids.filter(id => !card(id)).sort(wordOrder).slice(0, 20));
  }
  if (mode === "carnet") return carnetIds().slice(0, 25);
  if (mode === "mistakes") return leeches().concat(ALL.filter(id => card(id) && card(id).lapses > 0 && !leeches().includes(id))).slice(0, 25);
  if (mode.startsWith("unit:")) {
    const n = mode.slice(5), ids = ALL.filter(id => String(ITEMS[id].unit) === n);
    return ids.filter(isDue).concat(shuffle(ids.filter(id => !card(id)))).concat(shuffle(ids.filter(id => card(id) && !isDue(id) && !isMature(id)))).slice(0, 25);
  }
  if (mode.startsWith("bilan:")) { const b = BILANS[+mode.slice(6)]; return shuffle(ALL.filter(id => ITEMS[id].kind === "g" && ITEMS[id].l.n >= b[0] && ITEMS[id].l.n <= b[1])).slice(0, 20); }
  if (mode.startsWith("lesson:")) return ALL.filter(id => id.startsWith("g:" + mode.slice(7) + ":"));
  if (mode.startsWith("ids:")) return mode.slice(4).split(",");
  return [];
}
let Q = [], QN = 0, QOK = 0, QSTART = 0;
window.startReview = mode => {
  Q = buildQueue(mode); QN = Q.length; QOK = 0; QSTART = Date.now();
  if (window.stopActivity) stopActivity(); curStrand = "study";
  tab = "review"; document.querySelectorAll("#nav button").forEach(b => b.classList.toggle("on", b.dataset.tab === "review"));
  if (!Q.length) { view.innerHTML = `<div class="card"><h2>Rien à faire 🎉</h2><p>Aucune carte pour ce mode. Revenez plus tard !</p><button class="b" onclick="go('today')">Retour</button></div>`; return; }
  nextCard();
};
function progressBar() { return `<div class="bar"><i style="width:${Math.round((QN - Q.length) / QN * 100)}%"></i></div><p class="mut">${Q.length} restantes</p>`; }
function nextCard() {
  if (!Q.length) {
    if (window.onQueueDone) onQueueDone(QN, QOK);
    view.innerHTML = `<div class="card"><h2>Session terminée ✅</h2><p>${QOK} bonnes réponses du premier coup sur ${QN} · ${Math.round((Date.now() - QSTART) / 6e4)} min</p><p class="mut">Les erreurs reviendront bientôt, puis à intervalles de plus en plus longs.</p><p class="row"><button class="b" onclick="go('today')">Retour</button><button class="b s" onclick="startReview('due')">Continuer</button></p></div>`;
    return;
  }
  const id = Q[0], it = ITEMS[id];
  if (it.kind === "v") {
    const c0 = card(id), canProduce = c0 && c0.interval >= 3 && (isPhrase(id) || rankOf(id) <= 2000);
    const rev = canProduce && Math.random() < 0.5, v = it.v;
    view.innerHTML = progressBar() + `<div class="card"><span class="tag">${esc(v.theme)}</span><span class="tag">${v.level}</span>
     <div class="big">${rev ? esc(v.en) : frHTML(v.fr)}</div>
     <p class="mut" style="text-align:center">${rev ? "Dites le mot français à voix haute (avec le / la), puis retournez." : "Dites le sens à voix haute, puis retournez."}</p>
     ${(S.notes || {})[id] ? `<p style="text-align:center"><a href="#" onclick="this.outerHTML='💡 '+${JSON.stringify(esc(S.notes[id])).replace(/"/g, "&quot;")};return false">💡 Indice</a></p>` : ""}
     <p style="text-align:center"><button class="b" id="flip">Voir la réponse</button></p><div id="ans"></div></div>`;
    if (!rev && S.settings.speak) speak(v.fr);
    $("#flip").onclick = () => {
      $("#flip").remove();
      const c0 = card(id), needNote = c0 && c0.lapses >= 1;
      $("#ans").innerHTML = `<div class="big">${rev ? frHTML(v.fr) : esc(v.en)} ${spk(v.fr)}</div>
       ${needNote || (S.notes || {})[id] ? `<p><input type="text" id="note" placeholder="💡 Astuce mémoire : mot-clé + image (ex. « bureau » ≈ 布楼 → un bureau dans un immeuble)" value="${esc((S.notes || {})[id] || "")}"></p>` : ""}
       ${v.audio ? `<p style="text-align:center"><button class="b s" onclick="playRec('${v.audio}')">🎧 Enregistrement FI de la liste</button> <button class="b s" onclick="player.pause()">⏸</button></p>` : ""}
       <p class="row" style="justify-content:center"><button class="b bad" data-g="0">Encore</button><button class="b s" data-g="1">Difficile</button><button class="b ok" data-g="2">Bien</button><button class="b s" data-g="3">Facile</button></p>`;
      if (rev && S.settings.speak) speak(v.fr);
      $("#ans").onclick = e => { if (e.target.dataset.g === undefined) return; const nt = $("#note"); if (nt && nt.value.trim()) { (S.notes = S.notes || {})[id] = nt.value.trim(); } answer(id, +e.target.dataset.g); };
    };
  } else {
    view.innerHTML = progressBar() + `<div class="card"><span class="tag">${it.l.level}</span><span class="tag">${esc(it.l.title)}</span>
     ${it.inst ? `<p class="mut" style="margin:8px 0 0">${esc(it.inst)}</p>` : ""}<div class="big" style="font-size:22px">${esc(it.q)}</div>
     <p><input type="text" id="inp" autocomplete="off" autocapitalize="off" placeholder="Votre réponse"></p>
     <p class="row"><button class="b" id="chk">Vérifier</button></p><div id="ans"></div></div>`;
    const inp = $("#inp"); inp.focus();
    const check = () => {
      if (!it.a) { // no answer entered: compare with the corrigé yourself
        if (!inp.value.trim()) return; inp.disabled = true; $("#chk").remove();
        $("#ans").innerHTML = `<p class="mut">Comparez avec le corrigé de votre livre.</p><p class="row"><button class="b bad" data-g="0">Faux</button><button class="b ok" data-g="2">Juste</button></p>`;
        $("#ans").onclick = e => { if (e.target.dataset.g !== undefined) answer(id, +e.target.dataset.g); };
        return;
      }
      const u = normAns(inp.value), a = normAns(it.a);
      let g = u === a ? 2 : (stripAcc(u) === stripAcc(a) && u ? 1 : 0);
      if (!u) return;
      inp.disabled = true; $("#chk").remove();
      if (g === 0) S.mistakes.push({ id, t: Date.now(), ans: inp.value });
      $("#ans").innerHTML = `<p class="${g ? "good" : "badc"}"><b>${g === 2 ? "✓ Correct !" : g === 1 ? "≈ Presque — attention aux accents" : "✗ Réponse : " + esc(it.a)}</b></p>
       <p>${it.l.rules.slice(0, 2).map(r => `<span class="mut">${hl(r)}</span>`).join("<br>")}</p>
       <p><button class="b" id="nx" autofocus>Suivant ↵</button> <a href="#" onclick="openLesson('${it.l.id}');return false">Revoir la leçon</a></p>`;
      $("#nx").focus(); $("#nx").onclick = () => answer(id, g);
    };
    $("#chk").onclick = check; inp.onkeydown = e => { if (e.key === "Enter") check(); };
  }
}
function answer(id, g) {
  const first = !Q.firstTried || !Q.firstTried[id];
  grade(id, g);
  Q.shift();
  if (g === 0) { Q.splice(Math.min(3, Q.length), 0, id); } // re-ask soon in-session
  if (g > 0 && first && !(Q.wrongSeen && Q.wrongSeen[id])) QOK++;
  Q.wrongSeen = Q.wrongSeen || {}; if (g === 0) Q.wrongSeen[id] = 1;
  Q.firstTried = Q.firstTried || {}; Q.firstTried[id] = 1;
  nextCard();
}

// ---------- Highlighter ----------
const GR = [
  ["g-neg", "Négation (ne … pas/jamais/rien/plus)", /(?<!\p{L})(?:ne|n['’])\s*(?:[\p{L}'’]+\s+){0,2}?(?:pas|jamais|rien|plus|personne)(?!\p{L})/giu, "g05"],
  ["g-pc", "Passé composé (avoir/être + participe)", /(?<!\p{L})(?:ai|as|a|avons|avez|ont|suis|es|est|sommes|êtes|sont|me suis|t'es|s'est|nous sommes|vous êtes|se sont)\s+(?:pas\s+)?\p{L}*(?:é|ée|és|ées|is|it|ert|fait|dit|pris|mis|vu|bu|lu|eu|été|écrit|su|pu|dû|voulu|venu|venue|venus|parti|partie|partis|parties|allé|allée|allés|allées|fini|finie|dormi|reçu|connu|vécu|appris|compris|ouvert|offert|[a-zé]*(?:i|u))(?!\p{L})/giu, "g44"],
  ["g-fut", "Futur proche (aller + infinitif)", /(?<!\p{L})(?:vais|vas|va|allons|allez|vont)\s+(?:ne pas\s+|pas\s+)?\p{L}+(?:er|ir|re|oir)(?!\p{L})/giu, "g43"],
  ["g-fut", "Futur simple", /(?<!\p{L})(?!(?:autre|notre|votre|entre|titre|livre|jamais)(?!\p{L}))\p{L}{3,}r(?:ai|as|a|ons|ez|ont)(?!\p{L})/giu, "g48"],
  ["g-fut", "Imparfait", /(?<!\p{L})(?!(?:mais|jamais|français|anglais|japonais|chinois|fait|parfait|lait|trait|portrait|souhait)(?!\p{L}))\p{L}{2,}(?:ais|ait|ions|iez|aient)(?!\p{L})/giu, "g47"],
  ["g-poss", "Adjectif possessif", /(?<!\p{L})(?:mon|ma|mes|ton|ta|tes|son|sa|ses|notre|nos|votre|vos|leurs?)(?!\p{L})/giu, "g14"],
  ["g-art", "Article / contraction", /(?<!\p{L})(?:le|la|les|l['’]|un|une|des|du|au|aux)(?!\p{L})/giu, "g12"],
  ["g-pro", "Pronom (y, en, me, te, se, lui)", /(?<!\p{L})(?:y|en|lui|me|te|se|m['’]|t['’]|s['’])(?!\p{L})/giu, "g55"]
];
const WORDSET = (() => {
  const m = new Map();
  VOCAB.forEach(v => stripAcc(v.fr.toLowerCase().replace(/\(.*?\)/g, "")).split(/[^a-z]+/).filter(w => w.length > 1).forEach(w => { if (!m.has(w)) m.set(w, "v:" + v.id); }));
  return m;
})();
function wordState(w) {
  const k = stripAcc(w.toLowerCase());
  const id = WORDSET.get(k) || WORDSET.get(k.replace(/(s|x|e|es)$/, ""));
  if (!id) return "w-new";
  return isMature(id) ? "w-known" : "w-learn";
}
function highlightText(text) {
  const claims = [];
  GR.forEach(([cls, label, re, lesson]) => {
    for (const m of text.matchAll(re)) {
      const s = m.index, e = s + m[0].length;
      if (!claims.some(c => s < c.e && e > c.s)) claims.push({ s, e, cls, label, lesson });
    }
  });
  claims.sort((a, b) => a.s - b.s);
  let out = "", i = 0;
  const words = (str, off) => esc(str).replace(/\p{L}[\p{L}'’-]*/gu, w => `<span class="${wordState(w)}">${w}</span>`);
  for (const c of claims) {
    out += words(text.slice(i, c.s));
    out += `<span class="${c.cls}" title="${esc(c.label)}" style="cursor:pointer" onclick="hlClick(event,'${c.lesson}')">${words(text.slice(c.s, c.e))}</span>`;
    i = c.e;
  }
  return out + words(text.slice(i));
}
function renderHighlight() {
  const sample = "Hier, nous sommes allés au marché. Je n'ai pas acheté de fromage, mais ma sœur a pris des pommes. Demain, je vais préparer le dîner et nous mangerons ensemble. Quand j'étais petit, mon père faisait du pain.";
  view.innerHTML = `<div class="card"><h2>Surligneur de grammaire</h2>
  <p class="mut">Collez un texte français (par exemple une phrase de TV5MONDE ou d'un chapitre de Français interactif). La grammaire A1/A2 est surlignée ; les mots sont colorés selon votre niveau. Détection heuristique — cliquez sur une zone pour ouvrir la leçon, double-cliquez sur un mot pour le dictionnaire.</p>
  <textarea id="ht">${esc(localStorage.getItem("fr-ht") || sample)}</textarea>
  <p class="row"><button class="b" id="hgo">Surligner</button><button class="b s" id="hadd">Ajouter les mots inconnus… (bientôt)</button></p>
  <p class="mut"><span class="g-neg">négation</span> <span class="g-pc">passé composé</span> <span class="g-fut">futur / imparfait</span> <span class="g-poss">possessifs</span> <span class="g-art">articles</span> <span class="g-pro">pronoms</span> · mots : <span class="w-new">inconnu du kit</span> <span class="w-learn">en cours</span> <span class="w-known">acquis</span></p></div>
  <div class="card" id="hout" style="font-size:19px;line-height:2"></div><div class="card" id="hdiff"></div>`;
  $("#hadd").remove();
  const run = () => {
    const t = $("#ht").value; try { localStorage.setItem("fr-ht", t); } catch (e) { }
    $("#hout").innerHTML = highlightText(t).replace(/\n/g, "<br>"); track("highlight", "Surligneur");
    const ws = t.match(/\p{L}[\p{L}'’-]*/gu) || [], known = w => { const k = stripAcc(w.toLowerCase()), id = WORDSET.get(k) || WORDSET.get(k.replace(/(s|x|e|es)$/, "")); return id && card(id) && card(id).reps >= 1; };
    const unk = [...new Set(ws.filter(w => !known(w)).map(w => w.toLowerCase()))], pct = ws.length ? Math.round(ws.filter(known).length / ws.length * 100) : 0;
    $("#hdiff").innerHTML = ws.length ? `<p><b>Mots connus : ${pct} %</b> — ${pct >= 98 ? "✅ texte adapté à la lecture extensive (≤ 2 mots inconnus sur 100)" : "📖 à lire en lecture intensive (trop de mots nouveaux pour une lecture facile)"}</p>
      <p class="mut">Mots inconnus (${unk.length}) : ${unk.slice(0, 40).map(w => `<a href="#" onclick="addUnknown(this, ${JSON.stringify(w).replace(/"/g, "&quot;")});return false">${esc(w)} ➕</a>`).join(" · ")}</p>` : "";
  };
  $("#hgo").onclick = run; run();
}

// ---------- Progress ----------
function renderProgress() {
  const seen = ALL.filter(id => card(id)).length, mat = ALL.filter(isMature).length;
  const wk = S.sessions.filter(s => s.start > Date.now() - 7 * DAY && s.total), tot = wk.reduce((a, s) => a + s.total, 0), ok = wk.reduce((a, s) => a + s.correct, 0);
  const secsToday = (S.daily[dstr()] || {}).secs || 0;
  let heat = "";
  for (let i = 89; i >= 0; i--) {
    const d = dstr(Date.now() - i * DAY), m = ((S.daily[d] || {}).secs || 0) / 60, n = S.sessions.filter(s => dstr(s.start) === d).reduce((a, s) => a + s.total, 0);
    const lv = n + m < 1 ? "" : n + m < 10 ? "l1" : n + m < 25 ? "l2" : "l3";
    heat += `<span class="${lv}" title="${d}: ${n} cartes, ${Math.round(m)} min"></span>`;
  }
  const lv = l => { const ids = ALL.filter(id => ITEMS[id].level === l), m = ids.filter(isMature).length; return `<p>${l}: ${m}/${ids.length} acquis<div class="bar"><i style="width:${m / ids.length * 100}%"></i></div></p>`; };
  const bad = ALL.filter(id => card(id) && card(id).lapses).sort((a, b) => card(b).lapses - card(a).lapses).slice(0, 15);
  const nextDays = studyDays(dstr(), dAdd(dstr(), 9)).slice(0, 7), ex = S.exams || {};
  const w10s = (S.writing || []).filter(x => x.mode === "fluency").slice(-12), wmax = Math.max(50, ...w10s.map(x => x.words));
  view.innerHTML = progressOverview(dueIds().length, leeches().length, PLAN.filter(p => isDone(p.id)).length) + weeklyGoals() +
  `<div class="card"><h3>Mon plan (7 prochains jours d'étude)</h3><p class="mut">Calculé à partir des dates de fin (A1 : ${fmtDate(cal().a1End)}, A2 : ${fmtDate(cal().a2End)}) et recalculé chaque jour.</p>
   ${nextDays.map(d => { const items = PLAN.filter(p => p.date === d); return items.length ? `<details ${d === dstr() ? "open" : ""}><summary><b>${esc(fmtDate(d))}</b> <span class="mut">· ${items.length}</span></summary>${items.map(planItemHTML).join("")}</details>` : ""; }).join("")}
   <p class="mut">${Object.keys(ex).length ? "Validation : " + Object.entries(ex).map(([l, e]) => `DELF ${l} — oral ${e.listen}/25 · écrits ${e.read}/25`).join(" · ") : ""}</p>
   ${w10s.length > 1 ? `<p>Écriture rapide (mots en 10 min) :</p><svg width="260" height="70" style="background:var(--bg);border-radius:6px"><polyline fill="none" stroke="#8e44ad" stroke-width="2" points="${w10s.map((x, i) => `${10 + i * 22},${62 - x.words / wmax * 54}`).join(" ")}"/></svg>` : ""}</div>` +
  `<div class="card"><h2>Progrès</h2><div class="stats">
   <div class="stat"><b>${streak()}</b>jours d'affilée</div><div class="stat"><b>${seen}/${ALL.length}</b>cartes vues</div>
   <div class="stat"><b>${mat}</b>cartes acquises</div><div class="stat"><b>${tot ? Math.round(ok / tot * 100) + "%" : "—"}</b>exactitude 7 j</div>
   <div class="stat"><b>${Math.round(secsToday / 60)}</b>min actives aujourd'hui</div></div>
   ${(t => `<div class="stats" style="margin-top:10px">
    <div class="stat"><b>${fmtDur(t.total)}</b>temps d'apprentissage total</div>
    <div class="stat"><b>${fmtDur(t.week)}</b>cette semaine</div>
    <div class="stat"><b>${t.active}</b>jours actifs</div>
    <div class="stat"><b>${fmtDur(t.avg)}</b>en moyenne par jour actif</div></div>
   <p class="mut">Temps actif uniquement (page ouverte et utilisée dans la dernière minute) + le temps ajouté à la main (TV5MONDE). Objectif A1 : environ ${Math.round(minutesPerDay() * 7 * new Set(PLAN.map(p => p.week)).size / 60)} h au total — vous en êtes à ${fmtDur(t.total)}.</p>`)(timeStats())}
   ${lv("A1")}${lv("A2")}<h3>90 derniers jours</h3><div class="heat">${heat}</div></div>
  ${strandBalance()}
  <div class="card"><h3>Cartes à retravailler</h3>${bad.length ? `<table>${bad.map(id => { const it = ITEMS[id], c = card(id); return `<tr><td>${it.kind === "v" ? esc(it.v.fr + " — " + it.v.en) : esc(it.q + " → " + it.a)}</td><td>${c.lapses} erreur(s)</td><td>prochaine : ${dstr(c.due)}</td></tr>`; }).join("")}</table><p><button class="b" onclick="startReview('mistakes')">Revoir mes erreurs</button></p>` : `<p class="mut">Aucune erreur pour l'instant.</p>`}</div>
  <div class="card"><h3>Historique des séances</h3><table><tr><th>Date</th><th>Type</th><th>Durée</th><th>Score</th></tr>${S.sessions.slice(-25).reverse().map(s => `<tr><td>${new Date(s.start).toLocaleString()}</td><td>${esc(s.label)}</td><td>${Math.max(1, Math.round((s.end - s.start) / 6e4))} min</td><td>${s.total ? s.correct + "/" + s.total : "—"}</td></tr>`).join("")}</table></div>`;
}

// Balance of Nation's four strands over the last 14 days, plus French-specific trackers
function strandBalance() {
  const days = Array.from({ length: 14 }, (_, i) => dstr(Date.now() - i * DAY));
  const tot = STRANDS.map(([k, l]) => [l, days.reduce((a, d) => a + (((S.daily[d] || {}).st || {})[k] || 0), 0) / 60]);
  const sum = tot.reduce((a, x) => a + x[1], 0) || 1;
  const conj = Object.entries(S.conj || {}).filter(([, v]) => v.n >= 2).map(([k, v]) => [k.replace("|", " · ").replace(/· (\w+)$/, (m, t) => "· " + TENSES[t][0]), v.ok / v.n, v.n]).sort((a, b) => a[1] - b[1]).slice(0, 8);
  const w10 = (S.writing || []).filter(x => x.mode === "fluency").slice(-10);
  const dic = (S.dictee || []).slice(-10), dn = dic.reduce((a, x) => a + x.n, 0), dok = dic.reduce((a, x) => a + x.ok, 0);
  return `<div class="card"><h3>Équilibre des 4 piliers (14 derniers jours)</h3><p class="mut">Objectif : environ 25 % chacun.</p>
   ${tot.map(([l, m]) => `<p style="margin:4px 0">${l} : ${Math.round(m)} min · ${Math.round(m / sum * 100)} %<div class="bar"><i style="width:${m / sum * 100}%;${Math.abs(m / sum - 0.25) > 0.12 ? "background:#d9730d" : ""}"></i></div></p>`).join("")}</div>
  <div class="card"><h3>Français : points spécifiques</h3>
   <p><b>Conjugaisons à retravailler</b> ${conj.length ? "" : '<span class="mut">— pas encore assez de données</span>'}</p>${conj.length ? `<table>${conj.map(([k, r, n]) => `<tr><td>${esc(k)}</td><td>${Math.round(r * 100)} %</td><td class="mut">${n} essais</td></tr>`).join("")}</table><p><button class="b s" onclick="openConj()">S'entraîner</button></p>` : ""}
   <p><b>Dictée</b> : ${dn ? Math.round(dok / dn * 100) + " % de mots justes (10 dernières)" : '<span class="mut">pas encore faite</span>'}</p>
   <p><b>Écriture rapide 10 min</b> : ${w10.length ? w10.map(x => x.words).join(" → ") + " mots" : '<span class="mut">pas encore faite</span>'}</p>
   <p><b>Genre éclair</b> : ${(S.genre || []).slice(-5).map(x => x.ok + "/" + x.n).join(" · ") || '<span class="mut">pas encore fait</span>'}</p></div>`;
}

// ---------- Sync ----------
function merge(a, b) { // b merged into a
  for (const [id, c] of Object.entries(b.cards || {})) if (!a.cards[id] || (c.mod || 0) > (a.cards[id].mod || 0)) a.cards[id] = c;
  const ids = new Set(a.sessions.map(s => s.id)); (b.sessions || []).forEach(s => { if (!ids.has(s.id)) a.sessions.push(s); });
  a.sessions.sort((x, y) => x.start - y.start);
  for (const [id, t] of Object.entries(b.todo || {})) if (!a.todo[id] || t.at > a.todo[id].at) a.todo[id] = t;
  for (const [d, v] of Object.entries(b.daily || {})) { const x = a.daily[d] || (a.daily[d] = {}); x.secs = Math.max(x.secs || 0, v.secs || 0); x.newSeen = Math.max(x.newSeen || 0, v.newSeen || 0); }
  // per-device time: keep the larger count of each device, then the day's total is the sum over devices
  a.dev = a.dev || {};
  for (const [dv, days] of Object.entries(b.dev || {})) { const m = a.dev[dv] || (a.dev[dv] = {}); for (const [d, v] of Object.entries(days)) { const x = m[d] || (m[d] = {}); x.secs = Math.max(x.secs || 0, v.secs || 0); x.newSeen = Math.max(x.newSeen || 0, v.newSeen || 0); if (v.st) { x.st = x.st || {}; for (const k in v.st) x.st[k] = Math.max(x.st[k] || 0, v.st[k]); } } }
  const sum = {}; for (const days of Object.values(a.dev)) for (const [d, v] of Object.entries(days)) { const x = sum[d] || (sum[d] = { secs: 0, newSeen: 0, st: {} }); x.secs += v.secs || 0; x.newSeen += v.newSeen || 0; for (const k in v.st || {}) x.st[k] = (x.st[k] || 0) + v.st[k]; }
  for (const [d, x] of Object.entries(sum)) a.daily[d] = Object.assign(a.daily[d] || {}, x);
  const mk = new Set(a.mistakes.map(m => m.id + m.t)); (b.mistakes || []).forEach(m => { if (!mk.has(m.id + m.t)) a.mistakes.push(m); });
  for (const [d, v] of Object.entries(b.daily || {})) if (v.st && !sum[d]) { const x = a.daily[d]; x.st = x.st || {}; for (const k in v.st) x.st[k] = Math.max(x.st[k] || 0, v.st[k]); }
  a.notes = Object.assign({}, b.notes || {}, a.notes || {});
  a.custom = Object.assign({}, b.custom || {}, a.custom || {});
  for (const k of ["dayplan", "dayDone", "roleNotes", "exams", "dlgDone", "actAns", "ustep", "carnet"]) a[k] = Object.assign({}, b[k] || {}, a[k] || {});
  // a day's blocks: keep the version where more blocks are done (studying on the phone, then on the computer)
  a.run = a.run || {}; for (const [d, r] of Object.entries(b.run || {})) { const l = a.run[d], nd = x => x ? x.blocks.filter(y => y.done).length : -1; if (nd(r) > nd(l)) a.run[d] = r; }
  { const seen = new Set((a.roles || []).map(x => x.t)); a.roles = (a.roles || []).concat((b.roles || []).filter(x => !seen.has(x.t))); }
  a.talkText = Object.assign({}, b.talkText || {}, a.talkText || {});
  for (const k of ["writing", "talks", "dictee", "genre", "nombres"]) { const seen = new Set((a[k] || []).map(x => x.t)); a[k] = (a[k] || []).concat((b[k] || []).filter(x => !seen.has(x.t))).sort((x, y) => x.t - y.t); }
  a.conj = a.conj || {}; for (const [k, v] of Object.entries(b.conj || {})) if (!a.conj[k] || v.last > a.conj[k].last) a.conj[k] = v;
  a.cur = Math.max(a.cur || 1, b.cur || 1);
  a.journal = a.journal || {}; for (const [d, e] of Object.entries(b.journal || {})) if (!a.journal[d] || (e.at || 0) > (a.journal[d].at || 0)) a.journal[d] = e;
  a.lastExport = Math.max(a.lastExport || 0, b.lastExport || 0);
  // the book content you entered: the most recent entry of each unit wins
  a.book = a.book || {}; for (const [k, units] of Object.entries(b.book || {})) { const m = a.book[k] || (a.book[k] = {}); for (const [n, e] of Object.entries(units)) if (!m[n] || (e.at || 0) > (m[n].at || 0)) m[n] = e; }
}
function renderSync() {
  view.innerHTML = `<div class="card"><h2>Synchroniser la progression</h2>
  <p>Vos données restent dans ce navigateur. Pour les synchroniser entre appareils : exportez un fichier, mettez-le dans iCloud / Dropbox / Drive, puis importez-le sur l'autre appareil. L'import <b>fusionne</b> (pas d'écrasement) : chaque carte garde la version la plus récente, les séances sont additionnées.</p>
  <p class="row"><button class="b" id="ex">⬇ Exporter</button><label class="b s" style="cursor:pointer">⬆ Importer<input type="file" id="im" accept=".json" hidden></label></p>
  <p class="mut">Dernière sauvegarde : ${S.lastExport ? new Date(S.lastExport).toLocaleString() : "jamais"}</p><p id="msg"></p></div>
  <div class="card"><h3>Réglages</h3>
  <p>Temps par jour (à partir de la 3e semaine ; avant, la montée progressive) : <select id="mn">${[90, 120, 160].map(m => `<option value="${m}" ${(S.settings.minutes || 160) == m ? "selected" : ""}>${m} min</option>`).join("")}</select></p>
  <p>Nouvelles cartes par jour : <select id="np"><option value="">selon la semaine (15, puis 30)</option>${[15, 30].map(m => `<option ${S.settings.newOverride == m ? "selected" : ""}>${m}</option>`).join("")}</select></p>
  <p>Objectif après l'A2 : <select id="ob">${[["tcf", "TCF Canada (exercices de type TCF à partir de janvier, en B1)"], ["delf", "DELF B1"], ["ecrit", "Écrit"]].map(([v, t]) => `<option value="${v}" ${S.settings.objective === v ? "selected" : ""}>${t}</option>`).join("")}</select></p>
  <p><label><input type="checkbox" id="sp" ${S.settings.speak ? "checked" : ""}> Prononcer automatiquement le français</label></p>
  <p>Voix française (mots isolés) : <select id="vo">${frVoices().map(v => `<option ${bestVoice() === v ? "selected" : ""}>${esc(v.name)}</option>`).join("") || "<option>aucune voix française installée</option>"}</select>
   Vitesse : <select id="rt">${[0.7, 0.8, 0.85, 0.9, 1].map(r => `<option ${(S.settings.rate || 0.85) == r ? "selected" : ""}>${r}</option>`).join("")}</select>
   <button class="b s" onclick="speak('Bonjour, je m\\'appelle Camille. J\\'habite à Paris.')">▶ Tester</button></p>
  <p class="mut">Pour une voix bien plus naturelle sur Mac : Réglages Système → Accessibilité → Contenu énoncé → Voix du système → Gérer les voix → Français (France), téléchargez une voix « Premium » ou « Améliorée » (ex. Amélie, Thomas, Audrey), puis rechargez la page et choisissez-la ici. Les listes complètes ont aussi l'enregistrement original de Français interactif (🎧).</p>
  <p><button class="b bad" id="rs">Tout réinitialiser</button></p></div>`;
  $("#ex").onclick = () => {
    S.lastExport = Date.now(); save();
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: "application/json" }));
    a.download = `francais-progression-${dstr()}.json`; a.click(); $("#msg").textContent = "Exporté ✅";
  };
  $("#im").onchange = async e => {
    try { const b = JSON.parse(await e.target.files[0].text()); if (!b.cards) throw 0; merge(S, b); save(); $("#msg").textContent = "Fusionné ✅ — " + Object.keys(S.cards).length + " cartes."; }
    catch (err) { $("#msg").textContent = "Fichier invalide."; }
  };
  $("#np").onchange = e => { S.settings.newOverride = +e.target.value || 0; save(); };
  $("#mn").onchange = e => { S.settings.minutes = +e.target.value; save(); };
  $("#ob").onchange = e => { S.settings.objective = e.target.value; save(); };
  $("#sp").onchange = e => { S.settings.speak = e.target.checked; save(); };
  $("#vo").onchange = e => { S.settings.voice = e.target.value; save(); };
  $("#rt").onchange = e => { S.settings.rate = +e.target.value; save(); };
  $("#rs").onclick = () => { if (confirm("Effacer toute la progression ? (Exportez d'abord !)")) { localStorage.removeItem(KEY); load(); go("today"); } };
}

