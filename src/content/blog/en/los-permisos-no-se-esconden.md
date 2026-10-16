---
title: "Permissions aren't hidden, they're enforced"
description: "In GanttHub, roles lived in the UI: a viewer just didn't see the edit button. Once other companies came in, that wasn't enough. How I moved roles into the Firestore and Storage rules."
date: 2026-10-16
tags: [security, firebase, gantthub]
projects: [gantthub]
kind: learning
keyword: "roles"
---

GanttHub started as a way to organize my own tasks. While I was the only user, security wasn't a problem. Then I used it for Wink, later for RapiSites and SwiftFlow, and today Wink and ten other companies use it. Every project has its team, and everyone joins with a role: owner, admin, editor or viewer.

For a long time, those roles lived only in the interface. A viewer didn't see the edit button, an editor didn't see the team tab. It looked right. And it protected nothing.

## Hiding a button isn't a permission

In a Firebase app, the browser talks directly to the database. There's no server of your own in the middle checking each request: the only thing in the way is the security rules. If the rule allows a write, anyone with a session and the browser console can do what the hidden button did.

The clearest symptom was how projects were listed. The app read the whole collection and filtered yours in the browser. For that to work, the rules had to let any signed-in user read every project. The UI filters decided what you saw; the rules decided nothing.

## The real problem: the rules couldn't tell who was a member

Each project stored its team in `members`, an array of objects: uid, email, name, role, hourly rate. That's convenient for the UI, but Firestore rules can't walk an array of objects looking for your uid. And a query can't ask for “projects where I'm in `members`” either, because `array-contains` compares the whole object.

So I added three fields that exist only to make security expressible:

- `memberIds`: the list of uids, owner included. It's what `array-contains` uses in queries and rules.
- `memberRoles`: a `{ uid: role }` map. With it, knowing someone's role is a single read.
- `pendingInvites`: a `{ uid: role }` map of unaccepted invitations.

They're denormalized: they repeat what `members` already says. The cost is keeping them in sync, and a single function in the projects store handles that, always building them from `members` and `ownerId`:

```ts
export const buildMembershipFields = (members: ProjectMember[], ownerId: string) => {
  const memberRoles: Record<string, UserRole> = {}
  for (const m of members) {
    if (!m?.uid) continue
    // There can only be one owner: any other “owner” becomes admin
    memberRoles[m.uid] = m.uid === ownerId ? 'owner' : (m.role === 'owner' ? 'admin' : m.role)
  }
  if (ownerId) memberRoles[ownerId] = 'owner'
  return { memberIds: Object.keys(memberRoles), memberRoles }
}
```

## The rules trust only those fields

With `memberRoles` in the document, the rules can ask for the role directly. The whole file rests on four functions:

```js
function roleIn(projectId) {
  return signedIn() && exists(projectPath(projectId))
    ? projectData(projectId).get('memberRoles', {}).get(uid(), null)
    : null;
}
function isMember(projectId)        { return roleIn(projectId) in ['owner', 'admin', 'editor', 'viewer']; }
function isEditorOrAbove(projectId) { return roleIn(projectId) in ['owner', 'admin', 'editor']; }
function isProjectAdmin(projectId)  { return roleIn(projectId) in ['owner', 'admin']; }
```

From there, each collection says who does what. Every member reads tasks; owner, admin and editor create and edit them. The viewer can comment, but only comment: the rule lets them change `notes` and nothing else. Every member reads finances; the editor can record transactions but only deletes the automatic expenses a task generates when it's completed. And listing projects is no longer reading the whole collection: the only allowed query is `memberIds array-contains` your own uid.

## The hard part: updating the project

Reads and creates are easy. The hard part is the project document's `update`, because many different operations share it: the owner renames it, an admin archives it or changes the budget, anyone pins it to their sidebar, someone uploads their profile photo, an invitee accepts, a member leaves.

The solution was to write each operation as a function that describes exactly which fields it may touch and how, and allow the `update` if any of them holds:

```js
allow update: if signedIn()
  && newData().ownerId == resource.data.ownerId
  && rolesOk(newData())
  && (ownerUpdate() || adminUpdate() || editorUpdate() || pinUpdate()
      || selfProfileUpdate() || leaveProject() || acceptInvite() || declineInvite());
```

Two details saved me a lot of trouble:

- **`rolesOk` validates the final state, not the operation.** Whatever the change, the resulting document must be consistent: `memberIds` and `memberRoles` with the same people, `members` the same size, exactly one owner and it must be the `ownerId`, and no invitation with the owner role. That way no odd combination of operations can leave the team in an impossible state.
- **Accepting an invitation is the strictest operation.** Whoever accepts isn't a member yet, so the rule demands everything: a pending invitation, adding only themselves, with exactly the invited role, and their invitation removed from `pendingInvites` in the same change. Invited as an editor and trying to join as admin? It fails. Trying to add someone else in the same change? It fails.

## Storage too

Files had the same problem: avatars, project logos and task attachments. Storage rules can't read Storage to know who's a member, but they can read Firestore (*cross-service* rules). So they use the same idea: look up the project in Firestore and check `memberRoles`. On top of that come the limits for each kind of file: your avatar is only yours and is an image up to 5 MB, owner and admin change the logo, any member can attach files to a comment (up to 20 MB), and only editors and up can add files to a task (up to 25 MB). None of them can be HTML or JavaScript.

## What I take away

- If the client talks directly to the database, the UI is a suggestion. The permission is the rule.
- Sometimes you have to change the data model to make security expressible. `memberIds` and `memberRoles` add nothing to the UI; they exist so the rules can say no.
- Validating the document's final state catches more mistakes than validating each operation on its own.
- Rules like these can't be tested by hand. I tested them in the emulator, which is the topic of the [next article](/blog/testear-reglas-de-firebase). And changing the model with real projects inside had its own order, which I cover in [migrating without breaking anyone's app](/blog/migrar-sin-romper-a-nadie).
