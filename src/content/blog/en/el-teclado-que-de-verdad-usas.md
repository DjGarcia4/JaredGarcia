---
title: "The keyboard you actually use: modeling five layouts in a typing test"
description: "Latin American, Spain, US International, Dvorak and Colemak: how SwiftFlow knows which key, which finger and which Shift, AltGr or dead key each character needs, and how the analysis, the course and Fingers mode adapt to your keyboard."
date: 2026-10-13
tags: [swiftflow, keyboard, layouts, product]
projects: [swiftflow-typing-test]
kind: learning
keyword: "keyboard layouts"
cover: /img/projects/swiftflow/layouts-latam.webp
---

[SwiftFlow](/project/swiftflow-typing-test) started out drawing a single keyboard: a generic Spanish one, with the Ñ next to the L. It was enough for almost everything, until you looked at the details. The accent key was drawn right after the Ñ, with a comment in the code saying Spain and Latin America put it in different spots and that this was "close enough for either". Shift+3 gave "·", which belongs to Spain's keyboard, not the Latin American one.

For a test that says "press this key, with this finger", "close enough" doesn't work. If the on-screen keyboard lights a key that's somewhere else on yours, it teaches you wrong. This post is about how I modeled the layouts for real, and everything that changed once the app started knowing which keyboard you type on.

## What a layout is, to the code

Each layout is an object with four things: what's printed on each key, what Shift and AltGr make on those keys, and its dead keys, the ones you press before a letter to put an accent on it. Only the four rows of typing keys are modeled. The key left of the 1 and whatever sits past the letters' right edge are left out.

```js
// Simplified: the Latin American keyboard in SwiftFlow.
const LATAM = {
  id: "latam",
  rows: [
    row("1234567890'¿"),
    row("qwertyuiop´+"),
    row("asdfghjklñ{}"),
    row("<zxcvbnm,.-", -1), // ISO: one extra key left of the Z
  ],
  shift: { "!": "1", '"': "2", /* … */ "¡": "¿", "*": "+", "[": "{", ">": "<" },
  altgr: { "@": "q", "\\": "'", "~": "+", "^": "{", "`": "}" },
  dead: {
    [ACUTE]: { key: "´", shift: false },    // á é í ó ú
    [DIAERESIS]: { key: "´", shift: true }, // ü
  },
};
```

The `-1` on the last row is the decision I leaned on most afterwards. Each row knows which column it starts at, counted from the 1/Q/A/Z column. ISO keyboards (Spain's and Latin America's) have a `<` key left of the Z that the US one doesn't. With that starting column, the Z lands in the same column on every keyboard, and fingers can be assigned the same way on any of them.

## The five layouts

| Layout | What sets it apart | Dead keys | AltGr |
| --- | --- | --- | --- |
| Latin American | ¿ on the number row (¡ with Shift), Ñ and then { } on the home row | ´ for the acute, Shift+´ for the diaeresis | @ ~ ^ ` \ |
| Spanish (Spain) | ¡ on the number row (¿ with Shift), Ñ, ´ and Ç on the home row | ´ acute, Shift+´ diaeresis, ` grave, Shift+` circumflex | € @ # [ ] { } \| ~ |
| US International | No ISO key; the quote works as the accent key | ' acute, Shift+' diaeresis | ñ (AltGr+N), ¡ (AltGr+1), ¿ (AltGr+/) |
| Dvorak | Vowels on the left home row: A O E U | None modeled | None |
| Colemak | Home row A R S T D H N E I O | None modeled | None |

<p class="tbl-note">Dvorak and Colemak are drawn on their US base.</p>

Dvorak and Colemak have no dead keys or AltGr in the model, on purpose. How you type accents with those layouts varies from one system to the next, so I didn't guess at any. The picker says so in its tooltip: "Accents and the ñ aren't marked: every system puts them somewhere else."

## From a character to a key

Everything rests on one function: given a character and a layout, it returns which key makes it and what has to be done before or at the same time. The order of the questions matters:

1. Is it printed on a key? It's that key.
2. Does it come out with Shift or AltGr? That key, with the modifier.
3. Is it a capital? Its lowercase letter's key, plus Shift.
4. Is it an accented letter? It's split with `normalize("NFD")`: "á" is "a" plus a combining acute. If the layout has a dead key for that mark, it's the letter's key, after the dead key.
5. If none of that works, it returns `null`. It doesn't guess.

| Character | Latin American | US International | Dvorak |
| --- | --- | --- | --- |
| ñ | The Ñ key | AltGr + N | None |
| ¿ | Its own key | AltGr + / | None |
| á | ´ then A | ' then A | None |
| Á | ´ then Shift + A | ' then Shift + A | None |
| ü | Shift + ´ then U | Shift + ' then U | None |
| @ | AltGr + Q | Shift + 2 | Shift + 2 |

<p class="tbl-note">What the function returns for a few characters. "None" is `null`: the on-screen keyboard lights nothing.</p>

That `null` is a design decision. I'd rather light no key than the wrong one. Step 4 also leaves something out on purpose: if the base letter needed Shift or AltGr, it isn't combined with a dead key, because I didn't model that combination.

The ñ has its own story. Eight days before the layouts, I found that turning punctuation off ran the text through a filter that stripped accents with `NFD`: it split the ñ into "n" plus a combining tilde and removed the tilde. "Sueño" showed up as "sueno", and the ñ couldn't be typed. The ñ isn't an n with an accent, it's a different letter: "año" (year) and "ano" (anus) are different words. The existing test asserted the broken behavior, so I fixed that too. And the word bank had 10 words with ñ out of 781; it went up to 49. That's why, in the model, the ñ is a key on the Spanish layouts and never an n with something on top.

## The on-screen keyboard

With that function, the keyboard drawn while you type shows three things at once:

- The next key, solid. The Shift, AltGr or dead key it needs, only outlined. Both Shift keys light up together.
- The finger it's for, with its color and its name underneath: "Próxima: índice derecho" (next: right index finger). Fingers of the same kind share a color on both hands (pinkies violet, ring blue, middle green, index amber), so "the same finger, on the other hand" shows at a glance.
- Your misses in this run. A key you've missed twice or more tints red, between 12% and 45% depending on how much you miss it compared with the worst one. A mistake flashes the key that was wanted in red and the one you hit in gray, for 450 ms.

<figure>
  <img srcset="/img/projects/swiftflow/layouts-latam-800.webp 800w, /img/projects/swiftflow/layouts-latam-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/layouts-latam-1600.webp" alt="SwiftFlow's test with the Latin American keyboard on screen and finger colors. The text continues at «núme…»: the U is lit in amber and the accent key, right of the P, is outlined. Underneath it says «Próxima: índice derecho»." loading="lazy" decoding="async" />
  <figcaption>Next up is a "ú" on a Latin American keyboard: the U solid and the ´ key outlined, because it goes first. Underneath, the finger it's for.</figcaption>
</figure>

There are cases where the next key is hidden. In Dictation it isn't shown, because it would give the answer away. In "Sin red" (blind mode) keys don't tint from misses, because that would reveal what you got wrong. On a phone the on-screen keyboard doesn't appear: the system already shows one.

## What changes when it knows your keyboard

The layouts phase wasn't only about drawing. The roadmap put it like this: the keyboard map goes from a single one to one per layout, and the on-screen keyboard, the error map, the fingers, the tips and training all use it.

### The analysis

The history stores characters, not positions: it stores that you missed an "ñ", not that you missed the key in column 9. The layout is applied when reading it, with a function that folds counters onto the key that makes them: "A", "a" and "á" all land on the A. That has two consequences:

- History from before the layouts is still read the same way, with no migration.
- If you switch layouts, the whole analysis is recomputed for the new keyboard: the error map, which finger misses most, which hand or row gives you trouble.

One of the tips depends directly on position. When a key keeps getting confused with another, the tip checks whether the two sit side by side on the same row of your keyboard. A finger that slid onto the neighboring key isn't the same as a hand resting in the wrong place.

### The 24-lesson course

The course (`/curso`) doesn't name letters, it names positions: row and column. That's why it follows whichever keyboard you pick. There are three rows (home, top and bottom), each in five pairs of fingers plus a review, and then six more lessons: capitals, accents, left-hand numbers, right-hand numbers, signs and a final text.

| Pair (columns) | Latin American / Spain | US International | Dvorak |
| --- | --- | --- | --- |
| Index (3 and 6) | F and J | F and J | U and H |
| Middle (2 and 7) | D and K | D and K | E and T |
| Ring (1 and 8) | S and L | S and L | O and N |
| Pinky (0 and 9) | A and Ñ | A | A and S |
| Index stretch (4 and 5) | G and H | G and H | I and D |

<p class="tbl-note">The five home-row lessons, by keyboard. On US, column 9 is ";", and the course only teaches letters plus the comma and the period.</p>

<figure>
  <img srcset="/img/projects/swiftflow/02-800.webp 800w, /img/projects/swiftflow/02-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/02-1600.webp" alt="SwiftFlow's course page with Spain's keyboard: 0 of 24 lessons, F and J marked as the next lesson, and the home-row list with F y J, D y K, S y L, A y Ñ, G y H and review." loading="lazy" decoding="async" />
  <figcaption>The course with "Para tu teclado: Español (España)" (for your keyboard). The lesson titles come from that layout's keys.</figcaption>
</figure>

Each lesson only uses keys already learned, and its own keys show up the most. First as short groups, and as soon as at least six words can be written with those letters, as real words in the language you're practicing. You pass with the lesson's speed (8 wpm on the home row, 12 on the top row, 14 on the bottom row, two more for each review) and 94% accuracy. The second star asks for 98%, and the third also asks for 1.5 times the speed.

Modeling by position had an effect I didn't plan, but it's correct. The comma and the period come into the course with the bottom row, because that's where they are on QWERTY. On Dvorak they're on the top row, so they arrive with it. The practice words, on the other hand, don't change with the keyboard. That's why the ñ only shows up in lesson words when the keyboard has an Ñ key you've already learned.

### Fingers mode

In Fingers you pick which fingers to practice, and the text comes only from the letters those fingers type on your keyboard. With the left index finger on the Latin American layout, that's R, T, F, G, V and B (a test checks it). Dvorak and Colemak change the letters, not the fingers. When those letters make enough real words, as with a whole hand, they make up most of the text. When they don't, as with a single finger, the text is built from groups of its letters, the way a typing course does it.

<figure>
  <img srcset="/img/projects/swiftflow/layouts-dedos-dvorak-800.webp 800w, /img/projects/swiftflow/layouts-dedos-dvorak-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/layouts-dedos-dvorak-1600.webp" alt="Fingers mode with the index fingers picked on Dvorak: the picker shows PYUIKX for the left index finger and FGDHBM for the right; the on-screen keyboard dims the other fingers' keys and the text uses only those letters." loading="lazy" decoding="async" />
  <figcaption>Index fingers on Dvorak: each finger's letters come from the layout, and the keyboard dims everyone else's keys.</figcaption>
</figure>

Each finger in the picker is chosen with the home-row key it rests on, matched by its physical position, not by what it prints. The chip shows your layout's letter: Ñ for the right pinky on Latin American, S on Dvorak. The on-screen keyboard shows up with finger colors and leaves the other fingers' keys at 25% opacity.

## Picking without asking

Nobody wants to set up their keyboard before typing a single line. So, until you pick one, SwiftFlow works it out from the browser's first language:

| Browser's first language | Layout |
| --- | --- |
| `es-ES`, or Catalan (`ca`, `ca-…`) | Spanish (Spain) |
| Any English (`en…`) | US International |
| Everything else | Latin American |

<p class="tbl-note">Most people who type in Spanish use the Latin American keyboard, so it's the default.</p>

The config stores `null` until you pick, not the guessed value. That way the guess follows the browser until the day you pick one, and from then on your choice rules. You change it from the picker under the on-screen keyboard, from the course or from the command palette: typing "dvorak" is enough.

## How it got here

| Date | Step |
| --- | --- |
| 2026-09-17 | The ñ stops getting lost with punctuation off, and the bank goes from 10 to 49 words with ñ |
| 2026-09-22 | The on-screen keyboard, with a single Spanish map; then finger colors |
| 2026-09-25 | The five layouts, the language-based guess and the adapted analysis; the same day, the course from zero |
| 2026-09-28 | Fingers mode and "Tus dedos" (your fingers) in the history, both on the chosen layout |

<p class="tbl-note">From the commit history of the SwiftFlow repository.</p>

Tests come with each step. The map's unit tests cover, among other things, where each keyboard keeps the question marks, the AltGr symbols, Spanish on the US keyboard, and that no layout lists a key twice or puts a character on two keys. In Playwright, one test checks that a Spanish browser gets the Latin American keyboard (and that the ¿ key is drawn), that picking Spain brings up the Ç and the choice survives a reload, and that Dvorak has no Ç and no AltGr key.

## What's missing

There's no pending layouts phase in the roadmap, but there are limits I know about:

- Accents and the ñ on Dvorak and Colemak aren't marked. Each system would have to be modeled separately.
- Five layouts aren't all of them. Adding one is one more object, with its rows, Shift, AltGr and dead keys, but you have to know it well.
- The side keys aren't modeled: the one left of the 1, or whatever sits past the letters on the right. A character that only comes from there returns `null`.
- The history doesn't store which keyboard each run was typed on. That's on purpose, so it always reads the same, but if you switch layouts, the analysis reinterprets your old runs with the new keyboard.

## If you're going to model keyboards

- Separate what's printed on a key from where it is. With rows and starting columns, fingers and lessons are defined once for every keyboard.
- Store characters in your data and apply the layout when reading them. Switching keyboards shouldn't force you to migrate anything.
- When you don't know, return nothing. A key lit in the wrong place teaches wrong, and a gap doesn't.
- Be careful with `normalize("NFD")` in Spanish: it's the right way to split off an accent, and also the easiest way to break the ñ.
- Guess a default, but store that nothing was picked, so the guess keeps working until someone decides.

> What I take away: the keyboard isn't a visual detail of the test, it's the model everything else rests on. Once the app knows which keyboard you type on, every tip, every lesson and every lit key start being true for you.
