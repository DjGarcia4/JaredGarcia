---
title: "No account, no server: how SwiftFlow keeps everything in your browser"
description: "What SwiftFlow stores, where and within which limits; what gets computed instead of stored; the backup as a file, the offline PWA, Your summary without a backend, and what going without a server costs."
date: 2026-10-13
tags: [swiftflow, local-first, pwa, privacy]
projects: [swiftflow-typing-test]
kind: learning
keyword: "local-first"
cover: /img/projects/swiftflow/local-resumen.webp
---

I built [SwiftFlow](/project/swiftflow-typing-test) because the typing test I used filled up with ads. From the start I was clear on three things: no ads, no account, and no server keeping what you type. You open the page and type; everything the app knows about you stays in your browser.

That's usually called local-first: the data lives on the device and the app works without depending on anyone. It sounds simple, but it forces decisions you never think about with a backend: how much fits, what happens when it doesn't, how you take your history to another computer, and what simply can't be done. This is what I learned solving them.

## What local-first means in SwiftFlow

SwiftFlow is a Vue app built with Vite and served as static files from Netlify. There's no API of its own, no database, no accounts. No telemetry either: no analytics and no network calls from the app's code. The only thing that travels over the internet is the app itself, the first time you open it.

Even Dictation mode, which reads sentences out loud, uses the system's voices (`speechSynthesis`) without sending the text anywhere. And the page says so in its FAQ: “Where is my data stored?” “In your browser, on this device, and nowhere else.”

## What gets stored, and where

Everything lives in `localStorage`, as JSON text. I don't use IndexedDB: the data is small and simple, and `localStorage` is read synchronously at startup, without waiting on anything. Each thing has its own key:

| Key | What it holds |
| --- | --- |
| `swiftflow_results` | Finished sessions: wpm, accuracy, misses per key, timings |
| `swiftflow_config` | Mode, duration, options, keyboard, practice-text language |
| `swiftflow_best_wpm_v3` (and `_en`) | The record, one per practice language |
| `swiftflow_ghosts` | The best run of each kind, to race against |
| `swiftflow_key_review` | The review schedule for drilled letters |
| `swiftflow_xp` and `swiftflow_perfect_rounds` | Experience and perfect rounds |
| `swiftflow_custom_texts` | Your “My text” texts (up to 20, up to 5,000 characters each) |
| `swiftflow_locale`, `swiftflow_theme`, `swiftflow_contrast` | Language, theme and high contrast |
| `swiftflow_text_appearance`, `swiftflow_sound_settings` | Font, size, caret and sounds |
| `swiftflow_weekly_goal`, `swiftflow_streak_reminder`, `swiftflow_palette_recent` | Weekly goal, streak reminder and recently used commands |

<p class="tbl-note">The main keys. None of them leaves the browser.</p>

## Persistence, behind a function

One rule served me well: no component or store touches `localStorage` directly. Everything that gets stored has its `xRepository.js`, with the key private to the module and a small function API. If what's stored can't be read, it returns a default value instead of throwing.

```js
// Simplified: what a repository looks like.
const STORAGE_KEY = "swiftflow_results";

export const getResults = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
```

The config goes one step further: on load, it's sanitized against today's valid options. If you saved a code language I later removed, nothing breaks: it falls back to the default. And the day there's a backend, only the repositories change; neither the store nor the view.

## How much gets stored: 200 sessions and the weight of timing

`localStorage` has a size limit, and an app that saves every run has to think about it. The history has been capped at the 200 most recent sessions from day one.

The problem came later, when I started measuring how long each key and each transition between two letters takes. That detail is the heaviest part of a session: about 2.5 KB, against about 0.6 KB for everything else. And it's only read for the newest sessions: the slow-key stats look at the last 30. So past the 40 most recent, that detail is dropped and the session stays: wpm, accuracy, misses and confusions are kept forever, and so are records, streaks and achievements.

```js
// Simplified: saving never takes down the results screen.
const results = [entry, ...getResults()]
  .slice(0, 200)
  .map((r, i) => (i < 40 ? r : withoutTiming(r)));

try {
  save(results);
} catch {
  // Out of space (or storage blocked): no timings, try again
  try { save(results.map(withoutTiming)); } catch { /* shown, not saved */ }
}
```

That double `try` wasn't there at first. Saving threw an exception with storage full, and that took down the results screen mid-render. Now, if there's no way to save, the run still shows; it just doesn't stay in the history.

## What isn't stored: it's computed

What simplified everything most was storing the minimum and computing the rest from the history:

- The 94 achievements: each one has a `check()` function that gets a context computed from the full history. The “unlocked” state is never stored, so it can't get out of sync.
- Course progress: each lesson's stars come from that lesson's results.
- Daily challenges: the date decides which ones come up, and the sessions before that day set how hard they are. Past days are recomputed, so a new challenge can only be added from the next day on, at the end of its list.

Experience and perfect rounds are the exception: they're computed from the history the first time and then stored on their own. Since the history is capped at 200, those tallies can know more than it does. That's why importing a backup keeps the larger of the two numbers: nobody should lose experience for restoring their data.

## Records per language, with nothing to migrate

When SwiftFlow got English texts, every session had to know which language it was played in. To leave what was already stored untouched, the rule was: Spanish isn't written down. An old session, with no language field, reads as Spanish, which is what it was. Only English runs carry `textLanguage: "en"`, and the English record has its own key (`swiftflow_best_wpm_v3_en`). The old data kept working without a single migration.

## Export and import: the backup is a file

For a few days, the whole history lived in a single key with no way out. One “clear browsing data” and months of practice were gone, with no way to move it to another computer. The fix was the simplest thing that needs no server: in the history, “Export” downloads a `swiftflow-YYYY-MM-DD.json` file with your sessions, and “Import” reads it back.

```json
{
  "app": "swiftflow",
  "version": 1,
  "exportedAt": "2026-10-13T…",
  "results": [ … ]
}
```

That file is the only place where data comes in from outside, so I treat it as hostile:

| Case | What happens |
| --- | --- |
| It isn't JSON | “The file isn't valid JSON.” |
| It's JSON, but not SwiftFlow's | “That file isn't a SwiftFlow backup.” |
| It has no sessions | “The backup has no sessions in it.” |
| Some sessions can't be read | They're dropped and counted: “… couldn't be read and were skipped.” |
| A session already exists | This device's copy wins |

<p class="tbl-note">The app's messages in its English interface. None of this throws an error.</p>

Import merges by id instead of replacing: bringing the history from another computer shouldn't wipe what you did on this one. If a session is on both sides, the local one wins, since it's the one that's been kept up to date (with its timings already trimmed, for instance). And whatever is imported goes through the same 200 cap and the same trimming as a normal run.

There are no confirm dialogs either: they freeze the page. “Clear history” takes two steps on the same button, “Confirm clearing?”, with a status line below.

A detail worth knowing: the file carries the sessions. Achievements, course and challenges rebuild themselves from them; the config, your own texts, the ghosts and the review schedule don't travel in the backup.

## Installable and offline

SwiftFlow installs as a PWA with `vite-plugin-pwa`. On every build it generates the manifest and a service worker that precaches the app:

```js
// vite.config.js (simplified)
VitePWA({
  registerType: "autoUpdate",
  // The text fonts too, so a picked one still works offline
  workbox: { globPatterns: ["**/*.{js,wasm,css,html,woff2}"] },
  manifest: {
    name: "SwiftFlow",
    lang: "es",
    theme_color: "#f97316",
    display: "standalone",
    start_url: "/",
  },
});
```

The `woff2` in that pattern has a story. When I added fonts for the text (JetBrains Mono, Atkinson Hyperlegible, OpenDyslexic), each one loads only when you pick it. If the service worker didn't precache them, the font you picked disappeared offline. Now they're bundled, loaded when picked and precached for offline use.

To install it there's a button of its own, “Install app”. The browser offers installation once, with the `beforeinstallprompt` event. I catch it as the page loads and keep it for when you press the button. Safari and Firefox don't fire that event, so there the button simply doesn't show, and you install from the browser's menu.

## Your summary, without a backend

<figure>
  <img srcset="/img/projects/swiftflow/local-resumen-800.webp 800w, /img/projects/swiftflow/local-resumen-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/swiftflow/local-resumen-1600.webp" alt="SwiftFlow's Your summary page with runs, minutes, record, average speed, accuracy, favorite mode, streak and new achievements for the month." loading="lazy" decoding="async" />
  <figcaption>The summary page (shown in Spanish), built from three test runs in a clean browser: everything comes from the local history.</figcaption>
</figure>

“Your summary” (`/resumen`) tells a month or a year of practice: runs, minutes, days, your best session and whether it was a record, the average against the period before, accuracy, the key you tamed, your favorite mode, the longest streak, the busiest day and the new achievements. All of it comes from the history, in the browser. The period stays in the URL (`/resumen?periodo=2026-09`), so you can come back to the same one.

What gets shared is an image, not a link. With the data only in your browser, a link would open the summary of whoever opens it, with their own history. So the card is drawn on a square 1080 px `<canvas>`, shown in a preview and downloaded or shared. If the browser can share files (`navigator.canShare`), the system share sheet comes up; if not, there's the download. Each result's card works the same way, with a different design when it's a record.

## What going without a server costs

Local-first isn't free. These are the costs I accepted:

- If you clear the site's data, everything is gone. The only safeguard is exporting now and then.
- There's no sync. Using SwiftFlow on two devices means two histories. You join them by hand: export on one, import on the other.
- If storage is blocked (as in some private modes), the app still works, but it remembers nothing after a reload.
- The streak reminder only arrives with SwiftFlow open, even in a background tab. Reminding with the app closed needs a server: Web Push needs one to send the notification, scheduled notifications were a Chrome experiment that was abandoned, and Periodic Background Sync only exists in Chrome with the app installed and runs when the browser decides. The warning itself says so.
- There's no public leaderboard: it would need to store everyone's results, nicknames or accounts, and some defense against fake scores.

## How it got this way

The git history tells the order in which the problems showed up:

| Date | Change |
| --- | --- |
| 2026-09-14 | The installable PWA; config persists; history is saved, capped at 200 |
| 2026-09-16 | Sessions carry a `metricsVersion`: records and averages only compare what was measured the same way |
| 2026-09-17 | Per-key timings, trimming past 40 and saving without throwing; export and import |
| 2026-09-22 | The streak warning and the evening reminder, only with the app open |
| 2026-09-25 | Precached fonts; records per language |

<p class="tbl-note">Commit dates from the SwiftFlow repository.</p>

The `metricsVersion` change is local-first too: when I changed how WPM is calculated, old sessions couldn't be recomputed, because I don't have the raw data on any server. So they stay in the list, marked, without counting toward records or averages.

## What's still pending

`docs/ideas.md` has what comes next written down, and how I thought it through:

- Challenging a friend with a link. The weekly challenge already generates the same text for everyone from a seed, so all that's missing is how the other person typed. A compressed ghost takes about 600 to 1,000 characters and fits in the URL's `#`, which never reaches the server. The limitation is accepted: without a server, nothing stops someone from forging a link with an impossible time.
- A leaderboard, which does need a backend.
- The reminder with the app closed, through Web Push, once that backend exists. It means moving the service worker from `generateSW` to `injectManifest`.

The repositories exist precisely so that, that day, the rest of the app doesn't have to change.

## If you're building a local-first app

- Put every key behind a module with small functions, and make it read with a default value instead of throwing.
- Measure what each record weighs and decide what can be let go over time. What nobody reads doesn't need to take up space.
- Compute everything that can be computed. What isn't stored can't get out of sync.
- Offer export early, and treat the incoming file as hostile.
- When you add a field, make its absence mean what was already there. Then you migrate nothing.
- Write down what you can't do without a server, and why. It saves you redoing the research.

> What I take away: without a server there's no one to blame and nowhere to rescue the data from. That forces careful design of what's stored, what's computed and what happens when the browser says no. In exchange, nobody has to create an account to start typing.
