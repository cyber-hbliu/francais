"use strict";
route(/^\/fi(?:\/(\d+))?$/, (main, chStr) => {
  const cur = weekInfo(weekOf(Math.min(currentLesson(), NL))).fi;
  let ch = chStr != null ? +chStr : cur, players = [];
  const body = h("div"), tabs = h("div.tabs");
  const chName = c => ["00 Bienvenue", "01 Bonjour", "02 Me voici", "03", "04 Les gens", "05 Bon appétit", "06 La ville", "07", "08", "09", "10", "11", "12", "13"][c] || String(c).padStart(2, "0");
  function draw() {
    players.forEach(p => p.stop()); players = []; clear(body);
    $$("button", tabs).forEach(b => b.classList.toggle("on", +b.dataset.c === ch));
    const voc = FI_VOC.filter(v => v.ch === ch), lis = FI_LISTEN.filter(x => x.ch === ch), pho = ch >= 1 ? FI_PHO.filter(p => p.n === ch) : [];
    const w = fiWeb(ch), web = h("div.stack"), part = h("div");
    body.append(h("div.card.tint", h("div.row.sp", h("div", h("b", "Chapitre " + chName(ch)), ch === cur ? h("span.pill", { style: { marginLeft: "8px" } }, "this week") : null),
      h("a.btn", { href: `https://www.laits.utexas.edu/fi/toc/${String(ch).padStart(2, "0")}/`, target: "_blank", rel: "noopener" }, "Chapter on the FI site ↗"))), web);
    // videos, Tex grammar and the quiz, one at a time
    const parts = [["Videos", () => h("div.stack", [["En contexte", [w.intro, ...w.voc].filter(Boolean), w.pdf["videos-voc"]], ["Interviews: les Français à Austin", w.intfr, w.pdf["videos-int-fr"]], ["Interviews: étudiants à UT Austin", w.intusa, w.pdf["videos-int-usa"]]]
        .filter(([, l]) => l.length).map(([t, l, pdf]) => h("div.card", h("h3", t), videoPicker(l), pdf ? h("p.small.muted", h("a", { href: pdf, target: "_blank", rel: "noopener" }, "Transcript (PDF) ↗")) : null)))],
      ["Grammar with Tex", () => gramPicker(w.gram)],
      w.quiz ? ["Testez-vous!", () => framePane(w.quiz, "Testez-vous", { tall: true })] : null,
      w.song.length || w.act.length ? ["Song & web activity", () => h("div.stack", [...w.song, ...w.act].map(x => h("div.card", h("h3", x.t), framePane(x.u, x.t))))] : null].filter(Boolean);
    const ptabs = h("div.vlist");
    const showPart = i => { clear(part).append(parts[i][1]()); $$("button", ptabs).forEach((b, j) => b.classList.toggle("on", i === j)); };
    parts.forEach(([t], i) => ptabs.append(h("button.chip", { onclick: () => showPart(i) }, t)));
    web.append(ptabs, part); showPart(0);
    body.append(h("h3", { style: { marginTop: "18px" } }, "Recordings (offline)"));
    if (pho.length) pho.forEach(p => body.append(h("details.card", { style: { marginTop: "12px" } }, h("summary", h("b", "Pronunciation lesson: " + p.title)), h("p.small.muted", { style: { whiteSpace: "pre-line" } }, p.intro),
      p.items.map(it => { const pl = it.u ? audioPlayer(fiAudio(it.u)) : null; if (pl) players.push(pl); return h("div.ex-item", h("div", { style: { whiteSpace: "pre-line" } }, it.t), pl ? pl.el : null); }))));
    if (lis.length) body.append(h("h3", { style: { marginTop: "18px" } }, "Listening exercises"), lis.map(x => { const p = audioPlayer(fiAudio(x.u)); players.push(p); return h("div.card.flat", { style: { marginBottom: "8px" } }, h("b", x.t), p.el); }));
    body.append(h("h3", { style: { marginTop: "18px" } }, "Vocabulary lists"));
    voc.forEach(v => { const p = v.audio ? audioPlayer(fiAudio(v.audio)) : null; if (p) players.push(p);
      body.append(h("details.card", { style: { marginBottom: "8px" } }, h("summary", h("b", v.title), h("span.muted.small", `  ${v.words.length} items`)), p ? p.el : null,
        v.words.length ? h("table", v.words.map(w => h("tr", h("td.fr", { style: { fontSize: "1.05rem" } }, w[0]), h("td.muted", w[1]), h("td", sayBtn(w[0].replace(/\(.*?\)/g, "")), h("button.icon", { title: "Add to my cards", onclick: () => addCustomCard({ fr: w[0].replace(/\s*\(.*?\)\s*$/, ""), en: w[1], src: "fi" }) }, "☆")))) ) : h("p.muted.small", "Audio only."))); });
    if (!voc.length && !lis.length && !pho.length) body.append(h("p.muted", "No recordings for this chapter."));
  }
  for (let c = 0; c <= 13; c++) tabs.append(h("button", { dataset: { c }, onclick: () => { ch = c; draw(); } }, String(c).padStart(2, "0")));
  main.append(h("h1", "Français interactif"), h("p.muted", "University of Texas at Austin (COERLL / LAITS), CC BY 3.0. Chapters follow your weekly plan: one chapter per week."), tabs, body);
  onLeave(() => players.forEach(p => p.stop()));
  draw();
});
