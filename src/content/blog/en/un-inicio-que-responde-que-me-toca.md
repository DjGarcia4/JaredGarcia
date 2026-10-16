---
title: "A home screen that answers “what's on me today?”"
description: "GanttHub's dashboard was a wall of numbers. I rebuilt it to answer three questions when you open the app: what needs attention, what changed since my last visit and what was assigned to me. Without writing anything to the database."
date: 2026-10-16
tags: [product, design, ux, gantthub]
projects: [gantthub]
kind: learning
keyword: "home"
cover: /img/projects/gantthub/01.webp
---

I open GanttHub every morning. I use it for my own projects and for Wink's, and the first thing I want to know isn't how many tasks there are in total. I want to know what's on fire, what the team did since yesterday and what's on me.

The previous dashboard was a row of cards with numbers: active projects, pending tasks, completed this week, budget spent. Correct data, but you had to interpret it. “15 pending tasks” doesn't tell you whether that's good or bad, or which ones are yours.

## Start with a sentence, not a chart

The home screen opens with a greeting based on the time of day and a plain-language summary:

> 1 project needs attention. 2 changes from your team in the last 24 h.

The sentence is built from whatever applies: overdue tasks, what of yours is due today, meetings, invitations, mentions, update requests and projects at risk. Each fragment is a button that takes you to its section. If nothing's pending, it changes to “all clear”. Reading one sentence is faster than reading six numbers, and it tells you where to start.

The indicators are still below, but each with context: not just “15 pending”, but “6 assigned to you”; not just “1 overdue”, but “0 yours · 1 high priority”.

## “Needs attention”, with rules you can explain

To say a project needs attention, the app computes its health with simple and, above all, explainable rules:

- **Late**: the project's deadline has passed and there are open tasks.
- **At risk**: at least 25% of open tasks are overdue, or progress is more than 20 points behind elapsed time, or the budget is fully spent.
- **No data**: no tasks and no deadline.
- **On track**: everything else.

Each status comes with its reason in words: “4 of 10 open tasks overdue”, “70% of the timeline elapsed, 40% completed”. A traffic light without an explanation breeds distrust; one that says why it's yellow tells you what to do.

The progress-versus-time rule is the one I use most. If a project is halfway through its timeline with 20% of its tasks done, nothing is overdue yet, but it's already behind. It's the alert that arrives before dates start slipping.

## “What changed” since your last visit

The “What changed” section shows what the team did: tasks completed, created, status changes, comments, update requests and new people on projects. By default, since your last visit.

The interesting part is how it knows your last visit. There are no Firestore writes: everything is stored in the browser.

- When you open the home screen, the app reads your previous visit and pins it as the session baseline in `sessionStorage`. So going to a project and coming back doesn't reset it: it keeps showing what changed since the morning.
- Then it saves the current time in `localStorage` as tomorrow's last visit.
- If you've never been in, it shows the last 24 hours. And if you come back after a long time, the cap is 30 days, so it doesn't dump the whole history on you.

```ts
let baseline = Number(read(session, baseKey))
if (!baseline) {
  baseline = Number(read(local, visitKey)) || 0
  write(session, baseKey, String(baseline))
}
lastVisit.value = new Date(
  baseline ? Math.max(baseline, Date.now() - 30 * DAY) : Date.now() - DAY,
)
write(local, visitKey, String(Date.now()))
```

There are also tabs for the last 24 hours or the last 7 days, independent of your visit.

## “For you”: what's yours

The “For you” tray gathers what involves you directly: mentions in comments, tasks assigned to you and update requests. You can mark items as seen, and that lives in the browser too: a bounded list of keys (up to 400) so it doesn't grow forever.

All of this is computed from the tasks the view has already loaded: comments, who created and updated each task, update requests and the date each member joined the project. No extra queries, no activity collections. The decision has a cost (switch browsers and “seen” starts from scratch), but it keeps the home screen fast and adds no writes for every person who opens it.

## The order of the screen

The order follows the questions, from urgent to general:

1. The summary and the indicators.
2. **Today**: the day's meetings and what of yours is due today.
3. **For you**: mentions and assignments.
4. **What changed** and **Coming up**.
5. Further down: your work, the status breakdown, each project's health, the portfolio, the week's activity and team workload.

The charts are still there, but at the end. They're for when you have time to look at the big picture, not for the first glance of the morning.

## What I take away

- A dashboard is designed from the questions of whoever opens it, not from the data you have.
- A sentence with links beats a row of numbers at telling you where to start.
- If you mark something “at risk”, say why. The reason turns an alert into an action.
- Not all state has to live in the database. “My last visit” belongs to the browser, and keeping it there makes the home screen simpler and faster.
