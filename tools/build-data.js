#!/usr/bin/env node
// Merges the cleaned JSON (lessons, phrasebook) with the audio pause points and the Français interactif lists into data/*.js
// usage: node tools/build-data.js <clean-dir> <gaps.json> <fi_data.js> <fi_pho.js>
const fs = require("fs"), path = require("path");
const [clean, gapsFile, fiData, fiPho] = process.argv.slice(2);
const out = path.join(__dirname, "..", "data"); fs.mkdirSync(out, { recursive: true });
const AS_PAGES = [[1,4],[3,8],[7,10],[9,14],[13,16],[17,20],[19,24],[25,28],[29,32],[31,34],[35,38],[37,42],[41,46],[45,50],[51,54],[55,60],[59,64],[63,70],[69,74],[73,78],[79,84],[85,90],[89,96],[95,100],[99,106],[105,110],[109,116],[115,122],[123,128],[127,132],[133,138],[137,144],[143,148],[149,154],[153,162],[161,168],[167,174],[173,180],[179,186],[187,192],[193,200],[199,206],[207,214],[213,220],[219,226],[225,232],[231,238],[239,246],[245,254],[255,262],[261,268],[267,274],[275,280],[281,288],[287,294],[293,302],[301,308],[307,314],[315,322],[323,330],[329,338],[337,344],[343,352],[353,360],[359,366],[367,374],[373,380],[381,388],[387,394],[395,404],[403,410],[411,418],[417,424],[425,432],[431,440],[439,446],[445,456],[455,462],[463,470],[469,476],[477,484],[485,492],[491,498],[499,508],[509,516],[515,524],[523,532],[531,540],[539,546],[545,554],[553,564],[563,572],[571,578],[579,586],[585,594],[593,602],[601,610],[609,620],[621,628],[627,634]];
const gaps = JSON.parse(fs.readFileSync(gapsFile));
const strip = s => String(s || "").replace(/\[|\]/g, "").replace(/\s+/g, " ").trim();
const report = { missing: [], warn: [] };

// ── lessons
const lessons = [null], seen = new Set();
for (let n = 1; n <= 100; n++) {
  const f = path.join(clean, `lesson_${String(n).padStart(3, "0")}.json`);
  if (!fs.existsSync(f)) { report.missing.push(n); lessons.push(null); continue; }
  let L; try { L = JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { report.warn.push(`L${n}: invalid JSON`); lessons.push(null); continue; }
  L.n = n; L.kind = n % 7 === 0 ? "revision" : "lesson";
  L.dialogue = (L.dialogue || []).map(d => ({ i: d.i, dash: !!d.dash, fr: String(d.fr || "").trim(), en: strip(d.en), lit: strip(d.lit) }));
  L.pdfPage = AS_PAGES[n - 1][0] + 16;
  L.gaps = (gaps[n] && gaps[n].gaps) || []; L.dur = (gaps[n] && gaps[n].dur) || 0;
  // cards: must belong to the lesson, de-duplicated across lessons (first occurrence wins)
  const text = norm(L.dialogue.map(d => d.fr).join(" ") + " " + (L.notes || []).map(x => x.text).join(" ") + " " + JSON.stringify(L.exercise2 || {}) + JSON.stringify(L.exercise1 || {}));
  L.cards = (L.cards || []).filter(c => {
    if (!c.fr || !c.en) return false;
    const key = norm(c.fr); if (seen.has(key)) return false;
    const core = key.replace(/^(un|une|le|la|l'|les|des|du|de la)\s+/, "").replace(/\s*\((m|f)\)$/, "");
    const first = core.split(" ")[0];
    if (!text.includes(core) && !text.includes(first)) report.warn.push(`L${n}: card not in lesson text: ${c.fr}`);
    seen.add(key); return true;
  }).map(c => ({ fr: c.fr, en: c.en, zh: c.zh || "", pos: c.pos || "", g: c.g || "", cog: c.cog || "", ff: c.ff || "", cluster: c.cluster || "", kw: c.kw || "", ex: c.ex || "", exEn: strip(c.exEn), src: c.src || 0 }));
  if (L.cards.length < 6 && L.kind === "lesson") report.warn.push(`L${n}: only ${L.cards.length} cards`);
  if (!L.dialogue.length) report.warn.push(`L${n}: no dialogue`);
  lessons.push(L);
}
function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, "'").replace(/œ/g, "oe").replace(/\s+/g, " ").trim(); }
fs.writeFileSync(path.join(out, "lessons.js"), "// Assimil French With Ease (2020) – cleaned from your own PDF. Private study copy; do not publish.\nwindow.LESSONS = " + JSON.stringify(lessons) + ";\n");

// ── phrasebook
const P = { days: [], sections: [] };
const rd = f => { const p = path.join(clean, f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : (report.missing.push(f), []); };
P.days = rd("phrase_days.json");
for (const f of ["phrase_sec2a.json", "phrase_sec2b.json", "phrase_sec2c.json"]) P.sections.push(...rd(f));
fs.writeFileSync(path.join(out, "phrase.js"), "// Assimil French Phrasebook (2013) – cleaned from your own PDF. Private study copy.\nwindow.PHRASE = " + JSON.stringify(P) + ";\n");

// ── Français interactif (UT Austin, COERLL/LAITS, CC BY 3.0): word lists, listening exercises, pronunciation lessons; recordings in "utexas audio/fi"
global.window = {}; require(path.resolve(fiData)); require(path.resolve(fiPho));
const re = u => u.replace(/^audio\/fi\//, "utexas audio/fi/");
const FI_VOC = window.FI_VOC.map(v => ({ ...v, audio: v.audio ? re(v.audio) : "" }));
const FI_LISTEN = window.FI_LISTEN.map(x => ({ ...x, u: re(x.u) }));
const FI_PHO = window.FI_PHO.map(p => ({ ...p, items: p.items.map(i => ({ ...i, u: i.u ? re(i.u) : "" })) }));
fs.writeFileSync(path.join(out, "fi.js"), "// Français interactif (University of Texas at Austin, COERLL/LAITS), CC BY 3.0 – https://www.laits.utexas.edu/fi/\nwindow.FI_VOC=" + JSON.stringify(FI_VOC) + ";\nwindow.FI_LISTEN=" + JSON.stringify(FI_LISTEN) + ";\nwindow.FI_PHO=" + JSON.stringify(FI_PHO) + ";\n");

console.log("lessons built:", lessons.filter(Boolean).length, "cards:", lessons.filter(Boolean).reduce((a, l) => a + l.cards.length, 0));
console.log("phrasebook days:", P.days.length, "groups:", P.sections.length);
console.log("missing:", report.missing.join(", ") || "none");
console.log(report.warn.slice(0, 80).join("\n"));
