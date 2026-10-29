# Boîte à outils française

A personal, offline-first web app for learning French from zero, built on **Assimil — French** (With Ease series, by Anthony Bulger, 2020: 100 lessons, one a day), with the free material of **Français interactif** (UT Austin) on the same topics, and on the learning principles of Paul Nation.

**Open it:** https://cyber-hbliu.github.io/francais-boite-a-outils/

## What it does

- **Ma leçon:** the 100 lessons of Assimil, one a day, in the book's order (every 7th lesson a revision). Lessons 1–49 are the receptive phase; from lesson 50 the second wave adds, each day, the lesson of 49 days before, from the English translation back to French. Each lesson has eight steps, about a quarter of the time for each of Nation's four strands; the time of each step is counted for its strand.
- **Steps:** listen (without the text, with the French, with the translation) · Français interactif (the recorded word list of the topic, a pronunciation lesson in lessons 1–15, a listening exercise) · the book's notes · sentence-by-sentence repetition (the recording stops at its pauses) · exercises 1 and 2 (exercise 2 with one field per gap, checked against the book's answers) · cards · output (say the dialogue again from its translation, the second wave, writing corrected and rewritten from memory) · fluency (the previous lessons faster, retelling 3/2/1½).
- **Cards:** spaced repetition on the book's lexicon, each word in the lesson where it first appears; new cards mixed across the lessons reached so far, at most 6 a day from one lesson. Français interactif words can be added with ☆.
- **Writing:** a daily journal on a monthly calendar; copy for correction, paste the corrected text back, rewrite from memory, compared word by word.
- **Progress:** learning curve, four-strand balance against 25 %, the end of the course projected from the last 7 days' pace.
- **Sync:** progress is merged between devices through a private GitHub Gist in your own account (Plus → Sauvegarde). Recordings stay on the device that made them.

Everything runs in the browser. Progress lives in `localStorage`, recordings in IndexedDB.

## Content and credits

- **Assimil — French (not included).** This repository only holds the lesson titles and page numbers (`assimil.js`). The text of each lesson — dialogue, translation, notes, exercises — and the lexicon are imported from your own PDF, read in your browser (Plus → Livres), and checked by you next to the book's page. They stay in your browser and your private Gist. Your recordings go in `ASSIMIL French/` and `audio/assimil/` (ignored by git; `publier-audio.sh` copies them to a private repository so the hosted site can play them).
- **Earlier books.** The app first used *Grammaire progressive*, *Vocabulaire progressif* and *Communication progressive du français, débutant* (CLE International); their tables of contents are still in `book_toc.js`, no longer used by the course.
- **PDF import:** pdf.js (Mozilla, Apache 2.0) and tesseract.js with the French model (Apache 2.0), in `lib/`.
- **Français interactif** (University of Texas at Austin, COERLL / LAITS), CC BY 3.0 — vocabulary lists and the recordings in `audio/fi/`. https://www.laits.utexas.edu/fi/
- **Dictionary** (`dict.js`): English Wiktionary via kaikki.org, CC BY-SA 4.0; frequencies, genders and inflected forms from Lexique 3.83 (Boris New & Christophe Pallier), CC BY-SA 4.0. `dict.js` is distributed under CC BY-SA 4.0.
- **Font:** Inter, SIL Open Font License 1.1.
- **Method:** Paul Nation, *What do you need to know to learn a foreign language?* (Victoria University of Wellington, 2014).
- Speech for single words, and for dialogues without a book recording, uses the browser's built-in French voices (two voices: the first role, then the others).
