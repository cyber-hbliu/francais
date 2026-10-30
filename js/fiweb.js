"use strict";
// ───────────── Français interactif online material, embedded: YouTube videos, Tex grammar pages, testez-vous quizzes ─────────────
const fiWeb = ch => (window.FI_WEB || {})[ch] || { voc: [], intfr: [], intusa: [], gram: [], act: [], song: [], pdf: {} };
const fiVideos = w => [w.intro, ...w.voc, ...w.intfr, ...w.intusa].filter(Boolean);
const ytEmbed = id => `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&hl=fr&cc_lang_pref=fr`;
// a slice of a list for lesson-day k (0–5) of the week; the review day gets everything
const daySlice = (list, k, all) => {
  if (all || !list.length) return list;
  const part = list.slice(Math.floor(k * list.length / 6), Math.floor((k + 1) * list.length / 6));
  return part.length ? part : [list[k % list.length]];
};

function videoLabel(v) { return (v.g ? v.g + " · " : "") + v.t.replace(/^Chapitre \d+,?\s*/, ""); }
// one player, a row of buttons to switch video
function videoPicker(list) {
  if (!list.length) return h("p.muted.small", "No videos for this part.");
  const frame = h("iframe.vframe", { allow: "encrypted-media; picture-in-picture; fullscreen", allowfullscreen: true, referrerpolicy: "strict-origin-when-cross-origin", title: "Français interactif video" });
  const cap = h("div.small.muted"), bar = h("div.vlist");
  const pick = i => { frame.src = ytEmbed(list[i].y); cap.textContent = `${i + 1} / ${list.length} · ${videoLabel(list[i])}`; $$("button", bar).forEach((b, j) => b.classList.toggle("on", i === j)); };
  list.forEach((v, i) => bar.append(h("button.chip", { onclick: () => pick(i) }, videoLabel(v))));
  pick(0);
  return h("div.stack", frame, cap, list.length > 1 ? bar : null);
}
// an outside page shown inside the app, with a way out if it misbehaves
function framePane(url, title, { tall = false } = {}) {
  return h("div.stack", h("iframe.pframe" + (tall ? ".tall" : ""), { src: url, title, loading: "lazy", referrerpolicy: "no-referrer-when-downgrade" }),
    h("div.small.muted", h("a", { href: url, target: "_blank", rel: "noopener" }, "Open in a new tab ↗"), " if the page doesn’t show here."));
}
// Tex grammar points as tabs, one embedded page at a time
function gramPicker(list) {
  if (!list.length) return h("p.muted.small", "No Tex grammar pages for this chapter.");
  const box = h("div"), bar = h("div.vlist");
  const pick = i => { clear(box).append(h("h3", (list[i].n ? list[i].n + " " : "") + list[i].t), framePane(list[i].u, "Tex grammar: " + list[i].t, { tall: true })); $$("button", bar).forEach((b, j) => b.classList.toggle("on", i === j)); };
  list.forEach((g, i) => bar.append(h("button.chip", { onclick: () => pick(i) }, (g.n ? g.n + " " : "") + g.t)));
  pick(0);
  return h("div.stack", list.length > 1 ? bar : null, box);
}
