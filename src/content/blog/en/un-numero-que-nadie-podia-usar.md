---
title: "A number nobody could use"
description: "The Pro plan promised 30 AI sites a month, but you couldn't use more than 3. A short lesson about limits that look fine in a table and make no sense in reality."
date: 2026-10-12
tags: [product, pricing, rapisites]
projects: [rapisites]
kind: learning
keyword: "1 of 30"
---

RapiSites' plans had two limits that seemed reasonable: how many sites you can have (Free 1, Pro 3, Business 10) and how many AI sites you can generate per month (3, 30 and 100). Both had been enforced on the server since late August, and the pricing page spelled it out: “30 AI-generated sites per month”.

In a pricing table it looked fine. In reality, the second number couldn't be used.

## Why

The AI assistant is the heart of RapiSites: you answer four questions about your business and the system decides which pages and sections you need, writes the content and builds the site. But it runs only once per site, when the site is created. There's no way to regenerate a site with AI from the editor: the editor is for touching up what was generated.

<figure>
  <img srcset="/img/projects/rapisites/01-800.webp 800w, /img/projects/rapisites/01-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/rapisites/01-1600.webp" alt="The assistant's four questions, on the RapiSites landing page. They run once per site, when it's created." loading="lazy" decoding="async" />
  <figcaption>The assistant's four questions, on the RapiSites landing page. They run once per site, when it's created.</figcaption>
</figure>

And sites can't be deleted from the panel. So the math is simple: if each site uses the AI at most once, and you can't have more sites than your plan allows, you'll never use the AI more times than your number of sites. A Pro user, with 3 sites, can use the AI 3 times at most. Never 30. And the Free plan promised 3 a month with a single site.

| Plan | Sites | AI promised | AI you could actually use |
| --- | --- | --- | --- |
| Free | 1 | 3 per month | 1, over the account's whole lifetime |
| Pro | 3 | 30 per month | 3 |
| Business | 10 | 100 per month | 10 |

<p class="tbl-note">The second number could never go past the first.</p>

I noticed it on the plan card, in Settings, which said “AI sites: 1 of 30 this month” next to “Sites: 2 of 3”. Read together, the two lines made no sense. A meter that's never going to fill up tells you nothing; it only makes the user wonder what they're missing.

## The first fix fell short

I fixed it on September 6, in the same PR that finished the per-plan limits (#36), and the first attempt only covered the most visible case. The Free plan went to “one AI site for life” instead of three a month, with a new field for it, while Pro and Business kept 30 and 100 a month.

It worked, but it only fixed the most obvious symptom. The reasoning that made Free's 3 absurd was the same one that made Pro's 30 absurd. In the same PR I replaced that fix with the real one and rewrote decision 021 around it: the Free case was just the most visible one.

## The decision

The AI quota is the same as the site quota, for life, and the separate field is gone. To know how much you've used, the server counts the account's lifetime structure generations, one per generated site, and compares them with the plan's sites.

```ts
// The AI quota (simplified)
async function aiSiteQuota(accountId) {
  const plan = await getAccountPlan(accountId)
  const used = await aiGenerations.countAll(accountId, "structure") // lifetime
  return { used, limit: PLAN_LIMITS[plan].sites }                  // the site quota
}
```

In practice, the client chooses site by site whether to generate it with the assistant or start from a template, and the assistant is available as long as they have room left in their plan. When it runs out, the message is direct: “Your Pro plan includes 3 AI sites. Upgrade your plan to generate more.”

In the interface, the AI stopped being a meter and became a capability. On the pricing page and in the plan comparison it's one line: “AI assistant for the content of every site”. On the plan card there's a single meter, the one for sites, and the AI shows up as a fact: “Included in every site · you've used 1 of 3”.

## What I ruled out

- Lowering the AI quota to 1, 3 and 10 and keeping the field: it was exactly the site quota, just one that had to be kept in sync by hand.
- Keeping 30 and 100 and adding “regenerate with AI” to the editor: that meant building an entire feature to justify a number.
- Giving the Free plan no AI, only templates: the four questions are the path for someone to publish their first site in minutes. Taking them away from a new user's first site sends them down the long road in the first minute.

## What I gained, and what it had to do with cost

Every call to the model is recorded with the model used, the tokens, the cost in dollars and the duration, whether the result is used or not, because the cost is paid either way. With the quota tied to sites, each account's AI spend is bounded by something I already control: how many sites it has.

That got tested a month later. For API integrators, like [Wink](/project/wink-app), I added per-account limit overrides: an account can have hundreds of sites without inventing a new plan. But the AI quota deliberately uses the plan's sites, not the override's. Raising an integrator's sites doesn't hand them hundreds of AI generations, which is what costs money.

What I lose is written down too: if I later want to charge for AI as an extra, or allow regenerating a site, I'll have to bring back a quota of its own. If that day comes, the decision gets revisited.

## What I'd tell someone designing their plans

- For each limit, ask what has to happen for someone to reach it. If it can't happen, the number is unnecessary.
- Read the limits together, the way the user will, not one by one.
- When you fix the most visible case, check whether the same reasoning breaks the others.
- If something never runs out in practice, show it as a capability, not as a meter.
- Tie the limits that cost money to something you already control, and make sure overrides don't drag them along.

> What I take away: a limit nobody can reach isn't generous, it's confusing. Every number you show someone has to be able to happen to them.
