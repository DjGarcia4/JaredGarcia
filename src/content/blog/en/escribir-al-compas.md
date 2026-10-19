---
title: "Typing to the beat: what I learned building a rhythm game for SwiftFlow"
description: "Four tracks synthesized with Web Audio, sheet music built from words, every hit graded in milliseconds and a calibration for your keyboard: how I added a mode to a typing test where the song sets the speed."
date: 2026-10-19
tags: [swiftflow, web-audio, games, rhythm]
projects: [swiftflow-typing-test]
kind: learning
keyword: "rhythm"
cover: /img/projects/swiftflow/ritmo-juego.webp
---

In every mode of [SwiftFlow](/project/swiftflow-typing-test), you set the speed: you type as fast as you can and at the end it tells you how fast that was. I wanted a mode that worked the other way around, where the music sets the speed and your job is to be on time. That's how **Rhythm** came about: letters fall toward a line, each one down the lane of the finger that types it, and you hit them right as they land, Guitar Hero style.

From the outside it looks like just another game. Inside, it has three problems I had never solved: making music without audio files, having a clock you can trust to the millisecond, and grading every hit fairly even though your keyboard and speakers have their own delay. This is what I built, with the actual rules from the code.

## What you see when you open it

Rhythm is one more mode in the menu (key **R**), but it has its own screen. Before starting you pick a track and a difficulty, and behind them a demo plays itself so the mechanic makes sense without reading anything.

<figure>
  <img srcset="/img/projects/swiftflow/ritmo-inicio-800.webp 800w, /img/projects/swiftflow/ritmo-inicio-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/ritmo-inicio-1600.webp" alt="SwiftFlow's Rhythm start screen (in Spanish): the four tracks with their tempo (Neón selected), the four difficulties with bars (Difícil selected), the Start button and the offset at 0 ms with a Calibrate button." loading="lazy" decoding="async" />
  <figcaption>The start screen: ↑↓ change the track and ←→ the difficulty. Behind it, the demo that plays itself.</figcaption>
</figure>

| Track | Tempo | Mood |
| --- | --- | --- |
| Night breeze | 84 BPM | Laid-back, to warm up |
| City pulse | 104 BPM | With a groove |
| Neon | 124 BPM | Danceable, four on the floor |
| Overdrive | 148 BPM | Flat out |

<p class="tbl-note">Each track is a loop of four chords with drums, bass, pads and an arpeggio.</p>

| Difficulty | Letters per beat | Word length | Time on screen |
| --- | --- | --- | --- |
| Easy | 1 | 2 to 5 letters | 2.2 s |
| Normal | 1 | 3 to 7 letters | 1.9 s |
| Hard | 2 | 3 to 9 letters | 1.6 s |
| Expert | 2, or 4 on slow tracks | 4 to 12 letters | 1.35 s |

<p class="tbl-note">“Time on screen” is how long a letter takes from appearing to reaching the line.</p>

The Expert rule on slow tracks has a reason: two letters a beat at 84 BPM is slower than Hard on Overdrive. So below 110 BPM, Expert switches to four letters a beat, in sixteenth notes.

## Music without files

I didn't want copyrighted songs or heavy audio files in a PWA that works offline. So every track is written as data and played by a synthesizer built on the Web Audio API. A bar is 16 steps: `x` plays, `.` rests.

```js
// Neon, 124 BPM: four on the floor
{
  id: "neon",
  bpm: 124,
  chords: [[59, 64, 67], [60, 64, 67], [59, 62, 67], [57, 62, 66]], // Em C G D
  bass: [40, 48, 43, 50],
  kick:        "x...x...x...x...",
  snare:       "....x.......x...",
  hat:         "..x...x...x...x.",
  bassPattern: "x.o.x.o.x.o.x.o.", // x the root, o the octave, 5 the fifth
  arp:         "0120120120120120", // which note of the chord to play
}
```

Each instrument is a handful of nodes. The kick is a sine wave dropping from 150 to 42 Hz in 120 ms; the snare, white noise through a band-pass filter plus a triangle hit; the hi-hat, noise through a high-pass. The bass is a filtered sawtooth and the pads are soft triangles. Everything goes through a compressor at the end so the mix doesn't clip.

There's a detail I like: when you hit a letter, it plays a note from the chord sounding at that moment, and each letter of the word climbs one step up the chord. Typing “ancho” on time sounds like an arpeggio inside the song, not a click on top of it.

## A clock you can trust

This is where I learned the most. In a rhythm game, 45 ms is the difference between “Perfect” and “Good”. `setTimeout` and `requestAnimationFrame` aren't enough: the browser delays them when it's busy, and a note that plays late throws off everything else.

The fix is the classic one for web audio, the lookahead scheduler. Every 25 ms a timer checks which notes fall in the next 150 ms and schedules them on the `AudioContext`'s own clock, which is exact. If the page stutters for a moment, the notes are already scheduled and still play on time.

And the whole game runs on that same clock. The question “what millisecond of the song are we at?” isn't answered by `performance.now()`, but by what's actually being heard:

```js
// Simplified: the moment of the song that's playing right now
const now = () => {
  const stamp = ctx.getOutputTimestamp?.();
  if (stamp?.performanceTime > 0) {
    const heard = stamp.contextTime + (performance.now() - stamp.performanceTime) / 1000;
    return (heard - startAt) * 1000;
  }
  // No timestamp: the audio clock minus the output latency
  return (ctx.currentTime - startAt - (ctx.outputLatency || ctx.baseLatency || 0)) * 1000;
};
```

Same with keys. A `keydown` reaches the code a little after you pressed, so the hit is dated with the event's `timeStamp`, not with the moment the code reads it:

```js
const at = player.now() - (performance.now() - event.timeStamp) - rhythm.offset;
```

`rhythm.offset` is the calibration offset, which I explain further down.

## The sheet music comes from words

Rhythm has no songs with fixed lyrics. The chart is built every time from words in the language you're practicing, Spanish or English:

1. It keeps the words that fit the difficulty and can be typed with one key per letter on your layout: no Shift, no dead keys. That's why “canción” doesn't make it on a US International keyboard.
2. Each letter lands on a step of the grid, and each word starts on a beat. That way it sounds like a phrase and not a string of letters.
3. Between words there's a rest of one or two steps.
4. Sometimes the last letter has a **tail**: you hold it down through the rest. The tail ends one step before the next word so they don't overlap.

Randomness is passed in as a parameter (`random`), so the same seed gives the same chart. That lets the tests check things like “every word starts on a beat” or “no letter lands outside the playing part” with results that don't change between runs.

<figure>
  <img srcset="/img/projects/swiftflow/ritmo-sostenida-800.webp 800w, /img/projects/swiftflow/ritmo-sostenida-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/ritmo-sostenida-1600.webp" alt="Rhythm on City pulse, Normal difficulty: the “u” of “usted” is hit as Perfect, and the next “s” falls down the right index lane. Below, the current word and the ones coming." loading="lazy" decoding="async" />
  <figcaption>Below, the current word with the letter that's due and the ones coming. The big number in the background is the combo.</figcaption>
</figure>

## One lane per finger

The stage has eight lanes, one per finger, from the left pinky to the right pinky. Each letter falls down the lane of the finger that types it on your layout, in that finger's color, the same as in the finger picker and the on-screen keyboard. On a Latin American keyboard the “ñ” comes down the right pinky; on Dvorak, the “h” comes down the right index.

That turns the game into real practice. If a word makes you jump from one pinky to the other, you see it coming on screen before you play it.

## Every hit is graded

The scoring logic lives in a pure module: times go in, grades come out. It knows nothing about the canvas or the audio, which is why it can be tested end to end.

| Grade | Window | Points |
| --- | --- | --- |
| Perfect | ±45 ms | 100 |
| Good | ±100 ms | 70 |
| Early / Late | ±160 ms | 40 |
| Miss | The letter went by, or you hit another | 0, and the combo resets |

<p class="tbl-note">Points are multiplied by the combo (×1 to ×8) and doubled in star mode.</p>

The hardest thing to decide was what happens with a key that doesn't match:

- **A press far from any note doesn't count.** If you hit something when no letter is within 160 ms, it's ignored. Punishing it would make the game feel unfair with every brush of the keyboard.
- **The wrong letter near a note does cost.** It costs a miss on the nearest note that was waiting.
- **If two notes are in reach**, the key goes to the one with the matching letter, and if none matches, to the earliest.

The combo raises the multiplier one step every 10 hits in a row, up to ×8. Every 50 in a row turns on **star mode**: eight seconds of double points, with the line shimmering and the cards glowing.

<figure>
  <img srcset="/img/projects/swiftflow/ritmo-estrella-800.webp 800w, /img/projects/swiftflow/ritmo-estrella-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/ritmo-estrella-1600.webp" alt="Rhythm on Overdrive, Expert, with “¡Modo estrella!” (star mode) in large letters, the multiplier at ×6 highlighted and the line in finger colors, halfway through the word “escribir”." loading="lazy" decoding="async" />
  <figcaption>Combo 51 turns on star mode: the big banner, the multiplier card lit up and double points for eight seconds.</figcaption>
</figure>

### Held letters

Tails add points for every millisecond the key stays down, times the combo. Two rules keep them fair:

- Letting go up to 100 ms before the end counts as held all the way. Nobody lets go exactly on time.
- Letting go early only loses the rest of the bonus, not the combo. You already hit the letter.

And if the window loses focus with a key held down, every tail ends right there. Without that, a Cmd+Tab would leave a note “held” forever.

## Calibrating your keyboard

Every keyboard and every audio output has its own delay. With Bluetooth headphones, for example, what you hear arrives well after what the browser scheduled. If you don't correct for it, someone playing perfectly sees “Late” on everything.

The calibration is a short test: twelve clicks at 100 BPM and you press Space on each one. The first four are for catching the beat and don't count. From the rest it takes the **median** difference, not the mean, so one badly missed hit doesn't move everything. If fewer than half the hits were counted, the test isn't saved and asks you to try again. You can also set it by hand.

The results help you calibrate without asking. If your average offset goes past 35 ms either way, it tells you: “Your hits always land late: if that's not on purpose, calibrate the offset.”

## The results

At the end there's a stamp with your rank, as rhythm games do:

| Rank | What it takes |
| --- | --- |
| S | No misses and 95% timing or better |
| A | 90% timing |
| B | 80% |
| C | 65% |
| D | Anything below |

<p class="tbl-note">Timing weighs each letter by its grade: a Perfect counts whole, a Good 0.7 and an Early or Late 0.4.</p>

<figure>
  <img srcset="/img/projects/swiftflow/ritmo-resultado-800.webp 800w, /img/projects/swiftflow/ritmo-resultado-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/ritmo-resultado-1600.webp" alt="The results of a Rhythm track (in Spanish): rank S, “Not a single miss!”, 298,890 points, 100% letters hit and timing, best combo of 258, 258 perfects, 5 ms late with ±6 ms spread, 48 wpm, 18 of 18 held to the end and star mode ×5." loading="lazy" decoding="async" />
  <figcaption>Beyond the score: the count of every grade, whether you run early or late, and how spread out your hits are.</figcaption>
</figure>

There are two numbers that don't exist in the other modes: the **average offset** (whether you tend to run early or late) and the **spread** (how far from the beat your hits land, either way). The first you fix by calibrating; the second is what actually improves with practice.

The run is saved in the history like any other mode. It has its WPM (letters hit over the stretch of the song), its accuracy and the same per-key stats as the other modes, so it feeds the error map, the streak and the tips. What's specific to Rhythm (score, grades, offset, tails) is kept apart, and records are kept per track and difficulty. It also brings three achievements: “On time” (a whole track without a miss), “Metronome” (±35 ms spread or less with 90% of letters) and “Star” (turning on star mode), plus a daily challenge.

## Make it feel alive, in every theme

The stage is drawn on a `<canvas>` once a frame. Notes move on the song's clock, and the effects they leave (sparks, labels, confetti) on the page's clock, so they keep running after the song ends and in the start-screen demo.

There's a beam of light down the lane of the next letter and a ring closing over the spot where it'll land, ripples on a hit, a shake and red edges on a miss, and an equalizer in the background. Everything is painted with the theme's colors read from the page, so it looks just as good in light, dark and high contrast. With reduced motion, all of it stays still.

<figure>
  <img srcset="/img/projects/swiftflow/ritmo-claro-800.webp 800w, /img/projects/swiftflow/ritmo-claro-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/ritmo-claro-1600.webp" alt="Rhythm in the light theme: the eight lanes in each finger's color on a white background, the “e” and “c” of “cerebro” falling down the left middle finger's lane with its beam of light." loading="lazy" decoding="async" />
  <figcaption>The same stage in the light theme: the canvas reads the theme's colors instead of hard-coding them.</figcaption>
</figure>

## How I test it

- **27 unit tests** in Vitest on the pure parts: the chart (every word starts on a beat, no letter lands outside the song, same seed same chart, tails end before the next word, it builds on all four tracks and difficulties), the judging (windows, combo, multiplier, star mode, tails let go early) and the results (rank, records per track).
- **2 end-to-end tests** in Playwright: the start screen remembers the track and difficulty after a reload, and Esc leaves a run without saving it.
- **What has no tests**: the synthesizer and the canvas. jsdom has no `AudioContext` and no canvas, the same tradeoff the share card already had. Without an `AudioContext`, the clock still runs silently on `performance.now()`, so the rest of the game can still be tested.

## What's not there

- **It's played on a physical keyboard.** On a phone you get a notice: there's no fair way to grade milliseconds on an on-screen keyboard.
- **Output delay depends on the browser.** `getOutputTimestamp` and `outputLatency` aren't equally reliable everywhere; that's why calibration exists and I don't rely on the estimate alone.
- **Few tracks.** There are four, and they're four-chord loops. Making more is cheap (they're data), but making them sound different from each other is composing work, not code.
- **Words with Shift or a dead key are left out.** It's a choice: one letter, one key. It costs some Spanish words, but every hit is graded without ambiguity.

## If you're building something similar

- Use the audio clock for everything. If the music runs on one clock and the game on another, they drift apart.
- Date every key with `event.timeStamp`, not with the moment you read it.
- Put the judging in a pure module. It has the most rules and it's the one thing that really needs tests.
- Pass randomness in as a parameter. A chart that comes out the same with the same seed can be tested.
- Offer calibration from the start and use the median. Everyone's hardware is different, and one bad hit shouldn't move the count.
- Decide what you won't punish. Ignoring presses far from a note did more to make the game feel fair than any tweak to the windows.

> What I take away: in a rhythm game the problem isn't drawing falling letters, it's agreeing on what “now” is. When the music, the letters and the keys all measure time with the same clock, everything else becomes arithmetic.
