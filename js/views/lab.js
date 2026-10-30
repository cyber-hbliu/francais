"use strict";
route(/^\/lab$/, main => {
  const body = h("div"), tabs = h("div.tabs"); let tab = "sounds";
  function sounds() {
    body.append(h("p.muted", "Your ear is trained on Mandarin, so some French sounds need deliberate practice early; late corrections cost far more effort. Tap a word to hear a French voice, then record yourself and compare."),
      SOUNDS.map(s => h("div.card", { style: { marginBottom: "12px" } }, h("div.row.sp", h("h3", s.title), s.easy ? h("span.pill", "easy for you") : h("span.pill", { style: { background: "var(--c-output)", color: "#fff" } }, "practise")), h("p", s.tip),
        h("div.row", s.words.map(w => h("button.btn", { onclick: () => speak(w, { rate: 0.8 }) }, "🔊 " + w))), h("div.card.flat", { style: { marginTop: "10px" } }, h("div.small.muted", "Record yourself saying these words, then play it back after hearing the voice:"), recorder("lab-" + s.id).el))));
  }
  function pairs() {
    let score = 0, tot = 0; const area = h("div"), sc = h("span.pill", "0 / 0");
    function next() {
      const p = MIN_PAIRS[Math.random() * MIN_PAIRS.length | 0], pick = Math.random() < .5 ? 0 : 1, w = p[pick];
      clear(area).append(h("p.muted", `Contrast: ${p[2]}. Listen and choose the word you hear.`), h("div.row", h("button.btn.primary.big", { onclick: () => speak(w, { rate: 0.75 }) }, "🔊 Play"), h("span.small.muted", "(play as often as you like)")),
        h("div.row", { style: { marginTop: "14px" } }, [p[0], p[1]].map((x, i) => h("button.btn.big", { onclick: e => { tot++; const ok = i === pick; if (ok) score++; sc.textContent = `${score} / ${tot}`; e.currentTarget.style.background = ok ? "var(--good)" : "var(--bad)"; e.currentTarget.style.color = "#fff"; beep(ok ? "ok" : "tick"); setTimeout(next, 900); } }, x))));
      speak(w, { rate: 0.75 });
    }
    body.append(h("div.row.sp", h("h3", "Minimum pairs"), sc), area); next();
  }
  function cog() {
    body.append(h("p.muted", "English gives you a head start: about 60% of English vocabulary comes from French, Latin or Greek. Use these regular patterns, and learn the traps."),
      h("div.card", h("h3", "Cognate patterns"), h("table", h("tr", h("th", "Pattern"), h("th", "Examples"), h("th", "")), COGNATES.map(c => h("tr", h("td", c[0]), h("td.fr", { style: { fontSize: "1rem" } }, c[1]), h("td.muted.small", c[2]))))),
      h("div.card", { style: { marginTop: "14px" } }, h("h3", "False friends (faux amis)"), h("ul.list", FALSE_FRIENDS.map(f => h("li", h("b.fr", { style: { minWidth: "30%" } }, f[0]), sayBtn(f[0]), h("span.muted", f[1]))))));
  }
  function scripts() {
    body.append(h("p.muted", "Templates for your speaking tasks. Fill the dots, edit freely, then rehearse aloud with a timer. Your edits are saved here."),
      Object.values(SCRIPTS).map(sc => { const ta = h("textarea", { rows: 7 }); ta.value = S.scripts[sc.title] || sc.text; ta.addEventListener("change", () => { S.scripts[sc.title] = ta.value; save(); });
        return h("div.card", { style: { marginBottom: "12px" } }, h("h3", sc.title), ta, h("div.row", { style: { marginTop: "8px" } }, h("button.btn", { onclick: () => speak(ta.value.replace(/…/g, "")) }, "🔊 Hear it"), h("button.btn", { onclick: () => copyText(correctionPrompt(ta.value, 0)) }, "Copy for correction"))); }));
  }
  const T = { sounds, pairs, cog, scripts };
  function draw() { clear(body); $$("button", tabs).forEach(b => b.classList.toggle("on", b.dataset.t === tab)); T[tab](); }
  [["sounds", "Mandarin → French sounds"], ["pairs", "Minimal pairs"], ["cog", "Cognates & false friends"], ["scripts", "Speaking scripts"]].forEach(([k, l]) => tabs.append(h("button", { dataset: { t: k }, onclick: () => { tab = k; stopSpeak(); draw(); } }, l)));
  main.append(h("h1", "Sounds & tools"), tabs, body); draw();
});
