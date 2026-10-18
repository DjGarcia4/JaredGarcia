---
title: "The blank thumbnail: sandbox, a null origin and crossorigin"
description: "I rebuilt the RapiSites site list with a live thumbnail of each site. Sites built with Vite came out blank or unstyled. The cause was one security attribute and another one Vite adds on its own."
date: 2026-10-18
tags: [rapisites, security, ux]
projects: [rapisites]
kind: learning
keyword: "sandbox"
---

The site list in the [RapiSites](/project/rapisites) panel was a table: name, address, status, visits. Functional, but you had to read to recognize a site, and the buttons on each row were scattered. I rebuilt it as a grid of cards with a thumbnail of the site on top.

This post is about that thumbnail, and about why two of my own sites came out broken in it.

## Live thumbnails, not screenshots

The classic way is screenshots: a headless browser opens each site on publish, takes a picture and stores it. It works, but it brings a new piece to maintain (a Chromium running on the server), storage, and stale thumbnails every time something fails.

I picked the other way: the thumbnail **is** the published site, scaled down. A 1280×800 `<iframe>` scaled to the card's width:

```vue
<!-- Simplified -->
<iframe
  :src="src"
  loading="lazy"
  tabindex="-1"
  aria-hidden="true"
  class="pointer-events-none absolute top-0 left-0 origin-top-left"
  :style="{ width: '1280px', height: '800px', transform: `scale(${scale})` }"
/>
```

```js
// The scale follows the card's width.
new ResizeObserver(([entry]) => {
  scale.value = entry.contentRect.width / 1280;
}).observe(box.value);
```

- `loading="lazy"`: only loads the thumbnails about to appear on screen.
- `pointer-events: none`, `tabindex="-1"` and `aria-hidden`: it can't be clicked, focused or read. The whole card is the link.
- A site that's a draft, blocked or in screen mode (which can't be viewed on its own) shows a cover with its initial instead of the iframe.

There are two kinds of site. The ones RapiSites generates load from an internal route on the panel itself and carry no JavaScript, so they're light. The ones a client uploads with their own files bring **their** JavaScript, which I know nothing about. I loaded those from their public address, inside a `sandbox`:

```html
<iframe src="https://their-site.rapisites.app/" sandbox="allow-scripts">
```

`allow-scripts` lets their JS run. Everything else stays blocked: opening windows, navigating the panel away, submitting forms. And without `allow-same-origin`, I told myself, the site is even more isolated.

## The symptom

On my machine, uploaded sites' thumbnails came out blank. I put it down to file storage not running locally, which was partly true. I noted it as a caveat and moved on.

In production, with real sites:

| Site | How it loads its CSS and JS | Thumbnail |
| --- | --- | --- |
| Ebanistería | HTML without `crossorigin` | Fine |
| Wink Digital | HTML without `crossorigin` | Fine |
| This portfolio | Vite, with `crossorigin` | Unstyled: a giant SVG and the "Skip to content" link in blue |
| [SwiftFlow](/project/swiftflow-typing-test) | Vite, with `crossorigin` | Blank |

<p class="tbl-note">The pattern was in the second column.</p>

Opened directly in the browser, all four worked. They only broke inside the card.

## The cause: a null origin and an attribute Vite adds on its own

A sandboxed iframe **without** `allow-same-origin` doesn't get the origin of its address. It gets an opaque origin, which the browser writes as `null`. For the site inside, every request to its own server becomes a cross-origin request.

Plain HTML doesn't care: a `<link rel="stylesheet">` or a classic `<script>` loads even from another origin. But Vite generates this:

```html
<script type="module" crossorigin src="/assets/index-CeZpE2nE.js"></script>
<link rel="modulepreload" crossorigin href="/assets/vendor-vue-CJobXzRY.js">
<link rel="stylesheet" crossorigin href="/assets/index-Bg4-nhXA.css">
```

`crossorigin` (and `type="module"`, which is always fetched that way) tells the browser to load the file in CORS mode. The request goes out with `Origin: null`, and the browser only uses the response if the server answers with an `Access-Control-Allow-Origin` that allows it. The server for uploaded sites sends no CORS headers. I confirmed it with `curl`:

```bash
curl -sI -H "Origin: null" https://jared-garcia.com/ | grep -i access-control
# (nothing)
```

The result:

- **SwiftFlow** is a single-page app: without its JS there's nothing to paint. Blank.
- **This portfolio** is prerendered, so the HTML carries the content. But the CSS didn't load: hence the giant unsized SVG and the skip link, which is normally hidden.
- **The other two** don't use `crossorigin`, so they loaded fine.

I reproduced it with Playwright: a page with both sites in iframes, one row with `sandbox="allow-scripts"` and another with `sandbox="allow-scripts allow-same-origin"`. The first row looked exactly like the production screenshot. The second, perfect.

## The fix, and why it's safe

The fix is one word: `allow-same-origin`. The iframe gets the origin of its address back, and its requests to its own server are same-origin.

What needed thinking was whether that opened a hole. The well-known warning about `sandbox` is that `allow-scripts` together with `allow-same-origin` defeats it. But that only happens when the document inside is **same-origin with the page that contains it**: then its JS can reach into the outer page and remove its own `sandbox`.

That's not the case here. The panel lives at `app.rapisites.com`. An uploaded site lives on `rapisites.app` (a separate registered domain, precisely for this) or on the client's own domain. With `allow-same-origin` the site has **its** origin, not the panel's, and the same-origin policy still keeps it from touching the panel. The `sandbox` still blocks popups, navigating the tab and submitting forms.

| Alternative | Why not |
| --- | --- |
| Send `Access-Control-Allow-Origin` on uploaded sites | It changes how every client's site is served to fix a thumbnail in the panel. |
| Drop the `sandbox` | I'd lose the popup and navigation blocking, which is what matters with JS I don't control. |
| Go back to screenshots | A whole piece of infrastructure for something one attribute fixes. |

<p class="tbl-note">They all fixed the symptom; none beat the missing word.</p>

## A detail that was already right

Every thumbnail is a real load of the site. With visit analytics freshly shipped, I worried that every time someone opens their panel, fake visits would get counted. They don't: a visit only counts when the browser requests the page as the main document, and an iframe's request arrives with `Sec-Fetch-Dest: iframe`. That rule was designed for something else (apps on screens that reload themselves) and it covered this case without touching it.

## What I'd tell someone running into this

- Test with sites built by the most common tools, not just plain HTML. My test data had no `crossorigin`; any Vite site does.
- When you blame a symptom on the environment ("there's no storage locally"), write down what you'd expect to see if it were something else. I left it as a caveat and the real bug reached production.
- `sandbox` without `allow-same-origin` isn't free extra safety: it gives the document a null origin, and that breaks everything that loads with CORS.
- The `allow-scripts` + `allow-same-origin` rule depends on the origin. Against another domain, the same-origin policy keeps doing its job.
- Reproduce side by side. A page with both variants in two rows turned a theory into a certainty in a minute.

> My takeaway: a security attribute you add "just in case" has effects too. Understand what it does before you add it, not after something breaks.
