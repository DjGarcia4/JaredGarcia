---
title: "The bug that taught me what “going back” means"
description: "A client restored a healthy version of their site and, when they opened the editor, found the bad version again. Why it happened, and why going back now brings everything back."
date: 2026-10-12
tags: [product, data, rapisites]
projects: [rapisites]
kind: learning
keyword: "rollback"
---

In RapiSites, what you edit and what's published are separate things. The editor works on a draft: the live tables of pages and sections. Publishing freezes that draft into a version, a JSON snapshot stored in `site_versions`, and the public site serves that version. Going back, in the original design, meant moving a pointer: “the published site is now version 4”.

Clean, simple and wrong.

## How it was built

Publishing in RapiSites isn't a build. It's a short transaction: first the SEO audit runs (if there's a red error, nothing is written), then the whole site is serialized into a snapshot, inserted as a new row in `site_versions`, and `sites.published_version_id` is pointed at that row. Only after the commit is the cache of each of the site's domains invalidated. A visitor never sees a half-finished state.

With that design, history and rollback came almost for free. I built them in phase 4.6, in August: a list of versions with date, author and note, and a “Restore” button on each one. The spec defined rollback in one line: change `published_version_id` to an earlier version. Move the pointer and touch nothing else. The idea was to keep the draft and the published site truly separate.

There was one more detail that later turned out to matter. The site list shows “Unpublished changes” by comparing two dates: if `updatedAt` is later than `publishedAt`, the draft is ahead. That's why publishing sets `updatedAt` equal to `publishedAt` instead of leaving it at “now”: otherwise it would sit an instant ahead and every freshly published site would look like it had pending changes. Rollback did the same with the restored version's date.

## What happened

While testing phase 10, a client published a version with a broken component. They restored the previous one and the live site was fine again. So far, so good. But when they opened the editor, they found the bad version again: the editor reads the live tables, and rollback hadn't touched them.

And there was something worse. Since rollback set `updatedAt` to match `publishedAt`, the site list didn't show “Unpublished changes”. Nothing indicated that the editor and the live site no longer matched. If the client made any small change and hit publish, they'd push the broken component back out without meaning to.

- Version 5 is published, with the broken component. Draft = version 5.
- Restore version 4: the pointer moves to 4 and the live site is fixed. The draft is still version 5.
- The list says there are no unpublished changes, because the dates match.
- The client opens the editor, fixes a typo and publishes: out goes a version 6 that brings the broken component back.

Technically, every piece did what it said. The problem was the whole: the system had a divergent state, draft and published being different, and on top of that it told the client it didn't.

## What I decided

I fixed it on August 30 and wrote it down as decision 008. Rollback now also rewrites the draft with the restored version, in the same transaction that moves the pointer. It deletes the site's pages (sections go with them in cascade) and recreates them from the snapshot, using the same mechanism I already had for replacing a site's content. The theme, business info, default SEO values and languages come back too. After restoring, draft and published are the same: there's no divergent state left.

```ts
// Rollback of a generated site (simplified)
async function rollback(siteId, versionId, { force = false } = {}) {
  return db.transaction(async (tx) => {
    const site = await tx.sites.find(siteId)
    const version = await tx.versions.find(versionId)
    if (!site || version?.siteId !== siteId) return { ok: false, reason: "not-found" }

    // Is the draft ahead? Rewriting it would throw work away.
    const draftAhead = site.publishedAt && site.updatedAt > site.publishedAt
    if (draftAhead && !force) return { ok: false, reason: "unpublished-changes" }

    await tx.sites.update(siteId, {
      publishedVersionId: version.id,
      publishedAt: version.publishedAt,
      updatedAt: version.publishedAt, // now it's true: the draft IS this version
      ...version.snapshot.settings,   // theme, business, SEO, languages
    })
    await tx.pages.deleteBySite(siteId)          // sections cascade
    await tx.pages.writeFrom(version.snapshot)   // the editor opens what was restored
    return { ok: true }
  })
  // After the commit: invalidate the cache of every active domain of the site.
}
```

Versions aren't touched. `site_versions` is never rewritten: every publish stays stored, restoring deletes none of them, and going “forward” to the version you had left is still one click.

## The only thing you lose, always with a warning

Rewriting the draft has a consequence: if the client had unpublished changes, they're lost. So the server doesn't do it silently. If `updatedAt` is later than `publishedAt`, it responds `409` with `reason: "unpublished-changes"` and touches nothing. The UI asks for confirmation in the same row of the history, no modal on top of a modal: “You have unpublished changes in the editor. Restoring this version discards them.”, with a “Restore anyway” button that retries with `force: true`.

The UI already knows whether there are pending changes and shows the confirmation before calling the server. But the server is the one that decides: if the warning arrived late (the draft changed after the list loaded), the `409` comes back, the UI recognizes it and shows the same confirmation instead of a generic error. And the history text says what happens: “Restoring a version puts it live and also in the editor; no version is deleted”.

- `404` if the site or the version doesn't exist, or belongs to another account. Not `403`: I don't confirm that something exists if it isn't yours.
- `409 unpublished-changes` if the draft is ahead and `force` wasn't sent.
- `200` with the site published at the restored version, and its domains' cache invalidated after the commit.

## What I ruled out

The alternative was to keep rollback as a pointer and make the difference visible: a warning in the list and a bar in the editor saying “you're editing a version newer than the published one; discard and edit from the published one”. It works, but it keeps alive a state the client has to understand and manage. RapiSites' main rule is that anyone can publish their website in minutes, and that kind of complexity is exactly what it avoids.

|  | Pointer only + warnings | Rewrite the draft |
| --- | --- | --- |
| What the editor opens after restoring | The version the client wanted to leave behind | The restored version |
| State the client has to understand | Draft and published differ, with a bar and a warning | None: they're the same |
| Risk of republishing the bad version by accident | Low, if they read the warning | None |
| What's lost | Nothing | Unpublished changes, with confirmation |
| Roll the site back to a healthy version and keep fixing in the editor | Possible | No, not without publishing the fix first |

<p class="tbl-note">The two options I compared in decision 008.</p>

The cost of the decision is real and it's in the last row: you can no longer roll the site back to a healthy version while you keep fixing things in the editor, without first publishing the half-done fix. I accepted it because the real case is a different one: I published something bad and I want to go back.

## Two more gaps, three weeks later

The security audit on September 19 found the fix wasn't complete. In September the menu and footer became the site's instead of each page's (decision 022), and they live in a different table. Rollback rewrote the pages, but not that table: after restoring, the body went back to the old version while the menu and footer kept the later edits. Now they're deleted and rewritten from the snapshot too.

The second gap was subtler. A manual or AI edit always goes through the section's schema before being saved. Rollback didn't revalidate anything: it copied whatever was in the snapshot. But a version from weeks ago may not fit its section's current schema, for example if a required field was added later. Now each historical section is validated against today's schema, and if it no longer passes, it falls back to that section's defaults. It's the same rule I use when inserting a new section: no section is ever saved broken.

```ts
// An old section against today's schema (simplified)
function sanitizeHistorical(section) {
  const definition = getSection(section.type, section.variant)
  if (!definition) return section
  return definition.parse(section.props).success
    ? section
    : { ...section, props: definition.defaults }
}
```

## The same idea, for uploaded sites

In October RapiSites started accepting sites made of the client's own files: HTML, CSS and JavaScript they already have. There are no pages or sections to rewrite there; a version is a reference to a bundle of files. But decision 008's rule held: going back to a version also makes that bundle the draft, and the options that get frozen on publish come back with it. If the owner purged an old version's files to free up space, that version stays in the history labeled “Files purged”, but it can no longer be restored (`409 purged`).

On October 7 history and rollback also reached the public API: `GET /v1/sites/{id}/versions` returns each version with `is_current`, `is_draft` and `files_purged`, and `POST /v1/sites/{id}/versions/{versionId}/rollback` changes which one is live without creating a new version.

And the “Unpublished changes” signal bit again. On October 5, reviewing the integration with [Wink](/project/wink-app), three problems in a row showed up in a neighboring operation, discarding the draft through the API. First, it reused rollback, which always leaves the site published: a site the owner had unpublished on purpose went back online. Once separated, it turned out it didn't match the two dates, so the panel kept showing the warning even though the API already said there were no changes. And the fix for that matched them always, which turned the warning off even when site options were still unpublished. A flag derived from two dates forces every operation that touches the draft to keep them honest.

## What I'd tell someone building something similar

- If you keep draft and published separate, decide what “go back” means for the user, not for the data model. For me, it ended up meaning “everything goes back”.
- A signal like “unpublished changes” is part of the contract. If an operation turns it off, it has to be because there really is no difference.
- Whatever can destroy work is decided by the server and confirmed by the UI, not the other way around. And the confirmation goes where the user is already looking.
- Old data doesn't always fit new code. Restoring a snapshot is a write: validate it like any other write.
- When you add a new table to the site (like the menu and footer), review every operation that copies or rewrites the whole site.

> What I take away: the right data model isn't always the one the user expects. When someone says “go back to this version”, they expect everything to go back, not a pointer.
