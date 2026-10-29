"use strict";
// « Mon unité » : the three A1 books worked through together, one unit at a time (30 units).
// Grammar chapters keep the order of the Grammaire progressive (its 8 bilans close units 4, 9, 12, 16, 20, 25, 27 and 30);
// each unit gets the Vocabulaire progressif unit and the Communication acts on the same topic, so that every book is used in full.
// Inside a unit the steps follow Paul Nation's four strands: meaning-focused input (the dialogue) → language-focused learning
// (Manières de dire, grammar, the unit's words, exercises) → meaning-focused output (role play, journal) → fluency (faster, retell).
// New word cards only come from units already reached, and from the current unit only once its dialogue has been heard.
window.PARCOURS = [
  // [grammar chapters, Vocabulaire units, Communication acts]
  [[1, 2], [1], [21]], [[3, 4], [2], [22]], [[5, 6, 7], [11], [30]], [[8, 9], [3], [23]],
  [[10, 11], [12], [1]], [[12, 13], [13], [3]], [[14, 15], [10], [18]], [[16, 17], [8], [35]],
  [[18, 19, 20], [6, 7], [29, 8]], [[21, 22], [21], [15]], [[23, 24], [23], [16]], [[25, 26, 27], [4], [36]],
  [[28, 29], [15], [9]], [[30], [22], [19]], [[31, 32], [14], [2, 4]], [[33, 34], [9], [6, 17]],
  [[35, 36], [16], [7]], [[37, 38], [5], [31]], [[39, 40], [20], [10, 11]], [[41, 42], [27], [26]],
  [[43], [25], [5, 13]], [[44, 45], [18], [25, 12]], [[46], [24], [24]], [[47], [17], [27]],
  [[48, 49], [19], [14]], [[50, 51], [26], [28, 20]], [[52, 53, 54], [28], [32, 33]], [[55, 56], [], [34, 37]],
  [[57, 58], [], [38, 39]], [[59, 60], [], [40]],
];
const NU = PARCOURS.length;
const U = k => { const [g, v, c] = PARCOURS[k - 1]; return { k, g, v, c, bilan: GBILANS.findIndex(b => g.includes(b[0])),
  title: c.map(n => COMM[n - 1].title).join(" · "), topic: v.map(n => VP_UNITS[n - 1].title).join(" · ") }; };
window.curUnit = () => Math.min(NU, Math.max(1, S.cur || 1));

// ---------- the steps of a unit ----------
const STEPS = [
  ["ecoute", "input", "Écouter le dialogue", "Écoutez en lisant, sans rien apprendre par cœur : comprendre le sens d'abord."],
  ["langue", "study", "Manières de dire, règles et exemples", "Lisez les expressions du dialogue, puis les règles de grammaire avec leurs exemples."],
  ["mots", "study", "Les mots de l'unité", "Maintenant que vous les avez entendus : les cartes des mots de l'unité."],
  ["exos", "study", "Exercices du livre", "Les exercices de grammaire et les activités du livre."],
  ["parler", "output", "Jeu de rôle", "Jouez un rôle du dialogue, à voix haute."],
  ["ecrire", "output", "Écrire dans le journal", "Quelques phrases à vous, avec les mots de l'unité."],
  ["fluide", "fluency", "Fluidité : réécouter plus vite et raconter", "Du connu, plus vite : réécoutez, puis racontez le dialogue."],
];
const unitWordIds = k => { const u = U(k); return ALL.filter(id => { const it = ITEMS[id]; return it.kind === "v" && (u.v.includes(it.unit) || u.c.some(n => it.unit === "c" + n)); }); };
const wordOrder = (a, b) => (ITEMS[a].v.src === "livre" ? 0 : 1) - (ITEMS[b].v.src === "livre" ? 0 : 1) || rankOf(a) - rankOf(b);
const stepsOf = k => STEPS.concat(U(k).bilan >= 0 ? [["bilan", "study", `Bilan n° ${U(k).bilan + 1} de grammaire`, `Révision des chapitres ${BILANS[U(k).bilan][0]} à ${BILANS[U(k).bilan][1]}.`]] : []);
function stepDone(k, s) {
  if ((S.ustep || {})[k + ":" + s]) return true;
  if (s === "mots") { const ids = unitWordIds(k); return ids.length > 0 && ids.filter(id => card(id)).length >= ids.length * 0.8; }
  if (s === "ecrire") return Object.values(S.journal || {}).some(e => e.u === k && e.t && e.t.trim());
  return false;
}
const unitPct = k => { const st = stepsOf(k); return st.filter(([s]) => stepDone(k, s)).length / st.length; };
window.tickStep = (k, s, v) => { S.ustep = S.ustep || {}; if (v) S.ustep[k + ":" + s] = Date.now(); else delete S.ustep[k + ":" + s]; save(); renderHome(); };
window.setUnit = k => { S.cur = Math.min(NU, Math.max(1, +k)); save(); go("today"); };
window.doStep = (k, s) => {
  const u = U(k), a = u.c[0];
  if (s === "ecoute") openComm(a, null, "listen", 0);
  else if (s === "parler") openComm(a, null, "role", 0);
  else if (s === "fluide") openComm(a, null, "retell", 0);
  else if (s === "mots") { WU = k; go("uwords"); }
  else if (s === "ecrire") go("journal");
  else if (s === "bilan") startReview("bilan:" + u.bilan);
  else { const el = $("#mod-" + (s === "langue" ? "langue" : "gram")); if (el) el.scrollIntoView({ behavior: "smooth" }); }
};
// new cards: units already reached, in unit order; the current unit only after its dialogue was heard
window.parcoursNew = () => {
  const cur = curUnit(), out = [];
  for (let k = 1; k <= cur; k++) { if (k === cur && !stepDone(k, "ecoute")) break; out.push(...unitWordIds(k).filter(id => !card(id)).sort(wordOrder)); }
  return out;
};

// ---------- home: progress, then the current unit ----------
const pct = x => Math.round(x * 100) + " %";
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
    <text x="${P}" y="${H - 6}" font-size="11" fill="var(--mut)">${new Date(days[0] + "T12:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</text>
    <text x="${W - P}" y="${H - 6}" font-size="11" fill="var(--mut)" text-anchor="end">aujourd'hui</text>
    <text x="${W - P}" y="${y2(cum[N - 1]) - 6}" font-size="12" font-weight="600" fill="var(--ac)" text-anchor="end">${cum[N - 1]} mots</text></svg>
   <div class="legend"><span><i class="dot" style="background:var(--ac)"></i>mots et expressions rencontrés (cumul)</span><span><i class="dot" style="background:var(--ac-bg);border:1px solid var(--ac)"></i>minutes d'étude par jour</span></div>`;
}
function homeProgress(k) {
  const done = Array.from({ length: NU }, (_, i) => i + 1).filter(j => unitPct(j) === 1).length, t = timeStats();
  const known = ALL.filter(id => ITEMS[id].kind === "v" && card(id) && card(id).interval >= 7).length, due = dueIds().length;
  const recs = S.sessions.slice(-5).reverse().map(s => `<li>${esc(s.label)} <span class="mut">· ${new Date(s.start).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}${s.total ? ` · ${s.correct}/${s.total}` : ""}</span></li>`).join("");
  const ago = S.lastExport ? Math.floor((Date.now() - S.lastExport) / DAY) : null, hasP = Object.keys(S.cards).length >= 20 || Object.keys(S.ustep || {}).length;
  const backup = hasP && !localStorage.getItem("fr-gist-token") && (ago === null || ago > 7) ? `<p class="mut">💾 Dernière sauvegarde : ${ago === null ? "jamais" : "il y a " + ago + " jours"} · <a href="#" onclick="go('sync');return false">sauvegarder</a></p>` : "";
  return `<div class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">Mes progrès</h2><a href="#" onclick="go('progress');return false">Statistiques →</a></div>
   <div class="stats" style="margin:12px 0">
    <div class="stat"><b>${k}<span class="mut" style="font-size:15px;font-weight:400"> / ${NU}</span></b>unité en cours · ${done} terminée${done > 1 ? "s" : ""}</div>
    <div class="stat"><b>${streak()}</b>jours d'affilée</div>
    <div class="stat"><b>${fmtDur(t.total)}</b>au total · ${Math.round(t.today / 60)} min aujourd'hui</div>
    <div class="stat"><b>${known}</b>mots retenus (≥ 1 semaine)</div></div>
   <div class="bar" title="Parcours A1"><i style="width:${(done + unitPct(k)) / NU * 100}%"></i></div>
   <p class="mut" style="margin:4px 0 14px">Parcours A1 : ${pct((done + unitPct(k)) / NU)}</p>
   ${learningCurve()}
   ${due ? `<p class="row" style="margin-top:14px"><button class="b s" onclick="startReview('due')">Réviser ${due} carte${due > 1 ? "s" : ""} du jour</button><span class="mut">quelques minutes, avant ou après l'unité</span></p>` : ""}
   ${recs ? `<details style="margin-top:10px"><summary>Dernières séances</summary><ul>${recs}</ul></details>` : ""}${backup}</div>`;
}
const linesHTML = lines => `<div class="mini">${withAB(lines).map(l => `<p><span class="who2 ${l.ab === "A" ? "" : "b2"}">${esc(l.who)}</span> ${spk(l.text)} ${esc(l.text)}${l.en ? `<br><span class="mut">${esc(l.en)}</span>` : ""}</p>`).join("")}</div>`;
function unitModules(k) {
  const u = U(k), acts = u.c.map(n => COMM[n - 1]), ls = u.g.map(g => LESSONS[g - 1]);
  const missing = [...acts.filter(c => !c.entered).map(c => `Communication ${c.n}`), ...ls.filter(l => !l.entered).map(l => `Grammaire ${l.n}`), ...u.v.filter(v => !VP_UNITS[v - 1].entered).map(v => `Vocabulaire ${v}`)];
  const dlg = acts.map(c => c.dlgs.map((d, j) => `<div class="sitbox"><div class="row" style="justify-content:space-between"><h3 style="margin:0">${esc(d.sit)} <span class="mut" style="font-weight:400">· Communication ${c.n} · p. ${d.page}</span></h3>
     <div class="row"><button class="b s" onclick="openComm(${c.n},null,'listen',${j})">▶ Écouter</button><button class="b s" onclick="openComm(${c.n},null,'shadow',${j})">Répéter</button><button class="b s" onclick="openComm(${c.n},null,'role',${j})">Jeu de rôle</button></div></div>
     ${d.lines.length ? linesHTML(d.lines) : `<p class="mut">Dialogue pas encore importé.</p>`}</div>`).join("")).join("");
  const ex = acts.flatMap(c => c.ex), md = ex.length ? `<table>${ex.map(([fr, en]) => `<tr><td style="width:44px">${spk(fr)}</td><td><b>${esc(fr)}</b></td><td class="mut">${esc(en || "")}</td></tr>`).join("")}</table>` : `<p class="mut">Pas encore importées.</p>`;
  const acts2 = acts.filter(c => c.acts || c.task).map(c => `<button class="b s" onclick="openComm(${c.n},null,'listen',0);setTimeout(()=>{const a=document.querySelector('.acts')||document.querySelector('#view .card:last-of-type');a&&a.scrollIntoView()},300)">Activités du livre · Communication ${c.n}</button>`).join("");
  const gram = ls.map(l => `<div class="sitbox"><h3 style="margin:0 0 4px">${l.n}. ${esc(l.title)} <span class="mut" style="font-weight:400">· p. ${l.page}</span></h3><p class="mut" style="margin:0">${l.subs.map(esc).join(" · ")}</p>
     ${l.entered ? `<ul>${l.rules.map(r => `<li>${hl(r)}</li>`).join("")}</ul>${l.examples.length ? `<h4>Exemples</h4>${l.examples.map(e => `<p>${spk(plain(e[0]))} ${hl(e[0])}${e[1] ? `<br><span class="mut">${esc(e[1])}</span>` : ""}</p>`).join("")}` : ""}
       ${l.ex.length ? `<p><button class="b s" onclick="startReview('lesson:${l.id}')">Exercices du chapitre (${l.ex.length})</button></p>` : ""}` : `<p class="mut">Chapitre pas encore importé.</p>`}</div>`).join("");
  const nw = unitWordIds(k), seen = nw.filter(id => card(id)).length;
  return `${missing.length ? `<div class="card note"><b>Contenu à importer :</b> ${missing.join(", ")}. <span class="mut">Plus → Communication / Grammaire / Vocabulaire → « Importer tout le livre ».</span></div>` : ""}
   <div class="card" id="mod-dlg"><h2><i class="dot" style="background:var(--input)"></i> Dialogue${acts.reduce((a, c) => a + c.dlgs.length, 0) > 1 ? "s" : ""}</h2>${dlg}</div>
   <div class="card" id="mod-langue"><h2><i class="dot" style="background:var(--study)"></i> Manières de dire</h2>${md}</div>
   <div class="card" id="mod-gram"><h2><i class="dot" style="background:var(--study)"></i> Grammaire</h2>${gram}${acts2 ? `<div class="row" style="margin-top:12px">${acts2}</div>` : ""}</div>
   <div class="card"><h2><i class="dot" style="background:var(--study)"></i> Vocabulaire</h2><p>${esc(u.topic || "—")} · <b>${nw.length}</b> mots et expressions · ${seen} déjà vus</p>
    <p class="row"><button class="b s" onclick="WU=${k};go('uwords')">Voir les mots de l'unité</button></p></div>`;
}
window.renderHome = () => {
  const k = curUnit(), u = U(k), st = stepsOf(k), next = st.find(([s]) => !stepDone(k, s));
  view.innerHTML = homeProgress(k) + `<div class="card unitcard">
   <div class="row" style="justify-content:space-between"><span class="tag">Unité ${k} sur ${NU}</span>
    <select onchange="setUnit(this.value)" aria-label="Changer d'unité">${PARCOURS.map((_, i) => `<option value="${i + 1}" ${i + 1 === k ? "selected" : ""}>${unitPct(i + 1) === 1 ? "✓ " : ""}${i + 1}. ${esc(U(i + 1).title)}</option>`).join("")}</select></div>
   <h1 style="margin-top:10px">${esc(u.title)}</h1>
   <p class="sub">${esc(u.topic)}${u.topic ? " · " : ""}Grammaire ${u.g.join(", ")} · Communication ${u.c.join(", ")}${u.v.length ? " · Vocabulaire " + u.v.join(", ") : ""}</p>
   <div class="bar" style="margin:14px 0 6px"><i style="width:${unitPct(k) * 100}%"></i></div>
   <div class="steps">${st.map(([s, strand, label, hint], i) => { const d = stepDone(k, s); return `<div class="todo ${d ? "done" : ""}">
     <input type="checkbox" ${d ? "checked" : ""} onchange="tickStep(${k},'${s}',this.checked)" aria-label="${esc(label)}">
     <div style="flex:1"><div class="t"><i class="dot" style="background:var(--${strand})"></i> <b>${i + 1}. ${esc(label)}</b></div><div class="mut" style="font-size:14px">${esc(hint)}</div></div>
     <button class="b ${next && next[0] === s ? "" : "s"}" onclick="doStep(${k},'${s}')">${next && next[0] === s ? "Commencer" : "Ouvrir"}</button></div>`; }).join("")}</div>
   ${!next ? `<p class="row"><b class="good">Unité terminée ✅</b>${k < NU ? `<button class="b" onclick="setUnit(${k + 1})">Unité suivante →</button>` : ""}</p>` : ""}
   <div class="legend" style="margin-top:8px">${[["input", "Écoute"], ["study", "Étude de la langue"], ["output", "Production"], ["fluency", "Fluidité"]].map(([c, l]) => `<span><i class="dot" style="background:var(--${c})"></i>${l}</span>`).join("")}</div></div>` + unitModules(k);
};

// ---------- Mots: the unit's words, the error notebook, the dictionary ----------
window.WU = 0;
window.toggleCarnet = id => { S.carnet = S.carnet || {}; if (S.carnet[id]) delete S.carnet[id]; else S.carnet[id] = Date.now(); save(); const b = document.querySelector(`[data-cn="${id}"]`); if (b) b.textContent = S.carnet[id] ? "★" : "☆"; };
const star = id => `<button class="b s starb" data-cn="${id}" title="Carnet d'erreurs" onclick="toggleCarnet('${id}')">${(S.carnet || {})[id] ? "★" : "☆"}</button>`;
const wRow = id => { const v = ITEMS[id].v; return `<tr><td style="width:44px">${spk(v.fr)}</td><td><b>${frHTML(v.fr)}</b></td><td>${esc(v.en || "")}</td><td class="mut">${wordState2(v)}</td><td style="width:52px">${star(id)}</td></tr>`; };
window.renderUnitWords = () => {
  const k = WU || curUnit(), u = U(k), ids = unitWordIds(k);
  const groups = [["Vocabulaire progressif — les mots du livre", ids.filter(id => ITEMS[id].v.src === "livre" && !/^cm/.test(ITEMS[id].v.id))],
    ["Communication progressive — Manières de dire", ids.filter(id => /^cm/.test(ITEMS[id].v.id))],
    ["Français interactif — mots complémentaires", ids.filter(id => ITEMS[id].v.src === "FI")]];
  const nNew = ids.filter(id => !card(id)).length, due = ids.filter(isDue).length;
  view.innerHTML = `<div class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">Mots de l'unité ${k}</h2>
    <select onchange="WU=+this.value;renderUnitWords()" aria-label="Unité">${PARCOURS.map((_, i) => `<option value="${i + 1}" ${i + 1 === k ? "selected" : ""}>${i + 1}. ${esc(U(i + 1).title)}</option>`).join("")}</select></div>
   <p class="sub">${esc(u.topic || u.title)} · ${ids.length} mots et expressions · ${nNew} nouveaux · ${due} à réviser</p>
   ${k === curUnit() && !stepDone(k, "ecoute") ? `<p class="note">Écoutez d'abord le dialogue de l'unité : les mots s'apprennent mieux une fois rencontrés dans un texte.</p>` : ""}
   <p class="row"><button class="b" onclick="startReview('pu:${k}')" ${ids.length ? "" : "disabled"}>Apprendre (${Math.min(20, nNew)} nouveaux${due ? ` + ${due} à réviser` : ""})</button>
    <input type="text" id="wq" placeholder="Rechercher dans tous les mots…" style="flex:1;min-width:200px"></p>
   <p class="mut">☆ = ajouter au carnet d'erreurs.</p></div><div id="wres"></div>`;
  const list = () => groups.filter(g => g[1].length).map(([t, g]) => `<div class="card"><h3>${t}</h3><div style="overflow-x:auto"><table>${g.sort(wordOrder).map(wRow).join("")}</table></div></div>`).join("") || `<div class="card"><p class="mut">Pas encore de mots pour cette unité : importez le Vocabulaire progressif et la Communication progressive.</p></div>`;
  const draw = () => { const q = $("#wq").value.trim().toLowerCase();
    $("#wres").innerHTML = !q ? list() : `<div class="card" style="overflow-x:auto"><table>${ALL.filter(id => ITEMS[id].kind === "v" && (ITEMS[id].v.fr + " " + ITEMS[id].v.en).toLowerCase().includes(q)).slice(0, 80).map(wRow).join("") || "<tr><td>Aucun résultat</td></tr>"}</table></div>`; };
  $("#wq").oninput = draw; draw();
};
const carnetIds = () => [...new Set(Object.keys(S.carnet || {}).filter(id => ITEMS[id]).concat(ALL.filter(id => card(id) && card(id).lapses > 0)))]
  .sort((a, b) => ((card(b) || {}).lapses || 0) - ((card(a) || {}).lapses || 0));
window.renderErrors = () => {
  const ids = carnetIds();
  const row = id => { const it = ITEMS[id], c = card(id); return `<tr><td style="width:44px">${it.kind === "v" ? spk(it.v.fr) : ""}</td><td><b>${esc(it.kind === "v" ? it.v.fr : plain(it.q))}</b>${it.kind === "g" ? `<br><span class="mut">${esc(it.l.title)}</span>` : ""}</td><td>${esc(it.kind === "v" ? it.v.en || "" : it.a || "")}</td><td class="mut">${c ? c.lapses + " erreur" + (c.lapses > 1 ? "s" : "") : "ajouté"}</td><td style="width:52px">${it.kind === "v" ? star(id) : ""}</td></tr>`; };
  view.innerHTML = `<div class="card"><h2>Carnet d'erreurs</h2><p class="sub">Les cartes que vous avez ratées, et les mots ajoutés avec ☆. Ils reviennent plus souvent jusqu'à ce qu'ils soient acquis.</p>
   <p class="row"><button class="b" onclick="startReview('carnet')" ${ids.length ? "" : "disabled"}>Revoir le carnet (${Math.min(25, ids.length)})</button></p></div>
   <div class="card" style="overflow-x:auto">${ids.length ? `<table>${ids.map(row).join("")}</table>` : `<p class="mut">Rien pour l'instant.</p>`}</div>`;
};

// ---------- Journal: a small card per day, on a monthly calendar ----------
let JM = null, JD = null;
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const nWords = t => (t.match(/[A-Za-zÀ-ÿœŒ'’-]+/g) || []).length;
window.jMonth = d => { const [y, m] = JM; const t = new Date(y, m + d, 1); JM = [t.getFullYear(), t.getMonth()]; renderJournal(); };
window.jPick = d => { JD = d; renderJournal(); setTimeout(() => { const t = $("#jt"); if (t) { t.focus(); t.scrollIntoView({ block: "center", behavior: "smooth" }); } }, 0); };
window.jIns = w => { const t = $("#jt"), p = t.selectionStart ?? t.value.length; t.value = t.value.slice(0, p) + w + t.value.slice(p); t.focus(); t.selectionStart = t.selectionEnd = p + w.length; t.oninput(); };
window.renderJournal = () => {
  if (!JM) { const n = new Date(); JM = [n.getFullYear(), n.getMonth()]; }
  if (!JD) JD = dstr();
  const [y, m] = JM, J = S.journal || {}, first = (new Date(y, m, 1).getDay() + 6) % 7, dim = new Date(y, m + 1, 0).getDate();
  const ds = i => `${y}-${String(m + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
  const monthE = Array.from({ length: dim }, (_, i) => J[ds(i + 1)]).filter(e => e && e.t && e.t.trim());
  const cells = Array(first).fill(`<div class="jc empty"></div>`).concat(Array.from({ length: dim }, (_, i) => { const d = ds(i + 1), e = J[d], has = e && e.t && e.t.trim();
    return `<button class="jc ${has ? "has" : ""} ${d === JD ? "sel" : ""} ${d === dstr() ? "today" : ""}" onclick="jPick('${d}')"><span class="jn">${i + 1}</span>${has ? `<span class="jp">${esc(e.t.slice(0, 60))}</span>` : ""}</button>`; })).join("");
  const e = J[JD] || {}, k = curUnit(), hints = unitWordIds(k).filter(id => card(id)).sort(wordOrder).slice(0, 14).map(id => ITEMS[id].v.fr);
  const dl = new Date(JD + "T12:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  view.innerHTML = `<div class="card"><div class="row" style="justify-content:space-between"><button class="b s" onclick="jMonth(-1)" aria-label="Mois précédent">‹</button>
    <h2 style="margin:0">${MOIS[m]} ${y}</h2><button class="b s" onclick="jMonth(1)" aria-label="Mois suivant">›</button></div>
   <p class="sub" style="text-align:center">${monthE.length} jour${monthE.length > 1 ? "s" : ""} écrit${monthE.length > 1 ? "s" : ""} · ${monthE.reduce((a, x) => a + nWords(x.t), 0)} mots ce mois-ci</p>
   <div class="jcal">${["lun", "mar", "mer", "jeu", "ven", "sam", "dim"].map(d => `<div class="jh">${d}</div>`).join("")}${cells}</div></div>
   <div class="card jcard"><div class="row" style="justify-content:space-between"><h2 style="margin:0;text-transform:capitalize">${esc(dl)}</h2><span class="mut" id="jw">${nWords(e.t || "")} mots</span></div>
    <p class="mut">Quelques phrases en français sur votre journée. Pas de dictionnaire d'abord : écrivez avec ce que vous savez${e.u ? ` · écrit pendant l'unité ${e.u}` : ""}.</p>
    <textarea id="jt" rows="7" lang="fr" spellcheck="true" placeholder="Aujourd'hui, je…">${esc(e.t || "")}</textarea>
    ${hints.length ? `<p class="mut" style="margin-bottom:4px">Mots de l'unité ${k} à réutiliser :</p><div>${hints.map(w => `<button class="chip jw" onclick='jIns(${JSON.stringify(w + " ").replace(/'/g, "&#39;")})'>${esc(w)}</button>`).join("")}</div>` : ""}
    <p class="mut" id="js" style="margin:6px 0 0">${e.at ? "Enregistré" : ""}</p></div>`;
  $("#jt").oninput = () => {
    const t = $("#jt").value; S.journal = S.journal || {};
    S.journal[JD] = { t, at: Date.now(), u: (S.journal[JD] || {}).u || k };
    $("#jw").textContent = nWords(t) + " mots"; $("#js").textContent = "Enregistré"; save(); track("journal", "Journal");
  };
};

go("today");
