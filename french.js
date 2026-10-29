"use strict";
// French-specific activities + the guided daily session (four strands, Paul Nation),
// adapted to French: sounds/spelling, gender, conjugation, dictation.

// ---------- helpers ----------
// "reached" = done, or scheduled for today or earlier (planner.js)
const reachedLesson = n => isReached("lesson:g" + String(n).padStart(2, "0"));
const reachedVocab = n => isReached("vocab:" + n);
const reachedComm = n => isReached("comm:" + n);
const dayIndex = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / DAY);
const minutesPerDay = () => S.settings.minutes || 40;
const strandMin = (d, k) => Math.round((((S.daily[d] || {}).st || {})[k] || 0) / 60);
window.logMinutes = (k, m) => { addDay(null, m * 60, k); addDay("secs", m * 60); save(); go(tab === "today" ? "today" : tab); };
const STRANDS = [["study", "📘 Étude ciblée"], ["input", "🎧 Écoute & lecture"], ["output", "🗣️ Production"], ["fluency", "⚡ Fluidité"]];
function setView(t, strand) { stopActivity(); tab = t; curStrand = strand; document.querySelectorAll("#nav button").forEach(b => b.classList.toggle("on", b.dataset.tab === t)); scrollTo(0, 0); }
const back = `<p><a href="#" onclick="go('today');return false">← Aujourd'hui</a></p>`;
let TIMER = null;
function stopActivity() { if (TIMER) clearInterval(TIMER); TIMER = null; if (window.speechSynthesis) speechSynthesis.cancel(); if (rec && rec.state === "recording") rec.stop(); }
window.stopActivity = stopActivity;
function countdown(sec, el, onEnd) {
  if (TIMER) clearInterval(TIMER);
  const end = Date.now() + sec * 1000;
  const tick = () => { const r = Math.max(0, Math.round((end - Date.now()) / 1000)); el.textContent = Math.floor(r / 60) + ":" + String(r % 60).padStart(2, "0"); if (!r) { clearInterval(TIMER); TIMER = null; onEnd && onEnd(); } };
  tick(); TIMER = setInterval(tick, 250);
}

// ---------- gender colouring ----------
function genderOf(fr) {
  const s = fr.trim();
  if (/^(le|un)\s/i.test(s) || /\(m\.?\)|\(m\.? ?pl\.?\)/i.test(s)) return "m";
  if (/^(la|une)\s/i.test(s) || /\(f\.?\)|\(f\.? ?pl\.?\)/i.test(s)) return "f";
  return "";
}
window.genderOf = genderOf;

// ---------- recorder (shadowing / self-listening, stays in the browser) ----------
let rec = null;
window.recToggle = async (btn, outId) => {
  if (rec && rec.state === "recording") { rec.stop(); return; }
  try {
    const st = await navigator.mediaDevices.getUserMedia({ audio: true }), chunks = [];
    rec = new MediaRecorder(st); rec.ondataavailable = e => chunks.push(e.data);
    rec.onstop = () => { st.getTracks().forEach(t => t.stop()); const o = document.getElementById(outId); if (o) o.innerHTML = `<audio controls src="${URL.createObjectURL(new Blob(chunks, { type: rec.mimeType }))}"></audio>`; btn.textContent = "🎙 M'enregistrer"; };
    rec.start(); btn.textContent = "⏹ Arrêter";
  } catch (e) { alert("Micro indisponible : " + e.message); }
};
const recWidget = id => `<span class="row"><button class="b s" onclick="recToggle(this,'${id}')">🎙 M'enregistrer</button><span id="${id}"></span></span>`;

// ---------- conjugation ----------
// [infinitive, unit, present ×6, participle, aux, future stem]
const VERBS = [
 ["être", 4, "suis es est sommes êtes sont", "été", "avoir", "ser"], ["avoir", 19, "ai as a avons avez ont", "eu", "avoir", "aur"],
 ["aimer", 6, "aime aimes aime aimons aimez aiment", "aimé", "avoir", "aimer"], ["parler", 7, "parle parles parle parlons parlez parlent", "parlé", "avoir", "parler"],
 ["habiter", 7, "habite habites habite habitons habitez habitent", "habité", "avoir", "habiter"], ["manger", 8, "mange manges mange mangeons mangez mangent", "mangé", "avoir", "manger"],
 ["commencer", 8, "commence commences commence commençons commencez commencent", "commencé", "avoir", "commencer"], ["acheter", 8, "achète achètes achète achetons achetez achètent", "acheté", "avoir", "achèter"],
 ["préférer", 8, "préfère préfères préfère préférons préférez préfèrent", "préféré", "avoir", "préférer"], ["se lever", 9, "lève lèves lève levons levez lèvent", "levé", "être", "lèver"],
 ["s'appeler", 9, "appelle appelles appelle appelons appelez appellent", "appelé", "être", "appeller"], ["finir", 35, "finis finis finit finissons finissez finissent", "fini", "avoir", "finir"],
 ["choisir", 35, "choisis choisis choisit choisissons choisissez choisissent", "choisi", "avoir", "choisir"], ["partir", 36, "pars pars part partons partez partent", "parti", "être", "partir"],
 ["sortir", 36, "sors sors sort sortons sortez sortent", "sorti", "être", "sortir"], ["dormir", 36, "dors dors dort dormons dormez dorment", "dormi", "avoir", "dormir"],
 ["écrire", 37, "écris écris écrit écrivons écrivez écrivent", "écrit", "avoir", "écrir"], ["lire", 37, "lis lis lit lisons lisez lisent", "lu", "avoir", "lir"],
 ["savoir", 38, "sais sais sait savons savez savent", "su", "avoir", "saur"], ["connaître", 38, "connais connais connaît connaissons connaissez connaissent", "connu", "avoir", "connaîtr"],
 ["voir", 38, "vois vois voit voyons voyez voient", "vu", "avoir", "verr"], ["boire", 39, "bois bois boit buvons buvez boivent", "bu", "avoir", "boir"],
 ["prendre", 39, "prends prends prend prenons prenez prennent", "pris", "avoir", "prendr"], ["comprendre", 39, "comprends comprends comprend comprenons comprenez comprennent", "compris", "avoir", "comprendr"],
 ["venir", 39, "viens viens vient venons venez viennent", "venu", "être", "viendr"], ["vouloir", 40, "veux veux veut voulons voulez veulent", "voulu", "avoir", "voudr"],
 ["pouvoir", 40, "peux peux peut pouvons pouvez peuvent", "pu", "avoir", "pourr"], ["devoir", 40, "dois dois doit devons devez doivent", "dû", "avoir", "devr"],
 ["faire", 41, "fais fais fait faisons faites font", "fait", "avoir", "fer"], ["dire", 41, "dis dis dit disons dites disent", "dit", "avoir", "dir"],
 ["aller", 42, "vais vas va allons allez vont", "allé", "être", "ir"], ["arriver", 46, "arrive arrives arrive arrivons arrivez arrivent", "arrivé", "être", "arriver"],
 ["rester", 46, "reste restes reste restons restez restent", "resté", "être", "rester"]
].map(v => ({ inf: v[0], unit: v[1], pres: v[2].split(" "), pp: v[3], aux: v[4], fut: v[5], refl: /^(se |s')/.test(v[0]), base: v[0].replace(/^(se |s')/, "") }));
const PERS = ["je", "tu", "il", "nous", "vous", "ils"], RPRO = ["me", "te", "se", "nous", "vous", "se"];
const TENSES = { pres: ["présent", 0], fp: ["futur proche", 43], pc: ["passé composé", 44], imp: ["imparfait", 47], fut: ["futur simple", 48] };
const vowel = w => /^[aeiouyéèêâîôûh]/i.test(w);
const elide = (a, w) => (["je", "me", "te", "se"].includes(a) && vowel(w)) ? a[0] + "'" + w : a + " " + w;
const byInf = inf => VERBS.find(v => v.inf === inf);
function conjForm(v, t, p) { // returns the form without the subject (with reflexive pronoun), plus accepted variants
  const r = v.refl ? RPRO[p] : null, withR = w => r ? elide(r, w) : w;
  if (t === "pres") return [withR(v.pres[p])];
  if (t === "imp") { const st = v.inf === "être" ? "ét" : v.pres[3].replace(/ons$/, ""); return [withR(st + ["ais", "ais", "ait", "ions", "iez", "aient"][p])]; }
  if (t === "fut") return [withR(v.fut + ["ai", "as", "a", "ons", "ez", "ont"][p])];
  if (t === "fp") return [byInf("aller").pres[p] + " " + (r ? elide(r, v.base) : v.base)];
  // passé composé
  const aux = (v.aux === "être" ? byInf("être") : byInf("avoir")).pres[p], pl = p >= 3;
  const pp = v.aux === "être" ? v.pp + (pl ? "s" : "") : v.pp;
  const main = withR(aux + " " + pp), alts = [main];
  if (v.aux === "être") alts.push(withR(aux + " " + v.pp + (pl ? "es" : "e")));
  return alts;
}
function tenseUnlocked(v, t) {
  if (!reachedLesson(v.unit)) return false;
  if (t === "pres") return true;
  if (t === "pc") return reachedLesson(v.aux === "être" ? 46 : (/er$/.test(v.base) && v.inf !== "être" ? 44 : 45));
  return reachedLesson(TENSES[t][1]);
}
const conjPairs = () => VERBS.flatMap(v => Object.keys(TENSES).filter(t => tenseUnlocked(v, t)).map(t => v.inf + "|" + t));
function pickConj(n) { // adaptive: weak and less-practised (verb, tense) pairs come up more often
  const pairs = conjPairs(); if (!pairs.length) return [];
  const st = S.conj || {}, w = pairs.map(k => { const s = st[k]; return s ? 0.3 + (1 - s.ok / s.n) * 3 + Math.min(2, (Date.now() - s.last) / (3 * DAY)) : 2.5; });
  const out = [];
  for (let i = 0; i < n; i++) {
    let r = Math.random() * w.reduce((a, b) => a + b, 0), j = 0; while ((r -= w[j]) > 0) j++;
    const [inf, t] = pairs[Math.min(j, pairs.length - 1)].split("|"); out.push({ inf, t, p: Math.random() * 6 | 0 });
  }
  return out;
}
window.openConj = () => {
  setView("today", "study");
  const q = pickConj(12);
  if (!q.length) { view.innerHTML = back + `<div class="card"><h2>Conjugaison</h2><p>Les conjugaisons s'ouvrent avec l'unité 4 (« être »). Continuez le plan !</p></div>`; return; }
  let i = 0, ok = 0, firstWrong = new Set();
  const n0 = q.length;
  const draw = () => {
    if (i >= q.length) { view.innerHTML = back + `<div class="card"><h2>Conjugaison terminée ✅</h2><p>${ok} bonnes réponses du premier coup sur ${n0}.</p><p class="mut">Les couples verbe + temps où vous vous trompez reviendront plus souvent.</p><p class="row"><button class="b" onclick="openConj()">Encore 12</button><button class="b s" onclick="go('today')">Retour</button></p></div>`; return; }
    const x = q[i], v = byInf(x.inf), alts = conjForm(v, x.t, x.p);
    view.innerHTML = back + `<div class="bar"><i style="width:${i / q.length * 100}%"></i></div>
     <div class="card"><span class="tag">${TENSES[x.t][0]}</span><span class="tag">unité ${v.unit}</span>
     <div class="big"><span class="mut">${v.inf} →</span> ${PERS[x.p]} ___</div>
     <p><input type="text" id="ci" autocomplete="off" autocapitalize="off" placeholder="${x.t === "pc" ? "auxiliaire + participe" : "forme du verbe"}${v.refl ? " (avec le pronom)" : ""}"></p>
     <p class="row"><button class="b" id="cc">Vérifier</button></p><div id="ca"></div></div>`;
    const inp = $("#ci"); inp.focus();
    const check = () => {
      const u = normAns(inp.value); if (!u) return;
      const good = alts.some(a => normAns(a) === u), near = !good && alts.some(a => stripAcc(normAns(a)) === stripAcc(u));
      const k = x.inf + "|" + x.t, st = (S.conj = S.conj || {})[k] || (S.conj[k] = { n: 0, ok: 0, last: 0 });
      st.n++; if (good || near) st.ok++; st.last = Date.now(); save(); track("conj", "Conjugaison", good);
      if (!good && !near && !firstWrong.has(i)) { firstWrong.add(i); q.splice(Math.min(i + 4, q.length), 0, x); }
      else if (good && !firstWrong.has(i)) ok++;
      const full = elide(PERS[x.p], alts[0]);
      inp.disabled = true; $("#cc").remove(); speak(full);
      $("#ca").innerHTML = `<p class="${good ? "good" : near ? "" : "badc"}"><b>${good ? "✓" : near ? "≈ Accents !" : "✗"} ${esc(full)}</b> ${spk(full)}</p>
       <p class="mut">${esc(v.inf)} · ${TENSES[x.t][0]} : ${PERS.map((pp, j) => esc(elide(pp, conjForm(v, x.t, j)[0]))).join(" · ")}</p>
       <p><button class="b" id="cn">Suivant ↵</button></p>`;
      $("#cn").focus(); $("#cn").onclick = () => { i++; draw(); };
    };
    $("#cc").onclick = check; inp.onkeydown = e => { if (e.key === "Enter") check(); };
  };
  draw();
};

// ---------- dictation (sound → spelling: silent endings, accents, homophones) ----------
function dicteePool() {
  const out = [];
  LESSONS.filter(l => reachedLesson(l.n)).forEach(l => l.examples.forEach(e => out.push(plain(e[0]))));
  // only text from your book entries (and the survival kit)
  if (reachedVocab(0)) SURVIVAL.filter(s => !/…|\//.test(s.fr)).forEach(s => out.push(s.fr));
  COMM.filter(c => reachedComm(c.n)).forEach(c => c.dlgs.forEach(d => d.lines.forEach(l => out.push(l.text))));
  return out;
}
const toks = s => s.replace(/[«»"!?.,;:—–()]/g, " ").replace(/[’]/g, "'").split(/\s+/).filter(Boolean);
window.openDictee = () => {
  setView("today", "study");
  const pool = shuffle(dicteePool()).slice(0, 5); let i = 0, words = 0, right = 0;
  const draw = () => {
    if (i >= pool.length) {
      (S.dictee = S.dictee || []).push({ t: Date.now(), n: words, ok: right }); save();
      view.innerHTML = back + `<div class="card"><h2>Dictée terminée ✅</h2><p>${right}/${words} mots justes.</p><p class="mut">En français, beaucoup de finales ne s'entendent pas (-s, -t, -ent, -e). La dictée entraîne à relier ce qu'on entend à la bonne orthographe.</p><p class="row"><button class="b" onclick="openDictee()">Nouvelle dictée</button><button class="b s" onclick="go('today')">Retour</button></p></div>`;
      return;
    }
    const s = pool[i];
    view.innerHTML = back + `<div class="bar"><i style="width:${i / pool.length * 100}%"></i></div><div class="card"><h2>Dictée ${i + 1}/${pool.length}</h2>
     <p class="row"><button class="b" id="d1">🔊 Écouter</button><button class="b s" id="d2">🐢 Plus lentement</button></p>
     <p><input type="text" id="di" autocomplete="off" autocapitalize="off" placeholder="Écrivez ce que vous entendez…"></p>
     <p class="row"><button class="b" id="dc">Corriger</button></p><div id="da"></div></div>`;
    const say = r => { const o = S.settings.rate; S.settings.rate = r; speak(s); S.settings.rate = o; };
    $("#d1").onclick = () => say(0.8); $("#d2").onclick = () => say(0.6); say(0.8); $("#di").focus();
    const check = () => {
      const a = toks(s), u = toks($("#di").value); if (!u.length) return;
      let html = "", ok = 0;
      a.forEach((w, k) => {
        const g = u[k] || "", L = x => x.toLowerCase();
        if (L(g) === L(w)) { ok++; html += `<span class="good">${esc(w)}</span> `; }
        else if (stripAcc(L(g)) === stripAcc(L(w))) html += `<span style="color:#d9730d" title="accent">${esc(w)}</span> `;
        else html += `<span class="badc"><s>${esc(g || "∅")}</s> ${esc(w)}</span> `;
      });
      words += a.length; right += ok; track("dictee", "Dictée", ok === a.length);
      $("#dc").remove(); $("#di").disabled = true;
      $("#da").innerHTML = `<p>${html}</p><p class="mut">Vert = juste · orange = accent · rouge = à revoir. Répétez la phrase à voix haute.</p><p><button class="b" id="dn">Suivant ↵</button></p>`;
      $("#dn").focus(); $("#dn").onclick = () => { i++; draw(); };
    };
    $("#dc").onclick = check; $("#di").onkeydown = e => { if (e.key === "Enter") check(); };
  };
  draw();
};

// ---------- gender quick-fire (fluency on known nouns) ----------
function nounPool() {
  const out = [];
  VOCAB.filter(v => reachedVocab(v.unit)).forEach(v => {
    const g = genderOf(v.fr); if (!g || /[,;/]/.test(v.fr)) return;
    const noun = v.fr.replace(/^(le|la|un|une)\s+/i, "").replace(/\s*\((m|f)\.?\s*(pl\.?)?\)\s*/gi, " ").trim();
    if (/^(l'|les )/i.test(noun) || noun.split(" ").length > 3) return;
    out.push({ noun, g, fr: v.fr, en: v.en, id: "v:" + v.id });
  });
  return out;
}
window.openGenre = () => {
  setView("today", "fluency");
  const pool = shuffle(nounPool()); if (pool.length < 8) { view.innerHTML = back + `<div class="card"><h2>Genre éclair</h2><p>Pas encore assez de noms appris. Revenez après quelques unités de vocabulaire.</p></div>`; return; }
  let i = 0, ok = 0, n = 0;
  view.innerHTML = back + `<div class="card"><h2>Genre éclair ⚡ <span id="gt" class="tag"></span></h2>
   <p class="mut">Le genre se mémorise avec le mot. Masculin ou féminin ? Le plus vite possible — touches ← (le) et → (la).</p>
   <div class="big" id="gw"></div><p class="row" style="justify-content:center"><button class="b" style="background:#2b6cd8" id="gm">← le / un</button><button class="b" style="background:#d23b6b" id="gf">la / une →</button></p><p id="gr" style="text-align:center"></p></div>`;
  const show = () => { $("#gw").textContent = pool[i % pool.length].noun; };
  const ans = g => { if (!TIMER) return; const x = pool[i % pool.length]; n++; if (g === x.g) ok++; $("#gr").innerHTML = `<span class="${g === x.g ? "good" : "badc"}">${g === x.g ? "✓" : "✗"} ${esc(x.fr)} — ${esc(x.en)}</span>`; i++; show(); };
  $("#gm").onclick = () => ans("m"); $("#gf").onclick = () => ans("f");
  document.onkeydown = e => { if (tab === "today" && $("#gw")) { if (e.key === "ArrowLeft") ans("m"); if (e.key === "ArrowRight") ans("f"); } };
  show();
  countdown(60, $("#gt"), () => { document.onkeydown = null; (S.genre = S.genre || []).push({ t: Date.now(), n, ok }); save(); track("genre", "Genre éclair", true);
    $("#gr").innerHTML = `<b>${ok}/${n} en 60 s.</b> <button class="b s" onclick="openGenre()">Rejouer</button>`; });
};

// ---------- numbers by ear (Nation activity 6.1: repeated listening, rising speed) ----------
window.openNombres = () => {
  setView("today", "fluency");
  const max = reachedLesson(28) ? 100 : 20; let round = 0, ok = 0, rate = 0.85, target = 0;
  view.innerHTML = back + `<div class="card"><h2>Nombres à l'oreille ⚡</h2><p class="mut">Écoutez et touchez le nombre. La vitesse augmente quand vous réussissez. (0–${max})</p>
   <p class="row"><button class="b s" id="nr">🔊 Réécouter</button><span id="ns" class="tag"></span></p><div id="ng" class="row" style="gap:6px"></div><p id="nf"></p></div>`;
  const next = () => {
    if (round >= 20) { (S.nombres = S.nombres || []).push({ t: Date.now(), ok, max }); save(); track("nombres", "Nombres", true); $("#ng").innerHTML = ""; $("#nf").innerHTML = `<b>${ok}/20</b> · vitesse finale ${rate.toFixed(2)} <button class="b s" onclick="openNombres()">Rejouer</button>`; return; }
    target = Math.random() * (max + 1) | 0;
    const opts = new Set([target]); while (opts.size < 12) opts.add(Math.random() * (max + 1) | 0);
    $("#ng").innerHTML = [...opts].sort((a, b) => a - b).map(x => `<button class="b s" style="min-width:52px" data-n="${x}">${x}</button>`).join("");
    $("#ns").textContent = `${round + 1}/20 · ×${rate.toFixed(2)}`;
    const o = S.settings.rate; S.settings.rate = rate; speak(String(target)); S.settings.rate = o;
  };
  $("#ng").onclick = e => { const x = e.target.dataset.n; if (x === undefined) return; round++;
    if (+x === target) { ok++; rate = Math.min(1.4, rate + 0.04); $("#nf").innerHTML = `<span class="good">✓ ${target}</span>`; } else $("#nf").innerHTML = `<span class="badc">✗ c'était ${target}</span>`;
    setTimeout(next, 500); };
  $("#nr").onclick = () => { const o = S.settings.rate; S.settings.rate = rate; speak(String(target)); S.settings.rate = o; };
  next();
};

// ---------- quick review of known cards (fluency: easy material, speed) ----------
window.openEclair = () => {
  setView("today", "fluency");
  const pool = shuffle(ALL.filter(id => ITEMS[id].kind === "v" && card(id) && card(id).reps >= 2));
  if (pool.length < 10) { view.innerHTML = back + `<div class="card"><h2>Révision éclair</h2><p>Il faut au moins 10 cartes déjà réussies deux fois. Continuez les cartes du jour !</p></div>`; return; }
  let i = 0, ok = 0;
  view.innerHTML = back + `<div class="card"><h2>Révision éclair ⚡ <span id="et" class="tag"></span></h2><p class="mut">Mots déjà connus : dites le sens à voix haute, puis touchez. Vitesse avant tout. (Espace = je sais)</p>
   <div class="big" id="ew"></div><p class="mut" id="ee" style="text-align:center"></p><p class="row" style="justify-content:center"><button class="b ok" id="ey">Je sais</button><button class="b bad" id="en">Je ne sais plus</button></p></div>`;
  const show = () => { const v = ITEMS[pool[i % pool.length]].v; $("#ew").textContent = v.fr; };
  const ans = k => { if (!TIMER) return; const id = pool[i % pool.length], v = ITEMS[id].v; $("#ee").textContent = v.fr + " = " + v.en; if (k) ok++; else grade(id, 0); i++; show(); };
  $("#ey").onclick = () => ans(true); $("#en").onclick = () => ans(false);
  document.onkeydown = e => { if ($("#ew") && e.code === "Space") { e.preventDefault(); ans(true); } };
  show();
  countdown(90, $("#et"), () => { document.onkeydown = null; track("eclair", "Révision éclair", true); $("#ee").innerHTML = `<b>${ok} mots en 90 s</b> (${i - ok} à revoir, renvoyés dans vos cartes). <button class="b s" onclick="openEclair()">Rejouer</button>`; });
};

// ---------- speaking: memorised sentences + 3/2/1½ (Nation 4.1, 4.3, 6.2) ----------
// topic of the day = today's Communication lesson (its first vocabulary unit gives the speaking prompt);
// before week 1, or every other day, a prepared talk about Bing's own life (Nation 4.3)
function weekTopic() {
  const T = dstr(), c = T < cal().w1 ? null : COMM.find(x => x.n === lessonOfDay());
  const g = PLAN.filter(p => p.type === "lesson" && isReached(p.id)).pop();
  const gram = g ? LESSONS.find(l => l.id === g.target) : LESSONS[0];
  if (!c) return { n: 0, title: "Kit de survie", prompt: PROMPTS[0], gram };
  const perso = PERSO[dayIndex() % PERSO.length], n = c.vocabUnits[0] || 0;
  return dayIndex() % 2 ? { n, title: c.title, prompt: PROMPTS[n] || PROMPTS[0], gram } : { n: "p" + (dayIndex() % PERSO.length), title: "Ma vie", prompt: perso, gram };
}
window.openParler = (mode) => {
  setView("today", mode === "fluency" ? "fluency" : "output");
  const w = weekTopic(), [task, frames] = w.prompt;
  view.innerHTML = back + `<div class="card"><span class="tag">Thème : ${esc(w.title)}</span><h2>🗣️ ${mode === "fluency" ? "Parler 3 / 2 / 1½" : "Parler : préparer et mémoriser"}</h2>
   <p><b>${esc(task)}</b></p>
   <ol>${frames.map(f => `<li>${spk(f)} ${esc(f)}</li>`).join("")}</ol>
   ${mode === "fluency" ? `<p class="mut">Même sujet, trois fois, de plus en plus vite : 3 min, puis 2 min, puis 1 min 30. On ne s'arrête pas sur les erreurs — on vise la fluidité.</p>
     <p class="row"><span class="tag" id="pt">3:00</span><button class="b" id="p1">▶ Tour 1 (3:00)</button><button class="b s" id="p2">Tour 2 (2:00)</button><button class="b s" id="p3">Tour 3 (1:30)</button></p>`
    : `<p class="mut">1) Complétez chaque phrase pour VOUS, à voix haute. 2) Écrivez votre petit texte ci-dessous. 3) Apprenez-le par cœur : cachez-le et redites-le. Les phrases mémorisées sont la façon la plus rapide de commencer à parler.</p>
     <textarea id="pm" placeholder="Mon petit texte…">${esc((S.talkText || {})[w.n] || "")}</textarea>
     <p class="row"><button class="b s" id="ps">💾 Enregistrer le texte</button><button class="b s" id="ph">🙈 Cacher le texte</button><button class="b s" onclick="speak($('#pm').value)">🔊 Lire mon texte</button></p>`}
   <p>${recWidget("prec")}</p>
   <p class="mut">Pour aller plus loin : faites corriger votre texte par un francophone, un professeur ou Claude, puis réenregistrez-vous.</p>
   <p class="row"><button class="b ok" onclick="finishOut('${mode === "fluency" ? "talk432" : "talk"}')">✓ Terminé</button></p></div>`;
  if (mode === "fluency") [[1, 180], [2, 120], [3, 90]].forEach(([k, s]) => $("#p" + k).onclick = () => countdown(s, $("#pt"), () => { $("#pt").textContent = "⏰ Stop !"; }));
  else {
    $("#ps").onclick = () => { (S.talkText = S.talkText || {})[w.n] = $("#pm").value; save(); $("#ps").textContent = "✓ Enregistré"; };
    $("#ph").onclick = () => { const t = $("#pm"); t.style.filter = t.style.filter ? "" : "blur(6px)"; };
  }
};
window.finishOut = kind => { (S.talks = S.talks || []).push({ t: Date.now(), kind }); save(); track(kind, kind === "talk" ? "Parler" : "Parler 3/2/1½", true); go("today"); };

// ---------- writing: careful writing (output) + 10-minute writing (fluency) ----------
window.openEcrire = (mode) => {
  setView("today", mode === "fluency" ? "fluency" : "output");
  const w = weekTopic(), wc = s => (s.match(/\p{L}[\p{L}'’-]*/gu) || []).length;
  const prev = (S.writing || []).filter(x => x.mode === mode).slice(-5).reverse();
  view.innerHTML = back + `<div class="card"><span class="tag">Thème : ${esc(w.title)}</span><h2>✍️ ${mode === "fluency" ? "Écriture rapide — 10 minutes" : "Écrire avec soin"}</h2>
   ${mode === "fluency" ? `<p class="mut">Sujet facile, déjà connu. Écrivez sans vous arrêter, sans dictionnaire, sans corriger. On compte les mots : l'objectif est d'en écrire un peu plus à chaque fois.</p>
      <p><b>${esc(w.prompt[0])}</b></p><p class="row"><span class="tag" id="wt">10:00</span><button class="b" id="ws">▶ Commencer</button><button class="b s" id="ws5">5 min</button></p>`
    : `<p><b>${esc(w.prompt[0])}</b></p><p>Écrivez 5 à 8 phrases. Utilisez au moins 2 fois : <mark>${esc(w.gram.title)}</mark> (unité ${w.gram.n}).</p>
      <p class="mut">Prenez votre temps, vérifiez accords, genres et terminaisons. Puis faites corriger (francophone, professeur ou Claude) et <b>réécrivez</b> le texte corrigé de mémoire.</p>`}
   <textarea id="wx" style="min-height:200px" placeholder="Écrivez ici…"></textarea>
   <p class="row"><span class="mut" id="wn">0 mot</span><button class="b ok" id="wv">💾 Enregistrer</button></p></div>
   ${prev.length ? `<div class="card"><h3>Mes textes précédents</h3>${prev.map(x => `<p><span class="mut">${new Date(x.t).toLocaleDateString()} · ${x.words} mots</span><br>${esc(x.text).replace(/\n/g, "<br>")}</p>`).join("")}</div>` : ""}`;
  const t = $("#wx"); t.oninput = () => $("#wn").textContent = wc(t.value) + " mots";
  const saveIt = () => { if (!t.value.trim()) return; (S.writing = S.writing || []).push({ t: Date.now(), mode, text: t.value, words: wc(t.value), topic: w.n }); save(); track(mode === "fluency" ? "write10" : "write", "Écriture", true); $("#wv").textContent = "✓ Enregistré"; };
  $("#wv").onclick = saveIt;
  if (mode === "fluency") {
    const go2 = s => { t.disabled = false; t.focus(); countdown(s, $("#wt"), () => { t.disabled = true; $("#wt").textContent = "⏰ " + wc(t.value) + " mots"; saveIt(); }); };
    $("#ws").onclick = () => go2(600); $("#ws5").onclick = () => go2(300);
  }
};

// ---------- pronunciation (Français interactif recordings) ----------
window.openPho = (n, planId) => {
  setView("today", "input");
  const p = FI_PHO[n - 1]; track("pho", "Prononciation " + n);
  view.innerHTML = back + `<div class="card"><span class="tag">Prononciation ${n}/13</span><span class="tag">Français interactif</span><h2>${esc(p.title)}</h2>
   <p class="mut">Écoutez, imitez à voix haute (« shadowing »), enregistrez-vous et comparez. Les sons difficiles pour un sinophone : /y/ ≠ /u/ (tu ≠ tout), le /R/, les voyelles nasales, le e muet, la liaison.</p>
   <p style="white-space:pre-line">${esc(p.intro.split("\n").slice(1).join("\n"))}</p></div>` +
    p.items.map((it, k) => `<div class="card"><audio controls preload="none" src="${it.u}" style="width:100%"></audio>
     <p style="white-space:pre-line">${esc(it.t)}</p><p>${recWidget("ph" + k)}</p></div>`).join("") +
    `<p class="row">${planId ? `<button class="b ok" onclick="toggleTodo('${planId}',true);go('today')">✓ Leçon terminée</button>` : ""}<a target="_blank" rel="noopener" href="https://www.laits.utexas.edu/fi/html/pho/${String(n).padStart(2, "0")}.html">Page originale</a></p>`;
};

// ---------- repeated listening at rising speed (Nation 6.1) ----------
window.openReecoute = () => {
  setView("today", "fluency");
  const done = PLAN.filter(p => p.type === "listen" && S.todo[p.id] && S.todo[p.id].done).map(p => p.target);
  const i = done.length ? done[Math.random() * done.length | 0] : 0, x = FI_LISTEN[i];
  view.innerHTML = back + `<div class="card"><h2>Réécoute accélérée ⚡</h2><p class="mut">Un enregistrement déjà travaillé, trois fois, de plus en plus vite. Le matériel est connu : on entraîne la vitesse de compréhension.</p>
   <p><b>${esc(x.t)}</b> <span class="mut">(FI ch. ${String(x.ch).padStart(2, "0")})</span></p><audio id="ra" controls preload="none" src="${x.u}" style="width:100%"></audio>
   <p class="row">${[0.9, 1, 1.15, 1.3].map(r => `<button class="b s" onclick="const a=$('#ra');a.playbackRate=${r};a.currentTime=0;a.play()">×${r}</button>`).join("")}</p>
   <p class="row"><button class="b ok" onclick="track('reecoute','Réécoute',true);go('today')">✓ Terminé</button></p></div>`;
};

// ---------- the guided daily session ----------
function nextPlanItem(types) { return PLAN.filter(p => types.includes(p.type) && !isDone(p.id)).sort((a, b) => (a.date || "9") < (b.date || "9") ? -1 : 1)[0]; }
const goBtn = (p, cls = "b s") => p ? `<button class="${cls}" onclick="doPlan('${p.id}')">${esc(p.title.length > 60 ? p.title.slice(0, 58) + "…" : p.title)}</button>` : "";
// One clear action per step; alternatives and the reason are folded away.
const FLU = { "openGenre()": "Genre éclair : le ou la ? (60 s)", "openNombres()": "Nombres à l'oreille", "openEclair()": "Révision éclair des mots connus (90 s)", "openParler('fluency')": "Parler 3 / 2 / 1½ min", "openEcrire('fluency')": "Écriture rapide 10 min", "openReecoute()": "Réécoute accélérée" };
function dailySession() {
  const d = dstr(), M = minutesPerDay(), T = Math.round(M / 4), di = dayIndex();
  const due = dueIds().length, nq = Math.min(newQuota(), newInPlanOrder().length);
  const obj = S.settings.objective || "parler", wt = weekTopic();
  const hasVerbs = conjPairs().length > 0;
  const drill = hasVerbs && di % 2 === 0 ? ["openConj()", "🔤 Conjugaison (12)"] : ["openDictee()", "✏️ Dictée (5 phrases)"];
  const lesson = nextPlanItem(["lesson", "vocab", "bilan"]), listen = nextPlanItem(["listen"]), pho = nextPlanItem(["pho"]);
  const speakDay = obj === "ecrit" ? di % 3 === 0 : di % 3 !== 2, comm = nextPlanItem(["comm", "cbilan"]);
  const flu = [["openGenre()", nounPool().length >= 8], ["openNombres()", true], ["openEclair()", ALL.filter(id => card(id) && card(id).reps >= 2).length >= 10],
    ["openParler('fluency')", true], ["openEcrire('fluency')", true], ["openReecoute()", PLAN.some(p => p.type === "listen" && S.todo[p.id] && S.todo[p.id].done)]].filter(x => x[1]).map(x => x[0]);
  const f = flu[di % flu.length];
  const btn = (on, label, main) => `<button class="${main ? "b" : "b s"}" onclick="${on}" ${main ? 'style="font-size:17px;padding:10px 18px"' : ""}>${label}</button>`;
  const planBtn = p => p ? btn(`doPlan('${p.id}')`, esc(p.title.length > 48 ? p.title.slice(0, 46) + "…" : p.title)) : "";
  // listening: a player right on the page (pronunciation lesson first in the early weeks, then FI listening)
  const p0 = pho && FI_PHO[pho.target - 1].items[0];
  const rec = pho ? { u: p0.u, t: `Prononciation ${pho.target} : ${FI_PHO[pho.target - 1].title}`, words: p0.t.split("\n").slice(0, 6).join(" · "), open: `doPlan('${pho.id}')`, more: "Ouvrir la leçon complète" }
    : listen ? { u: FI_LISTEN[listen.target].u, t: listen.title, words: "", open: `doPlan('${listen.id}')`, more: "Ouvrir l'écoute" } : null;
  const step = (n, k, title, main, others) => { const m = strandMin(d, k), ok = m >= T;
    return `<div class="todo" style="display:block;padding:12px 0">
      <div class="row" style="justify-content:space-between"><b style="font-size:17px">${ok ? "✅" : n + "."} ${title}</b><span class="mut">${m} / ${T} min</span></div>
      <div class="bar" style="margin:6px 0 10px"><i style="width:${Math.min(100, m / T * 100)}%"></i></div>
      <div>${main}</div>
      <details style="margin-top:8px"><summary class="mut" style="cursor:pointer">Autres choix · pourquoi cette étape</summary>
        <p class="mut" style="margin:6px 0">${WHY[k]}</p><div class="row">${others}</div></details></div>`; };
  return `<div class="card"><h2>Séance du jour · ${M} min</h2>
   <p class="mut">Faites les 4 étapes dans l'ordre, environ ${T} min chacune. Cliquez sur le grand bouton ; le temps est compté automatiquement et l'étape se coche toute seule.</p>
   ${step(1, "study", "Étude : mots et grammaire",
      due + nq ? btn("startReview('due')", `▶ Cartes du jour : ${due} à revoir + ${nq} nouvelles`, true) : lesson ? btn(`doPlan('${lesson.id}')`, "▶ Leçon suivante : " + esc(lesson.title.slice(0, 40)), true) : btn(drill[0], drill[1], true),
      btn(drill[0], drill[1]) + planBtn(lesson))}
   ${step(2, "input", "Écoute : enregistrements natifs",
      rec ? `<p style="margin:0 0 6px"><b>${esc(rec.t)}</b></p>${rec.words ? `<p class="mut" style="margin:0 0 6px">Dans l'enregistrement : ${esc(rec.words)}</p>` : ""}<audio controls preload="none" src="${rec.u}" style="width:100%" onplay="curStrand='input'" onpause="curStrand=null"></audio>
        <p class="row" style="margin-top:8px">${btn(rec.open, "▶ " + rec.more, true)}</p>` : btn(`openUnit(${wt.n})`, "▶ Lire en écoutant : " + esc(wt.title), true),
      (listen && pho ? planBtn(listen) : "") + (wt.n ? btn(`openUnit(${wt.n})`, "📖🎧 Lire en écoutant : vocabulaire de la semaine") : btn("openSurvival()", "📖 Kit de survie")) + btn("window.open(TV5,'_blank');logMinutes('input',10)", "TV5MONDE (+10 min)"))}
   ${step(3, "output", "Production : parler ou écrire",
      comm && speakDay ? btn(`doPlan('${comm.id}')`, "🎭 Jeu de rôle · " + esc(comm.title), true) : speakDay ? btn("openParler('output')", "🗣️ Parler : mon petit texte sur le thème de la semaine", true) : btn("openEcrire('output')", "✍️ Écrire : thème et grammaire de la semaine", true),
      (comm && !speakDay ? btn(`doPlan('${comm.id}')`, "🎭 " + esc(comm.title)) : "") + btn("openParler('output')", "🗣️ Mon petit texte (thème de la semaine)") + btn("openEcrire('output')", "✍️ Écrire"))}
   ${step(4, "fluency", "Fluidité : aller plus vite",
      btn(f, "⚡ " + FLU[f], true),
      flu.filter(x => x !== f).map(x => btn(x, FLU[x])).join(""))}
  </div>`;
}
window.dailySession = dailySession;

// ---------- weekly goals (Nation principle 4: short-term goals, daily small steps) ----------
function weekStart() { const n = new Date(); n.setHours(0, 0, 0, 0); n.setDate(n.getDate() - ((n.getDay() + 6) % 7)); return n.getTime(); }
function weeklyGoals() {
  const ws = weekStart(), M = minutesPerDay();
  const days = Array.from({ length: 7 }, (_, i) => dstr(ws + i * DAY + 3e6));
  const newW = Object.values(S.cards).filter(c => c.first >= ws).length, goalW = S.settings.newPerDay * 7;
  const st = STRANDS.map(([k, l]) => [l, days.reduce((a, d) => a + strandMin(d, k), 0)]), tgt = Math.round(M * 7 / 4);
  const low = st.slice().sort((a, b) => a[1] - b[1])[0];
  return `<div class="card"><h3>Cette semaine</h3>
   <div class="row" style="gap:4px">${["L", "M", "M", "J", "V", "S", "D"].map((x, i) => { const s = (S.daily[days[i]] || {}).secs || 0; return `<span class="tag" style="${s > 300 ? "background:#4fbf7d;color:#fff" : ""}" title="${days[i]}">${x}${s > 300 ? " ✓" : ""}</span>`; }).join("")}</div>
   <p>Nouveaux mots / structures : <b>${newW}</b> / ${goalW}<div class="bar"><i style="width:${Math.min(100, newW / goalW * 100)}%"></i></div></p>
   ${st.map(([l, m]) => `<p style="margin:4px 0">${l} : ${m} / ${tgt} min<div class="bar"><i style="width:${Math.min(100, m / tgt * 100)}%"></i></div></p>`).join("")}
   <p class="mut">${low[1] < tgt ? `Point à renforcer cette semaine : <b>${low[0]}</b>.` : "Semaine équilibrée — bravo !"}</p></div>`;
}
window.weeklyGoals = weeklyGoals;

// ---------- Méthode page ----------
function renderMethod() {
  setView("method", null);
  const s = S.settings, C = cal(), hours = Math.round(minutesPerDay() * studyDays(C.start, C.a2End).length / 60);
  view.innerHTML = `<div class="card"><h2>Ma méthode pour le A1</h2>
   <p>Le contenu suit vos trois livres (Grammaire progressive · Vocabulaire progressif · Communication progressive), entremêlés dans leur ordre ; la <b>façon d'apprendre</b> suit les principes de Paul Nation, adaptés aux difficultés propres au français.</p>
   <div class="row"><label>Objectif : <select id="mo">${[["tcf", "TCF Canada + vie quotidienne"], ["parler", "Parler (voyage, vie, famille)"], ["ecrit", "Examen / écrit (DELF)"], ["tout", "Les deux"]].map(([k, l]) => `<option value="${k}" ${(s.objective || "tcf") === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
   <label>Minutes par jour : <select id="mm">${[20, 30, 40, 60, 90, 120, 160].map(m => `<option ${minutesPerDay() === m ? "selected" : ""}>${m}</option>`).join("")}</select></label>
   <label>Nouvelles cartes / jour : <select id="mn">${[5, 8, 10, 15, 20, 30].map(m => `<option ${s.newPerDay === m ? "selected" : ""}>${m}</option>`).join("")}</select></label></div>
   <div class="row" style="margin-top:8px"><label>Fin du A1 : <input type="date" id="ma1" value="${s.a1End || "2026-11-29"}"></label><label>Fin du A2 : <input type="date" id="ma2" value="${s.a2End || "2026-12-27"}"></label>
    ${s.shift ? `<span class="mut">(+ ${s.shift} jours de décalage)</span>` : ""}<button class="b s" onclick="postponeWeek()">Décaler tout d'une semaine</button></div>
   <p class="mut">Du 28 octobre à la fin du A2 : ${studyDays(C.start, C.a2End).length} jours d'étude (le dimanche = révision seulement) × ${minutesPerDay()} min ≈ <b>${hours} heures</b>. Le volume de chaque jour = ce qui reste ÷ les jours qui restent ; il est recalculé chaque matin.</p></div>

  <div class="card"><h3>1. Quatre parts égales chaque jour</h3><table>
   <tr><th>Pilier</th><th>Pourquoi</th><th>Dans l'application</th></tr>
   <tr><td>📘 Étude ciblée</td><td>Apprendre délibérément mots, grammaire, sons</td><td>Cartes (répétition espacée), unités de grammaire, conjugaison, dictée</td></tr>
   <tr><td>🎧 Écoute & lecture</td><td>Beaucoup d'input compréhensible</td><td>Listes FI lues par un natif (lire en écoutant), écoutes FI, prononciation, TV5MONDE</td></tr>
   <tr><td>🗣️ Production</td><td>Parler/écrire révèle ce qui manque</td><td>Les 40 actes de parole de Communication progressive : expressions, dialogue modèle, jeu de rôle répété 3 fois ; petit texte à mémoriser ; écriture soignée</td></tr>
   <tr><td>⚡ Fluidité</td><td>Utiliser vite ce qu'on sait déjà</td><td>Genre éclair, nombres à l'oreille, révision éclair, 3/2/1½, écriture 10 min, réécoute accélérée</td></tr></table>
   <p class="mut">La grammaire n'est qu'une partie du pilier « étude » : on apprend aussi la grammaire en écoutant, en lisant et en parlant.</p></div>

  <div class="card"><h3>2. Ce qui est propre au français (et difficile pour un sinophone)</h3><ul>
   <li><b>Les sons et l'orthographe ne correspondent pas un à un</b> : finales muettes (-s, -t, -ent), e muet, liaison, voyelles nasales, /y/ ≠ /u/, le /R/. → 13 leçons de prononciation FI au début du plan, et la <b>dictée</b>.</li>
   <li><b>Chaque nom a un genre</b> (le/la), qu'il faut apprendre avec le mot. → Les mots sont colorés <span class="g-m">masculin</span> / <span class="g-f">féminin</span>, et le jeu « Genre éclair ».</li>
   <li><b>Les verbes se conjuguent</b> (6 personnes × plusieurs temps) — c'est le cœur de la Grammaire progressive. → Entraîneur de conjugaison adaptatif, ouvert unité par unité.</li>
   <li><b>Accords</b> (adjectifs, participes) et <b>élision</b> (j', l', n') → exercices de grammaire tapés, la dictée vérifie l'orthographe exacte.</li>
   <li><b>Oral ≠ écrit</b> (« je sais pas », « on » pour « nous ») → écoutes de vrais locuteurs (FI, TV5MONDE).</li>
   <li><b>Beaucoup de mots ressemblent à l'anglais</b> (université, possible, restaurant) : profitez-en, mais attention aux faux amis.</li></ul></div>

  <div class="card"><h3>3. Règles d'or pour mémoriser</h3><ul>
   <li><b>Se rappeler, pas relire</b> : sur chaque carte, cherchez la réponse <i>avant</i> de la retourner. Chaque rappel réussi renforce la mémoire ; relire ne le fait pas.</li>
   <li><b>Espacer</b> : quelques minutes, puis 1 jour, 3 jours, une semaine, un mois… L'application calcule tout. Faites vos cartes <b>chaque jour</b>, même 5 minutes.</li>
   <li><b>Dire à voix haute</b> chaque mot et chaque phrase.</li>
   <li><b>Ne pas apprendre ensemble des mots trop proches</b> (jours, couleurs, contraires) : ils se mélangent. L'application mélange les nouvelles cartes de plusieurs thèmes (max. 3 par liste et par jour).</li>
   <li><b>Pour un mot qui résiste</b> : la technique du mot-clé — un mot chinois ou anglais au son proche + une image mentale. Une case « astuce mémoire » apparaît sur les cartes ratées.</li>
   <li><b>Des phrases entières</b> plutôt que des mots isolés quand c'est possible (kit de survie, petits textes mémorisés).</li>
   <li><b>Commencer par le kit de survie</b> (~100 phrases) : de quoi se débrouiller dès les premières semaines.</li>
   <li><b>Des objectifs courts</b> : la semaine en cours, pas « parler français ». Cochez, regardez vos barres avancer.</li></ul>
   <p class="mut">Source des principes : Paul Nation, <i>What do you need to know to learn a foreign language?</i> (Victoria University of Wellington, 2014).</p></div>`;
  $("#mo").onchange = e => { S.settings.objective = e.target.value; save(); };
  $("#mm").onchange = e => { S.settings.minutes = +e.target.value; save(); renderMethod(); };
  $("#mn").onchange = e => { S.settings.newPerDay = +e.target.value; save(); };
  $("#ma1").onchange = e => { S.settings.a1End = e.target.value; save(); schedule(); };
  $("#ma2").onchange = e => { S.settings.a2End = e.target.value; save(); schedule(); };
}
window.renderMethod = renderMethod;

// ---------- Communication progressive: units, dialogues, role plays ----------
function speakDialogue(lines) { // two different French voices: the first role that speaks, and the others
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel(); player.pause();
  const vs = frVoices().filter(v => !/grandma|grandpa|rocko|eddy|flo|sandy|shelley|reed/i.test(v.name)), a = bestVoice(), b = vs.find(v => v !== a) || a;
  const first = lines.length ? lines[0].who : "";
  lines.forEach(({ who, text }) => { const u = new SpeechSynthesisUtterance(text); u.lang = "fr-FR"; u.rate = S.settings.rate || 0.85; const v = who === first ? a : b; if (v) u.voice = v; speechSynthesis.speak(u); });
}
window.playDlg = (n, k) => speakDialogue(COMM.find(c => c.n === n).dlgs[k || 0].lines);
const commDone = n => S.todo["comm:" + n] && S.todo["comm:" + n].done;
function renderComm() {
  view.innerHTML = bookCard("comm") + `<div class="card"><h2>Communication — 40 actes de parole</h2><p class="mut">Ordre de Communication progressive du français (niveau débutant), 6 parties. Chaque situation : le dialogue du livre et son enregistrement, les « Manières de dire » (en cartes), l'activité du livre. Le contenu vient de votre saisie du livre. Les « Révisions » de fin de partie sont un ajout de l'application.</p></div>` +
    COMM_PARTS.map(([part, a, b], i) => `<div class="card"><h3>${esc(part)}</h3>${COMM.filter(c => c.n >= a && c.n <= b).map(c =>
      `<div class="todo"><div style="flex:1">${commDone(c.n) ? "✅" : ""} <b>${c.n}.</b> <a href="#" onclick="openComm(${c.n});return false">${esc(c.title)}</a> ${c.level === "A2" ? '<span class="tag">A2</span>' : ""}${aSaisir("comm", c.n)} <span class="mut">p. ${c.bookPages[0]}–${c.bookPages[1]} · ${esc(c.sit)}</span></div></div>`).join("")}
      <div class="todo"><div style="flex:1">📝 <a href="#" onclick="openCommBilan(${i});return false"><b>Révision de la partie ${i + 1}</b></a> <span class="mut">unités ${a}–${b}</span></div></div></div>`).join("");
}
window.renderComm = renderComm;
window.openCommBilan = (i, planId) => {
  setView("comm", "output");
  const [part, a, b] = COMM_PARTS[i], units = COMM.filter(c => c.n >= a && c.n <= b), pid = planId || "cbilan:" + i;
  const inPart = id => { const u = String(ITEMS[id].unit); return /^c\d+$/.test(u) && +u.slice(1) >= a && +u.slice(1) <= b; };
  const ids = shuffle(ALL.filter(inPart)).slice(0, 25);
  view.innerHTML = `<p><a href="#" onclick="go('comm');return false">← Communication</a></p><div class="card"><h2>Révision de la partie ${i + 1} · ${esc(part)}</h2>
   <p>1) Révisez 25 expressions de la partie, mélangées. 2) Rejouez 3 jeux de rôle tirés au hasard, sans regarder les dialogues.</p>
   <p><button class="b" onclick="startReview('ids:${ids.join(",")}')">▶ Réviser 25 expressions</button></p>
   <h3>Jeux de rôle</h3><ol>${shuffle(units.slice()).slice(0, 3).map(c => `<li><b>${esc(c.title)}</b> — ${esc(c.task || "Rejouez le dialogue du livre")} <a href="#" onclick="openComm(${c.n});return false">(revoir l'unité)</a></li>`).join("")}</ol>
   <p>${recWidget("brec")}</p>
   <p><button class="b ok" onclick="toggleTodo('${pid}',true);go('today')">✓ Révision terminée</button></p></div>`;
};

