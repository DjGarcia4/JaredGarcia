---
title: "How to test Firebase rules in the emulator"
description: "A practical guide: a test project with one person per role, assertSucceeds and assertFails, throwaway emulators on other ports and which cases are worth writing. With real examples from GanttHub."
date: 2026-10-16
tags: [testing, firebase, security, guide, gantthub]
projects: [gantthub]
kind: guide
keyword: "tests"
---

GanttHub's security rules are about 400 lines long. They decide who reads, creates, edits and deletes projects, tasks, finances, meetings, ideas and files, depending on each person's role in each project (I cover that in [permissions aren't hidden](/blog/los-permisos-no-se-esconden)). Testing that by hand, signing in as four different users, doesn't scale. And a badly written rule doesn't warn you: it just lets through something it shouldn't.

Today those rules have 70+ tests that run against the Firebase emulator. This guide is how they're built.

## What you need

- `@firebase/rules-unit-testing`, the official package for testing rules.
- The Firestore emulator (and the Storage one, if you have file rules). They need Java.
- A test runner. I use Vitest, the same as the unit tests, but with its own config.

## 1. A fixed cast: one person per role

First, a test project with someone in every possible situation. In GanttHub that's six people with easy names:

```ts
export const U = {
  owner: 'alice',
  admin: 'adam',
  editor: 'eve',
  viewer: 'vic',
  outsider: 'mallory', // signed in, but not part of the project
  invited: 'ian',      // with a pending invitation as editor
} as const
```

Project `p1` has the first four as members and a pending invitation for `ian`. Before every test, Firestore is cleared and that project is seeded again, with rules disabled:

```ts
export const seedProject = async (env, id = 'p1', data = baseProject()) => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'projects', id), data)
  })
}

beforeEach(async () => {
  await env.clearFirestore()
  await seedProject(env)
})
```

Every test starting from the same state is what lets you read them without thinking about order.

## 2. One client per person

The package gives you a Firestore “as if you were” each user. With a one-line shortcut, the tests read almost like a permissions table:

```ts
const db = (uid?: string) =>
  uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore()
```

`db(U.viewer)` is the viewer. `db()` is someone without a session.

## 3. Test what passes and what doesn't

Each case uses `assertSucceeds` or `assertFails`. The golden rule: **for every allowed action, also test who can't do it.** A test that only checks what's allowed still passes if the rule lets everything through.

```ts
it('members of every role can get; outsiders, invitees and anonymous cannot', async () => {
  for (const r of ['owner', 'admin', 'editor', 'viewer'] as const)
    await assertSucceeds(getDoc(doc(db(U[r]), 'projects', 'p1')))
  await assertFails(getDoc(doc(db(U.outsider), 'projects', 'p1')))
  await assertFails(getDoc(doc(db(U.invited), 'projects', 'p1')))
  await assertFails(getDoc(doc(db(), 'projects', 'p1')))
})
```

## 4. Test queries, not just documents

Firestore rules don't filter results: they evaluate the whole query. If the query *could* return something you can't read, it's rejected entirely. So it pays to test exactly the queries the app makes, and also the ones nobody should be able to make:

```ts
it('list only with memberIds array-contains own uid', async () => {
  const ref = collection(db(U.viewer), 'projects')
  await assertSucceeds(getDocs(query(ref, where('memberIds', 'array-contains', U.viewer))))
  await assertFails(getDocs(ref)) // the whole collection
  await assertFails(getDocs(query(ref, where('memberIds', 'array-contains', U.owner)))) // someone else's
})
```

## 5. Attack the sensitive operations

The most valuable tests aren't the reads: they're the ones that try to sneak in. For accepting an invitation, for example, I test that the invitee joins with their role and also every trick:

```ts
it('invitee cannot escalate role or keep the invite', async () => {
  // invited as editor, tries to join as admin
  await assertFails(updateDoc(doc(db(U.invited), 'projects', 'p1'), acceptAs(U.invited, 'admin')))
  // joins with the right role, but without deleting the invitation
  const { [`pendingInvites.${U.invited}`]: _drop, ...keepInvite } = acceptAs(U.invited, 'editor')
  await assertFails(updateDoc(doc(db(U.invited), 'projects', 'p1'), keepInvite))
})
```

Others worth having: nobody changes the `ownerId`, nobody creates a second owner, an admin can't add members through the back door, a viewer can't change a task's status, and a task can't move to another project by changing its `projectId`.

## 6. Throwaway emulators, on other ports

Rules tests aren't part of `npm test`: they run with `npm run test:rules`, which starts its own emulators, runs Vitest and shuts them down.

```js
const args = [
  'emulators:exec',
  '--config', 'firebase.rules-test.json',
  '--project', 'demo-gantthub',
  '--only', 'firestore,storage',
  'npx vitest run -c vitest.rules.config.ts',
]
```

Two decisions make this comfortable:

- **`firebase.rules-test.json` uses the same rules files as production**, but different ports (Firestore on 8280, Storage on 9399). So you can run the tests with your development emulators open, without clashes.
- **The project is called `demo-gantthub`.** Firebase guarantees that a project with the `demo-` prefix never touches real resources.

In the Vitest config, `fileParallelism: false`: every file shares the same emulator, and in parallel one would wipe the other's data.

## 7. Storage is tested the same way

GanttHub's Storage rules read Firestore to know who's a member. The pattern is the same: seed the project in Firestore and test with one Storage client per person. The interesting cases there are about size and type: an avatar over 5 MB fails, an `.html` attachment fails, a viewer trying to upload a file to a task fails.

## What I take away

- Write the tests like a permissions table: for each action, who can and who can't.
- Test queries exactly as the app makes them. A query the rule rejects breaks the whole screen, not one document.
- The tests that try to sneak in (escalating a role, skipping a field, moving something to another project) are worth the most.
- With rules and tests in the repo, every rules change goes through the tests before it's deployed. Before, the rules lived only in the Firebase console, with no history.
