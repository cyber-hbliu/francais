"use strict";
// The content of the three books, entered by you from your own copy (S.book; kept in localStorage, exported and synced
// with the rest of your progress, never published). applyBook() puts it into LESSONS / COMM / VOCAB before the cards are built.
// Entry format: one item per line; pairs as « français | traduction » (or « question | réponse »);
// dialogues as « Rôle : réplique » (optionally « | traduction »), several dialogues of one act separated by a line « --- ».

const bkLines = t => String(t || "").split("\n").map(x => x.trim()).filter(Boolean);
const bkPair = l => { const i = l.indexOf("|"); return i < 0 ? [l.trim(), ""] : [l.slice(0, i).trim(), l.slice(i + 1).trim()]; };
// « Le marchand : Bonjour… » → role + line; a line without a role continues the previous one
const ROLE_RE = /^([A-ZÀ-ÖØ-Þ][\wÀ-ÖØ-öø-ÿ'’.\-]*(?:\s+[\wÀ-ÖØ-öø-ÿ'’.\-«»]+){0,3})\s*:\s*(.+)$/;
function bkDialogue(txt) {
  const out = [];
  bkLines(txt).forEach(l => {
    const m = l.match(ROLE_RE), [t, en] = bkPair(m ? m[2] : l);
    if (m) out.push({ who: m[1].trim(), text: t, en });
    else if (out.length) { const o = out[out.length - 1]; o.text = (o.text + " " + t).trim(); if (en) o.en = (o.en ? o.en + " " : "") + en; }
  });
  return out;
}
// exercises: « # consigne » lines, then « question | réponse du corrigé » items
const bkExos = t => { let inst = ""; const out = []; bkLines(t).forEach(x => { if (x.startsWith("#")) inst = x.replace(/^#\s*/, ""); else out.push(bkPair(x).concat(inst)); }); return out; };
// Français interactif, only as a source of recordings (and of an English gloss) for the book's own words
let FI_BY = null;
const fiTwin = fr => { if (!FI_BY) { FI_BY = {}; (window.FI_VOC || []).forEach(s => s.words.forEach(w => { const k = bkKey(w[0]); if (!FI_BY[k]) FI_BY[k] = { en: w[1], audio: s.audio }; })); } return FI_BY[bkKey(fr)]; };
const fiAudio = fr => (fiTwin(fr) || {}).audio || "";
const fiGloss = fr => (fiTwin(fr) || {}).en || "";
// a word as the matching key between the book's list and Français interactif: no article, brackets, accents or punctuation
const bkKey = w => stripAccB(String(w).toLowerCase().replace(/\(.*?\)/g, "").replace(/^(le|la|les|un|une|des|du|de la|l'|l’)\s*/, "").replace(/[^a-zà-ÿ' -]/g, "")).replace(/\s+/g, " ").trim();
const stripAccB = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

window.applyBook = S => {
  const B = {}; for (const [k, units] of Object.entries(S.book || {})) B[k] = Object.fromEntries(Object.entries(units).filter(([, e]) => !e.cleared));
  Object.entries(B.gram || {}).forEach(([n, e]) => {
    const l = LESSONS.find(x => x.n === +n); if (!l) return;
    l.rules = bkLines(e.rules); l.examples = bkLines(e.examples).map(bkPair);
    l.ex = bkExos(e.ex);
    l.bookPage = e.page || ""; l.entered = !!(l.rules.length || l.examples.length || l.ex.length);
  });
  Object.entries(B.comm || {}).forEach(([n, e]) => {
    const c = COMM.find(x => x.n === +n); if (!c) return;
    const parts = String(e.dlg || "").split(/^\s*-{3,}\s*$/m), tracks = String(e.track || "").split(/[,;\s]+/).filter(Boolean);
    c.dlgs.forEach((d, k) => { d.lines = bkDialogue(parts[k]); d.track = tracks[k] || ""; });
    const rem = String(e.remarque || "").split(/^\s*-{3,}\s*$/m); c.dlgs.forEach((d, k) => d.remarque = (rem[k] || "").trim());
    c.ex = bkLines(e.ex).map(bkPair); c.task = (e.task || "").trim(); c.acts = e.acts || ""; c.bookPage = e.page || "";
    c.gbox = (e.gbox || "").trim(); c.vbox = (e.vbox || "").trim();
    c.entered = c.dlgs.some(d => d.lines.length);
    c.ex.forEach(([fr, en], k) => { const v = { id: `cm${c.n}_${k}`, unit: "c" + c.n, sec: "c" + c.n, theme: `Communication ${c.n} · ${c.title}`, fr, en, level: "A1", audio: fiAudio(fr), src: "livre" }; COMM_PHRASES.push(v); VOCAB.push(v); });
    // the words of the dialogue's « Vocabulaire » box (one per line, or separated by commas)
    bkLines(c.vbox).flatMap(l => l.includes("|") ? [l] : l.split(/\s*[,;]\s*/)).map(bkPair).filter(([fr]) => /[a-zà-ÿ]/i.test(fr) && fr.length <= 40)
      .forEach(([fr, en], k) => VOCAB.push({ id: `cv${c.n}_${k}`, unit: "c" + c.n, sec: "c" + c.n, theme: `Communication ${c.n} · ${c.title}`, fr, en: en || fiGloss(fr), level: "A1", audio: fiAudio(fr), src: "livre" }));
  });
  // Vocabulaire progressif: the book's words (from its Index), its text pages and its exercises.
  // Français interactif only lends its recording (and an English gloss) to a word it also has
  Object.entries(B.vocab || {}).forEach(([n, e]) => {
    const u = VP_UNITS[+n - 1]; if (!u) return;
    u.book = bkLines(e.words).map(bkPair).map(([w, en], k) => {
      const m = w.match(/^(.*?)\s*\(([^)]*)\)\s*$/), fr = m ? m[1] : w, pos = m ? m[2] : "";
      return { id: `vp${u.n}_${k}`, unit: u.n, theme: `${u.n}. ${u.title}`, sec: "vp" + u.n, fr, pos, en: en || fiGloss(fr), level: "A1", audio: fiAudio(fr), ex: "", src: "livre" };
    });
    u.texte = bkLines(e.texte); u.exos = bkExos(e.exos);
    u.bookPage = e.page || ""; u.entered = u.book.length > 0 || u.texte.length > 0;
    VOCAB.push(...u.book);
  });
  // the material at the back of the books, and their tests
  window.XT = {};
  Object.entries(B.extra || {}).forEach(([id, e]) => {
    const lines = bkLines(e.text).map(l => { const m = l.match(ROLE_RE), [t, en] = bkPair(m ? m[2] : l); return { who: m ? m[1].trim() : "", text: t, en }; });
    XT[id] = { track: e.track || "", lines, ex: bkExos(e.ex), acts: e.acts || "", entered: !!(lines.length || String(e.ex || "").trim() || String(e.acts || "").trim()) };
  });
};

// ---------------- entry page (Saisir le contenu du livre) ----------------
const BK_FIELDS = {
  gram: [["page", "Pages du livre", 1], ["rules", "Règles (une par ligne ; « … » pour surligner)", 8], ["examples", "Exemples (français | traduction)", 8], ["ex", "Exercices (« # consigne », puis un item par ligne : question | réponse du corrigé)", 12]],
  comm: [["page", "Pages du livre", 1], ["track", "Numéro(s) de piste du CD (un par dialogue : 4, 5)", 1], ["dlg", "Dialogue(s) — « Rôle : réplique » (| traduction) ; « --- » entre deux dialogues", 14], ["ex", "Manières de dire (français | traduction)", 8], ["task", "Activité « Communication » du livre (jeu de rôle)", 4], ["gbox", "Encadré « Grammaire » (sous le dialogue)", 4], ["vbox", "Encadré « Vocabulaire » (un mot par ligne, ou séparés par des virgules ; | traduction)", 5], ["remarque", "Remarque (culturelle ou de vocabulaire) ; « --- » entre deux dialogues", 3], ["acts", "Toutes les activités du livre (une par ligne : « 1. Compréhension. … », lignes suivantes = items)", 14]],
  vocab: [["page", "Pages du livre", 1], ["words", "Mots du livre — de l'Index : « mot (catégorie) | traduction »", 12], ["texte", "Texte (pages de gauche), une phrase ou un paragraphe par ligne", 12], ["exos", "Exercices (pages de droite) : « # consigne », puis « question | réponse du corrigé »", 12]],
  extra: [["page", "Pages du livre", 1], ["track", "Piste(s) du CD", 1], ["text", "Texte ou dialogue (« Rôle : réplique » | traduction)", 14], ["ex", "Exercices : « # consigne », puis « question | réponse du corrigé »", 10], ["acts", "Activités (une par ligne, items en retrait)", 8]],
};
const xcat = id => { const x = EXTRAS.find(e => e[0] === id); return { id, book: x[1], title: x[2], a: x[3], b: x[4], track: x[5] }; };
const bkBook = (kind, n) => kind === "extra" ? xcat(n).book : kind; // whose PDF
const bkUnit = (kind, n) => kind === "gram" ? LESSONS.find(l => l.n === n) : kind === "comm" ? COMM.find(c => c.n === n) : kind === "extra" ? xcat(n) : VP_UNITS[n - 1];
const bkTitle = (kind, n) => { const u = bkUnit(kind, n); return kind === "extra" ? `${BOOKNAME[u.book].split(" du ")[0]} · ${u.title}` : (kind === "gram" ? `Grammaire ${n}` : kind === "comm" ? `Communication ${n}` : `Vocabulaire ${n}`) + " · " + u.title; };
const bkN = (kind, n) => kind === "extra" ? String(n) : +n;
const bkPages = (kind, n) => {
  if (kind === "extra") { const x = xcat(n); return [x.a, x.b]; }
  // a chapter ends before the next chapter, or before the « Exercices récapitulatifs » page when a bilan follows it
  if (kind === "gram") { const i = GTOC.findIndex(g => g[0] === n), bl = GBILANS.find(b => b[0] === n), next = bl ? bl[1] : GTOC[i + 1] ? GTOC[i + 1][3] : 152; return [GTOC[i][3], next - 1]; }
  if (kind === "comm") return COMM.find(c => c.n === n).bookPages;
  const i = n - 1; return [VTOC[i][2], (VTOC[i + 1] ? VTOC[i + 1][2] : 150) - 1];
};
// entry button for a unit page; « à saisir » tag for lists
const bkEntry = (kind, n) => { const e = ((S.book || {})[kind] || {})[n]; return e && !e.cleared ? e : undefined; }; // « cleared »: an import you erased (kept as a marker so a sync doesn't bring it back)
window.saisieBtn = (kind, n) => { const e = bkEntry(kind, n); return `<button class="b s" onclick="openSaisie('${kind}','${n}')">${!e ? "Saisir le contenu du livre" : e.draft ? "Vérifier avec le livre" : "Modifier la saisie"}</button>`; };
// lists: « à saisir » (nothing yet), « à vérifier » (imported, not yet checked against the page)
window.aSaisir = (kind, n) => { const e = bkEntry(kind, n); return !e ? ` <span class="tag">à saisir</span>` : e.draft ? ` <span class="tag">à vérifier</span>` : e.fresh ? ` <span class="tag">nouveaux champs à vérifier</span>` : ""; };
window.notEntered = (kind, n) => { const [a, b] = bkPages(kind, n);
  return `<div class="card"><h2>${esc(bkTitle(kind, n))}</h2><p>Livre p. ${a}–${b}. Le contenu de cette unité n'est pas encore saisi : seul le texte de votre livre est utilisé ici.</p><div class="row">${saisieBtn(kind, n)}</div></div>`; };

window.openSaisie = (kind, n) => {
  n = bkN(kind, n); if (window.stopActivity) stopActivity();
  const e = bkEntry(kind, n) || {}, [a, b] = bkPages(kind, n);
  view.innerHTML = `<p class="backlink"><a href="#" onclick="go(tab);return false">← Retour</a></p>
  <h1>${e.draft ? "Vérification" : "Saisie"} · ${esc(bkTitle(kind, n))}</h1><p class="sub">Livre p. ${a}–${b} · comparez chaque ligne avec la page du livre, à droite, et corrigez.</p>
  <div class="bkgrid"><div class="card">
   <div class="row"><button class="b s" onclick="bkImport('${kind}','${n}')">Lire ces pages dans le PDF</button><label class="mut">p. <input id="bkp1" type="number" value="${a}" style="width:64px"> à <input id="bkp2" type="number" value="${b}" style="width:64px"></label></div>
   <p id="bkst" class="mut"></p>
   ${BK_FIELDS[kind].map(([f, label, rows]) => `<label style="display:block;margin:12px 0 4px;font-weight:600">${label}</label>${rows === 1 ? `<input id="bk_${f}" value="${esc(e[f] || (f === "page" ? a + "–" + b : ""))}" style="width:100%">` : `<textarea id="bk_${f}" rows="${rows}" style="width:100%;font:inherit">${esc(e[f] || "")}</textarea>`}`).join("")}
   <div class="row" style="margin-top:14px"><button class="b" onclick="bkSave('${kind}','${n}')">${e.draft ? "✓ Vérifié, enregistrer" : "Enregistrer"}</button><button class="b s" onclick="go(tab)">Annuler</button></div></div>
   <div id="bkpages" class="bkpages"></div></div>`;
  bookPagesView($("#bkpages"), bkBook(kind, n), a, b);
  scrollTo(0, 0);
};
window.bkSave = (kind, n) => {
  n = bkN(kind, n); S.book = S.book || {}; S.book[kind] = S.book[kind] || {};
  const e = { at: Date.now() }; BK_FIELDS[kind].forEach(([f]) => e[f] = $("#bk_" + f).value); // saved by you = checked (no « draft »)
  S.book[kind][n] = e; save();
  try { sessionStorage.setItem("fr-reopen", JSON.stringify({ kind, n })); } catch (x) { }
  setTimeout(() => location.reload(), 300); // rebuild the cards from the new entry (after the sync push is scheduled)
};
// back on the unit page after the reload
window.addEventListener("load", () => {
  let r = null; try { r = JSON.parse(sessionStorage.getItem("fr-reopen")); sessionStorage.removeItem("fr-reopen"); } catch (x) { }
  if (!r) return;
  if (r.kind === "extra") return;
  if (r.kind === "gram") openLesson(LESSONS.find(l => l.n === r.n).id); else if (r.kind === "comm") openComm(r.n); else openUnit(r.n);
});

// ---------------- PDF import: pdf.js for a text layer, tesseract.js (French) for scanned pages — all local, in lib/ ----------------
const BK_PDF = {}, BK_DOC = {};
// the PDF of each book is kept in this browser (IndexedDB), chosen once per device: pages are shown and read from it
const bkDB = () => new Promise((ok, ko) => { const r = indexedDB.open("fr-books", 1); r.onupgradeneeded = () => r.result.createObjectStore("pdf"); r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });
async function pdfGet(kind) {
  if (BK_PDF[kind]) return BK_PDF[kind];
  try { const db = await bkDB(); return await new Promise(ok => { const q = db.transaction("pdf").objectStore("pdf").get(kind); q.onsuccess = () => ok(BK_PDF[kind] = q.result || null); q.onerror = () => ok(null); }); } catch (e) { return null; }
}
window.pdfPut = async (kind, file) => {
  if (!file) return; BK_PDF[kind] = file; delete BK_DOC[kind];
  try { const db = await bkDB(); await new Promise(ok => { const t = db.transaction("pdf", "readwrite"); t.objectStore("pdf").put(file, kind); t.oncomplete = ok; t.onerror = ok; }); } catch (e) { }
};
async function bookDoc(kind) { if (BK_DOC[kind]) return BK_DOC[kind]; const f = await pdfGet(kind); return f ? (BK_DOC[kind] = await bkPdfDoc(f)) : null; }
const BOOKNAME = { gram: "Grammaire progressive du français", comm: "Communication progressive du français", vocab: "Vocabulaire progressif du français" };
const pdfPicker = (kind, then, label) => `<label class="b s" style="cursor:pointer">${label || "Choisir le PDF de " + BOOKNAME[kind]}<input type="file" accept="application/pdf" hidden onchange="pdfPut('${kind}',this.files[0]).then(()=>{${then}})"></label>`;
// the book's own pages (from your PDF), as images
window.bookPagesView = async (el, kind, a, b) => {
  if (!el) return; el.id = el.id || "bkv" + Math.random().toString(36).slice(2);
  const doc = await bookDoc(kind);
  if (!doc) { el.innerHTML = `<div class="card"><p style="margin-top:0">Pour voir les pages du livre ici, choisissez son PDF sur cet appareil (une seule fois ; il reste dans ce navigateur).</p>${pdfPicker(kind, `bookPagesView(document.getElementById('${el.id}'),'${kind}',${a},${b})`)}</div>`; return; }
  el.innerHTML = "";
  for (let p = a; p <= b; p++) {
    const pg = await doc.getPage(p + (PDF_OFFSET[kind] || 0)), w = Math.min(900, el.clientWidth || 600), vp0 = pg.getViewport({ scale: 1 }), sc = w / vp0.width * (devicePixelRatio || 1), vp = pg.getViewport({ scale: sc });
    const cv = document.createElement("canvas"); cv.width = vp.width; cv.height = vp.height; cv.style.width = "100%"; cv.setAttribute("aria-label", "Livre page " + p);
    const fig = document.createElement("figure"); fig.className = "bkpage"; fig.innerHTML = `<figcaption>p. ${p}</figcaption>`; fig.prepend(cv); el.appendChild(fig);
    await pg.render({ canvasContext: cv.getContext("2d"), viewport: vp, intent: "print" }).promise;
  }
};
// a « Pages du livre » card for unit pages; drawn on demand (rendering is heavy on a phone)
window.bookPagesCard = (kind, n) => { const [a, b] = bkPages(kind, n), id = "bkp" + kind + n;
  return `<div class="card"><div class="row" style="justify-content:space-between"><h3 style="margin:0">Pages du livre · p. ${a}–${b}</h3><button class="b s" onclick="this.remove();bookPagesView(document.getElementById('${id}'),'${kind}',${a},${b})">Afficher les pages</button></div><div id="${id}" class="bkpages" style="margin-top:12px"></div></div>`; };

// import a whole book: every unit is read and parsed, saved as « à vérifier » (draft); units you already checked are kept
let BK_STOP = false;
window.bkImportAll = async kind => {
  const st = t => { const el = document.getElementById("bkall_" + kind); if (el) el.textContent = t; };
  const doc = await bookDoc(kind); if (!doc) { st("Choisissez d'abord le PDF."); return; }
  const units = kind === "gram" ? LESSONS.map(l => l.n) : kind === "comm" ? COMM.map(c => c.n) : VP_UNITS.map(u => u.n);
  BK_STOP = false; S.book = S.book || {}; S.book[kind] = S.book[kind] || {}; let done = 0;
  for (const n of units) {
    if (BK_STOP) break;
    const old = S.book[kind][n], checked = old && !old.draft && !old.cleared;
    // a unit you checked: nothing you saved is touched, only its empty fields are filled (new fields, e.g. the boxes)
    if (checked && BK_FIELDS[kind].every(([f]) => f === "page" || f === "words" || String(old[f] || "").trim())) { done++; continue; }
    const [a, b] = bkPages(kind, n), pages = [];
    for (let p = a; p <= b; p++) { st(`${bkTitle(kind, n)} · page ${p} · ${done}/${units.length} unités`); pages.push(await bkPageText(doc, p + (PDF_OFFSET[kind] || 0), () => { })); }
    const r = BK_PARSE[kind](pages, n, a);
    if (checked) { const added = BK_FIELDS[kind].map(([f]) => f).filter(f => f !== "page" && f !== "words" && !String(old[f] || "").trim() && String(r[f] || "").trim());
      added.forEach(f => old[f] = r[f]); if (added.length) { old.fresh = [...new Set((old.fresh || []).concat(added))]; old.at = Date.now(); } save(); done++; continue; }
    const e = { at: Date.now(), draft: true, page: a + "–" + b };
    BK_FIELDS[kind].forEach(([f]) => { if (f !== "page") e[f] = r[f] || ""; });
    if (kind === "vocab" && old && old.words && !old.cleared) e.words = old.words; // the words come from the Index import
    S.book[kind][n] = e; save(); done++;
  }
  // the back of the book (texts, annexes, bilans, test): raw text, to check and sort by hand
  S.book.extra = S.book.extra || {};
  for (const [id, book, title, a, b, track] of EXTRAS.filter(x => x[1] === kind)) {
    if (BK_STOP) break; const old = S.book.extra[id]; if (old && !old.draft) continue;
    const pages = []; for (let p = a; p <= b; p++) { st(`${title} · page ${p}`); pages.push(await bkPageText(doc, p + (PDF_OFFSET[kind] || 0), () => { })); }
    S.book.extra[id] = Object.assign({ at: Date.now(), draft: true, page: a + "–" + b, track }, BK_PARSE.extra(pages, id)); save();
  }
  if (kind === "vocab" && !BK_STOP) await bkImportIndex(doc, st);
  if (kind === "comm") bkFillTracks();
  st(BK_STOP ? `Arrêté : ${done}/${units.length} unités. Relancez pour continuer.` : `Terminé : ${done} unités importées. Rechargement…`);
  if (!BK_STOP) setTimeout(() => location.reload(), 800);
};
window.bkStopAll = () => { BK_STOP = true; };
window.bkIndexOnly = async () => {
  const st = t => { const el = document.getElementById("bkall_vocab"); if (el) el.textContent = t; };
  const doc = await bookDoc("vocab"); if (!doc) { st("Choisissez d'abord le PDF."); return; }
  BK_STOP = false; await bkImportIndex(doc, st); if (!BK_STOP) { st("Index importé. Rechargement…"); setTimeout(() => location.reload(), 800); }
};
// the book's activities as an exercise sheet: each item gets an answer field, kept with your progress (S.actAns)
window.actsHTML = (n, acts) => {
  const A = S.actAns || {}; let i = 0;
  const body = bkLines(acts).map(l => {
    if (/^\d+\.\s+(Compréhension|Grammaire|Vocabulaire|Communication|Phonétique|Prononciation|Expression|Production|Écrit|Oral|Lexique|À vous)/.test(l)) return `<h4 style="margin:16px 0 6px">${esc(l)}</h4>`;
    const k = `${n}.${i++}`;
    return `<div class="row" style="align-items:center;gap:10px;margin:4px 0"><span style="flex:1 1 240px">${esc(l)}</span><input type="text" value="${esc(A[k] || "")}" data-k="${k}" oninput="actSave(this)" style="flex:1 1 200px" autocomplete="off" autocapitalize="off" aria-label="Votre réponse"></div>`;
  }).join("");
  return `<div class="card"><h3>Activités du livre</h3><p class="mut" style="margin-top:0">Répondez à voix haute, puis écrivez votre réponse. Vos réponses sont gardées.</p>${body}</div>`;
};
window.actSave = el => { S.actAns = S.actAns || {}; S.actAns[el.dataset.k] = el.value; clearTimeout(actSave.t); actSave.t = setTimeout(save, 600); };
// CD tracks run in order through the book: a track the OCR missed is the one after the previous dialogue (or before the next)
function bkFillTracks() {
  const E = S.book.comm || {}, seq = [];
  COMM.forEach(c => { const e = E[c.n]; const t = e ? String(e.track || "").split(/\s*,\s*/) : []; c.dlgs.forEach((d, k) => seq.push({ e, k, n: c.dlgs.length, t: /^\d+$/.test(t[k] || "") ? +t[k] : null })); });
  // no track read anywhere: the CD has the credits on track 1, then one track per dialogue (Communication 2 = 4 and 5)
  if (!seq.some(x => x.t !== null)) seq[0].t = 2;
  for (let i = 1; i < seq.length; i++) if (seq[i].t === null && seq[i - 1].t !== null) seq[i].t = seq[i - 1].t + 1;
  for (let i = seq.length - 2; i >= 0; i--) if (seq[i].t === null && seq[i + 1].t !== null && seq[i + 1].t > 1) seq[i].t = seq[i + 1].t - 1;
  seq.forEach(x => { if (!x.e || !x.e.draft) return; const t = String(x.e.track || "").split(/\s*,\s*/); while (t.length < x.n) t.push(""); t[x.k] = x.t === null ? "" : String(x.t); x.e.track = t.join(", "); });
  save();
}
// a wrong PDF was imported: remove what the import put in (« à vérifier »); the units you checked and saved yourself stay
window.bkClear = kind => {
  const E = (S.book || {})[kind] || {}, dr = Object.keys(E).filter(n => E[n].draft && !E[n].cleared), ok = Object.values(E).filter(e => !e.draft).length;
  if (!confirm(`Effacer les ${dr.length} unités importées (« à vérifier ») de ${BOOKNAME[kind]} ?` + (ok ? `\nLes ${ok} unités que vous avez vérifiées sont gardées.` : ""))) return;
  const all = ok && confirm(`Effacer aussi les ${ok} unités que vous avez vérifiées ?\n(Utile si elles contiennent des erreurs de l'ancien import : elles seront importées de nouveau, « à vérifier ».)`);
  Object.keys(E).filter(n => all ? !E[n].cleared : E[n].draft && !E[n].cleared).forEach(n => E[n] = { at: Date.now(), draft: true, cleared: true }); save(); location.reload();
};
// « Vos livres » card at the top of each book list: PDF on this device, whole-book import
window.bookCard = kind => {
  const E = Object.fromEntries(Object.entries((S.book || {})[kind] || {}).filter(([, e]) => !e.cleared)), n = Object.keys(E).length, dr = Object.values(E).filter(e => e.draft).length;
  const id = "bkc_" + kind;
  setTimeout(async () => { const el = document.getElementById(id); if (!el) return; const f = await pdfGet(kind);
    el.innerHTML = f ? `<span class="mut">PDF sur cet appareil : ${esc(f.name || "livre")}</span> <button class="b" onclick="bkImportAll('${kind}')">Importer tout le livre</button><button class="b s" onclick="bkStopAll()">Arrêter</button>${kind === "vocab" ? `<button class="b s" onclick="bkIndexOnly()">Importer l'index (les mots)</button>` : ""}${pdfPicker(kind, `go(tab)`, "Changer de PDF")}${n ? `<button class="b s" onclick="bkClear('${kind}')">Effacer l'import</button>` : ""}`
      : pdfPicker(kind, `go(tab)`); }, 0);
  return `<div class="card"><h3 style="margin-top:0">Le contenu du livre</h3><p class="mut" style="margin-top:0">${n} unités importées${dr ? ` dont ${dr} à vérifier` : ""}. L'import lit votre PDF dans ce navigateur (reconnaissance de caractères, quelques secondes par page) ; vérifiez ensuite chaque unité à côté de la page du livre.</p><div class="row" id="${id}"></div><p id="bkall_${kind}" class="mut"></p></div>`;
};
let PDFJS = null, OCR = null;
const libURL = f => new URL("lib/" + f, location.href).href;
async function bkPdfDoc(file) {
  if (!PDFJS) { PDFJS = await import(libURL("pdf.min.mjs")); PDFJS.GlobalWorkerOptions.workerSrc = libURL("pdf.worker.min.mjs"); }
  return PDFJS.getDocument({ data: await file.arrayBuffer(), isEvalSupported: false }).promise;
}
const loadScript = src => new Promise((ok, ko) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });
async function bkOcr() {
  if (OCR) return OCR;
  if (!window.Tesseract) await loadScript(libURL("tesseract.min.js"));
  OCR = await Tesseract.createWorker("fra", 1, { workerPath: libURL("worker.min.js"), corePath: libURL(""), langPath: libURL("tessdata"), gzip: true });
  return OCR;
}
// text of one PDF page, in reading lines; scanned pages (no usable text layer) go through OCR
async function bkPageText(doc, p, st) {
  const page = await doc.getPage(p), tc = await page.getTextContent();
  const rows = {};
  tc.items.forEach(i => { const y = Math.round(i.transform[5] / 3); (rows[y] = rows[y] || []).push(i); });
  const txt = Object.keys(rows).sort((a, b) => b - a).map(y => rows[y].sort((a, b) => a.transform[4] - b.transform[4]).map(i => i.str).join(" ").replace(/\s+/g, " ").trim()).filter(Boolean).join("\n");
  const toks = txt.split(/\s+/), single = toks.filter(t => t.length === 1).length / Math.max(1, toks.length);
  if (txt.length > 200 && single < 0.05 && !/\b\w \w \w\b/.test(txt)) return txt; // a clean text layer; otherwise OCR
  st(`Page ${p} : reconnaissance des caractères…`);
  const vp = page.getViewport({ scale: 2.2 }), cv = document.createElement("canvas");
  cv.width = vp.width; cv.height = vp.height;
  // « print » intent: rendered without requestAnimationFrame, so the import keeps going when the page is in the background
  await page.render({ canvasContext: cv.getContext("2d"), viewport: vp, intent: "print" }).promise;
  const w = await bkOcr(), r = await w.recognize(cv, {}, { text: true, blocks: true });
  return bkOcrText(r.data.blocks || []);
}
// OCR lines without the noise of the illustrations: words read with low confidence, or without any letter, are dropped;
// a dropped number (often the CD track beside a title) is kept as ⟨n⟩ for the parser
window.bkOcrText = blocks => {
  const out = [];
  blocks.forEach(b => b.paragraphs.forEach(pa => pa.lines.forEach(l => {
    const keep = [], nums = [];
    const W = l.words, ok = (x, i) => {
      const t = x.text.trim(); if (!t) return false;
      if (x.confidence >= 60) return /[A-Za-zÀ-ÿ0-9]/.test(t) || /^[:?!;.,«»]+$/.test(t);
      // a real-looking word read with less confidence, between two well-read words (« voudrais… »)
      const near = [W[i - 1], W[i + 1]].some(y => y && y.confidence >= 80);
      return x.confidence >= 15 && near && /^[A-Za-zÀ-ÿ][a-zà-ÿ'’\-]{2,}[.,;:!?…]*$/.test(t);
    };
    W.forEach((x, i) => {
      const t = x.text.trim();
      if (ok(x, i)) keep.push(t); else { const m = t.match(/^\(?(\d{1,3})\)?$/); if (m) nums.push(m[1]); }
    });
    if (keep.length) out.push(keep.join(" ") + nums.map(n => " ⟨" + n + "⟩").join(""));
  })));
  return out.join("\n");
};

window.bkImport = async (kind, n) => {
  n = bkN(kind, n); const st = t => { const el = $("#bkst"); if (el) el.textContent = t; };
  const p1 = +$("#bkp1").value, p2 = +$("#bkp2").value, off = PDF_OFFSET[bkBook(kind, n)] || 0;
  try {
    st("Ouverture du PDF…"); const doc = await bookDoc(bkBook(kind, n)), pages = [];
    if (!doc) { st("Choisissez d'abord le PDF du livre (à droite)."); return; }
    for (let p = p1; p <= p2; p++) { st(`Lecture de la page ${p}…`); pages.push(await bkPageText(doc, p + off, st)); }
    const r = BK_PARSE[kind](pages, n, p1);
    Object.entries(r).forEach(([k, v]) => { const el = $("#bk_" + k); if (el && v) el.value = v; });
    $("#bk_page").value = p1 + "–" + p2;
    st("Import terminé : vérifiez chaque ligne avec votre livre (et le numéro de piste, à côté du casque), corrigez, puis « Enregistrer ».");
  } catch (e) { console.error(e); st("Erreur d'import : " + e.message); }
};

// Vocabulaire progressif: the Index gives every word with its category and the pages where it appears;
// a word goes to the unit of its first page in the lessons (before p. 150). Kept as « à vérifier » like the rest.
window.bkImportIndex = async (doc, st) => {
  const units = {}, ends = VTOC.map((v, i) => [v[0], v[2], (VTOC[i + 1] ? VTOC[i + 1][2] : 150) - 1]);
  for (let p = VINDEX[0]; p <= VINDEX[1]; p++) {
    if (BK_STOP) return; st(`Index · page ${p}`);
    let txt = ""; try { txt = await bkPageText(doc, p + (PDF_OFFSET.vocab || 0), () => { }); } catch (e) { continue; }
    const L = txt.split("\n").map(l => bkClean(l.replace(/⟨(\d+)⟩/g, "$1"))).filter(Boolean), rows = [];
    L.forEach(l => { if (/^[\d,\s]+$/.test(l) && rows.length) rows[rows.length - 1] += " " + l; else rows.push(l); }); // page numbers on the next line
    rows.forEach(l => {
      const m = l.match(/^(.+?)\s*\(([^)]{1,24})\)\s*([\d][\d,\s]*)$/); if (!m) return;
      const pg = m[3].split(/[,\s]+/).map(Number).filter(x => x >= 6 && x < 150); if (!pg.length) return;
      const first = pg.find(x => x % 2 === 0) || pg[0]; // left pages (even) are the text, right pages the exercises
      const u = ends.find(([, a, b]) => first >= a && first <= b); if (!u) return;
      (units[u[0]] = units[u[0]] || []).push(`${m[1].trim()} (${m[2].trim()})`);
    });
  }
  S.book.vocab = S.book.vocab || {};
  Object.entries(units).forEach(([n, ws]) => { const e = S.book.vocab[n] || { at: Date.now(), draft: true, page: bkPages("vocab", +n).join("–") };
    if (e.draft || e.cleared) { delete e.cleared; e.words = [...new Set(ws)].join("\n"); e.at = Date.now(); S.book.vocab[n] = e; } });
  save();
};

// ---------------- parsers: book page text → entry fields ----------------
const bkClean = s => s.replace(/[’]/g, "'").replace(/[|]/g, "I").replace(/\s+/g, " ").trim();
const BULLET = /^[•·●▪◦*\-–—>]\s*/;
const NUMS = /\s*⟨\d+⟩/g, lettersOf = s => (s.match(/[A-Za-zÀ-ÿ]/g) || []).length;
const simp = s => stripAccB(s.toLowerCase()).replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
// « [e) Le marchand : Voilà… » → ["Le marchand", "Voilà…"]: the role is the capitalised words just before the colon
function bkRole(l) {
  const t = l.replace(/\s*:\s*/, " : ").split(/\s+/), c = t.indexOf(":"); if (c < 1 || c > 6) return null;
  let a = 0; while (a < c && !/^[A-ZÀ-Ö][A-Za-zÀ-ÿ'’.\-]*$/.test(t[a])) a++;
  const role = t.slice(a, c); if (!role.length || role.length > 4 || role.some(w => !/^[A-Za-zÀ-ÿ'’.\-«»]+$/.test(w))) return null;
  return [role.join(" "), t.slice(c + 1).join(" ")];
}
function bkCommPage(txt, sit, k, n) {
  const L = txt.split("\n").map(bkClean).filter(Boolean), key = simp(sit).split(" ").filter(w => w.length > 2).slice(0, 2).join(" ");
  let i = L.findIndex(l => key && simp(l.replace(NUMS, "")).includes(key)), track = "";
  if (i >= 0) { const m = [...L[i].matchAll(/⟨(\d+)⟩/g)].map(x => x[1]).filter(x => +x !== k + 1 && +x !== n); track = m[0] || ""; } else i = -1;
  const lines = [], ex = [];
  let j = i + 1;
  for (; j < L.length; j++) {
    const l = L[j].replace(NUMS, ""); if (/\b(Grammaire|Vocabulaire)\b/.test(l)) break;
    const r = bkRole(l);
    if (r) lines.push(`${r[0]} : ${r[1]}`);
    else if (lines.length && lettersOf(l) >= 3) lines[lines.length - 1] += " " + l.replace(/^[^A-Za-zÀ-ÿ«]+/, "");
    if (lines.length) lines[lines.length - 1] = lines[lines.length - 1].replace(/\s+[—–-](?=\s)/g, "").replace(/([.?!…])\s+\S{1,2}$/, "$1");
  }
  const m = L.findIndex(l => /Mani[eè]res de d/i.test(l));
  if (m >= 0) for (let q = m + 1; q < L.length && !/^Remarque|Remarque linguistique/i.test(L[q]); q++) {
    const l = L[q].replace(NUMS, "").replace(/^[^A-Za-zÀ-ÿ0-9«]+/, "").trim();
    if (lettersOf(l) >= 3 && !/^\d+\s*[•.]?\s*[a-zé-]+$/i.test(l)) ex.push(l);
  }
  // the two boxes under the dialogue, and the « Remarque » at the foot of the page
  const box = (from, until) => { const a = L.findIndex((l, q) => q > i && from.test(l)); if (a < 0) return [];
    const out = []; for (let q = a; q < L.length && (q === a || !until.test(L[q])); q++) { const l = (q === a ? L[q].replace(from, "") : L[q]).replace(NUMS, "").replace(/^[^A-Za-zÀ-ÿ0-9«]+/, "").trim(); if (lettersOf(l) >= 2 && !/^\d+\s*[•.]?\s*[a-zé-]+$/i.test(l)) out.push(l); } return out; };
  const gbox = box(/^.*?\bGrammaire\b\s*[:.]?/, /\bVocabulaire\b|Mani[eè]res de d|^Remarque/i);
  const vbox = box(/^.*?\bVocabulaire\b\s*[:.]?/, /Mani[eè]res de d|^Remarque|\bGrammaire\b/i);
  const r0 = L.findIndex(l => /^Remarque/i.test(l)), rem = r0 < 0 ? [] : L.slice(r0, r0 + 6).map(l => l.replace(NUMS, "")).filter(l => lettersOf(l) >= 3 && !/^\d+\s*[•.]?\s*[a-zé-]+$/i.test(l));
  return { lines, track, ex, gbox, vbox, rem };
}
// every activity of an Activités page: « 2. Grammaire. Complétez. » then its items, one per line
function bkActs(txt) {
  const out = [];
  txt.split("\n").map(l => bkClean(l.replace(NUMS, ""))).filter(l => lettersOf(l) >= 2).forEach(l => {
    // the red number of an activity is often lost by the OCR: the heading word is enough, activities are numbered in order
    const h = l.match(/^(?:\(?\d{1,2}\)?\s+)?((?:Compréhension|Grammaire|Vocabulaire|Communication|Phonétique|Prononciation|Expression|Production|Écrit|Oral|Lexique)(?: et [a-zé]+)?)\s*\.\s*(.*)$/);
    if (h) out.push(`${out.filter(x => /^\d+\. /.test(x)).length + 1}. ${h[1]}. ${h[2]}`.trim());
    else if (/^À vous/.test(l)) out.push(`${out.filter(x => /^\d+\. /.test(x)).length + 1}. ${l}`);
    else if (out.length && !/^A\s?C\s?T\s?I\s?V|^\d+\s*[•.]?\s*[a-zé-]+$|photocopie/i.test(l)) l.split(/\s(?=\d{1,2}\.\s)/).forEach(l => out.push("   " + l.replace(/\s+[oO0]{1,2}(?=\s|$)/g, "").replace(/_{2,}/g, "____")));
  });
  return out;
}
function bkTasks(txt) {
  const out = []; let on = false;
  txt.split("\n").map(l => bkClean(l.replace(NUMS, ""))).filter(Boolean).forEach(l => {
    const a = l.match(/Communication\s*\.\s*(.+)$/);
    if (a) { out.push(a[1]); on = true; return; }
    if (/^\(?\d{1,2}\)?\s+[A-ZÉ][a-zé]+( et [a-zé]+)?\s*\./.test(l) || /^[a-z]\s*[.)]\s|^\d+\s*[.)]\s*$/.test(l) || /_{3,}/.test(l)) { on = false; return; }
    if (on && lettersOf(l) >= 3) out[out.length - 1] += " " + l;
  });
  return out;
}
window.BK_PARSE = {
  // Communication: each situation is a dialogue page (from the Table des contenus) followed by its Activités page.
  // Dialogue = « Rôle : … » lines after the situation title, until the Grammaire / Vocabulaire boxes; then the
  // « Manières de dire » items; on the Activités page, the « Communication. … » activities.
  comm(pages, n, p1) {
    const c = COMM.find(x => x.n === n), dlgs = [], tracks = [], ex = [], task = [], acts = [], gbox = [], vbox = [], rem = [];
    c.dlgs.forEach((d, k) => {
      let i = d.page - p1; if (i < 0 || i >= pages.length) i = 2 * k; if (i >= pages.length) return;
      const r = bkCommPage(pages[i] || "", d.sit, k, n);
      dlgs.push(r.lines.join("\n")); tracks.push(r.track); ex.push(...r.ex); gbox.push(...r.gbox); vbox.push(...r.vbox); rem.push(r.rem.join(" "));
      task.push(...bkTasks(pages[i + 1] || "")); acts.push(...bkActs(pages[i + 1] || ""));
    });
    // the CD tracks follow each other: a track the OCR missed is the one after the previous dialogue's
    const prev = Object.values((S.book || {}).comm || {}).length && (S.book.comm[n - 1] || {}).track;
    tracks.forEach((t, k) => { if (!t) { const p = k ? tracks[k - 1] : String(prev || "").split(/[,;\s]+/).filter(Boolean).pop(); if (/^\d+$/.test(p || "")) tracks[k] = String(+p + 1); } });
    return { dlg: dlgs.join("\n---\n"), track: tracks.join(", "), ex: [...new Set(ex)].join("\n"), task: task.join("\n"), acts: acts.join("\n"), gbox: gbox.join("\n"), vbox: vbox.join("\n"), remarque: rem.some(Boolean) ? rem.join("\n---\n") : "" };
  },
  // Grammaire: left page = lesson (rules and examples together, to sort by hand), right page = numbered exercises
  // exercises: « # consigne » lines, then one numbered item per line (two-column items are split)
  gram(pages) {
    const ex = [], rules = [];
    pages.forEach((t, i) => t.split("\n").map(l => bkClean(l.replace(NUMS, ""))).filter(Boolean).forEach(l => {
      if (/^\d+\s*[•.]?\s*[a-zé-]+$/i.test(l)) return; // page number « 8 • huit »
      if (i % 2) l.split(/\s(?=\d{1,2}\.\s)/).forEach(x => { if (/^\d{1,2}[.)]/.test(x)) ex.push(x); else if (ex.length && !ex[ex.length - 1].startsWith("#") && lettersOf(x) < 25) ex[ex.length - 1] += " " + x; else ex.push("# " + x); });
      else rules.push(l);
    }));
    return { rules: rules.join("\n"), ex: ex.join("\n") };
  },
  // Vocabulaire: the words in bold / at the start of lines are not marked in the text, so every line is kept to sort by hand
  // Vocabulaire: the words given with their article (« une pomme de terre, un oignon… »), in the order of the book
  // Vocabulaire: left pages = the text (kept whole, to read), right pages = the exercises. The word list comes from the Index.
  vocab(pages) {
    const texte = [], exos = [];
    pages.forEach((t, i) => {
      const L = t.split("\n").map(l => bkClean(l.replace(NUMS, ""))).filter(l => lettersOf(l) >= 2 && !/^\d+\s*[•.]?\s*[a-zé-]+$/i.test(l));
      if (i % 2) L.forEach(l => l.split(/\s(?=\d{1,2}\.\s)/).forEach(x => { if (/^\d{1,2}[.)]/.test(x)) exos.push(x); else if (/^(EXERCICES|[A-Z]\s?[A-Z]\s?[A-Z])/.test(x)) return; else exos.push("# " + x); }));
      else L.forEach(l => { if (texte.length && !/[.!?:»…]$/.test(texte[texte.length - 1]) && /^[a-zà-ÿ(]/.test(l)) texte[texte.length - 1] += " " + l; else texte.push(l); });
    });
    return { texte: texte.join("\n"), exos: exos.join("\n") };
  },
  // the back of the books: the text as read; a bilan (two pages of exercises) like the right pages of a chapter
  extra(pages, id) {
    const L = pages.join("\n").split("\n").map(l => bkClean(l.replace(NUMS, ""))).filter(l => lettersOf(l) >= 2 && !/^\d+\s*[•.]?\s*[a-zé-]+$/i.test(l));
    if (/^gb\d|test$/.test(id)) return { ex: BK_PARSE.gram(pages.map(t => t).flatMap(t => ["", t])).ex };
    const text = [], acts = []; let inActs = false;
    L.forEach(l => { const r = bkRole(l);
      if (/^(\d{1,2}\s+)?(Compréhension|Grammaire|Vocabulaire|Communication|À vous)/.test(l)) inActs = true;
      if (inActs) acts.push(/^(\d{1,2}\s+)?(Compréhension|Grammaire|Vocabulaire|Communication|À vous)/.test(l) ? `${acts.filter(x => /^\d+\. /.test(x)).length + 1}. ${l.replace(/^\d{1,2}\s+/, "")}` : "   " + l);
      else if (r) text.push(`${r[0]} : ${r[1]}`); else if (text.length && /^[a-zà-ÿ]/.test(l)) text[text.length - 1] += " " + l; else text.push(l); });
    return { text: text.join("\n"), acts: acts.join("\n") };
  },
};
