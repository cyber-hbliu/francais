"use strict";
// The daily block runner, the dialogue lesson page (listen · shadow · role B · retell · sentence cards),
// recordings kept in IndexedDB, the weekly review, the check weeks and the Mes progrès page.
// Layout and colours follow the « Boîte à outils » design canvas; the rhythm follows the design brief for Bing.

// ===================== recordings (IndexedDB, survive reloads) =====================
let RDBP = null;
function rdb() {
  if (!RDBP) RDBP = new Promise((res, rej) => { const r = indexedDB.open("fr-recordings", 1); r.onupgradeneeded = () => r.result.createObjectStore("rec", { keyPath: "id" }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  return RDBP;
}
async function recSave(o) {
  const db = await rdb(); o.id = o.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 6); o.t = o.t || Date.now(); o.date = o.date || dstr(o.t);
  return new Promise((res, rej) => { const tx = db.transaction("rec", "readwrite"); tx.objectStore("rec").put(o); tx.oncomplete = () => res(o); tx.onerror = () => rej(tx.error); });
}
async function recAll() { const db = await rdb(); return new Promise((res, rej) => { const q = db.transaction("rec").objectStore("rec").getAll(); q.onsuccess = () => res(q.result.sort((a, b) => a.t - b.t)); q.onerror = () => rej(q.error); }); }
const REC_KIND = { shadow: "Répétition", role: "Jeu de rôle", retell: "Raconter", intro: "Me présenter", resume: "Résumé", libre: "Libre", talk: "Parler", pho: "Prononciation" };
let REC_CTX = { kind: "libre", unit: null };

// microphone + a recorder that stops by itself when the speaker goes quiet; counts pauses (> 0.7 s) and long pauses (> 2 s)
let MIC = null;
async function mic() { if (MIC && MIC.active) return MIC; MIC = await navigator.mediaDevices.getUserMedia({ audio: true }); return MIC; }
let TURN_STOP = null;
async function recordTurn({ maxMs = 12000, silenceMs = 1300, minMs = 700, onTick } = {}) {
  const st = await mic(), mr = new MediaRecorder(st), chunks = [];
  const ac = new (window.AudioContext || window.webkitAudioContext)(), an = ac.createAnalyser(); an.fftSize = 1024; ac.createMediaStreamSource(st).connect(an);
  const buf = new Float32Array(an.fftSize), t0 = Date.now(); let spoke = false, lastLoud = t0, pauses = 0, longPauses = 0, inPause = false, pStart = 0;
  mr.ondataavailable = e => chunks.push(e.data); window.MIC_ON = true; mr.start();
  return new Promise(res => {
    const iv = setInterval(() => {
      an.getFloatTimeDomainData(buf); let r = 0; for (const x of buf) r += x * x; r = Math.sqrt(r / buf.length);
      const now = Date.now(), loud = r > 0.015;
      if (loud) { if (inPause) { const d = now - pStart; if (d > 700) pauses++; if (d > 2000) longPauses++; } inPause = false; spoke = true; lastLoud = now; }
      else if (spoke && !inPause) { inPause = true; pStart = now; }
      onTick && onTick(now - t0, r);
      if ((spoke && now - lastLoud > silenceMs && now - t0 > minMs) || now - t0 > maxMs) TURN_STOP();
    }, 60);
    TURN_STOP = () => { clearInterval(iv); TURN_STOP = null; if (mr.state !== "inactive") mr.stop(); };
    mr.onstop = () => { ac.close(); window.MIC_ON = false; const blob = new Blob(chunks, { type: mr.mimeType }); res({ blob, url: URL.createObjectURL(blob), dur: (Date.now() - t0) / 1000, pauses, longPauses }); };
  });
}
async function keepRec(r, kind, unit, extra) { if (!r) return; if (window.RUN_STATS) RUN_STATS.recs++; try { await recSave(Object.assign({ kind, unit, dur: Math.round(r.dur * 10) / 10, pauses: r.pauses, longPauses: r.longPauses, blob: r.blob }, extra || {})); } catch (e) { console.warn(e); } }
// the simple record button used across the app keeps its recordings too
window.recToggle = async (btn, outId) => {
  if (TURN_STOP) { TURN_STOP(); return; }
  try {
    btn.textContent = "⏹ Arrêter";
    const r = await recordTurn({ maxMs: 300000, silenceMs: 1e9 });
    btn.textContent = "🎙 M'enregistrer";
    const o = document.getElementById(outId); if (o) o.innerHTML = `<audio controls src="${r.url}"></audio>`;
    keepRec(r, REC_CTX.kind, REC_CTX.unit); blockAction();
  } catch (e) { btn.textContent = "🎙 M'enregistrer"; alert("Micro indisponible : " + e.message); }
};

// ===================== speech helpers =====================
const NOVELTY = /grandma|grandpa|rocko|eddy|flo|sandy|shelley|reed|bubbles|bells|jester|organ|whisper|zarvox|bahh|boing|cellos|trinoids|albert|bad news|good news|superstar|wobble/i;
function voicesAB() { const vs = frVoices().filter(v => !NOVELTY.test(v.name)), a = bestVoice(), b = vs.find(v => v !== a && /amélie|audrey|aurélie|marie|thomas|daniel|jacques/i.test(v.name)) || vs.find(v => v !== a) || a; return { A: a, B: b, C: a, "": a }; }
function sayP(text, who, rate) {
  return new Promise(res => {
    if (!("speechSynthesis" in window)) return res();
    const u = new SpeechSynthesisUtterance(plain(text).replace(/\(.*?\)|…/g, " ")); u.lang = "fr-FR"; u.rate = rate || S.settings.rate || 0.9;
    const v = voicesAB()[who || ""]; if (v) u.voice = v;
    let done = false; const fin = () => { if (!done) { done = true; res(); } };
    u.onend = fin; u.onerror = fin; setTimeout(fin, 2000 + text.length * 120 / u.rate); speechSynthesis.speak(u);
  });
}
const playURL = (url, rate) => new Promise(res => { const a = new Audio(url); AUDIO_ON.add(a); a.playbackRate = rate || 1; const fin = () => { AUDIO_ON.delete(a); res(); }; a.onended = fin; a.onerror = fin; a.play().catch(fin); });
const ICON = {
  play: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"></path></svg>`,
  pause: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M8 5v14M16 5v14"></path></svg>`,
  mic: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0"></path><path d="M12 18v3"></path></svg>`
};
const mmss = s => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
const capit = s => s.charAt(0).toUpperCase() + s.slice(1);
const dayLong = d => capit(fmtDate(d));
const dayShort = d => new Date(dParse(d)).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

// ===================== blocks =====================
const SC = { study: "#1F5BB0", input: "#0E7C6B", output: "#C2410C", fluency: "#6D3FC0", null: "#5B6168" };
const SC_BG = { study: "#F2F6FC", input: "#EEF8F5", output: "#FFF7F2", fluency: "#F5F1FC", null: "#F1F3F5" };
const STR_FR = { study: "Étude", input: "Écoute", output: "Production", fluency: "Fluidité" };
// key: [name, strand, what it is, short label for the day's dots]
const BLK = {
  cards: ["Cartes", "study", "Les cartes à revoir, puis les nouvelles (d'abord celles du dialogue du jour). Dites la réponse à voix haute avant de retourner.", "Cartes"],
  cardsMin: ["Cartes", "study", "Les cartes les plus urgentes.", "Cartes"],
  dlgListen: ["Écoute du dialogue", "input", "Écoutez en lisant, deux fois : d'abord avec la traduction, puis sans. Ensuite, dites ce que raconte le dialogue.", "Écoute du dialogue"],
  dlgMin: ["Écoute du dialogue", "input", "Une écoute du dialogue du jour, en lisant.", "Écoute du dialogue"],
  gramA: ["Grammaire A", "study", "Le chapitre du jour : règle, exemples, exercices dits à voix haute, puis le petit dialogue de Tex.", "Grammaire A"],
  gramB: ["Grammaire B", "study", "Le chapitre suivant (ou la conjugaison).", "Grammaire B"],
  shadow: ["Répétition phrase par phrase", "output", "Écoutez l'original, répétez, puis réécoutez original, vous, original. Focus du premier passage : les finales muettes.", "Répétition"],
  listenFI: ["Écoute libre", "input", "Français interactif sur le même thème, puis racontez en une ou deux phrases.", "Écoute libre"],
  role: ["Jeu de rôle", "output", "L'ordinateur joue A, vous jouez B, puis on échange. Trois tours.", "Jeu de rôle"],
  retell: ["Raconter 3/2/1½", "fluency", "Racontez le dialogue à la 3e personne, trois fois, de plus en plus vite. Tout est enregistré.", "Raconter 3/2/1½"],
  relisten: ["Réécoute rapide", "fluency", "Les dialogues des jours précédents, à ×1,15 puis ×1,3.", "Réécoute rapide"],
  write10: ["Écriture rapide", "fluency", "10 minutes sans s'arrêter, sur un sujet facile ; on compte les mots.", "Écriture rapide"],
  rfi: ["Actualité en français facile", "input", "RFI, journal en français facile : écoutez, puis racontez une information.", "Actualité RFI"],
  pho: ["Prononciation", "input", "Une leçon de prononciation de Français interactif : écouter, imiter, s'enregistrer.", "Prononciation"],
  pho2: ["Prononciation", "input", "La leçon de prononciation suivante.", "Prononciation"],
  weekly: ["Bilan de la semaine", null, "Vos minutes, vos mots et votre voix cette semaine.", "Bilan"],
  roleReplay: ["Rejouer un jeu de rôle", "output", "Un jeu de rôle de la semaine, de nouveau.", "Jeu de rôle"],
  roleReplay2: ["Rejouer un autre jeu de rôle", "output", "Un deuxième jeu de rôle de la semaine.", "Jeu de rôle"],
  exam: ["Contrôle DELF", "input", "Sujet officiel : écoute et lecture, chronométrées ; notez votre score.", "DELF"]
};
// the day's blocks per phase, minutes at 160 min/day (scaled to the daily setting)
const TPLS = {
  w0: [["pho", 15], ["cards", 10], ["dlgListen", 15], ["gramA", 10], ["shadow", 15], ["pho2", 10], ["role", 10], ["retell", 5]],
  w1: [["cards", 15], ["dlgListen", 15], ["gramA", 15], ["shadow", 15], ["gramB", 15], ["listenFI", 15], ["role", 10], ["retell", 10], ["relisten", 10]],
  w2: [["cards", 15], ["dlgListen", 15], ["gramA", 20], ["shadow", 15], ["gramB", 20], ["listenFI", 20], ["role", 15], ["retell", 10], ["relisten", 10]],
  A1: [["cards", 15], ["dlgListen", 20], ["gramA", 20], ["shadow", 20], ["gramB", 20], ["listenFI", 20], ["role", 15], ["retell", 20], ["relisten", 10]],
  A2: [["cards", 15], ["dlgListen", 20], ["gramA", 20], ["shadow", 20], ["rfi", 20], ["role", 15], ["listenFI", 20], ["retell", 20], ["relisten", 10]],
  sun: [["weekly", 5], ["cards", 15], ["roleReplay", 15], ["roleReplay2", 15]],
  min: [["cardsMin", 10], ["dlgMin", 5]]
};
function tplFor(T) { const w = weekOf(T); return isSun(T) ? "sun" : w === 0 ? "w0" : w === 1 ? "w1" : w === 2 ? "w2" : T > cal().a1End ? "A2" : "A1"; }
const RUN_V = 3;
function makeRun(T, tpl) {
  const ks = TPLS[tpl].map(x => x.slice()), dow = new Date(dParse(T)).getDay(), f = minutesPerDay() / 160;
  const ri = ks.findIndex(x => x[0] === "relisten"); if (ri >= 0 && (dow === 2 || dow === 4)) ks[ri][0] = "write10";
  if (tpl !== "min" && PLAN.some(p => p.type === "exam" && p.date === T && !isDone(p.id))) ks.splice(1, 0, ["exam", 50]);
  return { v: RUN_V, tpl, blocks: ks.map(([k, m]) => ({ k, min: tpl === "min" ? m : Math.max(5, Math.round(m * f)), done: false, res: "" })), cur: null };
}
function run() {
  const T = dstr(); S.run = S.run || {};
  const r = S.run[T];
  if (!r || (r.v !== RUN_V && !r.blocks.some(b => b.done))) { S.run[T] = makeRun(T, tplFor(T)); save(); }
  return S.run[T];
}
// the retell block changes with the phase (self-introduction in week 0, « je » in week 1, 3rd person after)
function blkName(k) { if (k !== "retell") return BLK[k][0]; const p = phase(); return p.retell.mode === "intro" ? "Me présenter" : "Raconter " + p.retell.secs.map(s => s >= 60 && s % 60 === 0 ? s / 60 : s >= 60 ? "1½" : s).join("/") + (p.retell.secs[0] >= 120 ? "" : " s"); }
function blkLabel(k) { return k === "retell" ? blkName(k) : BLK[k][3]; }
let RUN_ACTIVE = false, RUN_STATS = null, RUN_TICK = null;
window.RUN_ACTIVE = false;
const nextIdx = r => r.blocks.findIndex(b => !b.done);

function day9HTML(r, curIdx) {
  return `<div class="day9" style="grid-template-columns:repeat(${r.blocks.length},minmax(0,1fr))">${r.blocks.map((b, i) => { const c = SC[BLK[b.k][1]];
    return `<div class="${i === curIdx ? "now" : ""}"><span class="c" title="${esc(blkName(b.k))} · ${b.min} min" style="${b.done ? `background:${c};border-color:${c}` : i === curIdx ? `border:3px solid ${c}` : ""}"></span><span class="l">${esc(blkLabel(b.k))}</span></div>`; }).join("")}</div>`;
}
const legendHTML = `<div class="legend">${["study", "input", "output", "fluency"].map(s => `<span><span class="dot" style="background:${SC[s]}"></span>${STR_FR[s]}</span>`).join("")}</div>`;
// what the block will be about, in one line
function blockSubtitle(k) {
  const n = lessonOfDay(), c = COMM.find(x => x.n === n), k2 = sitOfDay(n);
  if (/^(dlg|shadow|role|retell)/.test(k)) return k === "retell" && phase().retell.mode === "intro" ? "Avec les phrases du kit de survie" : `Communication ${n} · ${c.title} · ${c.dlgs[k2].sit}`;
  if (k === "gramA" || k === "gramB") { const g = todayIds().map(id => PLAN.find(p => p.id === id)).filter(p => p && (p.type === "lesson" || p.type === "bilan"))[k === "gramA" ? 0 : 1]; return g ? g.title : "Conjugaison et révision"; }
  if (k === "cards" || k === "cardsMin") { const d = dueIds().length, nn = Math.min(newQuota(), 20); return `${d > 150 ? "150+" : d} à revoir · ${d > 150 ? 0 : nn} nouvelles`; }
  if (k === "pho" || k === "pho2" || k === "listenFI") { const ph = nextPlanItem(["pho"]); if (ph && k !== "listenFI" || ph && weekOf(dstr()) <= 1) return ph.title; const ls = nextPlanItem(["listen"]); return ls ? ls.title : ""; }
  return "";
}

// ===================== Aujourd'hui =====================
function renderToday() {
  setView("today", null); document.body.classList.remove("focus"); RUN_ACTIVE = window.RUN_ACTIVE = false; hideBar();
  const T = dstr(), r = run(), i = nextIdx(r), pr = projection(), st = streak(), n = lessonOfDay(), c = COMM.find(x => x.n === n), k2 = sitOfDay(n);
  const total = r.blocks.reduce((a, b) => a + b.min, 0), doneMin = r.blocks.filter(b => b.done).reduce((a, b) => a + b.min, 0);
  const minsToday = Math.round(((S.daily[T] || {}).secs || 0) / 60), due = dueIds().length;
  const sundayExport = isSun(T) && (!S.lastExport || dstr(S.lastExport) !== T) && Object.keys(S.cards).length > 0;
  let next;
  if (i < 0) {
    S.dayDone = S.dayDone || {}; if (!S.dayDone[T]) { S.dayDone[T] = true; save(); }
    const nxt = nextPlanItem(["comm", "lesson", "vocab", "bilan"]);
    next = `<section class="card nextblock" style="padding:32px"><div class="strand" style="color:${SC.study}"><span class="dot" style="background:${SC.study}"></span>Journée terminée</div>
      <h1 style="margin:12px 0">Bravo, c'est fait pour aujourd'hui.</h1><p class="mut">${r.blocks.map(b => `${esc(blkName(b.k))} : ${esc(b.res || "fait")}`).join(" · ")}</p>
      ${nxt ? `<details><summary class="mut">Encore de l'énergie ? Avancer d'une étape</summary><p><button class="b s" onclick="doPlan('${nxt.id}')">${esc(nxt.title)}</button></p></details>` : ""}</section>`;
  } else {
    const b = r.blocks[i], s = BLK[b.k][1], resume = r.cur && r.cur.idx === i, mins = resume ? Math.ceil(r.cur.left / 60) : b.min;
    next = `<section class="card nextblock" aria-label="Bloc suivant" style="padding:32px;display:flex;flex-direction:column;gap:16px">
      <div class="strand" style="color:${SC[s]}"><span class="dot" style="background:${SC[s]}"></span>Bloc ${i + 1} sur ${r.blocks.length} · ${STR_FR[s] || "Bilan"}</div>
      <h1>${esc(blkName(b.k))}</h1>${blockSubtitle(b.k) ? `<p class="sub">${esc(blockSubtitle(b.k))}</p>` : ""}
      <p style="margin:0;max-width:640px">${esc(BLK[b.k][2])}</p>
      <div class="row" style="margin-top:8px;gap:12px"><button class="b big1" onclick="startBlock(${i})">${ICON.play}<span>${resume ? "Reprendre" : "Commencer"} · ${mins} min</span></button>
      ${r.tpl !== "min" && r.tpl !== "sun" && !r.blocks.some(x => x.done) ? `<button class="b s" onclick="minDay()">Pas en forme ? Version 15 min</button>` : ""}</div></section>`;
  }
  const pend = pr.done ? `${pr.phase} terminé` : dayShort(pr.date);
  const lesson = T < cal().w1 && !c ? "" : `<section class="card" aria-label="Leçon du jour" style="display:flex;flex-wrap:wrap;gap:32px">
    <div style="flex:999 1 420px;min-width:0;display:flex;flex-direction:column;gap:10px"><h2 style="margin:0">Leçon du jour · Communication ${n} · ${esc(c.title)}</h2>
     ${c.dlgs[k2].lines.slice(0, 3).map(l => `<p style="margin:0"><span style="display:inline-block;min-width:28px;font-weight:600;color:var(--mut)">${l.who}</span>${esc(l.text)}</p>`).join("")}</div>
    <div style="flex:1 1 240px;display:flex;flex-direction:column;gap:8px"><div style="font-size:13px;color:var(--mut)">Liée à cette leçon</div>
     <div><span class="chip">Livre p. ${c.bookPages[0]}${c.bookPages[1] !== c.bookPages[0] ? "–" + c.bookPages[1] : ""}</span>${c.grammar.length ? `<span class="chip">Grammaire ${c.grammar.join(" · ")}</span>` : ""}${c.vocabUnits.length ? `<span class="chip">Vocabulaire ${c.vocabUnits.join(" · ")}</span>` : ""}<span class="chip">FI ch. ${String(c.fiChapter).padStart(2, "0")}</span></div></div></section>`;
  view.innerHTML = (sundayExport ? `<div class="card" style="padding:16px 24px">💾 Dimanche : pensez à exporter votre sauvegarde. <button class="b s" onclick="go('sync')">Exporter</button></div>` : "") +
    `<p class="sub">${dayLong(T)} · Semaine ${weekOf(T)} · Communication ${n}</p>` + next +
    `<section class="card" aria-label="Ma journée" style="display:flex;flex-direction:column;gap:16px">
      <div class="row" style="justify-content:space-between;align-items:baseline"><h2 style="margin:0">Ma journée</h2><span class="mut" style="font-variant-numeric:tabular-nums">${minsToday} / ${total} min</span></div>
      ${day9HTML(r, i)}<div class="bar"><i style="width:${total ? doneMin / total * 100 : 0}%"></i></div>${legendHTML}</section>
    <div class="stats"><div class="stat"><div class="k">Série</div><b>${st} jour${st > 1 ? "s" : ""}</b></div>
      <div class="stat"><div class="k">Fin du ${pr.phase} prévue</div><b>${esc(pend)}</b>${pr.late ? `<button class="lnk" onclick="postponeWeek()">Décaler d'une semaine</button>` : ""}</div>
      <div class="stat"><div class="k">Cartes à revoir aujourd'hui</div><b>${due > 150 ? "150+" : due}</b></div></div>` + lesson +
    `<details class="mut"><summary>Pourquoi cette journée ?</summary><p>Chaque journée tourne autour d'un dialogue de Communication progressive : on l'écoute en lisant, on le répète phrase par phrase, on le joue, puis on le raconte (Nation : « linked skills », la dernière étape devient de la fluidité). Les blocs alternent les quatre piliers et ne dépassent pas 20 minutes. Les trois premières semaines, la journée grandit doucement : ${phase().total} min cette semaine.</p></details>`;
}
window.renderToday = renderToday;
window.minDay = () => { const T = dstr(); S.run[T] = makeRun(T, "min"); save(); renderToday(); };

// ===================== focus mode =====================
function hideBar() { const b = $("#fbar"); if (b) b.remove(); if (RUN_TICK) clearInterval(RUN_TICK); RUN_TICK = null; }
function drawBar() {
  const r = run(), c = r.cur; if (!c) return;
  const b = r.blocks[c.idx], s = BLK[b.k][1], left = Math.max(0, c.left), pct = 100 - left / (b.min * 60) * 100;
  let el = $("#fbar"); if (!el) { el = document.createElement("div"); el.id = "fbar"; document.body.prepend(el); }
  el.innerHTML = `<div class="top"><div class="left"><button class="b s" onclick="exitFocus()">Quitter</button><button class="lnk" onclick="skipBlock()">Passer</button></div>
    <div class="strand" style="color:${SC[s]}"><span class="dot" style="background:${SC[s]}"></span>Bloc ${c.idx + 1} sur ${r.blocks.length} · ${STR_FR[s] || "Bilan"}</div>
    <div class="clock">${left > 0 ? `<b>${mmss(left)}</b><span>restantes</span>` : `<b style="font-size:22px">Temps écoulé</b><span>finissez, puis terminez le bloc</span>`}<br><button class="lnk" onclick="completeBlock()">Terminer le bloc ✓</button></div></div>
    <div class="prog"><i style="width:${pct}%;background:${SC[s]}"></i></div>`;
}
window.startBlock = idx => {
  const r = run();
  if (!r.cur || r.cur.idx !== idx) r.cur = { idx, left: r.blocks[idx].min * 60, acted: false };
  save(); RUN_ACTIVE = window.RUN_ACTIVE = true; RUN_STATS = window.RUN_STATS = { cards: 0, recs: 0, sent: 0, rounds: 0 };
  document.body.classList.add("focus"); drawBar();
  if (RUN_TICK) clearInterval(RUN_TICK);
  RUN_TICK = setInterval(() => { const c = run().cur; if (!c) return; if (document.visibilityState === "visible" && c.left > 0) { c.left--; if (c.left % 10 === 0) save(); if (c.left === 0 && c.acted) completeBlock(); } drawBar(); }, 1000);
  launch(r.blocks[idx].k);
};
function blockAction() { if (!RUN_ACTIVE) return; const c = run().cur; if (!c) return; c.acted = true; save(); if (c.left <= 0) completeBlock(); }
window.blockAction = blockAction;
window.onQueueDone = () => blockAction();
window.onPlanDone = () => blockAction();
window.blockReturn = () => { // an activity went back to Today while a block is running
  blockAction(); const c = run().cur; if (!c) return;
  if (c.left <= 0) return completeBlock();
  view.innerHTML = `<section class="card" style="padding:32px"><h1>Activité terminée</h1><p>Il reste ${Math.ceil(c.left / 60)} min dans ce bloc.</p>
   <div class="row"><button class="b big1" onclick="launch(run().blocks[run().cur.idx].k)">${ICON.play}<span>Continuer</span></button><button class="b s" onclick="completeBlock()">Terminer le bloc</button></div></section>`;
};
function resultText(s) {
  const p = [];
  if (s.cards) p.push(s.cards + " cartes"); if (s.sent) p.push("répétition de " + s.sent + " phrase" + (s.sent > 1 ? "s" : "")); if (s.rounds) p.push(s.rounds + " tour" + (s.rounds > 1 ? "s" : ""));
  if (s.recs) p.push(s.recs + " enregistrement" + (s.recs > 1 ? "s" : ""));
  return p.join(" · ") || "fait";
}
window.completeBlock = () => {
  const r = run(), c = r.cur; if (!c) return renderToday();
  const b = r.blocks[c.idx]; b.done = true; b.res = resultText(RUN_STATS || {});
  if (c.item && !isDone(c.item)) S.todo[c.item] = { done: true, at: Date.now() };
  if (b.k === "retell" && c.sit) doneDialogue(c.sit[0], c.sit[1]);
  r.cur = null; schedule(); save(); if (TURN_STOP) TURN_STOP(); stopActivity();
  const i = nextIdx(r);
  if (i < 0) { S.dayDone = S.dayDone || {}; S.dayDone[dstr()] = true; save(); }
  hideBar();
  const s = BLK[b.k][1];
  view.innerHTML = `<section class="card" style="padding:32px;display:flex;flex-direction:column;gap:16px"><div class="strand" style="color:${SC[s]}"><span class="dot" style="background:${SC[s]}"></span>Bloc terminé</div>
   <h1>${esc(blkName(b.k))}</h1><p style="margin:0;font-size:18px"><b>${esc(b.res)}</b></p>${day9HTML(r, i)}
   ${i < 0 ? `<p>Tous les blocs du jour sont faits.</p><div><button class="b big1" onclick="exitFocus()">Terminer la journée</button></div>`
    : `<p class="mut" style="margin:0">Ensuite : <b>${esc(blkName(r.blocks[i].k))}</b> · ${r.blocks[i].min} min</p><div class="row"><button class="b big1" onclick="startBlock(${i})">${ICON.play}<span>Bloc suivant</span></button><button class="b s" onclick="exitFocus()">Pause</button></div>`}</section>`;
};
window.skipBlock = () => { const r = run(), c = r.cur; if (!c) return; const [b] = r.blocks.splice(c.idx, 1); r.blocks.push(b); r.cur = null; save(); exitFocus(); };
window.exitFocus = () => { if (TURN_STOP) TURN_STOP(); stopActivity(); RUN_ACTIVE = window.RUN_ACTIVE = false; document.body.classList.remove("focus"); hideBar(); renderToday(); };

// what each block opens; c.item = the plan item it completes
function launch(k) {
  const r = run(), c = r.cur, T = dstr(), n = lessonOfDay();
  const pick = (types, i) => todayIds().map(id => PLAN.find(p => p.id === id)).filter(p => p && types.includes(p.type))[i] || null;
  REC_CTX = { kind: "libre", unit: null };
  switch (k) {
    case "cards": return startReview("block");
    case "cardsMin": return startReview("blockmin");
    case "dlgListen": case "dlgMin": return openComm(n, null, "listen", sitOfDay(n));
    case "shadow": return openComm(n, null, "shadow", sitOfDay(n));
    case "role": return openComm(n, null, "role", sitOfDay(n));
    case "retell": c.sit = [n, sitOfDay(n)]; save(); return openComm(n, null, "retell", sitOfDay(n));
    case "gramA": case "gramB": {
      const g = pick(["lesson", "bilan"], k === "gramA" ? 0 : 1);
      if (g) { c.item = g.id; save(); return g.type === "lesson" ? openLesson(g.target) : startReview("bilan:" + g.target); }
      if (k === "gramA" && T > cal().a1End) return openDialogueGrammar(n);
      return openConj();
    }
    case "listenFI": case "pho": case "pho2": {
      const ph = pick(["pho"], k === "pho2" ? 1 : 0) || (k !== "listenFI" || weekOf(T) <= 1 ? nextPlanItem(["pho"]) : null);
      if (ph) { c.item = ph.id; save(); return openPho(ph.target, ph.id); }
      const ls = pick(["listen"], 0) || nextPlanItem(["listen"]); c.item = ls.id; save(); return openListen(ls.target, ls.id);
    }
    case "write10": return openEcrire("fluency");
    case "relisten": return openRelisten();
    case "rfi": return openRFI();
    case "weekly": return openWeekly();
    case "roleReplay": case "roleReplay2": { const w = weekRoles(); return openComm(w[k === "roleReplay" ? 0 : 1] || w[0] || n, null, "role"); }
    case "exam": { const e = PLAN.find(p => p.type === "exam" && p.date === T && !isDone(p.id)); if (e) { c.item = e.id; save(); return openExam(e.target, e.id); } return startReview("block"); }
  }
}
window.launch = launch;
function weekRoles() { const ws = Date.now() - 7 * DAY, l = [...new Set((S.roles || []).filter(x => x.t >= ws).map(x => x.n))]; if (!l.length) l.push(...PLAN.filter(p => p.type === "comm" && isDone(p.id)).slice(-2).map(p => p.target)); return l; }

// ===================== dialogue engine =====================
const STOPW = new Set("le la les un une des du de d l au aux et ou en à a est sont suis es êtes sommes je tu il elle on nous vous ils elles me te se moi toi lui ce cet cette ces mon ma mes ton ta tes son sa ses notre nos votre vos leur leurs qui que quoi qu ne n pas plus oui non très bien merci bonjour pour par avec dans sur sous mais si y c ça cela voilà alors aussi donc comme quel quelle".split(" "));
function keywords(lines) {
  const cnt = {};
  lines.forEach(l => (l.text.toLowerCase().replace(/[’]/g, "'").match(/\p{L}[\p{L}-]*/gu) || []).forEach(w => { w = w.replace(/^[a-z]'/, ""); if (w.length >= 4 && !STOPW.has(w)) cnt[w] = (cnt[w] || 0) + 1; }));
  return Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a] || b.length - a.length).slice(0, 8);
}
// week 0: shadow short pieces (words and short phrases) rather than whole sentences
function chunked(lines) {
  const out = [];
  lines.forEach(l => {
    const parts = l.text.split(/(?<=[,;:?!.…])\s+/).flatMap(p => { const w = p.split(/\s+/); if (w.length <= 5) return [p]; const h = Math.ceil(w.length / 2); return [w.slice(0, h).join(" "), w.slice(h).join(" ")]; });
    parts.forEach((p, i) => out.push({ who: l.who, text: p, en: i === 0 ? l.en : "" }));
  });
  return out;
}
const FOCI = [["finales", "Finales muettes"], ["liaison", "Liaisons"], ["nasales", "Voyelles nasales"], ["yu", "/y/ et /u/"], ["intonation", "Intonation"]];
let DP = null; // the open dialogue page
const enOf = t => (window.DLG_EN || {})[t] || "";
function lineHTML(l, i) {
  const cur = DP.cur === i, cover = DP.coverIdx && DP.coverIdx.has(i);
  return `<div class="ln ${cur ? "cur" : ""} ${cover ? "covered" : ""}" data-i="${i}">
    <button type="button" class="body" onclick="dpLine(${i})">${l.who ? `<span class="who">${esc(l.who)}</span>` : ""}<span><span class="fr">${esc(l.text)}</span>${DP.tr && l.en ? `<span class="en">${esc(l.en)}</span>` : ""}</span></button>
    ${cur && DP.ctl ? `<div class="ctl">${DP.ctl()}</div>` : ""}</div>`;
}
function drawLines() { const el = $("#dpl"); if (el) el.innerHTML = DP.lines.map(lineHTML).join(""); }
window.dpLine = i => { if (!DP) return; if (DP.onLine) DP.onLine(i); };
window.dpTr = () => { DP.tr = !DP.tr; DP.trUser = true; const b = $("#trb"); if (b) b.textContent = DP.tr ? "Masquer la traduction" : "Afficher la traduction"; drawLines(); };
const trButton = () => `<button type="button" class="b s" id="trb" onclick="dpTr()">${DP.tr ? "Masquer la traduction" : "Afficher la traduction"}</button>`;
const keysHTML = (rec = true) => `<div class="keys"><span><kbd>Espace</kbd> écouter</span>${rec ? "<span><kbd>R</kbd> enregistrer</span>" : ""}<span><kbd>←</kbd> <kbd>→</kbd> phrase précédente ou suivante</span><span><kbd>Entrée</kbd> étape suivante</span></div>`;
const micBtn = (on, label) => `<button type="button" class="mic ${on ? "rec" : ""}" onclick="dpMic()" aria-label="${label}">${ICON.mic}</button>`;
window.dpMic = () => { if (DP && DP.onMic) DP.onMic(); };

function dialogueModeHTML(mode) {
  if (mode === "listen") return `<div class="row" style="justify-content:space-between"><div class="row"><button class="b" id="lplay" onclick="dpToggle()">${ICON.play}<span>Écouter</span></button>
      <span class="mut" style="font-size:14px">Vitesse</span>${[0.8, 1, 1.15, 1.3].map(r => `<button type="button" class="pill ${r === DP.rate ? "on" : ""}" onclick="DP.rate=${r};dpMode('listen',true)">×${String(r).replace(".", ",")}</button>`).join("")}</div>${trButton()}</div>
     <p class="mut" id="dpst" style="margin:0">1re écoute : comprendre le sens (avec la traduction). 2e écoute : sans traduction, en regardant les cadres Grammaire et Vocabulaire du livre${DP.pages ? ` (p. ${DP.pages})` : ""}. Touchez une phrase pour l'écouter à partir d'elle.</p>
     <div class="lines" id="dpl"></div>
     <div class="card" style="padding:16px 20px;background:var(--chip);border:0"><b>Pour finir :</b> dites en français (ou en chinois) ce que raconte le dialogue. <span id="sumrec">${recWidget("dprec")}</span></div>${keysHTML(false)}`;
  if (mode === "shadow") return `<div><div style="font-size:13px;color:var(--mut);margin-bottom:10px">Focus de ce passage</div><div class="row" role="group" aria-label="Focus de ce passage">${FOCI.map(([k, l], j) => `<button type="button" class="pill ${DP.focus === j ? "on" : ""}" aria-pressed="${DP.focus === j}" onclick="DP.focus=${j};document.querySelectorAll('[aria-label=\\'Focus de ce passage\\'] .pill').forEach((b,x)=>{b.classList.toggle('on',x===${j});b.setAttribute('aria-pressed',x===${j})})">${l}</button>`).join("")}</div></div>
     <div class="row" style="justify-content:space-between"><h2 style="margin:0">Dialogue</h2>${trButton()}</div><div class="lines" id="dpl"></div>${keysHTML()}`;
  if (mode === "role") return `<div class="row" style="justify-content:space-between"><h2 style="margin:0" id="rhead">Tour 1 sur 3 · vous jouez B</h2>${trButton()}</div>
     <p class="mut" style="margin:0" id="rhint"></p><div class="lines" id="dpl"></div><div id="rnote"></div>
     <div class="row"><button class="b big1" id="rgo">${ICON.play}<span>Commencer le tour 1</span></button></div>${keysHTML()}`;
  if (mode === "retell") {
    const p = phase(), m = p.retell.mode, kw = m === "intro" ? ["je m'appelle", "je viens de", "j'habite à", "je suis…", "j'apprends le français", "j'aime…"] : keywords(DP.lines);
    const ask = m === "intro" ? "Présentez-vous avec les phrases du kit de survie : votre nom, d'où vous venez, où vous habitez, votre travail, ce que vous aimez."
      : m === "je" ? "Racontez votre version du dialogue, avec « je » : vous êtes la personne B, dites ce que vous avez fait et dit."
      : "Racontez le dialogue à la 3e personne (« je voudrais » → « elle voudrait », « nous allons » → « ils vont »).";
    return `<p style="margin:0;font-size:18px">${esc(ask)}</p>${p.zh ? `<p class="mut" style="margin:0">Bloquée ? Dites le mot en chinois et continuez.</p>` : ""}
     <div><div style="font-size:13px;color:var(--mut);margin-bottom:8px">Mots-clés</div>${kw.map(w => `<span class="chip" style="font-size:16px">${esc(w)}</span>`).join("")}</div>
     <div class="ln cur" style="--sc:${SC.fluency};--sc-bg:${SC_BG.fluency}"><div class="ctl" style="padding-left:0">
       <ol class="seq" id="tseq">${p.retell.secs.map((s, j) => `${j ? '<li class="sep" aria-hidden="true">›</li>' : ""}<li class="p" data-j="${j}">Tour ${j + 1} · ${s >= 60 ? mmss(s) : s + " s"}</li>`).join("")}</ol>
       <div class="row"><span class="status" id="tt">${mmss(p.retell.secs[0])}</span>${micBtn(false, "Commencer le tour")}</div></div></div>
     <div id="tres"></div>${keysHTML()}`;
  }
  if (mode === "phrases") return `<p class="mut" style="margin:0">Phrases entières → cartes. Pour les questions, la carte vous demandera d'y répondre pour vous, à voix haute.</p>
     <table>${DP.lines.map((l, i) => `<tr><td>${spk(l.text)}</td><td>${esc(l.text)}${l.en ? `<br><span class="mut">${esc(l.en)}</span>` : ""}</td><td><button class="b s" onclick="addSentence(${i})">${(S.custom || {})["d_" + l.text] ? "✓" : "＋"}</button></td></tr>`).join("")}</table>
     <p><button class="b" onclick="DP.lines.forEach((_, i) => addSentence(i, true));dpMode('phrases')">Tout ajouter aux cartes</button></p>
     ${DP.ex ? `<h3>Expressions utiles</h3><p class="mut">Déjà dans vos cartes (elles arrivent avec la leçon).</p><table>${DP.ex.map(([fr, en]) => `<tr><td>${spk(fr)}</td><td><b>${esc(fr)}</b></td><td class="mut">${esc(en)}</td></tr>`).join("")}</table>` : ""}`;
}
window.addSentence = (i, quiet) => {
  const t = DP.lines[i].text, k = "d_" + t; S.custom = S.custom || {};
  if (!S.custom[k]) { const c = S.custom[k] = { fr: t, en: /\?\s*$/.test(t) ? "❓ Répondez pour vous, à voix haute" : (DP.lines[i].en || `(dialogue ${DP.n || ""} — dites le sens)`), t: Date.now() }; const id = registerCustom(t, c), now = Date.now(); S.cards[id] = S.cards[id] || { ease: 2.5, interval: 0, reps: 0, lapses: 0, due: now, first: now, mod: now }; save(); }
  if (!quiet) dpMode("phrases");
};
window.dpMode = (mode, keep) => {
  if (!keep) { dpStop(); if (TURN_STOP) TURN_STOP(); }
  DP.mode = mode; DP.ctl = null; DP.onLine = null; DP.onMic = null; DP.keys = {}; DP.cur = -1; DP.coverIdx = null;
  DP.lines = mode === "shadow" && phase().w === 0 ? DP.chunks : DP.full;
  if (!DP.trUser) DP.tr = mode === "listen" ? !(DP.plays > 0) : mode !== "retell";
  DP.sc = SC[{ listen: "input", shadow: "output", role: "output", retell: "fluency", phrases: "study" }[mode]];
  REC_CTX = { kind: mode === "listen" ? "resume" : mode, unit: DP.n };
  document.querySelectorAll(".dpt").forEach(b => b.classList.toggle("on", b.dataset.m === mode));
  const box = $("#dpbody"); box.style.setProperty("--sc", DP.sc); box.style.setProperty("--sc-bg", SC_BG[{ listen: "input", shadow: "output", role: "output", retell: "fluency", phrases: "study" }[mode]]);
  const t = $("#dptitle"); if (t) t.innerHTML = DP.titleFor(mode);
  box.innerHTML = dialogueModeHTML(mode);
  ({ listen: setupListen, shadow: setupShadow, role: setupRole, retell: setupRetell, phrases: () => { } })[mode]();
  drawLines();
};
function dialoguePage(o) { // o: {n, k, title, sub, info, lines, ex, pages, modes, mode}
  const full = o.lines.map(l => ({ who: l.who, text: l.text, en: l.en || enOf(l.text) }));
  DP = { n: o.n, k: o.k, full, chunks: chunked(full), lines: full, ex: o.ex, pages: o.pages, rate: 1, subBase: o.subBase || o.sub, mode: null, plays: 0, passage: 1, focus: 0, tr: true, trUser: false,
    titleFor: m => `<h1>${esc(m === "listen" ? "Écoute du dialogue" : m === "shadow" ? "Répétition phrase par phrase" : m === "role" ? "Jeu de rôle" : m === "retell" ? blkName("retell") : "Phrases en cartes")}</h1><p class="sub" id="dpsub">${esc(o.sub)}</p>` };
  const modes = o.modes || [["listen", "Écouter"], ["shadow", "Répéter"], ["role", "Jouer B"], ["retell", "Raconter"], ["phrases", "Phrases"]];
  view.innerHTML = `<div id="dptitle" style="display:flex;flex-direction:column;gap:4px"></div>${o.info || ""}
    <div class="row dpt-row">${modes.map(([m, l]) => `<button type="button" class="pill dpt" data-m="${m}" onclick="dpMode('${m}')">${l}</button>`).join("")}</div>
    <div id="dpbody" style="display:flex;flex-direction:column;gap:20px"></div>`;
  dpMode(o.mode || "listen");
}
window.dpStop = () => { if (DP) DP.tok = null; speechSynthesis.cancel(); };

// listen and read: the playing sentence is highlighted; tap any sentence to play from there
function setupListen() {
  const playFrom = async i => {
    const tok = DP.tok = Math.random(); speechSynthesis.cancel(); $("#lplay").innerHTML = `${ICON.pause}<span>Pause</span>`;
    for (let j = i; j < DP.lines.length; j++) { if (DP.tok !== tok) return; DP.cur = j; drawLines(); await sayP(DP.lines[j].text, DP.lines[j].who, DP.rate); }
    if (DP.tok !== tok) return;
    DP.tok = null; DP.cur = -1; DP.plays++; $("#lplay").innerHTML = `${ICON.play}<span>Réécouter</span>`;
    if (!DP.trUser && DP.plays === 1) { DP.tr = false; const b = $("#trb"); if (b) b.textContent = "Afficher la traduction"; }
    drawLines(); $("#dpst").textContent = DP.plays === 1 ? "Bien. Deuxième écoute, sans traduction : regardez les cadres Grammaire et Vocabulaire du livre." : `Écouté ${DP.plays} fois. Maintenant, racontez ce que dit le dialogue ↓`;
    blockAction();
  };
  window.dpToggle = () => { if (DP.tok) { dpStop(); $("#lplay").innerHTML = `${ICON.play}<span>Reprendre</span>`; } else playFrom(Math.max(0, DP.cur)); };
  DP.onLine = i => playFrom(i);
  DP.keys = { space: () => dpToggle(), right: () => playFrom(Math.min(DP.lines.length - 1, DP.cur + 1)), left: () => playFrom(Math.max(0, DP.cur - 1)) };
}
// shadowing: original → you (stops by itself when you go quiet) → original, you, original
function setupShadow() {
  const p = phase(); let step = -1, recSecs = 0, lastUrl = null;
  DP.cur = 0;
  const steps = ["Original", "Vous", "Original"];
  DP.ctl = () => `<ol class="seq" aria-label="Séquence">${steps.map((s, j) => `${j ? '<li class="sep" aria-hidden="true">›</li>' : ""}<li class="p ${step > j * 2 || (j === 0 && step >= 1) ? "done" : step === j * 2 || (j === 1 && step === 1) ? "now" : ""}">${s}</li>`).join("")}</ol>
    <div class="row"><span class="status">${step === 1 ? "Enregistrement… " + mmss(recSecs) : step === 5 ? "↵ phrase suivante · R pour refaire" : step === 0 ? "Écoutez…" : step >= 2 ? "Comparez…" : "Appuyez pour commencer"}</span>${micBtn(step === 1, step === 1 ? "Arrêter l'enregistrement" : "Commencer la phrase")}</div>`;
  const sub = () => { const s = $("#dpsub"); if (s) s.textContent = `Passage ${DP.passage} sur 3${DP.passage === 3 ? " · texte caché" : ""} · ${DP.subBase}`; };
  const one = async () => {
    if (DP.passage === 3) DP.coverIdx = new Set(DP.lines.map((_, j) => j)); else DP.coverIdx = null;
    const l = DP.lines[DP.cur]; step = 0; drawLines();
    await sayP(l.text, l.who, p.rate);
    let r = null;
    try { step = 1; recSecs = 0; drawLines(); r = await recordTurn({ maxMs: 4000 + l.text.length * 150, onTick: ms => { const s = Math.floor(ms / 1000); if (s !== recSecs) { recSecs = s; drawLines(); } } }); }
    catch (e) { step = 5; drawLines(); $("#dpl .ln.cur .status").textContent = "Micro indisponible : répétez à voix haute, puis ↵"; return; }
    lastUrl = r.url; step = 2; drawLines(); await sayP(l.text, l.who, p.rate);
    step = 3; drawLines(); await playURL(r.url);
    step = 4; drawLines(); await sayP(l.text, l.who, p.rate);
    step = 5; drawLines(); keepRec(r, "shadow", DP.n, { focus: FOCI[DP.focus][0], line: DP.cur, passage: DP.passage });
    if (RUN_STATS) RUN_STATS.sent++;
  };
  const next = () => {
    if (DP.cur < DP.lines.length - 1) { DP.cur++; step = -1; one(); return; }
    if (DP.passage < 3) { DP.passage++; DP.focus = (DP.focus + 1) % FOCI.length; dpMode("shadow", true); DP.passage = DP.passage; sub(); return; }
    blockAction(); step = -1; DP.cur = -1; drawLines(); $("#dpl").insertAdjacentHTML("afterend", `<p class="good" style="margin:0"><b>Trois passages faits.</b> Bravo — vous pouvez recommencer avec un autre focus.</p>`);
  };
  DP.onMic = () => { if (TURN_STOP) TURN_STOP(); else if (step === -1 || step === 5) one(); };
  DP.onLine = i => { DP.cur = i; step = -1; one(); };
  DP.keys = { enter: next, right: next, r: () => { if (TURN_STOP) TURN_STOP(); else one(); }, left: () => { DP.cur = Math.max(0, DP.cur - 1); step = -1; drawLines(); }, space: () => { const l = DP.lines[DP.cur]; if (l) sayP(l.text, l.who, p.rate); } };
  sub();
}
// role play: the computer reads the other part; you speak yours (covered or visible depending on the phase)
function setupRole() {
  const p = phase(); let round = 1, waiting = false, recSecs = 0;
  const head = () => { const me = round === 2 ? "A" : "B"; $("#rhead").textContent = `Tour ${round} sur 3 · vous jouez ${me}`; $("#rhint").textContent = p.cover(round) ? "Vos répliques sont cachées : parlez de mémoire, le texte apparaît quand vous avez fini." : "Vos répliques sont visibles : lisez-les à voix haute, en regardant le moins possible."; };
  DP.ctl = () => waiting ? `<span class="status">À vous… ${recSecs ? mmss(recSecs) : ""}</span>${micBtn(true, "J'ai fini")}` : "";
  const go1 = async () => {
    const me = round === 2 ? "A" : "B", mine = l => me === "B" ? l.who === "B" : l.who !== "B";
    head(); $("#rgo").disabled = true; $("#rnote").innerHTML = "";
    DP.coverIdx = new Set(p.cover(round) ? DP.lines.map((l, i) => mine(l) ? i : -1).filter(i => i >= 0) : []);
    for (let i = 0; i < DP.lines.length; i++) {
      const l = DP.lines[i]; DP.cur = i; drawLines();
      if (!mine(l)) { await sayP(l.text, l.who, p.rate); continue; }
      waiting = true; recSecs = 0; drawLines();
      try { const r = await recordTurn({ maxMs: 5000 + l.text.length * 180, onTick: ms => { const s = Math.floor(ms / 1000); if (s !== recSecs) { recSecs = s; drawLines(); } } }); keepRec(r, "role", DP.n, { round, line: i }); }
      catch (e) { await new Promise(res => setTimeout(res, 2500 + l.text.length * 80)); }
      waiting = false; DP.coverIdx.delete(i); drawLines();
    }
    DP.cur = -1; drawLines(); if (RUN_STATS) RUN_STATS.rounds++;
    $("#rnote").innerHTML = `<div class="card" style="padding:16px 20px;display:flex;flex-direction:column;gap:10px"><b>Tour ${round} fini. Une chose à améliorer au prochain tour :</b><input type="text" id="rimp" placeholder="ex. : dire « je voudrais » plus vite"></div>`;
    const prev = (S.roleNotes || {})[DP.n]; if (prev && prev.length) $("#rnote").insertAdjacentHTML("beforeend", `<p class="mut">Vos notes : ${prev.slice(-3).map(x => "« " + esc(x.v) + " »").join(" · ")}</p>`);
    $("#rgo").disabled = false; $("#rgo").innerHTML = round < 3 ? `${ICON.play}<span>Tour ${round + 1} · vous jouez ${round === 1 ? "A" : "B"}</span>` : `<span>✓ Trois tours faits</span>`;
    $("#rgo").onclick = () => {
      const v = ($("#rimp") || {}).value; if (v && v.trim()) { S.roleNotes = S.roleNotes || {}; (S.roleNotes[DP.n] = S.roleNotes[DP.n] || []).push({ t: Date.now(), round, v: v.trim() }); save(); }
      if (round < 3) { round++; go1(); } else { (S.roles = S.roles || []).push({ n: DP.n, t: Date.now() }); save(); blockAction(); $("#rnote").innerHTML = `<p class="good"><b>Bravo.</b> Ce jeu de rôle reviendra dimanche.</p>`; $("#rgo").remove(); }
    };
  };
  head(); $("#rgo").onclick = go1;
  DP.onMic = () => { if (TURN_STOP) TURN_STOP(); };
  DP.keys = { enter: () => { const b = $("#rgo"); if (b && !b.disabled) b.click(); else if (TURN_STOP) TURN_STOP(); }, r: () => { if (TURN_STOP) TURN_STOP(); } };
}
// retell 3 / 2 / 1½ (shorter in the first weeks), recorded, with duration and pauses
function setupRetell() {
  const p = phase(), kind = p.retell.mode === "intro" ? "intro" : "retell", res = []; let j = 0, on = false;
  const mark = () => document.querySelectorAll("#tseq .p").forEach(li => { const x = +li.dataset.j; li.className = "p " + (x < j ? "done" : x === j ? "now" : ""); });
  const draw = () => {
    if (!res.length) return;
    const W = 240, H = 64, mx = Math.max(60, ...res.map(x => x.dur)), mp = Math.max(3, ...res.map(x => x.pauses));
    const pts = (f, m) => res.map((x, i) => `${20 + i * 100},${H - 8 - f(x) / m * (H - 16)}`).join(" ");
    $("#tres").innerHTML = `<div class="card" style="padding:16px 20px"><table>${res.map(x => `<tr><td>Tour ${x.round + 1}</td><td>${mmss(x.dur)}</td><td>${x.pauses} pauses · ${x.longPauses} longues</td><td><audio controls src="${x.url}"></audio></td></tr>`).join("")}</table>
      <svg width="${W}" height="${H}" role="img" aria-label="Durée et pauses par tour" style="background:var(--chip);border-radius:8px;margin-top:8px"><polyline fill="none" stroke="${SC.study}" stroke-width="2" points="${pts(x => x.dur, mx)}"/><polyline fill="none" stroke="${SC.output}" stroke-width="2" points="${pts(x => x.pauses, mp)}"/></svg>
      <span class="mut"> <span style="color:${SC.study}">durée</span> · <span style="color:${SC.output}">pauses</span></span></div>`;
  };
  const go1 = async () => {
    if (j >= 3 || on) return; on = true; mark();
    const secs = p.retell.secs[j], btn = () => $("#dpbody .mic");
    const b = btn(); if (b) { b.classList.add("rec"); b.setAttribute("aria-label", "J'ai fini"); }
    countdown(secs, $("#tt"), () => { if (TURN_STOP) TURN_STOP(); });
    try {
      const r = await recordTurn({ maxMs: secs * 1000, silenceMs: 1e9 });
      if (TIMER) { clearInterval(TIMER); TIMER = null; }
      res.push(Object.assign(r, { round: j })); keepRec(r, kind, DP.n, { round: j }); j++; draw();
      if (j === 3) { blockAction(); $("#tres").insertAdjacentHTML("beforeend", `<p class="good"><b>Trois tours.</b> Comparez la durée et les pauses : la dernière version est-elle plus fluide ?</p>`); }
      else $("#tt").textContent = mmss(p.retell.secs[j]);
    } catch (e) { $("#tres").innerHTML = `<p class="badc">Micro indisponible : racontez quand même à voix haute, en suivant le minuteur.</p>`; j++; if (j === 3) blockAction(); }
    on = false; mark(); const b2 = btn(); if (b2) { b2.classList.remove("rec"); b2.setAttribute("aria-label", "Commencer le tour"); }
  };
  mark();
  DP.onMic = () => { if (TURN_STOP) TURN_STOP(); else go1(); };
  DP.keys = { r: () => DP.onMic(), enter: () => DP.onMic() };
}

// ===================== pages built on the engine =====================
window.openComm = (n, planId, mode, k) => {
  setView("comm", mode === "listen" ? "input" : mode === "retell" ? "fluency" : "output");
  const c = COMM.find(x => x.n === n); track("comm", "Communication " + n);
  if (k === undefined || k >= c.dlgs.length) k = sitOfDay(n);
  const sitTabs = c.dlgs.length > 1 ? `<div class="row">${c.dlgs.map((d, j) => `<button type="button" class="pill ${j === k ? "on" : ""}" onclick="openComm(${n},null,'${mode || "listen"}',${j})">${(S.dlgDone || {})[n + "." + j] ? "✓ " : ""}Situation ${j + 1} · ${esc(d.sit)}</button>`).join("")}</div>` : "";
  const audioSrc = c.dlgs.length > 1 ? `audio/comm/${String(n).padStart(2, "0")}-${k + 1}.mp3` : c.bookAudio;
  const chap = c.grammar.map(g => { const l = LESSONS.find(x => x.n === g), done = isDone("lesson:" + l.id);
    return `<a href="#" onclick="openLesson('${l.id}');return false" class="chip" style="${done ? "background:#DFF3E7" : ""}">Grammaire ${g} · ${done ? "apprise" : "à mémoriser comme phrase"}</a>`; }).join("");
  const tex = c.texTopics.map(t => `<a class="chip" target="_blank" rel="noopener" href="${TEX}?s=${encodeURIComponent(t)}">Tex : ${esc(t)}</a>`).join("");
  const voc = c.vocabUnits.map(u => `<a href="#" class="chip" onclick="openUnit(${u});return false">Vocabulaire ${u}</a>`).join("");
  const focus = FOCUS[Math.max(0, weekOf(dstr())) % FOCUS.length];
  const info = `<div class="card lessoninfo" style="display:flex;flex-direction:column;gap:10px">
    <p class="mut" style="margin:0">Point de correction de la semaine : <b style="color:var(--fg)">${esc(focus)}</b></p>
    <div><span class="chip">Livre p. ${c.bookPages[0]}–${c.bookPages[1]}</span><span class="chip">${c.level}</span>${chap}${tex}${voc}<a class="chip" target="_blank" rel="noopener" href="${FI_BASE}${String(c.fiChapter).padStart(2, "0")}/">FI ch. ${String(c.fiChapter).padStart(2, "0")}</a></div>
    ${sitTabs}
    <div id="bookaud" style="display:none"><p class="mut" style="margin:0 0 4px">Enregistrement du livre (${esc(audioSrc)}) — à écouter en lisant votre livre :</p><audio controls preload="metadata" src="${audioSrc}" style="width:100%" oncanplay="$('#bookaud').style.display=''" onerror="window.bookAudioFallback&&bookAudioFallback(this,'${audioSrc}')"></audio></div>
    <p class="mut" style="margin:0;font-size:14px">Ce dialogue est une version réécrite pour le jeu de rôle ; le texte original est dans votre livre.</p></div>`;
  dialoguePage({ n, k, sub: `Communication ${n} · ${c.title} · ${c.dlgs[k].sit}`, subBase: `Communication ${n} · ${c.title}`, info, lines: c.dlgs[k].lines, ex: c.ex, pages: c.bookPages.join("–"), mode: mode || "listen" });
  DP.sit = k;
  if (!RUN_ACTIVE) view.insertAdjacentHTML("beforeend", `<div class="card"><h3>Jeu de rôle du livre</h3><p style="margin:0">${esc(c.task)}</p></div>
    <div class="row"><button class="b ok" onclick="doneDialogue(${n},${k});go('comm')">✓ Dialogue terminé</button>${n < 40 ? `<button class="b s" onclick="openComm(${n + 1})">Leçon suivante →</button>` : ""}</div>`);
};
// A2 grammar block: the grammar of today's dialogue (chapters already studied, Tex for new points) + conjugation
window.openDialogueGrammar = n => {
  setView("today", "study"); const c = COMM.find(x => x.n === n);
  view.innerHTML = `<div class="card"><h1>Grammaire du dialogue ${n} · ${esc(c.title)}</h1>
   <p>Points de grammaire de cette leçon (colonne « Grammaire » du livre, p. ${c.bookPages[0]}–${c.bookPages[1]}) :</p>
   <ul>${c.grammar.map(g => { const l = LESSONS.find(x => x.n === g); return `<li><a href="#" onclick="openLesson('${l.id}');return false">Grammaire progressive ${g} · ${esc(l.title)}</a></li>`; }).join("")}
   ${c.texTopics.map(t => `<li>Tex's French Grammar : <a target="_blank" rel="noopener" href="${TEX}?s=${encodeURIComponent(t)}">${esc(t)}</a> — lisez l'explication et écoutez le petit dialogue.</li>`).join("")}</ul>
   <div class="row"><button class="b" onclick="openConj()">Conjugaison (12)</button><button class="b s" onclick="startReview('bilan:${Math.min(7, Math.floor(n / 5))}')">Révision de grammaire</button></div></div>`;
  blockAction();
};
window.openRelisten = () => {
  setView("today", "fluency");
  const recent = PLAN.filter(p => p.type === "comm" && (isDone(p.id) || Object.keys(S.dlgDone || {}).some(k => k.startsWith(p.target + "."))) && p.target !== lessonOfDay()).slice(-3).map(p => p.target);
  const list = recent.length ? recent : [Math.max(1, lessonOfDay() - 1)];
  view.innerHTML = `<h1>Réécoute rapide</h1><p class="sub">Des dialogues déjà travaillés, plus vite : ×1,15 puis ×1,3. Le matériel est connu : on entraîne la vitesse.</p>
   <div class="card">${list.map(n => { const c = COMM.find(x => x.n === n); return `<div class="todo"><div style="flex:1"><b>${n}. ${esc(c.title)}</b></div><button class="b s" onclick="relisten(${n},1.15)">×1,15</button><button class="b s" onclick="relisten(${n},1.3)">×1,3</button></div>`; }).join("")}</div>`;
};
window.relisten = async (n, rate) => { const c = COMM.find(x => x.n === n); speechSynthesis.cancel(); for (const d of c.dlgs) for (const l of d.lines) await sayP(l.text, l.who, rate); blockAction(); };
window.openRFI = () => {
  setView("today", "input");
  view.innerHTML = `<h1>Actualité en français facile</h1><div class="card"><p>Ouvrez le <a target="_blank" rel="noopener" href="https://francaisfacile.rfi.fr/fr/podcasts/journal-en-fran%C3%A7ais-facile/">Journal en français facile (RFI)</a> et écoutez 10 minutes, avec la transcription si possible.</p>
   <p>Puis racontez <b>une</b> information à voix haute : ${recWidget("rfirec")}</p><div class="row"><button class="b s" onclick="logMinutes('input',10)">+ 10 min d'écoute</button></div></div>`;
  REC_CTX = { kind: "resume", unit: "rfi" };
};
const EXAM_GOAL = { A1: 15, A2: 17 };
window.openExam = (lvl, planId) => {
  setView("today", "input");
  const e = (S.exams || {})[lvl] || {};
  view.innerHTML = `<h1>Contrôle DELF ${lvl}</h1><div class="card"><p>Faites l'<b>écoute</b> et la <b>lecture</b> d'un sujet officiel : <a target="_blank" rel="noopener" href="https://www.france-education-international.fr/diplome/delf-tout-public/niveau-${lvl.toLowerCase()}">France Éducation international · DELF ${lvl} (exemples de sujets)</a>. Chronométrez-vous comme à l'examen.</p>
   <div class="row"><label>Compréhension de l'oral <input type="text" id="ex1" value="${e.listen ?? ""}" style="width:70px"> / 25</label><label>Compréhension des écrits <input type="text" id="ex2" value="${e.read ?? ""}" style="width:70px"> / 25</label></div>
   <p class="mut">Objectif : ${EXAM_GOAL[lvl]} sur 25 ou plus dans chaque partie.</p><button class="b ok" id="exs">Enregistrer mes scores</button></div>`;
  $("#exs").onclick = () => { S.exams = S.exams || {}; S.exams[lvl] = { listen: +$("#ex1").value || 0, read: +$("#ex2").value || 0, t: Date.now() }; if (planId) S.todo[planId] = { done: true, at: Date.now() }; save(); blockAction(); $("#exs").textContent = "✓ Enregistré"; };
};

// ===================== weekly review (Sunday) =====================
window.openWeekly = async () => {
  setView("today", null);
  const ws = weekStart(), days = Array.from({ length: 7 }, (_, i) => dstr(ws + i * DAY + 3e6));
  const mins = STRANDS.map(([k], i) => [["Étude", "Écoute", "Production", "Fluidité"][i], days.reduce((a, d) => a + strandMin(d, k), 0), k]);
  const newW = Object.values(S.cards).filter(c => c.first >= ws).length;
  const nw = studyDays(dAdd(dstr(), 1), dAdd(dstr(), 7)), next = PLAN.filter(p => nw.includes(p.date) && ["comm", "lesson"].includes(p.type));
  REC_CTX = { kind: "intro", unit: null };
  view.innerHTML = `<h1>Bilan de la semaine</h1>
   <div class="stats">${mins.map(([l, m, k]) => `<div class="stat"><div class="k" style="color:${SC[k]}">${l}</div><b>${m} min</b></div>`).join("")}<div class="stat"><div class="k">Nouveaux mots et phrases</div><b>${newW}</b></div></div>
   <div class="card"><h2>Ma voix cette semaine</h2><p>Présentez-vous en une minute, comme le premier jour (on compare dans Mes progrès) : ${recWidget("wkintro")}</p>
    <h3>Premier et dernier récit de la semaine</h3><div id="wkrec" class="mut">Chargement…</div></div>
   <div class="card"><h2>La semaine prochaine</h2>${next.map(p => `<div class="todo"><span class="mut" style="min-width:150px">${esc(capit(fmtDate(p.date)))}</span><span>${esc(p.title)}</span></div>`).join("") || "<p class='mut'>—</p>"}</div>`;
  blockAction();
  try {
    const recs = (await recAll()).filter(r => r.kind === "retell" && r.t >= ws);
    const el = $("#wkrec"); if (!el) return;
    el.innerHTML = recs.length ? [recs[0], recs[recs.length - 1]].filter((r, i, a) => i === 0 || r !== a[0]).map(r => `<p>${new Date(r.t).toLocaleDateString("fr-FR")} · dialogue ${r.unit} · ${mmss(r.dur)} · ${r.longPauses ?? r.pauses} longues pauses<br><audio controls src="${URL.createObjectURL(r.blob)}"></audio></p>`).join("") : "Pas encore de récit enregistré cette semaine.";
  } catch (e) { }
};

// ===================== Mes progrès =====================
const HM = ["#EBEDF0", "#C6DBF7", "#8DB6EE", "#4A86D9", "#1F5BB0"];
const hmLevel = m => m <= 0 ? 0 : m < 30 ? 1 : m < 90 ? 2 : m < 150 ? 3 : 4;
const HM_WORD = ["pas d'activité", "version courte", "journée partielle", "bonne journée", "journée complète"];
const dayMin = d => Math.round(((S.daily[d] || {}).secs || 0) / 60);
window.hmSel = async d => {
  document.querySelectorAll(".hm .cells button").forEach(b => b.classList.toggle("sel", b.dataset.d === d));
  const el = $("#hmsel"); if (!el) return;
  if (d < cal().start) { el.innerHTML = `<b>${dayLong(d)}</b> · pas encore commencé, début le 28 octobre`; return; }
  const m = dayMin(d), r = (S.run || {})[d], cards = S.sessions.filter(s => dstr(s.start) === d).reduce((a, s) => a + (s.type === "review" ? s.total : 0), 0);
  el.innerHTML = `<b>${dayLong(d)}</b> · ${m} min · ${HM_WORD[hmLevel(m)]}${cards ? ` · ${cards} carte${cards > 1 ? "s" : ""}` : ""}
    ${r && r.blocks.some(b => b.done) ? `<br><span class="mut">${r.blocks.filter(b => b.done).map(b => esc(blkName(b.k)) + (b.res && b.res !== "fait" ? " (" + esc(b.res) + ")" : "")).join(" · ")}</span>` : ""}<span id="hmrec"></span>`;
  try { const recs = (await recAll()).filter(x => x.date === d); const rr = $("#hmrec"); if (rr && recs.length) rr.innerHTML = `<br>${recs.slice(-6).map(x => `<span class="mut">${REC_KIND[x.kind] || x.kind} ${mmss(x.dur || 0)}</span> <audio controls preload="none" src="${URL.createObjectURL(x.blob)}" style="height:32px;vertical-align:middle"></audio>`).join(" ")}`; } catch (e) { }
};
function heatmapHTML() {
  const end = dstr(), from = dAdd(end, -89);
  const d0 = new Date(dParse(from)); const gs = dAdd(from, -((d0.getDay() + 6) % 7)); // Monday on or before
  const de = new Date(dParse(end)); const ge = dAdd(end, (7 - de.getDay()) % 7);   // Sunday on or after
  const cells = [], months = []; let col = 0, lastM = -1;
  for (let d = gs; d <= ge; d = dAdd(d, 1)) {
    const dt = new Date(dParse(d));
    if (dt.getDay() === 1) { const m = dt.getMonth(); months.push(m !== lastM ? dt.toLocaleDateString("fr-FR", { month: "short" }) : ""); lastM = m; col++; }
    const inR = d >= from && d <= end, m = dayMin(d);
    cells.push(inR ? `<button type="button" data-d="${d}" onclick="hmSel('${d}')" aria-label="${esc(dayLong(d))}, ${m} minutes" title="${esc(dayLong(d))} · ${m} min" style="background:${HM[hmLevel(m)]}"></button>` : `<span style="width:20px;height:20px"></span>`);
  }
  return `<section class="card" aria-label="Activité des 90 derniers jours" style="display:flex;flex-direction:column;gap:16px">
    <div class="row" style="justify-content:space-between"><h2 style="margin:0">90 derniers jours</h2><div class="row" style="gap:6px;font-size:13px;color:var(--mut)"><span>0 min</span>${HM.map(c => `<span style="width:16px;height:16px;border-radius:4px;background:${c}"></span>`).join("")}<span>150 min et plus</span></div></div>
    <div style="overflow-x:auto"><div class="hm"><div class="rows"><span></span><span>lun.</span><span></span><span>mer.</span><span></span><span>ven.</span><span></span><span>dim.</span></div>
      <div style="display:flex;flex-direction:column;gap:4px"><div class="months">${months.map(m => `<span>${m}</span>`).join("")}</div><div class="cells">${cells.join("")}</div></div></div></div>
    <p class="hmsel" id="hmsel" aria-live="polite"></p></section>`;
}
function pillarsHTML() {
  const days = Array.from({ length: 14 }, (_, i) => dstr(Date.now() - i * DAY));
  const tot = STRANDS.map(([k]) => [k, days.reduce((a, d) => a + (((S.daily[d] || {}).st || {})[k] || 0), 0)]), sum = tot.reduce((a, x) => a + x[1], 0) || 1;
  return `<section class="card" aria-label="Équilibre des quatre piliers" style="flex:1 1 420px;min-width:0;display:flex;flex-direction:column;gap:14px">
    <div><h2 style="margin:0">Équilibre des quatre piliers</h2><p class="mut" style="margin:0;font-size:14px">14 derniers jours · la ligne marque 25 %</p></div>
    ${tot.map(([k, v]) => { const pct = Math.round(v / sum * 100); return `<div style="display:flex;flex-direction:column;gap:4px"><div class="row" style="justify-content:space-between;font-size:15px"><span>${STR_FR[k]}</span><span class="mut" style="font-variant-numeric:tabular-nums">${pct} %</span></div>
      <div style="position:relative;height:10px;border-radius:5px;background:var(--track)"><div style="height:10px;border-radius:5px;width:${pct}%;background:${SC[k]}"></div><div class="mark25"></div></div></div>`; }).join("")}</section>`;
}
const VOICE_A = {};
window.playVoice = (id, btn) => {
  const a = VOICE_A[id]; if (!a) return;
  Object.values(VOICE_A).forEach(x => { if (x !== a) x.pause(); });
  if (a.paused) { a.currentTime = 0; a.play(); btn.innerHTML = ICON.pause; a.onended = () => btn.innerHTML = ICON.play; } else { a.pause(); btn.innerHTML = ICON.play; }
};
async function voiceCompare() {
  const el = $("#voicebox"); if (!el) return;
  try {
    const recs = await recAll(); let pool = recs.filter(r => r.kind === "intro"); if (pool.length < 1) pool = recs.filter(r => r.kind === "talk");
    if (!pool.length) { el.innerHTML = `<p class="mut">Pas encore d'enregistrement. Le premier « Me présenter » se fait dans le bloc de la semaine 0, puis chaque dimanche.</p>`; return; }
    const a = pool[0], b = pool[pool.length - 1], row = (r, now, label) => { VOICE_A[r.id] = new Audio(URL.createObjectURL(r.blob)); const lp = r.longPauses ?? r.pauses ?? 0;
      return `<div class="voice ${now ? "now" : ""}"><button type="button" onclick="playVoice('${r.id}',this)" aria-label="Écouter l'enregistrement du ${esc(dayShort(r.date))}">${ICON.play}</button><div style="display:flex;flex-direction:column"><span style="font-weight:600">${esc(label)}</span><span class="mut" style="font-size:14px">${mmss(r.dur || 0)} · ${lp ? lp + " longue" + (lp > 1 ? "s" : "") + " pause" + (lp > 1 ? "s" : "") : "aucune longue pause"}</span></div></div>`; };
    el.innerHTML = row(a, false, `${dayShort(a.date)} · jour ${studyDays(cal().start, a.date).length || 1}`) + (b !== a ? row(b, true, `${dayShort(b.date)}${b.date === dstr() ? " · aujourd'hui" : ""}`) : "");
  } catch (e) { el.innerHTML = `<p class="mut">Enregistrements indisponibles dans ce navigateur.</p>`; }
}
function renderProgress() {
  const pr = projection(), t = timeStats(), st = streak(), ex = S.exams || {};
  const nextExam = PLAN.filter(p => p.type === "exam").sort((a, b) => a.date < b.date ? -1 : 1).find(p => !isDone(p.id)) || PLAN.filter(p => p.type === "exam").pop();
  const daysTo = Math.round((dParse(nextExam.date) - dParse(dstr())) / DAY), lv = nextExam.target, sc = ex[lv];
  const conj = Object.entries(S.conj || {}).filter(([, v]) => v.n >= 2).map(([k, v]) => [k.replace("|", " · ").replace(/· (\w+)$/, (m, x) => "· " + TENSES[x][0]), v.ok / v.n]).sort((a, b) => a[1] - b[1]).slice(0, 6);
  const bad = ALL.filter(id => card(id) && card(id).lapses).sort((a, b) => card(b).lapses - card(a).lapses).slice(0, 8);
  const w10 = (S.writing || []).filter(x => x.mode === "fluency").slice(-12), wmax = Math.max(50, ...w10.map(x => x.words));
  const nextDays = studyDays(dstr(), dAdd(dstr(), 9)).slice(0, 7);
  view.innerHTML = `<h1>Mes progrès</h1>${heatmapHTML()}
   <div class="stats"><div class="stat"><div class="k">Série</div><b>${st} jour${st > 1 ? "s" : ""}</b></div><div class="stat"><div class="k">Temps total</div><b>${fmtDur(t.total)}</b></div>
    <div class="stat"><div class="k">Fin du ${pr.phase} prévue</div><b>${pr.done ? "terminé" : esc(dayShort(pr.date))}</b></div></div>
   <div class="row" style="gap:16px;align-items:stretch">${pillarsHTML()}
    <section class="card" aria-label="Mes enregistrements" style="flex:1 1 420px;min-width:0;display:flex;flex-direction:column;gap:14px"><div><h2 style="margin:0">Ma voix, jour 1 et aujourd'hui</h2><p class="mut" style="margin:0;font-size:14px">Le même exercice : me présenter en français</p></div>
     <div id="voicebox" style="display:flex;flex-direction:column;gap:12px"><p class="mut">Chargement…</p></div><a href="#" onclick="go('recs');return false" style="font-size:15px">Tous mes enregistrements</a></section></div>
   <section class="card" aria-label="Contrôle DELF" style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;padding:20px 32px">
    <div><h2 style="margin:0">Contrôle DELF ${lv} · ${esc(fmtDate(nextExam.date))}</h2><p class="mut" style="margin:0;font-size:15px">${sc ? `Score : ${sc.listen} sur 25 à l'écoute et ${sc.read} sur 25 à la lecture (objectif ${EXAM_GOAL[lv]})` : `Objectif : ${EXAM_GOAL[lv]} sur 25 à l'écoute et ${EXAM_GOAL[lv]} sur 25 à la lecture`}</p></div>
    <span class="chip" style="margin:0">${isDone(nextExam.id) ? "fait" : daysTo > 0 ? `Dans ${daysTo} jour${daysTo > 1 ? "s" : ""}` : "Aujourd'hui"}</span></section>
   ${Object.keys(ex).length ? `<p class="mut" style="margin:0">Scores enregistrés : ${Object.entries(ex).map(([l, e]) => `DELF ${l} — écoute ${e.listen}/25 · lecture ${e.read}/25`).join(" · ")}</p>` : ""}
   <div class="row" style="gap:16px;align-items:stretch">
    <section class="card" style="flex:1 1 420px;min-width:0"><h2>À retravailler</h2>
     ${conj.length ? `<p class="mut" style="margin:0 0 6px">Conjugaisons</p>${conj.map(([k, r]) => `<div class="row" style="justify-content:space-between"><span>${esc(k)}</span><span class="mut">${Math.round(r * 100)} %</span></div>`).join("")}` : ""}
     ${bad.length ? `<p class="mut" style="margin:12px 0 6px">Cartes</p>${bad.map(id => { const it = ITEMS[id]; return `<div class="row" style="justify-content:space-between"><span>${it.kind === "v" ? esc(it.v.fr) : esc(it.q)}</span><span class="mut">${card(id).lapses} erreur${card(id).lapses > 1 ? "s" : ""}</span></div>`; }).join("")}<p><button class="b s" onclick="startReview('mistakes')">Revoir mes erreurs</button></p>` : ""}
     ${!conj.length && !bad.length ? `<p class="mut">Rien pour l'instant.</p>` : ""}</section>
    <section class="card" style="flex:1 1 420px;min-width:0"><h2>Écriture rapide</h2><p class="mut" style="margin:0">Mots écrits en 10 minutes</p>
     ${w10.length > 1 ? `<svg width="100%" height="90" viewBox="0 0 ${Math.max(2, w10.length - 1) * 30 + 20} 90" preserveAspectRatio="none" role="img" aria-label="Mots par séance" style="background:var(--chip);border-radius:8px;margin-top:8px"><polyline fill="none" stroke="${SC.fluency}" stroke-width="2" points="${w10.map((x, i) => `${10 + i * 30},${82 - x.words / wmax * 72}`).join(" ")}"/></svg><p class="mut">${w10.map(x => x.words).join(" → ")}</p>` : `<p class="mut">Le mardi et le jeudi, à la place de la réécoute rapide.</p>`}</section></div>
   ${weeklyGoals()}
   <section class="card"><h2>Mon plan · 7 prochains jours d'étude</h2><p class="mut" style="margin:0">Calculé à partir des dates de fin (A1 : ${esc(fmtDate(cal().a1End))}, A2 : ${esc(fmtDate(cal().a2End))}) et recalculé chaque jour.</p>
    ${nextDays.map(d => { const items = PLAN.filter(p => p.date === d); return items.length ? `<details ${d === dstr() ? "open" : ""}><summary><b>${esc(capit(fmtDate(d)))}</b> <span class="mut">· ${items.length}</span></summary>${items.map(planItemHTML).join("")}</details>` : ""; }).join("")}</section>
   <details class="card"><summary><b>Historique des séances</b></summary><table>${S.sessions.slice(-25).reverse().map(s => `<tr><td>${new Date(s.start).toLocaleString("fr-FR")}</td><td>${esc(s.label)}</td><td>${Math.max(1, Math.round((s.end - s.start) / 6e4))} min</td><td>${s.total ? s.correct + "/" + s.total : "—"}</td></tr>`).join("")}</table></details>`;
  hmSel(dstr()); voiceCompare();
}

// ===================== recordings log (Outils → Enregistrements) =====================
window.renderRecs = async () => {
  view.innerHTML = `<h1>Mes enregistrements</h1><div class="card"><p class="mut" style="margin-top:0">Gardés dans ce navigateur (IndexedDB), même après rechargement. Exportez-les avec votre sauvegarde.</p>
   <div class="row"><button class="b s" id="rexp">Exporter les enregistrements</button><label class="b s" style="cursor:pointer;display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:12px;border:1px solid var(--bd2)">Importer<input type="file" id="rimpf" accept=".json" hidden></label><span id="rmsg" class="mut"></span></div></div>
   <div class="card"><h2>Premier jour et aujourd'hui</h2><div id="rcmp" class="mut">Chargement…</div></div><div id="rlist" style="display:flex;flex-direction:column;gap:24px"></div>`;
  let recs = [];
  try { recs = await recAll(); } catch (e) { $("#rcmp").textContent = "IndexedDB indisponible dans ce navigateur."; return; }
  if (!$("#rlist")) return;
  const url = r => URL.createObjectURL(r.blob), row = r => `<tr><td>${new Date(r.t).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</td><td>${REC_KIND[r.kind] || r.kind}</td><td>${r.unit ?? ""}</td><td>${mmss(r.dur || 0)}${r.pauses != null ? " · " + r.pauses + " pauses" : ""}</td><td><audio controls preload="none" src="${url(r)}"></audio></td></tr>`;
  const base = recs.filter(r => r.kind === "intro"), pool = base.length >= 2 ? base : recs;
  $("#rcmp").innerHTML = pool.length >= 2 ? `<p><b>${new Date(pool[0].t).toLocaleDateString("fr-FR")}</b> ${REC_KIND[pool[0].kind]} <audio controls src="${url(pool[0])}"></audio></p><p><b>${new Date(pool[pool.length - 1].t).toLocaleDateString("fr-FR")}</b> ${REC_KIND[pool[pool.length - 1].kind]} <audio controls src="${url(pool[pool.length - 1])}"></audio></p>` : "Il faut au moins deux enregistrements.";
  const byDay = {}; recs.slice().reverse().forEach(r => (byDay[r.date] = byDay[r.date] || []).push(r));
  $("#rlist").innerHTML = Object.entries(byDay).map(([d, rs]) => `<div class="card"><h2>${esc(dayLong(d))} <span class="mut">· ${rs.length}</span></h2><table>${rs.map(row).join("")}</table></div>`).join("") || `<div class="card mut">Aucun enregistrement pour l'instant.</div>`;
  $("#rexp").onclick = async () => {
    const out = [];
    for (const r of recs) out.push(Object.assign({}, r, { blob: undefined, type: r.blob.type, data: await new Promise(res => { const f = new FileReader(); f.onload = () => res(f.result.split(",")[1]); f.readAsDataURL(r.blob); }) }));
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify({ v: 1, recs: out })], { type: "application/json" })); a.download = `francais-enregistrements-${dstr()}.json`; a.click();
  };
  $("#rimpf").onchange = async e => {
    try { const j = JSON.parse(await e.target.files[0].text()); for (const r of j.recs) { const bin = atob(r.data), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); await recSave(Object.assign({}, r, { data: undefined, blob: new Blob([u], { type: r.type }) })); } renderRecs(); }
    catch (err) { $("#rmsg").textContent = "Fichier invalide."; }
  };
};
window.addUnknown = async (el, w) => { await loadDict(); const r = lookup(w).entries[0]; if (!r) { el.textContent = w + " (introuvable)"; return; } await addMyWord(r.e.w); el.textContent = "✓ " + r.e.w; };

// ===================== keyboard shortcuts =====================
document.addEventListener("keydown", e => {
  if (e.target.closest("input, textarea, select")) return;
  const k = e.key, keys = DP && $("#dpbody") ? DP.keys || {} : {};
  if (k === " " && keys.space) { e.preventDefault(); keys.space(); return; }
  if (k === "Enter" && keys.enter) { e.preventDefault(); keys.enter(); return; }
  if ((k === "r" || k === "R") && keys.r) { keys.r(); return; }
  if (k === "ArrowRight" && keys.right) { keys.right(); return; }
  if (k === "ArrowLeft" && keys.left) { keys.left(); return; }
  if (/^[1-4]$/.test(k)) { const b = document.querySelector(`#ans [data-g="${+k - 1}"]`); if (b) b.click(); return; }
  if (k === "r" || k === "R") { const b = document.querySelector("button[onclick^=\"recToggle\"]"); if (b) b.click(); }
});

go("today");
