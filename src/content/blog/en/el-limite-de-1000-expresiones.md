---
title: "The tests passed and the rules were broken: the 1000-expression limit"
description: "Firestore stops evaluating a rule once it reaches 1000 expressions. In GanttHub a rule for handing over project ownership triggered it, and all 99 tests stayed green. Why it happened, how a conditional fixed it and the test that now guards it."
date: 2026-10-18
tags: [firebase, security, testing, gantthub]
projects: [gantthub]
kind: learning
keyword: "1000"
---

GanttHub's security rules have their own test suite ([I cover it here](/blog/testear-reglas-de-firebase)). When I added the option to hand over a project's ownership to another member, I wrote the rule, wrote its tests and ran everything: **99 out of 99 green.**

But among the expected `PERMISSION_DENIED` lines in the log there was a different one:

```text
PERMISSION_DENIED: Unable to evaluate the expression as the maximum of
1000 expressions to evaluate has been reached. for 'update' @ L306
```

No test failed, and the rules were still wrong.

## The limit

Firestore doesn't evaluate a rule without bounds: each request has a cap of **1000 expressions**. If evaluation reaches it, it stops and the request is **denied**.

That denial is what made the problem invisible. The tests that triggered it were "you can't do this" cases, such as the owner can't just change `ownerId`. They expected a denial and got a denial. They didn't care that the reason was the limit and not the rule's logic.

## Why it was triggered

The project update rule was a chain of possible paths joined with `||`:

```js
allow update: if signedIn()
  && rolesOk(newData())
  && ((newData().ownerId == resource.data.ownerId
        && (ownerUpdate() || adminUpdate() || editorUpdate() || pinUpdate()
            || selfProfileUpdate() || leaveProject() || acceptInvite() || declineInvite()))
      || transferOwnership());
```

`||` stops as soon as one path is `true`. When the request is allowed, that's cheap. When it's **denied**, no path is `true` and every one of them gets evaluated, all the way to the last: `transferOwnership()`.

And that function was the expensive one. To check that only two people changed in `members`, it computed which entries were added and which were removed:

```js
let added = newData().members.removeAll(resource.data.members);
let removed = resource.data.members.removeAll(newData().members);
// …and then compared each one's uid and role
```

`removeAll` over a list of maps costs in proportion to the number of members. Added to the eight paths before it, it already went over the limit with the four members of the test project.

The test denials weren't the serious part: those had to fail anyway. The serious part was that the cost depended on the project's size. A **legitimate** request on a project with many members could also hit 1000 and be denied. For the user, the app would just say "you don't have permission" when pinning a project or changing their photo.

## The fix: pick one branch, don't try them all

Two changes.

**1. A conditional instead of `||`.** Handing over ownership is the only operation that changes `ownerId`. So the rule checks that first and evaluates only the branch that applies:

```js
// A conditional instead of ||: only one of the two branches is evaluated.
allow update: if signedIn()
  && rolesOk(newData())
  && (newData().ownerId == resource.data.ownerId
      ? (ownerUpdate() || adminUpdate() || editorUpdate() || pinUpdate()
         || selfProfileUpdate() || leaveProject() || acceptInvite() || declineInvite())
      : transferOwnership());
```

Pinning a project, changing a role or leaving never pay for the transfer check again.

**2. A cheaper transfer.** The rules already trusted `memberRoles` (a uid → role map) for everything else, and comparing a map's keys is cheap. So the check became:

```js
&& newData().memberIds.toSet() == resource.data.memberIds.toSet()  // nobody joins or leaves
&& newData().members.size() == resource.data.members.size()
&& newData().memberRoles[next] == 'owner'
&& newData().memberRoles[uid()] == 'admin'
&& newData().memberRoles.diff(resource.data.memberRoles).affectedKeys().hasOnly([next, uid()]);
```

No `removeAll`. This doesn't give the outgoing owner anything new: as owner, they could already edit `members` through their own path.

## The test that guards it

A test that passes with the error can't guard against it. So I added one that does fail if the limit comes back: a project with **30 members**, testing the most common **allowed** operations. Those are pinning the project, changing the photo, leaving, changing a role, accepting an invite and handing over ownership.

If any of them goes over 1000 expressions again, it gets denied, and `assertSucceeds` turns it red. After that, the log was clean: **101 tests and not a single `maximum of 1000` line.**

## What I take away

- **A denial can have the wrong reason.** `assertFails` can't tell "your logic forbade it" from "it ran out of budget". Read the text of the `PERMISSION_DENIED` lines now and then.
- **In rules, `||` is expensive exactly when it denies.** If a branch is costly and only applies to one case, split it off with a conditional.
- **Watch for what grows with the data.** `removeAll`, walking lists and comparing arrays cost according to the document's size. What passes with 4 members may not pass with 40.
- **Test allowed operations with large data.** It's the only way the limit shows up as a red test and not as a user complaint.
