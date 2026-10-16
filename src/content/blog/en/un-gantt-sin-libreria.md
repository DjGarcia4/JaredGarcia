---
title: "A Gantt chart without a library"
description: "How GanttHub's timeline is built: bars you drag and stretch with day snapping, milestones, keyboard, touch and optimistic saving. And why each bar handles its own drag."
date: 2026-10-16
tags: [frontend, vue, interaction, gantthub]
projects: [gantthub]
kind: learning
keyword: "gantt"
cover: /img/projects/gantthub/02.webp
---

The product is called GanttHub, so the Gantt couldn't be an add-on. It had to feel like part of the app: the same tasks as the board, the same status colors, the same assignees, and editing dates had to be as direct as moving a card on the Kanban board.

I built it by hand, without a library. It's four files: the tab that lays out the grid, the bar, the toolbar and some date utilities. This is what I learned building it.

## The same tasks, no planning twice

The Gantt has no data of its own. Every task on the board becomes a bar with a simple rule:

- **Start**: the start date if it has one; otherwise, the creation date.
- **End**: the due date if it has one; otherwise, the same day as the start.
- **Inconsistent data** (a due date before the start): if the start is explicit, the start wins; otherwise, the due date wins.
- **Milestone**: meetings, and tasks with an explicit start equal to their due date. They're drawn as a diamond instead of a bar.

A task without a due date is drawn with a dashed border. It's how you say “this is on the timeline, but nobody gave it a date” without hiding it.

## Dates without time-zone surprises

Task dates are stored as `YYYY-MM-DD` text. It sounds like a detail, but `new Date('2026-10-16')` is parsed as midnight UTC, and in Honduras (UTC−6) that's 6 p.m. on the 15th. A bar that shifts a day depending on where you are is exactly the kind of bug that makes you distrust a timeline.

So the parser treats that format as a local date, by hand:

```ts
const YMD = /^(\d{4})-(\d{2})-(\d{2})$/
const m = YMD.exec(value)
if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
```

And it saves in the same format the date picker uses everywhere else in the app. One representation for dates across the whole app.

## Each bar handles its own drag

The decision that paid off the most: **drag state lives inside the bar**, not in the tab. While you drag, the bar only stores how many days the start and the end moved, and shifts itself with a `transform`. The rest of the Gantt doesn't notice or re-render. Only when you release does the bar emit `commit` with the new dates.

There are three drag modes: from the body it moves the whole bar, from the left edge it changes the start, and from the right edge it changes the end. Movement is rounded to whole days based on the day width at the current zoom:

```ts
const applyDelta = (days: number, m: GanttDragMode) => {
  const span = spanDays.value
  if (m === 'move') {
    dStart.value = days
    dEnd.value = days
  } else if (m === 'start') {
    dStart.value = Math.min(days, span - 1) // the start can't pass the end
    dEnd.value = 0
  } else {
    dStart.value = 0
    dEnd.value = Math.max(days, -(span - 1)) // the end can't pass the start
  }
}
```

While dragging, a tooltip shows the dates and duration live. It's mounted on `body` so it doesn't end up under the calendar's sticky header.

One detail about feel: the drag only starts after 4 pixels. If the pointer moves less, it's a click and opens the task. Without that threshold, every click nudged the bar by accident, or opened the task when you meant to move it.

## Milestones you can stretch

A milestone is a diamond, but it doesn't have to stay one. The diamond has a grip on its right: stretch it and it becomes a bar. And a one-day bar with an explicit start goes back to looking like a milestone. Meetings are the exception: they're always one day long, so you can move them but not stretch them.

## Keyboard

Each bar is focusable. Enter or Space opens the task. The arrow keys move it one day; with Shift, they change the end. Esc cancels.

With the keyboard I don't save on every keypress: moving a bar five days would be five writes. Keypresses accumulate and are saved together 700 ms after the last one, or when focus leaves the bar. Each bar's accessible label says its title, its dates, whether it's overdue or done, and how to move it.

## Touch

On a phone, a horizontal gesture over the Gantt is scrolling, not dragging. Trying to tell “I want to move the bar” from “I want to see next week” under a finger causes more mistakes than it helps. So on touch the bars don't drag: a tap opens the task and you change the dates there.

## Optimistic saving, with a way back

When you release, the bar stays where you left it even if Firestore hasn't answered yet. A map of *overrides* handles that: temporary dates per task, each with a sequence number.

```ts
const token = ++overrideSeq
overrides.set(t.id, { start, end, token })
try {
  await taskStore.updateTask(props.projectId, t.id, updates)
} catch {
  // The store already showed the error; removing the override snaps the bar back
} finally {
  if (overrides.get(t.id)?.token === token) overrides.delete(t.id)
}
```

The sequence number prevents a race: if you move the same bar twice in a row, the first save's response doesn't wipe the second position. And if the save fails, there's nothing to undo by hand: the override disappears and the bar returns to the date the database has.

Moving a bar also writes the start, even if the task didn't have one. Otherwise a task whose start was computed from its creation date would “jump” back when recalculated.

## Everything else

Day, week or month zoom (40, 20 and 7 pixels per day), grouping by status, assignee or category with collapsible groups, a filter by person, show or hide completed tasks, and a button to jump back to today. Zoom, grouping and the completed filter are remembered per browser. Scrolling to today respects `prefers-reduced-motion`.

## What I take away

- In drag interactions, let the state live in the element that moves. The rest of the screen only needs to hear about it at the end.
- Dates without a time are stored as text and parsed as local. `new Date('YYYY-MM-DD')` is UTC.
- A threshold of a few pixels separates a click from a drag, and it matters more than it seems.
- Optimism needs an exit: if the save fails, the UI has to return to the truth on its own.
- Building it myself was more work than installing a library, but the Gantt speaks the same visual language as the rest of GanttHub, and that's what I was after.
