"use strict";
// ───────────── speech synthesis (browser French voice) ─────────────
let frVoice = null;
function pickVoice() {
  const vs = speechSynthesis.getVoices().filter(v => /^fr/i.test(v.lang));
  const pref = ["Thomas", "Amélie", "Google français", "Audrey", "Marie", "Daniel"];
  frVoice = pref.map(p => vs.find(v => v.name.includes(p))).find(Boolean) || vs.find(v => /fr[-_]FR/i.test(v.lang)) || vs[0] || null;
}
if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function speak(text, opt = {}) {
  if (!("speechSynthesis" in window)) { toast("This browser has no speech synthesis."); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(String(text).replace(/\{\{|\}\}/g, ""));
  u.lang = "fr-FR"; if (frVoice) u.voice = frVoice;
  u.rate = opt.rate || S.settings.ttsRate || 0.9;
  if (opt.onend) u.onend = opt.onend;
  speechSynthesis.speak(u);
}
function stopSpeak() { if ("speechSynthesis" in window) speechSynthesis.cancel(); }

// ───────────── beep (timer end, step done) ─────────────
let actx;
function beep(kind = "ok") {
  if (!S.settings.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const seq = kind === "end" ? [[660, 0], [880, .16], [1040, .32]] : kind === "tick" ? [[880, 0]] : [[523, 0], [784, .12]];
    seq.forEach(([f, t]) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.frequency.value = f; o.type = "sine"; o.connect(g); g.connect(actx.destination);
      const T = actx.currentTime + t; g.gain.setValueAtTime(0.0001, T); g.gain.exponentialRampToValueAtTime(0.18, T + .02); g.gain.exponentialRampToValueAtTime(0.0001, T + .22);
      o.start(T); o.stop(T + .25);
    });
  } catch (e) { }
}

// ───────────── lesson audio paths ─────────────
const lessonAudio = n => `assimil audio/L${String(n).padStart(3, "0")}-LESSON.mp3`.split("/").map(encodeURIComponent).join("/");
const fiAudio = u => u.split("/").map(encodeURIComponent).join("/");

// ───────────── audio player ─────────────
// opt: {gaps:[[s,e]…], pause:true (auto-pause at the long silences = sentence-by-sentence mode), speed, onPlay(count), onTick(sec)}
function audioPlayer(src, opt = {}) {
  const a = new Audio(src); a.preload = "metadata";
  let plays = 0, segIdx = 0, tickLast = 0, waiting = false;
  const gaps = (opt.gaps || []).filter(g => g[1] - g[0] >= (opt.minGap || 1.4) && g[0] > 3);
  const segStart = i => i === 0 ? 0 : gaps[i - 1][1] - 0.25;
  const speed = h("select", { onchange: () => { a.playbackRate = +speed.value; S.settings.speed = +speed.value; save(); } },
    [0.75, 0.9, 1, 1.1, 1.25, 1.5].map(v => h("option", { value: v, selected: v === (opt.speed || 1) }, v + "×")));
  a.playbackRate = opt.speed || 1;
  const play = h("button.btn.primary.big-play", { onclick: () => { if (a.paused) a.play(); else a.pause(); } }, "▶ Play");
  const seek = h("input", { type: "range", min: 0, max: 1000, value: 0, "aria-label": "Position", oninput: () => { a.currentTime = a.duration * seek.value / 1000; } });
  const time = h("span.mono.muted", "0:00");
  const info = h("div.player-info");
  const status = h("div.player-status");
  const root = h("div.player", h("div.player-row", play, seek, time, speed), status, info);
  const setPlay = () => { play.textContent = a.paused ? (waiting ? "▶ Next sentence" : "▶ Play") : "⏸ Pause"; };
  a.addEventListener("play", setPlay); a.addEventListener("pause", setPlay);
  a.addEventListener("ended", () => { plays++; if (opt.onPlay) opt.onPlay(plays); status.textContent = `Played ${plays}×`; a.currentTime = 0; seek.value = 0; setPlay(); });
  a.addEventListener("timeupdate", () => {
    if (a.duration) seek.value = a.currentTime / a.duration * 1000;
    time.textContent = `${fmtClock(a.currentTime)} / ${fmtClock(a.duration || 0)}`;
    if (!a.paused) { const dt = a.currentTime - tickLast; if (dt > 0 && dt < 1) { addListen(dt); } tickLast = a.currentTime; if (opt.onTick) opt.onTick(a.currentTime); } else tickLast = a.currentTime;
    if (opt.pause && !a.paused) {
      // stop at the beginning of the next long silence so the learner can repeat the sentence
      const i = gaps.findIndex(g => a.currentTime >= g[0] + 0.1 && a.currentTime < g[1] - 0.6);
      if (i >= 0 && i >= segIdx) {
        a.pause(); segIdx = i + 1; waiting = true; setPlay();
        status.textContent = `Sentence ${i + 1} of ${gaps.length}: say it aloud, then continue`;
        if (opt.onSegment) opt.onSegment(i, gaps.length);
      }
    }
  });
  a.addEventListener("play", () => { waiting = false; if (opt.pause) status.textContent = `Sentence ${Math.min(segIdx + 1, gaps.length)} of ${gaps.length}`; });
  const api = {
    el: root, audio: a, get plays() { return plays; },
    setSpeed(v) { a.playbackRate = v; speed.value = v; },
    replaySeg() { const i = Math.max(0, segIdx - 1); segIdx = i; a.currentTime = segStart(i); a.play(); },
    rewind(s) { a.currentTime = Math.max(0, a.currentTime - s); },
    stop() { a.pause(); },
    gaps,
  };
  if (opt.pause) {
    root.append(h("div.player-row.tight",
      h("button.btn", { onclick: () => api.replaySeg() }, "↺ Repeat this sentence"),
      h("button.btn", { onclick: () => api.rewind(5) }, "⏪ 5 s"),
      h("span.muted.small", "Space = play/pause")));
  } else root.append(h("div.player-row.tight", h("button.btn", { onclick: () => api.rewind(5) }, "⏪ 5 s"), h("button.btn", { onclick: () => { a.currentTime = Math.min(a.duration, a.currentTime + 10); } }, "10 s ⏩")));
  return api;
}

// ───────────── recordings (IndexedDB) ─────────────
const idb = new Promise(res => {
  try { const r = indexedDB.open("ff-rec", 1); r.onupgradeneeded = () => r.result.createObjectStore("rec"); r.onsuccess = () => res(r.result); r.onerror = () => res(null); } catch (e) { res(null); }
});
async function recPut(key, blob) { const d = await idb; if (!d) return; return new Promise(r => { const t = d.transaction("rec", "readwrite"); t.objectStore("rec").put(blob, key); t.oncomplete = () => r(true); t.onerror = () => r(false); }); }
async function recGet(key) { const d = await idb; if (!d) return null; return new Promise(r => { const q = d.transaction("rec").objectStore("rec").get(key); q.onsuccess = () => r(q.result || null); q.onerror = () => r(null); }); }

// recorder widget: {key} stores the last take in IndexedDB; returns element + api
function recorder(key, opt = {}) {
  let mr, chunks = [], stream, t0 = 0, tick;
  const status = h("span.muted.small", "Not recording");
  const audio = h("audio", { controls: true, style: { display: "none", height: "34px" } });
  const btn = h("button.btn.rec", { onclick: toggle }, "● Record");
  async function toggle() {
    if (mr && mr.state === "recording") { mr.stop(); return; }
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { toast("Microphone not available (allow it in the browser, or use your phone's recorder)."); return; }
    chunks = []; mr = new MediaRecorder(stream);
    mr.ondataavailable = e => chunks.push(e.data);
    mr.onstop = async () => {
      clearInterval(tick); stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunks, { type: mr.mimeType || "audio/webm" });
      audio.src = URL.createObjectURL(blob); audio.style.display = ""; btn.textContent = "● Record again"; btn.classList.remove("on");
      status.textContent = `Saved ${fmtClock((Date.now() - t0) / 1000)}`;
      if (key) recPut(key, blob);
      if (opt.onDone) opt.onDone(blob, (Date.now() - t0) / 1000);
    };
    mr.start(); t0 = Date.now(); btn.textContent = "■ Stop"; btn.classList.add("on");
    tick = setInterval(() => { status.textContent = "Recording " + fmtClock((Date.now() - t0) / 1000); }, 500);
    if (opt.onStart) opt.onStart();
  }
  if (key) recGet(key).then(b => { if (b) { audio.src = URL.createObjectURL(b); audio.style.display = ""; btn.textContent = "● Record again"; status.textContent = "Last take kept"; } });
  return { el: h("div.recorder", btn, status, audio), stop() { if (mr && mr.state === "recording") mr.stop(); } };
}

// ───────────── countdown / stopwatch ─────────────
// countdown(sec, {onEnd, onTick}) → {el, start, pause, reset, add(sec), left}
function countdown(sec, opt = {}) {
  let left = sec, run = false, iv, endAt;
  const disp = h("div.cd" + (opt.big ? ".big" : ""), fmtClock(left));
  const btn = h("button.btn", { onclick: () => run ? api.pause() : api.start() }, "▶ Start");
  const upd = () => { disp.textContent = fmtClock(left); disp.classList.toggle("low", left <= 10 && run); if (opt.onTick) opt.onTick(left); };
  const api = {
    el: h("div.cd-wrap", disp, opt.noButton ? null : btn),
    get left() { return left; }, get running() { return run; },
    start() { if (run) return; run = true; endAt = Date.now() + left * 1000; btn.textContent = "⏸ Pause"; iv = setInterval(() => { left = Math.max(0, (endAt - Date.now()) / 1000); upd(); if (left <= 0) { api.pause(); beep("end"); if (opt.onEnd) opt.onEnd(); } }, 250); upd(); if (opt.onStart) opt.onStart(); },
    pause() { run = false; clearInterval(iv); btn.textContent = left <= 0 ? "▶ Again" : "▶ Resume"; upd(); },
    reset(s) { api.pause(); left = s ?? sec; btn.textContent = "▶ Start"; upd(); },
    add(s) { left += s; if (run) endAt += s * 1000; upd(); },
    destroy() { clearInterval(iv); },
  };
  return api;
}
function stopwatch() {
  let t0 = 0, acc = 0, run = false, iv;
  const disp = h("div.cd", "0:00");
  const btn = h("button.btn", { onclick: () => run ? api.stop() : api.start() }, "▶ Start");
  const api = {
    el: h("div.cd-wrap", disp, btn),
    get secs() { return acc + (run ? (Date.now() - t0) / 1000 : 0); },
    start() { run = true; t0 = Date.now(); btn.textContent = "■ Stop"; iv = setInterval(() => { disp.textContent = fmtClock(api.secs); }, 250); },
    stop() { acc = api.secs; run = false; clearInterval(iv); btn.textContent = "▶ Again"; disp.textContent = fmtClock(acc); if (api.onStop) api.onStop(acc); },
    reset() { acc = 0; run = false; clearInterval(iv); disp.textContent = "0:00"; btn.textContent = "▶ Start"; },
  };
  return api;
}
