---
title: "Three questions, one tap"
description: "In Hace Cuánto everything is an event, a habit or something due every X days. How a model this small is enough for streaks, “3 days left” and “you do it most on Sunday nights”, computing everything from the dates."
date: 2026-10-19
tags: [ios, swiftui, product design, hacecuanto]
projects: [hacecuanto]
kind: learning
keyword: "one tap"
cover: /img/projects/hacecuanto/01.webp
---

Hace Cuánto started with one question: how long ago was the last time I got a haircut? But as soon as I started using it, other similar questions showed up that weren't the same question:

- **“How long ago did I go grocery shopping?”** I just want to know when it was and how many times. There's no goal.
- **“Did I read today?”** Here there is a goal (once a day, or 3 times a week) and I care about not breaking the streak.
- **“Is it time for a haircut?”** There's an interval (every 28 days) and what I want is for it to tell me how much time is left or how long ago it became overdue.

Those are the app's three kinds of item: **event**, **habit** and **every X days**. The important part is that all three are logged the same way: with one tap.

<figure>
  <img srcset="/img/projects/hacecuanto/01-800.webp 800w, /img/projects/hacecuanto/01-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/hacecuanto/01-1600.webp" alt="Hace Cuánto's home screen with what's due and the week's summary, and the detail of the Reading habit with its streak and calendar." loading="lazy" decoding="async" />
  <figcaption>The home screen, and a habit's detail: streak, totals, average and calendar.</figcaption>
</figure>

## An entry is a date

The model is almost ridiculously small. An `Item` has its configuration (type, goal, interval, color, emoji) and a list of `Entry`. And an `Entry` is, above all, a date. The text, number, note or duration are optional.

What I don't store matters just as much: **there's no streak field, no “last time” field and no “overdue” field**. Everything is computed from the dates, in a separate type that knows nothing about SwiftData:

```swift
/// All of an item's numbers, computed from its dates.
struct ItemStats {
    let dates: [Date] // oldest to newest

    func remainingDays(interval: Int, now: Date = .now) -> Int? {
        daysSinceLast(now: now).map { interval - $0 }
    }
}
```

If you delete an old entry, or add one from last week that you forgot, the streak recalculates itself. There's nothing to sync because nothing derived is stored. And since `ItemStats` only receives dates, the app, the widgets, Siri and the Apple Watch all use it the same way.

## The streak doesn't break halfway through the day

The streak rule has a detail you notice in real use. If your goal is to read once a day and it's 9 in the morning, you haven't read today yet, but that doesn't mean you broke the streak. The day isn't over.

```swift
/// The streak is still alive if the current period isn't met yet but the previous one is.
func currentStreak(goal: Int, period: GoalPeriod, now: Date = .now) -> Int {
    let counts = periodCounts(period)
    var cursor = periodStart(now, period)
    if (counts[cursor] ?? 0) < goal { cursor = step(cursor, period, by: -1) }
    var streak = 0
    while (counts[cursor] ?? 0) >= goal {
        streak += 1
        cursor = step(cursor, period, by: -1)
    }
    return streak
}
```

The same function works for daily and weekly goals: only what counts as a “period” changes. The best streak uses the same idea, walking through the met periods and counting the consecutive ones.

## “You do it most on Sunday nights”

My favorite part of the detail screen is a sentence. With three entries or more, the app counts which day of the week and which part of the day (morning, afternoon or night) your entries fall on, and tells you the most common one. It's a calculation of two histograms, but it reads like something that knows you.

The full detail screen has the numbers (today, streak, total, this month, this year, average, best streak), a calendar of the last 18 weeks, the count per month for the last 6 months and, if the item has details, the breakdown: “Atomic Habits, 31 times; The Little Prince, 24 times”.

## One tap, then the optional part

Logging is tapping the card. Nothing else. A notice appears at the bottom with two buttons: **undo** and **add detail**. If the item asks something (“How much did it cost?”, “Which book?”), you answer it afterwards, only if you want to.

There are two settings that make the detail almost never necessary:

- **Repeat the last detail.** If you're reading the same book all month, each new entry copies the previous one's title.
- **Fixed options.** “Where?” with Walmart, Costco or Soriana is picked with one touch, no keyboard.

And if the item has a timer (working on a project, exercising), the tap doesn't log: it starts. The second tap stops it and saves the duration.

## Templates so you don't start from a blank slate

Creating an item from scratch forces you to decide type, goal, interval and detail before using it. That's why the form opens with 14 templates: “Haircut” already comes with every 28 days, “Drink water” comes with a goal of 8 glasses with reminders during the day, “Gas” already asks how much you filled up. You tap one, adjust what you want and save.

## What I learned

- **Separate the question from the action.** The three kinds of item answer different questions, but the action is a single one. That decision is what makes logging from a widget, from Siri or from the watch just as simple.
- **Don't store what you can compute.** With a few hundred dates per item, computing everything on the fly is instant and removes an entire category of bugs.
- **The optional part comes later.** Asking for the detail before logging would mean that half the time nothing gets logged.
