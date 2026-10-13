---
title: "From 695 KB to under 200: this portfolio's performance budget"
description: "Icons that weighed over 500 KB, a jumping footer, three.js only when it's seen, prerendering, self-hosted fonts and a blog eating the budget: every step with its numbers."
date: 2026-10-13
tags: [performance, vue, lighthouse]
kind: learning
keyword: "200 KB"
---

This portfolio's redesign started with a review of the site done the way a hiring manager would. One finding was uncomfortable: the main JavaScript file weighed 1,927 KB minified, 695 KB gzipped. For a site that says “I design the experience and build it all the way to production”, that was a bad first message.

I wanted to add 3D and a few eye-catching moments, so before adding anything I set a budget. This post covers how I met it, with the numbers from each step, and what happened this week when the blog started eating into it.

## The budget

| Metric | Limit |
| --- | --- |
| Initial JavaScript | &lt; 200 KB gzip |
| 3D chunk | &lt; 250 KB gzip, lazy-loaded |
| LCP on 4G | &lt; 2.5 s |
| Lighthouse | ≥ 90 Performance and 100 Accessibility |

<p class="tbl-note">The budget, written before touching the code.</p>

The rule behind it is simple: if the site is slow, the eye-catching parts cost a lot. A 3D effect that delays the first paint doesn't add, it subtracts.

## 1. 695 KB for a few icons

The main cause of the weight was one line: `library.add(fas, fab)`. It registered every solid and brand icon in Font Awesome, about two thousand, to use a few dozen. The fix was importing only the ones in use, one by one, in a file of their own.

```js
// Before: every icon, used or not
library.add(fas, fab);

// After (simplified): only the ones the site uses
import { faArrowRight, faBolt, faBookOpen /* … */ } from "@fortawesome/free-solid-svg-icons";
library.add(faArrowRight, faBolt, faBookOpen /* … */);
```

With that change the main bundle went from 695 to 174 KB gzip. It's the most cost-effective fix in the whole redesign, and the one that taught me the most: the weight is almost never where you look for it. Measure the real build; don't guess.

## 2. Split what rarely changes, defer what isn't needed on arrival

Next I split dependencies into their own chunks: Vue and its router, GSAP and the icons. They rarely change, so they stay in the browser cache even when I ship a new version of the site. And I stopped loading on arrival what isn't needed on arrival:

- The QR code and the contact modal load when they open.
- The form's sending service used to load only on submit (today the form uses Netlify Forms and doesn't even need a library).
- Images below the first screen use `loading="lazy"` and `decoding="async"`; each case's cover, on the other hand, gets `fetchpriority="high"` because it's an LCP candidate.

Result: initial JavaScript went from one 695 KB file to about 159 KB split across 4 chunks that can be cached independently.

## 3. 3D only where it's seen

The original plan was to use TresJS for the 3D scenes. I changed it: the 3D hero is built with CSS 3D, which weighs nothing and doesn't slow LCP, and the signage demo in the [Wink App](/project/wink-app) case uses three.js directly. TresJS required touching Vue's compiler for a single scene.

And three.js isn't downloaded when you open the case: the demo is an async component that also waits until the scene is 200 px from appearing on screen before importing the library. That's 117 KB gzip only for people who get that far.

```js
// Simplified: three.js is imported when the demo is about to show
const io = new IntersectionObserver(async ([entry]) => {
  if (!entry.isIntersecting) return;
  io.disconnect();
  const { createSignageScene } = await import("@/lib/signageScene");
  createSignageScene(canvas);
}, { rootMargin: "200px 0px" });
io.observe(container);
```

## 4. English, separately

The site is in Spanish and English. The English UI strings and all the English content live in a separate chunk that's only downloaded if the active language is English. Spanish visitors don't pay for the other language.

## 5. The jumping footer: CLS from 0.75 to 0.001

On /projects and the case pages, Lighthouse reported a CLS of 0.75. The cause: while the route chunk loaded, `<main>` was empty, the footer painted at the top and then jumped down when the content arrived.

The fix was one line of CSS: a `min-height` on `<main>`. CLS dropped to 0.001. I told the full story, step by step, in [From 0.75 to 0.001 CLS](/blog/cls-de-075-a-0001). It's a good reminder that code splitting has a cost too: every route that loads separately leaves a moment where the page is half built.

## 6. Images at the size they're shown

Project screenshots were served at their original size everywhere. I generated two WebP variants, 800 and 1600 px wide, and use them with `srcset` and `sizes`; the original is kept only for the full-screen viewer. The home page's weight went from 755 KB to 376 KB.

```html
<!-- Simplified -->
<img
  src="/img/projects/rapisites/cover-1600.webp"
  srcset="/img/projects/rapisites/cover-800.webp 800w,
          /img/projects/rapisites/cover-1600.webp 1600w"
  sizes="(min-width: 1024px) 760px, 100vw"
  loading="lazy" decoding="async" alt="…" />
```

## 7. Animations that don't slow things down

Two more, less visible changes. The hero's role and paragraph stopped fading in with an opacity animation: they were LCP candidates on mobile, and an element that starts invisible delays that metric. And to make home scrolling feel smooth, I removed scroll snapping from the hero and the cards (it fought with GSAP), stopped animating `filter: blur` on scroll, and dropped `backdrop-blur` from surfaces sitting on top of the animated background.

## The numbers, before and after

|  | Perf. mobile | Perf. desktop | Accessibility | SEO | LCP mobile | Weight |
| --- | --- | --- | --- | --- | --- | --- |
| Before | 60 | 93 | 80 | 92 | 6.0 s | 1149 KB |
| After (home) | 90 | 100 | 100 | 100 | 3.2 s | 376 KB |
| After (/projects) | 88 | 99 | 100 | 100 | 3.5 s | 382 KB |
| After ([Wink App](/project/wink-app) case) | 85 | 99 | 100 | 100 | 3.8 s | 298 KB |

<p class="tbl-note">Lighthouse 12.2.1 on the production build. Mobile with default throttling (slow 4G and 4× CPU).</p>

## 8. The blog was eating the budget

My first version of the blog kept each post in a data file the site imported at startup, because the title and excerpt are needed in the menu, the command palette (⌘K), SEO and the sitemap. The problem is that the whole body came along with the title.

I measured it by adding up the gzip size of the scripts `index.html` loads (the entry point and its preloads), with the same method at every step:

| Moment | Initial JS (gzip) |
| --- | --- |
| Before the blog | 167.1 KB |
| Blog with 5 posts | 174.6 KB |
| Blog with 16 posts | 186.0 KB |
| Bodies split out | 171.1 KB |

<p class="tbl-note">Every new post, or every longer post, went straight into the initial load of every page.</p>

With 16 posts there were 14 KB of headroom left, and the plan was to make posts much more detailed. Unless something changed, the blog was going to break the budget of a site most people visit without reading a single post.

The fix was splitting the data in two: a light index in the main bundle, because the menu, the palette and SEO use it, and each post's body in its own file, downloaded only when it's opened. Initial JavaScript went back to 171.1 KB: 4 KB more than before having a blog, instead of 19.

The version that shipped uses the same idea, done better. Each post is a Markdown file that a Vite plugin turns into HTML at build time, with the code already highlighted. The index (title, excerpt, date, topics) comes from a virtual module, and each post's body is its own chunk.

```js
// Simplified: the index comes from a virtual module and each body is a chunk
import { posts } from "virtual:blog";

const bodies = import.meta.glob("/src/content/blog/*/*.md", { import: "default" });

export const loadBody = (post) =>
  bodies[`/src/content/blog/${post.lang}/${post.slug}.md`]();
```

The index isn't free either. With 36 posts across both languages, its metadata is what grew the most in the initial load this week. If the blog keeps growing, that's the next place to look.

## 9. Prerendering and self-hosted fonts

Up to this point, mobile LCP was still between 3.2 and 3.8 s, above the budget's 2.5 s. Two things held it back: Google Fonts, whose CSS blocks rendering, and the site being an SPA: the HTML arrived empty and content was only painted once JavaScript ran.

The two fixes:

- Every route is prerendered to HTML at build time with Vue SSR, and the browser hydrates it instead of building it from scratch. The HTML already carries the content, title, description, Open Graph and structured data.
- Fonts are served from the site itself, only the Latin subset and the weights in use, with `preload` for the two that appear on the first screen. Google Fonts is gone.

To measure this I changed how I run Lighthouse: real applied throttling (`--throttling-method=devtools`) instead of simulated, and the median of three runs. Simulation estimates first paint by adding up everything downloaded before it, including JavaScript that doesn't block rendering, so with prerendered content it gave misleading numbers. That's why the “before” column is the site measured the same way, not the earlier table.

| Page | Perf. before | Perf. after | LCP before | LCP after |
| --- | --- | --- | --- | --- |
| Home | 61 | 71 | 4.2 s | 2.1 s |
| /projects | 59 | 73 | 5.0 s | 2.8 s |
| Blog post | 80 | 80 | 4.0 s | 2.0 s |

<p class="tbl-note">Lighthouse 12.2.1, mobile, devtools throttling (slow 4G and 4× CPU), Spanish browser. CLS ended at 0 everywhere.</p>

There's one effect worth understanding: the home page's TBT went up from about 530 ms to 1.4 s. The site isn't doing more work (total main-thread time dropped from 4.3 to 3.8 s); there's now content painted before JavaScript runs, and TBT only counts what blocks after the first paint.

And one consequence for how I measure: with prerendering, `index.html` also preloads the home page's chunks. Measured the same way as before, the home page's initial JavaScript reached 197.9 KB gzip with 25 published posts: 2 KB from the limit, because every new post added its title and excerpt, in both languages, to the initial load. I moved the excerpts out of the index into a separate module that only the pages showing them load (the home keeps the three it displays), and it went back to 194.7 KB. Now each new post adds about 0.15 KB instead of 0.7.

## What's left

- Hydrating the home page is a single task of about 1.4 s with a 4× slower CPU. With Vue 3.5, whatever is below the first screen can be hydrated lazily.
- English doesn't benefit from prerendering: the prerendered HTML is in Spanish, so in English the content waits for the app to mount. It needs its own English URLs, prerendered in English.
- /projects is at 2.8 s LCP, still above 2.5 s.

I'd rather say it than hide it: a budget exists precisely so you know where you're not there yet.

> My takeaway: a performance budget isn't met once and done. Every new feature puts it to the test, and the only way to find out in time is to measure the real build at every step.
