---
title: "The manifest that builds the form"
description: "Every Wink app declares its settings in a JSON file and the form to edit them generates itself. How it works, and why settings travel in the URL fragment."
date: 2026-10-12
tags: [architecture, dx, wink]
projects: [wink-studio]
cover: /img/projects/wink-studio/sim-one.webp
kind: learning
keyword: "manifest"
---

Every [Wink](/project/wink-app) app can be configured: the Menu has its dishes, Queue its counters and Weather its city. If each app brought its own form, Wink's dashboard would have ten different forms to maintain, and each one would look a little different.

Instead, the app declares which settings it has, and the form builds itself from that declaration. Today it's built by the Wink Studio simulator, with the dashboard's components ported over; the dashboard will do the same once the backend reads the manifest at publish time, which is one of the pieces still waiting on the backend.

## The manifest

Every app ships a `wink-app.json`. It's its spec sheet and it travels inside the package that gets uploaded: the backend will read it at publish time and the dashboard will use it to prefill the catalog listing and to render each customer's settings form. These are its main fields:

| Field | What it is |
| --- | --- |
| `id` | Lowercase and hyphens. It never changes |
| `build` | The code version, in semver. The catalog version (v1, v2…) is set by the backend at publish time |
| `sdk` | The version of the protocol with the player (today, 1) |
| `category` | One of the nine categories in the dashboard's catalog |
| `network` | `self` (no internet), or `open` with the list of hosts it requests from; or the settings where the customer types their API address |
| `offline` | Whether it keeps working with no network once loaded |
| `sizes` | The minimum useful size and the size classes it supports |
| `settings` | The settings the customer changes per instance, up to 40 |
| `demo` | Example values for the catalog preview and the screenshots |

A setting states its type, its label, its default value and its limits. A simplified example, similar to Daily Menu's:

```json
{
  "settings": [
    { "id": "title", "type": "text", "label": "Title",
      "value": "Daily Menu", "max": 40, "group": "Menu" },
    { "id": "accent", "type": "color", "label": "Accent",
      "value": "#f59e0b", "group": "Look" },
    { "id": "items", "type": "list", "label": "Dishes", "max": 40,
      "itemTitle": "name", "itemSubtitle": "category",
      "addLabel": "Add dish",
      "fields": [
        { "id": "name", "type": "text", "label": "Name", "max": 40, "required": true },
        { "id": "category", "type": "text", "label": "Category", "max": 30 }
      ] }
  ]
}
```

## Fourteen types, fourteen controls

There's a type for everything an app needed. Some came with the first SDK and others were added when an app asked for them: lists arrived right before Daily Menu, dates with Notices and times with Departure Board.

| Type | Value | Control |
| --- | --- | --- |
| `text`, `textarea` | Text, with a required `max` | Text field |
| `number` | A number between `min` and `max` | Number field |
| `checkbox` | Yes or no | Switch |
| `select`, `segmented` | One of the options | List or buttons |
| `color` | `#rrggbb` | Picker with [Wink](/project/wink-app)'s palette |
| `font` | Poppins, Titillium or Inter | List |
| `image` | [Wink](/project/wink-app)'s logo or none (the customer's, once the backend serves images) | List |
| `city` | One of Weather's cities | City list |
| `timezone` | An IANA zone | List |
| `date` | `YYYY-MM-DD` in the screen's date, or empty | Typed or picked from a calendar |
| `time` | `HH:MM` in 24 h, or empty | Typed or picked from a list |
| `list` | Items with their own fields, up to 60 | List editor |

<figure>
  <img srcset="/img/projects/wink-studio/sim-one-800.webp 800w, /img/projects/wink-studio/sim-one-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/wink-studio/sim-one-1600.webp" alt="The form on the left comes from Daily Menu's manifest: title, subtitle and the list of dishes." loading="lazy" decoding="async" />
  <figcaption>The form on the left comes from Daily Menu's manifest: title, subtitle and the list of dishes.</figcaption>
</figure>

## Each type, its control

The control depends on the type, and each one solves a small problem that, in ten hand-made forms, would have been solved ten times in ten ways:

- Color: opens a real picker, with its hue bar, and [Wink](/project/wink-app)'s twelve colors, brand colors first. It accepts `#08b` or `008BBF` and normalizes them.
- Date: it can be typed the way people write it ("1/10/2026", "01-10-26") or picked from a calendar that starts on Monday. Internally it's always `YYYY-MM-DD` in local time, never with `toISOString()`: in Honduras, which is at UTC−6, that shifts the day after 6:00 p.m.
- Time: accepts "9" as 09:00, "930" as 09:30 and "21.15" as 21:15, or it can be picked from a list.
- List: it has its own editor. Each item shows a title and a subtitle taken from its fields (the dish's name and category), has buttons to move it up, down or remove it, and the bottom says "12 of 40". When it hits the cap, the add button turns off and explains why.

Because the control depends on the type and not on the app, an improvement reaches all of them at once. When I ported the dashboard's color picker, the color setting started opening a real picker in every app with the same change.

## Sections, and settings that appear

Thirty settings in a single column aren't usable. That's why each setting can say which group it belongs to ("Content", "Look", "Screen"…) and the form shows them in collapsible sections. And a setting can depend on another with `showIf`: in Queue, "A ticket every (seconds)" only appears if the source is the demo, and the API address only if the source is another system with an API. `equals` can also be a list, for "if it's any of these".

```json
{ "id": "demoEvery", "type": "number", "label": "A ticket every (seconds)",
  "value": 10, "min": 5, "max": 60, "group": "Tickets",
  "showIf": { "field": "source", "equals": "demo" } }
```

This is how the ten apps ended up:

| App | Settings | With showIf | Network |
| --- | --- | --- | --- |
| Queue | 34 | 6 | Customer's API |
| Order Ready | 30 | 6 | Customer's API |
| Countdown | 28 | 13 | No internet |
| Departure Board | 25 | 5 | Customer's API |
| Agenda | 22 | 6 | Customer's API |
| Birthdays | 22 | 4 | No internet |
| Clock | 22 | 3 | No internet |
| Daily Menu | 17 | 2 | No internet |
| Notices | 10 | 0 | No internet |
| Weather | 10 | 1 | No internet (sample data for now) |

<p class="tbl-note">220 settings in total, all with the same form.</p>

## The manifest gets validated

A generated form is only as good as the declaration that generates it. That's why the build validates the manifest and, if something's wrong, fails with a message that says where and what:

- Setting ids are camelCase and don't repeat.
- Labels are up to 40 characters and hints up to 120, the same as in the dashboard's listing.
- A text has to declare its maximum length (1 to 2000).
- An option list has at least two options, and the default value has to be one of them.
- A list has a cap of 1 to 60 items and 1 to 12 fields, and it can't contain another list.
- Each item's title and subtitle have to be fields that exist, and a `showIf` has to point to another setting that exists.
- With `network: self` the host list has to be empty; with `open`, it has to declare who it requests from.

## Settings travel in the fragment

Every time a business puts an app on its screen, an instance is created with its settings. Those settings travel in the app's URL, in the fragment:

```text
https://<site>.rapisites.app/?v=3#wink=<settings in base64url>
```

- The fragment (#…) isn't sent to the server: the app is a static site on [RapiSites](/project/rapisites) and doesn't need a backend to read its settings.
- Changing the fragment doesn't reload the page: the app listens for `hashchange` and updates live.
- `?v=` is the catalog version: when it changes, the player reloads the iframe and the new app comes in on its own.

The decision was written down with its reason: it works with every player already installed, which don't know how to send messages to the app yet; it doesn't go through the server, and it doesn't break caching. When the player has its message bridge, settings will be able to arrive that way too, and they'll take precedence over the fragment's.

## Layers, and nothing that breaks the app

The SDK merges settings in layers: first the manifest's defaults, on top of that what the fragment brings and on top of that whatever the player sends. Every value is validated against its setting before it's used; if it's no good, it's ignored and the previous layer's value stays. The app gets values that always make sense:

```ts
// Clean a value against its setting (simplified)
function clean(def, value) {
  switch (def.type) {
    case "text":  return typeof value === "string" ? value.slice(0, def.max) : undefined;
    case "number": return Number.isFinite(value) ? Math.min(def.max, Math.max(def.min, value)) : undefined;
    case "color": return /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : undefined;
    case "date":  return value === "" || isRealDate(value) ? value : undefined;
    // …one case per type
  }
}
```

- A text longer than its maximum gets cut to the maximum.
- A number out of range is moved to the nearest limit.
- A date has to exist: February 31 doesn't pass.
- A list item missing a required field is dropped, and the list is cut at its cap.
- An id that isn't in the manifest is ignored.
- A broken `#wink=` that can't be decoded is ignored entirely and the defaults stay.

The certification tests it: texts at the max with accents and emoji, colors with no contrast, HTML in the texts (which doesn't run, because everything is rendered with `textContent`) and a deliberately broken `#wink=`.

## When the settings don't fit

The fragment has a practical limit. An instance's URL is copied into every element of every layout where the app appears, and a 40-dish menu with descriptions isn't something you want to rewrite in all those places every time someone changes a price. So the rule, agreed with the backend, is this:

- If the settings fit in 1 KB encoded, they travel whole in the fragment.
- If not, the fragment carries only the instance id and a revision, which goes up every time the settings are saved.
- The app requests the settings from [Wink](/project/wink-app)'s API with that revision, and stores them on the device by revision: with no network, it uses the last one that arrived.
- If the request fails, it retries after 2, 4 and 8 seconds.
- Apps wait for the settings to be ready before painting, so you never see a flash of the sample values. If the settings come in the fragment, that's immediate.

## What can't go there

Settings traveling in the URL has a consequence: anyone who sees the URL sees them. That's why a customer's API key never goes in the settings, and there's no setting type for keys. Apps that need a customer's API with a key, or data from a paid provider, wait for [Wink](/project/wink-app)'s backend to act as a bridge. The ones that read a customer API without a key do work already: the customer types the address into a text setting declared in the manifest, only `https` addresses are accepted, and requests go out without cookies or headers.

There's one more safeguard. The fragment can carry the origin of [Wink](/project/wink-app)'s API, but the SDK only accepts it if it's a Wink server or a host the app declared in its manifest. If someone changes that value by hand, the app doesn't send anything to an arbitrary server.

That line, between what can be done now and what needs a backend, is documented app by app.

## What's missing

- The backend reading the manifest at publish time and the dashboard building the form from it. Until then, the generated form lives in the simulator.
- Customer images: today an `image` setting can only be [Wink](/project/wink-app)'s logo or none. Photos of dishes, notices or the people in Birthdays are waiting for the backend to store and serve them.
- Loading long lists another way: typing 60 birthdays by hand is a lot, and the idea is to be able to paste them or upload them from a spreadsheet.

## What I'd tell someone about to build something similar

- If you're going to have many similar forms, describe the data and generate the form. Designing the controls once is cheaper than maintaining them ten times.
- Add types when an app really needs them, not before.
- Validate the declaration in the build. A mistake in the manifest should fail on your machine, not in a customer's dashboard.
- Validate the values again when you read them. Whatever comes in a URL can come from anywhere.
- Decide from the start what can never travel with the settings, and don't leave a type that allows it.

> My takeaway: having the app describe its settings, instead of drawing them, made ten apps feel like a single product.
