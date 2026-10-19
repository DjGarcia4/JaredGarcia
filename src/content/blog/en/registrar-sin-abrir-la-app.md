---
title: "Logging without opening the app"
description: "Widgets, the Lock Screen, Control Center, Siri, notifications and the Dynamic Island: in Hace Cuánto they all use the same App Intents action. How the database is shared and why the intent is declared as a LiveActivityIntent."
date: 2026-10-19
tags: [ios, app intents, widgetkit, hacecuanto]
projects: [hacecuanto]
kind: learning
keyword: "widgets"
cover: /img/projects/hacecuanto/03.webp
---

In a logging app, every step between “I remembered” and “it's logged” is a chance not to do it. Unlock, find the app, open it, find the item, tap it: that's five steps for something that takes a second.

That's why in Hace Cuánto you can log from six places without opening the app: the Home Screen widgets, the Lock Screen widgets, Control Center, Siri, the “Log ✓” button on notifications and the Apple Watch. This post is about the five that live on the iPhone, and about the decision that makes them easy to maintain: **they all use the same action**.

<figure>
  <img srcset="/img/projects/hacecuanto/03-800.webp 800w, /img/projects/hacecuanto/03-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/hacecuanto/03-1600.webp" alt="Hace Cuánto widgets: one with several items, one for Drink water with its progress bar, one for Reading in dark mode, the Lock Screen ones and the Apple Watch app." loading="lazy" decoding="async" />
  <figcaption>Widgets for several items, for a single one, for what's due and for the Lock Screen, and the Watch app.</figcaption>
</figure>

## A database everyone can read

A widget is another process. Siri also runs outside the app. For all of them to see the same items, the SwiftData database doesn't live in the app's container but in an **App Group**, a folder shared by the app and its extensions:

```swift
static var storeURL: URL {
    let base = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: groupID)
        ?? URL.applicationSupportDirectory
    let dir = base.appending(path: "Library/Application Support", directoryHint: .isDirectory)
    try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
    return dir.appending(path: "HaceCuanto.store")
}
```

The first version saved to the app's own container, so there's a one-time migration: if the old database exists and the new one doesn't, it moves the three files (`.store`, `-shm` and `-wal`) to the App Group. Without it, updating the app would have looked like deleting all the data.

## A single action: log

The item is exposed to Siri and the widgets as an App Intents entity (`ItemEntity`), with name search that ignores case and accents: “registra cafe” finds “Café”. And there's a single action that logs it:

```swift
struct LogItemIntent: LiveActivityIntent {
    @Parameter(title: "Item")
    var item: ItemEntity

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let id = item.id
        let message: String = await MainActor.run {
            guard let item = SharedStore.item(id: id) else { return "No encontré ese item." }
            let label = "\(item.emoji) \(item.name)"
            switch item.tap(in: SharedStore.container.mainContext) {
            case .logged: return "Listo, registré \(label) ✓"
            case .started: return "Arrancó el cronómetro de \(label) ⏱"
            case .stopped(let entry): return "Listo: \(label), \(Fmt.duration(entry.duration ?? 0)) ✓"
            }
        }
        return .result(dialog: "\(message)")
    }
}
```

That same action is used by the widget button, the Control Center control and the Siri phrases (“Log Reading in Hace Cuánto”, “Note Gas in Hace Cuánto”). Under the hood it calls `item.tap(...)`, which is exactly what happens when you tap the card in the app: it logs, or starts and stops the timer if the item has one. **There's no “log from the widget” logic**; there's only one.

## Why `LiveActivityIntent` and not `AppIntent`

This is the line that taught me the most. An `AppIntent` triggered from a widget runs in the widget's process. It works, it saves to the shared database, but the app (if it's open in the background) doesn't find out: its SwiftData context keeps the old data until it reads again.

Declaring it as a `LiveActivityIntent` makes the system run it **inside the app's process**, even when a widget or Control Center triggers it. That way there's a single context writing, the app's screen updates right away and the notifications are rescheduled in the same step.

For “How long ago?”, which only reads, a normal `AppIntent` is enough. Siri answers how long ago it was, the exact day and time, and how many times you've done it.

## Telling everyone something changed

Every entry, wherever it comes from, ends up in the same place:

```swift
/// Tell everyone (widgets, reminders, Watch) that something changed.
static func didChange(in context: ModelContext) {
    reloadWidgets()
    let items = (try? context.fetch(FetchDescriptor<Item>(predicate: #Predicate { !$0.archived },
                                                          sortBy: [SortDescriptor(\.sortOrder)]))) ?? []
    Reminders.reschedule(items: items)
    NotificationCenter.default.post(name: didChangeNotification, object: nil)
}
```

Reload the widgets, reschedule the notifications (which depend on your last entry) and let the Watch and the location monitor know. Having a single function for this avoids the classic bug of “I logged from Siri and the widget still says 3 days ago”.

## The widgets

There are three widgets and each one answers something different:

- **One item**, in small, medium, large and on the Lock Screen (circular, rectangular and inline). The medium one shows the goal's progress bar or the dots for the last 7 days.
- **Several items**: 4 in the small and medium, 8 in the large. You choose which.
- **Due today**: unmet habits and what's due, overdue first and then whatever has the least progress. When nothing is left it says “All caught up”.

Since “3 days ago” changes over time even if you don't log anything, each widget delivers a timeline with one entry per hour for a day. The system redraws them on its own without waking the app.

## The notification that logs

Hace Cuánto's notifications have a category with a button, “Log ✓”. When you tap it, the notification delegate looks up the item by its id and calls the same `tap`. The app doesn't open; the notification goes away and the entry is already done.

## What I learned

- **One path, many doors.** Six ways to log could be six different pieces of logic. By making them all go through `tap` and `didChange`, adding Control Center took 20 lines.
- **Where the code runs matters as much as what it does.** The same intent, in another process, leaves the app out of date. `LiveActivityIntent` solves it with no extra syncing.
- **Migrate from the first change of location.** Moving the database to the App Group was invisible to me as a user thanks to a 10-line function that runs only once.
