---
title: "57 components, zero JavaScript: performance is SEO"
description: "Carousels, accordions and forms without a line of JS on the public site. What you gain, how it's done, and the bug that disappeared when the JavaScript went away."
date: 2026-10-12
tags: [performance, seo, rapisites]
projects: [rapisites]
cover: /img/projects/rapisites/02.webp
kind: learning
keyword: "0 KB of JS"
---

The sites RapiSites generates don't load JavaScript. None of the 57 components in the catalog need it: the public site is served as HTML and CSS, nothing else. Not the carousel, not the FAQ accordion, not the dropdown menu, not the contact form.

It didn't start as an aesthetic rule. For a small business, being found on Google matters more than any animation, and speed is part of SEO. If the system promises correct technical SEO without the client doing anything, it can't send visitors loads of JavaScript. And the funny thing is that the original spec didn't even ask for zero: it said “JavaScript only in islands”, assuming the carousel and the accordion would need one. They didn't.

## What the 57 are

| Type | Variants | What could have asked for JavaScript |
| --- | --- | --- |
| Menu (`nav`) | 6 | Dropdowns, language switcher |
| Hero | 8 | Two variants with a form |
| Features | 8 | Numbered steps |
| Stats | 3 | — |
| Catalog | 5 | Product carousel |
| Gallery | 3 | Carousel, before and after |
| Testimonials | 4 | Carousel |
| Pricing | 2 | — |
| FAQ | 2 | Accordion |
| Team | 2 | — |
| About | 3 | — |
| Contact | 3 | Form, map |
| Call to action (`cta`) | 6 | One variant with a form |
| Footer | 2 | — |

<p class="tbl-note">14 types, 57 variants. The right-hand column is the list of temptations.</p>

## What seemed to need JS and didn't

Every component that “obviously” needed JavaScript got an answer in HTML or CSS. Some are well known; what took effort was seeing the details that make them work well.

| Component | How it was solved | The detail that matters |
| --- | --- | --- |
| Carousels (gallery, catalog, testimonials) | CSS `scroll-snap` | Each photo is narrower than the container so the next one peeks in, and the thin scrollbar stays visible: it's the only hint that there's more. |
| FAQ accordion | `<details>` and `<summary>` | No shared `name`: opening one doesn't close the other, so anyone comparing two answers doesn't have to go back and forth. |
| Dropdown menu | `<details>` inside the `nav` | The `<summary>` is the trigger's only focusable element, so the keyboard goes through everything with no focus traps. |
| Contact form | Native `<form method="post">` | The server answers with a 303 redirect back to the same page, and the browser validates required fields and email. |
| Language switcher | An `<a>` with `hreflang` | Switching language means going to another URL. There's no state to keep. |
| Before and after | Two photos side by side | It's not a slider: a visible pair doesn't need dragging. |
| Numbered steps | CSS `counter` | The number isn't a field: delete a step and the rest renumber themselves. |

<p class="tbl-note">No section needed a hydration island.</p>

```css
/* Simplified: a carousel without JavaScript. */
.track {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;          /* the bar stays: it's the hint */
}
.slide {
  flex: 0 0 auto;
  width: min(82%, 22rem);         /* the next one always peeks in */
  scroll-snap-align: start;
}
@media (prefers-reduced-motion: no-preference) {
  .track { scroll-behavior: smooth; }
}
```

The carousel also has to work with a keyboard. The track has `role="region"`, an `aria-label` and `tabindex="0"`. Without that `tabindex`, the track can't take focus and keyboard users can't move it with the arrow keys: they're stuck looking at the first two photos and nothing else. It has no arrows or dots: it moves with a finger, the wheel, the trackpad or the keyboard.

```html
<!-- Simplified: FAQ without JavaScript -->
<details>
  <summary><h3>Do you deliver?</h3></summary>
  <p>Yes, all over the city. Order on WhatsApp.</p>
</details>
```

With `<details>`, the accordion opens and closes on its own, responds to Enter and Space, and a screen reader announces whether it's open or closed without writing a single `aria-expanded`. The heading goes inside the `summary` so the page's heading hierarchy stays correct.

## What I left out because of the same rule

The rule didn't just solve components; it also ruled some out. The original catalog had a contact variant with a map. An embedded Google map is an `<iframe>` that brings several hundred kilobytes of third-party JavaScript, third-party cookies and a request on the critical path of the first paint. I replaced it with a variant that shows the address as text, with a link that opens the phone's maps app.

- A static map image would have been zero JavaScript, but it requires a provider, an API key, a quota and billing per published site: a new piece of the stack and a variable cost per client for something the link already solves.
- What's lost is seeing the location at a glance without leaving the site. For a neighborhood business, whose address visitors roughly know, it's a low cost. And on mobile, where most of these sites are seen, opening the maps app is a better experience than a 300-pixel map.
- The video hero stayed an open decision: there's no video handling yet, and embedding YouTube clashes with the same no-third-party-JavaScript rule.

## Where there is JavaScript

What does need JavaScript is the editor, and there it is. The editor preview is an `<iframe>` that syncs with the panel through `postMessage`: change some text and you see it instantly. That preview uses the same components as the public site, on purpose, so what you see while editing is exactly what gets published. The only thing that changes is the route: the editor's is served with JavaScript and the public site's without.

```ts
// Simplified: the public site, no scripts; the preview, with them.
export default defineNuxtConfig({
  routeRules: {
    "/site-render/**": { noScripts: true },
    // "/preview/**" stays out: the editor needs postMessage
  },
});
```

A nice side effect: in the editor preview the contact form shows up but doesn't send. It wouldn't make sense for the owner to message themselves while editing.

## The bug that left with the JavaScript

To understand this bug you need to know how a site is served. A single application handles the panel, the landing page and every client site. When a visit arrives at `{slug}.rapisites.com` or the client's own domain, a middleware looks at the `Host`, resolves which site it is and renders the page from an internal route (`/site-render/{id}/…`). Then it returns that HTML at the URL the visitor asked for.

The internal route has its own story: the technique usually recommended for this is rewriting the request URL inside the same process, and with Nitro it doesn't work, because it captures the path once at the start and reimposes it on every layer. I confirmed it by reading `h3`'s source and testing against a real server. So the middleware makes a real internal HTTP request.

While the public site still hydrated, that had a consequence: the client-side router compared the route the page had been rendered with (the internal one) to the browser's URL (the real one), saw they didn't match and “fixed” the address bar to `/site-render/{id}/…`. Visitors saw an address that shouldn't exist.

What's interesting is when it showed up: the first time the production stack was served over HTTPS with a real domain and a browser. Up to then I had tested it with `curl`, and with `curl` everything looked fine, because `curl` doesn't run JavaScript. The same test surfaced another bug: the `canonical`, `hreflang`, sitemap and Open Graph came out with `http://`, because the internal request travels over HTTP and the original protocol wasn't being forwarded.

- The protocol was fixed by forwarding `x-forwarded-proto` along with the host.
- The URL was fixed at the root by serving the public site without scripts: with no hydration there's no router to correct anything. The site had no client-side interaction anyway, so nothing was lost, and it's faster too.
- The middleware also tells the page it's on its real domain, so menu links come out as clean routes (`/services`) and not with the internal prefix.
- And an end-to-end test was added that walks that path in a real browser, which was exactly the gap both bugs had slipped through.

It wasn't the only bug of that family. Since the public site doesn't load the panel's CSS, it doesn't get the style reset that comes with it either. Without it, a container with 100% width plus padding was wider than the screen and phones scrolled sideways. In development it didn't show, because the dev environment injects that reset anyway. In the editor preview it didn't either, because it inherits the panel's CSS. It only appeared on the real site, served from a production build. Same lesson: the real path is the only one that counts.

## The rest of the performance

No JavaScript is the most visible part, but not the only one. All of this comes baked in; the client configures nothing:

| Piece | How it's done |
| --- | --- |
| HTML | Rendered on the server and cached by domain and path. The cache is invalidated on publish, so in practice visitors get static HTML. |
| CSS | Each section's CSS is inlined in the HTML. The panel's CSS (full Tailwind, 43 KB) used to load as a render-blocking `<link>` on the public site without using a single class; now only the panel's screens import it. |
| Fonts | Self-hosted, no external services. Only the family that site uses is preloaded: one file if headings and body share a family, two if not. |
| Images | In AVIF, WebP and JPEG, at 400, 800, 1200 and 1920 px wide, with `srcset` and explicit dimensions. Lazy-loaded everywhere except the hero's, which is also requested with high priority. |
| Motion | Transitions only animate transforms, opacity or color, none lasts longer than 300 ms and all respect `prefers-reduced-motion`. |
| Third parties | No third-party libraries or scripts on the public site. |

<p class="tbl-note">The CSS rules are checked by a test that reads every section's source code.</p>

Two tests run over the whole catalog. One renders each section to HTML and checks for visible content, `alt` and dimensions on every image, and a single `h1` when it applies. The other reads each section's CSS and checks there are no literal colors, no vertical margins of its own and no excessive animations. With 57 components, eyeballing isn't enough.

<figure>
  <img srcset="/img/projects/rapisites/03-800.webp 800w, /img/projects/rapisites/03-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/rapisites/03-1600.webp" alt="A site generated for a photo studio, “Estudio Cauce”. Galleries, sections and a form, without a single script." loading="lazy" decoding="async" />
  <figcaption>A site generated for a photo studio, “Estudio Cauce”. Galleries, sections and a form, without a single script.</figcaption>
</figure>

## What I'd tell someone who wants to do the same

- Before installing a library for a component, look for the native version: `scroll-snap`, `<details>`, a real `<form>`, a link. It almost always exists and is almost always more accessible out of the box.
- When the native version isn't enough, ask whether the component is needed. Sometimes the right answer is a link to another app, like the map.
- Separate where you need JavaScript (the editor) from where you don't (the public site), even if they share components.
- Test the real path: real domain, HTTPS, real browser, production build. `curl` and the dev environment hide exactly the bugs that matter.
- Turn the rules into tests that run over the whole catalog. A rule checked by hand breaks at section 40.

> What I take away: a strong constraint simplifies more than it limits. Every new component has to be solved with HTML and CSS, and it almost always can be. And when it can't, the constraint makes you ask whether the component was needed.
