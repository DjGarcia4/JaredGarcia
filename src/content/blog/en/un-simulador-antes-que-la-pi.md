---
title: "A simulator before the Raspberry Pi"
description: "Why I built a player simulator before building the apps: eleven sizes at once, a different origin, network drops and scene changes."
date: 2026-10-12
tags: [tooling, dx, wink]
projects: [wink-studio]
kind: learning
keyword: "simulator"
---

The obvious way to test a [Wink](/project/wink-app) app is to upload it, put it in a layout and look at it on a screen with a Raspberry Pi. It works, but it's slow: every change is a build, an upload and a trip to the screen. And a screen only shows one size at a time.

[Wink](/project/wink-app)'s dashboard wasn't enough for development either. Its preview of an app is a TV with a fixed aspect ratio, about 430×270, so the app always shows in its card version. And the layout editor does show the app live at the element's size, but it doesn't accept `localhost`: to see a change, you have to publish it first.

So before building the apps, I built the simulator. In the repo's plan it was phase 3: first the repo with its rules, then the SDK and the theme, then the simulator, then the certification, and only then the first app, Weather.

<figure>
  <img srcset="/img/projects/wink-studio/sim-all-800.webp 800w, /img/projects/wink-studio/sim-all-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/wink-studio/sim-all-1600.webp" alt="The simulator with Daily Menu: settings on the left and the app at several sizes at once." loading="lazy" decoding="async" />
  <figcaption>The simulator with Daily Menu: settings on the left and the app at several sizes at once.</figcaption>
</figure>

## How it starts

`npm run dev <app>` starts Vite as usual, with a plugin that only exists in development. The app is served at `http://127.0.0.1:5180/` and the simulator at `http://localhost:5180/__wink/`. The simulator reads the app's `wink-app.json` and builds everything else from it: the list of settings, the default values and the form. If it can't read the manifest, it says so on screen instead of staying blank.

## Every size at once

The main view loads the app in eleven iframes, each at the real size of its element: full screen, portrait, strip, low strip, half screen, square, card, small, the editor minimum (60×30), vertical strip and 4K. They're the same eleven sizes the certification uses.

A 3840×2160 iframe doesn't fit on a laptop, so each one is scaled with `transform` to fit its box. The scale never enlarges: a 240×120 shows at its real size, not stretched.

```ts
// Scale so a w×h iframe fits its box (simplified)
function fitScale(w: number, h: number, boxW: number, boxH: number) {
  return Math.min(1, boxW / w, boxH / h);
}

iframe.style.width = `${w}px`;   // the app sees its real size
iframe.style.height = `${h}px`;
iframe.style.transform = `scale(${fitScale(w, h, 380, 260)})`;
```

This matters: the app doesn't see a tiny iframe, it sees 3840×2160. Its size class, its measurements and its CSS are the real screen's. Above each box, the simulator writes the size, the class it gets and the scale ("1920×360 · tira · at 20%"), and below it, the status of that copy.

That way a CSS change shows at every size at the same time. If fixing the strip breaks portrait, I find out right away and not at certification. You can also view a single size, large, or a custom one, from 60×30 up to 7680 per side.

## From a different origin, like the player

In production the app runs in an iframe from a different site: the app lives on the hosting and the player on its own origin. If in development I load it from the same origin, some things work and then fail later: reaching the parent window, sharing storage, certain messages.

The fix was cheap: the simulator lives on `localhost` and the app on `127.0.0.1`. To the browser they're different origins, so whatever wouldn't work in the player doesn't work here either. And the iframe is created with the same attributes the player uses: the same permissions (`autoplay`, `encrypted-media`, `picture-in-picture`), `scrolling="no"` and no `sandbox`.

## Speaking like the player

The player and the app talk through `postMessage`. The simulator sends and listens for the same protocol messages:

| Message | Direction | What the simulator does |
| --- | --- | --- |
| `wink:context` | Player → app | Sends it when each iframe loads: element size, time zone, language, network and version. It can be turned off to test the app with no player |
| `wink:online` | Player → app | Sends it when "Online" is turned off |
| `wink:ready` | App → player | Measures how long the app took to paint since the iframe was created. Over 1 s, it's marked as slow |
| `wink:error` | App → player | Shows the code: `data_unavailable`, `render_failed` or `settings_invalid` |
| `wink:heartbeat` | App → player | Counts each copy's heartbeats (the app sends one per minute) |

If `wink:ready` hasn't arrived after three seconds, the simulator marks that copy as "Didn't report loading", which is how the player would treat it. Each status has a color: green if it's ready on time, yellow if it was slow, red if it didn't report or sent an error. Everything also goes into a log at the bottom, with the time, the size and the timing of each one, up to the last 200 lines.

Messages are only accepted if they come from the app's origin and from one of the iframes the simulator created. It's the same thing the SDK does on the other side: the app only accepts messages from its parent window and from trusted origins, and it replies to that origin, never to `*`.

## What happens on a real screen

An app in a layout doesn't load once and stay. The simulator has buttons for what happens to it during the day:

- Scene change: destroys each iframe and recreates it 300 ms later, cold, like when the layout rotates.
- Fade transition: creates a second copy on top, fades it in over 700 ms and only then removes the first one. During that time there are two live copies, like in the player.
- Reload: rebuilds all the boxes.
- Open the app alone: opens it outside the simulator, with no player.

And in the sidebar, a "Player" group with what the player controls:

- Simulate the player: when off, no `wink:context` is sent and the app starts on its own, as with an old player.
- Online: when off, sends `wink:online` as false.
- The screen's time zone: 14 to choose from, from Tegucigalpa to Madrid and UTC, because the real device doesn't have one configured.
- Language: 10, from Spanish for several countries to English.
- Catalog version (`?v=`): changing it reloads the iframe, like when a new version is published.

The app's settings, on the other hand, are edited live: changing a text or a color only changes the `#wink=` fragment of the URL, and the app updates without reloading. Everything I pick is saved per app in the browser. If what was saved is no longer valid (a city or option that no longer exists), it's dropped on open.

<figure>
  <img srcset="/img/projects/wink-studio/sim-one-800.webp 800w, /img/projects/wink-studio/sim-one-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/wink-studio/sim-one-1600.webp" alt="A single size, large, with the settings form beside it." loading="lazy" decoding="async" />
  <figcaption>A single size, large, with the settings form beside it.</figcaption>
</figure>

## Large settings, the way the server builds them

Settings travel in the URL, but only if they fit in 1 KB encoded. If they don't (a 40-dish menu doesn't fit), the URL carries only the instance id and a revision, and the app requests them from [Wink](/project/wink-app)'s API. The simulator imitates that: every change bumps the revision, saves the settings to its own fake API and, if they go over 1 KB, the app requests them from there. That way the large-settings path gets tested every day, not only when a customer writes a lot.

```ts
// The instance URL (simplified)
const full = encodeWinkHash({ s: settings, i: instance, r: revision });
const fits = full.length - "#wink=".length <= 1024;
const url = `${origin}/?v=${version}${fits ? full : encodeWinkHash({ i: instance, r: revision })}`;
```

## Fake data that behaves like the real thing

Some apps read the customer's own API (Departure Board, Agenda, Queue, Order Ready). To develop them without that API, the simulator serves three things, all from the same server but with CORS, as if they came from another site:

- An example API: the JSON files in the app's `test/fixtures/`, at `/__wink/ejemplo/<file>.json`. They can include markers like `{{hora+20}}`, which are replaced with the time 20 minutes after startup, so the Departure Board has departures from today and the statuses change on their own with the clock.
- A mailbox: a `POST` to `/__wink/buzon/<name>` stores a JSON and a `GET` returns the latest one (or 204 if there's none). With that I test tickets "sent" to Queue with a `curl`.
- "Test connection": a button under the API address setting that says whether it responds, how fast, whether it's JSON and which fields it has, with messages for whoever sets up the screen, not for a programmer. If the address is `http`, it explains that the screen can only request `https`.

## How the customer will see it

The third view, "In the dashboard", shows the app the way a customer will see it in the catalog: the card with the logo, the short description, [Wink](/project/wink-app)'s badge and the "Needs internet" notice when it applies; the detail page with the preview, "What's included", "Ideal for" and the release notes for the last three versions; and the form to add it, with the name, the settings and a preview that changes size. It's built with the dashboard's components, ported for the simulator, so what I see looks like what the customer will see.

The release notes come from the app's `CHANGELOG.md`: each version has a `> …` line with the note for customers, up to 500 characters. If it's missing, the simulator's detail page flags it.

## What the simulator isn't

The simulator doesn't replace the Pi or the certification:

- Cutting the network there only tells the app. The real cut is tested in the certification and on the device.
- Timings in development are higher than in the build, because Vite serves the modules unbundled. A "slow" in the simulator isn't always slow.
- It runs in the computer's browser, not in the Pi's Chromium 134, and with a computer's CPU.

It's a tool for iterating fast, not for signing off. The sign-off comes from the certification and, before publishing, an hour on a real Pi.

## What I'd tell someone about to do the same

- If your product runs inside another one (an iframe, a webview, a player), simulate the host before writing the product. Every host rule you don't simulate is a surprise in production.
- Use the real sizes and scale the view, not the other way around. If the app sees a small iframe, you're testing a different app.
- Split the origins in development. `localhost` versus `127.0.0.1` costs one line.
- Make the simulator speak the same protocol, with the same timeouts. If the player waits 3 s, so does the simulator.
- Add buttons for the odd cases: destroy, duplicate, cut the network, change the time. The odd case in development is the normal case on a 24/7 screen.
- Be clear about what your simulator doesn't test, and write it down.

> My takeaway: building the tool before the product feels slow the first week. After that, every app came out faster and with fewer surprises on the real screen.
