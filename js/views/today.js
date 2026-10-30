"use strict";
route(/^\/$/, main => {
  const n = currentLesson(), t = ymd(), d = S.days[t];
  const doneToday = d && d.lessons.length > 0;
  if (n > NL) { const m = wave2Next(); main.append(h("div.hero", h("h1", m > NL ? "Second wave complete 🎉" : "Lesson 100 done 🎉"), h("p", m > NL ? "You have been through the whole book twice. Keep the cards and the weekly writing going." : `The book now sends you back to lesson ${WAVE2_START} for the second wave of the second half. One lesson a day, English → French, aloud and on paper.`), m <= NL ? h("a.btn.primary.big", { href: `#/wave/${m}` }, `▶ Second wave: lesson ${m} — ${lessonTitle(m)}`) : null)); return; }
  const Lx = L(n), steps = buildSteps(n), wk = weekInfo(weekOf(n)), sched = scheduledLesson();
  const resume = S.session && S.session.n === n;
  const c = counts(n), rev = isReviewDay(n);
  const hour = new Date().getHours(), greet = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const rec = S.lessons[n] || { steps: {} };

  const hero = h("div.hero",
    h("div.row.sp", h("span.pill", fmtDay(t)), h("span.pill", `Week ${weekOf(n)} · ${rev ? "review day" : "lesson day"}`)),
    h("h1", { style: { marginTop: "10px" } }, doneToday ? "Today is done ✓" : `${greet}!`),
    h("p", { style: { fontSize: "1.1rem" } }, doneToday ? "You already finished a lesson today. Rest, or take a bonus." : h("span", "Today: ", h("b", `Lesson ${n}`), Lx ? ` — ${Lx.title}` : "", h("span.muted", `   (${totalMin(steps)} min in four blocks)`))),
    h("div.row", { style: { marginTop: "10px" } },
      h("a.btn.primary.big", { href: `#/session/${n}` }, doneToday ? `Start lesson ${n} anyway` : resume ? `▶ Resume (step ${S.session.i + 1})` : "▶ Start today"),
      !doneToday ? h("a.btn.big", { href: `#/session/${n}/lite`, title: "Listen twice, cards, say 3 lines" }, "Low-energy day · 15 min") : null),
    h("p.small.muted", { style: { marginTop: "10px" } }, "Not feeling it? Just press start and give it five minutes. The first step is only listening."));

  // today's four blocks
  const byS = {}; steps.forEach(s => (byS[s.strand] = byS[s.strand] || []).push(s));
  const blocks = h("div.blocks", ["input", "focus", "output", "fluency"].filter(k => byS[k]).map(k => h("div.blk", { dataset: { strand: k } },
    h("b", STRANDS[k].ico + " " + STRANDS[k].label), h("span.muted.small", `${byS[k].reduce((a, s) => a + s.min, 0)} min`),
    h("ul", byS[k].map(s => h("li" + (rec.steps[s.id] ? ".done" : ""), s.title))))));

  // week strip
  const mon = mondayOf(t);
  const strip = h("div.week-strip", ["M", "T", "W", "T", "F", "S", "S"].map((l, i) => { const ds = addDays(mon, i), r = S.days[ds]; return h("span", { class: (r && r.sessions ? "on" : r && r.lite ? "lite" : "") + (ds === t ? " now" : ""), title: ds }, l); }));
  const ws = weekStats(mon), tg = weekTargets();
  const diff = sched ? n - sched : 0;
  const pace = !sched ? `Your plan starts on ${fmtDate(S.start, { weekday: "long", day: "numeric", month: "long" })}. You can already begin early.` : diff === 0 ? "Right on schedule." : diff > 0 ? `${diff} lesson${diff > 1 ? "s" : ""} ahead of the calendar.` : `${-diff} lesson${diff < -1 ? "s" : ""} behind the calendar. That’s fine: the plan shifts with you, one lesson per day from here.`;

  // weak lines from the last retell
  const prev = S.lessons[n - 1], weak = prev && prev.retell && L(n - 1) ? L(n - 1).dialogue.filter(x => prev.retell[x.i] === 0).slice(0, 3) : [];

  main.append(hero, blocks,
    h("div.grid.g2", { style: { marginTop: "16px" } },
      h("div.card", h("div.row.sp", h("h3", "This week"), h("span.muted.small", `${ws.active} of 6 days`)), strip,
        h("div.stack", { style: { marginTop: "14px" } }, [["New cards", ws.cards, tg.cards], ["Lessons", ws.lessons, tg.lessons], ["Listening min", ws.listen, tg.listen]].map(([l, v, t2]) => h("div", h("div.row.sp.small", h("span", l), h("span.muted", `${v} / ${t2}`)), bar(v / t2)))),
        h("p.small.muted", { style: { marginTop: "12px" } }, pace)),
      h("div.card", h("h3", "Cards"), h("div.row", ring(Math.min(1, newToday() / S.settings.newPerDay), 72, `${newToday()}/${S.settings.newPerDay}`, "var(--c-focus)"), h("div", h("div", h("b", c.due), " due"), h("div", h("b", c.newAvail), " new ready"), h("div.small.muted", `${learned()} learned`))),
        h("a.btn", { href: "#/cards", style: { marginTop: "12px" } }, "Just do cards"))),
    (n <= 2 && !(S.vocab || []).length) || (weekOf(n) === 8 && !(S.vocab || []).some(v => v.label === "Week 8")) ? h("div.card.tint", { style: { marginTop: "14px" } }, h("b", "Vocabulary test due. "), "Do the lextutor French 2000-word yes/no test (week 0 and week 8) and log it in ", h("a", { href: "#/progress" }, "Progress"), ".") : null,
    n >= 50 ? h("div.card.tint", { style: { marginTop: "14px" } }, h("b", "Lessons are longer now. "), "Running out of time? Cut Français interactif first. Never cut the Assimil audio.") : null,
    h("div.card", { style: { marginTop: "14px" } }, h("h3", `Week ${wk.w} focus`), h("p.small", h("b", "Grammar: "), wk.grammar), h("p.small", h("b", "Output: "), wk.output), wk.fiName ? h("p.small.muted", "Français interactif: chapitre " + wk.fiName) : null),
    weak.length ? h("div.card.tint", { style: { marginTop: "14px" } }, h("h3", "Warm-up from yesterday"), h("p.small.muted", "You missed these lines. Read them aloud once:"), weak.map(x => h("div.fr", x.fr, " ", sayBtn(x.fr)))) : null,
    S.parking.filter(p => !p.done).length ? h("div.card.flat", { style: { marginTop: "14px" } }, h("div.row.sp", h("span", `💭 ${S.parking.filter(p => !p.done).length} parked thought(s)`), h("a.btn", { href: "#/settings" }, "Review")), ) : null);
});

// ───────────── parking lot: capture a distracting thought without leaving the task ─────────────
function openPark() {
  const ta = h("textarea", { rows: 3, placeholder: "What popped into your head? Write it here and get back to French." });
  const m = modal("Park a thought 💭", [h("p.small.muted", "Out of your head, onto the list. You’ll see it after the session."), ta], [{ label: "Park it", primary: true, fn: () => { if (ta.value.trim()) { S.parking.push({ t: Date.now(), text: ta.value.trim(), done: false }); save(); toast("Parked. Back to French 💪"); } } }]);
  setTimeout(() => ta.focus(), 50);
}
