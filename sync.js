"use strict";
// Automatic sync between devices through a private GitHub Gist in your own account.
// Each device keeps its progress in localStorage; on open, while studying and when leaving the page,
// it pulls the Gist, merges (merge() in app.js: newest card wins, sessions add up, time per device adds up) and pushes back.
// The token (gist scope only) stays in this device's localStorage and is never uploaded.

const GIST_DESC = "Boîte à outils française — progression (ne pas supprimer)", GIST_FILE = "progression.json";
const SY = { token: null, id: null, last: 0, busy: false, dirty: false, err: "" };
try { SY.token = localStorage.getItem("fr-gist-token"); SY.id = localStorage.getItem("fr-gist-id"); SY.last = +localStorage.getItem("fr-gist-last") || 0; } catch (e) { }
const gh = async (path, opt = {}) => {
  const r = await fetch("https://api.github.com" + path, Object.assign({}, opt, { headers: Object.assign({ Authorization: "Bearer " + SY.token, Accept: "application/vnd.github+json" }, opt.body ? { "Content-Type": "application/json" } : {}) }));
  if (!r.ok) throw new Error(r.status === 401 ? "jeton refusé (vérifiez qu'il a le droit « gist »)" : "GitHub " + r.status);
  return r.json();
};
async function findGist() {
  if (SY.id) return SY.id;
  for (let page = 1; page <= 5; page++) {
    const list = await gh(`/gists?per_page=100&page=${page}`);
    const g = list.find(x => x.description === GIST_DESC && x.files[GIST_FILE]); if (g) return SY.id = g.id;
    if (list.length < 100) break;
  }
  const g = await gh("/gists", { method: "POST", body: JSON.stringify({ description: GIST_DESC, public: false, files: { [GIST_FILE]: { content: JSON.stringify(S) } } }) });
  return SY.id = g.id;
}
async function pullRemote() {
  const g = await gh("/gists/" + SY.id), f = g.files[GIST_FILE];
  if (!f) return null;
  const txt = f.truncated ? await (await fetch(f.raw_url)).text() : f.content;
  try { return JSON.parse(txt); } catch (e) { return null; }
}
async function syncNow(quiet) {
  if (!SY.token || SY.busy) return;
  SY.busy = true; SY.err = ""; drawSyncStatus();
  try {
    await findGist(); localStorage.setItem("fr-gist-id", SY.id);
    const remote = await pullRemote(), before = JSON.stringify(S);
    if (remote && remote.cards) { merge(S, remote); origSave(); }
    await gh("/gists/" + SY.id, { method: "PATCH", body: JSON.stringify({ files: { [GIST_FILE]: { content: JSON.stringify(S) } } }) });
    SY.dirty = false; SY.last = Date.now(); localStorage.setItem("fr-gist-last", SY.last);
    // refresh the page if the other device brought something new (never in the middle of a block)
    if (JSON.stringify(S) !== before && !window.RUN_ACTIVE && !quiet) { if (window.schedule) schedule(); go(tab === "sync" ? "sync" : tab); }
  } catch (e) { SY.err = e.message; }
  SY.busy = false; drawSyncStatus();
}
window.syncNow = syncNow;
// every save marks the state dirty; push a few seconds later, at most every 20 s
const origSave = save;
let syncT = null;
save = function () { origSave(); if (!SY.token) return; SY.dirty = true; clearTimeout(syncT); syncT = setTimeout(() => syncNow(true), Date.now() - SY.last < 20e3 ? 20e3 : 4e3); };
document.addEventListener("visibilitychange", () => { if (!SY.token) return; if (document.visibilityState === "hidden" && SY.dirty) syncNow(true); if (document.visibilityState === "visible" && Date.now() - SY.last > 60e3) syncNow(); });
setInterval(() => { if (SY.token && SY.dirty) syncNow(true); }, 120e3);

const agoTxt = t => { if (!t) return "jamais"; const m = Math.round((Date.now() - t) / 6e4); return m < 1 ? "à l'instant" : m < 60 ? `il y a ${m} min` : new Date(t).toLocaleString("fr-FR"); };
function drawSyncStatus() {
  const el = document.getElementById("syncst"); if (!el) return;
  el.innerHTML = !SY.token ? "Pas encore connecté sur cet appareil." : SY.busy ? "Synchronisation…" : SY.err ? `<span class="badc">Erreur : ${esc(SY.err)}</span>` : `✓ Synchronisé ${agoTxt(SY.last)}`;
}
function syncCard() {
  return `<div class="card" id="synccard"><h2>Synchronisation automatique (téléphone ⇄ ordinateur)</h2>
   <p class="mut" style="margin-top:0">Votre progression est copiée dans un Gist <b>privé</b> de votre compte GitHub, puis fusionnée sur chaque appareil : à l'ouverture, pendant l'étude et quand vous quittez la page. Les enregistrements audio restent sur l'appareil qui les a faits.</p>
   <p id="syncst" style="font-weight:600"></p>
   ${SY.token ? `<div class="row"><button class="b" onclick="syncNow()">Synchroniser maintenant</button><button class="b s" onclick="syncOff()">Déconnecter cet appareil</button></div>`
    : `<ol style="margin:8px 0 12px;padding-left:20px"><li>Créez un jeton GitHub avec <b>uniquement</b> le droit « gist » : <a target="_blank" rel="noopener" href="https://github.com/settings/tokens/new?scopes=gist&description=Bo%C3%AEte%20%C3%A0%20outils%20fran%C3%A7aise">ouvrir la page GitHub</a> (choisissez une expiration, puis « Generate token »).</li>
       <li>Copiez le jeton et collez-le ici, sur chaque appareil (une seule fois).</li></ol>
      <div class="row"><input type="password" id="gtok" placeholder="ghp_…" autocomplete="off" style="flex:1;min-width:220px"><button class="b" onclick="syncOn()">Connecter</button></div>`}</div>`;
}
window.syncOn = async () => {
  const v = (document.getElementById("gtok").value || "").trim(); if (!v) return;
  SY.token = v; SY.id = null; localStorage.setItem("fr-gist-token", v); localStorage.removeItem("fr-gist-id");
  await syncNow(); go("sync");
};
window.syncOff = () => { ["fr-gist-token", "fr-gist-id", "fr-gist-last"].forEach(k => localStorage.removeItem(k)); SY.token = SY.id = null; SY.last = 0; go("sync"); };
const origRenderSync = renderSync;
renderSync = function () { origRenderSync(); view.insertAdjacentHTML("afterbegin", syncCard()); drawSyncStatus(); };

if (SY.token) syncNow();
