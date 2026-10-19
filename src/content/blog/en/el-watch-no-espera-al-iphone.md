---
title: "The Watch doesn't wait for the iPhone"
description: "On Hace Cuánto's Apple Watch app the tap applies right away, even when the iPhone is far away. How entries are queued with their original time, how they're kept from disappearing from the screen and how undo works."
date: 2026-10-19
tags: [watchos, swift, sync, hacecuanto]
projects: [hacecuanto]
kind: learning
keyword: "watch"
---

The Apple Watch is the best place to log something: it's on your wrist, there's nothing to unlock and the tap takes a second. But it has a problem: the iPhone, which is where the data lives, isn't always nearby.

If the Watch waited for the iPhone to confirm each tap, logging without the iPhone would be impossible, and with the iPhone nearby it would feel slow. So the rule was: **on the wrist, the tap applies right away; syncing comes later**.

## Who's in charge

First I had to decide who holds the truth. Two databases syncing in both directions are an endless source of conflicts, so there aren't two:

- **The iPhone is the single source of truth.** It has the SwiftData database with all the entries.
- **The Watch has a read-only copy**: a JSON with a summary of each item (name, emoji, color, type, goal and the dates of its last 200 entries). That's enough for “how long ago”, streaks and averages.
- **What the Watch sends are actions**, not data: “tap on this item at this time” or “undo the tap from this time”.

The iPhone sends the summary with `updateApplicationContext` every time something changes. That channel has a useful property: it only keeps the latest value. If the Watch was off and there were ten changes, when it turns on it gets just one, the newest.

## A tap with its original time

When you tap an item on the Watch, three things happen, in this order:

1. The date is added to the local copy and saved. The screen and the complication change right away, with a haptic.
2. The tap is remembered as **pending**.
3. It's sent to the iPhone.

```swift
private func send(_ message: [String: Any]) {
    let session = WCSession.default
    guard session.activationState == .activated else {
        session.transferUserInfo(message)
        return
    }
    if session.isReachable {
        session.sendMessage(message, replyHandler: { [weak self] reply in
            self?.apply(reply)
        }, errorHandler: { _ in
            session.transferUserInfo(message)
        })
    } else {
        session.transferUserInfo(message)
    }
}
```

If the iPhone is nearby, `sendMessage` arrives instantly and the iPhone replies with the updated list. If not, or if the message fails, it falls back to `transferUserInfo`: a queue the system keeps and delivers when they see each other again, even if hours go by.

The important part is that the message carries **the time of the tap**, not the time it arrived. If I logged “Exercise” at 7 a.m. and the iPhone found out at 9, the entry says 7 a.m. Otherwise, the streaks and the patterns (“you do it most in the morning”) would be wrong.

## Nothing disappears

Here's the subtlest case. I log on the Watch, the tap applies locally and travels in the queue. Meanwhile, a new summary arrives from the iPhone (for example, because I logged something else on the phone). That summary doesn't include my tap yet, so if the Watch replaces its list with it as-is, **the entry disappears from the screen**. Minutes later it arrives through the queue, the iPhone saves it, sends another summary and it reappears.

Nothing is lost, but seeing an entry disappear makes you distrust the whole app. The fix is for the Watch to reapply its pending taps on top of any list it receives:

```swift
var merged = decoded
self.pendingTaps.removeAll { tap in
    guard let item = merged.first(where: { $0.id == tap.id }) else { return true }
    return item.dates.contains { abs($0.timeIntervalSince(tap.date)) < 1.5 }
}
for tap in self.pendingTaps {
    if let index = merged.firstIndex(where: { $0.id == tap.id }) {
        merged[index].dates.append(tap.date)
        merged[index].dates.sort()
    }
}
```

A tap stops being pending when the iPhone's list already has a date within a second and a half of its own. Until then, it keeps showing. The tolerance exists because dates travel as seconds in a `Double`, and there's no need to require them to match to the millisecond.

## Undo, also by time

After each tap, the Watch shows an undo button. Undoing locally is easy: the Watch keeps how the item was before the tap and restores it. But the iPhone also has to delete that entry, and the new entry doesn't have an id the Watch knows yet.

So undo is identified the same way as the tap: by item and by time. The iPhone looks for an entry of that item within 2 seconds of that time and deletes it. If the item had a timer and what was undone was the start, it turns off the timer and ends the Live Activity.

## The complication

The watch face complication reads the same local copy as the app. On the Watch there's no screen to configure a widget, so instead of asking you to choose an item, it offers one option per item when you add it to the watch face. Tapping it opens the Watch app with a link (`hacecuanto://tap/<id>`) that logs that item.

## What I learned

- **A single source of truth simplifies everything else.** The Watch never writes data, it only asks for actions. There are no conflicts to resolve.
- **Optimistic in the UI, patient on the network.** The tap shows instantly, and delivery can take hours without it mattering.
- **The time of the event is part of the data.** Sending the time of the tap, not the time of arrival, is what keeps streaks correct when the iPhone is far away.
- **Sync bugs look like trust bugs.** Even if nothing is lost, seeing an entry disappear for a minute is enough to doubt the app.
