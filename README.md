# Français pas à pas

A personal study app for **Assimil French With Ease (2020)** + the **Assimil French Phrasebook** + **Français interactif** (UT Austin), built on Paul Nation's four strands and designed for an ADHD brain: one clear next action, short timed steps, breaks between blocks, no streak guilt.

## Run it

```bash
node serve.js          # then open http://127.0.0.1:8137
```

(or double-click `start.command`). The small server exists because the lesson audio needs HTTP range requests for the "repeat this sentence" feature. Everything else is plain HTML/JS; progress is stored in your browser (Settings → Export backup).

## What's inside

| Page | What it does |
|---|---|
| **Today** | One big button. Shows today's lesson, the four 30-minute blocks, the week strip, the cards due. "Low-energy day" = 15-minute version. |
| **Session** | Walks through the day one step at a time (listen ×2 closed book → with English → with French → FI → notes → sentence-by-sentence repeat → cards → exercises → retell → write → fluency re-listen → timed read-aloud → 3/2/1½ monologue with recording). Timer per step, break screens between blocks, resumable. |
| **Cards** | Spaced repetition on words taken from each lesson (verbs as short sentences, gender with the article, Chinese gloss, English cognate hint, false-friend warnings, optional keyword mnemonic). 15 new per day. Closed sets (days, months, colours, numbers, family…) are held back so no more than 2 per set per week enter, to avoid interference. ☆ on any phrasebook or FI item adds it. |
| **Lessons** | All 100 lessons: dialogue with audio, translation, notes, exercises 1–2 (interactive), cards, retell. Link to the PDF page for checking. |
| **Phrasebook** | The 21 mini-lessons and all situation sections, with voice, search, cover-the-English testing and drills. |
| **FI** | Français interactif word lists, listening exercises and pronunciation lessons with their recordings, by chapter (chapter of the week highlighted). |
| **Sounds** | Mandarin→French pronunciation priorities, minimal-pair listening quiz, cognate patterns and false friends, editable speaking scripts. |
| **Writing** | Your texts, "copy for correction" prompt, paste-back corrected version with a word diff. |
| **Progress** | Weekly curves (new cards, lessons, listening minutes, words written), four-strand balance, mock-exam log, the "solid A1" checklist. |
| **Plan** | Your 8-week table, shifting with the lesson you're on. |

Keyboard: `Space` reveal/play, `1–4` rate a card, `S` say the card, `P` park a stray thought.

## Files and data

- `assimil audio/`, `utexas audio/`: your recordings (not modified).
- `data/lessons.js`, `data/phrase.js`: text cleaned from your two PDFs (OCR noise repaired). `data/fi.js`: Français interactif lists. Rebuild with `tools/build-data.js`.
- Lesson/phrasebook text and recordings are copyrighted by Assimil: keep this folder private.
