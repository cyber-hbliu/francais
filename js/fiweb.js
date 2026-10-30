"use strict";
// ───────────── Tex's French Grammar, inside the app: short explanation, the Tex dialogue and its recording ─────────────
const texFor = ch => (window.FI_TEX_CH || {})[ch] || [];
// a slice of a list for lesson-day k (0–5) of the week; the review day gets everything
const daySlice = (list, k, all) => {
  if (all || !list.length) return list;
  const part = list.slice(Math.floor(k * list.length / 6), Math.floor((k + 1) * list.length / 6));
  return part.length ? part : [list[k % list.length]];
};
// **bold** from the source pages → <b>
const texInline = t => t.split(/\*\*/).map((x, i) => i % 2 ? h("b", x) : x);
const texPlain = t => t.replace(/\*\*/g, "").trim();

function texPage(slug, players) {
  const p = (window.FI_TEX || {})[slug];
  if (!p) return h("p.muted.small", "This grammar page is missing.");
  return h("div.tex", p.b.map(b => {
    if (b.k === "h") return h("h4", texPlain(b.t));
    if (b.k === "p") return h("p", texInline(b.t));
    if (b.k === "li") return h("p.li", "• ", texInline(b.t));
    if (b.k === "img") return h("img.tex-img", { src: fiAudio(b.u), alt: "", loading: "lazy", width: b.w || null });
    if (b.k === "audio") { const pl = audioPlayer(fiAudio(b.u)); players.push(pl); return h("div.tex-audio", pl.el); }
    if (b.k === "tbl") return h("table.tex-tbl", b.cap ? h("caption", texPlain(b.cap)) : null, b.rows.map(r => h("tr", r.map(c => h("td", { colspan: r.length === 1 ? 2 : null }, texInline(c))))));
    if (b.k === "dlg") return h("table.dlg", b.rows.map(r => h("tr", h("td.fr", texInline(r[0] || "")), h("td.muted", texInline(r[1] || "")),
      h("td", h("button.icon", { title: "Add to my cards", onclick: () => addCustomCard({ fr: texPlain(r[0] || "").replace(/^[\wÀ-ÿ -]+:\s*/, ""), en: texPlain(r[1] || "").replace(/^[\wÀ-ÿ -]+:\s*/, ""), src: "fi" }) }, "☆")))));
    return null;
  }), h("p.small.muted", "From ", h("a", { href: p.u, target: "_blank", rel: "noopener" }, "Tex’s French Grammar ↗"), " (CC BY 4.0)."));
}
// grammar points as buttons, one page shown at a time
function texPicker(list) {
  const players = [], box = h("div"), bar = h("div.vlist");
  if (!list.length) return { el: h("p.muted.small", "No Tex grammar for this chapter."), stop() {} };
  const pick = i => { players.splice(0).forEach(p => p.stop()); clear(box).append(h("h3", (list[i].n ? list[i].n + " " : "") + list[i].t), texPage(list[i].s, players)); $$("button", bar).forEach((b, j) => b.classList.toggle("on", i === j)); };
  list.forEach((g, i) => bar.append(h("button.chip", { onclick: () => pick(i) }, (g.n ? g.n + " " : "") + g.t)));
  pick(0);
  return { el: h("div.stack", list.length > 1 ? bar : null, box), stop: () => players.forEach(p => p.stop()) };
}
