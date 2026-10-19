---
title: "Every widget in every size, in one test"
description: "Hace Cuánto has 3 widgets in up to 6 sizes. Checking them by hand in the simulator was slow, so a test draws them all as PNGs with fixed data. How it works and what it lets you check at a glance."
date: 2026-10-19
tags: [ios, widgetkit, testing, hacecuanto]
projects: [hacecuanto]
kind: learning
keyword: "snapshots"
---

Hace Cuánto has three widgets: one for a single item, one for several and one for what's due. The single-item one comes in six sizes: small, medium and large for the Home Screen, and circular, rectangular and inline for the Lock Screen. Adding up the variants, that's more than twenty different views.

Checking them in the simulator is slow: add the widget, pick the item, wait for the system to draw it, change the size, repeat. And to see the “8 glasses of water with 4 logged” case you have to actually log four glasses. So I made a test that does all of that at once.

## The idea: draw without the system

A widget is, in the end, a SwiftUI view that receives an entry (`TimelineEntry`) and draws it. WidgetKit decides when and in what size, but the view itself can be drawn anywhere. `ImageRenderer` turns a view into an image, so the test only has to build the view with fixed data and save the PNG.

The only obstacle is the size. Inside a widget, the view reads `widgetFamily` from the environment, and outside WidgetKit that value doesn't exist. That's why every widget view accepts a forced size, just for the tests:

```swift
struct ItemWidgetView: View {
    @Environment(\.widgetFamily) private var environmentFamily
    let entry: ItemEntry
    /// Only for the tests that draw every size.
    var forcedFamily: WidgetFamily?

    private var family: WidgetFamily { forcedFamily ?? environmentFamily }
}
```

## The test

The test defines the real sizes in points and some sample items with dates relative to a fixed time:

```swift
/// Today at 6 p.m., so "today" has entries no matter what time the test runs.
private let now = Calendar.current.date(bySettingHour: 18, minute: 0, second: 0, of: .now)!
private func ago(_ hours: Double) -> Date { now.addingTimeInterval(-hours * 3600) }
```

That 6 p.m. detail matters: if the test ran at 8 in the morning with dates relative to the real time, “Drink water” with entries from 5 and 3 hours ago would fall on the previous day and the widget would show 0 of 8. The screenshot would be fine; the data wouldn't.

Then, for each size and each item, it builds the view, gives it the frame it would have on screen (background, rounded corners, dark mode on the Lock Screen) and saves it at 3× to a folder:

```swift
@Test func itemWidgets() throws {
    for (family, size, label) in Self.sizes {
        for (item, tag) in [(water, "agua"), (haircut, "corte"), (project, "proyecto")] {
            try render(ItemWidgetView(entry: ItemEntry(date: now, snapshot: item), forcedFamily: family),
                       family: family, size: size, name: "item-\(label)-\(tag)")
        }
    }
}
```

The sample items cover the cases that break the most: a habit with a goal and a unit (“4 of 8 glasses”), something overdue (“Overdue by 3 days”), a running timer and an event with no goal. The what's-due widget is also drawn with everything done, to see the “All caught up” state.

## A target that doesn't need the app

The test lives in its own target, which compiles the widget files directly, except the entry point (`WidgetBundle.swift`) and the `Info.plist`. That way it doesn't depend on installing the extension or the app, and it runs in a couple of seconds.

```yaml
WidgetSnapshotTests:
  type: bundle.unit-test
  sources:
    - WidgetSnapshotTests
    - Shared
    - path: HaceCuantoWidgets
      excludes: [WidgetBundle.swift, Info.plist, "*.entitlements"]
```

## It doesn't compare, it shows

This test doesn't fail if a pixel changes. On purpose: the widgets change often while I design them, and a test that compares against saved images would have to be regenerated every time. What I wanted was to **see** the twenty-odd widgets together after each change, and that's what it does. The images I show in the portfolio come from this same test.

What does get tested with assertions is the logic behind them: streaks, “X days left”, the what's-due text, the order of what's due. That lives in 29 Swift Testing tests that don't draw anything.

## What you check at a glance

- **Text that doesn't fit.** A long name with “Overdue by 3 days” in the small widget is the first thing to break, and in the folder you see it without looking for it.
- **Dark mode.** There's a fixed dark variant of the medium widget to check the contrast of the secondary text.
- **The Lock Screen sizes.** The circular one is 76 points. Seeing it at 3× next to the large one makes it clear what information is too much.

## What I learned

- **If checking something is slow, it doesn't get checked.** With a test that draws everything in a couple of seconds, checking the widgets after each change stops being a chore.
- **Test dates have to be fixed.** “3 hours ago” depends on when the test runs. Anchoring them to a time of day avoids different results depending on the hour.
- **Not every test has to fail.** This one is a tool for looking, and it's fine for it to be just that.
