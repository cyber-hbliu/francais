"use strict";
function applyTheme() {
  const t = S.settings.theme;
  if (t === "auto") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", t);
}
applyTheme();
$("#park").addEventListener("click", openPark);
document.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "p" && !e.metaKey && !e.ctrlKey && !e.altKey && !e.target.matches("input,textarea,select") && !$(".overlay")) { e.preventDefault(); openPark(); }
});
if (!window.LESSONS) document.body.prepend(h("div.card", { style: { margin: "20px" } }, h("b", "Lesson data is missing."), " Run: node tools/build-data.js …"));
render();
