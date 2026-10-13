---
title: "Saying yes to what my own spec ruled out"
description: "RapiSites' spec excluded uploading your own HTML twice. A real request made me change it: what I reviewed, what I ruled out, and why foreign code gets isolated instead of sanitized."
date: 2026-10-12
tags: [security, product, rapisites]
projects: [rapisites]
kind: learning
keyword: "rapisites.app"
---

The RapiSites spec said it twice. Under “What it is NOT”: it's not a code or custom HTML editor, because that breaks the quality and SEO guarantee. And under “Explicitly out of v1”: static HTML export, public API, webhooks.

Then a concrete request came in: a client of [Wink](/project/wink-app), which does digital signage, wanted to show an interactive game they had already built in HTML on a screen. Wink doesn't host websites. RapiSites had everything needed —subdomains, custom domains with automatic SSL, storage on R2, versioned publishing—, but my own rules said no.

## Revisit the rule, don't skip it

The rule existed for a reason: protecting the design and SEO guarantee of generated sites. RapiSites builds sites from a closed library of sections, a renderer that sends no JavaScript to the visitor, and technical SEO the client can't break. If I let arbitrary HTML in through that same path, the guarantee stops being true.

So the question wasn't “do I do it or not?”, but “how do I do it without breaking what that rule protects?”. The answer was written down on October 1 as decision 034, along with a plan covering everything: product, architecture, isolation, API, plans, abuse, operations and phases. RapiSites adds a way to create a site, uploading the files you already have, and the design and SEO guarantee stays with generated sites. On an uploaded site, the responsibility belongs to whoever uploads it.

The most useful part of that exercise was making a table of every rule in force that clashed, where it was written and how it was resolved. None was repealed. All of them were narrowed:

| Rule | Clash | How it ended up |
| --- | --- | --- |
| It's not a code or custom HTML editor | An uploaded site is custom HTML | There's still no code editor. The guarantee applies to generated sites; the uploaded one is labeled “Own files” |
| Restrict in order to guarantee | An uploaded site has no design restrictions | The principle governs the builder. The uploaded site is a different, labeled entry point |
| The public site loads no JavaScript | An uploaded site is the client's JavaScript | The rule is about the renderer. Uploaded sites don't go through the renderer |
| Public API out of v1 | The plan adds an API | Scope change: the spec was updated before writing code |
| Nothing is ever deleted | An integrator needs to really take sites down | The platform deletes nothing on its own. Files only disappear if their owner purges them |

<p class="tbl-note">The rules that clashed with the request, and how each one was narrowed.</p>

## Not another product

The first version of the plan was a separate product, “Apps”, with its own tables, list and quotas. I dropped it: it duplicated domains, publishing, history and billing, which already existed for sites. An uploaded site is one more row in `sites`, with `kind = 'uploaded'`, and with no extra work it inherits the site list, the QR code, custom domains, publishing as a separate act from editing, history with rollback, the non-payment calendar and the plan quota.

What doesn't apply is stated plainly: an uploaded site doesn't open the editor by any path, has no theme, doesn't go through the SEO audit (a validation report replaces it), gets no automatic sitemap or structured data, and has no forms or translation. It's edited the way any static site is: you download the files, change them and upload them again.

What did change was its place in the interface. Generating with AI and picking a style are still the two main options, without changing a single word. Uploading files is a link underneath, “Already have your site in HTML, CSS and JS? Upload your files”, not a third card. Someone who doesn't know what HTML is doesn't stop there. Inside, it speaks in technical terms, because its audience uses them, and the first line makes the difference clear: we publish your files exactly as they are, and to change something you upload them again.

One plan decision came straight from the original rule: the Free plan doesn't upload files. Free sites carry “Made with RapiSites” in the footer, and on an uploaded site I can't add it without touching someone else's files. It would also be the front door for anonymous abuse. On paid plans there's no per-site cap: what limits you is the account's storage, the same one images already share.

## Isolate, don't sanitize

An uploaded site brings someone else's JavaScript. For rich text in generated sites I already had a tag allowlist, but an interactive game is JavaScript: cleaning it makes it useless. So nothing is rewritten, no scripts are removed and nothing is injected. What's uploaded is what's served. The protection lies in where and how it's served.

The first piece is the domain. Uploaded sites are served on a second domain, `rapisites.app`, not on `rapisites.com`. Serving them on `{slug}.rapisites.com` would have saved me buying a domain, but it had three problems:

| Problem | Why |
| --- | --- |
| Requests to the panel with someone else's session | To the browser, all subdomains of the same registered domain are the same site. `SameSite=Lax` doesn't protect between them: a script on a subdomain could fire requests at the panel with the cookie of whoever visited it. And the panel's API didn't check the origin |
| Planted cookies | A script on a subdomain can write cookies for the whole domain, which then travel to the panel |
| Reputation | A phishing page can get the entire domain blocklisted and take down every client's site |

<p class="tbl-note">Why someone else's code couldn't live under rapisites.com.</p>

One detail came with the name: the whole `.app` top-level domain is on browsers' HSTS preload list, so an `http://` address isn't even attempted. In production nothing changes, since everything is already served over HTTPS, but in development you need a different local domain.

Within that domain, each uploaded site has its own origin, never receives `Set-Cookie`, only answers `GET` and `HEAD`, never reaches the API or the panel, and goes out with its own security headers:

- `Content-Security-Policy` according to the site's network mode.
- `X-Content-Type-Options: nosniff`, and the content type comes from the extension, not from whatever the client claims.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy` denying camera, microphone, geolocation, payments and USB.
- `X-Robots-Tag: noindex` when the site shouldn't be indexed: by default, every uploaded site living on `rapisites.app` and every site created through the API. With a custom domain, it gets indexed; the domain and its reputation belong to the client.

The default network mode is self-contained: the site can only use its own files, with no calls to other hosts and no forms submitting elsewhere. It cuts phishing at the root, because a fake login page has nowhere to send what it steals. The cost is real, many sites load fonts or libraries from other hosts, so open mode is one click away, and validation lists the external hosts it found.

```text
# Self-contained mode CSP (simplified)
default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;
connect-src 'self' data: blob:;
form-action 'self';
object-src 'none';
base-uri 'self';
worker-src 'self' blob:
```

Before a bundle is accepted, it's validated whole: there has to be a home page, extensions on an allowlist, paths without `..`, absolute paths or symlinks, HTML in UTF-8 that parses, and it has to fit the site and storage quotas. What doesn't block gets a warning: missing images, paths to the user's disk like `C:\`, pages without a `<title>`. At first, 20 MB and 500 files per bundle.

## Hardening the panel along the way

Even though someone else's code was no longer going to run under `rapisites.com`, the analysis made it obvious that the panel depended on that to be safe. So I added a second barrier: every request that writes has to come from the same origin that receives it.

```ts
// A write from another origin? (simplified)
function isCrossOriginWrite({ method, host, origin, secFetchSite }) {
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return false
  if (origin) {
    try { return new URL(origin).host !== host }
    catch { return true } // "null" is not the same origin
  }
  if (secFetchSite) return secFetchSite === "cross-site" || secFetchSite === "same-site"
  return false // curl or a server: they carry nobody's cookie
}
```

`same-site` means exactly “another subdomain”, and that's why it's rejected. Forms on published sites and the one on the landing page keep working because they post to their own domain. I also considered renaming the session cookie with the `__Host-` prefix, which stops a subdomain from planting a cookie on the panel. I left it for later: renaming it would log every user out on deploy, and it protected against something that can't happen today.

## What I ruled out and what it costs

- A separate product (“Apps”): it duplicated everything that already existed for sites.
- Sanitizing the HTML: it makes any interactive site useless.
- Serving them under `rapisites.com`: the session and reputation risk would fall on the main product.
- Opening uploads to the Free plan: no footer branding and a risk of anonymous abuse.
- A full copy of the files per version: files are stored by their `sha256`, once per site, and an update only takes up what changed.
- Automatically deleting old versions: it clashes with “nothing is deleted”. The owner decides what to purge.
- All of an integrator's sites under one host, by path: a single certificate, but they'd share an origin and one site could read another's data.

And what I accepted paying: RapiSites stops being only “the builder that guarantees”, because there are sites on the platform whose quality it doesn't control. Hosting someone else's executable code brings an abuse risk that didn't exist before, so I built site blocking from the admin panel, and the plan also calls for a reporting channel and terms of use; the legal side is still waiting on a lawyer. And there's now a second domain and a second bucket to operate.

## And a real client showed up

Along with uploaded sites came a public API at `api.rapisites.com/v1`, so another system can publish on behalf of its clients. Keys look like `rsk_live_…`, are shown only once and are stored as a SHA-256 hash. Using it requires a registered account, a verified email, an active plan that includes the API, accepted terms and an abuse contact. An integrator signs up like any new user: there are no special accounts.

I built it in phases, over a few days: isolated serving (PR #51), the panel flow (PR #52) and the full API (PR #53, on October 4). The first real integrator was [Wink](/project/wink-app), and mapping its flow against the API in production brought adjustments no plan had anticipated:

- A draft preview [Wink](/project/wink-app) could embed from its own origins, including `http://` for an internal host without a dot.
- A `429` with `code: upload_in_progress` and `Retry-After` when two uploads collide, and a narrower upload lock: it used to serialize the whole upload per account; now only the moment of re-reading the quota and writing.
- A limit of 60 requests per minute per key that can be raised per account, for a single account with many clients behind it.
- Discarding the draft through the API, and later history, rollback and server-side site copies.

On [Wink](/project/wink-app)'s side, the integration still depends on its own backend: its apps aren't published on screens today. And on RapiSites' side there are open items in the plan: `.zip` uploads, the signed-token access mode, backups of the files in R2 and a bandwidth cap.

## What I'd tell someone in the same situation

- Before changing a rule, write down what it protected. If you don't know, don't change it yet.
- Look for a way to narrow it instead of repealing it: “it governs the renderer” is much easier to uphold than “it no longer applies”.
- If you're going to host someone else's code, separate it by registered domain, not by subdomain. To the browser, that's a different thing.
- Use the analysis to close whatever was open even if nobody was exploiting it, like the origin check.
- Put the new option where it doesn't get in the way of people who don't need it.

> What I take away: a spec is a tool, not a contract with yourself. Changing it is fine if you write down what the rule protected and how you keep protecting it.
