"use strict";
route(/^\/phrase(?:\/(.*))?$/, (main, sub) => {
  const P = window.PHRASE || { days: [], sections: [] };
  let tab = sub === "days" ? "days" : "sit", cover = false, sect = null, day = 1;
  const body = h("div"), tabs = h("div.tabs");
  const sectionNames = [...new Set(P.sections.map(g => g.section))];
  const item = (fr, en, pron, extra) => h("div.card.flat", { style: { padding: "10px 14px", marginBottom: "6px" } },
    h("div.row.sp", h("div", { style: { flex: 1, minWidth: "60%" } },
      fr ? h("div.fr", { style: { fontSize: "1.15rem" } }, fr) : null, pron ? h("div.muted.small", { style: { fontStyle: "italic" } }, pron) : null,
      h("div" + (cover ? ".cover" : ""), { onclick: e => cover && e.currentTarget.classList.toggle("open") }, en), extra || null),
      fr ? h("div.row", sayBtn(fr), h("button.icon", { title: "Add to my cards", onclick: () => addCustomCard({ fr: fr.replace(/\s*…\s*$/, ""), en, src: "pb", pron }) }, "☆")) : null));
  function drawDays() {
    const D = P.days.find(x => x.day === day); if (!D) return;
    body.append(h("div.row", { style: { marginBottom: "12px" } }, P.days.map(x => h("button.btn" + (x.day === day ? ".primary" : ""), { onclick: () => { day = x.day; draw(); } }, x.day))),
      h("h2", `Day ${D.day}: ${D.title}`), h("p.muted", D.titleEn),
      D.phrases.map(p => item(p.fr, p.en, p.pron, p.lit ? h("div.small.muted", "word for word: " + p.lit) : null)),
      D.notes && D.notes.length ? h("div", h("h3", { style: { marginTop: "16px" } }, "Notes"), D.notes.map(t => h("div.note", t))) : null,
      D.practice && D.practice.items.length ? h("div.card", { style: { marginTop: "14px" } }, h("h3", "Practice"), D.practice.items.map(it => { const a = h("div.muted", { style: { display: "none" } }, it.a); return h("div.ex-item", h("div", it.q), a, h("button.btn.ghost.small", { onclick: e => { a.style.display = ""; e.currentTarget.remove(); } }, "Show answer")); })) : null);
  }
  function drawSit() {
    const q = norm(search.value);
    if (q.length > 1) {
      const hits = []; P.sections.forEach(g => g.items.forEach(it => { if (norm((it.en || "") + " " + (it.fr || "")).includes(q)) hits.push([g, it]); }));
      body.append(h("p.small.muted", `${hits.length} results`), hits.slice(0, 60).map(([g, it]) => item(it.fr, it.en, it.pron, h("div.small.muted", g.section + (g.title ? " › " + g.title : "")))));
      return;
    }
    sect = sect || sectionNames[0];
    body.append(h("div.row", { style: { marginBottom: "14px" } }, sectionNames.map(s => h("button.btn" + (s === sect ? ".primary" : ""), { onclick: () => { sect = s; draw(); } }, s))),
      P.sections.filter(g => g.section === sect).map(g => h("div", g.title && g.title !== "Tip" ? h("h3", { style: { marginTop: "16px" } }, g.title) : null,
        g.title === "Tip" ? g.items.map(it => h("div.note", it.en)) : g.items.map(it => item(it.fr, it.en, it.pron, it.note ? h("div.small.muted", it.note) : null)))),
      h("div.row", { style: { marginTop: "16px" } }, h("button.btn.primary", { onclick: () => drill(P.sections.filter(g => g.section === sect).flatMap(g => g.items).filter(i => i.fr)) }, "Drill this section")));
  }
  function drill(items) {
    const q = shuffle(items).slice(0, 12); let k = 0;
    const m = modal(`Drill: ${sect}`, h("div"), []); const b = $(".modal-b", m.el);
    (function step() {
      clear(b); if (k >= q.length) { b.append(h("p", "Done! 🎉"), h("button.btn.primary", { onclick: m.close }, "Close")); return; }
      const it = q[k]; b.append(h("p.small.muted", `${k + 1} / ${q.length} — say it in French`), h("div", { style: { fontSize: "1.4rem", margin: "10px 0" } }, it.en), h("div#a"), h("button.btn.primary", { id: "r", onclick: e => { e.currentTarget.remove(); $("#a", b).append(h("div.fr", it.fr), h("div.muted.small", it.pron || ""), h("div.row", sayBtn(it.fr), h("button.btn.good", { onclick: () => { k++; step(); } }, "Next"))); speak(it.fr); } }, "Show French"));
    })();
  }
  const search = h("input", { type: "text", placeholder: "Search the phrasebook (English or French)", oninput: () => { if (tab !== "sit") tab = "sit"; draw(); }, style: { width: "100%", maxWidth: "380px" } });
  const coverBtn = h("label.row.small", h("input", { type: "checkbox", onchange: e => { cover = e.target.checked; draw(); } }), "Hide English (test yourself)");
  function draw() {
    clear(body); $$("button", tabs).forEach(b => b.classList.toggle("on", b.dataset.t === tab));
    if (!P.sections.length && !P.days.length) { body.append(h("p.muted", "Phrasebook data not found.")); return; }
    tab === "days" ? drawDays() : drawSit();
  }
  [["sit", "By situation"], ["days", "21-day mini-lessons"]].forEach(([k, l]) => tabs.append(h("button", { dataset: { t: k }, onclick: () => { tab = k; search.value = ""; draw(); } }, l)));
  main.append(h("h1", "Phrasebook"), h("p.muted", "Assimil phrasebook: ready-made sentences for real situations. Tap 🔊 to hear a French voice, ☆ to send a phrase to your cards."), tabs, h("div.row.sp", { style: { marginBottom: "12px" } }, search, coverBtn), body);
  draw();
});
