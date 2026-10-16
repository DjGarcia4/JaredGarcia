---
title: "Migrating data without breaking anyone's app"
description: "GanttHub's new rules needed fields existing projects didn't have. Deploying them without migrating made projects disappear. The order I followed, and why the front end listens to two sources at once."
date: 2026-10-16
tags: [firebase, data, deployment, gantthub]
projects: [gantthub]
kind: learning
keyword: "migration"
---

When I moved GanttHub's permissions into the Firestore rules ([I cover it here](/blog/los-permisos-no-se-esconden)), the new rules started trusting three fields on each project: `memberIds`, `memberRoles` and `pendingInvites`. New projects had them. Existing ones, the projects of Wink and the other companies, didn't.

That has a direct consequence. The only query the new rules allow for listing projects is “projects where my uid is in `memberIds`”. A project without `memberIds` doesn't show up in that query for anyone. If I deployed the rules without migrating the data, the teams' projects would simply vanish from the app.

## Three pieces that ship separately

The change touched three things that leave Firebase by different paths:

1. **The front end**, which ships on every push to `main` (GitHub Actions to Firebase Hosting).
2. **The data**, which has to be backfilled with a script.
3. **The rules**, which are deployed with `firebase deploy --only firestore:rules,storage`.

There's no way to ship all three at the same moment. So the question wasn't how to make it atomic, but in what order, and how to make each step work with both what came before and what comes after.

## Step 1: a front end that works with both sets of rules

The new front end does two things so it doesn't depend on the order.

First, **it always writes the new fields**. Creating a project, inviting, accepting, changing a role or removing someone updates `members` and, in the same change, `memberIds`, `memberRoles` and `pendingInvites`. So everything touched from deployment day on is already in the new format.

Second, **it reads from two sources at once** and merges them:

```ts
// 1. The query the new rules allow.
onSnapshot(query(collection(db, 'projects'), where('memberIds', 'array-contains', uid)), ...)

// 2. Legacy: the whole collection, filtered on the client.
//    With the old rules it works and brings in unmigrated projects.
//    With the new rules it's rejected (permission-denied) and silently ignored.
onSnapshot(collection(db, 'projects'), ..., () => {
  legacyAlive = false
  fromLegacy.clear()
  if (membersAlive) publish()
})
```

Results are merged by id. With the old rules, the second source brings everything and the first brings what's already migrated. With the new rules, the second fails and only the first remains, which by then has everything. The app only shows an error if both fail.

At first the front end read only the new query, which forced migrating before deploying. Adding the legacy source turned the order into a recommendation instead of a requirement: the front end can ship at any time.

## Step 2: a script you can run twice

The migration is a Node script using `firebase-admin`, which bypasses the rules. It walks through the projects and, for each one:

- Computes `memberIds` and `memberRoles` from `members` and `ownerId`.
- Builds `pendingInvites` from the pending invitations that exist as notifications.
- Normalizes `members`: the oldest format was a `{ uid: role }` map and becomes an array; duplicate entries are reduced to one; if the owner is missing from the list, they're added; and if someone else is marked as owner, they become admin.

Three decisions make it safe:

- **It's idempotent.** Running it again doesn't change projects already migrated. If it stops halfway, you run it again and that's it.
- **It has `--dry-run`.** It shows what would change without writing anything. In production it always runs that way first.
- **It knows which database it points at.** With `--emulator` it uses the local `demo-gantthub` project; for production you have to pass `--project` explicitly. If you pass neither, it does nothing.

```bash
node scripts/migrate-member-ids.mjs --emulator --dry-run
node scripts/migrate-member-ids.mjs --emulator
node scripts/migrate-member-ids.mjs --project <projectId> --dry-run
node scripts/migrate-member-ids.mjs --project <projectId>
```

The normalizations came from asking myself what odd data could exist after more than eight months of use. The new rules validate that the team is consistent: exactly one owner, the same people in `members` and in `memberIds`. A project with inconsistent old data wouldn't just stop being listed: it couldn't be edited either, because any change would leave a document the rule rejects.

## Step 3: the rules, last

With the new front end live and the data migrated, only then do the rules ship. Before that, a copy of the current rules from the console, in case you need to roll back. The first time, Firebase asks for permission for Storage to read Firestore, because the file rules check project membership; you have to accept it.

And one more safety net, written into the rules themselves and covered by a test: a project without `memberIds` is still readable by its owner. If a project slips past the migration, its owner doesn't lose it.

## What I take away

- If you have several pieces that ship separately, decide the order and make each step work with the previous one and the next one.
- A front end that tolerates both worlds frees you from the exact order. Reading from two sources during the transition is cheap; a vanished project isn't.
- A migration has to be runnable twice, with a test mode, and refuse to run if you don't tell it where.
- Before migrating, list the odd data that might exist. Whatever the new rule will reject is exactly what the script has to fix.
