---
title: "From commands to a studio: one screen for making Wink apps"
description: "Creating, configuring, certifying and preparing an app for upload were commands you had to know by heart. I turned them into a studio with a front door, without moving where the truth lives: in the repo's files."
date: 2026-10-14
tags: [tooling, ux, wink]
projects: [wink-studio]
kind: learning
keyword: "studio"
---

Until recently, making an app for [Wink](/project/wink-app)'s screens in Wink Studio was a list of commands: `npm run new` to create it, `npm run dev` to see it in the [simulator](/blog/un-simulador-antes-que-la-pi), `npm run certify` to [certify it](/blog/si-no-pasa-no-se-sube) and `npm run shots` for the catalog screenshots. Each one did its job well. The problem was everything in between.

Which of the ten apps is certified? Which one changed after it was certified? Which one is waiting on the back end? Is the `dist/` I'm about to upload the same one that passed review? The answers existed, scattered across reports, the README and git history. You had to know where to look, and only I did.

So I turned the commands into a studio: `npm run studio` opens a screen with every app and, from there, everything that used to be done by hand.

<figure>
  <img srcset="/img/projects/wink-studio/studio-home-800.webp 800w, /img/projects/wink-studio/studio-home-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/wink-studio/studio-home-1600.webp" alt="Wink Studio's home: the ten apps with their screenshot, version and status." loading="lazy" decoding="async" />
  <figcaption>The home screen: each app with its screenshot, its version, how many settings and scenarios it has, and what it's missing.</figcaption>
</figure>

## The front door answers what you used to dig for

Each card says what matters before you touch anything:

- **Certified**, with the date, if it passed certification and nothing changed since.
- **Changes not certified** if it was certified but then the code or the build changed, or there are uncommitted changes. It's the most useful badge: what you used to have to remember now jumps out.
- **What it's waiting on**: “Waiting on K1”, “Queue”… what the app needs from the back end or the player to ship complete.

At the top, the summary and three filters: all, needs review, and waiting on the back end. Plus one button, **Certify the ones to review**, that queues every app with the yellow badge.

I didn't write what each app is waiting on twice: it comes from the “Status” column of the apps table in the README. If the studio kept its own list, sooner or later the two would disagree.

## The studio owns nothing

That was the rule I guarded most. Everything you edit in the studio is saved to the same files as always: the settings manifest (`wink-app.json`), the certification scenarios (`certify.json`), the listing (`store/`) and the CHANGELOG. No database, no hidden state. To get a change to the rest of the team you commit and push as usual, and whoever prefers the terminal still has the same commands.

That has a practical consequence: the studio can't leave things half done. The editors validate live and won't save while there's a problem. When you save a setting, it asks whether it's a fix or something new —in this repo, if a setting changes, the build goes up— and asks for the note for clients, which goes to “What's new” and the CHANGELOG. The rule that used to live in a document now lives in the button.

<figure>
  <img srcset="/img/projects/wink-studio/studio-escenarios-800.webp 800w, /img/projects/wink-studio/studio-escenarios-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/wink-studio/studio-escenarios-1600.webp" alt="Order Ready's scenario editor: the list on the left, the selected scenario in the middle and the live app on the right." loading="lazy" decoding="async" />
  <figcaption>Order Ready's scenarios: each with its fixed time, the settings it changes and the live app alongside.</figcaption>
</figure>

## Scenarios: build the case while looking at it

Certification tests each of an app's scenarios in all eleven sizes: “at night”, “empty list”, “text at its longest”, “the API doesn't answer”. Whatever isn't a scenario can break without anyone seeing it. They used to be hand-written in `certify.json`, and you had to guess how they'd look.

Now there are two ways. In the simulator I set up the case —change the settings, set the screen's time— and hit **Save as scenario**. It only saves what differs from the sample values, so the scenario stays short and it's clear what it tests. And in the studio, the scenario editor shows the real app alongside, in four sizes, with its time and its API responses. **Open in the simulator** opens it already applied, to go through all eleven.

## Certifying without watching the terminal

A certification takes one to three minutes, and each one opens Chrome. So they run in a queue, one at a time, and you can keep working meanwhile: the card shows the progress, and the dialog has the live step-by-step, the report and that app's history.

The studio doesn't reimplement certification. It runs the same `npm run certify`, which with `--progress` reports each step on a line the studio reads. If certification changes tomorrow, the studio doesn't need to know, and that's how it should be. And if a certification is cut short, the previous report isn't lost.

## Prepare for upload: the last review, written down

Uploading an app to the dashboard was the step with the most ways to go wrong, and the one done least often. Now it's a button that checks everything first:

<figure>
  <img srcset="/img/projects/wink-studio/studio-subir-800.webp 800w, /img/projects/wink-studio/studio-subir-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/wink-studio/studio-subir-1600.webp" alt="Preparing Notices for upload: the review in green on the left and the listing copy on the right." loading="lazy" decoding="async" />
  <figcaption>Prepare for upload: red blocks; yellow can ship anyway, but take a look.</figcaption>
</figure>

- **Certified**, and unchanged since.
- **The package is the certified one**: certification stores the fingerprint of the `dist/` it tested, and it's compared here. So nothing that skipped review ever gets uploaded.
- **Everything in the repo**: what you upload has to be saved.
- **The version and its note**, the logo, the description and the listing screenshots.
- **Tested on a Pi 4**, always yellow.

That last one is on purpose. The studio can't yet check that someone left the app running for an hour on a real Raspberry Pi, landscape and portrait, offline. It could just not show it; I'd rather it say so and have a person confirm it. A checklist that only shows what it knows how to check gives a confidence it doesn't have.

With nothing in red, it builds a folder in two parts: `sitio/`, which is what you drag into Web App, and `ficha/`, with the logo, the screenshots in order and every field of the publishing form, each with its own copy button. There's also a .zip, but Web App takes the folder, not the .zip, and the studio says so right there.

## The manual, inside

Every screen has a **?** next to its title that opens its section of the manual, and the home screen has the whole manual with search. It's the same Markdown file in the repo: whatever gets fixed there shows up in the studio. A separate manual somewhere else goes stale in the first week.

## What I learned

The most valuable part of the studio isn't the screens: it's that the rules I carried in my head are now visible. What to check before uploading, when the build goes up and what an app still needs to ship complete no longer depend on someone asking me.

And the decision that saved me the most was the most boring one: making the studio a layer over the same files and the same commands, not a new system. That way each screen could be built one at a time, without migrating anything or breaking a way of working that already worked.
