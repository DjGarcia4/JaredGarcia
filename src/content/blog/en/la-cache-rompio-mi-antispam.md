---
title: "The cache broke my anti-spam: forms without CAPTCHA"
description: "Measuring how long someone takes to fill in a form sounds easy, until every visitor gets the same cached HTML. How I solved it with three layers and a signed token."
date: 2026-10-12
tags: [security, cache, rapisites]
projects: [rapisites]
kind: learning
keyword: "anti-spam"
---

RapiSites sites come with a contact form, and every form gets spam. This post is the story of how a performance decision (serving sites from a cache) broke the obvious way of stopping bots, and how I solved it without adding a CAPTCHA.

## Why not a CAPTCHA

The spec had already ruled it out, for three reasons that still hold:

- Friction. The product's main rule is that everything is fast end to end, and that includes whoever fills in the form, not just the site owner.
- Third-party JavaScript. Public sites load no JavaScript at all, and a CAPTCHA (reCAPTCHA, hCaptcha, Turnstile) is precisely an external script.
- Accessibility. Making a truly accessible CAPTCHA is hard.

The plan was the classic one: a honeypot field, a per-IP limit and measuring how long the person takes to fill in the form. A person takes seconds; a bot fills it in milliseconds.

## How a site is served (and why it matters)

To understand the problem you need to see how a page reaches the visitor. When someone opens a site, a middleware looks at the domain, resolves which site it is and renders the page on the server. Before rendering, it checks a cache keyed by domain and path: if the page is already there, it returns it without rendering anything.

- Only `200` responses to `GET` requests with no URL parameters are stored. Never an error.
- Entries are cleared on publish, on rolling back to a previous version, on changing the primary domain or removing a language from the site.
- The anonymous session cookie the internal response carries is never stored. If it were, one visitor's cookie would be served to everyone who later hit that same entry.

In practice, visitors get static HTML. That's good for performance, and performance is SEO. But it has a consequence I hadn't thought about.

## The problem: the HTML isn't per visitor

The natural way to measure fill time is to put a hidden field with the time the page was rendered and, when the submission arrives, check how much time has passed.

```html
<!-- Simplified: the obvious idea, which doesn't work here -->
<input type="hidden" name="rendered_at" value="1767225600000">
```

But with the cache, every visitor to a page gets the same HTML, with the same time inside, until the next publish. “How long ago was it rendered” stops being per visitor: it can say the page was rendered three days ago even if the person opened it ten seconds ago.

On top of that, a time in a hidden field can be changed by the bot itself. If the server trusts that number, the bot just has to send an old one.

## The solution: three layers, none foolproof alone

I didn't look for one perfect barrier, but for three cheap ones that cover for each other. Each catches something the others let through, and none of them asks anything of the person writing.

## 1. The honeypot field

It's a real `<input>` in the HTML, hidden with CSS, with no `tabindex` and `autocomplete="off"`. A person doesn't see it or reach it with the keyboard; a bot that fills in everything fills it in. It's called `website` and not `honeypot` on purpose: it has to look like a real field so the bot takes the bait.

If it arrives with content, the submission is still saved (in RapiSites nothing is deleted) but with the maximum spam score, it isn't forwarded by email and it doesn't show up in the inbox. And the bot is told everything went fine, so it doesn't learn what gave it away.

## 2. The per-IP limit

Ten submissions every ten minutes per IP. A person doesn't get there; a bot that got past the other layers does. If it's exceeded, the visitor goes back to the page with a notice to wait a moment. It's the same limiter that protects sign-in.

## 3. A signed token with the instant inside

Instead of a loose timestamp, every form carries a token. Inside it are the site and the moment it was issued, and it's signed with HMAC-SHA256 using a secret only the server knows. It's issued during the page render (the same render that then ends up cached) and verified at the endpoint that receives the submission.

```ts
// Simplified: issuing the token.
const payload = base64url(JSON.stringify({ s: siteId, t: Date.now() }));
const token = `${payload}.${base64url(hmacSha256(secret, payload))}`;
```

```ts
// Simplified: verifying it, in this order.
const [payload, signature] = token.split(".");
if (!payload || !signature) return "malformed";
if (!timingSafeEqual(signature, sign(payload))) return "bad-signature";
const { s, t } = JSON.parse(fromBase64url(payload));
if (s !== siteId) return "wrong-site";
const age = Date.now() - t;
if (age < 0 || age > 24 * HOUR) return "expired";  // from the future, or too old
return { ok: true, age };                           // "too fast" is the endpoint's call
```

The token does two jobs at once:

- It prevents forgery. The submission has no session or cookie to protect, but without the secret you can't make a valid token. To send one, you first have to request the page. A script aiming at the endpoint blindly doesn't get through. And since the site is inside, one site's token doesn't work for another.
- It works as a clock. Since the instant travels signed, the bot can't change it. If the submission arrives less than 2.5 seconds after the token was issued, it adds to the spam score. If the token is older than 24 hours, or dated in the future, it's rejected.

A design detail: the function that verifies the token doesn't decide whether the submission is spam. It just returns the age. “Too fast” is a signal that adds up, not a token error, and that decision belongs to the endpoint.

| Signal | What happens to the submission |
| --- | --- |
| Malformed token, invalid signature or another site's | Rejected. The visitor sees “We couldn't process the form. Reload the page and try again.” |
| Token older than 24 hours | Rejected with its own reason: “The form expired. Reload the page…” |
| Honeypot field with content | Saved with maximum spam score, not forwarded, not listed. The bot is told it went fine. |
| Sent in under 2.5 s | Saved and forwarded, with a spam score of 0.4. Not cut off. |
| More than 10 submissions in 10 minutes from the same IP | Back to the page with a notice to wait. |
| All good | Saved with score 0 and forwarded by email. |

<p class="tbl-note">Each layer has a different effect. Only the token's signature and age reject.</p>

## What happens when someone submits

The full path, without a line of JavaScript in the browser:

- The browser validates required fields and the email format with `required` and `type="email"`, and makes a native `POST` to the site's endpoint.
- The endpoint applies the per-IP limit and verifies the token.
- It looks up the section in the site's published version, not the draft, and checks that it really is a section with a form and not, say, a gallery.
- It rebuilds the list of fields with the same function the section used to draw them, so the form and the server never have different ideas about which fields exist.
- It checks the honeypot and validates with Zod: 160 characters for short fields, 2,000 for the message.
- It saves the submission. The IP isn't stored: a keyed hash is, enough to recognize submissions from the same origin without keeping the personal data.
- It queues the email notification. It's sent from the platform's domain, with “Reply-To” pointing to the visitor, never “from” the visitor, because that breaks SPF and DKIM. If sending the email fails, the message is already saved and the queue retries.
- It answers with a 303 redirect to the same page, with `?rs_sent=` or `?rs_error=` in the URL, and the section shows the success message or the error.

That last step had its own clash with the cache. The cache key is domain plus path, without parameters. If the confirmation page were stored, `/contact?rs_sent=…` would collide with `/contact`: either the visitor would never see the “message sent”, or everyone else would see it without having sent anything. That's why a URL with parameters is neither served from nor stored in the cache. They're rare requests, and that render is always fresh.

## Accepting what isn't perfect

With the cache, the token is still shared: every visitor to a page gets the same one until the cache is renewed. That has effects, and I decided to live with them:

| Effect | Why I accept it |
| --- | --- |
| The token can be hours old when the visitor just opened the page | The lower bound still catches the bot that requests the page and submits straight away on a freshly issued token. The upper bound, 24 hours, forces rotation. The bot that requests the page, waits three seconds and submits gets past that layer, but it's no longer volume spam, and the honeypot and the per-IP limit make it costlier. |
| One token works for several submissions | There's nothing single-use to protect: it isn't a transaction, it's a contact message. If repeated spam with the same content showed up, it could be deduplicated by hash. It isn't needed today. |
| The token doesn't identify the visitor | On purpose: I don't want cookies or fingerprinting on the public site. |

<p class="tbl-note">Why the clock adds points but doesn't cut off: with the cache, it's approximate.</p>

| Alternative | Why I ruled it out |
| --- | --- |
| CAPTCHA | Friction for the visitor and third-party JavaScript on the public site: the two things the project doesn't do. |
| Plain timestamp in a hidden field | Forgeable and, with the cache, not even per visitor. |
| Single-use token stored in the database | One write per render and a read plus a delete per submission, when with the cache the render doesn't even happen per visitor. All that cost for a form that doesn't move money. |
| Taking pages with forms out of the cache | Kills the performance of the contact page, which tends to be one of the most visited. The cache-tolerant token exists precisely to avoid this. |
| Just a global limit, without IP | Not enough on its own. |

<p class="tbl-note">What I considered and why not.</p>

## What's still open

- The per-IP limit lives in each process's memory. With a single instance it works; if there are ever several, it has to move to a shared store. It's the same debt the sign-in limit has.
- Form fields are named by position (`f0`, `f1`…). If the owner reorders or deletes questions and republishes, someone who had the form open can send an answer that gets saved under another question's label. The token's 24-hour cap bounds that window. The worst case is a mislabeled submission, never a crash.
- The decision assumes the 24-hour cap forces the cache to renew at least once a day. But today the in-memory cache has no expiry of its own: it's renewed on publish, on rollback, on changing the primary domain or a language, or on a process restart. A page that went more than a day without any of that would serve an expired token, and the form would answer that it expired. Giving the cache an expiry shorter than 24 hours would close that edge.
- A privacy notice for the contact data collected is still missing. It's logged as an open decision.

## What I'd tell someone who runs into this

- Before using “when was this page rendered” as data, find out whether the page is rendered per visitor. With a cache in front, it almost never is.
- Whatever travels through the browser and comes back to the server, sign it. A signature turns editable data into trustworthy data without storing anything.
- Separate signals that add up from signals that reject. An approximate signal that rejects produces false positives; one that adds up doesn't.
- Stack cheap layers instead of looking for a perfect one. None is foolproof alone; together they make spam expensive enough.
- Don't teach the bot what gave it away, and don't delete anything: keep spam flagged, in case you got it wrong.
- Check what your cache stores besides the body: a cached cookie is a shared session.

> What I take away: the cache changes what's true in your system. Before designing something that depends on “when was this page rendered”, ask who rendered it and for how many people.
