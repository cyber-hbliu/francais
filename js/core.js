"use strict";
// ───────────── tiny DOM helper: h("div.card#x", {onclick}, child, …) ─────────────
function h(spec, attrs, ...kids) {
  const m = /^([a-z0-9]*)((?:[.#][\w-]+)*)$/i.exec(spec) || [];
  const el = document.createElement(m[1] || "div");
  (m[2] || "").replace(/([.#])([\w-]+)/g, (_, t, v) => { if (t === ".") el.classList.add(v); else el.id = v; });
  if (attrs != null && (typeof attrs !== "object" || attrs.nodeType || Array.isArray(attrs))) { kids.unshift(attrs); attrs = null; }
  for (const k in attrs || {}) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "dataset") Object.assign(el.dataset, v);
    else if (k === "style" && typeof v === "object") { for (const p in v) p.startsWith("--") ? el.style.setProperty(p, v[p]) : (el.style[p] = v[p]); }
    else if (k === "html") el.innerHTML = v;
    else if (k === "class") v.split(" ").forEach(c => c && el.classList.add(c));
    else if (k in el && k !== "list" && k !== "type") el[k] = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  const add = c => { if (c == null || c === false) return; if (Array.isArray(c)) c.forEach(add); else el.append(c.nodeType ? c : document.createTextNode(c)); };
  kids.forEach(add);
  return el;
}
// append() that accepts arrays and skips null/false, like h() children
(() => { const orig = Element.prototype.append; Element.prototype.append = function (...a) { return orig.apply(this, a.flat(Infinity).filter(x => x != null && x !== false)); }; })();
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clear = el => { while (el.firstChild) el.removeChild(el.firstChild); return el; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, "'").replace(/œ/g, "oe").replace(/\s+/g, " ").trim();
const wordCount = s => (String(s).match(/[\p{L}\p{N}’'-]+/gu) || []).length;
const fmtMin = sec => { const m = Math.round(sec / 60); return m >= 60 ? `${(m / 60) | 0} h ${m % 60} min` : `${m} min`; };
const fmtClock = sec => { sec = Math.max(0, Math.round(sec)); return `${(sec / 60) | 0}:${String(sec % 60).padStart(2, "0")}`; };

// ───────────── dates (local) ─────────────
const ymd = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseYmd = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const dayNum = (s = ymd()) => Math.round((Date.UTC(...s.split("-").map((v, i) => i === 1 ? v - 1 : +v))) / 864e5);
const dayStr = n => { const d = new Date(n * 864e5); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`; };
const addDays = (s, k) => dayStr(dayNum(s) + k);
const mondayOf = s => { const d = parseYmd(s); const k = (d.getDay() + 6) % 7; return addDays(s, -k); };
const fmtDate = (s, o = { month: "short", day: "numeric" }) => parseYmd(s).toLocaleDateString("en-GB", o);
const fmtDay = s => parseYmd(s).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

// ───────────── state ─────────────
const KEY = "ff.v1";
const defaults = () => ({
  v: 1,
  start: "2026-11-02",                       // Monday of week 1 (changeable in Settings)
  settings: { newPerDay: 15, theme: "auto", sound: true, speed: 1, ttsRate: 0.9, autoSpeak: true },
  lessons: {},                               // n → {done: ymd, lite: bool, steps: {id: true}, retell: {i: 0|1|2}, listen: 0-100}
  cards: {},                                 // id → SRS state
  custom: [],                                // user-added cards (from phrasebook / FI / by hand)
  days: {},                                  // ymd → {sec: {input, focus, output, fluency}, listen, newCards, reviews, lessons: [n], sessions, lite}
  writing: [],                               // {id, date, lesson, kind, text, words, secs, corrected, fixes}
  reads: [],                                 // {date, lesson, secs, words}
  mocks: [],                                 // {date, kind, listening, reading, writing, speaking}
  parking: [],                               // {t, text, done}
  scripts: {},                               // user's own scripts (self-intro …)
  checks: {},                                // acceptance checklist ticks
  session: null,                             // resumable session {n, mode, i, t0}
});
function merge(base, add) { if (!add || typeof add !== "object") return base; for (const k in add) base[k] = (base[k] && typeof base[k] === "object" && !Array.isArray(base[k]) && add[k] && typeof add[k] === "object") ? merge(base[k], add[k]) : add[k]; return base; }
let S;
try { S = merge(defaults(), JSON.parse(localStorage.getItem(KEY) || "null")); } catch (e) { S = defaults(); }
let saveT;
function save() { clearTimeout(saveT); saveT = setTimeout(flush, 120); }
function flush() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { console.warn("save failed", e); } }
addEventListener("pagehide", flush);
document.addEventListener("visibilitychange", () => { if (document.hidden) flush(); });

function dayRec(date = ymd()) { return S.days[date] || (S.days[date] = { sec: { input: 0, focus: 0, output: 0, fluency: 0 }, listen: 0, newCards: 0, reviews: 0, lessons: [], sessions: 0, lite: 0, words: 0 }); }
function addSec(strand, sec) { if (!(sec > 0)) return; dayRec().sec[strand] = (dayRec().sec[strand] || 0) + sec; save(); }
function addListen(sec) { dayRec().listen += sec; }

// ───────────── router ─────────────
const routes = [];
const route = (re, fn) => routes.push([re, fn]);
let cleanup = null;
const onLeave = fn => { cleanup = fn; };
function render() {
  const path = location.hash.replace(/^#/, "") || "/";
  if (cleanup) { try { cleanup(); } catch (e) { } cleanup = null; }
  const main = $("#main");
  for (const [re, fn] of routes) {
    const m = re.exec(path);
    if (m) {
      clear(main); main.scrollTop = 0; scrollTo(0, 0);
      document.body.classList.toggle("focus", /^\/session/.test(path));
      $$("#nav a").forEach(a => a.classList.toggle("on", a.dataset.r && new RegExp(a.dataset.r).test(path)));
      try { fn(main, ...m.slice(1)); } catch (e) { console.error(e); main.append(h("pre.err", String(e.stack || e))); }
      return;
    }
  }
  main.append(h("p", "Page not found."));
}
addEventListener("hashchange", render);
const go = p => { if (location.hash === "#" + p) render(); else location.hash = p; };

// ───────────── small UI pieces ─────────────
function toast(msg, ms = 2200) {
  const t = h("div.toast", msg); document.body.append(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, ms);
}
function modal(title, body, actions = []) {
  const close = () => { ov.remove(); document.removeEventListener("keydown", esck); };
  const esck = e => { if (e.key === "Escape") close(); };
  const ov = h("div.overlay", { onclick: e => { if (e.target === ov) close(); } },
    h("div.modal", { role: "dialog" },
      h("div.modal-h", h("h3", title), h("button.icon", { onclick: close, "aria-label": "Close" }, "✕")),
      h("div.modal-b", body),
      actions.length ? h("div.modal-f", actions.map(a => h("button" + (a.primary ? ".btn.primary" : ".btn"), { onclick: () => { if (a.fn && a.fn() === false) return; close(); } }, a.label))) : null));
  document.body.append(ov); document.addEventListener("keydown", esck);
  return { close, el: ov };
}
const STRANDS = {
  input: { label: "Meaning input", short: "Input", zh: "意义输入", color: "var(--c-input)", ico: "👂" },
  focus: { label: "Language focus", short: "Focus", zh: "语言聚焦", color: "var(--c-focus)", ico: "🔎" },
  output: { label: "Meaning output", short: "Output", zh: "意义输出", color: "var(--c-output)", ico: "🗣" },
  fluency: { label: "Fluency", short: "Fluency", zh: "流利度", color: "var(--c-fluency)", ico: "⚡" },
};
function ring(pct, size = 64, label = "", color = "var(--accent)") {
  const r = size / 2 - 5, c = 2 * Math.PI * r, p = Math.max(0, Math.min(1, pct));
  const ns = "http://www.w3.org/2000/svg", s = document.createElementNS(ns, "svg");
  s.setAttribute("viewBox", `0 0 ${size} ${size}`); s.setAttribute("width", size); s.setAttribute("height", size); s.classList.add("ring");
  s.innerHTML = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--line)" stroke-width="5"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${c * p} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})"/><text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" font-size="${size / 4.2}" font-weight="700" fill="var(--text)">${esc(label)}</text>`;
  return s;
}
function bar(pct, color = "var(--accent)") { return h("div.bar", h("i", { style: { width: Math.round(Math.max(0, Math.min(1, pct)) * 100) + "%", background: color } })); }
const sayBtn = (text, cls = "") => h("button.icon.say" + (cls ? "." + cls : ""), { title: "Listen", "aria-label": "Listen", onclick: e => { e.stopPropagation(); speak(text); } }, "🔊");
