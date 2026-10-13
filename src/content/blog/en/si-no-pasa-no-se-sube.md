---
title: "If it doesn't pass, it doesn't ship: certifying screen apps with Playwright"
description: "Overflow, a slow CPU, no network and 24 hours of fast-forwarded clock: the automated certification every Wink app passes before it's published."
date: 2026-10-12
tags: [testing, playwright, wink]
projects: [wink-studio]
cover: /img/projects/wink-studio/report.webp
kind: learning
keyword: "certification"
---

A [Wink](/project/wink-app) app runs on a Raspberry Pi 4 with Chromium, connected to a screen nobody touches, 24 hours a day, with a daily restart in the early morning. It lives inside an iframe, next to videos and other apps, and it gets destroyed and recreated every time the layout changes scene. If it breaks, nobody notices until a customer calls.

That's why in Wink Studio no app is published without passing an automated certification. Every check ends in one of three states: "OK", "Review" or "Fail". A single "Fail" and the app doesn't ship, and CI won't let it merge either.

<figure>
  <img srcset="/img/projects/wink-studio/report-800.webp 800w, /img/projects/wink-studio/report-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/wink-studio/report-1600.webp" alt="Certification report for Daily Menu: 51 checks, all passing." loading="lazy" decoding="async" />
  <figcaption>Certification report for Daily Menu: 51 checks, all passing.</figcaption>
</figure>

## What runs, in order

`npm run certify <app>` does all of this, from cheapest to most expensive:

- A production build with Vite, compiled for Chromium 134 (the player's browser).
- A package check: the hosting rules (up to 500 files and 20 MB, only allowed extensions, ASCII names) and the budgets for the Pi: up to 60 KB of gzipped JavaScript, up to 300 KB of code and up to 1.5 MB for the whole package.
- A source code check: forbidden things, keys written in the code and undeclared hosts.
- The app's unit tests. No tests, it fails; fewer than five, it's flagged for review.
- Chrome with Playwright: the app inside a fake player on a different origin, at all eleven sizes and in every scenario.

At the end it leaves two files: `report.json`, for CI, and `report.html`, for people, with screenshots of every size and every scenario. To give an idea of what comes out, these are some numbers from the latest Daily Menu report:

| Check | Result |
| --- | --- |
| Package | 14 files · 12.9 KB of gzipped JS · 63.3 KB of code · 192.2 KB total |
| Unit tests | 50 pass |
| First paint at the 11 sizes | Between 16 and 48 ms |
| First paint with a 4× slower CPU | 163 ms |
| Reload with no network, from the service worker | 44 ms |
| 24 hours of fast-forwarded clock | Memory from 1.1 to 1.3 MB; nodes from 163 to 161 |
| Total | 51 checks OK, in just under two minutes |

<p class="tbl-note">Measured in desktop Chrome, not on the Pi.</p>

These are the groups of checks that taught me the most.

## 1. Sizes: nothing outside, nothing overlapping, nothing cut off

The app is mounted at each of the 11 sizes (from 60×30 to 4K, with horizontal and vertical strips). At each one, the certification walks every visible element that has its own text or is an image, and checks:

- Scroll: the page is bigger than the box. Fail.
- Outside: an element spills out of the app's box. Fail.
- Overlap: two elements that aren't nested inside each other cover more than 20% of the smaller one. Fail.
- Blank: nothing is visible. Fail, unless the size is below the minimum the app declares.
- Cut off: it has text, its overflow isn't visible, it doesn't use "…" and its content is still bigger than its box. Flagged for review.
- `wink:ready`: the app has to report that it painted in under 1 s. Between 1 and 3 s it's flagged for review; no report after 3 s is a fail, because the player would treat it as "didn't load".

```ts
// Text cut off without "…"? (simplified)
const cs = getComputedStyle(el);
const ellipsis = cs.textOverflow === "ellipsis" || cs.webkitLineClamp !== "none";
const cutOff =
  cs.overflow !== "visible" && !ellipsis &&
  (el.scrollWidth > el.clientWidth + 3 || el.scrollHeight > el.clientHeight + 3);
```

That `+ 3` is a 3 px tolerance. It exists because every app shifts by 2 px every so often to protect the screen, and without that tolerance the shift itself would count as overflow.

The rules didn't come out complete the first time; they got adjusted as the apps came along. `line-clamp` started counting the same as "…", and for decorative things that sit under the text or stick out on purpose (the drops and stars in Weather's background) I added an attribute: anything marked with `data-wk-decor` counts neither as overlap nor as overflow. That way the check can be strict without false positives.

## 2. With a player, without one, and on a slow device

The player installed today doesn't talk to the app yet, so the app has to work on its own, with the manifest's values and the settings in the URL. The certification mounts it once without sending the player context and checks that it still paints.

Then it measures first paint with the CPU four times slower, as an approximation of the Pi. Since the app is on a different origin, Chrome runs it in a different process: you have to throttle the app's frame, not the player page, and reload it already throttled. It's done with the Chrome DevTools Protocol:

```ts
// Simplified
const cdp = await context.newCDPSession(appFrame);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await appFrame.evaluate(() => location.reload());
const ms = await waitForReady();
```

## 3. Settings pushed to the limit

Settings are filled in by the customer, so the certification fills them in worse than any customer would:

- Every text at the maximum the manifest allows, repeating "Wéñ😀 " (accents, ñ and emoji at once).
- Lists filled to their cap, with every field at the limit.
- Gray on gray colors (#777777, #888888, #7a7a7a) to force the contrast correction.
- The last option in every option list and every switch flipped from its default.

That gets mounted at 480×270, 1920×360, 1080×1920 and 240×120, and there can't be any overflow or overlap. Separately, every text is filled with `<img src=x onerror=…>`: if that HTML runs, it fails. And finally the URL fragment is broken by hand (`#wink=%%%roto`): the app has to keep showing with its default values.

## 4. Scenes: 20 loads in a row and two copies at once

Every scene change destroys the app and loads it again, and during a fade transition there are two live copies for about 700 ms. The certification mounts and unmounts the app 20 times in a row, 60 ms apart, and checks that no errors show up in the console. Then it mounts two copies at the same time and both have to report that they loaded. If an app stores something as if it were the only instance, this is where it shows.

## 5. No network

In a store, the network goes down. The check has three steps: the app keeps showing when the player says there's no network, it registers its service worker (it has 5 s to become active) and, most importantly, it loads again with the network actually cut. If the app doesn't load without internet, the next scene change leaves the screen black.

There's a platform detail: today the hosting where apps are published doesn't serve service workers yet (it returns 403 for the script), and the option to enable them has been requested. The SDK tries, fails silently and the app carries on. The certification does test it with its own server, so when the hosting enables it, the apps will already be tested.

## 6. A whole day in two minutes

My favorite check is the soak: 24 hours of use in a couple of minutes. Playwright installs a fake clock and moves it forward hour by hour; the app believes a whole day went by, with its timers, its rotations and its schedule changes.

```ts
// Simplified
await context.clock.install();
// …mount the app…
const before = await usedMemory();
for (let h = 0; h < 24; h++) {
  await context.clock.runFor(60 * 60 * 1000); // one hour
  samples.push(await countNodes());
}
const after = await usedMemory();
```

Memory is measured in the app's frame (which runs in another process) after forcing garbage collection. The thresholds:

|  | JS memory | DOM nodes |
| --- | --- | --- |
| OK | Grows up to 2 MB | Grow up to 20 |
| Review | More than 2 MB | More than 20 |
| Fail | More than 10 MB | More than 200 |

There's a catch: what an app shows changes during the day. The first version of this check flagged Weather for review: it started at 5:30 p.m. with sun, 24 hours later it was raining, and the 22 extra decorative raindrops looked like a leak. So now the count ignores whatever is marked as decorative, and the final count isn't compared to the starting one but to the highest value in the first 12 hours. A leak keeps growing and goes past it; a content change doesn't.

## 7. What you can't write

There are also code rules that check themselves, reading the app's `src/` with comments stripped (so a rule mentioned in a comment doesn't count):

| Rule | If it shows up | Why |
| --- | --- | --- |
| No `alert`, `confirm` or `prompt` | Fail | They freeze the whole player |
| No `window.open` | Fail | The player has no windows |
| Don't touch `window.top` or `window.parent` | Fail | Only the SDK talks to the player |
| No `eval`, `new Function` or `document.write` | Fail | Unsafe, and it breaks the page |
| No cookies | Fail | They aren't used |
| No `backdrop-filter` or large blur | Fail | The Pi's GPU is shared with video |
| No Google Fonts or CDNs | Fail | Everything goes inside the package |
| No `innerHTML` | Review | With customer text it's a door to code injection |
| Dates with `Intl` and the SDK's time zone | Review | The device has no time zone configured |
| Sizes in `cq*`, not `vw`/`vh` | Review | The iframe may not be the whole screen |

It also looks for patterns of known keys (Google, Stripe, GitHub, AWS, Slack, private keys) and any URL in the code whose host isn't declared in the manifest. While the app runs, a trap replaces `alert` and friends to report if anyone calls them, and every request to an external host is cut: the test has no internet, and at the end the list of hosts requested is compared with the declared one.

## Scenarios: what the app shows only sometimes

With the demo settings, Weather never shows the storm alert and the Menu is always in the same meal service. For that, each app can include a `certify.json` with scenarios: settings and, if needed, a fixed time at which the browser clock is frozen. Each scenario is tested at all eleven sizes, with a screenshot.

```json
{ "scenarios": [
  { "name": "Breakfast", "at": "2026-10-08T14:00:00Z", "settings": {} },
  { "name": "No dishes", "settings": { "items": [] } }
] }
```

Daily Menu has nine: breakfast, lunch, dinner, kitchen closed, a drinks-and-desserts screen, few dishes, a café in dollars with no categories, no descriptions or featured items, and no dishes. Scenarios came in together with a Weather fix, where the rain alert rode over the days in the card; before fixing it I checked that the certification failed with the old CSS. The rule I kept: if an app shows something only in certain cases, that case goes in as a scenario, because otherwise the certification doesn't see it.

## In CI, only what changed

Certifying an app takes anywhere from a couple of minutes to several: in the latest reports, between one and nine, depending on how many scenarios it has and how long each one takes. With ten apps, certifying everything on every PR would be slow. A script looks at which files changed against the base branch and decides:

```ts
// Simplified
const SHARED = [/^packages\//, /^scripts\//, /^package(-lock)?\.json$/, /^\.github\//];

function whatToCertify(changed: string[], apps: string[]) {
  if (changed.some((f) => SHARED.some((re) => re.test(f)))) return ["template", ...apps];
  return apps.filter((id) => changed.some((f) => f.startsWith(`apps/${id}/`)));
}
```

- If one app changed, that one gets certified.
- If something shared changed (the SDK, the scripts, the lock file, the config or CI itself), all of them get certified, plus the template.
- If only documentation changed, nothing.
- If it can't tell what changed (a force push, the first run), all of them.

The reports from every run are kept as a CI artifact, even when it fails. And to certify everything by hand there's a button in GitHub Actions.

## What the certification doesn't cover yet

- It runs on the installed Chrome, which is newer than the player's Chromium 134. You can pass it the path to a Chromium 134, but that doesn't replace the real device.
- The 4× slower CPU is an approximation. The size budgets will be calibrated with real numbers from the Pi.
- The publishing checklist still includes running each app for an hour on a Pi 4, in landscape, in portrait and with no network. That part is manual.

All ten apps pass the certification, with no checks flagged for review. None of them is published yet: publishing them is waiting on [Wink](/project/wink-app)'s backend.

## What I'd tell someone building something like this

- Start with what has already hurt. Every check on this list maps to something that happens on a real screen: an `alert` that freezes the player, a scene that won't load without network.
- Use three states, not two. "Review" lets you move on without hiding the problem.
- When a check gives a false positive, fix the check with an explicit rule (like `data-wk-decor`), not by lowering the threshold.
- Leave evidence. One screenshot per size makes the report readable in a minute.
- Prove the check fails. Before you call a fix good, go back to the broken code and see that the certification flags it.

> My takeaway: a rule that lives in a document gets forgotten; a rule that lives in the certification gets followed. And the error shows up in the report, not on a customer's screen.
