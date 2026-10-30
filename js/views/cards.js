"use strict";
// ───────────── flashcard runner (used in the session and on the Cards page) ─────────────
// spec: {n: current lesson, noNew, backlog, newLimit, maxReviews}; returns {el, destroy, done(promise-ish via opt.onFinish)}
function cardRunner(spec, opt = {}) {
  const q = buildQueue(spec.n, spec);
  const queue = [...q.due, ...q.fresh];
  const total0 = queue.length;
  const stats = { reviewed: 0, newSeen: 0, again: 0 };
  const box = h("div");
  let revealed = false, cur = null, destroyed = false;
  const hdl = e => {
    if (destroyed || e.target.matches("input,textarea,select")) return;
    if (!revealed && (e.key === " " || e.key === "Enter")) { e.preventDefault(); reveal(); }
    else if (revealed && /^[1-4]$/.test(e.key)) answer(+e.key - 1);
    else if (e.key.toLowerCase() === "s" && cur) speak(cur.fr);
  };
  document.addEventListener("keydown", hdl);

  function finish() {
    destroyed = true; document.removeEventListener("keydown", hdl);
    clear(box).append(h("div.card.fc", h("div", { style: { fontSize: "3rem" } }, total0 ? "✅" : "🎉"),
      h("h2", total0 ? "Cards done" : "Nothing due right now"),
      h("p.muted", total0 ? `${stats.reviewed} reviews · ${stats.newSeen} new cards` : "You are all caught up. New cards appear tomorrow, or add more from the Phrasebook."),
      q.held ? h("p.small.muted", `${q.held} card(s) held back this week so similar words don’t interfere.`) : null,
      opt.onFinish ? null : h("a.btn.primary", { href: "#/" }, "Back to Today")));
    if (opt.onFinish) opt.onFinish(stats);
  }
  function show() {
    revealed = false; cur = queue[0];
    if (!cur) return finish();
    const v = S.cards[cur.id], isNew = !v || v.s === "new";
    const left = queue.length;
    clear(box).append(
      h("div.row.sp", h("span.pill", isNew ? "NEW" : v.s === "learn" ? "RELEARN" : "REVIEW"), h("span.muted.small.mono", `${left} left`), h("button.btn.ghost", { onclick: finish }, "Stop here")),
      bar((total0 - Math.min(total0, left)) / Math.max(1, total0), "var(--c-focus)"),
      h("div.card.fc", { style: { marginTop: "12px" } },
        h("div.front", cur.fr), h("div.row", { style: { justifyContent: "center" } }, sayBtn(cur.fr), cur.g ? h("span.pill", cur.g === "m" ? "masculine" : "feminine") : null),
        h("div.muted.small", "Say it out loud, then reveal"),
        h("div#back"),
        h("button.btn.primary.big#reveal", { onclick: reveal }, "Show answer  ", h("span.kbd", "Space"))),
      h("div#rate"));
    if (S.settings.autoSpeak) speak(cur.fr);
  }
  function reveal() {
    if (revealed || !cur) return; revealed = true;
    const hints = nextHint(cur), c = cur, v = S.cards[c.id];
    $("#reveal", box).remove();
    $("#back", box).append(h("div.back",
      c.zh ? h("div.zh", c.zh) : null, h("div.en", c.en),
      c.cog ? h("div.hint", "🔗 " + c.cog) : null,
      c.ff ? h("div.hint.ff", "⚠ " + c.ff) : null,
      c.kw ? h("div.hint", "💡 " + c.kw) : null,
      (v && v.my) ? h("div.hint", "✎ " + v.my) : null,
      c.ex ? h("div.small", { style: { marginTop: "8px" } }, h("span.fr", { style: { fontSize: "1.05rem" } }, c.ex), " ", sayBtn(c.ex), h("div.muted", c.exEn || "")) : null,
      h("button.btn.ghost.small", { onclick: () => mine(c) }, "✎ my own mnemonic")));
    $("#rate", box).append(h("div.rate", ["Again", "Hard", "Good", "Easy"].map((l, i) =>
      h("button.r" + i, { onclick: () => answer(i) }, l, h("small", hints[i]), h("span.kbd", String(i + 1))))));
  }
  function mine(c) {
    const ta = h("textarea", { rows: 3, placeholder: "A picture or sound-alike that links the word and its meaning…" }); const v = S.cards[c.id] || (S.cards[c.id] = { s: "new", due: today(), ivl: 0, ease: 2.5, reps: 0, lapses: 0 });
    ta.value = v.my || "";
    modal("My mnemonic for “" + c.fr + "”", [h("p.small.muted", "Keyword method: find a similar-sounding English/Chinese word and imagine a scene joining the two meanings. Worth it only for hard, non-cognate words."), ta],
      [{ label: "Save", primary: true, fn: () => { v.my = ta.value.trim(); save(); } }]);
  }
  function answer(qv) {
    if (!revealed || !cur) return;
    const c = queue.shift(), v = S.cards[c.id], wasNew = !v || v.s === "new";
    const r = rate(c, qv);
    stats.reviewed++; if (wasNew) stats.newSeen++; if (qv === 0) stats.again++;
    if (r.requeue) queue.splice(Math.min(queue.length, qv === 0 ? 3 : 6), 0, c);
    show();
  }
  show();
  return { el: box, destroy() { destroyed = true; document.removeEventListener("keydown", hdl); } };
}

// ───────────── Cards page ─────────────
route(/^\/cards$/, main => {
  const cur = Math.min(currentLesson(), NL);
  const c = counts(cur), held = pickNew(c.newLeft, cur);
  let runner = null;
  const area = h("div");
  const stat = (label, val, sub) => h("div.card.flat", h("div.muted.small", label), h("div", { style: { fontSize: "1.8rem", fontWeight: 800 } }, val), sub ? h("div.muted.small", sub) : null);
  const total = allCards().length;
  main.append(h("h1", "Cards"),
    h("div.grid.g4", stat("Due now", c.due), stat("New today", `${newToday()} / ${S.settings.newPerDay}`, `${c.newAvail} ready`), stat("Learned", learned(), `of ${total}`), stat("Mature (21 d+)", mature(), "goal ≈ 700 for A1")),
    h("div.row", { style: { margin: "16px 0" } },
      h("button.btn.primary.big", { onclick: () => { clear(area); runner = cardRunner({ n: cur }); area.append(runner.el); onLeave(() => runner && runner.destroy()); } }, c.due + c.newAvail ? `Start (${c.due} reviews + ${c.newAvail} new)` : "Start"),
      h("span.muted.small", "Groups are shuffled each time. Read each card aloud.")),
    area,
    held.held ? h("p.small.muted", `${held.held} cards are waiting because a closed set (days, months, colours…) already has 2 cards this week. ${INTERFERENCE}`) : null,
    h("hr"), browseCards());
});

function browseCards() {
  const wrap = h("div"), list = h("div");
  const search = h("input", { type: "text", placeholder: "Search cards (French, English or 中文)", oninput: draw, style: { width: "100%", maxWidth: "420px" } });
  const flt = h("select", { onchange: draw }, ["all", "learned", "new (unseen)", "hard (lapses ≥ 2)", "mine"].map(x => h("option", x)));
  function draw() {
    const t = norm(search.value), f = flt.value;
    let cs = allCards().filter(c => { const v = S.cards[c.id]; return (!t || norm(c.fr + " " + c.en + " " + (c.zh || "")).includes(t)) && (f === "all" || (f === "learned" && v && v.s === "rev") || (f.startsWith("new") && !v) || (f.startsWith("hard") && v && v.lapses >= 2) || (f === "mine" && c.src !== "lesson")); });
    const shown = cs.slice(0, 80);
    clear(list).append(h("p.small.muted", `${cs.length} cards${cs.length > 80 ? " (first 80)" : ""}`),
      h("ul.list", shown.map(c => { const v = S.cards[c.id]; return h("li", h("span.fr", { style: { fontSize: "1.05rem", minWidth: "40%" } }, c.fr), h("span.muted", { style: { flex: 1 } }, `${c.zh || ""} · ${c.en}`), h("span.pill", c.src === "lesson" ? "L" + c.lesson : c.src), v ? h("span.pill", v.s === "rev" ? v.ivl + " d" : v.s) : null, sayBtn(c.fr)); })));
  }
  const fr = h("input", { type: "text", placeholder: "French" }), en = h("input", { type: "text", placeholder: "English / 中文" });
  wrap.append(h("h2", "All cards"), h("div.row", search, flt), list,
    h("h3", { style: { marginTop: "20px" } }, "Add your own card"),
    h("div.row", fr, en, h("button.btn", { onclick: () => { if (fr.value.trim() && en.value.trim()) { addCustomCard({ fr: fr.value.trim(), en: en.value.trim(), src: "mine" }); fr.value = en.value = ""; draw(); } } }, "Add")));
  draw(); return wrap;
}
