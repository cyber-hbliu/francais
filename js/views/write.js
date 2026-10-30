"use strict";
function wordDiff(a, b) {
  const x = a.split(/(\s+)/).filter(s => s), y = b.split(/(\s+)/).filter(s => s), m = x.length, n = y.length;
  const dp = Array.from({ length: m + 1 }, () => new Int16Array(n + 1));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) dp[i][j] = x[i] === y[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = []; let i = 0, j = 0, fixes = 0;
  while (i < m && j < n) { if (x[i] === y[j]) { out.push(x[i]); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push(h("del", x[i])); fixes++; i++; } else { out.push(h("ins", y[j])); j++; } }
  while (i < m) { out.push(h("del", x[i++])); fixes++; } while (j < n) { out.push(h("ins", y[j++])); }
  return { nodes: out, fixes };
}
route(/^\/write$/, main => {
  const list = h("div");
  function draw() {
    clear(list);
    const items = [...S.writing].reverse();
    if (!items.length) list.append(h("p.muted", "Nothing yet. Writing from the daily session (and the Sunday 10-minute task) shows up here."));
    items.forEach(e => {
      const card = h("div.card", { style: { marginBottom: "12px" } },
        h("div.row.sp", h("div.row", h("b", fmtDate(e.date)), h("span.pill", e.kind === "free10" ? "10-min free" : "daily"), e.lesson ? h("span.pill", "L" + e.lesson) : null, h("span.muted.small", `${e.words} words`)),
          h("div.row", h("button.btn", { onclick: () => copyText(correctionPrompt(e.text, e.lesson)) }, "Copy for correction"), h("button.icon", { title: "Delete", onclick: () => { if (confirm("Delete this entry?")) { S.writing = S.writing.filter(x => x.id !== e.id); save(); draw(); } } }, "🗑"))),
        h("div.fr", { style: { whiteSpace: "pre-wrap", fontSize: "1.1rem", margin: "10px 0" } }, e.text));
      if (e.corrected) {
        const d = wordDiff(e.text, e.corrected);
        card.append(h("div.diff.fr", { style: { whiteSpace: "pre-wrap", fontSize: "1.1rem" } }, d.nodes), h("p.small.muted", `${d.fixes} change(s). Now rewrite it from memory:`),
          h("textarea", { rows: 4, placeholder: "Rewrite the corrected version without looking…" }));
      } else {
        const ta = h("textarea", { rows: 4, placeholder: "Paste the corrected version here…" });
        card.append(h("details", h("summary.small", "Paste corrected version"), ta, h("button.btn.primary", { style: { marginTop: "6px" }, onclick: () => { if (!ta.value.trim()) return; e.corrected = ta.value.trim(); e.fixes = wordDiff(e.text, e.corrected).fixes; save(); draw(); } }, "Compare")));
      }
      list.append(card);
    });
  }
  const ta = h("textarea", { rows: 5, placeholder: "Write anything in French (a diary line, a postcard, a form)…" });
  main.append(h("h1", "Writing"), h("p.muted", "Alone, the missing piece is someone who corrects you. Copy a text with the prompt, paste it into a chat with Claude, then paste the corrected version back here to see exactly what changed."),
    h("div.card", ta, h("div.row.sp", { style: { marginTop: "8px" } }, h("span.small.muted", "Free entry"), h("button.btn.primary", { onclick: () => { if (!ta.value.trim()) return; saveWriting({ kind: "free", text: ta.value }); ta.value = ""; draw(); } }, "Save entry"))),
    h("h2", { style: { marginTop: "22px" } }, "Your texts"), list);
  draw();
});
