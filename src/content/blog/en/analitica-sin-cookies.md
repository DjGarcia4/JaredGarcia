---
title: "Cookieless analytics: measuring the landing page, the panel and my clients' sites"
description: "RapiSites measured nothing: not visits, not where people came from, not which campaign brought the accounts that pay. How I built its own analytics with no cookies, no third parties and without storing anyone's IP."
date: 2026-10-18
tags: [rapisites, privacy, data]
projects: [rapisites]
kind: learning
keyword: "analytics"
---

Until recently, [RapiSites](/project/rapisites) measured nothing. I didn't know how many people visited the landing page, where they came from (Instagram, Google, a link I shared) or which campaign brought the accounts that end up paying. And clients couldn't see how many visits their own site had, which is the first thing any business owner asks.

There were three different things to measure: the landing page (`rapisites.com`), the panel (`app.rapisites.com`) and the clients' sites. This post covers how I did it without adding a single cookie.

## Why not Google Analytics (or Plausible, or PostHog)

The quick answer was to paste in someone else's script. I ruled it out for four reasons:

| Reason | Detail |
| --- | --- |
| The privacy policy already promised it | "A single cookie, your session's", and no third-party trackers, including on clients' sites. Google Analytics or PostHog would have forced me to change that and add a cookie banner to the landing page: friction before signing up. |
| Clients' sites load no JavaScript | It's a project rule: [performance is SEO](/blog/ningun-javascript). An analytics script is exactly what can't go in. |
| The traffic already reaches my server directly | The landing page is "DNS only" on Cloudflare. Measuring there needs nobody else. |
| It joins with my data | A visit, a signup and a payment live in the same database. "Instagram brought 40 signups and 3 pay" is one query. With Plausible or Umami that data would live elsewhere. |

<p class="tbl-note">Plus, zero new dependencies: Postgres, Nitro and the job queue I already had.</p>

## Counting people without a cookie

Without a cookie there's no identifier traveling with the visitor. I used the same method as Plausible:

```ts
// Simplified
const visitor = sha256(saltOfTheDay + ip + userAgent + host);
```

- The **salt changes every day** (at midnight Honduras time) and the previous day's is deleted. The same visitor is a different person tomorrow. Uniques are counted per day, and nobody can ever be followed across days.
- **Neither the IP nor the User-Agent is stored.** Only the hash and categories: the source (Instagram, Google, direct…), the device type, the browser family and the normalized path.
- Inside the panel, where the person is already signed in, the visit carries their account. That's usage of my own service, not tracking, and the privacy policy says so.

This method has a consequence you have to tell the user about: a month's "visitors" are the **sum** of each day's uniques. Someone who comes on three different days counts three times, because their hash changes. The page explains that in one line instead of hiding it.

## Three surfaces, two ways to capture

| Where | How | Why |
| --- | --- | --- |
| Landing page and panel | A beacon of my own: `navigator.sendBeacon` to my own endpoint, on load and on every route change | After the first load, Nuxt navigates without asking the server for pages: the server would only see the first one. |
| Generated sites | On the server, in the middleware that serves the HTML | The site has no JavaScript, and every page request goes through the server. |
| Sites uploaded by the client | On the server, when it serves an HTML document of a public site | Same as generated sites, without touching their files. |

<p class="tbl-note">Not a single line of JavaScript was added to clients' sites.</p>

The beacon comes with a bonus: bots almost never run JavaScript, so they filter themselves out. On the server there's no free filter, so they're dropped by User-Agent (`bot`, `crawler`, `spider`, the link previewers from WhatsApp or Facebook), along with `HEAD` requests, the browser's speculative prefetch (`Sec-Purpose: prefetch`) and any response that isn't a `200`.

Uploaded sites get one more filter: only a document requested as the main page counts (`Sec-Fetch-Dest: document`). A `fetch()` from the app itself that asks for some HTML isn't a visit. Sites in screen mode, the ones shown on digital signage, don't count either: they reload themselves all day long, and I'd be counting reloads, not people.

## Measuring never breaks a page

The rule I cared about most: counting a visit must never slow down or break a client's page.

- The function that records a visit **never throws**. Everything sits inside a `try/catch`.
- Visits are gathered in memory and inserted **in batches**, every 5 seconds or every 100 rows.
- If the database fails, visits are lost, never a page.
- The beacon endpoint answers `204` right away and is rate-limited per IP.

## Attribution: from Instagram to payment, with no cookie

The question that decides where to put the marketing effort is: which source brings the people who pay? That means connecting the landing page with signup, which lives on another domain. With no cookie, the source travels in the URL:

1. The landing page takes the source from the **first page** of the visit (the `utm_*` parameters or the referring domain).
2. Every "Create my site" link goes out with that source in the URL.
3. When the account is created, by password or with Google, it's stored in a `signup_source` column.

Here I had to change the plan. The draft said "nothing stored in the browser", but the landing page reloads on every page (they're plain links), and the source was lost as soon as the person went from the home page to pricing. I solved it with `sessionStorage`: it carries no identifier, it's cleared when the tab closes and it only leaves the browser on signup. It's written into the privacy policy.

The honest limit: if someone comes back another day by typing the address, it counts as "direct".

## The cache that was eating visits

Uploaded sites are served behind Cloudflare's cache, which kept the HTML for up to 60 seconds. Every visit Cloudflare answered from its cache never reached my server, so it wasn't counted.

The fix was to send `CDN-Cache-Control: no-store` only on public sites' HTML. Cloudflare stops keeping it; the browser still keeps it for its minute, and the CSS, JS and images stay in the edge cache, which is where the weight is.

## The data, and how long it's kept

- `page_views`: one row per visit.
- `page_view_daily`: a summary per day, site, page, source and device, built by an hourly queue. Long charts read from here, fast even with millions of raw rows. The last 88 days are read live; anything older, from the summary.
- The day's salt, in its own table, renewed every day.

RapiSites has a rule: **nothing is ever deleted**. Here I made a deliberate exception. Raw rows are deleted after 90 days; the summaries are kept forever. The rule protects the client's content, and an anonymous visit row isn't that. Keeping it forever only adds privacy risk and weight.

## What each person sees

**Me, in the admin panel**: a "Traffic" tab with the landing page's visits and uniques, sources, campaigns, entry pages, devices, clicks on "Create my site" and conversion by source (visits → signups → published → paying).

**Each client** sees "Visits" for each site. What they see depends on the plan, and the plan is defined by a single number, the days of history:

| Plan | What they see |
| --- | --- |
| Free | The month's total: "Your site had 340 visits this month." |
| Pro | 30 days: visits, top pages and where they come from. |
| Business | 365 days: the same, plus campaigns and devices. |

<p class="tbl-note">Everyone is measured. Whoever upgrades sees their history right away.</p>

I put "Visits" in Pro and not only in Business because the natural jump for a small business from Free is Pro. If it were only in Business, almost nobody would see it. And it never blocks publishing: it's extra information, not a gate.

## Two bugs from the same day

- **The "Visits" page was blank for uploaded sites.** The server has a guard that keeps the editor from opening on an uploaded site, written as a list of allowed routes. The new visits route wasn't on the list, so it answered `409`, and the page had no error state: it just stayed empty. Now the route is allowed, and the page shows the error with a retry button.
- **The setup wizard funnel got cut off for accounts with a pending payment.** Those accounts go read-only, and the metrics beacon was blocked too. A beacon doesn't change anything in the account, so now it goes through.

## What's still open

- **Country.** It needs an IP-to-country database, which is a new dependency. I'll decide with a month of data.
- **Product events and retention.** Today I know how many people visit and where they come from. I still don't know each person's path inside the panel (created a site → opened the editor → published → paid) or who comes back each week. That's the next phase.

## What I'd tell someone running into this

- Before pasting in an analytics script, read your privacy policy. If it promises something, the script may break that promise.
- Measure where the traffic already goes. If it all reaches your server, you don't need anyone else.
- A hash with a daily salt counts people per day without following anyone. Explain in the UI what adding up days means.
- Measuring must never break what you measure: batches, no throwing, never blocking the response.
- Check what your cache keeps: a visit the cache answers is a visit you don't see.
- A rule like "nothing is deleted" has a reason. If a piece of data falls outside that reason, the exception may be the right call.

> My takeaway: the most useful analytics isn't the one that knows the most about each person, but the one that answers your questions without knowing who anyone is.
