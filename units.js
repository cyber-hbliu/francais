"use strict";
// « Mon unité » : the three A1 books worked through together, one unit at a time (30 units, about 66 study days).
// Grammaire progressive is the main line, in its own order, with its 8 bilans in place. Communication progressive follows
// in its order, each dialogue only once the tenses it uses have been studied; the 7 acts whose grammar the grammar book
// does not cover come last, learnt as whole expressions. Vocabulaire progressif starts at unit 2, one unit on the topic
// of the dialogue (narrow reading). The material at the back of the books goes where its grammar has been studied.
// Inside a unit, nine steps, a quarter of the time for each of Nation's four strands.
window.PARCOURS = [
  // g: grammar chapters · c: Communication acts · v: Vocabulaire units · x: other material · d: study days
  { g: [1, 2, 3], c: [21], v: [], x: ["survie", "pho:6", "pho:10"], d: 2 },
  { g: [4, 5], c: [1], v: [1], x: ["pho:4", "pho:9"], d: 2 },
  { g: [6, 7], c: [2], v: [12], x: ["pho:1", "pho:2", "pho:3"], d: 2 },
  { g: [8, 9], c: [3], v: [13], x: ["pho:5", "pho:7", "pho:8", "gb1"], d: 2 },
  { g: [10, 11], c: [4], v: [14], x: ["pho:11", "pho:12", "pho:13"], d: 2 },
  { g: [12, 13], c: [5], v: [25], x: [], d: 2 },
  { g: [14, 15], c: [6], v: [9], x: [], d: 2 },
  { g: [16, 17, 18], c: [7], v: [18], x: [], d: 2 },
  { g: [19, 20], c: [8], v: [15], x: ["gb2", "gd158"], d: 2 },
  { g: [21, 22, 23], c: [9], v: [24], x: ["va2"], d: 3 },
  { g: [24, 25], c: [10, 11], v: [20], x: [], d: 2 },
  { g: [26, 27], c: [12], v: [27], x: ["gb3"], d: 2 },
  { g: [28, 29, 30, 31], c: [18], v: [2], x: ["gd161", "annexe:8"], d: 3 },
  { g: [32, 33, 34], c: [26], v: [17], x: ["gb4", "annexe:9", "va1"], d: 2 },
  { g: [35, 36, 37, 38], c: [30], v: [28], x: ["gd163"], d: 3 },
  { g: [39, 40, 41, 42], c: [24], v: [6], x: ["gb5", "gd165", "annexe:5"], d: 3 },
  { g: [43], c: [13], v: [26], x: ["va3"], d: 2 },
  { g: [44, 45], c: [17], v: [21], x: ["gd166", "gd168", "va6"], d: 2 },
  { g: [46], c: [29], v: [7], x: ["gd167", "va4"], d: 3 },
  { g: [47], c: [35], v: [8], x: ["ca1", "ca2"], d: 2 },
  { g: [48, 49], c: [14, 19], v: [19, 22], x: ["gb6", "gd169", "va9"], d: 3 },
  { g: [50, 51], c: [39, 32], v: [4], x: ["annexe:7", "ca3"], d: 2 },
  { g: [52, 53], c: [36, 27], v: [5], x: ["annexe:1", "annexe:2", "annexe:6", "va7"], d: 2 },
  { g: [54], c: [25], v: [11], x: ["gb7", "annexe:3", "ca4", "ca5"], d: 2 },
  { g: [55, 56], c: [16, 31], v: [10], x: ["va8", "ca6"], d: 2 },
  { g: [57, 58], c: [23, 15], v: [23], x: ["annexe:4", "ca7", "ca8"], d: 2 },
  { g: [59, 60], c: [34, 37], v: [16, 3], x: ["gb8", "va5", "ca9"], d: 2 },
  { g: [], c: [20, 22], v: [], x: ["gconj", "coral"], d: 2 },
  { g: [], c: [28, 33], v: [], x: ["gsong"], d: 2 },
  { g: [], c: [38, 40], v: [], x: ["gtest", "ctest", "vtest", "delf"], d: 2 },
];
const NU = PARCOURS.length;
const XCAT = Object.fromEntries(EXTRAS.map(([id, book, title, a, b, track]) => [id, { id, book, title, a, b, track }]));
const U = k => { const p = PARCOURS[k - 1]; return Object.assign({ k, title: p.c.map(n => COMM[n - 1].title).join(" · "), topic: p.v.map(n => VP_UNITS[n - 1].title).join(" · "),
  pho: p.x.filter(x => /^pho:/.test(x)).map(x => +x.slice(4)), annexe: p.x.filter(x => /^annexe:/.test(x)).map(x => +x.slice(7)),
  bilans: p.x.filter(x => /^gb\d$/.test(x)), texts: p.x.filter(x => /^(gd|va|ca|gsong|coral)/.test(x)), tests: p.x.filter(x => /test$|^delf$|^gconj$/.test(x)) }, p); };
window.curUnit = () => Math.min(NU, Math.max(1, S.cur || 1));
// where each piece of the books is studied (french.js unlocks conjugation, dictation… from these)
window.UNIT_OF = { g: {}, c: {}, v: { 0: 1 } };
PARCOURS.forEach((p, i) => { p.g.forEach(n => UNIT_OF.g[n] = i + 1); p.c.forEach(n => UNIT_OF.c[n] = i + 1); p.v.forEach(n => UNIT_OF.v[n] = i + 1); });
UNIT_OF.g[60] = UNIT_OF.g[60] || 27;

// ---------- the nine steps (minutes for a 2-day unit; a 3-day unit gets half as much again) ----------
const STEPS = [
  ["pho", "study", 20, "Prononciation et répétition", "Un son difficile, puis le dialogue phrase par phrase : l'original, vous, l'original."],
  ["gram", "study", 40, "Grammaire", "Les règles et les exemples des chapitres, les exercices une fois avec le corrigé, le bilan s'il y en a un."],
  ["cartes", "study", 20, "Cartes", "Manières de dire, phrases du dialogue et mots du livre : 15 à 20 nouvelles par jour, mélangées avec les unités précédentes."],
  ["ecoute", "input", 30, "Écouter et lire le dialogue", "Une première fois avec la traduction pour tout comprendre, puis deux fois en français seulement."],
  ["texte", "input", 30, "Lire le texte du Vocabulaire", "La page de texte du Vocabulaire progressif sur le même thème, puis ses exercices."],
  ["textes", "input", 20, "Les textes à la fin des livres", "Les dialogues et textes enregistrés que l'unité permet de comprendre."],
  ["role", "output", 25, "Jeu de rôle", "L'ordinateur joue un rôle, vous l'autre, puis on échange : trois fois."],
  ["ecrire", "output", 55, "À vous ! et écriture", "L'activité « À vous ! » à l'oral, puis 5 à 8 phrases écrites, corrigées sur un seul point, réécrites de mémoire."],
  ["fluide", "fluency", 80, "Fluidité", "Seulement du connu : le dialogue de l'unité précédente plus vite, le récit 3/2/1½, les jeux de rôle d'avant."],
];
const STRAND_FR = { study: "Étude de la langue", input: "Écoute et lecture", output: "Production", fluency: "Fluidité" };
const stepsOf = k => STEPS.filter(([s]) => s !== "textes" || U(k).texts.length || U(k).tests.length);
const stepMin = (k, m) => Math.round(m * U(k).d / 2);
// the unit's cards: the book's words (Vocabulaire index, the Vocabulaire boxes of Communication) and Manières de dire.
// Français interactif only lends its recordings to these words.
window.unitWordIds = k => { const u = U(k); return ALL.filter(id => { const it = ITEMS[id]; return it.kind === "v" && it.v.src !== "FI" && (u.v.includes(it.unit) || u.c.some(n => it.unit === "c" + n) || (u.x.includes("survie") && it.unit === 0)); }); };
window.wordOrder = (a, b) => rankOf(a) - rankOf(b);
const passed = id => card(id) && card(id).reps >= 1 || isMature(id);
function stepDone(k, s) {
  if ((S.ustep || {})[k + ":" + s]) return true;
  if (s === "cartes") { const ids = unitWordIds(k); return ids.length > 0 && ids.filter(passed).length >= ids.length * 0.8; }
  if (s === "ecrire") return !!((S.uwrite || {})[k] || {}).rw;
  return false;
}
const unitPct = k => { const st = stepsOf(k); return st.filter(([s]) => stepDone(k, s)).length / st.length; };
const stepSecs = (k, s) => (S.stepSecs || {})[k + ":" + s] || 0;
window.tickStep = (k, s, v) => { S.ustep = S.ustep || {}; if (v) S.ustep[k + ":" + s] = Date.now(); else delete S.ustep[k + ":" + s]; save(); renderHome(); };
window.setUnit = k => { S.cur = Math.min(NU, Math.max(1, +k)); save(); go("today"); };
// the step being worked on: its time goes to its strand (app.js tick), whatever page it opens
window.STEP = null;
window.stepFinish = () => { if (STEP) { S.ustep = S.ustep || {}; S.ustep[STEP.k + ":" + STEP.s] = Date.now(); save(); } };
const stepEnd = (k, s) => `<div class="row" style="margin-top:8px"><button class="b ok" onclick="tickStep(${k},'${s}',true);go('today')">✓ Étape terminée</button><button class="b s" onclick="go('today')">← Mon unité</button></div>`;
window.doStep = (k, s) => {
  const u = U(k), a = u.c[0], st = STEPS.find(x => x[0] === s);
  go("today"); // leaves any activity running
  if (s === "pho") u.pho.length && !(S.ustep || {})[k + ":pho1"] ? openPho(u.pho[0]) : openComm(a, null, "shadow", 0);
  else if (s === "gram") unitGram(k);
  else if (s === "cartes") { WU = k; go("uwords"); }
  else if (s === "ecoute") openComm(a, null, "listen", 0);
  else if (s === "texte") unitTexte(k);
  else if (s === "textes") unitTextes(k);
  else if (s === "role") openComm(a, null, "role", 0);
  else if (s === "ecrire") unitWrite(k);
  else if (s === "fluide") unitFluency(k);
  STEP = { k, s, strand: st[1], t: Date.now() };
};
// new cards: units reached so far (the current one once its dialogue has been heard), mixed across units, and at most
// 6 a day from each unit first (the day's total, 15–20, is set by newQuota), so that a topic's words (days, colours, fruit…) are spread over several days
window.parcoursNew = () => {
  const cur = curUnit(), t0 = new Date().setHours(0, 0, 0, 0), lists = [];
  for (let k = 1; k <= cur; k++) {
    if (k === cur && k > 1 && !stepDone(k, "ecoute")) break;
    const ids = unitWordIds(k), today = ids.filter(id => card(id) && card(id).first >= t0).length;
    lists.push({ ids: ids.filter(id => !card(id)).sort(wordOrder), left: Math.max(0, 6 - today) });
  }
  const out = []; let more = true;
  lists.reverse(); // the current unit first
  while (more) { more = false; for (const l of lists) if (l.left > 0 && l.ids.length) { out.push(l.ids.shift()); l.left--; more = true; } }
  // then the rest, so that the day's total (newQuota: 15–20) is reached even when a single unit has new words
  for (const l of lists) out.push(...l.ids);
  return out;
};

// ---------- the material of a unit: exercise sheets, texts, annexes ----------
// an exercise sheet: answer, then compare with the book's corrigé (no cards: the bilans test again later)
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
const xEntry = id => (window.XT || {})[id];
const xText = (id, withTitle = true) => { const x = xEntry(id), c = XCAT[id];
  if (!x || !x.entered) return `<div class="sitbox"><h3>${esc(c.title)} <span class="mut" style="font-weight:400">· ${BOOKNAME[c.book]} p. ${c.a}${c.b > c.a ? "–" + c.b : ""}</span></h3><p class="mut">Pas encore importé.</p><div class="row">${saisieBtn("extra", id)}</div></div>`;
  const tr = String(x.track || c.track || "").split(/[,;\s]+/).filter(Boolean);
  return `<div class="sitbox">${withTitle ? `<h3>${esc(c.title)} <span class="mut" style="font-weight:400">· p. ${c.a}${c.b > c.a ? "–" + c.b : ""}${tr.length ? " · piste " + tr.join(", ") : ""}</span></h3>` : ""}
    ${tr.map(t => audioTag(c.book, t)).join("")}
    ${x.lines.length ? `<div class="mini">${x.lines.map(l => l.who ? `<p><span class="who2">${esc(l.who)}</span> ${spk(l.text)} ${esc(l.text)}${l.en ? `<br><span class="mut">${esc(l.en)}</span>` : ""}</p>` : `<p>${spk(l.text)} ${hl(l.text)}${l.en ? `<br><span class="mut">${esc(l.en)}</span>` : ""}</p>`).join("")}</div>` : ""}
    ${x.ex.length ? exSheet("x:" + id, x.ex) : ""}${x.acts ? actsHTML(id, x.acts) : ""}<div class="row">${saisieBtn("extra", id)}</div></div>`; };
// the book's CD tracks: audio/comm, audio/gram, audio/voc on this computer, else the private audio repository (sync.js)
window.audioTag = (book, t) => { const src = `audio/${{ comm: "comm", gram: "gram", vocab: "voc" }[book]}/${String(t).padStart(2, "0")}.mp3`;
  return `<audio controls preload="none" src="${src}" style="width:100%" onerror="window.bookAudioFallback&&bookAudioFallback(this,'${src}')"></audio>`; };
const lessonHTML = l => `<div class="sitbox"><h3 style="margin:0 0 4px">${l.n}. ${esc(l.title)} <span class="mut" style="font-weight:400">· p. ${l.page}</span></h3><p class="mut" style="margin:0">${l.subs.map(esc).join(" · ")}</p>
  ${l.entered ? `<ul>${l.rules.map(r => `<li>${hl(r)}</li>`).join("")}</ul>${l.examples.length ? `<h4>Exemples</h4>${l.examples.map(e => `<p>${spk(plain(e[0]))} ${hl(e[0])}${e[1] ? `<br><span class="mut">${esc(e[1])}</span>` : ""}</p>`).join("")}` : ""}` : `<p class="mut">Chapitre pas encore importé.</p><div class="row">${saisieBtn("gram", l.n)}</div>`}</div>`;
const annexeHTML = u => u.annexe.length ? `<div class="sitbox"><h3>Annexes grammaticales : ${u.annexe.map(i => `${i}. ${esc(ANNEXES[i - 1])}`).join(" · ")}</h3>${xEntry("gannexe") && xEntry("gannexe").entered ? `<p class="mut">Lisez ${u.annexe.length > 1 ? "ces points" : "ce point"} dans les annexes, p. 152–153 :</p>` : ""}${xText("gannexe", false)}</div>` : "";
function unitPage(k, title, sub, body, s) {
  view.innerHTML = `<p class="backlink"><a href="#" onclick="go('today');return false">← Mon unité</a></p><h1>${esc(title)}</h1><p class="sub">${esc(sub)}</p>${body}${stepEnd(k, s)}`;
  scrollTo(0, 0);
}
window.unitGram = k => {
  const u = U(k), ls = u.g.map(g => LESSONS[g - 1]);
  const body = ls.map(l => `<div class="card">${lessonHTML(l)}${l.ex.length ? `<h4>Exercices</h4>${exSheet("g:" + l.id, l.ex)}` : ""}
     <p class="mut">Exercices en ligne du livre (3e édition) · <a target="_blank" rel="noopener" href="${TEX}?s=${encodeURIComponent(l.subs[0].replace(/[«»]/g, "").split(/[;:(]/)[0].trim())}">Tex's French Grammar</a></p></div>`).join("")
    + (u.annexe.length ? `<div class="card">${annexeHTML(u)}</div>` : "")
    + u.bilans.map(b => `<div class="card"><h2>${esc(XCAT[b].title)}</h2>${xText(b, false)}</div>`).join("")
    + (u.c.some(n => COMM[n - 1].gramCol) ? `<div class="card"><p class="mut" style="margin:0">Grammaire du dialogue (colonne du livre) : ${u.c.map(n => `Communication ${n} — ${esc(COMM[n - 1].gramCol)}`).join(" · ")}${k >= 28 ? ". Pas dans la Grammaire progressive : ces tournures s'apprennent comme des phrases entières." : ""}</p></div>` : "")
    + (!ls.length && u.x.includes("gconj") ? `<div class="card"><h2>Tableau des conjugaisons</h2>${xText("gconj", false)}<p><button class="b s" onclick="openConj()">Conjugaison</button></p></div>` : "");
  unitPage(k, "Grammaire", `Unité ${k} · chapitres ${u.g.join(", ") || "—"}`, body || `<div class="card"><p class="mut">Pas de nouveau chapitre dans cette unité : révisez avec la conjugaison.</p><button class="b s" onclick="openConj()">Conjugaison</button></div>`, "gram");
};
window.unitTexte = k => {
  const u = U(k);
  const body = u.v.length ? u.v.map(n => { const vu = VP_UNITS[n - 1];
    return `<div class="card"><h2>Vocabulaire ${n} · ${esc(vu.title)} <span class="mut" style="font-weight:400;font-size:15px">· p. ${vu.page}</span></h2>
     ${vu.texte.length ? `<div class="vtext">${vu.texte.map(l => `<p>${spk(l)} ${esc(l)}</p>`).join("")}</div><p><button class="b s" onclick="speakAll(${n})">▶ Écouter tout le texte</button></p>` : `<p class="mut">Texte pas encore importé.</p>`}
     ${vu.exos.length ? `<h3>Exercices</h3>${exSheet("v:" + n, vu.exos)}` : ""}<div class="row">${saisieBtn("vocab", n)}</div></div>`; }).join("")
    : `<div class="card"><p>Pas d'unité du Vocabulaire progressif ici${k === 1 ? " : il commence à l'unité 2, quand les phrases au présent se lisent déjà" : ""}. Relisez plutôt les Manières de dire et le dialogue.</p></div>`;
  unitPage(k, "Lire le texte du Vocabulaire", `Unité ${k} · ${u.topic || "—"}`, body, "texte");
};
window.speakAll = async n => { speechSynthesis.cancel(); for (const l of VP_UNITS[n - 1].texte) await sayP(l, "A"); };
window.unitTextes = k => {
  const u = U(k);
  const body = u.texts.map(id => `<div class="card">${xText(id)}</div>`).join("")
    + u.tests.map(id => id === "delf" ? `<div class="card"><h3>DELF A1 · sujet d'exemple</h3><p><a target="_blank" rel="noopener" href="https://www.france-education-international.fr/diplome/delf-tout-public/niveau-a1">France Éducation international · DELF A1</a> : écoute et lecture, chronométrées.</p><button class="b s" onclick="openExam('A1')">Noter mon score</button></div>`
      : `<div class="card">${xText(id)}</div>`).join("");
  unitPage(k, u.tests.length ? "Textes et tests" : "Les textes à la fin des livres", `Unité ${k}`, body, "textes");
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
// one point to correct in writing: the grammar of the unit (the last chapter studied, for the units without a chapter)
const focusNow = () => { const gs = PARCOURS.slice(0, curUnit()).flatMap(p => p.g), l = LESSONS[(gs[gs.length - 1] || 1) - 1]; return plain(l.subs[0]).replace(/\s+/g, " ").trim(); };
// o: { key, store, label } — the text lives in S[store][key] = { t, c, rw, at, u }
window.corrFlow = (store, key, prompt) => {
  const e = ((S[store] || {})[key]) || {};
  return `<div class="corr" data-store="${store}" data-key="${key}">
   <textarea class="cf-t" rows="7" lang="fr" spellcheck="false" placeholder="${esc(prompt || "Écrivez ici…")}">${esc(e.t || "")}</textarea>
   <p class="row"><span class="mut cf-n">${nWords(e.t || "")} mots</span><button class="b s" onclick="cfCopy(this)">Copier pour la correction</button><span class="mut cf-msg"></span></p>
   <details ${e.c ? "open" : ""}><summary>Texte corrigé</summary>
    <p class="mut">Point de correction (la grammaire de l'unité) : <b>${esc(focusNow())}</b>. Collez ici le texte corrigé (par un francophone, un professeur ou Claude).</p>
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
  const txt = `Corrige ce texte en français (je suis débutant, niveau A1). Ne corrige que les erreurs et garde mes phrases. Point de correction prioritaire : ${focusNow()}. Donne seulement le texte corrigé.\n\n${e.t || ""}`;
  try { await navigator.clipboard.writeText(txt); box.querySelector(".cf-msg").textContent = "Copié ✓"; } catch (x) { box.querySelector(".cf-msg").textContent = "Copie impossible : sélectionnez le texte à la main."; }
};
window.cfCompare = btn => { const box = cfBox(btn), e = cfGet(box); box.querySelector(".cf-cmp").innerHTML = `<p class="diff">${wordDiff(e.c || "", e.rw || "")}</p><p class="mut"><del>barré</del> = oublié · <ins>souligné</ins> = différent du texte corrigé</p>`; };
window.unitWrite = k => {
  const u = U(k), tasks = u.c.map(n => COMM[n - 1]).filter(c => c.task || c.acts);
  const body = `<div class="card"><h2>À vous !</h2>${tasks.length ? tasks.map(c => `<p style="white-space:pre-line">${esc(c.task || "")}</p>${c.acts ? actsHTML(c.n, c.acts.split("\n").filter(l => /À vous|Communication/.test(l) || /^\s/.test(l)).join("\n")) : ""}`).join("") : `<p class="mut">Les activités « À vous ! » et « Communication » viennent de l'import de la Communication progressive.</p>`}
     <p>Faites-la d'abord <b>à l'oral</b>, à voix haute. ${typeof recWidget === "function" ? recWidget("uwr") : ""}</p></div>
   <div class="card"><h2>Écrire</h2><p>5 à 8 phrases sur le même sujet, avec les mots et les tournures de l'unité.</p>${corrFlow("uwrite", k, "J'écris 5 à 8 phrases…")}</div>`;
  unitPage(k, "À vous ! et écriture", `Unité ${k} · ${u.title}`, body, "ecrire");
};

// ---------- fluency: only material already known (the previous unit and before) ----------
window.unitFluency = k => {
  const prev = k > 1 ? U(k - 1) : null, replay = [k - 1, k - 3].filter(j => j >= 1).map(U);
  const roleBtn = (j, n) => { const key = `${k}:replay${j}`, d = (S.ustep || {})[key];
    return `<div class="todo ${d ? "done" : ""}"><input type="checkbox" ${d ? "checked" : ""} onchange="tickStep(${k},'replay${j}',this.checked)" aria-label="fait"><div class="t" style="flex:1">Rejouer le jeu de rôle de l'unité ${j} · ${esc(COMM[n - 1].title)}</div><button class="b s" onclick="openComm(${n},null,'role',0)">Jeu de rôle</button></div>`; };
  const body = !prev ? `<div class="card"><p>Première unité : rien de connu encore. Revoyez le kit de survie à voix haute, vite, et présentez-vous en une minute.</p><div class="row"><button class="b s" onclick="openEclair()">Révision éclair</button><button class="b s" onclick="openComm(21,null,'retell',0)">Me présenter</button></div></div>`
    : `<div class="card"><h2>Le dialogue de l'unité ${prev.k}, plus vite</h2>${prev.c.map(n => `<div class="todo"><div class="t" style="flex:1"><b>${n}. ${esc(COMM[n - 1].title)}</b></div><button class="b s" onclick="relisten(${n},1.15)">×1,15</button><button class="b s" onclick="relisten(${n},1.3)">×1,3</button><button class="b s" onclick="openComm(${n},null,'retell',0)">Raconter 3/2/1½</button></div>`).join("")}</div>
     <div class="card"><h2>Jeux de rôle d'avant</h2><p class="mut">Un jeu de rôle se refait une unité plus tard, puis trois unités plus tard.</p>${replay.map(p => roleBtn(p.k, p.c[0])).join("")}</div>
     <div class="card"><h2>Écriture rapide · deux fois par semaine</h2><p class="mut">10 minutes sans s'arrêter sur un sujet facile ; on compte les mots.</p><div class="row"><button class="b s" onclick="openEcrire('fluency')">Écrire 10 minutes</button><button class="b s" onclick="openGenre()">Genre éclair</button>${UNIT_OF.g[28] < k ? `<button class="b s" onclick="openNombres()">Nombres à l'oreille</button>` : ""}<button class="b s" onclick="openEclair()">Révision éclair</button></div></div>`;
  unitPage(k, "Fluidité", "Seulement du connu, plus vite", body, "fluide");
};

// ---------- home: progress, then the current unit ----------
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
// expected end of the A1, from the steps done over the last 7 days (6 study days a week)
window.unitPace = () => {
  const wk = Date.now() - 7 * DAY, done = Object.entries(S.ustep || {}).filter(([k, t]) => !/replay|pho1/.test(k) && t >= wk).length;
  let left = 0; for (let k = 1; k <= NU; k++) left += stepsOf(k).filter(([s]) => !stepDone(k, s)).length;
  if (!left) return "A1 terminé 🎉";
  const per = done / 6, base = PARCOURS.slice(curUnit() - 1).reduce((a, p) => a + p.d, 0);
  const days = per >= 0.5 ? Math.ceil(left / per) : base;
  return `Fin prévue des trois livres : <b>${studyDays(dstr(), dAdd(dstr(), days * 2 + 7))[Math.max(0, days - 1)] ? fmtDate(studyDays(dstr(), dAdd(dstr(), days * 2 + 7))[days - 1]) : "—"}</b> <span class="mut">(${per >= 0.5 ? "à votre rythme des 7 derniers jours" : "au rythme prévu d'environ " + base + " jours d'étude"})</span>`;
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
    <div class="stat"><b>${k}<span class="mut" style="font-size:15px;font-weight:400"> / ${NU}</span></b>unité en cours · ${done} terminée${done > 1 ? "s" : ""}</div>
    <div class="stat"><b>${streak()}</b>jours d'affilée</div>
    <div class="stat"><b>${fmtDur(t.total)}</b>au total · ${Math.round(t.today / 60)} min aujourd'hui</div>
    <div class="stat"><b>${known}</b>mots retenus (≥ 1 semaine)</div></div>
   <div class="bar" title="Les trois livres"><i style="width:${(done + unitPct(k)) / NU * 100}%"></i></div>
   <p style="margin:6px 0 14px">${unitPace()}</p>
   ${learningCurve()}
   <h3 style="margin-top:16px">Les quatre piliers</h3>${strandWeek()}
   ${due ? `<p class="row" style="margin-top:14px"><button class="b s" onclick="startReview('due')">Réviser ${due} carte${due > 1 ? "s" : ""} du jour</button><span class="mut">avant ou après l'unité</span></p>` : ""}
   ${recs ? `<details style="margin-top:10px"><summary>Dernières séances</summary><ul>${recs}</ul></details>` : ""}${backup}</div>`;
}
const linesHTML = lines => `<div class="mini">${withAB(lines).map(l => `<p><span class="who2 ${l.ab === "A" ? "" : "b2"}">${esc(l.who)}</span> ${spk(l.text)} ${esc(l.text)}${l.en ? `<br><span class="mut">${esc(l.en)}</span>` : ""}</p>`).join("")}</div>`;
function unitModules(k) {
  const u = U(k), acts = u.c.map(n => COMM[n - 1]), ls = u.g.map(g => LESSONS[g - 1]);
  const missing = [...acts.filter(c => !c.entered).map(c => `Communication ${c.n}`), ...ls.filter(l => !l.entered).map(l => `Grammaire ${l.n}`), ...u.v.filter(v => !VP_UNITS[v - 1].entered).map(v => `Vocabulaire ${v}`)];
  const dlg = acts.map(c => c.dlgs.map((d, j) => `<div class="sitbox"><div class="row" style="justify-content:space-between"><h3 style="margin:0">${esc(d.sit)} <span class="mut" style="font-weight:400">· Communication ${c.n} · p. ${d.page}</span></h3>
     <div class="row"><button class="b s" onclick="openComm(${c.n},null,'listen',${j})">▶ Écouter</button><button class="b s" onclick="openComm(${c.n},null,'shadow',${j})">Répéter</button><button class="b s" onclick="openComm(${c.n},null,'role',${j})">Jeu de rôle</button></div></div>
     ${d.lines.length ? linesHTML(d.lines) : `<p class="mut">Dialogue pas encore importé.</p>`}${d.remarque ? `<p class="note" style="white-space:pre-line">${esc(d.remarque)}</p>` : ""}</div>`).join("")).join("");
  const ex = acts.flatMap(c => c.ex), md = ex.length ? `<table>${ex.map(([fr, en]) => `<tr><td style="width:44px">${spk(fr)}</td><td><b>${esc(fr)}</b></td><td class="mut">${esc(en || "")}</td></tr>`).join("")}</table>` : `<p class="mut">Pas encore importées.</p>`;
  const boxes = acts.filter(c => c.gbox || c.vbox).map(c => `<div class="sitbox">${c.gbox ? `<p><b>Grammaire</b> <span class="mut">(encadré du livre)</span><br><span style="white-space:pre-line">${esc(c.gbox)}</span></p>` : ""}${c.vbox ? `<p><b>Vocabulaire</b> <span class="mut">(encadré du livre)</span><br><span style="white-space:pre-line">${esc(c.vbox)}</span></p>` : ""}</div>`).join("");
  const nw = unitWordIds(k), seen = nw.filter(passed).length;
  return `${missing.length ? `<div class="card note"><b>Contenu à importer :</b> ${missing.join(", ")}. <span class="mut">Plus → Livres → « Importer tout le livre ».</span></div>` : ""}
   <div class="card" id="mod-dlg"><h2><i class="dot" style="background:var(--input)"></i> Dialogue${acts.reduce((a, c) => a + c.dlgs.length, 0) > 1 ? "s" : ""}</h2>${dlg}</div>
   <div class="card" id="mod-langue"><h2><i class="dot" style="background:var(--study)"></i> Manières de dire</h2>${md}${boxes}</div>
   <div class="card" id="mod-gram"><h2><i class="dot" style="background:var(--study)"></i> Grammaire</h2>${ls.map(lessonHTML).join("") || `<p class="mut">${k >= 28 ? "Les tournures de ces dialogues s'apprennent comme des phrases entières." : "—"}</p>`}${annexeHTML(u)}</div>
   <div class="card"><h2><i class="dot" style="background:var(--study)"></i> Vocabulaire</h2><p>${esc(u.topic || "—")} · <b>${nw.length}</b> mots et expressions du livre · ${seen} déjà réussis une fois</p>
    <p class="row"><button class="b s" onclick="WU=${k};go('uwords')">Voir les mots de l'unité</button></p></div>`;
}
window.renderHome = () => {
  STEP = null;
  const k = curUnit(), u = U(k), st = stepsOf(k), next = st.find(([s]) => !stepDone(k, s));
  view.innerHTML = homeProgress(k) + `<div class="card unitcard">
   <div class="row" style="justify-content:space-between"><span class="tag">Unité ${k} sur ${NU} · ${u.d} jours</span>
    <select onchange="setUnit(this.value)" aria-label="Changer d'unité">${PARCOURS.map((_, i) => `<option value="${i + 1}" ${i + 1 === k ? "selected" : ""}>${unitPct(i + 1) === 1 ? "✓ " : ""}${i + 1}. ${esc(U(i + 1).title)}</option>`).join("")}</select></div>
   <h1 style="margin-top:10px">${esc(u.title)}</h1>
   <p class="sub">${u.g.length ? "Grammaire " + u.g.join(", ") + " · " : ""}Communication ${u.c.join(", ")}${u.v.length ? " · Vocabulaire " + u.v.join(", ") + " (" + esc(u.topic) + ")" : ""}</p>
   <div class="bar" style="margin:14px 0 6px"><i style="width:${unitPct(k) * 100}%"></i></div>
   <div class="steps">${st.map(([s, strand, m, label, hint], i) => { const d = stepDone(k, s), used = Math.round(stepSecs(k, s) / 60), now = next && next[0] === s; return `<div class="todo ${d ? "done" : ""}">
     <input type="checkbox" ${d ? "checked" : ""} onchange="tickStep(${k},'${s}',this.checked)" aria-label="${esc(label)}">
     <div style="flex:1"><div class="t"><b>${i + 1}. ${esc(label)}</b></div><div class="mut" style="font-size:14px">${esc(hint)}</div>
      <div class="smeta"><span style="color:var(--${strand})"><i class="dot" style="background:var(--${strand})"></i> ${STRAND_FR[strand]}</span> · ${stepMin(k, m)} min prévues${used ? ` · ${used} min faites` : ""}</div></div>
     <button class="b ${now ? "" : "s"}" onclick="doStep(${k},'${s}')">${now ? "Commencer" : "Ouvrir"}</button></div>`; }).join("")}</div>
   ${!next ? `<p class="row"><b class="good">Unité terminée ✅</b>${k < NU ? `<button class="b" onclick="setUnit(${k + 1})">Unité suivante →</button>` : ""}</p>` : ""}</div>` + unitModules(k);
};

// ---------- Mots: the unit's words, the error notebook, the dictionary ----------
window.WU = 0;
window.toggleCarnet = id => { S.carnet = S.carnet || {}; if (S.carnet[id]) delete S.carnet[id]; else S.carnet[id] = Date.now(); save(); const b = document.querySelector(`[data-cn="${id}"]`); if (b) b.textContent = S.carnet[id] ? "★" : "☆"; };
const star = id => `<button class="b s starb" data-cn="${id}" title="Carnet d'erreurs" onclick="toggleCarnet('${id}')">${(S.carnet || {})[id] ? "★" : "☆"}</button>`;
const wRow = id => { const v = ITEMS[id].v; return `<tr><td style="width:44px">${spk(v.fr)}</td><td><b>${frHTML(v.fr, v.pos)}</b>${v.pos ? ` <span class="mut">(${esc(v.pos)})</span>` : ""}</td><td>${esc(v.en || "")}</td><td class="mut">${wordState2(v)}</td><td style="width:52px">${star(id)}</td></tr>`; };
window.renderUnitWords = () => {
  const k = WU || curUnit(), u = U(k), ids = unitWordIds(k);
  const groups = [["Vocabulaire progressif — les mots du livre", ids.filter(id => /^vp/.test(ITEMS[id].v.id))],
    ["Communication progressive — Manières de dire et encadrés Vocabulaire", ids.filter(id => /^c[mv]/.test(ITEMS[id].v.id))],
    ["Kit de survie", ids.filter(id => ITEMS[id].unit === 0)]];
  const nNew = ids.filter(id => !card(id)).length, due = ids.filter(isDue).length;
  view.innerHTML = `<div class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">Mots de l'unité ${k}</h2>
    <select onchange="WU=+this.value;renderUnitWords()" aria-label="Unité">${PARCOURS.map((_, i) => `<option value="${i + 1}" ${i + 1 === k ? "selected" : ""}>${i + 1}. ${esc(U(i + 1).title)}</option>`).join("")}</select></div>
   <p class="sub">${esc(u.topic || u.title)} · ${ids.length} mots et expressions · ${nNew} nouveaux · ${due} à réviser</p>
   ${k === curUnit() && k > 1 && !stepDone(k, "ecoute") ? `<p class="note">Écoutez d'abord le dialogue de l'unité : les mots s'apprennent mieux une fois rencontrés dans un texte.</p>` : ""}
   <p class="row"><button class="b" onclick="startReview('due')">Cartes du jour (${dueIds().length} à revoir · nouvelles mélangées)</button><button class="b s" onclick="startReview('pu:${k}')" ${ids.length ? "" : "disabled"}>Seulement cette unité</button>
    <input type="text" id="wq" placeholder="Rechercher dans tous les mots…" style="flex:1;min-width:200px"></p>
   <p class="mut">Les nouvelles cartes (15 à 20 par jour) viennent de toutes les unités déjà atteintes, mélangées : 6 par unité d'abord, puis le reste quand une seule unité a encore des mots nouveaux. ☆ = carnet d'erreurs.</p></div><div id="wres"></div>`;
  const list = () => groups.filter(g => g[1].length).map(([t, g]) => `<div class="card"><h3>${t}</h3><div style="overflow-x:auto"><table>${g.sort(wordOrder).map(wRow).join("")}</table></div></div>`).join("") || `<div class="card"><p class="mut">Pas encore de mots pour cette unité : importez l'index du Vocabulaire progressif et la Communication progressive (Plus → Livres).</p></div>`;
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
    <p class="mut">Quelques phrases en français sur votre journée, avec ce que vous savez${e.u ? ` · écrit pendant l'unité ${e.u}` : ""}.</p>
    ${corrFlow("journal", JD, "Aujourd'hui, je…")}
    ${hints.length ? `<p class="mut" style="margin-bottom:4px">Mots de l'unité ${k} à réutiliser :</p><div>${hints.map(w => `<button class="chip jw" onclick='jIns(${JSON.stringify(w + " ").replace(/'/g, "&#39;")})'>${esc(w)}</button>`).join("")}</div>` : ""}</div>`;
};

go("today");

// ---------- Plus → Livres: the three books side by side, each entry with its state and its unit ----------
let LB = "comm";
window.renderLivres = () => {
  const E = (S.book || {}), st = (kind, n) => { const e = ((E[kind] || {})[n]); return !e || e.cleared ? `<span class="tag">à importer</span>` : e.draft ? `<span class="tag">à vérifier</span>` : `<span class="tag good">vérifié</span>`; };
  const rows = LB === "gram" ? LESSONS.map(l => [`<a href="#" onclick="openLesson('${l.id}');return false">${l.n}. ${esc(l.title)}</a>`, st("gram", l.n), UNIT_OF.g[l.n], l.page])
    : LB === "comm" ? COMM.map(c => [`<a href="#" onclick="openComm(${c.n});return false">${c.n}. ${esc(c.title)}</a>`, st("comm", c.n), UNIT_OF.c[c.n], c.bookPages.join("–")])
    : VP_UNITS.map(u => [`<a href="#" onclick="openUnit(${u.n});return false">${u.n}. ${esc(u.title)}</a> <span class="mut">${u.book.length} mots</span>`, st("vocab", u.n), UNIT_OF.v[u.n], u.page]);
  const unitOfX = id => PARCOURS.findIndex(p => p.x.includes(id)) + 1;
  const xs = EXTRAS.filter(x => x[1] === LB).map(([id, , title, a, b]) => [`<a href="#" onclick="openSaisie('extra','${id}');return false">${esc(title)}</a>`, st("extra", id), unitOfX(id) || "—", a + (b > a ? "–" + b : "")]);
  const table = r => `<div style="overflow-x:auto"><table><tr><th></th><th>État</th><th>Unité</th><th>Pages</th></tr>${r.map(([a, b, c, d]) => `<tr><td>${a}</td><td>${b}</td><td>${c || "—"}</td><td class="mut">${d}</td></tr>`).join("")}</table></div>`;
  view.innerHTML = `<div class="row" role="tablist">${[["comm", "Communication progressive"], ["gram", "Grammaire progressive"], ["vocab", "Vocabulaire progressif"]].map(([k, l]) => `<button class="pill ${LB === k ? "on" : ""}" onclick="LB='${k}';renderLivres()">${l}</button>`).join("")}</div>
   ${bookCard(LB)}
   <div class="card"><h2>${LB === "comm" ? "40 actes de parole · 57 dialogues" : LB === "gram" ? "60 chapitres" : "28 unités"}</h2>${table(rows)}</div>
   <div class="card"><h2>Fin du livre${LB === "gram" ? ", bilans" : ""} et test</h2>${table(xs)}</div>`;
};
