---
title: "The AI runs late, the site doesn't: designing with a 30-second budget"
description: "What to do when generation takes longer than promised: deliver something instantly, don't cancel what's already paid for, and let the real content arrive on its own."
date: 2026-10-12
tags: [ai, rapisites, ux]
projects: [rapisites]
kind: learning
keyword: "30 s"
---

RapiSites promises that you go from the home page to your published site in under five minutes. I control almost all of that journey: how many questions I ask, how long the site takes to save, how long it takes to publish. The part I don't control is the AI. Sometimes it answers quickly and sometimes it takes quite a bit longer, and that doesn't depend on anything I can optimize in my code.

So generation has a budget: 30 seconds at most. The interesting part of this post isn't the number, but what happens when it runs over, and why the obvious answer was the wrong one.

## Where the 30 seconds come from

Before writing any code, the spec split the five minutes step by step. The AI's budget comes from what's left:

| Step | Estimated time |
| --- | --- |
| Sign up (email and password, or Google) | ~30 s, or ~5 s with Google |
| What's your business called? | ~10 s |
| What do you do? (2 or 3 lines) | ~60 s |
| Contact details | ~40 s |
| Pick a style | ~20 s |
| AI generation | 15 to 30 s |
| Publish on the subdomain | ~5 s |

<p class="tbl-note">The onboarding flow as the spec sets it. The goal: from the landing page to a published site in under five minutes.</p>

The spec also marks the point of no return: if generation doesn't produce something the person recognizes as “my business”, the product fails. In other words, I can't buy speed by delivering something generic. I have to deliver something good and fast, and when both aren't possible, decide what to do.

## What happens in those seconds

Generation uses the Claude API and runs in three stages. Each one needs what the previous one produced, so they go in order; but inside each stage everything runs in parallel.

- Structure, one call: from the name and description, it decides which catalog sections go on each of the four pages (home, services, about, contact), one to six per page. The same call returns a short English term to search for an industry stock photo, so no extra call is needed just for that.
- Content, one call per section, all at once: the sections of all four pages start together. Writing one section after another didn't fit the budget.
- SEO, one call per page, all four at once: meta description and alt text for each image, based on the content already written. They aren't guessed separately.

That's between 12 and 20 calls per site. Total time looks like the structure call, plus the slowest section, plus the slowest page in SEO. That's the math that matters: with everything in parallel, a single slow section sets the pace of its whole stage.

```ts
// Simplified: three stages in order, everything parallel inside each one.
const plan = await inferStructure(business);            // 1 call

const pages = await Promise.all(plan.pages.map((page) =>
  Promise.all(page.sections.map((s) => writeSection(s))) // 1 per section
));

const seo = await Promise.all(pages.map(writePageSeo));  // 1 per page
```

## Isolating a section's failure

Parallelizing comes with a risk: with `Promise.all`, one rejected promise is enough to reject the whole set. If one section out of twelve doesn't validate, I don't want to lose the other eleven.

That's why writing a section never throws over a content problem. If the response doesn't match the schema after the retries, the function returns neutral fallback copy and moves on. SEO works the same way: if a page's description doesn't validate, the business description is used, trimmed to 160 characters. There's a test that generates the four pages in parallel, makes one section fail on purpose and checks that the rest comes out fine.

What does propagate are errors that aren't about content, like a network or service failure. There's no point pretending there: if that happens before the budget runs out, the person sees a message (“We couldn't generate your site. Try again.”) and can retry.

## If time runs out, deliver anyway

The budget is a race between two promises: the generation and a 30-second timer.

```ts
// Simplified: the budget decides when I stop waiting, not when I stop working.
const pending = computeSnapshot(args);              // generation, already running
const outcome = await Promise.race([pending, timeout(30_000)]);

if (outcome !== TIMED_OUT) return writeSite(outcome);

const site = await writeSite(template.snapshot);    // the template, instantly
pending
  .then((snapshot) => replaceSiteContent(site.id, snapshot)) // same site
  .catch((error) => log("keeps the template", error));
return site;
```

- If generation wins, the full site is written in one go, in an atomic transaction.
- If the timer wins, a site with the template of the style the person chose is written right then, and the response returns without waiting any longer. The person sees a complete site in the style they picked, not an error or an endless spinner.
- Generation keeps running. When it finishes, it replaces the content of that same site instead of creating another: inside a transaction it deletes the template's pages and writes the generated ones. The site's name and address don't change.
- If the background generation fails, the error is logged and the site keeps the template, which is already a complete, publishable site.

A detail I liked: that mechanism (deleting a site's pages and rewriting them from a snapshot, in a transaction) didn't stay exclusive to this. It's the same one version rollback later used to rewrite the draft from a published version. When two different problems end up asking for the same operation, it's usually a sign the operation is well cut.

## Don't cancel what's already paid for

My first instinct was to cancel generation when time ran out. That's what you do with a timeout: cut and clean up. But here cutting saved nothing. The model calls were already in flight and get billed anyway, and their result was going to be better than the template. Canceling meant paying for nothing and delivering something worse.

| Option when time runs out | What the person sees | What happens to what's already paid |
| --- | --- | --- |
| Cancel and show an error | An error, right in the first minute | Thrown away |
| Cancel and deliver the template | A generic site forever | Thrown away |
| Keep waiting as long as it takes | An endless spinner | Used, late |
| Deliver the template and continue in the background | Their site instantly, with the real content after | Used |

<p class="tbl-note">The last row is the one that stayed. The budget doesn't cut the work: it only decides when I stop making the person wait.</p>

Generation isn't retried when time runs out either, for the same reason: it was already running and paid for, and starting over would double the cost to arrive even later.

## What the person sees while waiting

While generation runs, the wizard shows a progress bar and a line that changes every 4.5 seconds: “Understanding your business…”, “Choosing what your site needs…”, “Writing your content…”, “Tuning the SEO…”, “Final touches…”.

The honest thing is to say that the server doesn't feed that bar. It's an estimate: it starts at 4%, goes up 2 points every half second and stops at 92% until the response arrives, and only then jumps to 100% and opens the site preview. It reaches 92% in about 22 seconds, within the 15-to-30 window the spec sets. The lines follow the real order of the stages, but they aren't synchronized with them.

## Protecting the cost, not just the time

A generation is between 12 and 20 paid calls, so the endpoint that triggers it has its own brakes:

- A limit of five generations every fifteen minutes per origin.
- Only one generation at a time per account. I added it after a security audit: the quota check reads rows that don't exist until generation finishes, so several simultaneous requests from the same account all passed the check before the first one finished.
- The quota of AI sites equals the plan's site quota, and every call is logged with its cost, including the ones that fail.

## What this design doesn't cover yet

Reading the code with a maintainer's eyes, there are two edges worth saying out loud:

- The background generation lives in the process's memory, not in the job queue (translating a site, which also uses AI, does go through the queue). If the process restarts right in those seconds, the generation is lost and the site keeps the template. It's an acceptable outcome, since the template is a complete site, but it's a silent loss.
- The replacement deletes and rewrites the site's pages. If someone started editing the template before the real content arrived, those changes would be overwritten. The window is seconds long, but it exists.

Both would have the same way out if they're ever needed: move the late generation to the job queue and let the editor know when the content changes.

## The rule in charge

All of this comes from the product's rule number one: anyone should be able to generate their website in less than a day, preferably in minutes. With that rule, “the AI was slow” can't be the reason someone leaves. And another consequence follows that the spec states bluntly: there's never an empty screen. No empty site, no empty section, no empty form. The fallback template exists so that holds even when the AI runs late.

## If you have a slow service on the critical path

- Write the time budget for the whole flow before writing code, and let the slow service's budget come from there.
- Parallelize what doesn't depend on each other, and make sure a content failure doesn't take down a whole `Promise.all`.
- Have something decent to deliver instantly. Not an error: something the person can use.
- Separate “stop waiting” from “stop working”. If the work is already paid for and its result is better, let it finish.
- If you show estimated progress, keep it honest: it should never hit 100% early.
- Write down the edges you accept. Knowing what gets lost and when is part of the design.

> What I take away: a timeout doesn't have to be an error. It can be the moment you deliver what you have and keep working in the background.
