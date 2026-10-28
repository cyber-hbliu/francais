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
// a word as the matching key between the book's list and Français interactif: no article, brackets, accents or punctuation
const bkKey = w => stripAccB(String(w).toLowerCase().replace(/\(.*?\)/g, "").replace(/^(le|la|les|un|une|des|du|de la|l'|l’)\s*/, "").replace(/[^a-zà-ÿ' -]/g, "")).replace(/\s+/g, " ").trim();
const stripAccB = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

window.applyBook = S => {
  const B = S.book || {};
  Object.entries(B.gram || {}).forEach(([n, e]) => {
    const l = LESSONS.find(x => x.n === +n); if (!l) return;
    l.rules = bkLines(e.rules); l.examples = bkLines(e.examples).map(bkPair); l.ex = bkLines(e.ex).map(bkPair);
    l.bookPage = e.page || ""; l.entered = !!(l.rules.length || l.examples.length || l.ex.length);
  });
  Object.entries(B.comm || {}).forEach(([n, e]) => {
    const c = COMM.find(x => x.n === +n); if (!c) return;
    const parts = String(e.dlg || "").split(/^\s*-{3,}\s*$/m), tracks = String(e.track || "").split(/[,;\s]+/).filter(Boolean);
    c.dlgs.forEach((d, k) => { d.lines = bkDialogue(parts[k]); d.track = tracks[k] || ""; });
    c.ex = bkLines(e.ex).map(bkPair); c.task = (e.task || "").trim(); c.bookPage = e.page || "";
    c.entered = c.dlgs.some(d => d.lines.length);
    c.ex.forEach(([fr, en], k) => { const v = { id: `cm${c.n}_${k}`, unit: "c" + c.n, sec: "c" + c.n, theme: `Communication ${c.n} · ${c.title}`, fr, en, level: c.level, audio: "", src: "livre" }; COMM_PHRASES.push(v); VOCAB.push(v); });
  });
  // Vocabulaire progressif: the book's words come first; a word Français interactif also has lends its FI recording and is not repeated
  Object.entries(B.vocab || {}).forEach(([n, e]) => {
    const u = VP_UNITS[+n - 1]; if (!u) return;
    const fi = VOCAB.filter(v => v.src === "FI" && v.unit === u.n), byKey = {};
    fi.forEach(v => { byKey[bkKey(v.fr)] = byKey[bkKey(v.fr)] || v; });
    u.book = bkLines(e.words).map(bkPair).map(([fr, en], k) => {
      const twin = byKey[bkKey(fr)];
      if (twin) twin.dup = true;
      return { id: `vp${u.n}_${k}`, unit: u.n, theme: `${u.n}. ${u.title}`, sec: "vp" + u.n, fr, en: en || (twin ? twin.en : ""), level: "A1", audio: twin ? twin.audio : "", ex: "", src: "livre" };
    });
    u.bookPage = e.page || ""; u.entered = u.book.length > 0;
    for (let i = VOCAB.length - 1; i >= 0; i--) if (VOCAB[i].dup) VOCAB.splice(i, 1);
    VOCAB.push(...u.book);
  });
};

// ---------------- entry page (Saisir le contenu du livre) ----------------
const BK_FIELDS = {
  gram: [["page", "Pages du livre", 1], ["rules", "Règles (une par ligne ; « … » pour surligner)", 8], ["examples", "Exemples (français | traduction)", 8], ["ex", "Exercices (question | réponse ; réponse du corrigé)", 10]],
  comm: [["page", "Pages du livre", 1], ["track", "Numéro(s) de piste du CD (un par dialogue : 4, 5)", 1], ["dlg", "Dialogue(s) — « Rôle : réplique » (| traduction) ; « --- » entre deux dialogues", 14], ["ex", "Manières de dire (français | traduction)", 8], ["task", "Activité du livre (jeu de rôle / communication)", 4]],
  vocab: [["page", "Pages du livre", 1], ["words", "Mots du livre (français | traduction)", 14]],
};
const bkUnit = (kind, n) => kind === "gram" ? LESSONS.find(l => l.n === n) : kind === "comm" ? COMM.find(c => c.n === n) : VP_UNITS[n - 1];
const bkTitle = (kind, n) => { const u = bkUnit(kind, n); return (kind === "gram" ? `Grammaire ${n}` : kind === "comm" ? `Communication ${n}` : `Vocabulaire ${n}`) + " · " + u.title; };
const bkPages = (kind, n) => {
  if (kind === "gram") { const i = GTOC.findIndex(g => g[0] === n), next = GTOC[i + 1] ? GTOC[i + 1][3] : 152; return [GTOC[i][3], Math.min(next - 1, GTOC[i][3] + 3)]; }
  if (kind === "comm") return COMM.find(c => c.n === n).bookPages;
  const i = n - 1; return [VTOC[i][2], (VTOC[i + 1] ? VTOC[i + 1][2] : 150) - 1];
};
// entry button for a unit page; « à saisir » tag for lists
window.saisieBtn = (kind, n) => `<button class="b s" onclick="openSaisie('${kind}',${n})">${(bkUnit(kind, n) || {}).entered ? "Modifier la saisie" : "Saisir le contenu du livre"}</button>`;
window.aSaisir = (kind, n) => (bkUnit(kind, n) || {}).entered ? "" : ` <span class="tag">à saisir</span>`;
window.notEntered = (kind, n) => { const [a, b] = bkPages(kind, n);
  return `<div class="card"><h2>${esc(bkTitle(kind, n))}</h2><p>Livre p. ${a}–${b}. Le contenu de cette unité n'est pas encore saisi : seul le texte de votre livre est utilisé ici.</p><div class="row">${saisieBtn(kind, n)}</div></div>`; };

window.openSaisie = (kind, n) => {
  if (window.stopActivity) stopActivity();
  const e = ((S.book || {})[kind] || {})[n] || {}, [a, b] = bkPages(kind, n), off = PDF_OFFSET[kind] || 0;
  view.innerHTML = `<p class="backlink"><a href="#" onclick="go(tab);return false">← Retour</a></p>
  <div class="card"><h1>Saisie · ${esc(bkTitle(kind, n))}</h1><p class="mut">Copiez le texte de votre livre (p. ${a}–${b}). Une ligne par élément.</p>
   <div class="card" style="background:var(--bg)"><h3 style="margin-top:0">Importer depuis le PDF</h3>
    <p class="mut" style="margin-top:0">Choisissez le PDF de votre livre : il est lu dans ce navigateur (texte du PDF, ou reconnaissance de caractères pour un livre scanné), rien n'est envoyé. Vérifiez et corrigez le résultat, puis enregistrez.</p>
    <div class="row"><input type="file" id="bkpdf" accept="application/pdf"><label>Pages du livre <input id="bkp1" type="number" value="${a}" style="width:70px"> à <input id="bkp2" type="number" value="${b}" style="width:70px"></label>
     <label>décalage PDF <input id="bkoff" type="number" value="${off}" style="width:60px"></label><button class="b" onclick="bkImport('${kind}',${n})">Importer depuis le PDF</button></div>
    <p id="bkst" class="mut"></p></div>
   ${BK_FIELDS[kind].map(([f, label, rows]) => `<label style="display:block;margin:12px 0 4px;font-weight:600">${label}</label>${rows === 1 ? `<input id="bk_${f}" value="${esc(e[f] || (f === "page" ? a + "–" + b : ""))}" style="width:100%">` : `<textarea id="bk_${f}" rows="${rows}" style="width:100%;font:inherit">${esc(e[f] || "")}</textarea>`}`).join("")}
   <div class="row" style="margin-top:14px"><button class="b" onclick="bkSave('${kind}',${n})">Enregistrer</button><button class="b s" onclick="go(tab)">Annuler</button></div></div>`;
  if (BK_PDF[kind]) $("#bkst").textContent = "PDF déjà choisi : " + BK_PDF[kind].name + " (ou choisissez-en un autre).";
  scrollTo(0, 0);
};
window.bkSave = (kind, n) => {
  S.book = S.book || {}; S.book[kind] = S.book[kind] || {};
  const e = { at: Date.now() }; BK_FIELDS[kind].forEach(([f]) => e[f] = $("#bk_" + f).value);
  S.book[kind][n] = e; save();
  try { sessionStorage.setItem("fr-reopen", JSON.stringify({ kind, n })); } catch (x) { }
  setTimeout(() => location.reload(), 300); // rebuild the cards from the new entry (after the sync push is scheduled)
};
// back on the unit page after the reload
window.addEventListener("load", () => {
  let r = null; try { r = JSON.parse(sessionStorage.getItem("fr-reopen")); sessionStorage.removeItem("fr-reopen"); } catch (x) { }
  if (!r) return;
  if (r.kind === "gram") openLesson(LESSONS.find(l => l.n === r.n).id); else if (r.kind === "comm") openComm(r.n); else openUnit(r.n);
});

// ---------------- PDF import: pdf.js for a text layer, tesseract.js (French) for scanned pages — all local, in lib/ ----------------
const BK_PDF = {};
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
  if (txt.length > 200 && single < 0.15) return txt;
  st(`Page ${p} : reconnaissance des caractères…`);
  const vp = page.getViewport({ scale: 2.2 }), cv = document.createElement("canvas");
  cv.width = vp.width; cv.height = vp.height;
  await page.render({ canvasContext: cv.getContext("2d"), viewport: vp }).promise;
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
  const st = t => { const el = $("#bkst"); if (el) el.textContent = t; };
  const f = $("#bkpdf").files[0] || BK_PDF[kind]; if (!f) { st("Choisissez d'abord le PDF du livre."); return; }
  BK_PDF[kind] = f;
  const p1 = +$("#bkp1").value, p2 = +$("#bkp2").value, off = +$("#bkoff").value || 0;
  try {
    st("Ouverture du PDF…"); const doc = await bkPdfDoc(f), pages = [];
    for (let p = p1; p <= p2; p++) { st(`Lecture de la page ${p}…`); pages.push(await bkPageText(doc, p + off, st)); }
    const r = BK_PARSE[kind](pages, n, p1);
    Object.entries(r).forEach(([k, v]) => { const el = $("#bk_" + k); if (el && v) el.value = v; });
    $("#bk_page").value = p1 + "–" + p2;
    st("Import terminé : vérifiez chaque ligne avec votre livre (et le numéro de piste, à côté du casque), corrigez, puis « Enregistrer ».");
  } catch (e) { console.error(e); st("Erreur d'import : " + e.message); }
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
  return { lines, track, ex };
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
    const c = COMM.find(x => x.n === n), dlgs = [], tracks = [], ex = [], task = [];
    c.dlgs.forEach((d, k) => {
      let i = d.page - p1; if (i < 0 || i >= pages.length) i = 2 * k; if (i >= pages.length) return;
      const r = bkCommPage(pages[i] || "", d.sit, k, n);
      dlgs.push(r.lines.join("\n")); tracks.push(r.track); ex.push(...r.ex);
      task.push(...bkTasks(pages[i + 1] || ""));
    });
    // the CD tracks follow each other: a track the OCR missed is the one after the previous dialogue's
    const prev = Object.values((S.book || {}).comm || {}).length && (S.book.comm[n - 1] || {}).track;
    tracks.forEach((t, k) => { if (!t) { const p = k ? tracks[k - 1] : String(prev || "").split(/[,;\s]+/).filter(Boolean).pop(); if (/^\d+$/.test(p || "")) tracks[k] = String(+p + 1); } });
    return { dlg: dlgs.join("\n---\n"), track: tracks.join(", "), ex: [...new Set(ex)].join("\n"), task: task.join("\n") };
  },
  // Grammaire: left page = lesson (rules and examples together, to sort by hand), right page = numbered exercises
  gram(pages) {
    const ex = [], rules = [];
    pages.forEach((t, i) => t.split("\n").map(bkClean).filter(Boolean).forEach(l => {
      if (/^\d+\s*[•.]?\s*[a-zé-]+$/i.test(l)) return; // page number « 8 • huit »
      if (i % 2) { if (/^\d{1,2}[.)]/.test(l) || !ex.length) ex.push(l); else ex[ex.length - 1] += " " + l; }
      else rules.push(l);
    }));
    return { rules: rules.join("\n"), ex: ex.join("\n") };
  },
  // Vocabulaire: the words in bold / at the start of lines are not marked in the text, so every line is kept to sort by hand
  vocab(pages) { return { words: pages.join("\n").split("\n").map(bkClean).filter(l => l && !/^\d+\s*[•.]?\s*[a-zé-]+$/i.test(l)).join("\n") }; },
};
