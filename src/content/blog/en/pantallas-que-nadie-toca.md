---
title: "Designing for screens nobody touches"
description: "No clicks, no scrolling, read from meters away: what changes when you design interfaces for digital signage, with examples from Queue, Order Ready and Notices."
date: 2026-10-12
tags: [ux, design, wink]
projects: [wink-studio]
kind: learning
keyword: "signage"
---

Almost everything we know about interface design assumes someone interacts: they click, scroll, go back. None of that happens on a [Wink](/project/wink-app) screen. People glance at it in passing, from several meters away, while standing in line or waiting for their order. Nobody touches it.

Technically, touch works on the device, but there's no on-screen keyboard and the cursor is hidden. So the rule for Wink Studio apps is that they aren't interactive unless the manifest says otherwise. The ones that aren't turn off text selection, gestures and the context menu, so an accidental touch doesn't leave something highlighted for hours.

Designing the ten apps made me change several habits. These are the ones that mattered most.

<figure>
  <img srcset="/img/projects/wink-studio/turnero-800.webp 800w, /img/projects/wink-studio/turnero-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/wink-studio/turnero-1600.webp" alt="Queue: the latest ticket called, highlighted, and the previous ones with their counter." loading="lazy" decoding="async" />
  <figcaption>Queue: the latest ticket called, highlighted, and the previous ones with their counter.</figcaption>
</figure>

## One big thing

The design guide starts from one fact: the screen is read from 2 to 5 meters away. Two numbers come from that. On a full screen, the main text takes up at least 8% of the height, and nothing goes below 3%. If something can't be read at 3%, it doesn't go in.

If someone looks at it for half a second, the screen has to have told them what matters. That's why every app has a single main element and everything else supports it, smaller and with less contrast:

- Queue: the ticket just called and its counter, almost as big as the ticket, because that's what the person needs in order to move.
- Order Ready: the order numbers ready for pickup, in large cards on a green panel; the ones in progress, in smaller rows on the side.
- Notices: one notice at a time, with the largest type that fits, and the important ones in red.
- Weather: the current temperature. The forecast is secondary.
- Daily Menu: the dish and its price, with a dotted line that leads the eye from one to the other.

If everything is big, nothing is. The design work is in deciding what gets smaller. And numbers use `tabular-nums`: every digit has the same width, so a clock or a price doesn't jump around when it changes.

<figure>
  <img srcset="/img/projects/wink-studio/01-800.webp 800w, /img/projects/wink-studio/01-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/wink-studio/01-1600.webp" alt="Weather on a full screen with a storm alert: the temperature leads, the rest supports it." loading="lazy" decoding="async" />
  <figcaption>Weather on a full screen with a storm alert: the temperature leads, the rest supports it.</figcaption>
</figure>

## Contrast for reading from a distance

Colors are picked by the customer, and sometimes they pick gray on gray. That's why the theme computes the contrast and, if the text can't be read, fixes it on its own. The question was: with what minimum?

I started with 4.5:1, WCAG's AA for normal text. The problem was that it changed colors that read fine: white on a medium blue is 3.9:1, and the theme turned it into navy. In signage, type is large by definition, so for screen text I moved to the large-text minimum, 3:1. The 4.5:1 stayed for small text on a fill, like a tag's.

The second decision was how to correct it. A color that falls short moves just enough toward white or black, first toward its own side: a yellow gets lighter instead of turning brown. And nothing changes silently: the settings form says which color was adjusted and why. To test it, several apps have a certification scenario with customer colors in medium blue.

## No scrolling: rotate

A screen doesn't scroll, but the content doesn't always fit. The answer is to rotate, always at a pace the customer can adjust:

| App | What rotates | How often |
| --- | --- | --- |
| Daily Menu | Pages of the menu; in strip and mini, one dish at a time | 5 to 60 s per page; 6 s in strip and mini |
| Notices | One notice at a time; important ones last half again as long | 5 to 60 s per notice |
| Weather | In strip and mini, "now" and the forecast | 12 s |
| Birthdays | Pages of the month's list and the greeting | 5 to 60 s |

Rotating has a cost: whoever arrives mid-rotation doesn't know how much is left or what's next. That's why Notices has a footer with a time bar, "2 of 5" and "Next: …". And measuring before paginating avoids the other extreme: a short menu doesn't rotate, it grows its type until it fills the screen.

## When something changes, say so

In a line, people aren't looking at the screen: they're looking at their phones. That's why Queue and Order Ready announce with sound and with motion. Queue behaves like this:

- The ticket called comes up big, with its animation, and the whole screen flashes once.
- It's read out loud ("Ticket A 23, Counter 3") as many times as it was called, 0.9 s apart. If the queue system sends its own recording, that one is used.
- If the same call arrives again within 8 s, it isn't repeated. If they really call it again, it is, and it gets a "Second call" label.
- Queued calls come out one by one; when there's a line, each one plays only once.
- Then it moves above the previous ones, which fade out little by little. Up to 24 are shown, only in full rows.

In Order Ready the customer chooses: read the number and the name, chime only, or nothing. And there's a detail that came from thinking about rush hour: when two or more orders are waiting for their announcement, only the chime plays and each one stays big for 2.5 s, so the screen doesn't fall behind reading names. The announcement queue is capped at 8.

<figure>
  <img srcset="/img/projects/wink-studio/04-800.webp 800w, /img/projects/wink-studio/04-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/wink-studio/04-1600.webp" alt="Order Ready: in progress on one side, ready for pickup in large type." loading="lazy" decoding="async" />
  <figcaption>Order Ready: in progress on one side, ready for pickup in large type.</figcaption>
</figure>

Leaving is designed too. A ready order leaves the screen on its own after the minutes the customer sets (1 to 30), even if the point-of-sale system keeps sending it. Whatever leaves fades out before the columns rearrange, and the ones that just came out glow for 45 s. Orders that were already ready when the app started aren't announced, and the time each one became ready is saved on the device: if the app reloads, it doesn't announce again or restart the count.

Sound has its own details. The chime is two notes (E and C) generated with the browser's synthesizer, with no audio files. An inaudible tone keeps the audio awake so the first call doesn't come out clipped. If the device doesn't have a Spanish voice, the chime plays right away, without waiting for a voice that won't speak. And phrases never pile up: if one doesn't finish within 8 s, it's canceled.

## The screen's time, not the browser's

Many apps depend on the date and time, and the device has no time zone configured. So they all use the time zone the SDK provides (the player's or a setting's), always formatted with `Intl`, and they compare dates against the screen's date, not the browser's date in UTC:

```ts
// Today's date in the screen's time zone (simplified)
function todayIn(timeZone: string, now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now); // "2026-10-12"
}
```

- Daily Menu switches on its own between breakfast, lunch and dinner, and the header says "Lunch · until 5:00 p.m.". If there are no dishes in this service, it says when the next one starts.
- Notices checks every 30 s whether any notice started or expired, and says how long it has left in words: "Today only", "Until tomorrow", "Until Saturday".
- Birthdays celebrates on Friday or Monday if the birthday falls on a weekend, when someone is actually there to see it. If January 1 is a Saturday, it's celebrated on December 31. February 29, in non-leap years, is the 28th. And age is never shown: only the day and month count.

## Never blank, never an error

On a website, an error can be explained. On a screen in a store, "Error 500" or "undefined" just makes the business look bad. That's why every app has the same states, in order:

| State | What you see |
| --- | --- |
| Fresh data | Normal |
| Old data | Normal, with a small mark: "Updated 2 h ago" |
| Data too old or no data | A no-data version: brand, time and a neutral message like "You'll see the weather here soon" |
| Error | Same as no data; the details go to the player as a message, never to the screen |
| Loading for the first time | The brand, calm; never a spinner on its own |

Empty states get written too: "Waiting for the first ticket", "Nothing in progress right now", "No notices right now", "No birthdays this month". They're screens someone is going to see, so they're designed the same as the full ones.

## Taking care of the screen

A still image for hours can mark some screens (burn-in). That's why no app stays still: the theme includes a class that shifts everything by 2 px across four positions, with a full cycle every 8 minutes, or the content rotates. The certification checks that there's at least one infinite animation and, if it doesn't find one, flags it for review.

Motion has its own rules: transitions of 300 to 600 ms, only with `opacity` and `transform`, and nothing that blinks or moves without a reason. It's a screen in a store, not an ad. If the system asks for reduced motion, the shift and the fades turn off.

## The context is a different device

All of this runs on a Raspberry Pi 4, and the GPU is shared with the video in the same layout. Designing for it is design too:

- No `backdrop-filter` or large blurs, and no permanent `will-change`.
- The fonts (Poppins, Titillium Web and Inter) ship inside the package, Latin only and two to three weights per family: the device has no fonts and without a network there's no Google Fonts.
- The app tells Chrome not to translate it: an automatic translation on a public screen would change the customer's text without anyone noticing.
- Weather has a setting to turn off its animated background if the screen runs slowly.

A nice interface that stutters on the real device is no use.

## What I'd tell someone designing for signage

- Design for half a second of attention. If it isn't clear at a glance, it isn't clear.
- Put numbers on legibility: reading distance, minimum text height, contrast. Arguing "it looks small" without numbers never ends.
- Respect the customer's colors as far as you can, and when you change them, say so.
- Design the empty, stale and error states with the same care as the normal one.
- If something changes and people aren't looking, use sound, but think about rush hour before the ideal case.
- Test on the real device. The Pi is part of the design.

> My takeaway: without interaction, hierarchy does all the work. And when people aren't looking, the interface can speak too.
