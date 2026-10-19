---
title: "Reminders that learn your rhythm"
description: "A haircut every 28 days, 8 glasses of water a day and groceries “when it's time” need different reminders. How Hace Cuánto calculates them, how they fit within the iOS limit and how a place asks you when you arrive."
date: 2026-10-19
tags: [ios, notifications, core location, hacecuanto]
projects: [hacecuanto]
kind: learning
keyword: "reminders"
cover: /img/projects/hacecuanto/02.webp
---

A fixed reminder (“every day at 9 p.m.”) is useful for very few things. If you already read, it annoys you. If the haircut is every 28 days, it reminds you 27 times too many. And for grocery shopping there isn't even an interval: you go when something runs out.

In Hace Cuánto each type of item reminds you differently, and everything is recalculated every time you log something.

<figure>
  <img srcset="/img/projects/hacecuanto/02-800.webp 800w, /img/projects/hacecuanto/02-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/hacecuanto/02-1600.webp" alt="The form for a new item from the Drink water template: a goal of 8 glasses, reminders during the day every hour and a half between 8 a.m. and 9 p.m., and the option to save a place." loading="lazy" decoding="async" />
  <figcaption>“Drink water” from its template: a goal of 8 glasses, reminders during the day and a place.</figcaption>
</figure>

## One reminder per type of item

All reminders are calculated in one function that receives the item and the current time and returns **when** to remind and **what** to say:

- **Every X days**: the day it's due, at your time. “It's time. The last time was 28 days ago.” If that moment has already passed, the next day at the same time.
- **Daily habit**: today at your time if you haven't done it yet; if you already did, tomorrow. “Done it today? You're on a 🔥 12 streak.”
- **Weekly habit**: a single reminder on the last day of the week, and only if you're short. “You're at 2 of 3 this week. Today is the last day.”
- **Event**: this is the one that “learns”. With three entries or more, the app knows your average interval and reminds you once **one and a half times** that average has passed.

```swift
case .event:
    guard stats.total >= 3, let average = stats.averageInterval, let last = stats.last else { return nil }
    let due = last.addingTimeInterval(average * 1.5)
    let date = nextSlot(from: cal.startOfDay(for: due))
    let days = cal.dateComponents([.day], from: cal.startOfDay(for: last), to: cal.startOfDay(for: date)).day ?? 0
    return (date, "\(Fmt.cada(average)) normalmente, y ya van \(Fmt.dias(days)).")
```

If I go grocery shopping every 7 days, the reminder arrives on day 11: “Usually every 7 days, and it's been 11 days.” It doesn't remind me on day 7, because sometimes I go on day 8 and that's fine. It reminds me when it's already unusual. With fewer than three entries there's no reliable average, so it doesn't remind.

## Reminders during the day, until the goal

For “drink water” or “stretch”, one reminder a day isn't enough. Those habits have a repeating reminder option: every N minutes within a time window (by default, from 8 a.m. to 9 p.m.).

What matters is **when the count starts**. If the reminder is every 90 minutes and you had a glass at 10:15, the next one isn't at 11:00 on the grid, but at 11:45. And when you reach the goal, it goes quiet until tomorrow:

```swift
let done = stats.periodCount(.day, now: now)
guard done < goal else { continue }
let lastToday = stats.dates.last.flatMap { cal.isDate($0, inSameDayAs: now) ? $0 : nil }
candidate = lastToday.map { max($0.addingTimeInterval(every), start) } ?? start
while candidate <= now { candidate.addTimeInterval(every) }
body = "Llevas \(done) de \(goal)\(unit) hoy. Toca Registrar para sumar uno."
```

## The 64 limit

iOS only lets an app have **64 scheduled notifications**. With several water habits and hourly stretches, it's easy to go over, and what happens then is silent: the extra ones simply don't get scheduled.

That's why an item's repeating reminders only schedule what's left of today and tomorrow, with a maximum of 24. More isn't needed: every time you log, or when you come back to the app, everything is rescheduled from scratch. The reminders are a sliding window, not a calendar.

## Reschedule everything, always

Rescheduling only what changed seems more efficient, but it's a source of bugs: an old reminder nobody deleted, a duplicate one. The rescheduling function does the simplest thing:

1. Calculate all reminders for all active items.
2. Delete the pending ones that start with its prefix (`item-`).
3. Add the new ones.

The prefix matters: the “the app expires tomorrow” notification and the place ones don't start with `item-`, so they're left alone.

## A place that asks you when you arrive

An item can have a place. If you're at the grocery store and tap “Save my current location” (and name it “Walmart”), the next time you arrive you get: “You've arrived at Walmart. Should I log it?”, with the “Log ✓” button.

Under the hood it uses `CLMonitor` with a circular condition per item (150 m by default). Three important details:

- **Since iOS 18 you have to keep a `CLServiceSession`** so the system monitors places with the app closed. It's only created if some item has a place.
- **Don't re-register a place that didn't change.** Adding it again resets its state and can trigger a false “you've arrived”. Before adding, it compares center and radius with what's already there.
- **A 6-hour cooldown.** If you logged it recently, arriving doesn't trigger anything. Nobody wants to be asked about groceries when they go back for something they forgot.

And the location never leaves the iPhone: there's no server, everything is evaluated on the device.

## Ask for permission when it's needed

The app doesn't ask for notification or location permission the first time it opens. It asks when you turn on a reminder or save a place, which is when the permission makes sense. A permission requested without context gets denied; one requested right after tapping “Reminders” almost always gets accepted.

## What I learned

- **A good reminder arrives when something is unusual, not when the clock says so.** The 1.5 factor over the average lets normal delays pass and only flags the ones that aren't.
- **System limits fail silently.** The 64-notification limit doesn't throw an error; you have to design so you never reach it.
- **Recalculating everything is simpler than syncing changes.** With a few dozen reminders, deleting and recreating is instant and always comes out right.
