---
title: "Tell me what I get wrong: turning keystrokes into advice"
description: "How SwiftFlow turns every key you press into concrete advice: which key you mix up with which, which finger lags behind, what slows you down even when you don't miss it, and a mode that practices exactly that."
date: 2026-10-13
tags: [swiftflow, ux, data]
projects: [swiftflow-typing-test]
cover: /img/projects/swiftflow/fallas-dedos.webp
kind: learning
keyword: "mistakes"
---

Knowing you type at 58 words per minute doesn't help you type at 70. That's what got me to build [SwiftFlow](/project/swiftflow-typing-test): the typing site I used filled up with ads and, on top of that, it only measured. It didn't say what to improve: what to do with the number was up to you.

What I had to redo most across the whole project was exactly that: how to go from "you missed here" to "this is what's happening and this is how you practice it". This post covers how it ended up, with the real rules and thresholds, and the times the advice said something that wasn't true.

## The problem: a mistake only says "not this one"

The first version of the per-key stats kept two counters per character: how many times it came up in the text and how many times you missed it. That's enough for a heatmap and a tip like "practice the R". But that tip has three problems:

- It doesn't say what happened. Missing the R because your finger drifts to the T is a position problem; missing it because you type "tr" backwards is a rhythm problem. They're different fixes.
- It can't see speed. The keys that cost you time are almost never the ones you miss: you don't miss the Ñ, you hesitate on it.
- It confuses volume with weakness. In Spanish, the key with the most mistakes in absolute numbers is usually just the one you type the most.

So the work was storing more about every keystroke and, above all, setting thresholds so the advice only speaks when it has something to say.

## What gets stored from each keystroke

Every time the typed text grows, a function compares the new part against the reference text and returns, for each character, what was expected, what you pressed and where. Backspaces produce no keystrokes: only growth counts.

```js
// Simplified: from two versions of the input, the new keystrokes.
const diffKeystrokes = (prev, next, text) => {
  const strokes = [];
  for (let i = prev.length; i < next.length && i < text.length; i++) {
    strokes.push({ index: i, expected: text[i], typed: next[i], correct: next[i] === text[i] });
  }
  return strokes;
};
```

With that, each session stores:

| Data | What it is | What it's for |
| --- | --- | --- |
| Attempts and misses per key | By the character the text asked for | Which keys you miss proportionally |
| Confusions | The pair "what was expected + what you pressed" ("rt") | Which key you press instead of which |
| Transpositions | Pairs that came out backwards ("ue" as "eu") | Whether your fingers get ahead of you |
| Time per key and per pair | `[total ms, count]` | What slows you down even when you don't miss it |
| Position of each mistake | The index in the text, fixed or not | Which whole words trip you up |

<p class="tbl-note">What each session stores besides WPM and accuracy. All of it lives in the browser, with no account and no server.</p>

One detail that mattered: mistakes fixed with backspace are stored too. If you slipped and fixed it, that key still cost you.

## Which key you mix up with which

Knowing which key you pressed instead of the right one turns "you miss the R" into "you press the T", which is a different fix. The tip «You mix up R and T» only shows up when it's a habit, not scattered noise: the same wrong key has to come up at least 6 times and be at least 35% of that key's misses. Together, those two numbers mean around 17 misses of a key with 6 landing on the same neighbor.

Then it looks at the keyboard you're typing on (Spanish from Spain, Latin American, US English, Dvorak or Colemak) to see whether the two keys sit side by side on the same row. If they do, the tip says your finger drifts to the key next door and to slow down in that area; if not, it says it's a hand position mistake, not a speed one.

Case confusions ("A" for "a") are dropped: "you mix up A and A" makes no sense. Accent ones stay, because typing "a" where "á" belonged is the habit of dropping the accent.

## When your fingers get ahead of you

Transpositions were where the advice could most easily lie. The loose test, "the key you pressed is the one that came next", fires on any slip that lands on the following letter, and in Spanish the following letter is a vowel most of the time. So the rule demands a confirmed swap: two mistakes in a row, in consecutive positions, where each one is the other's letter.

```js
// Simplified: "qeu" for "que" needs both halves.
const isTransposition = (prev, cur) =>
  prev && cur.index === prev.index + 1 &&
  !prev.correct && !cur.correct &&
  prev.typed === cur.expected && cur.typed === prev.expected;
```

The tip «Your fingers get ahead of you» shows up with at least 10 transpositions that make up at least 10% of your mistakes, and names the pair that flips the most. Since a swap also leaves two entries in the confusions ("ue" and "eu"), they're subtracted in both directions when the data is merged: otherwise one swap would count as two confusions.

<figure>
  <img srcset="/img/projects/swiftflow/fallas-patrones-800.webp 800w, /img/projects/swiftflow/fallas-patrones-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/fallas-patrones-1600.webp" alt="Three SwiftFlow tips in Spanish: you mix up the R and the T, your fingers get ahead of you, and your left ring finger misses more, with three words that trip you up below." loading="lazy" decoding="async" />
  <figcaption>The landing's "Mistakes have a shape" section, with example data: the same components the history shows.</figcaption>
</figure>

## The weak key isn't the one you miss most

The first per-key tip ranked by miss rate with a floor of 20 attempts. In Spanish that always recommended rare letters (X, Q, W) whose 25% came from a handful of tries, right below a ranking sorted by absolute misses and led by the R. Two different criteria, neither explained, and the tip seemed to contradict the list above it.

The current rule for a letter to count as weak:

| Condition | Threshold |
| --- | --- |
| Attempts on that key | 60 or more |
| Misses on that key | 8 or more |
| Share of all your mistakes | 3% or more |
| Miss rate | 1.25 times your average or more |
| Total data before any tip at all | 200 keystrokes |

<p class="tbl-note">Keys that pass are ranked by the misses they cost above your own average, so both rate and volume count.</p>

Ranking by "excess misses" settles the clash between rate and volume: a key at 25% typed 60 times (about 9 extra misses) ranks above one at 30% typed 20 times (about 5). And when the most-missed key in absolute numbers isn't the recommended one, the tip explains it instead of ignoring it, with a sentence like «The R adds up more mistakes, but only because you type it far more often». If that weak key is also the one you mix up, the confusion folds into the same tip (for example: «When you miss it, 7 out of 10 times you hit the T») instead of taking another slot.

All of this is computed over the last 30 sessions, not the 200 that are stored: what you fumbled fifty sessions ago isn't what to practice today.

## Hand, row and finger

Some problems aren't about one key. The per-key stats get summed by hand, by keyboard row and by finger, using the layout you picked: on Dvorak the letters move to other fingers and so does the advice.

- Hand: the worse one has to miss at least 1.3 times what the better one misses, with 50 attempts on each side.
- Row: the same 1.3 gap between the worst and best letter rows.
- Finger: compared against the median of your fingers, not the best one, because the best is often a finger that barely types anything hard. It needs four fingers measured with 50 attempts each, at least 5 misses on the worst one and the same 1.3 gap. If almost all your fingers are at zero, the comparison is against the rest pooled, so a very accurate typist's one bad finger still shows.

Only one of the three makes the list, the one with the biggest gap, so "your left hand" and "your left ring finger" don't tell the same story twice. The "Your fingers" card in the history and the tip use the same function to decide which finger is weak, so they never contradict each other.

<figure>
  <img srcset="/img/projects/swiftflow/fallas-dedos-800.webp 800w, /img/projects/swiftflow/fallas-dedos-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/fallas-dedos-1600.webp" alt="The 'Your fingers' card in Spanish: eight fingers with their miss rate and milliseconds per key, the left pinky marked as missing most and the right ring finger as slowest, above a keyboard colored by finger." loading="lazy" decoding="async" />
  <figcaption>"Your fingers", with the landing's example data. The finger that misses most comes with a button to practice it alone.</figcaption>
</figure>

## What slows you down even when you don't miss it

Everything above is accuracy. But the keys that cost you time are almost never the ones you miss. To see them, each session measures the interval between keys, with strict rules about which intervals count:

- Only between two consecutive correct keystrokes. An interval that ends on a wrong key measures a different key; one that starts on a mistake is mostly the moment of noticing.
- Only if one character arrived at a time. Several at once is a paste, predictive text or a swipe, not typing.
- Only between 15 ms and 2 s. Below that it's key repeat or a double event. The ceiling sits under the 3 s auto-pause and above genuine hesitation: hunting for the Ñ takes about a second, and that's exactly the signal.
- Anything outside is dropped, not clamped. Pinning it to 2 s would drag slow keys' averages toward the ceiling and manufacture the very result the tip reports.

Intervals come off the active clock, which already has pauses subtracted, so they can't span a pause by construction.

To call a key "slow" it's compared against the median of your keys, not the mean. The mean gets inflated by the very slow keys being looked for, which would shrink every ratio and cancel out the effect. The median is literally "your middle key", which is what the tip says.

| Tip | When it shows up |
| --- | --- |
| «Ñ slows you down» | At least 30% slower than your median, with 60 samples, and not already a weak key |
| «Your slowest pairs» | A pair 50% slower, with 25 samples: pairs come up less and have to stand out more |
| «Your … is the slowest» | A finger 35% slower than your typical finger, with 40 samples and four fingers measured |
| Any speed tip | 500 measured intervals overall |

<p class="tbl-note">The 30% sits above what keyboard geometry produces: the bottom row runs 10–15% slower than the home row for everyone, and the tip has to be about you, not the keyboard.</p>

Excluding weak keys has a concrete reason: the tip says «You almost never miss it». If the key was already showing up as weak, that sentence would be false, and it would also spend two of the four slots on the same key.

<figure>
  <img srcset="/img/projects/swiftflow/fallas-frena-800.webp 800w, /img/projects/swiftflow/fallas-frena-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/fallas-frena-1600.webp" alt="Card with the slowest keys and pairs: each with a bar, its milliseconds and how much slower it is than the usual pace." loading="lazy" decoding="async" />
  <figcaption>"What slows you down even when you don't miss", also with the landing's example data.</figcaption>
</figure>

## Four tips, ranked by severity

"What to improve" shows at most four tips, and there are more candidates than slots: weak keys, confusion or transposition, space, hand/row/finger, speed, words that trip you up, numbers, accents and the speed/accuracy balance (below 92% recent accuracy it suggests slowing down; from 97%, pushing the pace).

At first they came in a fixed order. Now each tip scores itself as "how many times over my own threshold am I", which puts them all on one scale: one that barely qualified never pushes out one that blew past its bar. The four most severe stay and are shown in the original order, which runs from the most specific to the most general. Tips of the same kind share a slot: confusion and transposition compete for one, the three speed tips for another.

## From advice to practice

A tip that leaves you to work out how to practice is half the job. The weak-key tip was already carrying the keys it named in an array that nothing read; now that array feeds the Train mode.

The key was having the tip and the training use the same function to pick keys. With two definitions, sooner or later the history would recommend one thing and the mode would practice another. If you pick keys by hand, your choice wins.

The text is built like this:

- Most of it is real words from the bank, because typing prose is the actual skill.
- About 30% are made-up syllables around the target key, vowels either side of a consonant and consonants either side of a vowel, so they stay pronounceable: the Ñ is drilled as "ñaño", not "ñtñs".
- Each key has its own pool of words, weighted by how many times the letter appears.

That last point came from a bug. At first there was a single pool for every key, and since the A is in almost every Spanish word, it filled it up. Picking a, f, m, h and ñ produced a text with no f and no ñ at all. Now keys are drawn a cycle at a time: ten words across five keys means two each, shuffled every pass so it doesn't read as a rotation.

The other tips lead somewhere too: the hand or finger tip opens Fingers mode with just that finger, the numbers tip opens Numbers, and the words tip opens Train with those words. During a run, if a letter is getting away from you (at least 3 misses, 15% miss rate and twice your rate in that session, after 40 keystrokes), a notice appears with "Train now".

Training isn't endless either. Each letter aims to come down to 60% of the rate it started the day with, never below 5%, with at least 40 attempts that day. When all of them get there, you're done for today; after five rounds without improvement, or eight in total, it tells you to rest. Drilled letters go on a spaced review: they come back the next day and then after 3, 7, 14 and 30 days.

## Getting better or not?

Today's snapshot doesn't say whether you're improving. "How your keys are going" compares your latest sessions against the ones before, up to 30 on each side and never fewer than 10, and only shows a key if it moved at least two points and a quarter of where it was, with 40 attempts on each side. The finger cards do the same with an arrow. Halving the miss rate of a key or a finger unlocks "Tamed key" or "Tamed finger".

## What's still pending

The plan lives in the repo's roadmap. What relates to this analysis and isn't done are things that need a server: challenging a friend with a link (designed to fit in the URL, but on hold) and a public leaderboard. As long as the data lives only in your browser, the analysis stays with you, and that's a decision I'd rather keep.

## If you're building something similar

- Store what was pressed, not just what was missed. The difference between "you miss the R" and "you press the T" is the difference between a data point and advice.
- Put volume and share thresholds on every claim, and write them down with the why next to them. A tip based on 12 attempts is noise with good copywriting.
- Compare against the person's median, not the mean and not their best case.
- If the tip's wording claims something ("you almost never miss it"), make sure the rule guarantees it.
- Have the advice and the practice come from the same function. Two definitions end up saying different things.

> What I take away: a tip is a claim about someone, and every claim needs a rule that makes it true. The work wasn't measuring more, but deciding when to stay quiet.
