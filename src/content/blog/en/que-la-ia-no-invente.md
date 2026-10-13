---
title: "Don't let the AI make things up: what I learned generating sites for real businesses"
description: "Prices, names and figures the AI never writes, outputs validated as data, and a fallback that turned out worse than the problem: lessons from putting a model to write real websites."
date: 2026-10-12
tags: [ai, rapisites, product]
projects: [rapisites]
cover: /img/projects/rapisites/03.webp
kind: learning
keyword: "AI"
---

In RapiSites, the AI writes a business's entire website from four answers: what it's called, what it does, how to reach it and which style it likes. That works very well, but a model can write, with all the confidence in the world, “Over 15 years of experience” about a barbershop that opened last year.

Generic copy can be fixed. A false fact published on a real business's website is a problem for that business. These are the rules that came out of that, with the decisions I made and the ones I had to correct.

## First, where it can make things up

Generation uses the Claude API and runs in three stages: one call decides which catalog sections go on each of the four pages; then the content is written with one call per section, all in parallel; and finally one call per page writes the meta description and the alt text for the images. That's between 12 and 20 calls per site, and each one is a chance for the model to fill a gap with something that sounds right and isn't true.

## 1. Some things the AI never writes

- Prices: someone can show up at the shop with the wrong price in hand.
- People's names, in reviews and on the team: a review signed by someone who doesn't exist is deceiving the consumer, and in many countries it's illegal advertising.
- Verifiable figures: years in business, number of clients, awards. They're what a model fills in most naturally, and what does the most damage if false.

Every catalog section carries, field by field, an instruction for the AI. On a price, the instruction says never to invent one and to write exactly a placeholder. Same for the author of a review, the name of each team member and their short bio, which says not to invent years of experience. On a list of services, it says to use only the ones the business mentioned.

What I learned is that the prompt doesn't solve this. Telling the model “don't invent prices” works almost always, and “almost always” isn't enough. So the system doesn't trust the prompt: it puts a concrete placeholder in those fields and makes it checkable.

| Data | Stored placeholder | How it shows on the site |
| --- | --- | --- |
| Price | “—” | A “To be set” pill |
| Figure (years, clients, amounts) | “—” | A “To be set” pill |
| Review author | “Nombre del cliente” (client name) | The text as is, with the review flagged as an example |
| Team member | “Nombre” (name) | The text as is |
| Logo wall slot | “Tu logo aquí” (your logo here) | The text as is, never a fake logo |

<p class="tbl-note">The placeholders live in a single file: generation uses them verbatim and the audit finds them without guessing.</p>

```ts
// Simplified: the gaps the AI doesn't fill, in one place.
export const PRICE = "—";
export const STAT = "—";
export const AUTHOR = "Nombre del cliente";
export const PLACEHOLDERS = [PRICE, STAT, AUTHOR /* , … */];

export const isPlaceholder = (text?: string) =>
  text !== undefined && PLACEHOLDERS.includes(text.trim());
```

That one-line function is used by three pieces:

- The pre-publish audit: if it finds a placeholder, it shows a yellow warning (“there's a pending value in this section”) with a button that takes you straight to that section in the editor.
- Reviews: on top of the placeholder name, every generated review has `isExample` set to true, and while it stays that way the audit warns that there's an example review left to replace.
- Structured data: an example review is never output as a `Review` in the JSON-LD. Two nets at once: if the owner changed the text but forgot to untick the example, or the other way around, the placeholder name still stops it.

Photos follow the same idea. The model doesn't write them: a required image field looks for an industry stock photo on Pexels, using a short term returned by the structure call (“barbershop interior”, for example). But team, gallery and logo fields are flagged to never use stock, because a stock photo there would show something that isn't the business. If the field is optional it stays empty; if it's required, it gets a placeholder that clearly needs replacing.

## 2. The placeholder is design too

At first the price and figure placeholder was a dash: “—”. A freshly generated price list looked like this: the dish name, a dotted line and a lone dash. A stats section showed three dashes where the numbers should be.

During an interface review I realized it read as a rendering bug, not as a pending value. And since the audit only warns and doesn't block, a published site could show that row of dashes to a visitor.

The decision was to separate the data from how it's drawn. The data is still “—” for the model, the audit and the structured data, so none of that had to change. What changed is the section: when the value is the placeholder, it draws a faint pill that says “To be set” (“A definir” in Spanish). Its contrast is 6.9:1, comfortably AA (the gray used before didn't reach it), and the existing `aria-label` stayed: a screen reader hears “Price to be set”. It was eight sections, and a test checks that none of them renders a lone dash.

| Alternative | Why I ruled it out |
| --- | --- |
| A dotted box the width of a price, no text | Looks like a wireframe and doesn't say what's missing. |
| Keep the dash and document it | The audit doesn't block: visitors could still see the row of dashes. |
| Have the AI write a plausible sample price | It's exactly what the rule forbids. |
| Block publishing while a placeholder remains | It pushes away the site-published-in-minutes goal over a value the owner can fill in later. |

<p class="tbl-note">What I considered before settling on the “To be set” pill.</p>

The last one was the hardest to rule out, because blocking feels safer. But the rule that governs RapiSites is that anyone can have their website in minutes, and a business may want to publish today and add prices tomorrow. The yellow warning, which lets you publish but doesn't let you forget, is the middle ground. Same data, different message: it no longer looks broken, it looks like a task.

## 3. The model's output is data, not instructions

Each section is defined with a Zod schema. That schema is converted to JSON Schema and handed to Claude as the only available tool, with the choice forced: the model doesn't answer in free text, it answers by filling in that tool. Then it's validated with Zod, and if it fails it's retried with the validation error appended to the prompt, so the model knows exactly what to fix.

```ts
// Simplified: ask for shaped data, validate it, retry with the error.
for (let attempt = 0; attempt <= maxRetries && !result; attempt++) {
  const res = await claude.messages.create({
    tools: [{ name: "respond", input_schema: toJsonSchema(schema) }],
    tool_choice: { type: "tool", name: "respond" },
    messages: [{ role: "user", content: prompt }],
  });
  const parsed = schema.safeParse(toolInput(res));
  if (parsed.success) result = parsed.data;
  else prompt = `${basePrompt}\n\nYou didn't match the format: ${parsed.error.message}`;
}
```

- Content sections get two retries, not one. Hitting an exact character limit is what the model struggles with most, and an extra attempt is cheap compared with publishing a fallback.
- I don't use the tool's strict mode: it only accepts minimums of 0 or 1 items in a list, and the catalog asks for collections with real minimums (three features, two team members). Zod does the strong validation anyway.
- The structure is validated with rules that cross fields: the home page starts with exactly one hero and no other page has one, contact must include a contact section, no page is repeated or skipped, nothing outside the catalog can be chosen, and the AI doesn't choose the menu or the footer.
- Nothing the model returns is executed. And here I had to fix something: formatted text a person writes in the editor went through a sanitizer with an allowlist of tags, but the templates and AI path saved the content as is. A security audit found it. Now everything goes through the same filter, whoever wrote it.

## What the schema doesn't catch

- Links that go nowhere. A model can write a “Book” button pointing to `#book` or `/promotions`. The prompt now gives it the exact list of the site's routes, and a safety net checks every link: it lets phone, email and external addresses through, and swaps any nonexistent route for the contact page.
- Nested responses. The first version described the fields as a list of objects with a `name` property, and the model ended up putting everything under the only key it recognized: a `body` with the title, the text and the button inside. I fixed it by describing the fields in the same shape the response must have, plus a literal example per field type.
- Tone. My prompts were written in voseo (the Rioplatense “vos” form) and never said which form of address to use, so the model copied the prompt's and wrote “contanos qué necesitás”. Now the instruction explicitly asks for tuteo (the neutral “tú”), with counterexamples, and a test checks that the rule reaches the model.

## 4. The fallback can be worse than the problem

If a section still doesn't validate after the retries, the client doesn't see an error: a fallback is used. The original fallback was each catalog section's default copy, written for the sample business on the test bench: a barbershop. If the AI failed on a section of a dentist's site, the dentist ended up with a paragraph about haircuts. And that did show up on real generated sites.

| Step | What's used | When |
| --- | --- | --- |
| 1 | The AI's content | If it validates on the first attempt or on one of the two retries. |
| 2 | The same section in a launch template | If any template uses that type and variant: neutral copy, no industry. |
| 3 | The catalog's default copy | Only if no template uses that section. |

<p class="tbl-note">The fallback chain after the fix. A test checks that step 2 wins over the barbershop example.</p>

SEO has its own version: if a page's meta description doesn't validate, the business description is used, trimmed to 160 characters. One failing page doesn't drag the others down.

That same day another problem of the same family turned up. Since the AI doesn't plan the menu and footer, the site built from its plan didn't have them: every generated site silently lost its navigation and footer. The chosen template had them, but nothing put them back. What the model doesn't produce by design, someone has to add, and it has to be checked with a test.

<figure>
  <img srcset="/img/projects/rapisites/02-800.webp 800w, /img/projects/rapisites/02-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/rapisites/02-1600.webp" alt="A site generated for a restaurant, “Fonda El Portón”. On a menu, an invented price is exactly the kind of mistake you can't afford." loading="lazy" decoding="async" />
  <figcaption>A site generated for a restaurant, “Fonda El Portón”. On a menu, an invented price is exactly the kind of mistake you can't afford.</figcaption>
</figure>

## 5. Measure what it costs, even when it fails

The AI is the system's only variable cost per client. That's why every call stores a row with the kind (structure, content, SEO or translation), the model, input and output tokens, the cost in dollars, the duration and whether it failed. It's always recorded, even when the response never validated, because the call was already paid for.

```ts
// Simplified: logging comes after the loop, no matter what.
await aiGenerations.create({
  kind, model, inputTokens, outputTokens,
  costUsd: (inputTokens * rate.input + outputTokens * rate.output) / 1_000_000,
  durationMs: Date.now() - startedAt,
  failed: result === undefined,
});
if (result === undefined) throw new AiValidationError(lastIssues);
```

With that, the product metrics show the AI cost per generated site over the last 30 days and the rate of failed calls. Without that record there's no sensible way to set prices. Cost is also bounded on the product side: the quota of AI sites equals the plan's site quota (1, 3 or 10), there's a limit of five generations every fifteen minutes, and only one generation at a time per account. That lock came from a security audit: without it, several simultaneous requests passed the quota check before the first one finished.

## If you're going to put a model to write for real clients

- Make an explicit list of what the model can't invent in your domain, and for each one define a placeholder, not just an instruction.
- Make that placeholder findable by code: an audit, a test, a filter before structured data.
- Think about how the placeholder looks. A gap that looks like an error breeds distrust; one that looks like a task prompts action.
- Force the output into a schema, validate it and retry with the error in view. And add nets for what the schema can't see: links, tone, shape.
- Review your fallback as if it were the main path, because for someone it will be. And log the cost of every call from day one, including the ones that fail.

> What I take away: with AI in production, the question isn't whether the model is good, but what happens the day it gets something wrong. You design that day, with placeholders the code can find and a fallback that doesn't make things worse.
