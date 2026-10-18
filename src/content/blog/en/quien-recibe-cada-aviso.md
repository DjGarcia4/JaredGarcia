---
title: "Who gets each notification: notifications as a pure function"
description: "GanttHub's notification inbox tells you when you're assigned, mentioned, or someone comments on or moves a task. The hard part isn't sending the notification, it's deciding who gets it. That decision lives in a function with no Firebase in it, tested with Vitest, and the Cloud Function just runs it."
date: 2026-10-18
tags: [firebase, cloud functions, testing, architecture, gantthub]
projects: [gantthub]
kind: learning
keyword: "inbox"
---

Until now, GanttHub sent emails: when you were assigned a task or mentioned, an email arrived. Inside the app, the bell only showed project invitations. If someone commented on your task or moved it to Review, you found out when you opened it.

I wanted an inbox inside the app for five things:

- you were assigned a task;
- you were mentioned in a comment;
- someone commented on a task that's yours or that you follow;
- the status of a task that's yours or that you follow changed;
- someone asked you for an update.

Writing the notification to Firestore is one line. The hard part is deciding **who** gets each one without creating noise.

## The rules for who gets what

Written in plain words, the rules are:

1. **Never the person who made the change.** If you comment, you don't notify yourself.
2. **Never someone who's no longer a project member.** Someone who left can still be in an old task's `assigneeIds`.
3. **One notification per person and event.** If you're mentioned in a comment on a task you follow, you get "mentioned you", not "commented" as well.
4. **If you were just assigned, you don't also get the status change.** "Assigned you" is enough.

They all come down to comparing the task **before** and **after** the change. And that can be written without Firebase.

## A pure function

The `inbox_rules.ts` file imports nothing from Firebase. It takes the task before, the task after and the project's members, and returns a list of notifications:

```ts
export const inboxForUpdate = (prev: InboxTask, next: InboxTask, members: Set<string>): InboxItem[] => {
  const out: InboxItem[] = []
  const actor = next.updatedBy || ''
  const taken = new Set<string>() // one notification per person and event
  const push = (uid: string, item: Omit<InboxItem, 'uid'>, key: string) => {
    if (!uid || !members.has(uid) || taken.has(`${key}:${uid}`)) return
    taken.add(`${key}:${uid}`)
    out.push({ uid, ...item })
  }
  // new assignees, status change, new comments, update request…
  return out
}
```

`push` holds rules 2 and 3: it filters out non-members and drops duplicates with one key per event (`assign`, `status`, `note:<id>`, `request`).

Comments are detected by id: the ones in `next.notes` that weren't in `prev.notes` are new. For each one, mentions go first, and then the remaining assignees and followers get "commented":

```ts
for (const uid of mentioned) push(uid, { type: 'mention', actorId: author, detail }, `note:${n.id}`)
for (const uid of watchers) {
  if (uid === author || mentioned.includes(uid)) continue
  push(uid, { type: 'comment', actorId: author, detail }, `note:${n.id}`)
}
```

Mentions are stored in the text as `@[uid|Name]`. A small function, `cleanNote`, turns them into `@Name` and trims the comment to 140 characters to show it in the notification.

## Testing it without emulators

Since it doesn't depend on Firebase, the function is tested with Vitest like any frontend util, importing it from the functions folder:

```ts
import { inboxForUpdate } from '../../../functions/src/inbox_rules'

it('new comment: mention to the mentioned, comment to the rest (not the author)', () => {
  const note = { id: 'n1', userId: 'ana', text: 'Ojo @[cy|Cy] con esto', mentionedIds: ['cy'] }
  const out = inboxForUpdate(base, { ...base, notes: [note], updatedBy: 'ana' }, members)
  expect(pick(out)).toEqual(['comment:fol', 'mention:cy'])
  expect(out.find((i) => i.type === 'mention')).toMatchObject({ actorId: 'ana', detail: 'Ojo @Cy con esto' })
})
```

There are nine tests that run in milliseconds. They cover assignments, excluding the author, people who left the project, mention versus comment, status with the newly assigned and the update request. They also cover an easy case to forget: editing a comment that already existed notifies no one. Every rule in the list above has its case.

## The Cloud Function just runs it

With the decision moved out, the triggers stay short. `inboxOnTaskUpdated` does three things:

1. **A cheap shortcut.** Most changes to a task (description, dates, checklist) don't produce notifications. Before reading anything, it checks whether the status, the assignees, the comment ids or the update request changed. If none of those did, it finishes without reading the project.
2. **It reads the project** to know who's a member, their names and the status labels.
3. **It writes the notifications in one batch**, one per person in `users/{uid}/notifications`.

It writes with the Admin SDK, which skips the security rules. The client can only read its own inbox and mark items as read; nobody can write notifications to someone else from the browser.

## In the app

The inbox subscribes to the latest 50 notifications. To show a toast when a new one arrives while the app is open, it ignores the first response (what was already there) and afterwards only looks at `added` documents:

```ts
if (!firstSnapshot && onArrive) {
  for (const ch of snap.docChanges()) {
    if (ch.type !== 'added' || ch.doc.metadata.hasPendingWrites) continue
    if (!ch.doc.data().read) onArrive({ ...ch.doc.data(), id: ch.doc.id })
  }
}
firstSnapshot = false
```

Without the first condition, opening the app would pop up fifty toasts at once.

## A stumble while testing it

The first end-to-end test produced no notifications. I simulated from a script that Ana assigned a task and mentioned someone else, and the inbox stayed empty. Before touching the code, I checked which ports were listening: of all the emulators, only Firestore was still alive. Auth and Functions had died hours earlier, so there was nothing to run the triggers.

After restarting them, the notifications arrived right away. The lesson is old, but it's easy to forget: when a trigger "does nothing", first check that the functions emulator is running and has loaded your code.

## What I take away

- **Separate the "who" from the "how".** Business logic in a pure function is tested in milliseconds and reads like a list of rules.
- **Write the rules before the code.** "Never the author", "never someone who left", "one notification per event". Each became one line and one test.
- **Exit early in triggers.** An `onUpdate` runs on every change to every task. If it's rarely needed, let it find out without reading anything else.
- **The first snapshot isn't news.** If you show live notifications, ignore what was already there.
