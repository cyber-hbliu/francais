# Boîte à outils française

A personal, offline-first web app for learning French from zero to A1 (and later towards TCF Canada), built on three A1 textbooks — *Grammaire progressive du français, débutant* (3e éd., CLE International 2018), *Vocabulaire progressif du français, débutant* (3e éd., 2017) and *Communication progressive du français, débutant* (2e éd., 2018) — and on the learning principles of Paul Nation. All three books are A1; finishing them is finishing the A1.

**Open it:** https://cyber-hbliu.github.io/francais-boite-a-outils/

## What it does

- **Mon unité:** the three books in 30 units (about 66 study days): the grammar book in its order with its 8 bilans, each Communication dialogue once the tenses it uses have been studied, the Vocabulaire unit on the same topic, and the recorded texts at the back of the books where their grammar is known. Each unit has nine steps, about a quarter of the time for each of Nation's four strands; the time of each step is counted for its strand.
- **Dialogues:** listen and read with sentence highlighting, shadowing (original → you → original), role play (the computer reads one role, you speak the other, then swap; redone one and three units later), retelling 3/2/1½ on the previous unit's dialogue.
- **Cards:** spaced repetition on the books' words and phrases only (Français interactif lends its recordings); new cards mixed across the units reached so far, at most 6 a day from one unit. The grammar exercises are done once in the unit and checked against the book's corrigé.
- **Writing:** the unit's « À vous ! » and a daily journal on a monthly calendar; copy for correction on one point, paste the corrected text back, rewrite from memory, compared word by word.
- **Progress:** learning curve, four-strand balance against 25 %, the end of the A1 projected from the last 7 days' pace.
- **Sync:** progress is merged between devices through a private GitHub Gist in your own account (Plus → Sauvegarde). Recordings stay on the device that made them.

Everything runs in the browser. Progress lives in `localStorage`, recordings in IndexedDB.

## Content and credits

- **Textbooks (not included).** *Grammaire progressive du français, débutant* (3e éd.), *Vocabulaire progressif du français, débutant* and *Communication progressive du français, débutant* (2e éd.), CLE International. This repository only holds their tables of contents (unit titles, situations, page numbers: `book_toc.js`). The content of each unit — rules, examples, exercises, dialogues, « Manières de dire », word lists — is entered by you from your own copy (page « Saisir le contenu du livre », with an optional import from your own PDF, read in the browser). It stays in your browser and your private Gist. Units not entered show only their title and pages. CD tracks go in `audio/comm/` by track number (ignored by git; see `publier-audio.sh` for a private repository).
- **PDF import:** pdf.js (Mozilla, Apache 2.0) and tesseract.js with the French model (Apache 2.0), in `lib/`.
- **Français interactif** (University of Texas at Austin, COERLL / LAITS), CC BY 3.0 — vocabulary lists and the recordings in `audio/fi/`. https://www.laits.utexas.edu/fi/
- **Dictionary** (`dict.js`): English Wiktionary via kaikki.org, CC BY-SA 4.0; frequencies, genders and inflected forms from Lexique 3.83 (Boris New & Christophe Pallier), CC BY-SA 4.0. `dict.js` is distributed under CC BY-SA 4.0.
- **Font:** Inter, SIL Open Font License 1.1.
- **Method:** Paul Nation, *What do you need to know to learn a foreign language?* (Victoria University of Wellington, 2014).
- Speech for single words, and for dialogues without a book recording, uses the browser's built-in French voices (two voices: the first role, then the others).
