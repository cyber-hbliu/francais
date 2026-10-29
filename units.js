"use strict";
// « Ma leçon » : Assimil — French (With Ease), one lesson a day, 100 lessons (assimil.js), with the material of Français
// interactif (UT Austin) on the same topic. Assimil gives the order: lessons 1–49 to understand and repeat (receptive phase),
// then from lesson 50 the second wave, each day a lesson of 49 days before, from the English back to French (productive phase).
// Paul Nation gives the balance inside a lesson: eight steps, about a quarter of the time for each of the four strands.
const NU = AS_N;
window.PARCOURS = Array.from({ length: NU }, (_, i) => ({ k: i + 1, g: [], c: [], v: [], d: 1 })); // one study day per lesson
const U = k => Object.assign({ k, fi: FI_OF[k] || { voc: [], pho: [], listen: [] }, w2: wave2Of(k) }, AS[k]);
window.curUnit = () => Math.min(NU, Math.max(1, S.cur || 1));
// what the conjugation and number tools open with: the lesson where Assimil brings each tense in
// (keys: the tense numbers of french.js; the futur proche at 17, the passé composé at 29, être at 36, the futur at 53, the imparfait at 59)
const AS_GRAM = { 4: 1, 28: 15, 43: 17, 44: 29, 45: 29, 46: 36, 47: 59, 48: 53 };
window.UNIT_OF = { g: new Proxy({}, { get: (t, n) => AS_GRAM[n] || 999 }), c: {},
  v: new Proxy({}, { get: (t, u) => /^a\d+$/.test(u) ? +String(u).slice(1) : /^fi\d+$/.test(u) ? +String(u).slice(2) : u === "0" || u === 0 ? 1 : 999 }) };

// ---------- the eight steps (minutes for one lesson a day, about an hour) ----------
const STEPS = [
  ["ecoute", "input", 10, "Écouter la leçon", "Deux fois sans le texte, puis avec le texte français, puis avec la traduction : tout comprendre."],
  ["fi", "input", 5, "Français interactif", "Les mots du même thème, enregistrés par des francophones, et une écoute de FI."],
  ["notes", "study", 5, "Notes et prononciation", "Les notes du livre sous le dialogue, la prononciation, la note culturelle."],
  ["repeter", "study", 3, "Répéter phrase par phrase", "L'enregistrement s'arrête après chaque phrase : répétez à voix haute, en imitant."],
  ["exos", "study", 4, "Exercices 1 et 2", "Traduire les cinq phrases, puis compléter les cinq phrases à trous, avec le corrigé."],
  ["cartes", "study", 3, "Cartes", "Les mots de la leçon (le lexique du livre) : 15 à 20 nouvelles par jour, avec celles des leçons d'avant."],
  ["produire", "output", 15, "Parler et écrire", "Redire le dialogue en français à partir de la traduction, puis 3 à 5 phrases écrites, corrigées."],
  ["fluide", "fluency", 15, "Fluidité", "Seulement du connu, plus vite : les leçons d'avant en accéléré, puis raconter 3/2/1½."],
];
const STRAND_FR = { study: "Étude de la langue", input: "Écoute et lecture", output: "Production", fluency: "Fluidité" };
// a revision lesson has no exercises; its « notes » are the revision text, its dialogue the review dialogue
const stepsOf = k => STEPS.filter(([s]) => !(s === "exos" && isRevision(k)));
const stepMin = (k, m) => m;
const stepLabel = (k, s, label) => s === "notes" && isRevision(k) ? "La révision de la semaine" : s === "produire" && wave2Of(k) ? `Deuxième vague : leçon ${wave2Of(k)}, et écrire` : label;
const stepHint = (k, s, hint) => s === "notes" && isRevision(k) ? "Le texte de révision : les points de grammaire des six leçons, puis le dialogue de révision."
  : s === "produire" && wave2Of(k) ? `La traduction de la leçon ${wave2Of(k)} : vous la redites et l'écrivez en français, puis vous comparez avec le livre.` : hint;
// the lesson's cards: the words of the book's lexicon that appear in this lesson for the first time
window.unitWordIds = k => ALL.filter(id => { const it = ITEMS[id]; return it.kind === "v" && it.unit === "a" + k; });
const fiWordIds = k => ALL.filter(id => { const it = ITEMS[id]; return it.kind === "v" && it.unit === "fi" + k; });
window.wordOrder = (a, b) => rankOf(a) - rankOf(b);
const passed = id => card(id) && card(id).reps >= 1 || isMature(id);
function stepDone(k, s) {
  if ((S.ustep || {})[k + ":" + s]) return true;
  if (s === "cartes") { const ids = unitWordIds(k); return ids.length > 0 && ids.filter(passed).length >= ids.length * 0.8; }
  if (s === "produire") return !!((S.uwrite || {})[k] || {}).rw;
  return false;
}
const unitPct = k => { const st = stepsOf(k); return st.filter(([s]) => stepDone(k, s)).length / st.length; };
const stepSecs = (k, s) => (S.stepSecs || {})[k + ":" + s] || 0;
window.tickStep = (k, s, v) => { S.ustep = S.ustep || {}; if (v) S.ustep[k + ":" + s] = Date.now(); else delete S.ustep[k + ":" + s]; save(); renderHome(); };
window.setUnit = k => { S.cur = Math.min(NU, Math.max(1, +k)); save(); go("today"); };
// the step being worked on: its time goes to its strand (app.js tick), whatever page it opens
window.STEP = null;
window.stepFinish = () => { if (STEP) { S.ustep = S.ustep || {}; S.ustep[STEP.k + ":" + STEP.s] = Date.now(); save(); } };
const stepEnd = (k, s) => `<div class="row" style="margin-top:8px"><button class="b ok" onclick="tickStep(${k},'${s}',true);go('today')">✓ Étape terminée</button><button class="b s" onclick="go('today')">← Ma leçon</button></div>`;
window.doStep = (k, s) => {
  const st = STEPS.find(x => x[0] === s);
  go("today"); // leaves any activity running
  if (s === "ecoute") asListen(k);
  else if (s === "fi") asFI(k);
  else if (s === "notes") asNotes(k);
  else if (s === "repeter") asRepeat(k);
  else if (s === "exos") asExos(k);
  else if (s === "cartes") { WU = k; go("uwords"); }
  else if (s === "produire") unitWrite(k);
  else if (s === "fluide") unitFluency(k);
  STEP = { k, s, strand: st[1], t: Date.now() };
};
// new cards: lessons reached so far (the current one once its dialogue has been heard), mixed across lessons, and at most
// 6 a day from each lesson first (the day's total, 15–20, is set by newQuota), so that a lesson's words are spread over several days
window.parcoursNew = () => {
  const cur = curUnit(), t0 = new Date().setHours(0, 0, 0, 0), lists = [];
  for (let k = 1; k <= cur; k++) {
    if (k === cur && k > 1 && !stepDone(k, "ecoute")) break;
    const ids = unitWordIds(k), today = ids.filter(id => card(id) && card(id).first >= t0).length;
    lists.push({ ids: ids.filter(id => !card(id)).sort(wordOrder), left: Math.max(0, 6 - today) });
  }
  const out = []; let more = true;
  lists.reverse(); // the current lesson first
  while (more) { more = false; for (const l of lists) if (l.left > 0 && l.ids.length) { out.push(l.ids.shift()); l.left--; more = true; } }
  // then the rest, so that the day's total (newQuota: 15–20) is reached even when a single lesson has new words
  for (const l of lists) out.push(...l.ids);
  return out;
};

// ---------- exercise sheets (Assimil's exercise 2, the FI lists) ----------
window.exSheet = (key, items, title) => {
  const A = S.exAns || {}; let inst = "";
  return `<div class="exs">${title ? `<h4>${esc(title)}</h4>` : ""}${items.map(([q, a, i], j) => { const k = key + "." + j, v = A[k] || "";
    const head = i && i !== inst ? `<p class="exi">${esc(inst = i)}</p>` : "";
    return head + `<div class="exq"><span>${hl(q)}</span><input type="text" value="${esc(v)}" data-k="${k}" data-a="${esc(a || "")}" oninput="exSave(this)" onkeydown="if(event.key==='Enter')exCheck(this)" autocomplete="off" autocapitalize="off" aria-label="Votre réponse">
      <button class="b s" onclick="exCheck(this.previousElementSibling)">Vérifier</button><span class="exr"></span></div>`; }).join("")}</div>`;
};
window.exSave = el => { S.exAns = S.exAns || {}; S.exAns[el.dataset.k] = el.value; clearTimeout(exSave.t); exSave.t = setTimeout(save, 600); };
window.exCheck = el => {
  const a = el.dataset.a, r = el.parentNode.querySelector(".exr");
  if (!a) { r.innerHTML = `<span class="mut">→ comparez avec le corrigé du livre</span>`; return; }
  const ok = normAns(el.value) === normAns(a) || stripAcc(normAns(el.value)) === stripAcc(normAns(a));
  r.innerHTML = ok ? `<span class="good">✓</span>` : `<span class="badc">→ ${esc(a)}</span>`;
};

// ---------- the recording of a lesson: audio/assimil on this computer, else the private audio repository (sync.js) ----------
const pad3 = k => String(k).padStart(3, "0");
window.asAudio = (k, id, rate) => { const src = `audio/assimil/${pad3(k)}.m4a`;
  return `<audio ${id ? `id="${id}"` : ""} controls preload="none" src="${src}" style="width:100%" ${rate ? `onplay="this.playbackRate=${rate}"` : ""} onerror="window.bookAudioFallback&&bookAudioFallback(this,'${src}')"></audio>`; };
const rateBtns = id => `<span class="row">${[0.8, 1, 1.15, 1.3].map(r => `<button class="b s" onclick="const a=document.getElementById('${id}');a.playbackRate=${r};a.play()">×${String(r).replace(".", ",")}</button>`).join("")}</span>`;
// the liaison mark of the book (_) shown as ‿; the note numbers as small figures
const asText = t => esc(t).replace(/_/g, "‿").replace(/⁽(\d+)⁾/g, "<sup>$1</sup>");
const asSay = t => plain(t).replace(/⁽\d+⁾/g, "").replace(/_/g, " ").replace(/\[|\]/g, "");
const dlgHTML = (u, mode) => !u.dlg.length ? `<p class="mut">Leçon pas encore importée.</p><div class="row">${saisieBtn("assimil", u.k)}</div>`
  : `<div class="mini asd ${mode || ""}">${u.dlg.map(l => `<p class="${l.turn ? "turn" : ""}"><span class="mut asn">${l.n}</span> <span class="fr">${spk(asSay(l.text))} ${asText(l.text)}</span>${l.en ? `<br><span class="mut en">${esc(l.en)}</span>` : ""}</p>`).join("")}</div>`;
function unitPage(k, title, sub, body, s) {
  view.innerHTML = `<p class="backlink"><a href="#" onclick="go('today');return false">← Ma leçon</a></p><h1>${esc(title)}</h1><p class="sub">${esc(sub)}</p>${body}${stepEnd(k, s)}`;
  scrollTo(0, 0);
}
const lessonSub = u => `Leçon ${u.k} · ${u.title}${u.titleEn ? " · " + u.titleEn : ""}`;
// 1. listening: the recording, with the text hidden, in French, or with the translation
window.asView = (el, m) => { const box = el.closest(".card").querySelector(".asd"); box.classList.remove("hide", "fronly"); if (m) box.classList.add(m);
  el.parentNode.querySelectorAll("button").forEach(b => b.classList.toggle("on", b === el)); };
window.asListen = k => {
  const u = U(k);
  const body = `<div class="card"><h2>${u.rev ? "Dialogue de révision" : esc(u.title)}</h2>${asAudio(k, "asa")}<p>${rateBtns("asa")}</p>
    <ol class="mut" style="padding-left:20px"><li>Écoutez deux fois <b>sans le texte</b> : que comprenez-vous ?</li><li>Écoutez en lisant le <b>texte français</b>.</li><li>Lisez la <b>traduction</b> phrase par phrase, puis réécoutez : tout doit être clair.</li></ol>
    <p class="row" role="group" aria-label="Texte"><button class="pill on" onclick="asView(this,'hide')">Sans texte</button><button class="pill" onclick="asView(this,'fronly')">Français</button><button class="pill" onclick="asView(this,'')">Avec la traduction</button></p>
    ${dlgHTML(u, "hide")}</div>`;
  unitPage(k, "Écouter la leçon", lessonSub(u), body, "ecoute");
};
// 2. Français interactif: the words of the same topic, the pronunciation lesson, a listening exercise
const fiVocHTML = i => { const s = FI_VOC[i]; if (!s) return "";
  return `<div class="sitbox"><h3 style="margin:0 0 6px">${esc(s.title)} <span class="mut" style="font-weight:400">· FI ch. ${String(s.ch).padStart(2, "0")}</span></h3>
    <audio controls preload="none" src="${s.audio}" style="width:100%"></audio>
    ${s.words.length ? `<div style="overflow-x:auto"><table>${s.words.map(([fr, en]) => { const id = (ALL.find(x => ITEMS[x].kind === "v" && ITEMS[x].v.src === "FI" && ITEMS[x].v.fr === fr)); return `<tr><td style="width:44px">${spk(fr)}</td><td><b>${frHTML(fr)}</b></td><td class="mut">${esc(en)}</td><td style="width:52px">${id ? star(id) : ""}</td></tr>`; }).join("")}</table></div>` : ""}</div>`; };
window.asFI = k => {
  const u = U(k), f = u.fi;
  const body = (f.voc.length ? `<div class="card"><h2>Les mots du thème</h2><p class="mut" style="margin-top:0">Écoutez la liste enregistrée, en lisant. ☆ = ajouter un mot à vos cartes (carnet).</p>${f.voc.map(fiVocHTML).join("")}</div>` : "")
    + (f.pho.length ? `<div class="card"><h2>Prononciation</h2>${f.pho.map(n => `<div class="todo"><div class="t" style="flex:1"><b>${n}. ${esc(FI_PHO[n - 1].title)}</b></div><button class="b s" onclick="openPho(${n})">Ouvrir</button></div>`).join("")}</div>` : "")
    + (f.listen.length ? `<div class="card"><h2>Écoute</h2>${f.listen.map(i => { const x = FI_LISTEN[i]; return `<p><b>${esc(x.t)}</b> <span class="mut">· FI ch. ${String(x.ch).padStart(2, "0")}</span></p><audio controls preload="none" src="${x.u}" style="width:100%"></audio>
       <p class="mut">L'exercice complet : <a target="_blank" rel="noopener" href="${FI_BASE}${String(x.ch).padStart(2, "0")}/">Français interactif, chapitre ${String(x.ch).padStart(2, "0")}</a></p>`; }).join("")}</div>` : "")
    + `<div class="card"><p class="mut" style="margin:0">${u.rev ? `Pour la grammaire de la semaine, la grammaire de Tex (FI) : <a target="_blank" rel="noopener" href="${TEX}">Tex's French Grammar</a>. ` : ""}${!f.voc.length && !f.pho.length && !f.listen.length ? "Pas de matériel FI propre à cette leçon : réécoutez une liste de mots ou une écoute d'une leçon précédente. " : ""}Français interactif, UT Austin (CC BY).</p>
      ${!f.voc.length && !f.listen.length ? `<p class="row" style="margin-top:8px"><button class="b s" onclick="openReecoute()">Une écoute FI déjà connue</button></p>` : ""}</div>`;
  unitPage(k, "Français interactif", lessonSub(u), body, "fi");
};
// 3. the notes of the book (or, in a revision lesson, the revision text)
const parasHTML = t => String(t || "").split("\n").filter(Boolean).map(p => `<p>${asText(p)}</p>`).join("");
window.asNotes = k => {
  const u = U(k);
  const body = (u.rev ? `<div class="card"><h2>Révision</h2>${parasHTML(u.revText) || `<p class="mut">Pas encore importée.</p>`}</div>` : "")
    + (u.notes ? `<div class="card"><h2>Notes</h2><div class="asnotes">${parasHTML(u.notes)}</div></div>` : !u.rev ? `<div class="card"><p class="mut">Notes pas encore importées.</p><div class="row">${saisieBtn("assimil", k)}</div></div>` : "")
    + (u.pron ? `<div class="card"><h2>Prononciation</h2><p class="mut" style="margin-top:0">La transcription du livre (pour un anglophone : [œh"] = voyelle nasale). Écoutez l'enregistrement plutôt que de lire la transcription.</p><p>${asText(u.pron)}</p></div>` : "")
    + (u.culture ? `<div class="card"><h2>Note culturelle</h2>${parasHTML(u.culture)}</div>` : "")
    + `<div class="card">${dlgHTML(u, "")}</div>`;
  unitPage(k, u.rev ? "La révision de la semaine" : "Notes et prononciation", lessonSub(u), body, "notes");
};
// 4. repetition: the recording is cut at its pauses (silences), and stops after each sentence for you to repeat
let REP = null;
// the recording says the lesson's number and title, the dialogue, then exercise 1: it is cut at its longest silences,
// as many as there are sentences (« target »)
async function asSegments(audio, target) {
  const r = await fetch(audio.currentSrc || audio.src), buf = await r.arrayBuffer();
  const ctx = new (window.AudioContext || window.webkitAudioContext)(), ab = await ctx.decodeAudioData(buf); ctx.close && ctx.close();
  const d = ab.getChannelData(0), sr = ab.sampleRate, win = Math.round(sr * 0.02), rms = [];
  for (let i = 0; i < d.length; i += win) { let s = 0; for (let j = i; j < Math.min(d.length, i + win); j++) s += d[j] * d[j]; rms.push(Math.sqrt(s / win)); }
  const sorted = rms.slice().sort((a, b) => a - b), floor = sorted[Math.floor(sorted.length * 0.1)], th = Math.max(0.01, floor * 3, sorted[Math.floor(sorted.length * 0.5)] * 0.15);
  const loud = rms.map(v => v > th), first = loud.indexOf(true), last = loud.lastIndexOf(true), gaps = [];
  for (let i = first, q = -1; i <= last; i++) { if (!loud[i]) { if (q < 0) q = i; } else if (q >= 0) { if (i - q >= 12) gaps.push([q, i]); q = -1; } }
  const cut = gaps.sort((a, b) => (b[1] - b[0]) - (a[1] - a[0])).slice(0, Math.max(0, (target || 20) - 1)).sort((a, b) => a[0] - b[0]);
  const segs = []; let s = first;
  cut.forEach(([q, i]) => { segs.push([s, q]); s = i; }); segs.push([s, last + 1]);
  return segs.map(([a, b]) => [Math.max(0, a * 0.02 - 0.1), b * 0.02 + 0.15]);
}
window.asRepeat = k => {
  const u = U(k);
  const body = `<div class="card">${asAudio(k, "asr")}
    <p class="row"><button class="b" id="rpgo" onclick="asRepGo()">▶ Phrase par phrase</button><button class="b s" onclick="asRepStep(-1)">⟲ Rejouer</button><button class="b s" onclick="asRepStep(1)">Suivante →</button>
     <label class="mut"><input type="checkbox" id="rpauto" checked> pause automatique pour répéter</label></p>
    <p id="rpst" class="mut">Chaque phrase de l'enregistrement, puis un silence : répétez à voix haute, en imitant le rythme et la mélodie. Une deuxième fois, répétez en même temps que l'enregistrement.</p>
    <p>${recWidget("asrec")}</p></div><div class="card">${dlgHTML(u, "fronly")}</div>`;
  unitPage(k, "Répéter phrase par phrase", lessonSub(u), body, "repeter");
  REP = { k, i: 0, segs: null };
};
window.asRepGo = async () => {
  const a = $("#asr"); if (!REP || !a) return;
  if (!REP.segs) { $("#rpst").textContent = "Préparation de l'enregistrement…";
    // the number and the title, the lines of the dialogue, then « Exercice 1 » and its five sentences
    const u = U(REP.k), target = 2 + u.dlg.length + (u.ex1.length ? 1 + u.ex1.length : 0);
    try { if (!a.currentSrc && a.src) await new Promise(ok => { a.addEventListener("loadedmetadata", ok, { once: true }); a.load(); setTimeout(ok, 4000); }); REP.segs = await asSegments(a, target); }
    catch (e) { $("#rpst").textContent = "Impossible de découper l'enregistrement ici : écoutez-le et mettez-le en pause après chaque phrase."; return; } }
  asRepPlay();
};
function asRepPlay() {
  const a = $("#asr"); if (!a || !REP || !REP.segs) return;
  const segs = REP.segs; if (REP.i >= segs.length) { $("#rpst").textContent = "Fin de la leçon. Recommencez une fois en répétant en même temps que l'enregistrement."; REP.i = 0; return; }
  const [s, e] = segs[REP.i]; a.currentTime = s; a.play(); $("#rpst").textContent = `Phrase ${REP.i + 1} / ${segs.length}`;
  clearInterval(REP.t); REP.t = setInterval(() => { if (!document.getElementById("asr")) { clearInterval(REP.t); return; }
    if (a.currentTime >= e) { a.pause(); clearInterval(REP.t); $("#rpst").textContent = `Phrase ${REP.i + 1} / ${segs.length} · à vous !`;
      REP.i++; if ($("#rpauto").checked) REP.w = setTimeout(asRepPlay, Math.max(1500, (e - s) * 1300)); } }, 40);
}
window.asRepStep = d => { if (!REP || !REP.segs) { asRepGo(); return; } clearTimeout(REP.w); REP.i = Math.max(0, REP.i + (d < 0 ? -1 : 0)); asRepPlay(); };
// 5. the two exercises: translate (say it, then compare), complete the gaps (one field per gap)
window.asGap = el => { S.exAns = S.exAns || {}; S.exAns[el.dataset.k] = el.value; clearTimeout(exSave.t); exSave.t = setTimeout(save, 600); };
window.asGapCheck = (key, n) => { document.querySelectorAll(`[data-g="${key}"]`).forEach(el => { const a = el.dataset.a, v = el.value;
  const ok = a && (normAns(v) === normAns(a) || stripAcc(normAns(v)) === stripAcc(normAns(a))); el.classList.toggle("ok", !!ok); el.classList.toggle("ko", !ok);
  el.title = ok ? "" : a; }); const r = document.getElementById("gr" + key); if (r) r.innerHTML = [...document.querySelectorAll(`[data-g="${key}"]`)].map(el => el.classList.contains("ok") ? "" : `<span class="badc">${esc(el.dataset.a || "?")}</span>`).filter(Boolean).join(" · ") || `<span class="good">✓</span>`; };
const gapHTML = (k, j, it) => { const A = S.exAns || {}, key = `as${k}.2.${j}`; let g = 0;
  const parts = it.tpl.split("…"), line = parts.map((p, i) => esc(p) + (i < parts.length - 1 ? `<input type="text" class="gap" data-g="${key}" data-k="${key}.${g}" data-a="${esc(it.ans[g] || "")}" value="${esc(A[key + "." + g++] || "")}" oninput="asGap(this)" size="${Math.max(4, (it.ans[g - 1] || "").length + 1)}" autocomplete="off" autocapitalize="off" aria-label="Mot manquant">` : "")).join("");
  return `<div class="exq gapq"><p class="mut" style="margin:0">${esc(it.en)}</p><p style="margin:4px 0">${line}</p><p class="row"><button class="b s" onclick="asGapCheck('${key}')">Vérifier</button><span id="gr${key}"></span></p></div>`; };
window.asReveal = el => { el.nextElementSibling.hidden = false; el.remove(); };
window.asExos = k => {
  const u = U(k);
  const e1 = u.ex1.length ? u.ex1.map(([fr, en], j) => `<div class="exq"><p style="margin:0">${spk(asSay(fr))} <b>${asText(fr)}</b></p><button class="b s" onclick="asReveal(this)">Voir la traduction</button><p class="mut" hidden style="margin:4px 0">${esc(en || "—")}</p></div>`).join("") : `<p class="mut">Pas encore importé.</p>`;
  const e2 = u.ex2.length ? u.ex2.map((it, j) => gapHTML(k, j, it)).join("") : `<p class="mut">Pas encore importé.</p>`;
  const body = `<div class="card"><h2>Exercice 1 · Traduisez</h2><p class="mut" style="margin-top:0">Lisez la phrase à voix haute, dites ce qu'elle veut dire, puis comparez avec la traduction.</p>${e1}</div>
    <div class="card"><h2>Exercice 2 · Complétez</h2><p class="mut" style="margin-top:0">Les mots qui manquent, d'après la phrase anglaise. Le corrigé du livre vérifie chaque trou.</p>${e2}<div class="row">${saisieBtn("assimil", k)}</div></div>`;
  unitPage(k, "Exercices 1 et 2", lessonSub(u), body, "exos");
};

// ---------- writing with correction: write → copy for correction → paste back → rewrite from memory → compare ----------
const wordsOf = t => (t.match(/[\p{L}'’-]+|[.,!?;:]/gu) || []);
function wordDiff(a, b) { // b compared with a, word by word (LCS)
  const A = wordsOf(a), B = wordsOf(b), n = A.length, m = B.length, L = Array.from({ length: n + 1 }, () => new Int16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i].toLowerCase() === B[j].toLowerCase() ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = []; let i = 0, j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && A[i].toLowerCase() === B[j].toLowerCase()) { out.push(esc(B[j])); i++; j++; }
    else if (i < n && (j >= m || L[i + 1][j] >= L[i][j + 1])) out.push(`<del>${esc(A[i++])}</del>`);
    else out.push(`<ins>${esc(B[j++])}</ins>`);
  }
  return out.join(" ").replace(/ ([.,!?;:])/g, "$1");
}
// one point to correct in writing: what the lesson of the day teaches (its title and its first note)
const focusNow = () => { const u = AS[curUnit()]; return `les tournures de la leçon ${u.k} d'Assimil (« ${u.title} »)`; };
// o: { key, store, label } — the text lives in S[store][key] = { t, c, rw, at, u }
window.corrFlow = (store, key, prompt) => {
  const e = ((S[store] || {})[key]) || {};
  return `<div class="corr" data-store="${store}" data-key="${key}">
   <textarea class="cf-t" rows="7" lang="fr" spellcheck="false" placeholder="${esc(prompt || "Écrivez ici…")}">${esc(e.t || "")}</textarea>
   <p class="row"><span class="mut cf-n">${nWords(e.t || "")} mots</span><button class="b s" onclick="cfCopy(this)">Copier pour la correction</button><span class="mut cf-msg"></span></p>
   <details ${e.c ? "open" : ""}><summary>Texte corrigé</summary>
    <p class="mut">Point de correction (la leçon du jour) : <b>${esc(focusNow())}</b>. Collez ici le texte corrigé (par un francophone, un professeur ou Claude).</p>
    <textarea class="cf-c" rows="6" lang="fr" spellcheck="false">${esc(e.c || "")}</textarea>
    <div class="cf-diff">${e.c ? `<p class="mut">Vos corrections :</p><p class="diff">${wordDiff(e.t || "", e.c)}</p>` : ""}</div>
    ${e.c ? `<p><b>Réécrire de mémoire</b> <span class="mut">— le texte corrigé est caché pendant que vous écrivez.</span></p><textarea class="cf-rw" rows="6" lang="fr" spellcheck="false">${esc(e.rw || "")}</textarea>
     <p class="row"><button class="b s" onclick="cfCompare(this)">Comparer avec le texte corrigé</button></p><div class="cf-cmp"></div>` : ""}</details></div>`;
};
const cfBox = el => el.closest(".corr");
const cfGet = box => { const s = box.dataset.store; S[s] = S[s] || {}; return S[s][box.dataset.key] = S[s][box.dataset.key] || {}; };
document.addEventListener("input", ev => {
  const box = ev.target.closest && ev.target.closest(".corr"); if (!box) return;
  const e = cfGet(box), f = ev.target.classList.contains("cf-t") ? "t" : ev.target.classList.contains("cf-c") ? "c" : ev.target.classList.contains("cf-rw") ? "rw" : null; if (!f) return;
  e[f] = ev.target.value; e.at = Date.now(); e.u = e.u || curUnit();
  if (f === "t") box.querySelector(".cf-n").textContent = nWords(e.t) + " mots";
  if (f === "c") { box.querySelector(".cf-diff").innerHTML = e.c ? `<p class="mut">Vos corrections :</p><p class="diff">${wordDiff(e.t || "", e.c)}</p><p class="mut">Rechargez la page pour la réécriture de mémoire.</p>` : ""; }
  clearTimeout(cfGet.t); cfGet.t = setTimeout(() => { save(); track("write", "Écriture"); }, 500);
});
window.cfCopy = async btn => {
  const box = cfBox(btn), e = cfGet(box);
  const txt = `Corrige ce texte en français (je suis débutant, j'apprends avec Assimil, leçon ${curUnit()}). Ne corrige que les erreurs et garde mes phrases. Point de correction prioritaire : ${focusNow()}. Donne seulement le texte corrigé.\n\n${e.t || ""}`;
  try { await navigator.clipboard.writeText(txt); box.querySelector(".cf-msg").textContent = "Copié ✓"; } catch (x) { box.querySelector(".cf-msg").textContent = "Copie impossible : sélectionnez le texte à la main."; }
};
window.cfCompare = btn => { const box = cfBox(btn), e = cfGet(box); box.querySelector(".cf-cmp").innerHTML = `<p class="diff">${wordDiff(e.c || "", e.rw || "")}</p><p class="mut"><del>barré</del> = oublié · <ins>souligné</ins> = différent du texte corrigé</p>`; };
// 7. output: say the dialogue again in French from its translation (from lesson 50, the lesson of the second wave), then write
window.asRecall = el => { const p = el.closest(".rc"); p.querySelector(".fr").hidden = false; el.remove(); };
const recallHTML = u => u.dlg.length ? u.dlg.map(l => `<div class="rc exq"><p style="margin:0">${esc(l.en || "—")}</p><button class="b s" onclick="asRecall(this)">Voir le français</button><p class="fr" hidden style="margin:4px 0">${spk(asSay(l.text))} <b>${asText(l.text)}</b></p></div>`).join("")
  : `<p class="mut">La leçon ${u.k} n'est pas encore importée.</p>`;
window.unitWrite = k => {
  const u = U(k), j = wave2Of(k), w = j ? U(j) : u;
  const body = `<div class="card"><h2>${j ? `Deuxième vague · leçon ${j} : ${esc(w.title)}` : "Redire le dialogue"}</h2>
     <p class="mut" style="margin-top:0">${j ? `La phase active d'Assimil : la leçon ${j}, vue il y a 49 jours, se reprend de l'anglais vers le français. Dites chaque phrase à voix haute, puis comparez.` : `Lisez la traduction de chaque phrase et dites-la en français, à voix haute, avant de regarder. Les phrases difficiles : répétez-les deux fois.`}</p>
     ${j ? asAudio(j, "asw") : ""}${recallHTML(w)}<p>${recWidget("uwr")}</p></div>
   <div class="card"><h2>Écrire</h2><p>3 à 5 phrases à vous, sur le même sujet, avec les mots et les tournures de la leçon${j ? ` (et de la leçon ${j})` : ""}.</p>${corrFlow("uwrite", k, "J'écris 3 à 5 phrases…")}</div>`;
  unitPage(k, j ? "Deuxième vague et écriture" : "Parler et écrire", lessonSub(u), body, "produire");
};

// 8. fluency: only material already known (the lessons before), faster
const FLUENCY_BACK = [1, 2, 4, 7];
window.unitFluency = k => {
  const prev = FLUENCY_BACK.map(d => k - d).filter(j => j >= 1).map(U);
  const relis = j => { const key = `${k}:relis${j.k}`, d = (S.ustep || {})[key];
    return `<div class="todo ${d ? "done" : ""}"><input type="checkbox" ${d ? "checked" : ""} onchange="tickStep(${k},'relis${j.k}',this.checked)" aria-label="fait"><div style="flex:1"><div class="t"><b>Leçon ${j.k} · ${esc(j.title)}</b></div>${asAudio(j.k, "fl" + j.k)}</div><div class="row">${[1.15, 1.3].map(r => `<button class="b s" onclick="const a=document.getElementById('fl${j.k}');a.playbackRate=${r};a.play()">×${String(r).replace(".", ",")}</button>`).join("")}</div></div>`; };
  const body = !prev.length ? `<div class="card"><p>Première leçon : rien de connu encore. Réécoutez la leçon 1 deux fois, plus vite, et dites « Bonjour, comment allez-vous ? » à voix haute jusqu'à ce que ce soit facile.</p><div class="row">${asAudio(1, "fl1")}</div></div>`
    : `<div class="card"><h2>Réécouter, plus vite</h2><p class="mut" style="margin-top:0">Sans le texte, en accéléré : les leçons d'hier, d'avant-hier, de la semaine dernière. Tout est connu, on entraîne la vitesse.</p>${prev.map(relis).join("")}</div>
     <div class="card"><h2>Raconter 3/2/1½</h2><p class="mut" style="margin-top:0">Racontez en français l'histoire de la leçon ${prev[0].k} (« ${esc(prev[0].title)} ») en 3 minutes, puis la même chose en 2 minutes, puis en 1 minute 30.</p>
      <p class="row"><button class="b s" onclick="asRetell(180)">3:00</button><button class="b s" onclick="asRetell(120)">2:00</button><button class="b s" onclick="asRetell(90)">1:30</button><b id="rtt" style="font-size:22px"></b></p><p>${recWidget("rtrec")}</p></div>
     <div class="card"><h2>Jeux rapides</h2><div class="row"><button class="b s" onclick="openEclair()">Révision éclair</button><button class="b s" onclick="openGenre()">Genre éclair</button>${k >= 15 ? `<button class="b s" onclick="openNombres()">Nombres à l'oreille</button>` : ""}<button class="b s" onclick="openEcrire('fluency')">Écrire 10 minutes</button></div></div>`;
  unitPage(k, "Fluidité", "Seulement du connu, plus vite", body, "fluide");
};
window.asRetell = s => { const el = $("#rtt"); if (el) countdown(s, el, () => { el.textContent = "✓"; track("retell", "Raconter", true); }); };


// ---------- home: progress, then the lesson of the day ----------
const pct = x => Math.round(x * 100) + " %";
const fmtShort = d => new Date(d + "T12:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
function learningCurve() {
  const N = 30, days = Array.from({ length: N }, (_, i) => dstr(Date.now() - (N - 1 - i) * DAY));
  const mins = days.map(d => ((S.daily[d] || {}).secs || 0) / 60);
  const firsts = Object.entries(S.cards).filter(([id]) => ITEMS[id] && ITEMS[id].kind === "v").map(([, c]) => c.first || 0);
  const cum = days.map(d => firsts.filter(t => t && dstr(t) <= d).length);
  const W = 600, H = 150, P = 24, bw = (W - 2 * P) / N, mm = Math.max(30, ...mins), cm = Math.max(10, ...cum);
  const x = i => P + i * bw, y1 = m => H - P - m / mm * (H - 2 * P), y2 = c => H - P - c / cm * (H - 2 * P);
  return `<svg class="curve" viewBox="0 0 ${W} ${H}" role="img" aria-label="Courbe d'apprentissage des 30 derniers jours">
    <line x1="${P}" x2="${W - P}" y1="${H - P}" y2="${H - P}" stroke="var(--bd)"/>
    ${mins.map((m, i) => m ? `<rect x="${x(i) + 2}" y="${y1(m)}" width="${bw - 4}" height="${H - P - y1(m)}" rx="2" fill="var(--ac-bg)"><title>${days[i]} · ${Math.round(m)} min</title></rect>` : "").join("")}
    <polyline fill="none" stroke="var(--ac)" stroke-width="2.5" points="${cum.map((c, i) => `${x(i) + bw / 2},${y2(c)}`).join(" ")}"/>
    <text x="${P}" y="${H - 6}" font-size="11" fill="var(--mut)">${fmtShort(days[0])}</text>
    <text x="${W - P}" y="${H - 6}" font-size="11" fill="var(--mut)" text-anchor="end">aujourd'hui</text>
    <text x="${W - P}" y="${y2(cum[N - 1]) - 6}" font-size="12" font-weight="600" fill="var(--ac)" text-anchor="end">${cum[N - 1]} mots</text></svg>
   <div class="legend"><span><i class="dot" style="background:var(--ac)"></i>mots et expressions rencontrés (cumul)</span><span><i class="dot" style="background:var(--ac-bg);border:1px solid var(--ac)"></i>minutes d'étude par jour</span></div>`;
}
// the four strands this week, against a quarter each
window.strandWeek = () => {
  const ws = weekStart(), days = Array.from({ length: 7 }, (_, i) => dstr(ws + i * DAY + 3e6));
  const m = ["study", "input", "output", "fluency"].map(k => [k, days.reduce((a, d) => a + ((((S.daily[d] || {}).st || {})[k]) || 0), 0) / 60]);
  const sum = m.reduce((a, x) => a + x[1], 0);
  return `<div class="sw">${m.map(([k, v]) => `<div><span class="mut">${STRAND_FR[k]}</span><div class="bar"><i style="width:${sum ? v / sum * 100 : 0}%;background:var(--${k})"></i><span class="mark25"></span></div><span>${Math.round(v)} min${sum ? " · " + pct(v / sum) : ""}</span></div>`).join("")}</div>
   <p class="mut" style="margin:4px 0 0">Cette semaine · le trait = 25 %, l'objectif de chaque pilier.</p>`;
};
// the course end, from the steps done over the last 7 days (one lesson a day, Assimil's rhythm)
window.unitPace = () => {
  const wk = Date.now() - 7 * DAY, done = Object.entries(S.ustep || {}).filter(([k, t]) => !/relis|pho1/.test(k) && t >= wk).length;
  let left = 0; for (let k = 1; k <= NU; k++) left += stepsOf(k).filter(([s]) => !stepDone(k, s)).length;
  if (!left) return "Les 100 leçons sont terminées 🎉";
  const per = done / 7, base = NU - curUnit() + 1, days = per >= 0.5 ? Math.ceil(left / per) : base;
  return `Fin prévue des 100 leçons : <b>${fmtDate(dAdd(dstr(), Math.max(0, days - 1)))}</b> <span class="mut">(${per >= 0.5 ? "à votre rythme des 7 derniers jours" : "à une leçon par jour, le rythme d'Assimil"})</span>`;
};
function homeProgress(k) {
  const done = Array.from({ length: NU }, (_, i) => i + 1).filter(j => unitPct(j) === 1).length, t = timeStats();
  const known = ALL.filter(id => ITEMS[id].kind === "v" && card(id) && card(id).interval >= 7).length, due = dueIds().length;
  const recs = S.sessions.slice(-5).reverse().map(s => `<li>${esc(s.label)} <span class="mut">· ${new Date(s.start).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}${s.total ? ` · ${s.correct}/${s.total}` : ""}</span></li>`).join("");
  const ago = S.lastExport ? Math.floor((Date.now() - S.lastExport) / DAY) : null, hasP = Object.keys(S.cards).length >= 20 || Object.keys(S.ustep || {}).length;
  let tok = null; try { tok = localStorage.getItem("fr-gist-token"); } catch (x) { }
  const backup = hasP && !tok && (ago === null || ago > 7) ? `<p class="mut">💾 Dernière sauvegarde : ${ago === null ? "jamais" : "il y a " + ago + " jours"} · <a href="#" onclick="go('sync');return false">sauvegarder</a></p>` : "";
  return `<div class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">Mes progrès</h2><a href="#" onclick="go('progress');return false">Statistiques →</a></div>
   <div class="stats" style="margin:12px 0">
    <div class="stat"><b>${k}<span class="mut" style="font-size:15px;font-weight:400"> / ${NU}</span></b>leçon en cours · ${done} terminée${done > 1 ? "s" : ""}</div>
    <div class="stat"><b>${streak()}</b>jours d'affilée</div>
    <div class="stat"><b>${fmtDur(t.total)}</b>au total · ${Math.round(t.today / 60)} min aujourd'hui</div>
    <div class="stat"><b>${known}</b>mots retenus (≥ 1 semaine)</div></div>
   <div class="bar" title="Les 100 leçons"><i style="width:${(done + unitPct(k)) / NU * 100}%"></i></div>
   <p style="margin:6px 0 14px">${unitPace()}</p>
   ${learningCurve()}
   <h3 style="margin-top:16px">Les quatre piliers</h3>${strandWeek()}
   ${due ? `<p class="row" style="margin-top:14px"><button class="b s" onclick="startReview('due')">Réviser ${due} carte${due > 1 ? "s" : ""} du jour</button><span class="mut">avant ou après la leçon</span></p>` : ""}
   ${recs ? `<details style="margin-top:10px"><summary>Dernières séances</summary><ul>${recs}</ul></details>` : ""}${backup}</div>`;
}
function unitModules(k) {
  const u = U(k), nw = unitWordIds(k), seen = nw.filter(passed).length, f = u.fi;
  const missing = !u.entered ? `<div class="card note"><b>Leçon à importer :</b> le texte vient de votre PDF d'Assimil. <span class="mut">Plus → Livres → « Importer tout le livre ».</span></div>` : u.draft ? `<div class="card note">Leçon importée automatiquement, <b>à vérifier</b> avec le livre (p. ${u.pages.join("–")}). <span class="row" style="display:inline-flex">${saisieBtn("assimil", k)}</span></div>` : "";
  return `${missing}
   <div class="card" id="mod-dlg"><div class="row" style="justify-content:space-between"><h2 style="margin:0"><i class="dot" style="background:var(--input)"></i> ${u.rev ? "Dialogue de révision" : "Dialogue"}</h2>
     <span class="row" role="group" aria-label="Texte"><button class="pill" onclick="asView(this,'fronly')">Français</button><button class="pill on" onclick="asView(this,'')">Avec la traduction</button></span></div>
    <div style="margin:10px 0">${asAudio(k, "hma")}</div>${dlgHTML(u, "")}</div>
   ${u.notes || u.revText ? `<div class="card"><h2><i class="dot" style="background:var(--study)"></i> ${u.rev ? "La révision" : "Notes"}</h2><details><summary>${u.rev ? "Le texte de révision" : (u.notes.split("\n").length + " notes")} · p. ${u.pages.join("–")}</summary><div class="asnotes">${parasHTML(u.rev ? u.revText : u.notes)}</div></details></div>` : ""}
   <div class="card"><h2><i class="dot" style="background:var(--study)"></i> Vocabulaire</h2><p><b>${nw.length}</b> mots du lexique apparaissent dans cette leçon pour la première fois · ${seen} déjà réussis une fois</p>
    ${f.voc.length ? `<p class="mut">Français interactif : ${f.voc.map(i => esc(FI_VOC[i].title)).join(" · ")}</p>` : ""}
    <p class="row"><button class="b s" onclick="WU=${k};go('uwords')">Voir les mots de la leçon</button></p></div>`;
}
window.renderHome = () => {
  STEP = null;
  const k = curUnit(), u = U(k), st = stepsOf(k), next = st.find(([s]) => !stepDone(k, s));
  view.innerHTML = homeProgress(k) + `<div class="card unitcard">
   <div class="row" style="justify-content:space-between"><span class="tag">Leçon ${k} sur ${NU}${u.rev ? " · révision" : ""}${u.w2 ? ` · 2e vague : leçon ${u.w2}` : k < 50 ? " · phase passive" : ""}</span>
    <select onchange="setUnit(this.value)" aria-label="Changer de leçon">${Array.from({ length: NU }, (_, i) => i + 1).map(i => `<option value="${i}" ${i === k ? "selected" : ""}>${unitPct(i) === 1 ? "✓ " : ""}${i}. ${esc(AS[i].title)}</option>`).join("")}</select></div>
   <h1 style="margin-top:10px">${esc(u.title)}</h1>
   <p class="sub">${u.titleEn ? esc(u.titleEn) + " · " : ""}Assimil p. ${u.pages.join("–")}${u.fi.voc.length ? " · Français interactif : " + esc(FI_VOC[u.fi.voc[0]].title.replace(/\s*\(.*\)$/, "")) : ""}</p>
   <div class="bar" style="margin:14px 0 6px"><i style="width:${unitPct(k) * 100}%"></i></div>
   <div class="steps">${st.map(([s, strand, m, label, hint], i) => { const d = stepDone(k, s), used = Math.round(stepSecs(k, s) / 60), now = next && next[0] === s, L = stepLabel(k, s, label); return `<div class="todo ${d ? "done" : ""}">
     <input type="checkbox" ${d ? "checked" : ""} onchange="tickStep(${k},'${s}',this.checked)" aria-label="${esc(L)}">
     <div style="flex:1"><div class="t"><b>${i + 1}. ${esc(L)}</b></div><div class="mut" style="font-size:14px">${esc(stepHint(k, s, hint))}</div>
      <div class="smeta"><span style="color:var(--${strand})"><i class="dot" style="background:var(--${strand})"></i> ${STRAND_FR[strand]}</span> · ${stepMin(k, m)} min prévues${used ? ` · ${used} min faites` : ""}</div></div>
     <button class="b ${now ? "" : "s"}" onclick="doStep(${k},'${s}')">${now ? "Commencer" : "Ouvrir"}</button></div>`; }).join("")}</div>
   ${!next ? `<p class="row"><b class="good">Leçon terminée ✅</b>${k < NU ? `<button class="b" onclick="setUnit(${k + 1})">Leçon suivante →</button>` : ""}</p>` : ""}</div>` + unitModules(k);
};


// ---------- Mots: the unit's words, the error notebook, the dictionary ----------
window.WU = 0;
window.toggleCarnet = id => { S.carnet = S.carnet || {}; if (S.carnet[id]) delete S.carnet[id]; else S.carnet[id] = Date.now(); save(); const b = document.querySelector(`[data-cn="${id}"]`); if (b) b.textContent = S.carnet[id] ? "★" : "☆"; };
const star = id => `<button class="b s starb" data-cn="${id}" title="Carnet d'erreurs" onclick="toggleCarnet('${id}')">${(S.carnet || {})[id] ? "★" : "☆"}</button>`;
const wRow = id => { const v = ITEMS[id].v; return `<tr><td style="width:44px">${spk(v.fr)}</td><td><b>${frHTML(v.fr, v.pos)}</b>${v.pos ? ` <span class="mut">(${esc(v.pos)})</span>` : ""}</td><td>${esc(v.en || "")}</td><td class="mut">${wordState2(v)}</td><td style="width:52px">${star(id)}</td></tr>`; };
window.renderUnitWords = () => {
  const k = WU || curUnit(), u = U(k), ids = unitWordIds(k);
  const groups = [["Assimil — les mots de la leçon (lexique du livre)", ids], ["Français interactif — même thème (☆ pour les ajouter aux cartes)", fiWordIds(k)]];
  const nNew = ids.filter(id => !card(id)).length, due = ids.filter(isDue).length;
  view.innerHTML = `<div class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">Mots de la leçon ${k}</h2>
    <select onchange="WU=+this.value;renderUnitWords()" aria-label="Leçon">${PARCOURS.map((_, i) => `<option value="${i + 1}" ${i + 1 === k ? "selected" : ""}>${i + 1}. ${esc(AS[i + 1].title)}</option>`).join("")}</select></div>
   <p class="sub">${esc(u.title)} · ${ids.length} mots · ${nNew} nouveaux · ${due} à réviser</p>
   ${k === curUnit() && k > 1 && !stepDone(k, "ecoute") ? `<p class="note">Écoutez d'abord le dialogue de la leçon : les mots s'apprennent mieux une fois rencontrés dans un texte.</p>` : ""}
   <p class="row"><button class="b" onclick="startReview('due')">Cartes du jour (${dueIds().length} à revoir · nouvelles mélangées)</button><button class="b s" onclick="startReview('pu:${k}')" ${ids.length ? "" : "disabled"}>Seulement cette leçon</button>
    <input type="text" id="wq" placeholder="Rechercher dans tous les mots…" style="flex:1;min-width:200px"></p>
   <p class="mut">Les nouvelles cartes (15 à 20 par jour) viennent de toutes les leçons déjà atteintes, mélangées : 6 par leçon d'abord, puis le reste quand une seule leçon a encore des mots nouveaux. ☆ = carnet d'erreurs.</p></div><div id="wres"></div>`;
  const list = () => groups.filter(g => g[1].length).map(([t, g]) => `<div class="card"><h3>${t}</h3><div style="overflow-x:auto"><table>${g.sort(wordOrder).map(wRow).join("")}</table></div></div>`).join("") || `<div class="card"><p class="mut">Pas encore de mots pour cette leçon : importez le lexique d'Assimil (Plus → Livres).</p></div>`;
  const draw = () => { const q = $("#wq").value.trim().toLowerCase();
    $("#wres").innerHTML = !q ? list() : `<div class="card" style="overflow-x:auto"><table>${ALL.filter(id => ITEMS[id].kind === "v" && (ITEMS[id].v.fr + " " + ITEMS[id].v.en).toLowerCase().includes(q)).slice(0, 80).map(wRow).join("") || "<tr><td>Aucun résultat</td></tr>"}</table></div>`; };
  $("#wq").oninput = draw; draw();
};
window.carnetIds = () => [...new Set(Object.keys(S.carnet || {}).filter(id => ITEMS[id]).concat(ALL.filter(id => card(id) && card(id).lapses > 0)))]
  .sort((a, b) => ((card(b) || {}).lapses || 0) - ((card(a) || {}).lapses || 0));
window.renderErrors = () => {
  const ids = carnetIds();
  const row = id => { const v = ITEMS[id].v, c = card(id); return `<tr><td style="width:44px">${spk(v.fr)}</td><td><b>${esc(v.fr)}</b></td><td>${esc(v.en || "")}</td><td class="mut">${c ? c.lapses + " erreur" + (c.lapses > 1 ? "s" : "") : "ajouté"}</td><td style="width:52px">${star(id)}</td></tr>`; };
  view.innerHTML = `<div class="card"><h2>Carnet d'erreurs</h2><p class="sub">Les cartes que vous avez ratées, et les mots ajoutés avec ☆. Ils reviennent plus souvent jusqu'à ce qu'ils soient acquis.</p>
   <p class="row"><button class="b" onclick="startReview('carnet')" ${ids.length ? "" : "disabled"}>Revoir le carnet (${Math.min(25, ids.length)})</button></p></div>
   <div class="card" style="overflow-x:auto">${ids.length ? `<table>${ids.map(row).join("")}</table>` : `<p class="mut">Rien pour l'instant.</p>`}</div>`;
};

// ---------- Journal: a small card per day, on a monthly calendar ----------
let JM = null, JD = null;
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
window.nWords = t => (String(t || "").match(/[A-Za-zÀ-ÿœŒ'’-]+/g) || []).length;
window.jMonth = d => { const [y, m] = JM; const t = new Date(y, m + d, 1); JM = [t.getFullYear(), t.getMonth()]; renderJournal(); };
window.jPick = d => { JD = d; renderJournal(); setTimeout(() => { const t = document.querySelector(".jcard .cf-t"); if (t) { t.focus(); t.scrollIntoView({ block: "center", behavior: "smooth" }); } }, 0); };
window.jIns = w => { const t = document.querySelector(".jcard .cf-t"), p = t.selectionStart ?? t.value.length; t.value = t.value.slice(0, p) + w + t.value.slice(p); t.focus(); t.selectionStart = t.selectionEnd = p + w.length; t.dispatchEvent(new Event("input", { bubbles: true })); };
window.renderJournal = () => {
  if (!JM) { const n = new Date(); JM = [n.getFullYear(), n.getMonth()]; }
  if (!JD) JD = dstr();
  const [y, m] = JM, J = S.journal || {}, first = (new Date(y, m, 1).getDay() + 6) % 7, dim = new Date(y, m + 1, 0).getDate();
  const ds = i => `${y}-${String(m + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
  const monthE = Array.from({ length: dim }, (_, i) => J[ds(i + 1)]).filter(e => e && e.t && e.t.trim());
  const cells = Array(first).fill(`<div class="jc empty"></div>`).concat(Array.from({ length: dim }, (_, i) => { const d = ds(i + 1), e = J[d], has = e && e.t && e.t.trim();
    return `<button class="jc ${has ? "has" : ""} ${d === JD ? "sel" : ""} ${d === dstr() ? "today" : ""}" onclick="jPick('${d}')"><span class="jn">${i + 1}${e && e.c ? " ✓" : ""}</span>${has ? `<span class="jp">${esc(e.t.slice(0, 60))}</span>` : ""}</button>`; })).join("");
  const e = J[JD] || {}, k = curUnit(), hints = unitWordIds(k).filter(id => card(id)).sort(wordOrder).slice(0, 14).map(id => ITEMS[id].v.fr);
  const dl = new Date(JD + "T12:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  view.innerHTML = `<div class="card"><div class="row" style="justify-content:space-between"><button class="b s" onclick="jMonth(-1)" aria-label="Mois précédent">‹</button>
    <h2 style="margin:0">${MOIS[m]} ${y}</h2><button class="b s" onclick="jMonth(1)" aria-label="Mois suivant">›</button></div>
   <p class="sub" style="text-align:center">${monthE.length} jour${monthE.length > 1 ? "s" : ""} écrit${monthE.length > 1 ? "s" : ""} · ${monthE.reduce((a, x) => a + nWords(x.t), 0)} mots ce mois-ci · ✓ = corrigé</p>
   <div class="jcal">${["lun", "mar", "mer", "jeu", "ven", "sam", "dim"].map(d => `<div class="jh">${d}</div>`).join("")}${cells}</div></div>
   <div class="card jcard"><h2 style="text-transform:capitalize">${esc(dl)}</h2>
    <p class="mut">Quelques phrases en français sur votre journée, avec ce que vous savez${e.u ? ` · écrit pendant la leçon ${e.u}` : ""}.</p>
    ${corrFlow("journal", JD, "Aujourd'hui, je…")}
    ${hints.length ? `<p class="mut" style="margin-bottom:4px">Mots de la leçon ${k} à réutiliser :</p><div>${hints.map(w => `<button class="chip jw" onclick='jIns(${JSON.stringify(w + " ").replace(/'/g, "&#39;")})'>${esc(w)}</button>`).join("")}</div>` : ""}</div>`;
};

go("today");

// ---------- Plus → Livres: Assimil lesson by lesson, with its state; the lexicon; Français interactif ----------
window.renderLivres = () => {
  const E = (S.book || {}).assimil || {}, st = k => { const e = E[k]; return !e || e.cleared ? `<span class="tag">à importer</span>` : e.draft ? `<span class="tag">à vérifier</span>` : e.fresh ? `<span class="tag">nouveaux champs</span>` : `<span class="tag good">vérifié</span>`; };
  const lex = ((S.book || {}).alex || {})[1], nl = lex && !lex.cleared ? (lex.words || []).length : 0;
  const rows = Array.from({ length: NU }, (_, i) => i + 1).map(k => { const u = AS[k];
    return `<tr><td><a href="#" onclick="setUnit(${k});return false">${k}. ${esc(u.title)}</a>${u.rev ? ` <span class="mut">révision</span>` : ""}</td><td>${st(k)}</td><td class="mut">${u.dlg.length || "—"}</td><td class="mut">p. ${u.pages.join("–")}</td><td>${saisieBtn("assimil", k)}</td></tr>`; }).join("");
  view.innerHTML = `${bookCard("assimil")}
   <div class="card"><h2>Lexique français–anglais</h2><p class="mut" style="margin-top:0">${nl ? `${nl} mots importés${lex.draft ? " (à vérifier)" : ""} : chaque mot est une carte de la leçon où il apparaît pour la première fois.` : "Pas encore importé : il donne les cartes de chaque leçon."} Livre p. ${AS_LEXICON.join("–")}.</p></div>
   <div class="card"><h2>Les 100 leçons</h2><div style="overflow-x:auto"><table><tr><th>Leçon</th><th>État</th><th>Lignes</th><th>Pages</th><th></th></tr>${rows}</table></div></div>
   <div class="card"><h2>Français interactif</h2><p class="mut" style="margin-top:0">UT Austin, sous licence CC BY : ${FI_VOC.length} listes de mots enregistrées, ${FI_PHO.length} leçons de prononciation et ${FI_LISTEN.length} écoutes, placées dans les leçons d'Assimil sur le même thème (étape « Français interactif »).</p>
    <p><a target="_blank" rel="noopener" href="https://www.laits.utexas.edu/fi/">laits.utexas.edu/fi</a> · <a target="_blank" rel="noopener" href="${TEX}">Tex's French Grammar</a></p></div>`;
};

// the lesson where a verb first appears in the Assimil lexicon (the conjugation trainer opens it there); être and avoir from lesson 1
let VERB_AT = null;
window.verbLesson = inf => { if (inf === "être" || inf === "avoir") return 1;
  if (!VERB_AT) { VERB_AT = {}; VOCAB.filter(v => /^as/.test(v.id) && v.lessons).forEach(v => { const w = v.fr.replace(/\s*\(.*?\)\s*/g, " ").trim(); const k = Math.min(...v.lessons); if (!VERB_AT[w] || k < VERB_AT[w]) VERB_AT[w] = k; }); }
  return VERB_AT[inf] || VERB_AT["s'" + inf] || 999; };
