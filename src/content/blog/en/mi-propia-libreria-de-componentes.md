---
title: "Why I rebuilt GanttHub on my own component library"
description: "Board, Gantt, finances, meetings and flows: every screen had grown its own buttons and modals. How I built a library with tokens and strict rules, and migrated the whole app onto it."
date: 2026-10-16
tags: [design, design-system, vue, gantthub]
projects: [gantthub]
kind: learning
keyword: "components"
---

GanttHub grew out of need. Every time one of my projects asked for something, I added it: first the board, then the budget, meetings, ideas, flows. Each screen was built in its moment, and each one solved its buttons, fields and modals its own way.

It showed. Before the library there were 17 different modal components, and 26 files built their own dark backdrop with `fixed inset-0`. Each with its own padding, its own shadow, its own way of closing and its own way of handling (or not) focus and the Esc key.

## A library that doesn't know the app

The library lives inside the repo, in `src/components/ui`, but under a strict rule: **it imports nothing from the app**. No stores, no Firebase, no `vue-i18n`. Only Vue, Lucide icons and its own files. The one exception is the date picker, which depends on its calendar library and on `date-fns`.

That forces it to receive everything from outside. And it makes it testable on its own: there's a gallery at `/dev/ui`, development only, that shows every component in all its states, in light and dark.

Today it's about thirty components, grouped by family:

- **Buttons**: `GhButton`, `GhIconButton`.
- **Forms**: `GhField`, `GhInput`, `GhTextarea`, `GhSelect`, `GhCheckbox`, `GhSwitch`, `GhChip`, `GhDatePicker`.
- **Display**: `GhBadge`, `GhAvatar`, `GhAvatarGroup`, `GhTooltip`, `GhProgress`, `GhSkeleton`, `GhDivider`.
- **Feedback**: `GhAlert`, `GhEmptyState`, `GhSpinner`.
- **Layout and navigation**: `GhCard`, `GhPageHeader`, `GhStatCard`, `GhTabs`, `GhMenu`.
- **Overlays and notices**: `GhModal` (also as a side panel), `GhConfirm`, a popover and toasts.

## Tokens are the only source of color

All styling comes from CSS variables prefixed `--gh-`: surfaces, text, borders, the emerald brand color, states, radii, shadows, z-index and animation durations. Components have no loose colors, only `var(--gh-*)`.

```css
:root {
  --gh-surface: #ffffff;
  --gh-text: #0f172a;
  --gh-border: #e2e8f0;
  --gh-primary: #059669;
  --gh-danger: #dc2626;
  /* … */
}
```

Dark mode is the same list of variables with other values under `.dark`. And since the tokens are also exposed to Tailwind, views build their layout with classes like `bg-gh-surface` or `text-gh-muted`, without inventing new grays.

Variants work the same way: a `danger` button doesn't bring its own CSS, it just reassigns the component's local variables. Adding a new tone means defining variables, not duplicating styles.

## The order of the layers

With Tailwind 4, a classic problem is who wins: the component's style or the utility class you pass from the view. I solved it by declaring the layer order in the tokens file, which is the first thing to load:

```css
@layer theme, base, components, utilities;
```

The library's styles go in `components`. So they beat Tailwind's reset, and a utility the view adds on purpose (a margin, a width) beats the component. No `!important`.

## The text doesn't come from the app either

Components add some text on their own: a modal's “Close”, a spinner's “Loading”, a confirmation's default buttons, the calendar's language. Since the library can't import `vue-i18n`, it has its own small system: Spanish defaults and a function to override them.

The app wires them up once, in `App.vue`, with a getter. So switching languages updates every component live:

```ts
provideGhMessages(() => ({
  cancel: t('common.cancel'),
  close: t('ui.close'),
  dateLocale: locale.value === 'en' ? enUS : es,
}))
```

And if a view passes the text explicitly as a prop, it always wins.

## Accessibility, in the library

The best part of centralizing is that accessibility gets solved once. `GhIconButton` requires an `aria-label`: without it, the button has no name. Fields inside `GhField` link themselves to their label and error message. Every control has a visible focus state, and animations respect `prefers-reduced-motion`. Before, each modal decided whether Esc closed it or whether it trapped focus. Now they all use `GhModal`.

## The migration

Once the library was ready, I migrated the whole app: layout, authentication, modals and every view. It was a big change (more than a hundred files), and I used it to redesign what needed it most: the morning dashboard, the Gantt with dragging, the board with manual ordering and the task detail with its file tray.

Today, of those 26 hand-made backdrops, one is left outside the library. The old modals still imported somewhere are thin wrappers over `GhConfirm` and `GhDatePicker`, marked as legacy so they aren't used in new code.

## What I take away

- An internal library pays off when the app has many screens that grew separately. Before that, it's premature.
- The most useful rule was “the library doesn't know the app”. It forces every component to be generic and viewable in isolation.
- If colors come only from tokens, dark mode and brand changes mean changing values, not hunting hex codes.
- Declaring the CSS layer order saves you the specificity war between components and utilities.
- Accessibility done centrally is done once, and every screen inherits it.
