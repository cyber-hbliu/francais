"use strict";
function lineChart(series, labels, { w = 640, hgt = 180, color = "var(--accent)", target = null, fmt = v => v } = {}) {
  const ns = "http://www.w3.org/2000/svg", pad = { l: 30, r: 10, t: 12, b: 24 };
  const max = Math.max(1, target || 0, ...series), s = document.createElementNS(ns, "svg");
  s.setAttribute("viewBox", `0 0 ${w} ${hgt}`); s.classList.add("chart");
  const X = i => pad.l + (series.length < 2 ? (w - pad.l - pad.r) / 2 : i * (w - pad.l - pad.r) / (series.length - 1)), Y = v => hgt - pad.b - v / max * (hgt - pad.t - pad.b);
  let g = `<line x1="${pad.l}" y1="${Y(0)}" x2="${w - pad.r}" y2="${Y(0)}" stroke="var(--line)"/>`;
  if (target) g += `<line x1="${pad.l}" y1="${Y(target)}" x2="${w - pad.r}" y2="${Y(target)}" stroke="var(--muted)" stroke-dasharray="4 4"/><text x="${pad.l - 4}" y="${Y(target) + 4}" text-anchor="end">${fmt(target)}</text>`;
  g += `<text x="${pad.l - 4}" y="${Y(0) + 4}" text-anchor="end">0</text>`;
  g += `<polyline fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" points="${series.map((v, i) => X(i) + "," + Y(v)).join(" ")}"/>`;
  series.forEach((v, i) => { g += `<circle cx="${X(i)}" cy="${Y(v)}" r="3.5" fill="${color}"><title>${labels[i]}: ${fmt(v)}</title></circle>`; if (series.length <= 12 || i % 2 === 0) g += `<text x="${X(i)}" y="${hgt - 6}" text-anchor="middle">${labels[i]}</text>`; });
  s.innerHTML = g; return s;
}
route(/^\/progress$/, main => {
  const mon0 = mondayOf(ymd()), weeks = []; for (let i = 9; i >= 0; i--) weeks.push(mondayOf(addDays(mon0, -7 * i)));
  const stats = weeks.map(weekStats), labels = weeks.map(m => fmtDate(m, { day: "numeric", month: "numeric" })), tg = weekTargets();
  const chartCard = (title, key, color, target) => h("div.card", h("h3", title), lineChart(stats.map(s => s[key]), labels, { color, target }));
  // strand balance (last 4 weeks)
  const tot = { input: 0, focus: 0, output: 0, fluency: 0 }; stats.slice(-4).forEach(s => Object.keys(tot).forEach(k => tot[k] += s.sec[k]));
  const all = Object.values(tot).reduce((a, b) => a + b, 0) || 1;
  // A1 standard
  const lastMock = [...S.mocks].reverse()[0], solid = lastMock && lastMock.listening + lastMock.reading + lastMock.writing + lastMock.speaking >= 75 && Math.min(lastMock.listening, lastMock.reading, lastMock.writing, lastMock.speaking) >= 17;
  const l30 = [...Array(30)].map((_, i) => S.lessons[i + 1] && S.lessons[i + 1].listen).filter(v => v != null);
  const avg30 = l30.length ? Math.round(l30.reduce((a, b) => a + b, 0) / l30.length) : null;
  const std = A1_STANDARD.map(s => {
    let ok = !!S.checks[s.id], note = "";
    if (s.id === "mock") { ok = !!solid; note = lastMock ? `latest: ${lastMock.listening + lastMock.reading + lastMock.writing + lastMock.speaking} / 100` : "no mock logged"; }
    if (s.id === "words") { const w = mature(); ok = w >= 700; note = `${w} / 700 mature cards (+${learned() - w} still young)`; }
    if (s.id === "audio30") { ok = avg30 != null && l30.length >= 30 && avg30 >= 90; note = avg30 != null ? `average ${avg30}% over ${l30.length} lessons rated` : "rate lessons below"; }
    return h("div.check", s.auto ? h("span", ok ? "✅" : "⬜") : h("input", { type: "checkbox", checked: ok, onchange: e => { S.checks[s.id] = e.target.checked; save(); } }), h("div", s.text, note ? h("div.small.muted", note) : null));
  });
  // mocks
  const mockForm = {}; const inputs = DELF_PARTS.map(p => { const i = h("input", { type: "number", min: 0, max: 25, step: 0.5, placeholder: "/25", style: { width: "74px" } }); mockForm[p.k] = i; return h("label.small", p.label, h("br"), i); });
  const kind = h("select", ["Diagnostic (listening + reading)", "Full mock 1", "Full mock 2", "Other"].map(x => h("option", x)));
  const mockList = h("div");
  function drawMocks() {
    clear(mockList).append(S.mocks.length ? h("table", h("tr", h("th", "Date"), h("th", "Kind"), DELF_PARTS.map(p => h("th", p.label)), h("th", "Total"), h("th", "")),
      [...S.mocks].reverse().map((m, ri) => { const t = m.listening + m.reading + m.writing + m.speaking, bad = Math.min(m.listening, m.reading, m.writing, m.speaking) < 5; const idx = S.mocks.length - 1 - ri;
        return h("tr", h("td", fmtDate(m.date)), h("td", m.kind), DELF_PARTS.map(p => h("td", m[p.k])), h("td", h("b", t), t >= 75 && Math.min(m.listening, m.reading, m.writing, m.speaking) >= 17 ? " ✅ solid" : t >= 50 && !bad ? " pass" : " below"), h("td", h("button.icon", { onclick: () => { S.mocks.splice(idx, 1); save(); drawMocks(); } }, "🗑"))); })) : h("p.muted.small", "No mock exams logged yet."));
  }
  drawMocks();
  // listening self-test for lessons 1–30
  const lsel = h("select", Array.from({ length: 30 }, (_, i) => h("option", { value: i + 1 }, `Lesson ${i + 1}`))), lpct = h("input", { type: "number", min: 0, max: 100, placeholder: "%", style: { width: "70px" } });

  S.vocab = S.vocab || [];
  const vk = h("select", ["Week 0 (before)", "Week 8", "Later"].map(x => h("option", x))), vs = h("input", { type: "number", min: 0, max: 2000, placeholder: "words", style: { width: "100px" } });
  const vlist = h("div"); const dv = () => clear(vlist).append(S.vocab.length ? h("ul.list", S.vocab.map((v, i) => h("li", h("b", v.label), h("span", fmtDate(v.date)), h("span", `${v.score} words`), i && S.vocab[0] ? h("span.muted", `(${v.score - S.vocab[0].score >= 0 ? "+" : ""}${v.score - S.vocab[0].score} vs first test)`) : null, h("button.icon", { onclick: () => { S.vocab.splice(i, 1); save(); dv(); } }, "🗑")))) : h("p.muted.small", "No test logged yet."));
  dv();
  main.append(h("h1", "Progress"),
    h("div.grid.g4", h("div.card.flat", h("div.muted.small", "Lessons done"), h("div", { style: { fontSize: "1.8rem", fontWeight: 800 } }, `${doneCount()} / ${NL}`), bar(doneCount() / NL)),
      h("div.card.flat", h("div.muted.small", "Cards learned"), h("div", { style: { fontSize: "1.8rem", fontWeight: 800 } }, learned()), h("div.small.muted", `${mature()} mature`)),
      h("div.card.flat", h("div.muted.small", "Words written (all time)"), h("div", { style: { fontSize: "1.8rem", fontWeight: 800 } }, S.writing.reduce((a, x) => a + x.words, 0))),
      h("div.card.flat", h("div.muted.small", "Study time (all time)"), h("div", { style: { fontSize: "1.8rem", fontWeight: 800 } }, fmtMin(Object.values(S.days).reduce((a, d) => a + Object.values(d.sec).reduce((x, y) => x + y, 0), 0))))),
    h("h2", { style: { marginTop: "22px" } }, "Weekly curves"),
    h("div.grid.g2", chartCard("New cards per week", "cards", "var(--c-focus)", tg.cards), chartCard("Lessons completed", "lessons", "var(--c-input)", tg.lessons), chartCard("Minutes of listening", "listen", "var(--c-fluency)", tg.listen), chartCard("Words written", "words", "var(--c-output)", tg.words)),
    h("div.card", { style: { marginTop: "14px" } }, h("h3", "Four-strand balance (last 4 weeks)"), h("p.small.muted", "Target: about a quarter of the time on each. Your materials lean towards input and language focus, so output and fluency need the extra care."),
      h("div.stack", Object.keys(tot).map(k => h("div", { dataset: { strand: k } }, h("div.row.sp.small", h("span.strand", STRANDS[k].label), h("span.muted", `${Math.round(tot[k] / all * 100)}% · ${fmtMin(tot[k])}`)), bar(tot[k] / all, STRANDS[k].color))))),
    h("h2", { style: { marginTop: "22px" } }, "Is A1 solid?"),
    h("div.card", std, h("div.row", { style: { marginTop: "10px" } }, h("span.small.muted", "Rate a lesson by ear, book closed:"), lsel, lpct, h("button.btn", { onclick: () => { const v = +lpct.value; if (!lpct.value || v < 0 || v > 100) return; S.lessons[+lsel.value] = S.lessons[+lsel.value] || { steps: {} }; S.lessons[+lsel.value].listen = v; save(); toast("Saved"); render(); } }, "Save"))),
    h("div.card", { style: { marginTop: "14px" } }, h("h3", "Vocabulary size (Nation’s yes/no test)"), h("p.small.muted", "Take the French 2000-word yes/no test at lextutor before you start (week 0) and again at week 8; the two scores show your growth. Be honest: the test penalises false ‘yes’ answers."),
      h("div.row", h("a.btn", { href: "https://www.lextutor.ca/tests/", target: "_blank", rel: "noopener" }, "Open lextutor tests ↗"), vk, vs, h("button.btn.primary", { onclick: () => { if (!vs.value) return; S.vocab.push({ label: vk.value, date: ymd(), score: +vs.value }); save(); vs.value = ""; dv(); } }, "Log score")), vlist),
    h("div.card", { style: { marginTop: "14px" } }, h("h3", "Mock exams (DELF A1 format)"), h("p.small.muted", "Each skill is out of 25; 50 total passes (no skill below 5). Your ‘solid’ bar is 75 total and 17+ in every skill. Use the official sample papers on the France Éducation International site."),
      h("div.row", { style: { alignItems: "flex-end" } }, kind, inputs, h("button.btn.primary", { onclick: () => { const m = { date: ymd(), kind: kind.value }; for (const p of DELF_PARTS) { const v = parseFloat(mockForm[p.k].value); m[p.k] = isNaN(v) ? 0 : v; } S.mocks.push(m); save(); drawMocks(); } }, "Log")), mockList));
});
