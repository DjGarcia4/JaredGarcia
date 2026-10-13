---
title: "One app, eleven screens: designing from 60×30 to 4K"
description: "How I design Wink apps so the same app looks right on a full screen, a 1920×360 strip and a 60×30 box."
date: 2026-10-12
tags: [design, css, wink]
projects: [wink-studio]
cover: /img/projects/wink-studio/sizes.webp
kind: learning
keyword: "11 sizes"
---

When a business adds a [Wink](/project/wink-app) app to its screen, it doesn't just pick the app: it picks where it goes. It can fill the whole screen, half of it, a strip under a video or a tiny box in a corner. And the screen can be landscape or portrait.

In [Wink](/project/wink-app)'s layout editor an element is at least 60×30 and has no maximum: canvases go from 1920×1080 by default up to 7680 on custom ones. Portrait is truly portrait (the player rotates the output, so the app sees a tall viewport), and inside groups or on video walls the iframe can be scaled non-uniformly. In other words: the app doesn't know its size or its aspect ratio in advance.

So "the app" isn't one design: it's many. To have a fixed reference, Wink Studio's certification checks every app at eleven sizes taken from the editor's presets and from the typical elements people build in a layout:

| Size | Name | Class |
| --- | --- | --- |
| 60×30 | Editor minimum | mini |
| 240×120 | Small | mini |
| 480×270 | Card | card |
| 600×600 | Square | card |
| 960×540 | Half screen | full |
| 1920×1080 | Full screen | full |
| 1080×1920 | Portrait | full |
| 3840×2160 | 4K | full |
| 1920×360 | Strip | strip |
| 1000×180 | Low strip | strip |
| 360×1920 | Vertical strip | strip |

<p class="tbl-note">The certification's 11 sizes and the class each one gets.</p>

<figure>
  <img srcset="/img/projects/wink-studio/sizes-800.webp 800w, /img/projects/wink-studio/sizes-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/wink-studio/sizes-1600.webp" alt="Daily Menu at 8 of the 11 sizes, at true scale relative to each other." loading="lazy" decoding="async" />
  <figcaption>Daily Menu at 8 of the 11 sizes, at true scale relative to each other.</figcaption>
</figure>

## Not 11 screens, but 4 classes

Designing eleven layouts by hand doesn't scale, and designing one and shrinking it doesn't work either: at 240×120 a whole menu scaled down is unreadable. What I did was group the sizes into four classes by their shape, not their pixels:

- Strip: more than three times longer than it is tall (or taller than it is long, if vertical) and its long side is at least 480. One line fits, or one column.
- Mini: the short side is under 240 and it isn't a strip. One piece of data fits.
- Full: the short side is at least 540 and the long side at least 960. Everything fits.
- Card: whatever is in between, like a 600×600 square or a 480×270. The main thing fits.

The order of the rules matters. The strip rule is checked first: a 1000×180 band has its short side under 240, so by the mini rule it would be mini, but a full line with everything important fits there perfectly. That's why strip wins. The 480 floor on the long side exists for the opposite case: a 400×100 is also more than three times longer than tall, but it's so small that no useful line fits; that one stays mini.

```ts
// Size class (simplified)
function sizeClass(w: number, h: number) {
  const short = Math.min(w, h);
  const long = Math.max(w, h);
  if (long / short > 3 && long >= 480) return "strip";
  if (short < 240) return "mini";
  if (short >= 540 && long >= 960) return "full";
  return "card";
}
```

The SDK measures the app's box, decides the class and writes it on `<html>` as `data-wk-size`, along with `data-wk-orientation` (`portrait` if it's taller than wide). Apps don't work out their size on their own: the CSS adapts to the class, and they all decide it with the same rule. If the box changes size, the SDK only rewrites the attributes when the class or the orientation changes, to avoid extra work.

What changes between classes is what's shown, not just the size. For Weather, for example, the design guide spells it out like this:

| Class | What Weather shows |
| --- | --- |
| Full | City, date and time; large temperature with the icon; the details; the next hours and the next days |
| Card | Temperature and condition (or the short alert), plus the days if there's room |
| Strip | Alternates every 12 s between "now" and the forecast, on one line |
| Mini | Temperature and icon, alternating with the forecast |

## Measure the box, not the screen

The app lives in an iframe that almost never fills the whole screen, so `vw` and `vh` lie: they measure something that isn't the app. That's why the rule is that the root container gets `container-type: size` and everything is measured in container units (`cqmin`, `cqw`, `cqh`). No fixed pixels for design measurements. The certification looks for `vw`/`vh` in the CSS and flags them for review.

Which unit to use depends on the class. In full and card, `cqmin` (the shorter side) gives proportions that work in both landscape and portrait. In a horizontal strip, height is what matters, so type goes in `cqh`; in a vertical strip, width matters, so it goes in `cqw`. The app template already comes with that pattern:

```css
/* Simplified */
.app { container-type: size; padding: 6cqmin; }
.title { font-size: 12cqmin; }

html[data-wk-size="mini"] .app { padding: 4cqmin; }
html[data-wk-size="mini"] .title { font-size: 28cqmin; }
html[data-wk-size="mini"] .meta { display: none; }

html[data-wk-size="tira"] .title { font-size: 45cqh; }
html[data-wk-size="tira"][data-wk-orientation="portrait"] .title {
  font-size: 22cqw;
}
```

With that, the same type looks proportional at 960×540 and at 4K, with no breakpoints involved. Margins follow the same logic: 6 `cqmin` inside, 4 in mini, and the gaps between blocks also in `cqmin`. Breakpoints are left for what really changes: what's shown.

## What stays in each class

This is the design part, and no CSS rule solves it: you have to decide, app by app, what's essential. This is how it ended up in four of the apps:

| App | Full | Card | Strip | Mini |
| --- | --- | --- | --- | --- |
| Daily Menu | Board by category and a featured panel | The board with larger type, no featured panel | One dish at a time, every 6 s | Name and price |
| Queue | The current call and the previous ones | The current call and one or two previous ones | The call inline and the previous ones as chips | Only the current call |
| Order Ready | In progress and ready, in two columns | The same, more compact | Only the ready ones, in a row | The latest ready order |
| Notices | Header, the notice with its icon and the footer | The notice and the footer | The notice in a band | Icon and title |

The question I ask myself for each one is: if someone looks at this box for half a second while walking by, what should they take away? In Weather it's the temperature, in Queue the ticket being called and in the Menu the price. Whatever fails that test is the first thing to go when the box shrinks.

Orientation also changes the arrangement, not just the size. In Daily Menu the featured panel goes on the right in landscape and on top in portrait. In Order Ready, when the box is portrait or nearly square, the columns stack with the ready orders on top, because that's what people are looking for.

## When the box is smaller than the app

Each app declares its minimum useful size in its manifest. Daily Menu says 200×80: below that there's no honest way to show a dish. But the editor allows 60×30, so someone is going to put it there. The rule is that below the minimum the app doesn't break: it shows the logo or nothing, but with no overflow or scrolling. The certification treats it differently: at a size below the minimum it doesn't require something to be visible, but it does require that nothing spills out.

## Measuring for real

Classes solve the shape, but not the content. A menu with 6 dishes and one with 40 can't use the same type size. Several apps measure the text before deciding: Daily Menu splits the dishes into columns and pages with a measurer, so a short menu grows its type to fill the screen and a long one rotates through pages, never breaking a word. Notices picks the largest type size at which the notice still fits, with a binary search:

```ts
// The largest scale that still fits (simplified)
function largestFit(fits: (s: number) => boolean, min: number, max: number) {
  if (fits(max)) return max;
  if (!fits(min)) return min;
  let lo = min, hi = max;
  for (let i = 0; i < 6; i++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) lo = mid; else hi = mid;
  }
  return lo;
}
```

For single-line names there's another tool: shrink the type just enough to fit, with a floor of 60% of the original size. That's how Weather shows "Santa Rosa de Copán" in full instead of cutting it. And for card grids (Queue, Order Ready) there's a function that tries every number of columns and keeps the one that leaves the largest cards, rewarding showing more.

Measuring has a trap I ran into in CI: if you measure the text before the font arrives, you measure with the fallback font. When the real one arrives, the text grows and overflows its space until the next measurement. In the Linux CI, the menu overlapped the footer at 4K because of that. The fix was to load the chosen font before measuring, with a 600 ms cap so it doesn't delay the first paint.

## Text that doesn't fit

The text is written by the customer, so there will always be one longer than I expected. The rule is simple: if a text doesn't fit, it shrinks or gets cut with "…" (`text-overflow` or `line-clamp`). What can never happen is a text chopped through the middle of a letter, overlapping another one or sticking out of the box.

Sometimes the fix is writing a different text. In Weather, the full rain alert didn't fit in the card without riding over the days; now strip and card have a short version of the alert ("Bring an umbrella") that takes the place of the condition.

And I don't check that by eye: the certification fills the settings to the max, with accents and emoji, at four sizes (480×270, 1920×360, 1080×1920 and 240×120), and at all eleven sizes it flags any text cut without "…" and any pair of elements that overlap by more than 20%. That's what the next post is about.

## What I'd tell someone designing for many sizes

- Classify by shape, not by pixels. Four classes with clear rules can be reasoned about; eleven loose sizes can't.
- Let a single piece decide the class. If each component works out its size on its own, sooner or later two parts of the same app will disagree.
- Measure with the container. In anything that lives in an iframe, `vw` and `vh` belong to someone else.
- Decide what goes first. Design at small sizes is a list of priorities, not a shrunken version.
- Test with ugly text: long, with accents, with emoji, written by someone who isn't you.
- Keep all the sizes in view at once while you work. Fixing the strip and breaking portrait is the easiest thing in the world if you only look at one.

> My takeaway: designing for many sizes isn't making one stretchy screen. It's deciding what matters in each shape and letting the system pick the shape on its own.
