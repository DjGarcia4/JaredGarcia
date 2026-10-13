---
title: "Measuring right: net WPM, accuracy and a clock that knows when to stop"
description: "Why SwiftFlow only counts complete, correct words, measures accuracy over every key (including the ones you erased), pauses the clock after 3 seconds and keeps sessions measured with different formulas apart."
date: 2026-10-13
tags: [swiftflow, metrics, product]
projects: [swiftflow-typing-test]
cover: /img/projects/swiftflow/medir-resultados.webp
kind: learning
keyword: "WPM"
---

Before giving any advice, a typing test has to measure right. It sounds like the easy part: words divided by minutes. But the first formula in [SwiftFlow](/project/swiftflow-typing-test) inflated the numbers, and one of the reasons I liked the site I used before was exactly that: it didn't have much, but it measured well.

This post covers how SwiftFlow measures today, what was wrong with the first version and what happens in the odd cases: the clock that pauses itself, the last word the timer cuts off, code with line breaks and the runs that don't count.

## What the first version got wrong

The original formula was two lines. It split everything typed on spaces, counted the pieces and divided them by the whole seconds elapsed. Accuracy compared only the final text against the reference.

```js
// The original formula (simplified): counts pieces, not hits.
const wpm = typed.trim().split(/\s+/).length / (seconds / 60);
const accuracy = correctCharsInFinalText / typed.length;
```

That had several problems at once:

- A misspelled word counted the same as a correct one. And a short word counted the same as a long one.
- Whatever you erased with backspace vanished from accuracy. If you fixed everything, you ended up at 100%.
- Time was whole seconds, so in a short run one second of rounding moved the result a lot.
- Pausing showed a banner but didn't stop the clock: the paused time was charged when you came back.
- In Words mode, the run ended as soon as you started the last word, not when you finished it.

I redid all of it in one big change, in mid-September 2026. The code comment documents three versions of the formula, and sessions store which version they were measured with (more on why that mattered below).

## Net WPM: only complete, correct words count

The typing-test convention is that a "word" is 5 characters, so the result doesn't depend on whether the text has long or short words. On top of that, SwiftFlow follows Monkeytype's rule for net WPM:

- A word adds its characters only if it's complete and exactly matches the text.
- The space after a correct word adds too; the one after a wrong word doesn't.
- A word with a single mistake, or half-typed, adds nothing.

```js
// Simplified: walks the text in words and whitespace.
for (const { index, 0: chunk } of text.matchAll(/\S+|\s+/g)) {
  if (index >= input.length) break;
  if (/\S/.test(chunk)) {
    prevOk = input.slice(index, index + chunk.length) === chunk;
    if (prevOk) counted += chunk.length;
  } else if (prevOk) {
    counted += matchingChars(input, text, index, chunk.length);
  }
}
const wpm = Math.round(Math.max(0, counted - 1) / 5 / (elapsedMs / 60000));
```

Two details in that last line:

- Time is in milliseconds, not whole seconds.
- One character is subtracted. The clock starts on the first key, so that key takes no time: n characters really span n − 1 intervals. Without that, short texts got a free character's worth of speed.

While you type, live WPM is computed as if at least one second had passed; otherwise the first couple of keys give absurd spikes. At the end, the real time is used.

Next to net WPM, raw WPM is shown: every key pressed, right or wrong, including the ones you later erased. The gap between the two is what your mistakes cost.

## Accuracy: over every key, including the ones you erased

Accuracy is the share of all keys pressed that were correct. A mistake fixed with backspace still counts against it, so fixing everything doesn't read as 100%.

```js
// Simplified.
const accuracy = keystrokes ? Math.round(((keystrokes - errorKeystrokes) / keystrokes) * 100) : 100;
```

The result's "Mistakes" are something else: the characters left wrong in the final text. The difference between wrong keys and final mistakes is shown separately as "mistakes fixed".

A hypothetical example, with the text "hola mundo feliz" (16 characters) typed in 4 seconds:

| Case | Net WPM | Raw WPM | Accuracy | Old formula |
| --- | --- | --- | --- | --- |
| No mistakes | 45 | 45 | 100% | 45 WPM · 100% |
| "mundi" instead of "mundo", not fixed | 27 | 45 | 94% | 45 WPM · 94% |
| The same "i", fixed with backspace (same time) | 45 | 48 | 94% | 45 WPM · 100% |

<p class="tbl-note">Numbers worked out by hand with the formulas in the code, on a made-up case. In the second row, "mundi" and the space after it add nothing: 10 characters remain.</p>

The middle row is the one that changed most: with the old formula, a misspelled word was worth the same as a correct one. The bottom one shows the other side: fixing saves your net WPM, but not your accuracy.

<figure>
  <img srcset="/img/projects/swiftflow/medir-resultados-800.webp 800w, /img/projects/swiftflow/medir-resultados-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/medir-resultados-1600.webp" alt="SwiftFlow's results screen in Spanish: WPM, accuracy, time and mistakes in four cards, and below them max combo, raw WPM, consistency, mistakes fixed and the most-missed key, with the WPM-per-second chart." loading="lazy" decoding="async" />
  <figcaption>A 15-second run typed by a test script, with two mistakes fixed: none are left in the text, but accuracy doesn't reach 100%.</figcaption>
</figure>

## The clock: when it starts, when it stops, when it pauses

Measuring right is, above all, measuring the right time.

| Moment | Rule |
| --- | --- |
| Start | On the first key, not when the page opens |
| End in Time | Exactly the chosen limit (15, 30, 60 or 120 s) |
| End in everything else | On the last key: the time you spend reaching for a button doesn't count |
| Words and Numbers | End when the text is complete, not when the last word starts |
| 3 s without typing | Auto-pause, with the clock frozen at the last key |
| Typing again | Resumes on its own, and the paused time isn't charged |

<p class="tbl-note">The clock's rules. In Time, the text keeps growing as you type, so it never runs out before the limit.</p>

The auto-pause has a subtlety: it doesn't freeze the clock when it kicks in, but at the last key. Otherwise the three seconds of waiting before it kicks in would still be charged. On resume, the clock's start moves forward by however long the pause lasted, so active time stays continuous. The intervals between keys I use for the analysis come off that same active clock, so they can't span a pause.

Esc pauses too, and a second Esc ends the run, which is shown but not saved. There was a design mistake there: if you stopped to think, the 3 seconds paused on their own, and the Esc you pressed to pause ended the run. Now the state remembers whether you asked for the pause, and only an Esc on a pause you asked for ends it. In Zen, which has no limit, that second Esc is the normal way to finish, and that run is saved.

When a run ends, there are 2 seconds where no key does anything. I added it because the space after the last word, especially when the clock cut off mid-word, restarted the run before you could see the results.

## Combo and consistency

The combo is the run of correct characters ending where the cursor is: a mistake breaks it. There are messages at 25, 50, 100, 150, 200, 300, 400, 500, 750 and 1000. Two rules keep it from over-celebrating:

- Below 100, each milestone is celebrated once per run, because you reach them over and over every time the combo restarts.
- It only counts if the run grows by exactly one. When you fix something with backspace, the run jumps back to where it was, and celebrating a combo you already had makes no sense.

Consistency measures something else: not how fast, but how even. It counts the new ground covered in each whole second of the run (retyping what you erased is covering the same distance twice, not pace) and computes the coefficient of variation across seconds. That number is mapped the same way Monkeytype does it, so it means what people already know: 100% is a metronome. The last, partial second doesn't count because it would read as a slowdown, and a run under 3 whole seconds shows no consistency.

I chose the timeline over the WPM chart because cumulative WPM smooths itself out as the run goes on and can't show a stumble.

## What counts as a session and what counts as a record

A run is saved to the history only if it reached its end. These aren't saved, even though they show results:

- Cut short with Esc before the limit.
- With "Sudden death", if a mistake ended it.
- With "Minimum accuracy" (90, 95 or 98%), if it fell below.

With "Fix to move on", the wrong letter doesn't go into the text, but the key does count against accuracy and the combo starts over from that point. A run that passes a demanding mode is an ordinary run, flagged in the history, so no separate records are needed.

Records are per kind of session: mode, value and language. "Time · 15 s" and "Time · 60 s" don't compete, and an English text doesn't compete with a Spanish one. A perfect round requires zero wrong keys, not even fixed ones, and at least 20 keystrokes: a Zen run ended after five letters isn't an achievement.

The history keeps the last 200 runs. Per-key timing, the heaviest part, is dropped past the 40 most recent; WPM, accuracy and per-key mistakes stay.

## Versioning the formula

Changing how you measure has a cost: old sessions are measured with a different yardstick. If I mixed them, a record inflated by the old formula would be unbeatable.

Every session stores `metricsVersion`. Records, averages, the trend and day-to-day consistency use only sessions from the current version. Old ones stay in the list with a "v1" tag and the note «Measured with the old WPM formula: doesn't count toward records or averages». Streaks, counts and achievements do use the full history: what you've already earned isn't lost.

Later I added a second, separate version, `insightsVersion`, for the rules behind the per-key analysis (what counts as a swap, which interval counts as typing). I kept them apart on purpose: throwing out an old analysis should never take someone's records with it.

## Odd cases

- No punctuation. If you turn it off, the text is lowercased and stripped of accents and symbols, including ¿ and ¡. The ñ survives: decomposing characters would split it into n + tilde and lose it, so it's set aside first and put back afterwards. "Año" and "ano" are different words in Spanish.
- Modes that are never formatted. Code (symbols and capitals are the syntax), Train and Fingers (they'd lose the accents they practice), Weekly (it has to be the same text for everyone), My text, Dictation and the lessons.
- Code. It's typed into a `textarea`, not a single-line input, so Enter and indentation are real keystrokes. For net WPM, a line break is whitespace like any other.
- Dictation. The text is dictated plain, but with accents and ñ, because those are heard. It's measured with the same formulas as everything else.
- The last word in Time. If the clock cuts it off halfway, it adds nothing to net WPM (it's incomplete) and doesn't count as a "word that trips you up" either.

## How steady you are from one day to the next

A run's consistency doesn't say whether Tuesday's you types like Thursday's. There's another measure for that: it takes the kind of session you play most among the last 80, because 15 seconds and 120 seconds don't run at the same speed, and averages each of your last 14 days of practice. With fewer than 5 days it says nothing.

The score is 1 minus the standard deviation over the mean, from 0 to 100: from 93 it's "Very steady", from 87 "Steady", from 80 "Up and down", and below that, "Uneven". Keeping 90 or more over at least 7 days unlocks the "Consistent" achievement.

The WPM trend follows the same idea of not reacting to a single run: the line to read is the 5-run average, and the sentence compares your last 10 against the 10 before. A difference under 2 WPM reads as steady, not as a trend.

## What's still pending

What's pending that touches measurement is a public leaderboard for the weekly challenge. It needs a server, and also a defense against fake scores, for example validating the run's timeline against that week's text. Today everything lives in the browser, and nothing stops you from editing your own history; for a personal tool that doesn't matter, for a ranking it does.

## If you're going to measure something similar

- Decide what each number means and write it down next to the formula. "Accuracy" can mean three different things.
- Measure active time, not wall-clock time, and decide what to do with pauses before someone stops to think.
- Version the formula from day one. You're going to change it, and old records shouldn't compete with new ones.
- Separate what's stored from what counts: a failed run can show results without polluting the history.
- Test the edges: the last word cut off, the first character, a backspace, a line break.

> What I take away: a number people are going to chase has to be hard to inflate. Every rule in this post exists because, without it, someone could improve their score without typing any better.
