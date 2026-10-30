"use strict";
// ───────────── shared helpers ─────────────
const sentenceCount = t => (t.split(/[.!?…]+/).filter(s => s.trim().length > 1)).length;
function correctionPrompt(text, n) {
  return `Please correct my French writing. I am a Mandarin speaker, fluent in English, at A1${n ? ` (Assimil lesson ${n})` : ""}.\n1) Give the corrected text.\n2) List each mistake with a one-line explanation in English.\n3) Suggest 2 small improvements using grammar I already know.\n\nMy text:\n---\n${text}\n---`;
}
function saveWriting({ lesson = 0, kind = "daily", text, secs = 0 }) {
  const e = { id: Date.now(), date: ymd(), lesson, kind, text: text.trim(), words: wordCount(text), secs, corrected: "", fixes: 0 };
  S.writing.push(e); dayRec().words += e.words; save(); return e;
}
function copyText(t) { navigator.clipboard.writeText(t).then(() => toast("Copied — paste it to Claude"), () => { const ta = h("textarea", { value: t, rows: 8 }); modal("Copy this", ta); }); }

function dialogueView(Lx, { fr = true, en = false, lit = false, cover = false, speakable = true } = {}) {
  return h("div.dlg", Lx.dialogue.map(d => h("div.ln", { dataset: { i: d.i } },
    h("span.n", d.i),
    h("div", fr ? h("div.fr", d.dash ? h("span.dash", "–") : null, d.fr) : null,
      en ? h("div" + (cover ? ".cover" : ""), { onclick: e => cover && e.currentTarget.classList.toggle("open") }, d.en) : null,
      lit && d.lit ? h("div.lit", "(" + d.lit + ")") : null),
    speakable ? sayBtn(d.fr) : h("span"))));
}
function notesView(Lx) {
  if (!Lx.notes || !Lx.notes.length) return h("p.muted", "No notes for this lesson.");
  return h("div", Lx.notes.map(n => h("div.note", n.title ? h("b.ref", n.title) : (n.ref && n.ref !== "rev" ? h("b.ref", n.ref === "pron" ? "Pronunciation" : "Note " + n.ref) : null), n.text)));
}

// ───────────── retell component (also used for the second wave) ─────────────
function retellView(Lx, { max = 99, track = true } = {}) {
  const lines = Lx.dialogue.slice(0, max), wrap = h("div"), res = {};
  let i = 0;
  function show() {
    if (i >= lines.length) {
      const miss = lines.filter(d => res[d.i] === 0);
      clear(wrap).append(h("div.card.tint", h("h3", "Retell finished"), h("p", `${lines.filter(d => res[d.i] === 2).length} solid · ${lines.filter(d => res[d.i] === 1).length} almost · ${miss.length} missed`),
        miss.length ? h("div", h("p.small.muted", "Lines to look at again tomorrow:"), miss.map(d => h("div.fr", d.fr))) : h("p", "🎉 All lines came back.")));
      return;
    }
    const d = lines[i];
    clear(wrap).append(h("div.row.sp", h("span.pill", `Line ${i + 1} of ${lines.length}`), h("span.muted.small", "Say it aloud first")),
      h("div.card.fc", h("div.en", { style: { fontSize: "1.5rem", color: "var(--text)" } }, d.en), h("div#ans"), h("button.btn.primary", { id: "rv", onclick: reveal }, "Show the French")));
    function reveal() {
      $("#rv", wrap).remove();
      $("#ans", wrap).append(h("div.fr", { style: { fontSize: "1.6rem" } }, d.dash ? "– " : "", d.fr), h("div.row", { style: { justifyContent: "center" } }, sayBtn(d.fr),
        h("button.btn", { onclick: () => rateIt(0) }, "✗ Missed"), h("button.btn", { onclick: () => rateIt(1) }, "~ Almost"), h("button.btn.good", { onclick: () => rateIt(2) }, "✓ Got it")));
    }
    function rateIt(v) { res[d.i] = v; if (track && S.lessons[Lx.n]) { (S.lessons[Lx.n].retell = S.lessons[Lx.n].retell || {})[d.i] = v; save(); } i++; show(); }
  }
  show(); return wrap;
}

// ───────────── step renderers: (ctx) → element | {el, destroy} ─────────────
const STEPS = {};
const playsNote = (api, need) => { const s = h("span.pill", `Listened 0 / ${need}×`); return s; };

STEPS["listen-closed"] = ctx => {
  const need = 2, pill = h("span.pill", `Listened 0 / ${need}×`);
  const p = audioPlayer(lessonAudio(ctx.n), { speed: 1, onPlay: c => { pill.textContent = `Listened ${c} / ${need}×`; if (c >= need) { beep(); toast("Two listens done ✓"); } } });
  return { el: h("div.stack", h("ol.instr", h("li", "Close the book. Don’t read anything."), h("li", "Listen to the whole lesson twice. Catch the words you already know."), h("li", "Don’t pause to look things up: this is for the ear.")), p.el, pill), destroy: () => p.stop() };
};
STEPS["listen-en"] = ctx => {
  const p = audioPlayer(lessonAudio(ctx.n));
  return { el: h("div.stack", h("p.instr", "Listen again while you read the ", h("b", "English"), " on screen. Match meaning to sound."), p.el, dialogueView(ctx.L, { fr: false, en: true, lit: true, speakable: false })), destroy: () => p.stop() };
};
STEPS["listen-fr"] = ctx => {
  const p = audioPlayer(lessonAudio(ctx.n));
  return { el: h("div.stack", h("p.instr", "Now listen with the ", h("b", "French text"), ". Follow the words with your eyes."), p.el, dialogueView(ctx.L, { fr: true, en: true, cover: true })), destroy: () => p.stop() };
};
STEPS["fi-context"] = ctx => {
  const f = fiForDay(ctx.n), kids = []; if (ctx.step.all) f.items = fiItems(f.ch);
  const players = [];
  const w = fiWeb(f.ch), vids = daySlice(fiVideos(w), (ctx.n - 1) % 7, ctx.step.all);
  kids.push(h("p.instr", `Week ${weekOf(ctx.n)} uses Français interactif ${f.week.fiName ? "chapitre " + f.week.fiName : "chapitre " + f.ch}.`),
    h("div.card", h("h3", "En contexte video" + (vids.length > 1 ? "s" : "")), h("p.small.muted", "Watch each one once without stopping. Then again with French subtitles (CC) if you like."), videoPicker(vids),
      w.pdf["videos-voc"] ? h("p.small.muted", "Transcripts: ", h("a", { href: w.pdf["videos-voc"], target: "_blank", rel: "noopener" }, "vocabulaire en contexte (PDF) ↗")) : null));
  if (!f.items.length) kids.push(h("p.muted.small", "No word lists for this day."));
  f.items.forEach(it => {
    if (it.t === "voc") {
      const v = it.ref, p = v.audio ? audioPlayer(fiAudio(v.audio)) : null; if (p) players.push(p);
      kids.push(h("div.card", h("h3", "Word list: " + v.title), p ? p.el : null,
        v.words.length ? h("table", v.words.map(w => h("tr", h("td.fr", { style: { fontSize: "1.05rem" } }, w[0]), h("td.muted", w[1]), h("td", sayBtn(w[0].replace(/\(.*?\)/g, "")), h("button.icon", { title: "Add to my cards", onclick: () => addCustomCard({ fr: w[0].replace(/\s*\(.*?\)\s*$/, ""), en: w[1], src: "fi" }) }, "☆")))) ) : null));
    } else {
      const x = it.ref, p = audioPlayer(fiAudio(x.u)); players.push(p);
      kids.push(h("div.card", h("h3", "Listening: " + x.t), h("p.small.muted", "Listen first without help. The exercise sheet is in the chapter PDF."), p.el));
    }
  });
  return { el: h("div.stack", kids), destroy: () => players.forEach(p => p.stop()) };
};
STEPS.notes = ctx => h("div.stack", h("p.instr", ctx.L.kind === "revision" ? "Read the revision notes slowly. Say the French examples aloud." : "Read the notes, matching each number to the sentence in the dialogue. Say the French examples aloud."), notesView(ctx.L), ctx.L.pdfPage ? h("p.small.muted", "Compare with the book page: ", h("a", { href: `assimil_french.pdf#page=${ctx.L.pdfPage}`, target: "_blank" }, "PDF p." + ctx.L.pdfPage)) : null);
STEPS.shadow = ctx => {
  const lia = ctx.n <= 28 ? h("div.note", h("b.ref", "Liaison"), "In lessons 1–28 the book marks liaisons with ‿ in the text. Practise them on purpose now; after lesson 28 the marks disappear and you must decide yourself. Compare with ", h("a", { href: `assimil_french.pdf#page=${ctx.L.pdfPage}`, target: "_blank" }, "the book page"), ".") : null;
  const p = audioPlayer(lessonAudio(ctx.n), { pause: true, gaps: ctx.L.gaps, speed: 1 });
  const space = e => { if (e.code === "Space" && !e.target.matches("input,textarea,button,select")) { e.preventDefault(); p.audio.paused ? p.audio.play() : p.audio.pause(); } };
  document.addEventListener("keydown", space);
  return { el: h("div.stack", h("ol.instr", h("li", "Press play. The audio stops after each sentence."), h("li", "Say the sentence out loud, copying rhythm and melody."), h("li", "Not right? ‘Repeat this sentence’. Right? ‘Next’.")),
    lia, p.gaps.length < 2 ? h("p.small.muted", "(No clear pauses were detected in this recording; it plays normally.)") : null, p.el, dialogueView(ctx.L, { fr: true, en: false })), destroy: () => { p.stop(); document.removeEventListener("keydown", space); } };
};
STEPS["fi-gram"] = ctx => {
  const wk = weekInfo(weekOf(ctx.n)), w = fiWeb(wk.fi), rev = isReviewDay(ctx.n), g = daySlice(w.gram, (ctx.n - 1) % 7, rev);
  return h("div.stack", h("p.instr", "Grammar with Tex (", h("i", "la grammaire de Tex"), "), chapter ", wk.fiName || wk.fi, ". Assimil this week: ", h("b", wk.grammar), "."),
    h("p.small.muted", "Read the page and do its short exercises. Don’t aim to master it today; meet it. Then say three example sentences aloud."),
    gramPicker(g.length ? g : w.gram.slice(0, 1)),
    rev && w.quiz ? h("div.card", h("h3", "Testez-vous! Chapitre " + String(wk.fi).padStart(2, "0")), h("p.small.muted", "The chapter’s self-check quiz. Do the topics you met this week."), framePane(w.quiz, "Testez-vous", { tall: true })) : null);
};
STEPS.cards = ctx => {
  const spec = { n: Math.min(ctx.n, NL), noNew: !!ctx.step.backlog, newLimit: ctx.step.lite ? 5 : undefined, maxReviews: ctx.step.backlog ? 200 : 60 };
  const r = cardRunner(spec, { onFinish: () => { beep(); ctx.ready(); } });
  return { el: h("div", r.el), destroy: () => r.destroy() };
};
STEPS.exercises = ctx => {
  const L = ctx.L, e1 = (L.exercise1 && L.exercise1.items) || [], e2 = (L.exercise2 && L.exercise2.items) || [];
  const kids = [h("p.instr", "Close the book first: do Exercise 2 as retrieval practice, then check. Exercise 1: translate, then check. (Accents count; I’ll tell you when only the accent is off.)")];
  if (e1.length) kids.push(h("div.card", h("h3", `Exercise 1 — ${L.exercise1.dir === "en-fr" ? "translate into French" : "translate into English"}`),
    e1.map(it => { const a = h("div.muted", { style: { display: "none" } }, it.a); return h("div.ex-item", h("div" + (L.exercise1.dir === "en-fr" ? "" : ".fr"), it.q, L.exercise1.dir === "en-fr" ? null : sayBtn(it.q)), a, h("button.btn.ghost.small", { onclick: e => { a.style.display = ""; e.currentTarget.remove(); } }, "Show answer")); })));
  if (e2.length) {
    const inputs = [];
    const card = h("div.card", h("h3", "Exercise 2 — fill in the missing words"));
    e2.forEach(it => {
      const row = h("div.ex-item", h("div.muted.small", it.cue)), line = h("div.fr");
      it.t.split(/(\{\{.+?\}\})/).forEach(part => {
        const m = /^\{\{(.+)\}\}$/.exec(part);
        if (m) { const inp = h("input.gap-in", { type: "text", autocomplete: "off", autocapitalize: "off", spellcheck: false, style: { "--w": Math.max(4, m[1].length + 1) + "ch" } }); inputs.push([inp, m[1]]); line.append(inp); } else line.append(part);
      });
      row.append(line); card.append(row);
    });
    const out = h("span.pill");
    card.append(h("div.row", { style: { marginTop: "12px" } }, h("button.btn.primary", { onclick: () => {
      let ok = 0;
      inputs.forEach(([inp, ans]) => { const v = inp.value.trim(); const exact = v.replace(/’/g, "'") === ans.replace(/’/g, "'"), loose = norm(v) === norm(ans); inp.classList.toggle("ok", loose); inp.classList.toggle("no", !loose); inp.title = loose ? (exact ? "" : "Check the accents: " + ans) : ans; if (loose) ok++; if (!loose && v) inp.title = "Answer: " + ans; });
      out.textContent = `${ok} / ${inputs.length} correct`; if (ok === inputs.length) beep();
    } }, "Check"), h("button.btn", { onclick: () => inputs.forEach(([inp, ans]) => { inp.value = ans; inp.classList.add("ok"); }) }, "Show answers"), out));
    kids.push(card);
  }
  if (!e1.length && !e2.length) kids.push(h("p.muted", "No exercises were recovered for this lesson. Use the book page."));
  return h("div.stack", kids);
};
STEPS.retell = ctx => {
  const rec = recorder("retell-" + ctx.n);
  return h("div.stack", h("ol.instr", h("li", "Book closed. For each English line, say the French aloud."), h("li", "Reveal to check; rate honestly. Missed lines come back tomorrow."), h("li", "Optional: record the whole retell to hear yourself later.")), h("div.card.flat", rec.el), retellView(ctx.L, { max: ctx.step.lite ? 3 : 99 }));
};
STEPS.write = ctx => {
  const L = ctx.L, ta = h("textarea", { rows: 8, placeholder: "Écris ici… (5–8 sentences about YOUR life: où tu habites, ta famille, ce que tu aimes…)" });
  const cnt = h("span.pill", "0 sentences · 0 words");
  const t0 = Date.now(); let saved = null;
  const ideas = (L.cards || []).filter(c => c.ex).slice(0, 4).map(c => c.ex);
  ta.addEventListener("input", () => { cnt.textContent = `${sentenceCount(ta.value)} sentences · ${wordCount(ta.value)} words`; cnt.style.background = sentenceCount(ta.value) >= 5 ? "color-mix(in srgb, var(--good) 25%, var(--surface))" : ""; });
  return h("div.stack", h("p.instr", "Use today’s patterns to write about your own life. Short and correct beats long and risky."),
    ideas.length ? h("div.card.tint", h("div.small.muted", "Patterns from today’s lesson:"), ideas.map(x => h("div.fr", { style: { fontSize: "1.05rem" } }, x))) : null,
    ta, h("div.row.sp", cnt, h("div.row", h("button.btn", { onclick: () => { if (!ta.value.trim()) return; copyText(correctionPrompt(ta.value, ctx.n)); } }, "Copy for correction"),
      h("button.btn.primary", { onclick: () => { if (!ta.value.trim()) return toast("Write something first"); if (!saved) saved = saveWriting({ lesson: ctx.n, text: ta.value, secs: (Date.now() - t0) / 1000 }); else { saved.text = ta.value.trim(); saved.words = wordCount(ta.value); save(); } toast("Saved ✓ — corrections live on the Writing page"); } }, "Save"))));
};
function secondWaveView(m, onDone) {
  const Lm = L(m), tab = h("div.tabs"), box = h("div"); let cur = "dlg";
  const ex = (Lm.exercise1 && Lm.exercise1.items || []).filter(i => i.q && i.a);
  function exView() {
    if (!ex.length) return h("p.muted", "This lesson has no Exercise 1 (revision lesson).");
    return h("div", h("p.instr", "Cover the French. Read the English of Exercise 1, then say it aloud and write it. Check afterwards."), ex.map(it => {
      const ta = h("input", { type: "text", style: { width: "100%" }, placeholder: "Écris en français…" }), res = h("div.small");
      return h("div.ex-item", h("div", it.a), ta, h("div.row", h("button.btn", { onclick: () => { const ok = norm(ta.value) === norm(it.q); res.replaceChildren(h("span", { style: { color: ok ? "var(--good)" : "var(--bad)" } }, ok ? "✓ " : "✗ "), h("span.fr", { style: { fontSize: "1.05rem" } }, it.q), " ", sayBtn(it.q)); } }, "Check")), res);
    }));
  }
  function show(t) { cur = t; $$("button", tab).forEach(b => b.classList.toggle("on", b.dataset.t === t)); clear(box).append(t === "dlg" ? retellView(Lm, { track: false }) : exView()); }
  [["dlg", "Dialogue: English → French"], ["ex1", "Exercise 1: English → French"]].forEach(([k, l]) => tab.append(h("button", { dataset: { t: k }, onclick: () => show(k) }, l)));
  show("dlg");
  return h("div.stack", h("p.instr", h("b", `Lesson ${m}: ${Lm.title}`), " — cover the French, go from English back to French, aloud and on paper."), tab, box);
}
STEPS["second-wave"] = ctx => { const m = ctx.n - 49; return L(m) ? secondWaveView(m) : h("p.muted", "No lesson to review."); };

// after lesson 100: back to lesson 51 for the second wave over the second half of the book
route(/^\/wave\/(\d+)$/, (main, mStr) => {
  const m = +mStr, Lm = L(m); if (!Lm) { main.append(h("p", "Nothing here."), h("a.btn", { href: "#/" }, "Back")); return; }
  main.append(h("div.row.sp", h("h1", "Second wave"), h("span.pill", `${m - WAVE2_START + 1} of ${NL - WAVE2_START + 1}`)), secondWaveView(m),
    h("div.row", { style: { marginTop: "16px" } }, h("button.btn.good.big", { onclick: () => { (S.wave2 = S.wave2 || { done: {} }).done[m] = ymd(); dayRec().sessions++; save(); beep(); go("/"); } }, "Done ✓"), h("a.btn", { href: `#/lesson/${m}` }, "Open the lesson")));
});
STEPS.relisten = ctx => {
  const lst = [ctx.n - 3, ctx.n - 7].filter(x => x >= 1); if (!lst.length) lst.push(ctx.n);
  let cur = lst[0]; const box = h("div"), players = [];
  function draw() {
    players.forEach(p => p.stop()); players.length = 0;
    const p = audioPlayer(lessonAudio(cur), { speed: 1.15 }); p.setSpeed(1.15); players.push(p);
    clear(box).append(h("div.row", lst.map(x => h("button.btn" + (x === cur ? ".primary" : ""), { onclick: () => { cur = x; draw(); } }, "Lesson " + x))), h("p.muted", lessonTitle(cur)), p.el);
  }
  draw();
  return { el: h("div.stack", h("p.instr", "Book closed, speed 1.1–1.25×. If it breaks down, lower the speed; the goal is to understand without translating."), box), destroy: () => players.forEach(p => p.stop()) };
};
STEPS.readaloud = ctx => {
  let m = ctx.n > 5 ? ctx.n - 5 : ctx.n; const sw = stopwatch(), box = h("div"), res = h("div.card.tint", { style: { display: "none" } });
  const sel = h("select", { onchange: () => { m = +sel.value; sw.reset(); draw(); } }, Array.from({ length: Math.min(ctx.n, NL) }, (_, i) => h("option", { value: i + 1, selected: i + 1 === m }, `${i + 1}. ${lessonTitle(i + 1)}`)));
  function draw() { const Lm = L(m); clear(box).append(h("div.card", h("div.fr", { style: { lineHeight: 1.8 } }, Lm.dialogue.map(d => h("div", (d.dash ? "– " : "") + d.fr))))); }
  sw.onStop = secs => {
    const Lm = L(m), words = Lm.dialogue.reduce((a, d) => a + wordCount(d.fr), 0), wpm = Math.round(words / (secs / 60));
    S.reads.push({ date: ymd(), lesson: m, secs: Math.round(secs), words }); save();
    const prev = S.reads.filter(r => r.lesson === m).slice(-2, -1)[0];
    clear(res).append(h("b", `${fmtClock(secs)} · ${wpm} words/min`), prev ? h("span.muted", `  (last time ${fmtClock(prev.secs)})`) : null); res.style.display = "";
  };
  draw();
  return h("div.stack", h("p.instr", "Read it aloud smoothly, as if you were speaking. Start the clock, read once through, stop. Aim to beat your last time."), h("div.row", sel), sw.el, res, box);
};
STEPS.monologue = ctx => {
  const wk = weekInfo(weekOf(ctx.n)), rounds = [180, 120, 90], done = [false, false, false];
  const keyBase = `mono-${ymd()}-`;
  const box = h("div.stack");
  const sc = SCRIPTS[{ 1: "intro30", 2: "intro60", 3: "family", 6: "shopping", 5: "postcard" }[weekOf(ctx.n)]];
  let r = 0;
  function draw() {
    const cd = countdown(rounds[r], { big: true, onEnd: () => toast("Time! Finish your sentence.") }); const rec = recorder(keyBase + r);
    clear(box).append(h("div.row.sp", h("h3", `Round ${r + 1} of 3 — ${fmtClock(rounds[r])}`), h("div.row", [0, 1, 2].map(i => h("span.pill", { style: { background: done[i] ? "var(--good)" : "", color: done[i] ? "#fff" : "" } }, i + 1)))),
      h("div.card.flat", cd.el), h("div.card.flat", rec.el),
      h("div.row", r < 2 ? h("button.btn.primary", { onclick: () => { cd.destroy(); rec.stop(); done[r] = true; r++; draw(); } }, "Next, shorter round →") : h("button.btn.good", { onclick: () => { cd.destroy(); rec.stop(); done[2] = true; toast("3 / 2 / 1½ complete 🎉"); beep(); ctx.ready(); draw(); } }, "Finished all three"),
        h("span.muted.small", "Same topic each time: say the same things faster and more fluently.")));
    ctx.cleanups.push(() => { cd.destroy(); rec.stop(); });
  }
  draw();
  return h("div.stack", h("p.instr", h("b", wk.topic), ": " + wk.mono), sc ? h("details.card.tint", h("summary", "My script / outline (" + sc.title + ")"), h("pre.fr", { style: { whiteSpace: "pre-wrap", fontSize: "1.05rem" } }, S.scripts[sc.title] || sc.text)) : null,
    h("p.small.muted", "Use a phone recorder if the browser can’t record. Don’t restart if you stumble; keep going."), box);
};
STEPS.write10 = ctx => {
  const topic = weekInfo(weekOf(ctx.n)).topic, ta = h("textarea", { rows: 10, placeholder: `10 minutes, no dictionary. Topic: ${topic}` });
  const cd = countdown(600, { onEnd: () => toast("Ten minutes are up") }), cnt = h("span.pill", "0 words");
  ta.addEventListener("input", () => cnt.textContent = wordCount(ta.value) + " words");
  const t0 = Date.now();
  return { el: h("div.stack", h("p.instr", "Free writing, ", h("b", "10 minutes"), ". Topic: ", h("b", topic), ". Don’t stop to fix errors. The word count is logged each week."), h("div.row", cd.el, cnt), ta,
    h("div.row", h("button.btn", { onclick: () => ta.value.trim() && copyText(correctionPrompt(ta.value, ctx.n)) }, "Copy for correction"), h("button.btn.primary", { onclick: () => { if (!ta.value.trim()) return; saveWriting({ lesson: ctx.n, kind: "free10", text: ta.value, secs: (Date.now() - t0) / 1000 }); toast("Saved ✓"); } }, "Save"))), destroy: () => cd.destroy() };
};
STEPS.weekly = ctx => {
  const w = weekOf(ctx.n), mon = mondayOf(ymd()), s = weekStats(mon), t = weekTargets(), wk = weekInfo(w), nx = weekInfo(w + 1);
  const rowf = (l, v, tg) => h("div", h("div.row.sp", h("span", l), h("b", `${v} / ${tg}`)), bar(v / tg));
  const mine = S.writing.filter(x => x.date >= mon);
  return h("div.stack", h("div.card", h("h3", "This calendar week"), h("div.stack", rowf("Lessons completed", s.lessons, t.lessons), rowf("New cards", s.cards, t.cards), rowf("Minutes of listening", s.listen, t.listen), rowf("Words written", s.words, t.words))),
    h("div.card.tint", h("h3", "Week " + w + " output target"), h("p", wk.output)),
    mine.length ? h("div.card", h("h3", "Send your writing for correction"), h("p.small.muted", "Alone, the missing ingredient is someone who corrects you. Copy this and paste it into a chat with Claude."), h("button.btn.primary", { onclick: () => copyText(correctionPrompt(mine.map(x => x.text).join("\n\n"), ctx.n)) }, "Copy this week’s writing + prompt")) : h("p.muted", "No writing saved this week yet."),
    [4, 7, 8].includes(w) ? h("div.card", h("h3", w === 4 ? "Diagnostic test" : "Timed mock exam"), h("p", "This is a mock-exam week. Do it, then log your four scores in Progress."), h("a.btn", { href: "#/progress" }, "Open Progress")) : null,
    h("div.card.tint", h("h3", "Next week (" + (w + 1) + ")"), h("p", `Lessons ${nx.lessons[0]}–${nx.lessons[1]} · ${nx.grammar}`)));
};

// ───────────── the session controller ─────────────
route(/^\/session\/(\d+)(?:\/(lite))?$/, (main, nStr, lite) => {
  const n = +nStr, Lx = L(n);
  if (!Lx) { main.append(h("p", "Lesson not available."), h("a.btn", { href: "#/" }, "Back")); return; }
  const mode = lite ? "lite" : "full", steps = buildSteps(n, mode);
  let i = (S.session && S.session.n === n && S.session.mode === mode) ? Math.min(S.session.i, steps.length - 1) : 0;
  let phase = "step", stepSec = 0, cur = null, warned = false, tick, breakCd = null;
  const cleanups = [];
  S.session = { n, mode, i, t0: Date.now() }; save();
  S.lessons[n] = S.lessons[n] || { steps: {} };
  const top = h("div.sess-top"), body = h("div"), foot = h("div.step-foot");
  main.append(top, body, foot);

  function flushStep() {
    const st = steps[i]; if (!st || !stepSec) return;
    addSec(st.strand, Math.min(stepSec, st.min * 120)); stepSec = 0;
  }
  function destroyStep() { if (cur && cur.destroy) cur.destroy(); cur = null; cleanups.splice(0).forEach(f => { try { f(); } catch (e) { } }); stopSpeak(); }
  tick = setInterval(() => { if (document.hidden || phase !== "step") return; stepSec++; const st = steps[i]; const chip = $("#chip"); if (chip && st) { chip.textContent = `${fmtClock(stepSec)} / ${st.min} min`; chip.classList.toggle("over", stepSec > st.min * 60); if (stepSec === st.min * 60 && !warned) { warned = true; beep("tick"); toast("Suggested time is up. Wrap this step when ready."); } } }, 1000);
  onLeave(() => { clearInterval(tick); flushStep(); destroyStep(); });

  function header() {
    const st = steps[i]; clear(top);
    top.append(h("div.row.sp", h("div.row", h("button.btn.ghost", { onclick: () => go("/") }, "← Exit"), h("span", { dataset: { strand: st.strand } }, h("span.strand", STRANDS[st.strand].label), st.optional ? h("span.pill", { title: "When time is short, cut FI first. Never cut the Assimil audio." }, "optional · cut first if short") : null)),
      h("div.row", h("span.muted.small", `Lesson ${n}${lite ? " · lite" : ""}`), h("span.timer-chip#chip", `0:00 / ${st.min} min`))),
      h("div.segs", steps.map((s, k) => h("i", { dataset: { strand: s.strand }, class: k < i ? "done" : k === i ? "now" : "", title: s.title }))));
  }
  function showStep() {
    phase = "step"; stepSec = 0; warned = false; destroyStep(); const st = steps[i];
    S.session = { n, mode, i, t0: S.session ? S.session.t0 : Date.now() }; save(); header();
    clear(body); clear(foot);
    let nextBtn = null, isReady = false;
    const paint = () => { if (nextBtn && isReady) { nextBtn.classList.add("good"); nextBtn.classList.remove("primary"); } };
    const ctx = { n, L: Lx, step: st, cleanups, ready: () => { isReady = true; paint(); } };
    const r = STEPS[st.id] ? STEPS[st.id](ctx) : h("p", "Unknown step");
    cur = r && r.el ? r : { el: r };
    body.append(h("div.card.step-card", { dataset: { strand: st.strand }, style: { borderTop: "5px solid var(--sc)" } }, h("h2", st.title), cur.el));
    nextBtn = h("button.btn.primary.big", { onclick: () => advance() }, i === steps.length - 1 ? "Finish ✓" : "Done — next ▶"); paint();
    foot.append(h("button.btn.ghost", { onclick: () => { if (confirm("Skip this step?")) advance(true); } }, "Skip"), h("span.muted.small", `Step ${i + 1} of ${steps.length}`), nextBtn);
    scrollTo(0, 0);
  }
  function advance(skipped) {
    const st = steps[i]; flushStep();
    if (!skipped) { S.lessons[n].steps[st.id] = true; }
    destroyStep();
    if (i >= steps.length - 1) return complete();
    const nxt = steps[i + 1];
    if (nxt.strand !== st.strand) { i++; return showBreak(st.strand, nxt); }
    i++; showStep();
  }
  function showBreak(prev, nxt) {
    phase = "break"; header(); clear(body); clear(foot);
    const msg = { input: "Ears warmed up. Stand up, stretch, drink some water.", focus: "Details noted. Look away from the screen for a minute.", output: "You spoke and wrote in French. Walk around for a minute.", fluency: "" }[prev];
    breakCd = countdown(90, { noButton: true, onEnd: () => { beep(); showStep(); } });
    body.append(h("div.card.break", h("div.big", STRANDS[prev].ico), h("h2", `${STRANDS[prev].label} block done`), h("p.muted", msg), breakCd.el,
      h("p.small.muted", `Next: ${STRANDS[nxt.strand].label} — ${nxt.title}`)));
    foot.append(h("span"), h("button.btn.primary.big", { onclick: () => { breakCd.destroy(); showStep(); } }, "Skip break, start next ▶"));
    breakCd.start(); cleanups.push(() => breakCd && breakCd.destroy());
  }
  function complete() {
    clearInterval(tick);
    const rec = S.lessons[n]; rec.done = ymd(); rec.lite = !!lite; if (!lite) delete rec.lite;
    const d = dayRec(); if (!d.lessons.includes(n)) d.lessons.push(n); if (lite) d.lite++; else d.sessions++;
    S.session = null; save(); beep(); header(); clear(body); clear(foot);
    const parked = S.parking.filter(p => !p.done).length, nl = currentLesson();
    const t = d.sec;
    body.append(h("div.card.break", h("div.big", "🎉"), h("h1", lite ? "Lite day done" : "Day done"), h("p", `Lesson ${n} complete. Your brain did real work today.`),
      h("div.grid.g4", ["input", "focus", "output", "fluency"].map(k => h("div.card.flat", { dataset: { strand: k } }, h("span.strand", STRANDS[k].short), h("div", { style: { fontSize: "1.5rem", fontWeight: 800 } }, fmtMin(t[k] || 0))))),
      lite ? h("p.small.muted", "A short day still counts. The skipped steps can be done on the review day.") : null,
      parked ? h("p", `💭 You parked ${parked} thought${parked > 1 ? "s" : ""} today.`) : null,
      nl <= NL ? h("p.muted", `Next up: lesson ${nl} — ${lessonTitle(nl)}. Stop here; it will be ready tomorrow.`) : h("p", "That was the last lesson of the course!")));
    foot.append(h("span"), h("a.btn.primary.big", { href: "#/" }, "Back to Today"));
  }
  showStep();
});
