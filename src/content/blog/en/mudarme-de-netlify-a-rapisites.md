---
title: "I moved off Netlify onto my own product, and the form broke"
description: "I uploaded this portfolio to RapiSites and hit two limits: 20 MB per upload and a contact form with nowhere to go. How I fixed both without changing a line of the site."
date: 2026-10-18
tags: [rapisites, product, security]
projects: [rapisites]
kind: learning
keyword: "Netlify"
---

This portfolio used to live on Netlify. [RapiSites](/project/rapisites) already lets you upload a site you built yourself (HTML, CSS and JS) instead of generating one with AI, so the obvious test was to use it myself: upload the `dist` folder of this very site and point my domain at it. If my own product couldn't handle my own portfolio, I couldn't sell it as a path for developers.

It broke twice. This post covers both.

## First wall: 24 MB against a 20 MB cap

When I dropped the folder, the panel answered:

> Your site weighs 24 MB and the upload limit is currently 20 MB.

The cap was the same for every plan, and it had its reasons: it matched the maximum size of an image in the media library, and it sat under the 25 MB that Caddy, the server in front of everything, lets through on the panel. That Caddy cap came out of a security audit: it stops a huge body before it reaches Node.

I looked at what was so heavy:

| Folder | Size | What's in it |
| --- | --- | --- |
| `img/` | 13 MB | ~180 `.webp` images from the case studies |
| `media/` | 4.3 MB | A project video, as `.mp4` and `.webm` |
| `assets/` | 3.1 MB | The JS and CSS that Vite builds |
| `blog/` | 2.5 MB | The posts, already rendered to HTML |

<p class="tbl-note">Nothing unusual: that's what a portfolio with case studies weighs.</p>

No single file was over 2.6 MB. The problem was the sum. And a portfolio with case studies, exactly the kind of site someone uploads instead of generating, is going to weigh that much.

The quick fix was to raise Caddy's cap for the whole panel. I didn't want it: it opens every endpoint to large bodies to fix just one. What I did instead:

- The total per upload went up to **50 MB**. Each file still maxes out at 20 MB, same as media.
- Caddy lets 60 MB through **only** on the five routes that upload a whole site (two in the panel, three in the public API). Everything else still cuts at 25 MB.

```caddyfile
# Simplified
@siteUpload {
	method POST PUT
	path /api/sites/upload /api/sites/*/upload /v1/sites /v1/sites/validate /v1/sites/*/content
}
handle @siteUpload {
	request_body {
		max_size 60MB
	}
	reverse_proxy app:3000
}
handle {
	request_body {
		max_size 25MB
	}
	reverse_proxy app:3000
}
```

On top of that, the error messages had "20 MB" hardcoded in three places. Now they come from the same constant that enforces the limit, so they won't lie again when the number changes.

## Second wall: the form had nowhere to go

With the site up, everything looked fine until I tried the contact form. Error.

This portfolio's form is built for Netlify Forms. It sends a `POST` to `/` on the site itself with a `form-name` field and a honeypot field for bots, and Netlify intercepts that `POST`, stores the message and emails it to me:

```js
// Simplified: what this site's form sends.
fetch("/", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    "form-name": "contact",
    fullname, email, message,
  }).toString(),
});
```

On RapiSites, an uploaded site is served in isolation on another domain (`rapisites.app`), and that server only answered `GET` and `HEAD`. The `POST` got `405 Method Not Allowed`. The sites RapiSites generates do have forms, with their own antispam ([I wrote about it](/blog/la-cache-rompio-mi-antispam)), but that system relies on a token the server puts into the HTML when it renders the page. An uploaded site is static HTML that nobody touches: there's nowhere to put the token.

## The decision: copy Netlify's convention, as is

I had two paths:

| Option | Why |
| --- | --- |
| A dedicated endpoint (`/api/forms/{id}`) the client pastes into their form | Forces you to edit the site before uploading it. It would also mean opening `/api/` routes on a domain that today only serves files. |
| Accept Netlify's convention: a `POST` with `form-name` to any path of the site | A site coming from Netlify works without touching a line. It's the same origin, so the site's security policy doesn't even notice. |

<p class="tbl-note">I went with the second.</p>

The rule: a `POST` to any path of a **public** uploaded site that carries a `form-name` field is a form submission. Without that field, the usual `405`. A detail I liked: the security policy for uploaded sites already had `form-action 'self'` and `connect-src 'self'`, so posting to the same site was already allowed in every network mode without changing anything.

## Reuse everything that already existed

I didn't want a second form system. A submission from an uploaded site comes in through a different door, but from there on it takes the same path as one from a generated site:

- It's stored in the **same table** of submissions, with no section attached.
- The notification goes through the **same email queue**, to the site's notification address or to the account's users, with "Reply-To" pointing at the visitor.
- It shows up in the **same inbox** in the panel.
- It counts against the plan's **same monthly quota** of forwarded emails.

The only thing I had to generalize was the "Reply-To". On a generated site, the visitor's email is stored under the label "Correo", which the system itself sets. On an uploaded site, whoever built the site chose the field name: `email`, `correo`, `contact_email`… Now it takes the first field whose name looks like an email field and whose value looks like an email, and the same function works for both kinds of site.

## Antispam without a token

Without the signed token, simpler layers are left, and they still make spam expensive:

| Layer | What it does |
| --- | --- |
| Honeypot | `bot-field` (Netlify's) or `_gotcha` (Formspree's). If it arrives filled in, it's stored as spam, not forwarded, and the bot gets the same answer as a successful submission. |
| Per-person limit | 10 submissions every 10 minutes per IP, same as generated sites. |
| Per-site limit | 60 submissions per hour. It stops a bot that spreads submissions across many IPs. |
| Size | Up to 128 KB of body, 30 fields and 5,000 characters per value. |

<p class="tbl-note">None is foolproof on its own; together they're enough for a contact form.</p>

The size limit has a specific reason. Clients' custom domains come in through a Caddy block with no body cap, because it serves any domain someone connects. So the app makes the cut itself, by checking `Content-Length` **before** reading anything.

## Answer the way the sender expects

A form can be sent two ways, and each expects something different:

- **A native `<form>`, no JavaScript.** The browser navigates, so it expects a page. It gets a `303` to the path it posted to, which is what Netlify does with the `action`: your "thank you" page. Without an `action`, the browser posts to the current page and comes back to it.
- **A `fetch()`, like this site's.** It expects a status. It gets `200 { ok: true }` and the site shows its own notice, just like with Netlify.

To tell them apart, the header the browser sends is `Sec-Fetch-Mode: navigate`. And here a trap showed up in the tests: Node's `fetch()` always overwrites that header with `cors`, even if you set it by hand. The native-submission test was going down the wrong path without me noticing. To simulate a browser navigation I had to use `http.request`, which sends headers as they are.

## A bonus bug

While testing I found something else: on an uploaded site's page, saving the name or the notification email returned `409`. The guard that keeps the editor from opening on an uploaded site is written as a list of what's **allowed**: a new endpoint stays closed until someone decides to open it. It's a good rule, but those two routes had never been added to the list, even though the page showed their cards. Now the notification email mattered, because that's where the forms land, so both were opened.

## What's still open

- The limits live in each process's memory. With a single instance that's enough; with several, they need a shared store.
- Attachments aren't stored: from a `multipart/form-data` body only the text fields are kept.
- If you used a different honeypot name on Netlify (`netlify-honeypot="x"`), you have to rename the field to `bot-field`. Reading that attribute from the HTML at upload time was one more moving part for a rare case.
- Sites in screen mode, the ones shown on digital signage, don't accept forms, on purpose.

## What I'd tell someone running into this

- Use your product with a real case of your own. My test data were small sites; the first real site went over the limit.
- When an infrastructure limit gets in the way, raise it only where it gets in the way, not across the whole server.
- If your users come from another platform, copying its convention can be worth more than designing a better one. What hurts most in a migration is having to change things.
- Messages with hardcoded numbers lie the day the number changes. Pull them from the constant.
- Be wary of tests that set browser headers: the HTTP client may be overwriting them without telling you.

> My takeaway: the best test of a developer product is moving onto it yourself. I found two limits and a bug in one afternoon, and a client would have found all three.
