---
title: "Hands on the keys: what I learned making SwiftFlow 100% keyboard-usable"
description: "A command palette on Ctrl/⌘K, a key beside every button, menus with their own letters and dialogs that give focus back: how I made a typing test that never makes you reach for the mouse, and how I check it with axe."
date: 2026-10-13
tags: [swiftflow, keyboard, accessibility, ux]
projects: [swiftflow-typing-test]
kind: learning
keyword: "keyboard"
cover: /img/projects/swiftflow/teclado-paleta.webp
---

[SwiftFlow](/project/swiftflow-typing-test) is a typing test in Spanish. While you type, both hands sit on the keyboard, on the home row. If starting another test, switching modes or opening the history means reaching for the mouse, your fingers leave their place and you lose the rhythm. That annoyance, which I felt first as a user, is where this whole post comes from.

The problem has a catch: on the test screen, almost every key is text. If "R" restarts, nobody can type "perro". This is what I built so that everything can be done from the keyboard without stepping on what you're typing, with the real rules from the code and what I had to change along the way.

## Three layers, from the most general to the most direct

| Layer | How you open it | What it's for |
| --- | --- | --- |
| The command palette | **Ctrl K** or **⌘K**, from any page | Everything that can be changed, found by name |
| Each button's key | The letter alone, or **Alt**/**⌥** + letter during the test | Whatever is on screen, without opening anything |
| Keys inside a menu | With the menu open, the letter or number alone | Each option in the menu, no arrows needed |

<p class="tbl-note">All three live together: the palette finds anything; the other two are faster for what you can already see.</p>

On top of that there are three fixed shortcuts: **Tab** mid-run starts over with a new text, **Esc** pauses (and a second Esc ends the run), and **?** away from the test shows the list of shortcuts.

## The palette: type what you want

**Ctrl K** opens the palette on any system, and so does **⌘K**: the code accepts both combinations on both, for people who bring the habit from elsewhere. The placeholder says what you can type: "Escribí un comando: 30, palabras 50, oscuro, historial…" (in English: "Type a command: 30, words 50, dark, history…").

<figure>
  <img srcset="/img/projects/swiftflow/teclado-paleta-800.webp 800w, /img/projects/swiftflow/teclado-paleta-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/teclado-paleta-1600.webp" alt="SwiftFlow's command palette with «teclado» typed: show the on-screen keyboard, finger colors, keyboard shortcuts and the five layouts, with Latinoamericano marked as active." loading="lazy" decoding="async" />
  <figcaption>Typing "teclado" brings up the on-screen keyboard options, the list of shortcuts and the five layouts. The active one is checked, and the first row shows its own key (⌥K).</figcaption>
</figure>

The list isn't fixed. It's rebuilt every time it opens, from the app's state, so it only offers what makes sense right now: "end the run" only appears while one is going, the sentence count only in Dictation, and the course lessons only the ones already unlocked. If a run is in progress, opening the palette pauses it, the way Esc does.

### How it searches

Every word you type has to show up at the start of some word of the command: its group, its name or one of its keywords. Accents and capitals don't matter ("tipografia" finds "Tipografía"), and it searches both languages: with the app in English, "tiempo" still finds the time options. Each word adds points depending on how well it fits:

| Fit | Points |
| --- | --- |
| It's a whole word of the name or the group | 4 |
| It's a whole keyword | 3 |
| It's the start of a word of the name | 2 (1 if it's a number) |
| It's the start of a keyword | 1 |
| It doesn't appear | The command is left out |

<p class="tbl-note">Ties keep their order in the list, which puts the common ones first.</p>

I learned the number rule by typing "5": it isn't the same as "50". A number only scores high when it's whole, and if nothing else fits, a prefix still counts for something, because that beats no answer at all.

```js
// Simplified: how well a typed word fits a command.
const scoreToken = (token, { title, keywords }) => {
  const numeric = /^\d+$/.test(token);
  if (title.includes(token)) return 4;
  if (keywords.includes(token)) return 3;
  if (title.some((w) => w.startsWith(token))) return numeric ? 1 : 2;
  if (keywords.some((w) => w.startsWith(token))) return 1;
  return 0; // a single 0 and the command is out
};
```

With the palette empty, the five commands used last go on top, under "Recientes". They're kept in `localStorage`, and if the browser blocks it they're remembered for that visit only. You move with ↑/↓ (or Ctrl+N and Ctrl+P), PageUp/PageDown jump five at a time, Enter picks and Esc closes.

## A key beside every button

The palette covered everything, but for what's already on screen it was one step too many. In the next iteration every button started showing its key in a chip beside it, and that key presses it. The chip changes depending on where you are:

- On the results and the other pages, the letter alone: **F** "¿Dónde te frenaste?" (where you slowed down), **C** share, **L** the day's challenges, **R** another run.
- On the test, before it ends, letters are text, so the same key takes **Alt** (**⌥** on a Mac), and the chip says so: "⌥L" instead of "L".
- The top bar: **P** the test, **O** the course, **H** the history, **Q** what SwiftFlow is, **Z** sound and language, **T** the theme.

<figure>
  <img srcset="/img/projects/swiftflow/01-800.webp 800w, /img/projects/swiftflow/01-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/01-1600.webp" alt="SwiftFlow's test screen in dark theme, with a small chip beside each button showing its key with ⌥." loading="lazy" decoding="async" />
  <figcaption>On the test, every chip carries ⌥ (Alt on Windows and Linux): there, the letter alone is text.</figcaption>
</figure>

Each button registers its key while it's on screen and removes it when it unmounts, so a key only does something when there's something to press. If the same button is on screen twice (the bar, and its copy in the phone's settings sheet), the newest one answers, and when one goes away it hands the key back to the other. That last part was a bug: before, the one leaving wiped the key from the one staying.

The chips only show with a fine pointer, a mouse or trackpad (`pointer: fine`). A phone has no keyboard to press them on, and the chips would just be noise.

### How it avoids stepping on your typing

This is the part with the most rules, and every one of them comes from a concrete case:

| Rule | Why |
| --- | --- |
| During the test, the letter alone isn't a shortcut: it needs Alt/⌥ | Every letter is text while you type |
| Alt + letter is matched by the physical key (`event.code`), not the character | On a Mac, ⌥G types "©", not "g" |
| No shortcut fires with Ctrl, ⌘ or Shift, or while a character is being composed | Don't steal the system's combinations or break a half-typed dead key |
| Away from the test, the letter alone doesn't count if focus is in a text field | There, the letter is what you're typing |
| With a dialog open, no button behind it answers | Only the dialog's buttons should |
| When a run ends, two seconds where no key does anything, Space included | Letters still in flight were landing on the results' buttons |
| Holding a key down doesn't repeat the shortcut | A button shouldn't open and close by itself |

<p class="tbl-note">Each row is a condition in the code that decides whether a key is a shortcut or not.</p>

```js
// Simplified: is this key a shortcut?
const match = (event) => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing) return null;
  let letter = null;
  if (event.altKey) {
    // The physical key: KeyL → "l", Digit3 → "3"
    const found = /^(?:Key([A-Z])|Digit([0-9]))$/.exec(event.code ?? "");
    letter = found ? (found[1] ?? found[2]).toLowerCase() : null;
  } else if (!typingNow && !isEditable(event.target)) {
    letter = event.key?.length === 1 ? event.key.toLowerCase() : null;
  }
  // The button most recently put on screen wins
  return letter ? newestEnabledHotkeyFor(letter) : null;
};
```

The two-second rule is checked by a Playwright test: it finishes a run, presses "f" and Space right away, and checks that no dialog opened and that the chips haven't shown up yet. Only after that does "L" alone open the challenges.

### The Mac letters

Picking the letters wasn't just a matter of initials. On a Mac, ⌥ plus E, I, N or U doesn't give a letter: it's a dead key waiting for the next one to put an accent on it. With those four, ⌥ + letter doesn't work as a shortcut. That's why the top bar dodges them, and why "Entrenar ahora" (train now) started on **E** and ended up on **D**. The pacer moved too: it was on **M**, but when the modes menu needed a letter, the **M** for "Modo" won and the pacer moved to **B**.

## Keys inside every menu

In the last iteration, the settings bar's menus also open with their key, with Alt/⌥ on the test: **M** the modes menu, **1–9** the time or count in order (⌥1 is 15 s, or 10 words), **J** the mode's own options and **W** the options.

And inside an open menu, each option has its own key, written on the option and without Alt, because while the menu is open nothing goes to the text:

| Menu | Keys |
| --- | --- |
| Modes | T Tiempo, P Palabras, N Números, C Cita, L Clásicos, D Dictado, O Código, M Mi texto, E Entrenar, F Dedos, Z Zen |
| Fingers | The home-row key each finger rests on; 1–5 for left hand, right hand, both, index fingers and pinkies |
| Options | P punctuation, S "sin red" (blind), M sudden death, C must-correct, and 0/9/5/8 for the minimum accuracy |
| Text appearance | F font, T size, I line height, C caret, O focus, A high contrast |
| Sound and language | I language, P practice texts, S all sound, T keystrokes, E errors, L achievements and records |

<p class="tbl-note">The modes keep their Spanish initials. Arrows, Tab, Enter, Space and Esc still work as always inside every menu.</p>

The Fingers menu has a detail that connects with the other post in this series. Each finger is picked with the key it rests on, and that key is matched by its physical position, not by what it prints: on a Latin American keyboard the right pinky is **Ñ**; on Dvorak, the right index finger is **H**.

<figure>
  <img srcset="/img/projects/swiftflow/layouts-dedos-dvorak-800.webp 800w, /img/projects/swiftflow/layouts-dedos-dvorak-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/layouts-dedos-dvorak-1600.webp" alt="SwiftFlow's finger picker open on the Dvorak layout: each finger shows on top the key it rests on (A, O, E, U, H, T, N, S) and the shortcuts 1 to 5." loading="lazy" decoding="async" />
  <figcaption>The Fingers menu on Dvorak: each finger is picked with its home-row key, and the presets with 1–5.</figcaption>
</figure>

Menu keys are listened to in the capture phase, before the test screen, and a key a menu takes goes nowhere else. A test covers it: with focus in the text field it opens the modes, picks Fingers with "f", the pinkies with "5", adds the left ring finger with "s", turns on "Sin red" and a 90% minimum accuracy, and finally checks that the text field is still empty.

## Focus, dialogs and screen readers

Doing everything from the keyboard is no use if focus gets lost. Every dialog uses the same piece, and it does four things:

1. On open, it remembers which element had focus and moves focus inside: to whatever it's told (the search box, in the palette) or to the first focusable element.
2. Tab and Shift+Tab go round inside the dialog instead of wandering off to the page behind.
3. Esc closes it. It listens in the capture phase, so the page's own shortcuts (Space to restart, typing anywhere) never see keys meant for the dialog.
4. On close, it gives focus back to whatever opened it, if it's still on the page.

Two details I only saw by using it:

- The palette's search box takes focus the moment it's drawn. If it waits a frame, a fast typist's first letter after Ctrl+K lands in the test's text.
- Space on a focused button presses it, instead of starting another run or typing.

Tab has its own rule too. Mid-run it starts over with a new text, but with nothing typed, or while paused, it moves focus as usual. If Tab always restarted, someone navigating by keyboard would be trapped in the text field.

For screen readers there are two `aria-live` regions, a polite one and one that interrupts. Results, achievements, the coach and pauses are announced there: at the end you hear something like "Terminaste: 64 palabras por minuto, 97 % de precisión, 0 errores" (you finished: 64 words per minute…). Each message goes in as its own line and is removed after ten seconds. That way, if two arrive together (the results and an achievement), both are read. The palette also says how many commands it found, and running one says "Listo:" (done) and its name. Numbers are read the way each language says them: "64,5" in Spanish, "64.5" in English. And since the chips are `aria-hidden`, each button carries its key in `aria-keyshortcuts`.

High contrast follows the system's setting (`prefers-contrast: more`) until you change it in the text menu. From then on, your pick rules.

<figure>
  <img srcset="/img/projects/swiftflow/teclado-atajos-800.webp 800w, /img/projects/swiftflow/teclado-atajos-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/teclado-atajos-1600.webp" alt="SwiftFlow's «Atajos de teclado» list: ⌘K opens or closes the commands, Tab starts over, Space for another run, Esc pauses, ? shows the list, A–Z presses the button and ⌥ A–Z does the same on the test." loading="lazy" decoding="async" />
  <figcaption>"?" on the history opens the list of shortcuts. Focus goes straight to "Volver a los comandos" (back to the commands).</figcaption>
</figure>

## How I check it

None of this stays working by itself. There are three kinds of tests:

- **axe in Playwright.** One test walks through every screen and every dialog (the test, the text menu, mid-run, the results, "¿Dónde te frenaste?", the history, the summary, the course and the landing) and runs axe with the WCAG 2.0 and 2.1 rules, levels A and AA. With high contrast, in light and dark theme, there can't be a single violation. In the normal theme a single rule is excluded, color contrast, because the brand color doesn't pass it. I'd rather say so than hide it: that's why high contrast exists.
- **Focus.** It opens "¿Dónde te frenaste?" with Space, presses Tab eight times and Shift+Tab once, and at every step checks that focus is still inside. With Esc, it checks that focus went back to the button that opened it and that the results screen is still there.
- **The keyboard.** Tests for the palette ("30" picks Time 30 s, "pal 50" picks Words 50, Tab restarts, "?" shows the list away from the test) and for every button and menu key, with and without Alt.

There's one more I like. A run set up from the keyboard (with the palette or a button's key) and finished without touching the mouse is marked in the history. That feeds two achievements, "Sin soltar el teclado" (hands on the keys) and "El mouse junta polvo" (the mouse gathers dust, 25 runs like that), and a daily challenge. The test sets up the run with "palabras 10", plays it, checks the mark, clicks once and checks that the next run doesn't have it.

## How it got here

All of this happened over a few days and in four steps, each with its commit:

| Date | Step |
| --- | --- |
| 2026-09-25 | Keyboard, screen reader and high contrast: dialogs that trap and return focus, announcements and axe in CI |
| 2026-09-27 | The palette on Ctrl/⌘K, Tab to start over and ? for the shortcuts |
| 2026-09-28 | Every button with its key, and the course without the mouse |
| 2026-09-28 | The settings bar with keys, and one key per option inside every menu (first modes, fingers and options; then appearance and sound) |

<p class="tbl-note">From the commit history of the SwiftFlow repository.</p>

Along the way I also fixed an Esc that did more than it should. If you stopped to think, after three seconds without typing the run paused by itself, and the Esc you pressed next ended it. Now only a second Esc on a pause you asked for ends it.

## What isn't there

- On a phone, the chips don't show, on purpose. The app works by touch, but this layer is for physical keyboards.
- What a screen reader actually says isn't tested by any automated test. The roadmap treats it as a separate review of the main flow: axe finds structural problems, but it doesn't replace listening to the app end to end.
- Alt + letter is matched by the key's physical position, named the way a US keyboard names it (`KeyL`). With a different layout set in the operating system, the shortcut follows the position, not the printed letter. That's the price of ⌥ working on a Mac.

## If you're building something similar

- Start with the conflict rule, not the shortcuts: decide when a key is text and when it's a command, and write it down in one place.
- Show the key on the button. A hidden list of shortcuts is read by nobody; a two-character chip beside the button is.
- Make the key exist only while the button exists. That way a shortcut never does something invisible.
- Test on a Mac with ⌥. It will change some of your letters.
- Treat focus as state: save it on open, give it back on close, and think about what Tab does on each screen.
- Put axe in the e2e tests for every screen and every dialog, and write down in the code which rule you exclude and why.

> What I take away: making something keyboard-usable isn't adding shortcuts, it's deciding what every key does at every moment. When that decision lives in one place and has its tests, it's enough to never take your hands off the keys.
