"use strict";
// ───────────── lesson library + lesson viewer ─────────────
route(/^\/lessons$/, main => {
  main.append(h("h1", "Lessons"), h("p.muted", "All 100 Assimil lessons. The daily session walks you through them in order; this page is for browsing and revisiting."));
  const grid = h("div.grid.g3");
  for (let w = 1; w <= 15; w++) {
    const wk = weekInfo(w); main.append(h("h3", { style: { marginTop: "18px" } }, `Week ${w}`, h("span.muted.small", `  lessons ${wk.lessons[0]}–${wk.lessons[1]}`)));
    const g = h("div.grid.g3");
    for (let n = wk.lessons[0]; n <= wk.lessons[1]; n++) { const Lx = L(n); g.append(h("a.lesson-cell" + (lessonDone(n) ? ".done" : "") + (isReviewDay(n) ? ".rev" : ""), { href: `#/lesson/${n}` }, h("b", `${n}. `), Lx ? Lx.title : "—", h("div.small.muted", Lx ? Lx.titleEn : "", lessonDone(n) ? " · ✓" : ""))); }
    main.append(g);
  }
});
route(/^\/lesson\/(\d+)$/, (main, nStr) => {
  const n = +nStr, Lx = L(n); if (!Lx) { main.append(h("p", "Not found.")); return; }
  let tab = "dialogue"; const body = h("div"); let player = null;
  const tabs = h("div.tabs");
  const show = t => {
    tab = t; if (player) player.stop(); player = null; clear(body);
    $$("button", tabs).forEach(b => b.classList.toggle("on", b.dataset.t === t));
    if (t === "dialogue") { player = audioPlayer(lessonAudio(n)); body.append(player.el, h("div", { style: { height: "12px" } }), dialogueView(Lx, { fr: true, en: true, lit: true, cover: false })); }
    if (t === "shadow") { player = audioPlayer(lessonAudio(n), { pause: true, gaps: Lx.gaps }); body.append(player.el, dialogueView(Lx, { fr: true })); }
    if (t === "notes") body.append(notesView(Lx));
    if (t === "exercises") body.append(STEPS.exercises({ n, L: Lx, step: {} }));
    if (t === "cards") body.append(h("ul.list", (Lx.cards || []).map(c => h("li", h("span.fr", { style: { fontSize: "1.05rem", minWidth: "40%" } }, c.fr), h("span.muted", { style: { flex: 1 } }, `${c.zh || ""} · ${c.en}`), sayBtn(c.fr)))));
    if (t === "retell") body.append(retellView(Lx, { track: false }));
  };
  [["dialogue", "Dialogue"], ["shadow", "Repeat"], ["notes", "Notes"], ["exercises", "Exercises"], ["cards", "Cards"], ["retell", "Retell"]].forEach(([k, l]) => tabs.append(h("button", { dataset: { t: k }, onclick: () => show(k) }, l)));
  main.append(h("div.row.sp", h("div", h("div.muted.small", `Lesson ${n}${Lx.kind === "revision" ? " · revision" : ""}`), h("h1", Lx.title), h("p.muted", Lx.titleEn)),
    h("div.row", n > 1 ? h("a.btn", { href: `#/lesson/${n - 1}` }, "←") : null, n < NL ? h("a.btn", { href: `#/lesson/${n + 1}` }, "→") : null)),
    Lx.intro ? h("p.muted", Lx.intro) : null, tabs, body,
    h("p.small.muted", { style: { marginTop: "20px" } }, "Text cleaned from your PDF. If something looks off, compare with ", h("a", { href: `assimil_french.pdf#page=${Lx.pdfPage}`, target: "_blank" }, "the book page (PDF p." + Lx.pdfPage + ")"), "."));
  onLeave(() => player && player.stop());
  show(tab);
});
