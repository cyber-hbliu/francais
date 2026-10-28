# Boîte à outils française

A personal, offline-first web app for learning French from zero to A1/A2 (and towards TCF Canada), built around the unit order of three textbooks and the learning principles of Paul Nation.

**Open it:** https://cyber-hbliu.github.io/francais-boite-a-outils/

## What it does

- **Aujourd'hui:** each day is a short list of blocks (max 20 min each) that rotate across Nation's four strands: study, listening & reading, speaking & writing, fluency. One button to start; a 15-minute version for low-energy days.
- **Dialogues:** listen and read with sentence highlighting, shadowing (original → you → original), role play (the computer plays A, you play B), timed retelling 3/2/1½, sentence cards.
- **Cards:** spaced repetition, recognise first, new cards spread across word lists, memory-hint box for missed cards.
- **Plan:** dated from the deadlines (A1, A2), recalculated every day; a zero-start ramp-up in the first three weeks.
- **Mes progrès:** 90-day heatmap, four-strand balance, voice comparison (day 1 vs today), DELF check weeks.
- **Sync:** progress is merged between devices through a private GitHub Gist in your own account (Mes progrès → Sauvegarde). Recordings stay on the device that made them.

Everything runs in the browser. Progress lives in `localStorage`, recordings in IndexedDB.

## Content and credits

- **Textbooks (not included).** The order of units and the page numbers follow *Grammaire progressive du français – débutant*, *Vocabulaire progressif du français – A1* and *Communication progressive du français – débutant* (CLE International). No text, exercise or audio from these books is in this repository; explanations, examples, exercises and dialogues here are original. Use them with your own copy of the books. Your CD tracks can go in `audio/comm/` locally (ignored by git).
- **Français interactif** (University of Texas at Austin, COERLL / LAITS), CC BY 3.0 — vocabulary lists and the recordings in `audio/fi/`. https://www.laits.utexas.edu/fi/
- **Dictionary** (`dict.js`): English Wiktionary via kaikki.org, CC BY-SA 4.0; frequencies, genders and inflected forms from Lexique 3.83 (Boris New & Christophe Pallier), CC BY-SA 4.0. `dict.js` is distributed under CC BY-SA 4.0.
- **Font:** Inter, SIL Open Font License 1.1.
- **Method:** Paul Nation, *What do you need to know to learn a foreign language?* (Victoria University of Wellington, 2014).
- Speech for single words and the rewritten dialogues uses the browser's built-in French voices.
