---
title: "Build your website with AI and publish it on RapiSites"
description: "Two paths: let RapiSites generate it from four questions, or upload the one you already made with another AI, by hand or with Vite. Step by step, with what to check first."
date: 2026-10-12
tags: [rapisites, ai, guide]
projects: [rapisites]
cover: /img/projects/rapisites/01.webp
kind: guide
keyword: "guide"
---

There are two ways to get your website on RapiSites with help from AI. If you don't have anything yet, RapiSites generates it from four questions. If you already built it —with an AI tool, by hand, or with Vite, React, Vue or Astro—, you upload the folder and it's published as is. This guide covers both paths, step by step.

<figure>
  <img srcset="/img/projects/rapisites/01-800.webp 800w, /img/projects/rapisites/01-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/rapisites/01-1600.webp" alt="The four questions in the RapiSites assistant." loading="lazy" decoding="async" />
  <figcaption>The four questions in the RapiSites assistant.</figcaption>
</figure>

## Which path is right for you

|  | Path 1: the assistant | Path 2: upload your files |
| --- | --- | --- |
| Who it's for | Any business, no technical knowledge needed | Anyone who already has their site in HTML, CSS and JS |
| Plan | All of them, Free included | Pro and Business |
| How you change it | In the RapiSites editor | You edit your files and upload them again |
| Contact form, languages, stock photos | Included | Not applicable: what you bring is what gets published |
| Free address | yourbusiness.rapisites.com | yoursite.rapisites.app |

<p class="tbl-note">Both end in a published site, with version history and the option to connect your own domain.</p>

## Path 1: let RapiSites generate it

All you need is an account, which you can create with your email or with “Continue with Google”. You don't need copy, photos or a domain.

- 1. In the Sites list, click “Create site” (or “Create my first site” if you don't have one yet).
- 2. Business name: the one your visitors will see, between 2 and 80 characters. Your `.rapisites.com` address comes from it.
- 3. What your business does: two or three lines in your own words, between 20 and 600 characters. This question matters most: the AI writes the copy for every section from it.
- 4. How a customer reaches you: Phone, WhatsApp, Email and Address. All are optional, but you need at least one. If you add an email, your site is born with a contact form.
- 5. Pick a style and click “Create my site”.
- 6. Wait a few seconds on “Creating your site”, while “Understanding your business…”, “Writing your content…” and “Fine-tuning the SEO…” go by.

RapiSites asks Anthropic's Claude API for the content, picks photos that fit your industry and assembles the pages from pre-designed sections. The AI doesn't make up prices, people's names or figures like “15 years of experience”: where a fact like that is needed, it leaves a “To be defined” marker. That's why it pays to put the real facts you want to see in the second question: your city, what you offer, how long you've been in business.

When it's done, you see the draft. To polish it, open the site's menu and choose “Open editor”: you change copy and photos, reorder sections by dragging them and try other colors with “Change the theme”. Everything saves on its own and nothing goes public until you publish.

When you click “Publish”, RapiSites checks the site. Anything that blocks, like “An image is missing its alt text…”, stops the publish and shows “Check this before publishing”, with a “Go there” button. Anything that only warns, like a “To be defined” marker, doesn't stop you. If all goes well, you see “Your site is live!”.

## Path 2: upload the website you already made

This is the answer to “I asked an AI to make my page, I have the file, where do I put it?”. It also works if you built it by hand or if your project has a build step. You need the Pro or Business plan, a verified email and a free site slot on your plan.

## What to ask your AI tool for

Most problems are avoided by asking for the right output from the start. RapiSites needs:

- A static site: HTML, CSS, JavaScript, images, fonts, audio and video. No PHP, Python, server code or database.
- An `index.html` as the home page. If it's a single page, the simplest option is to have everything inside that file.
- Relative paths (`img/logo.png`), never `C:\Users\…` or `file://`, and every file the HTML names included in the folder.
- A `<title>` and `<meta name="viewport">`, so it looks right on a phone.
- If you want it to depend on no one, no fonts or libraries from other sites. If it needs them, that's possible too (see below).
- Files in UTF-8, the default in any current tool.

An example request to get the site as a single file, ready to upload:

```text
Example request (adapt it to your business):

Make me a one-page website for my bakery in San Pedro Sula.
Deliver it as ONE single index.html file, self-contained:
- CSS inside <style> and JavaScript, if needed, inside <script>;
- no fonts, libraries or images from other sites: use system fonts
  and leave placeholders for the photos;
- with <title>, <meta name="viewport"> and UTF-8 encoding;
- no PHP: contact can be a WhatsApp or mailto link.
Sections: hero, products, opening hours and contact.
```

If the site has its own photos or several pages, ask for a folder with relative paths:

```text
my-bakery/
├── index.html
├── products.html
├── css/
│   └── styles.css
└── img/
    ├── logo.svg
    └── hero.webp
```

The folder wrapping everything (`my-bakery/`) is stripped automatically, and hidden files, `.DS_Store`, `Thumbs.db` and `node_modules` are left out and never uploaded.

## If your project uses Vite, React, Vue or Astro

- Build (for example with `npm run build`) and upload the folder it generates, usually `dist` or `build`.
- If you upload the project folder, RapiSites looks for a build folder with an `index.html` (`dist`, `build`, `out`, `public` or `_site`) and offers “Use the dist folder”.
- If you upload the source code without building, it warns you: “This looks like your project's source code. Upload the folder it generates when you build: usually `dist` or `build`.”
- If it's a single-page application with its own router, turn on “It's a single-page application” afterwards: that way `/contact` opens your home page instead of returning a 404.

## Step by step in RapiSites

- 1. Click “Create site” and, below the first question, open “Already have your site in HTML, CSS and JS? Upload your files”.
- 2. In “Upload your site”, drag the folder or use “Choose folder” or “Choose .html file”.
- 3. Before anything is uploaded, you see how many files there are, how much they weigh and how much storage you have left. The “Site name” comes from your page's `<title>`; only you see it and you can change it.
- 4. Click “Upload and review”.
- 5. If something blocks, you see “Your site needs an adjustment”. Many cases are solved right there with a button; the rest, with “Choose other files”.
- 6. If it passes, you reach “Review your site”: draft preview, name, “Address” (what goes before `.rapisites.app`, editable until you publish), detected home page and warnings.
- 7. Click “Publish site”, or “Keep as draft” to publish it later.

## How the home page is chosen

- The `index.html` at the root (or an `index.htm`). If there's a single `.html` at the root, that one, whatever its name.
- If there are several and none is `index.html`, RapiSites asks you: “Which one is your home page?”.
- If there's none at the root but there is one in a build folder, it offers to use that folder.

## The report: what blocks and what only warns

An error stops you from publishing until you fix it; a warning doesn't, but it's worth reading. The messages name the specific file.

| Blocks | What RapiSites tells you |
| --- | --- |
| Server code | “Your site includes server code and we only publish static sites here: `contact.php` won't work.” |
| File type not allowed | “We can't publish `…`. Remove those files and upload the folder again.” |
| HTML not saved as UTF-8 | “`index.html` isn't saved as UTF-8. Save it with that encoding and upload it again.” |
| Files that differ only in case | “`Logo.png` and `logo.png` differ only in upper/lower case. Keep one of them.” |
| Resources from other sites, with the option off | “Your site loads resources from or sends data to `fonts.googleapis.com`. It's currently set to use only its own files.” |

| Only warns | What RapiSites tells you |
| --- | --- |
| A missing file | “We didn't find `img/logo.png`, which `index.html` uses.” |
| A path on your computer | “`index.html` looks for a file at `C:\…`. That path only exists on your computer.” |
| No title | “`index.html` has no `<title>`: the browser tab will show the address.” |
| No viewport | “`index.html` has no `<meta name="viewport">`: on a phone it will look tiny.” |
| A file over 5 MB | “`video.mp4` weighs …: it will take a while to load.” |
| Data in the browser | “… stores data in the browser. That data lives on each device: it isn't shared or backed up.” |
| Single-page application | “This looks like a single-page application. If it handles its own addresses, turn that option on so a direct address doesn't return a 404.” |

<p class="tbl-note">With no warnings, the review says “Your files passed the review with no warnings.”</p>

## The network switch

By default, an uploaded site only uses its own files: it doesn't load anything from other domains or send data elsewhere. If your page uses Google Fonts, a library from a CDN or an embedded map, the review blocks it and offers “Allow it to connect to other sites”: the upload runs again with the option on and the block becomes a warning. You change it later under “Options”, with “Can connect to other sites”; it takes effect when you publish.

## Limits

| What | Limit |
| --- | --- |
| Files per upload | 500 |
| Size per upload and per file | 20 MB (warning from 5 MB per file) |
| Total storage | 2 GB on Pro, 10 GB on Business |
| File types | HTML, CSS, JS, JSON, XML, text, PDF, WebAssembly, images (svg, png, jpg, webp, avif, gif, ico), fonts (woff, woff2, ttf, otf), audio and video (mp3, ogg, wav, m4a, mp4, webm) |
| .zip files | Not yet: unzip it and drag the folder |

## The site's page

An uploaded site carries the “Own files” badge and has no editor. Its menu opens “Files and options”:

- Files: what's live, with each file's size and a “Download” link.
- Options: “It's a single-page application”, “Can connect to other sites”, “Let Google find it” (off by default: until you turn it on, the site asks not to be indexed) and “Only shown inside another page”.
- “View history” and “Domains”.
- Status: “Unpublish” (the files stay) or “Delete” (frees a slot on your plan).

## Updating, history and rolling back

- 1. Edit your files, or ask your AI tool for the change.
- 2. Click “Update files” and upload the complete site again. What's live doesn't change until you publish.
- 3. The review tells you what changes (“3 new files · 5 changed · 1 no longer there”) and how much space it uses: only the files that changed take up space.
- 4. Click “Publish changes”.

Every publish is kept in “View history”, and “Restore” puts a previous version's files back online. If old versions take up too much, “Free up space”, on the plan card in Settings, purges what's no longer in use, without touching what's live or your drafts.

## Connecting your domain

- 1. Open “Domains” and choose “I already have a domain” or “I need to buy one”. If you don't have one, RapiSites tells you whether the name looks available and where to buy it.
- 2. Pick your provider (Cloudflare, Namecheap, GoDaddy or “Another provider”) and type the domain, without “www” or “https://”.
- 3. Create the two records it shows you, with copy buttons: an `A` for the domain and a `CNAME` for `www`. On Cloudflare, it must say “DNS only”.
- 4. Click “Connect domain”. RapiSites checks on its own every minute and, once the status turns “Active”, issues the HTTPS certificate.

If you get stuck, “Write to us and we'll help” notifies an advisor. And if your uploaded site should show up on Google, turn on “Let Google find it”.

## Common problems

| Problem | What you see | How to fix it |
| --- | --- | --- |
| You uploaded a .zip | “We don't accept .zip files yet. Unzip it and drag the folder.” | Unzip it and drag the folder. |
| The upload won't open | “Available on the Pro and Business plans” | Move to Pro or Business from “See plans”. |
| Unverified email | “Verify your email to upload a site” | Open the link you got when you signed up or request a new one. |
| The AI made a PHP form | “Your site includes server code…” | Ask it for a WhatsApp or `mailto:` link. |
| Fonts don't load | “Your site loads resources from or sends data to …” | “Allow it to connect to other sites”, or ask the AI not to use external resources. |
| Broken images | “We didn't find `…`, which `…` uses.” | Add the file or fix the path (case included) and upload again. |
| An internal address returns a 404 | Single-page application warning | Turn on “It's a single-page application” and publish. |
| Not enough space | “Your site needs … and you have … left. Free up space or upgrade your plan.” | “Free up space” or “Upgrade plan”. |
| Too big | “Your site weighs … and for now the maximum per upload is 20 MB.” | Compress heavy images and videos. |
| Another upload in progress | “There's already an upload in progress. Try again in a few seconds.” | Wait a few seconds. |

## Plans

The assistant works on every plan, once per site: Free includes one site on `.rapisites.com`, with “Made with RapiSites” in the footer. Uploading your files and connecting your domain are for the paid plans: Pro (3 sites, 2 GB, US$11.99 a month) and Business (10 sites, 10 GB, US$39.99 a month). Prices in US dollars; paying yearly costs the same as ten months.

> If you want your site today without touching code, use the assistant. If you already have the website, ask your AI for an `index.html` with relative paths and no server code, upload it, and the review tells you the rest.
