"use strict";
route(/^\/settings$/, main => {
  const num = (label, get, set, min, max) => { const i = h("input", { type: "number", min, max, value: get(), style: { width: "80px" }, onchange: () => { set(+i.value); save(); } }); return h("label.row", i, label); };
  const start = h("input", { type: "date", value: S.start, onchange: () => { if (start.value) { S.start = start.value; save(); toast("Start date saved"); } } });
  const theme = h("select", { onchange: () => { S.settings.theme = theme.value; save(); applyTheme(); } }, ["auto", "light", "dark"].map(x => h("option", { selected: S.settings.theme === x }, x)));
  const tg = weekTargets();
  const park = h("div");
  function drawPark() {
    clear(park).append(S.parking.length ? h("ul.list", S.parking.map(p => h("li", h("input", { type: "checkbox", checked: p.done, onchange: e => { p.done = e.target.checked; save(); } }), h("span", { style: { flex: 1, textDecoration: p.done ? "line-through" : "" } }, p.text), h("button.icon", { onclick: () => { S.parking.splice(S.parking.indexOf(p), 1); save(); drawPark(); } }, "🗑")))) : h("p.muted.small", "Empty. Press P anywhere to park a stray thought."));
  }
  drawPark();
  const file = h("input", { type: "file", accept: "application/json", style: { display: "none" }, onchange: e => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then(t => { try { const d = JSON.parse(t); if (!d.v) throw 0; S = merge(defaults(), d); flush(); toast("Backup restored"); setTimeout(() => location.reload(), 600); } catch (err) { toast("That file is not a backup of this app"); } });
  } });
  main.append(h("h1", "Settings"),
    h("div.card.stack", h("h3", "Plan"), h("label.row", start, "Day 1 of the plan (a Monday works best)"),
      num("new cards per day", () => S.settings.newPerDay, v => S.settings.newPerDay = v, 5, 40)),
    h("div.card.stack", { style: { marginTop: "14px" } }, h("h3", "Weekly targets"),
      num("lessons", () => tg.lessons, v => (S.settings.targets = Object.assign(weekTargets(), { lessons: v })), 1, 14), num("new cards", () => tg.cards, v => (S.settings.targets = Object.assign(weekTargets(), { cards: v })), 10, 300),
      num("minutes of listening", () => tg.listen, v => (S.settings.targets = Object.assign(weekTargets(), { listen: v })), 10, 600), num("words written", () => tg.words, v => (S.settings.targets = Object.assign(weekTargets(), { words: v })), 10, 1000)),
    h("div.card.stack", { style: { marginTop: "14px" } }, h("h3", "Comfort"), h("label.row", theme, "theme"),
      h("label.row", h("input", { type: "checkbox", checked: S.settings.sound, onchange: e => { S.settings.sound = e.target.checked; save(); } }), "chimes when a step is timed out"),
      h("label.row", h("input", { type: "checkbox", checked: S.settings.autoSpeak, onchange: e => { S.settings.autoSpeak = e.target.checked; save(); } }), "read each card aloud when it appears"),
      h("label.row", h("input", { type: "range", min: 0.6, max: 1.1, step: 0.05, value: S.settings.ttsRate, onchange: e => { S.settings.ttsRate = +e.target.value; save(); speak("Bonjour, comment allez-vous ?"); } }), "voice speed"),
      h("button.btn", { onclick: () => speak("Bonjour, je m’appelle Claude.") }, "🔊 Test the French voice")),
    h("div.card", { style: { marginTop: "14px" } }, h("h3", "Parked thoughts 💭"), park),
    h("div.card.stack", { style: { marginTop: "14px" } }, h("h3", "Backup"), h("p.small.muted", "Everything is stored in this browser. Export a backup now and then; keep it with your files."),
      h("div.row", h("button.btn.primary", { onclick: () => { const a = h("a", { href: URL.createObjectURL(new Blob([JSON.stringify(S)], { type: "application/json" })), download: `francais-backup-${ymd()}.json` }); a.click(); } }, "Export backup"), h("button.btn", { onclick: () => file.click() }, "Restore from backup"), file,
        h("button.btn", { style: { color: "var(--bad)" }, onclick: () => { if (confirm("Erase ALL progress? This cannot be undone.") && confirm("Really erase everything?")) { localStorage.removeItem(KEY); location.reload(); } } }, "Erase everything"))),
    h("p.small.muted", { style: { marginTop: "20px" } }, "Lesson and phrasebook text are cleaned from your own PDFs for private study; do not share them. Français interactif © University of Texas at Austin (COERLL/LAITS), CC BY 3.0. Method after Paul Nation (four strands)."));
});
