---
title: "Translating an app that is also content: SwiftFlow in English"
description: "The i18n base, the app's language kept apart from the texts' language, grammar that doesn't translate word for word, ¿¡ only in Spanish, dictation voices, records per language and English links to share."
date: 2026-10-13
tags: [swiftflow, i18n, vue, product]
projects: [swiftflow-typing-test]
kind: learning
keyword: "i18n"
cover: /img/projects/swiftflow/i18n-en.webp
---

[SwiftFlow](/project/swiftflow-typing-test) was born as “a typing test in Spanish”. Everything was written for Spanish: the interface, the tips, the achievements and, above all, the texts you type. Adding English looked like a translation job, but in a typing test the text isn't just the interface: it's also what you practice.

This is the path of that i18n, done in a series of commits on September 25, 2026: what I separated, what couldn't be translated word for word, and what I had to decide so the old data would still hold.

## Two languages that aren't the same thing

The first decision was to separate two settings that look like one: the app's language and the language of the practice texts. You can have the interface in Spanish and practice English, or the other way round. Spanish is still the main language.

<figure>
  <img srcset="/img/projects/swiftflow/i18n-idioma-800.webp 800w, /img/projects/swiftflow/i18n-idioma-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/i18n-idioma-1600.webp" alt="SwiftFlow's sound and language menu open, in Spanish, with Language and Practice texts as two separate pickers between Español and English." loading="lazy" decoding="async" />
  <figcaption>The “Sound and language” menu (here in Spanish): “Language” changes the app, and “Practice texts” changes what you type.</figcaption>
</figure>

| Interface (translated) | Content (switches bank) | Same in both |
| --- | --- | --- |
| Buttons, menus, results | Words, quotes, paragraphs | Code |
| “What to improve” tips | Classics | Numbers |
| 94 achievements, challenges, ranks | Dictation and its voice | My text |
| History, course, summary, landing | The course and the weekly challenge | |
| Tab and link titles | | |

<p class="tbl-note">What depends on each setting. The modes with a language are listed in <code>LANGUAGE_MODES</code>.</p>

The texts' language starts out empty (`null`), and that means “the interface's”. If you never touch it, you practice in the language you read the app in.

## The base: `t()` and a `messages.js` per feature

I didn't use a library. The base is a file of about 80 lines: each feature has its `messages.js` with `es` and `en` side by side, read with `t("namespace.path")`. The repository's rule is that no interface text is written inside a component.

```js
// Simplified: a message can be a string or a function.
registerMessages("typing", {
  es: { errors: (n) => `${n} ${n === 1 ? "error" : "errores"}` },
  en: { errors: (n) => `${n} ${n === 1 ? "mistake" : "mistakes"}` },
});

export const t = (path, ...args) => {
  const entry = lookup(catalogs[locale.value], path) ?? lookup(catalogs.es, path);
  if (entry === undefined) return path;
  return typeof entry === "function" ? entry(...args) : entry;
};
```

Three rules hold this up:

- If something is missing in English, the Spanish is used, which is always complete.
- A test compares the shape of both catalogs: same keys and, where one is a function, the other is too. A text can't go untranslated without the suite failing.
- `t()` reads `locale.value`, which is reactive. Any `computed` or template that uses it switches language on its own, without a reload.

The initial language comes from the browser: if the first of `navigator.languages` starts with `en`, English; anything else, Spanish. A browser in `es-AR` with English as a second language stays in Spanish. Once picked in the menu, it's saved and also applied to `<html lang>`.

## Translating isn't replacing words

The “What to improve” tips are the texts with the most grammar in the app, and translating them word for word didn't work. In Spanish, keys take an article and the verb agrees with how many there are. In English, the key stands alone.

| Case | Spanish | English |
| --- | --- | --- |
| One slow key | “Te frena la R” | “R slows you down” |
| Two slow keys | “Te frenan la R y la T” | “R and T slow you down” |
| Live coach | “Se te escapan la A y la S” | “A and S keep slipping” |
| Confusion | “Confundís la E con la R” | “You mix up E and R” |

<p class="tbl-note">That's why those messages are functions that get the list of keys, and each language builds it its own way.</p>

That article had already caused trouble before English: a tip naming two slow keys read “Te frenan la Ñ y Q”, as if the second one were an afterthought, until a commit on September 17 made it repeat the article: “la Ñ y la Q”. Handing the whole list to a function per language settled that for good.

I was especially careful with the tips: the Spanish output couldn't change by a single comma. The existing tests check those tips word for word, so translating the history couldn't break the Spanish without me knowing. Numbers and dates are also formatted for the language (`es` or `en-US`): “septiembre de 2026” and “September 2026”.

## The content: one bank per language

Content isn't translated: it's replaced by another bank written for that language. Each bank picks with a single function:

```js
// Simplified: the bank for the language being practiced.
export const practiceLanguage = ref("es");
export const inPracticeLanguage = (banks) =>
  banks[practiceLanguage.value] ?? banks.es;

export const practiceWords = () =>
  inPracticeLanguage({ es: spanishWords, en: englishWords });
```

What arrived in English, counted in today's code:

| Bank | English |
| --- | --- |
| Words | 822, plus 28 borrowed words with accents |
| Quotes | 75 |
| Paragraphs | 20 |
| Classics | 13 passages by 11 public-domain authors: Austen, Dickens, Melville, Carroll, Charlotte Brontë, Lincoln, Shakespeare, Poe, Blake, Wordsworth and Dickinson |

<p class="tbl-note">Dictation and the course have no bank of their own: they come from the paragraphs and the words.</p>

<figure>
  <img srcset="/img/projects/swiftflow/i18n-en-800.webp 800w, /img/projects/swiftflow/i18n-en-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/i18n-en-1600.webp" alt="SwiftFlow's typing screen in English, with Time mode, 15s, Options and an English paragraph about gardening." loading="lazy" decoding="async" />
  <figcaption>The typing screen in a browser set to English: interface and text in English.</figcaption>
</figure>

## ¿¡ in one language, not the other

Words mode builds sentences out of loose words: a capital to start, the odd comma and, now and then, a question or an exclamation. In Spanish they open and close; in English they only close. It's a two-character change, but without it English came out with a “¿” nobody types.

```js
// Simplified: the opening signs depend on the language.
const [openQuestion, openExclamation] = inPracticeLanguage({
  es: ["¿", "¡"],
  en: ["", ""],
});
// 15% questions, 12% exclamations, the rest end with a period.
// Never a comma right after the opening word: “¿Dónde, está” reads wrong.
```

With punctuation off, the formatter strips all of that, ¿ and ¡ included. Stripping the opening signs along with the closing ones was a Spanish-only fix, from the day the Classics arrived.

## Accents: English has few

The course has an accents lesson, and English barely uses them. The answer was a short list of borrowed words English writes with an accent: “café”, “résumé”, “fiancé”, “cliché”, “décor”, “entrée”… That way the lesson makes sense in both languages without inventing words.

The rest of the course didn't have to change per language. Lessons name their keys by position (row and column), not by letter, because they already had to follow the keyboard layout: on one keyboard the home row is A S D F and on Dvorak it's A O E U. Only the source of the real words, which show up once there are letters enough, changed.

Some Spanish details stay even with the app in English: letters under review are sorted with `localeCompare(…, "es")`, so Ñ comes after N and not after Z.

## Dictation: picking the voice

Dictation uses the system's voices through `speechSynthesis`. “Spanish” isn't one voice: there's `es-MX`, `es-AR`, `es-ES`, `es-US`… and they don't all sound the same to the listener. So the voice is picked with points:

| Criterion | Spanish | English |
| --- | --- | --- |
| Your exact variant (from `navigator.languages`) | +100 | +100 |
| Another one in the same group | +50 if it's Latin American or US and so are you | +50 if it's `en-US` |
| Fallback | +20 if it's `es-ES` | +20 if it's `en-GB` |
| Local voice, works offline | +5 | +5 |
| The system's default voice | +1 | +1 |

<p class="tbl-note">If your variant is from Spain, <code>es-ES</code> gets 50 instead of the Latin American ones.</p>

There are two more edge cases. Voices can arrive a moment after the page loads, so it waits for the `voiceschanged` event, capped at 1.5 seconds because some browsers never fire it. And if there's no voice for the language, the app says so: “Your browser has no English voice. Try another browser, or install an English voice from your system settings.”

The dictated text has per-language rules too. A voice doesn't say commas or capitals, so they aren't asked for. But it does tell “está” from “esta”, so accents and the ñ stay; in English, the apostrophe inside a word stays, as in “don't”.

## Records per language

Once there were runs in two languages, comparing 25 words in English with 25 in Spanish made no sense. Everything that gets compared went per language: records, averages, perfect rounds, ghosts and the weekly challenge.

```js
// Simplified: a session's kind includes its language, except Spanish,
// which keeps the key it had before there was a choice.
export const sessionKind = ({ mode, modeValue, textLanguage }) => {
  const key = `${mode}:${modeValue ?? ""}`;
  return textLanguage && textLanguage !== "es" ? `${key}:${textLanguage}` : key;
};
```

That Spanish exception repeats everywhere, on purpose. Old sessions have no language and are Spanish, so they keep their usual key and nothing stored goes missing. The weekly challenge does the same with its seed: in Spanish it's still `weekly:<week>`, and English has its own, so the text of a week already played didn't change.

The history gets a filter, “Language of the texts”, and English runs are labeled “25 words · English”. Your summary only counts a record if it beat what came before in the same language. There are also achievements and daily challenges for practicing in both.

## English links and tab titles

Sharing SwiftFlow with someone who speaks English had to show English from the preview on. Link previews on WhatsApp, X or Discord don't run JavaScript, so the build writes a real HTML file per route and per language, with its title, description and image:

| Route | Spanish title | English title (`/en…`) |
| --- | --- | --- |
| `/` | SwiftFlow · Test de mecanografía en español e inglés | SwiftFlow · Typing test in English and Spanish |
| `/sobre` | Qué es SwiftFlow · SwiftFlow | What is SwiftFlow · SwiftFlow |
| `/curso` | Curso desde cero · SwiftFlow | Course from scratch · SwiftFlow |
| `/resumen` | Tu resumen · SwiftFlow | Your summary · SwiftFlow |
| `/historial` | Historial · SwiftFlow | History · SwiftFlow |

<p class="tbl-note">Each page carries <code>og:locale</code> (es_AR or en_US), its alternate and <code>hreflang</code> links; Spanish is the <code>x-default</code>.</p>

Opening `/en/curso`, the router switches the app to English and takes you to `/curso`: it's the same page, without the prefix. Inside the app, the tab title is written again every time you change page and also when you change language. An end-to-end test checks, for example, that `/curso` in an English browser is titled “Course from scratch · SwiftFlow”.

## How it was done, according to git

The plan was in the roadmap as phase 13, in four parts: the base and the typing screen; the history; the course, summary and landing; and the content. That day it played out like this:

| Commit | What it did |
| --- | --- |
| The base | `t()`, the language switch and the whole typing screen; Spanish stays the same |
| The history | 84 achievements (94 today), tips with their own grammar, challenges, ranks, dates and numbers |
| The pages | Course, summary, landing and tab titles: 33 files, about 2,000 new lines |
| The content | Words, quotes, texts, classics, dictation and course in English: 42 files |
| Records and links | Records per language and an English version of every page to share |

<p class="tbl-note">The five commits of September 25, 2026, in order.</p>

The whole interface was translated first, with the Spanish identical to before, and only then came the English content and the language of each run.

## What's left

- The PWA manifest still has `lang: "es"` and a Spanish description: once installed, the app presents itself the same way in both languages.
- The app has two languages, and adding a third isn't just translating the interface: it would need its own text banks, punctuation rules, voices and accented borrowed words.

## If you're translating an app with content

- Separate the interface language from the content language from day one, even if they point to the same place at first.
- Use messages that can be functions. Grammar (plurals, articles, lists) doesn't fit in a string with blanks.
- Have a test compare the shape of the catalogs. It's the cheapest way not to forget anything.
- When you add a language to data that already exists, make a missing language mean the old one. Then you migrate nothing.
- Write the content's per-language rules (punctuation, accents, voices) in code, not in translations.
- Share previews don't run JavaScript: if you want a link to show in another language, generate its HTML at build time.

> What I take away: in an app where the text is the product, i18n isn't a layer on top. You have to decide what's interface and what's content, and then make sure yesterday's data still holds in today's language.
