---
title: "Developing with Firebase without touching production"
description: "A guide to working locally with the Firebase emulators: a demo- project, seeded data that always looks like today, one button to sign in as the test user, emails switched off and ports that don't collide. As I use it in GanttHub."
date: 2026-10-16
tags: [firebase, development, tooling, guide, gantthub]
projects: [gantthub]
kind: guide
keyword: "local"
---

For a long time, developing GanttHub locally meant using the real Firebase project. Every test created real projects, every comment could send a real email, and testing permissions meant creating real users. And I use GanttHub every day for my own work, so the risk of messing up my own data was real.

Today there's a full local mode: Auth, Firestore, Storage and Functions running in the emulators, with sample data and a test user. This guide is how it's set up.

## 1. A `demo-` project

The most important piece is a name. In emulator mode, the app uses the `demo-gantthub` project:

```ts
// In emulator mode we use a "demo-" project: Firebase guarantees it never touches real resources.
const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true'
if (useEmulators) firebaseConfig.projectId = 'demo-gantthub'
```

Firebase treats projects starting with `demo-` specially: they only exist in the emulators. If something is misconfigured and a call escapes the emulator, it doesn't reach any real project. It's a safety net that doesn't depend on me remembering anything.

Then the app connects Auth, Firestore and Storage to their emulators:

```ts
if (useEmulators) {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectStorageEmulator(storage, 'localhost', 9199)
}
```

## 2. Two commands, two modes

```bash
npm run emulators   # start the emulators
npm run dev:local   # the app in emulator mode (vite --mode emulator)
```

`dev:local` loads `.env.emulator`, which turns on the emulators and defines the test user. That file is in the repo, because it holds no secrets: those credentials only exist inside the Auth emulator. Plain `npm run dev` still points at the real project, for when you need it.

The emulators use the **same security rules as production**. Locally you test the real rules, not a relaxed version. If something works locally, it's because the real rules allow it.

## 3. Data that always looks like today

An empty emulator is no use for working on a dashboard or a Gantt chart. So there's a seed script:

```bash
npm run seed:dev
```

It creates three users (the test user and two teammates), three projects with different teams and roles, tasks in every status, subtasks, comments with mentions, budgets and meetings.

The detail that matters most: **every date is relative to today**. A task is due “in 3 days”, a comment is “from 2 days ago”, a meeting is “on Monday”. If I seeded fixed dates, in two weeks everything would be overdue and the dashboard would stop looking like a normal day.

```js
const days = (n) => {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + n)
  return d
}
```

Two more things make the script comfortable:

- **It's idempotent.** It always writes the same documents with the same ids. Running it again updates instead of duplicating, so it doubles as a way to “reset” the dates whenever you want.
- **It skips the rules on purpose.** The emulator accepts the `Authorization: Bearer owner` header as an admin. The script seeds with it, because its job is to create the initial state, not to test permissions.

Data persists between sessions: the emulators export to `.emulator-data` on shutdown and import it on startup.

## 4. One button to sign in

In emulator mode, the login screen shows an extra box: “Sign in as dev user”. One click and you're in, without typing the email or password.

```ts
const isEmulatorMode = import.meta.env.VITE_USE_EMULATORS === 'true'
const loginAsDev = async () => {
  await userStore.login(import.meta.env.VITE_DEV_EMAIL, import.meta.env.VITE_DEV_PASSWORD)
}
```

The button depends on the emulator-mode variable, so in production it doesn't exist. It seems minor, but signing in fifty times a day by typing credentials adds up.

## 5. Emails switched off

GanttHub's Cloud Functions send emails: mentions, reminders, meeting invitations, reports. In the Functions emulator, that would mean sending real emails from your machine.

Firebase loads a different environment file depending on the project. `functions/.env.demo-gantthub` is only used with `demo-gantthub` and leaves the email credentials empty, so locally the functions run but send nothing.

## 6. Busy ports, with a useful message

The most common problem with the emulators isn't configuration: it's that a previous session closed badly and left an emulator hanging on the port. Firebase's error in that case is generic.

So `npm run emulators` checks each port first (8080, 9099, 9199, 5001, 4000, 4400) with `lsof`. If one is busy, it says which one, what process is using it and how to close it:

```text
✖ Emulator ports are busy:
  · firestore :8080 → PID 28064 (java)

If they're emulators from a previous session, close them with:
  npm run emulators:stop
```

`npm run emulators:stop` closes only processes that are Firebase emulators (it recognizes them by their command). If another program is using one of those ports, it reports it and leaves it alone.

## 7. Tests that don't step on your session

Two more details so tests coexist with development:

- **Rules tests** start their own throwaway emulators on other ports (Firestore on 8280, Storage on 9399). You can run them with your development emulators open. I go into detail in [how to test Firebase rules](/blog/testear-reglas-de-firebase).
- **Unit tests** block the network. `fetch` and `XMLHttpRequest` are replaced with functions that fail with a clear message. If a test tries to call Firebase or a real function, it fails instead of calling out.

## What I take away

- The `demo-` prefix is the cheapest and safest configuration there is: even if you get something wrong, you can't reach production.
- The same rules locally and in production. Otherwise, what works locally proves nothing.
- Sample data with relative dates, or in two weeks your local environment looks abandoned.
- What you do fifty times a day (signing in, freeing a port) deserves a button or a command.
- Developing without fear of breaking something real changes how you work: you try more things, and faster.
