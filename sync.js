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

// ---- your own book recordings: not in the public site; read from your PRIVATE repo with a read-only audio token ----
const AUDIO_REPO = "cyber-hbliu/francais-audio", AUDIO_CACHE = "fr-book-audio";
const audioTok = () => { try { return localStorage.getItem("fr-audio-token"); } catch (e) { return null; } };
window.bookAudioFallback = async (el, path) => {
  el.onerror = null;
  // audio/comm/04.mp3 → comm/04.mp3 in the private repository (audio/gram and audio/voc likewise)
  const t = audioTok(), file = path.replace(/^audio\//, ""); if (!t) return;
  try {
    const cache = window.caches ? await caches.open(AUDIO_CACHE) : null, key = "https://audio.local/" + file;
    let r = cache && await cache.match(key);
    if (!r) {
      r = await fetch(`https://api.github.com/repos/${AUDIO_REPO}/contents/${file}`, { headers: { Authorization: "Bearer " + t, Accept: "application/vnd.github.raw" } });
      if (!r.ok) return; // no recording for this track yet
      if (cache) { await cache.put(key, r.clone()); }
    }
    el.src = URL.createObjectURL(await r.blob()); // downloaded once per device, then played offline
  } catch (e) { }
};
async function audioCheck() {
  const el = document.getElementById("audst"); if (!el) return;
  const t = audioTok(); if (!t) { el.textContent = "Pas de jeton audio sur cet appareil."; return; }
  try {
    let n = 0;
    for (const d of ["comm", "gram", "voc"]) {
      const r = await fetch(`https://api.github.com/repos/${AUDIO_REPO}/contents/${d}`, { headers: { Authorization: "Bearer " + t, Accept: "application/vnd.github+json" } });
      if (r.status === 404) { const root = await fetch(`https://api.github.com/repos/${AUDIO_REPO}`, { headers: { Authorization: "Bearer " + t } }); if (!root.ok) throw new Error("dépôt introuvable (lancez publier-audio.sh, et donnez au jeton l'accès à francais-audio)"); continue; }
      if (!r.ok) throw new Error("GitHub " + r.status);
      n += (await r.json()).filter(f => /\.mp3$/i.test(f.name)).length;
    }
    el.innerHTML = `✓ Accès au dépôt privé : ${n} fichier${n > 1 ? "s" : ""} audio.`;
  } catch (e) { el.innerHTML = `<span class="badc">Erreur : ${esc(e.message)}</span>`; }
}
function audioCard() {
  return `<div class="card" id="audcard"><h2>Audio du livre (dépôt privé)</h2>
   <p class="mut" style="margin-top:0">Vos enregistrements du livre sont dans le dépôt <b>privé</b> ${AUDIO_REPO}, jamais sur le site public. Chaque appareil les télécharge une fois, puis les garde.</p>
   <p id="audst" style="font-weight:600"></p>
   ${audioTok() ? `<div class="row"><button class="b s" onclick="audioOff()">Retirer le jeton audio</button></div>`
    : `<ol style="margin:8px 0 12px;padding-left:20px"><li>Créez un jeton « fine-grained » : <a target="_blank" rel="noopener" href="https://github.com/settings/personal-access-tokens/new">ouvrir la page GitHub</a>. Repository access : <b>Only select repositories</b> → francais-audio. Permissions → Contents : <b>Read-only</b>.</li>
       <li>Collez-le ici, sur chaque appareil (une seule fois).</li></ol>
      <div class="row"><input type="password" id="atok" placeholder="github_pat_…" autocomplete="off" style="flex:1;min-width:220px"><button class="b" onclick="audioOn()">Connecter</button></div>`}</div>`;
}
window.audioOn = () => { const v = (document.getElementById("atok").value || "").trim(); if (!v) return; localStorage.setItem("fr-audio-token", v); go("sync"); };
window.audioOff = async () => { localStorage.removeItem("fr-audio-token"); if (window.caches) await caches.delete(AUDIO_CACHE); go("sync"); };

const origRenderSync = renderSync;
renderSync = function () { origRenderSync(); view.insertAdjacentHTML("afterbegin", syncCard() + audioCard()); drawSyncStatus(); audioCheck(); };

if (SY.token) syncNow();
