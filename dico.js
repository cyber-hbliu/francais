"use strict";
// Built-in French–English dictionary (offline): Wiktionary via kaikki.org + Lexique 3.83, both CC BY-SA 4.0.
// dict.js (~4 MB) is loaded only when first needed. Double-click any French word in the app to look it up.

let dictReady = null, ACC = null, BYW = null;
function loadDict() {
  if (dictReady) return dictReady;
  dictReady = new Promise((res, rej) => {
    const s = document.createElement("script"); s.src = "dict.js";
    s.onload = () => { BYW = new Map(DICT.map(e => [e.w, e])); ACC = new Map(); DICT.forEach(e => { const k = stripAcc(e.w.toLowerCase()); if (!ACC.has(k)) ACC.set(k, e); }); res(); };
    s.onerror = () => rej(new Error("dict.js introuvable")); document.head.appendChild(s);
  });
  return dictReady;
}
const POSFR = { n: "nom", v: "verbe", adj: "adjectif", adv: "adverbe", "prép": "préposition", pron: "pronom", "dét": "déterminant", conj: "conjonction", interj: "interjection", num: "nombre", loc: "locution", contr: "contraction", part: "particule" };
const PERSFR = { "1s": "je", "2s": "tu", "3s": "il/elle", "1p": "nous", "2p": "vous", "3p": "ils/elles" };
const TPS = { "ind:pre": "présent", "ind:imp": "imparfait", "ind:fut": "futur", "ind:pas": "passé simple", "cnd:pre": "conditionnel", "sub:pre": "subjonctif", "sub:imp": "subjonctif imparfait", "imp:pre": "impératif" };
function formInfo(info) {
  if (!info) return "";
  if (/^(pl|f|pl f)$/.test(info)) return { pl: "pluriel", f: "féminin", "pl f": "féminin pluriel" }[info];
  return [...new Set(info.split(";").map(x => {
    const [m, t, p] = x.split(":");
    if (m === "par") return t === "pas" ? "participe passé" + (p ? " (" + { fs: "f.", mp: "m. pl.", fp: "f. pl.", ms: "" }[p] + ")" : "") : "participe présent";
    if (m === "inf") return "infinitif";
    return (TPS[m + ":" + t] || x) + (p && PERSFR[p] ? " (" + PERSFR[p] + ")" : "");
  }))].join(" · ");
}
const normQ = q => q.toLowerCase().replace(/[’]/g, "'").replace(/^(le|la|les|un|une|des|l'|d')\s*/, "").replace(/oe/g, "œ").trim();
// returns {entries:[{e, via}], suggest:[e]}
function lookup(raw) {
  const q0 = raw.toLowerCase().replace(/[’]/g, "'").trim(), q = normQ(raw), out = [], seen = new Set();
  const add = (e, via) => { if (e && !seen.has(e.w)) { seen.add(e.w); out.push({ e, via }); } };
  [q0, q, q.replace(/œ/g, "oe")].forEach(k => { add(BYW.get(k)); (DICT_FORMS[k] || []).forEach(([l, i]) => add(BYW.get(l), { form: k, info: i })); });
  if (!out.length) add(ACC.get(stripAcc(q)), { acc: true });
  // feminine / plural forms of rarer words: try the usual endings
  if (!out.length) for (const [a, b] of [["ennes", "en"], ["enne", "en"], ["euses", "eux"], ["euse", "eux"], ["ives", "if"], ["ive", "if"], ["ères", "er"], ["ère", "er"], ["aux", "al"], ["es", ""], ["e", ""], ["s", ""], ["x", ""]])
    if (q.endsWith(a)) { const e = BYW.get(q.slice(0, -a.length) + b); if (e) { add(e, { form: q, info: "" }); break; } }
  const sq = stripAcc(q);
  const suggest = q.length >= 2 ? DICT.filter(e => !seen.has(e.w) && stripAcc(e.w.toLowerCase()).startsWith(sq)).slice(0, 12) : [];
  return { entries: out, suggest };
}
function reverseLookup(en) {
  const re = new RegExp("(^|[^a-z])(to )?" + en.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z]|$)");
  return DICT.filter(e => e.s.some(([, gl]) => gl.slice(0, 2).some(g => re.test(g.toLowerCase())))).slice(0, 15);
}
const inKit = w => VOCAB.filter(v => normQ(v.fr.replace(/\(.*?\)/g, "")).split(/[,/]/).map(x => x.trim()).includes(w.toLowerCase())).slice(0, 2);
function entryHTML({ e, via }, compact) {
  const g = e.g && e.s.some(s => s[0] === "n") ? e.g : "", isNoun = e.s[0][0] === "n";
  const art = !isNoun ? "" : g === "m" ? (/^[aeiouyéèêhœ]/i.test(e.w) ? "l' (m.)" : "le") : g === "f" ? (/^[aeiouyéèêhœ]/i.test(e.w) ? "l' (f.)" : "la") : "";
  const stars = e.r <= 1000 ? "★★★ très fréquent" : e.r <= 5000 ? "★★ fréquent" : "★ moins fréquent";
  const kit = inKit(e.w), verb = typeof VERBS !== "undefined" && VERBS.find(v => v.base === e.w);
  const say = (art && !art.startsWith("l'") ? art + " " : "") + e.w;
  return `<div class="dent">
   ${via && via.form ? `<p class="mut" style="margin:0">« ${esc(via.form)} » → ${via.info ? esc(formInfo(via.info)) + " de" : "forme de"} :</p>` : via && via.acc ? `<p class="mut" style="margin:0">Vouliez-vous dire :</p>` : ""}
   <div class="row" style="align-items:baseline"><span style="font-size:22px;font-weight:700" class="${g === "m" ? "g-m" : g === "f" ? "g-f" : ""}">${art ? `<span class="mut" style="font-size:16px">${art}</span> ` : ""}${esc(e.w)}</span>
    ${e.ipa ? `<span class="mut">${esc(e.ipa)}</span>` : ""}${spk(say)}<span class="tag" title="rang de fréquence ${e.r}">${stars}</span></div>
   ${e.s.map(([p, gl]) => `<p style="margin:6px 0"><i class="mut">${POSFR[p] || p}${p === "n" && g ? (g === "m" ? " masculin" : g === "f" ? " féminin" : " m./f.") : ""}</i><br>${gl.map((x, i) => `${i + 1}. ${esc(x)}`).join("<br>")}</p>`).join("")}
   ${kit.length ? `<p class="mut" style="margin:6px 0">📚 Dans votre programme : ${kit.map(v => `<b>${esc(v.fr)}</b> (${esc(v.theme)})${v.audio ? ` <button class="b s" onclick="playRec('${v.audio}')">🎧 FI</button>` : ""}`).join(" · ")}</p>` : ""}
   ${verb && !compact ? `<p class="mut" style="margin:6px 0">Présent : ${PERS.map((p, j) => esc(elide(p, conjForm(verb, "pres", j)[0]))).join(" · ")}</p>` : ""}
   <p class="row" style="margin:6px 0"><button class="b s" onclick='addMyWord(${JSON.stringify(e.w).replace(/'/g, "&#39;")})'>${(S.custom || {})["d_" + e.w] ? "✓ Dans mes cartes" : "➕ Ajouter à mes cartes"}</button>
    <a target="_blank" rel="noopener" href="https://en.wiktionary.org/wiki/${encodeURIComponent(e.w)}#French">Wiktionary</a>
    <a target="_blank" rel="noopener" href="https://www.wordreference.com/fren/${encodeURIComponent(e.w)}">WordReference</a>
    <a target="_blank" rel="noopener" href="https://www.larousse.fr/dictionnaires/francais/${encodeURIComponent(e.w)}">Larousse</a></p></div>`;
}
function resultsHTML(q, compact) {
  const { entries, suggest } = lookup(q);
  let h = entries.map(x => entryHTML(x, compact)).join("<hr>");
  if (!compact && /^[a-z ]+$/i.test(q) && entries.every(x => x.e.r > 3000)) {
    const rev = reverseLookup(q);
    if (rev.length) h = (h ? h + "<hr>" : "") + `<p class="mut">Anglais → français :</p>` + rev.map(e => `<p style="margin:4px 0"><a href="#" onclick="dicoSearch('${esc(e.w).replace(/'/g, "\\'")}');return false"><b>${esc(e.w)}</b></a> — <span class="mut">${esc(e.s[0][1].slice(0, 2).join("; "))}</span></p>`).join("");
  }
  if (!h) h = `<p>Aucun résultat pour « ${esc(q)} » dans le dictionnaire intégré (${DICT.length.toLocaleString("fr")} mots les plus fréquents).</p>
    <p class="row"><a target="_blank" rel="noopener" href="https://en.wiktionary.org/wiki/${encodeURIComponent(q)}#French">Wiktionary</a> <a target="_blank" rel="noopener" href="https://www.wordreference.com/fren/${encodeURIComponent(q)}">WordReference</a> <a target="_blank" rel="noopener" href="https://www.larousse.fr/dictionnaires/francais/${encodeURIComponent(q)}">Larousse</a></p>`;
  if (suggest.length && !compact) h += `<p class="mut" style="margin-top:12px">Autres mots : ${suggest.map(e => `<a href="#" onclick="dicoSearch('${esc(e.w).replace(/'/g, "\\'")}');return false">${esc(e.w)}</a>`).join(" · ")}</p>`;
  return h;
}

// ---------- my words: dictionary entries added to the spaced-repetition cards ----------
function registerCustom(w, c) {
  const id = "v:d_" + w; if (ITEMS[id]) return id;
  const v = { id: "d_" + w, fr: c.fr, en: c.en, theme: "Mes mots (dictionnaire)", unit: -1, sec: "custom", level: "", audio: "" };
  ITEMS[id] = { id, kind: "v", v, theme: v.theme, unit: -1, level: "" }; ALL.push(id); VOCAB.push(v);
  return id;
}
Object.entries(S.custom || {}).forEach(([k, c]) => registerCustom(k.slice(2), c));
window.addMyWord = async w => {
  await loadDict(); const e = BYW.get(w); if (!e) return;
  S.custom = S.custom || {};
  if (S.custom["d_" + w]) return;
  const g = e.g && e.s.some(s => s[0] === "n") ? e.g : "", fr = g === "m" ? (/^[aeiouyéèêhœ]/i.test(w) ? "l'" + w + " (m)" : "le " + w) : g === "f" ? (/^[aeiouyéèêhœ]/i.test(w) ? "l'" + w + " (f)" : "la " + w) : w;
  const c = S.custom["d_" + w] = { fr, en: e.s.map(s => s[1][0]).slice(0, 2).join("; "), t: Date.now() };
  const id = registerCustom(w, c), now = Date.now();
  S.cards[id] = S.cards[id] || { ease: 2.5, interval: 0, reps: 0, lapses: 0, due: now, first: now, mod: now };
  save();
  document.querySelectorAll("button").forEach(b => { if (b.getAttribute("onclick") === `addMyWord(${JSON.stringify(w)})`) b.textContent = "✓ Dans mes cartes"; });
};

// ---------- dictionary tab ----------
window.dicoSearch = q => { const i = $("#dq"); if (i) { i.value = q; i.oninput(); } else go("dico", q); };
window.renderDico = async (q) => {
  view.innerHTML = `<div class="card"><h2>Dictionnaire</h2>
   <p class="mut">Français → anglais (et anglais → français). Reconnaît les formes conjuguées et accordées : tapez « allons », « yeux », « belles »… Double-cliquez sur n'importe quel mot français dans l'application pour le chercher.</p>
   <input type="text" id="dq" placeholder="Chercher un mot…" autocomplete="off" autocapitalize="off" value="${esc(q || "")}"></div>
   <div class="card" id="dr"><p class="mut">Chargement du dictionnaire…</p></div>
   <div class="card"><h3>Mes mots</h3><div id="dm"></div></div>
   <p class="mut">Sources : English Wiktionary via kaikki.org (CC BY-SA 4.0) · Lexique 3.83, New & Pallier (CC BY-SA 4.0).</p>`;
  const mine = Object.values(S.custom || {}).sort((a, b) => b.t - a.t);
  $("#dm").innerHTML = mine.length ? `<table>${mine.map(c => `<tr><td>${spk(c.fr)}</td><td><b>${frHTML(c.fr)}</b></td><td>${esc(c.en)}</td></tr>`).join("")}</table>` : `<p class="mut">Les mots ajoutés depuis le dictionnaire apparaissent ici et dans vos cartes de révision.</p>`;
  try { await loadDict(); } catch (e) { if ($("#dr")) $("#dr").innerHTML = `<p class="badc">${esc(e.message)}</p>`; return; }
  const inp = $("#dq"); if (!inp) return; // user already left the tab
  let t = null;
  inp.oninput = () => { clearTimeout(t); t = setTimeout(() => { if (!$("#dr")) return; const v = inp.value.trim(); $("#dr").innerHTML = v ? resultsHTML(v) : `<p class="mut">${DICT.length.toLocaleString("fr")} mots · ${Object.keys(DICT_FORMS).length.toLocaleString("fr")} formes conjuguées et accordées.</p>`; if (v) track("dico", "Dictionnaire"); }, 150); };
  inp.oninput(); inp.focus();
};

// ---------- double-click any French word → pop-up definition ----------
let hlT = null; // highlighter: a single click opens the grammar lesson, unless it turns into a double-click
window.hlClick = (e, id) => { clearTimeout(hlT); if (e.detail > 1) return; hlT = setTimeout(() => openLesson(id), 300); };
document.addEventListener("dblclick", async e => {
  clearTimeout(hlT);
  if (e.target.closest("input, textarea, .dpop")) return;
  const sel = (window.getSelection() + "").trim().replace(/^[^\p{L}]+|[^\p{L}'’-]+$/gu, "");
  if (!sel || sel.length > 40 || !/\p{L}/u.test(sel)) return;
  try { await loadDict(); } catch (err) { return; }
  let pop = $(".dpop");
  if (!pop) { pop = document.createElement("div"); pop.className = "dpop card"; document.body.appendChild(pop); }
  pop.innerHTML = `<div class="row" style="justify-content:space-between"><b class="mut">Dictionnaire</b><span><a href="#" onclick="go('dico',${JSON.stringify(sel).replace(/"/g, "&quot;")});this.closest('.dpop').remove();return false">ouvrir</a> · <a href="#" onclick="this.closest('.dpop').remove();return false">✕</a></span></div>${resultsHTML(sel, true)}`;
});
document.addEventListener("keydown", e => { if (e.key === "Escape") { const p = $(".dpop"); if (p) p.remove(); } });
