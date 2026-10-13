---
title: "Everything you can do with RapiSites"
description: "From an AI-generated site to your own domain with HTTPS, CAPTCHA-free forms, two languages, versions and an API for developers: the full tour."
date: 2026-10-12
tags: [rapisites, product, guide]
projects: [rapisites]
cover: /img/projects/rapisites/cover.webp
kind: guide
keyword: "tour"
---

<figure>
  <img srcset="/img/projects/rapisites/cover-800.webp 800w, /img/projects/rapisites/cover-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/rapisites/cover-1600.webp" alt="The RapiSites landing page." loading="lazy" decoding="async" />
  <figcaption>The RapiSites landing page.</figcaption>
</figure>

RapiSites was born with one rule: anyone should be able to publish their website in less than a day, and preferably in minutes. Over time it added more ways to use it, from the AI-generated site to uploading one you already have or creating sites from another system through an API. This is the full tour of what you can do today, with the names you'll see in the panel.

## Your account

- You sign up with your email and a password, or with “Continue with Google”. With Google you skip the verification notice, because Google already confirms your email.
- Verifying your email isn't required to create or publish a site. Only uploading your own files and creating API keys ask for it.
- If you forget your password, “Forgot your password?” sends you a link that expires in one hour. When you pick a new one, your other open sessions are signed out.
- Two-step verification is optional: in Settings → “Two-step verification” → “Turn on”, you scan the QR code with your authenticator app, confirm with the 6-digit code and save the recovery codes. Each one works only once, in case you lose your phone.
- If you only signed in with Google, you can create a password in Settings to sign in with email as well.

## Creating a site, two ways

Everything starts at “Create site”, in the Sites list. The main path is the four-question assistant: your business name, what it does (two or three lines), how a customer reaches you and which style you like. With that, RapiSites asks Anthropic's Claude API for the content, picks photos that fit your industry and builds a complete site, with pages, copy and SEO, in a few seconds. The AI doesn't make up prices, names or figures: where a fact like that is missing it leaves “To be defined” for you to fill in.

<figure>
  <img srcset="/img/projects/rapisites/01-800.webp 800w, /img/projects/rapisites/01-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/rapisites/01-1600.webp" alt="The assistant's four questions." loading="lazy" decoding="async" />
  <figcaption>The assistant's four questions.</figcaption>
</figure>

The second path is the technical one and sits in a link below the first question: “Already have your site in HTML, CSS and JS? Upload your files”. It's for anyone who already has their website, made with another AI tool, by hand or built with Vite, React, Vue or Astro. It's on the Pro and Business plans and has its own section further down.

<figure>
  <img srcset="/img/projects/rapisites/02-800.webp 800w, /img/projects/rapisites/02-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/rapisites/02-1600.webp" alt="A site generated with RapiSites for a restaurant." loading="lazy" decoding="async" />
  <figcaption>A site generated with RapiSites for a restaurant.</figcaption>
</figure>

## The editor

A generated site is polished in the editor, which you open with “Open editor” from the site's menu. It has three columns: on the left the page's sections, in the middle a preview that updates as you edit and on the right the properties of the selected section.

- It saves on its own: the editor shows “Saving…” and then “Saved”. Everything goes into a draft only you can see.
- “Undo” (Ctrl+Z) and “Redo” (Ctrl+Shift+Z), on any change: moving a section, editing text, deleting something.
- You reorder by dragging sections in the left column, or with “Move up” and “Move down”. Each section also has “Duplicate” and “Delete”.
- “Add section” opens the catalog with a live preview of each section, already in your site's colors. It's inserted with sample content, never empty.
- Pages are managed from the pages menu: “Create page”, renaming, duplicating or deleting it (the home page can't be deleted) and the “Show in the site menu” switch.
- “Change the theme” opens a panel with the brand color, the typeface and the personality (more sober, warmer, more technical). Whatever color you choose, RapiSites adjusts the shades so the text stays readable, at the AA accessibility level.
- Every image has three options: “Upload image”, “Choose from library” (everything you've uploaded lives in Media) and “Search photos”, which searches free Pexels stock photos without leaving the editor. Photos are processed automatically: several sizes and modern formats, with no manual optimization.
- Alt text is required for every image: screen readers and search engines use it.

## 57 sections, zero JavaScript

The catalog has 57 components: heroes, about (text with image, stats, timeline), features, catalog (cards, carousel, comparison, menu, price list), pricing plans, stats, team, testimonials, gallery, FAQ, calls to action, contact (form, details, WhatsApp), plus the navigation and the footer, which belong to the site rather than to each page. None of them loads JavaScript on the public site, not even the ones with a form: it's a native form, which works even if the visitor has scripts turned off or a bad connection.

<figure>
  <img srcset="/img/projects/rapisites/03-800.webp 800w, /img/projects/rapisites/03-1600.webp 1600w" sizes="(min-width: 768px) 768px, 100vw" src="/img/projects/rapisites/03-1600.webp" alt="Another generated site, this time for a photo studio." loading="lazy" decoding="async" />
  <figcaption>Another generated site, this time for a photo studio.</figcaption>
</figure>

## Publishing, with a review and versions

Editing and publishing are two separate things. When you click “Publish”, RapiSites checks the site before putting it online:

- It blocks whatever would leave the site broken or poorly indexed: “An image is missing its alt text…” or “The page … has no title”. You see “Check this before publishing” and a “Go there” button that takes you to the section.
- It warns, without stopping you, about what could be better: a pending fact (“There's a pending fact to fill in…”), a sample review you didn't replace, a title or meta description that's too long, or a half-translated language.
- Publishing is all or nothing: if something fails midway, you're never left with a half-published site.
- If it goes well, you see “Your site is live!”, with any warnings, and the “View published site” button. From the site's menu you also have its “QR code”.
- If you edit afterwards, the list shows “Unpublished changes” until you publish again.

Every publish is saved. “View history” lists the versions, with the live one marked as “Current version”, and “Restore” puts any of them back online and in the editor too. If you have unpublished changes, it warns you before discarding them. No version is ever deleted.

## Your address and your domain

From the moment you create it, your site has a free address like `yourbusiness.rapisites.com`, taken from the business name and served over HTTPS. On the paid plans you can connect your own domain from “Domains”:

- You choose “I already have a domain” or “I need to buy one”.
- If you don't have one, RapiSites checks whether the name looks available (it's a hint, not a guarantee) and shows you where to buy it: Cloudflare Registrar, Namecheap or GoDaddy. Then you connect it with “I bought it, connect it here”.
- If you already have one, you pick your provider (Cloudflare, Namecheap, GoDaddy or “Another provider”) and it gives you the exact steps for that provider: the two records to create, an `A` and a `CNAME` for `www`, with buttons to copy each value. On Cloudflare it shows you how to leave the record as “DNS only”.
- You click “Connect domain” and RapiSites checks on its own every minute, or when you click “Verify now”. The statuses are “Not set up yet”, “Verifying”, “Check the DNS” and “Active”.
- Once the domain is active, the HTTPS certificate is issued automatically. You can “Make primary” whichever domain you want, and your `.rapisites.com` address keeps working and leads to the primary one.
- If you get stuck, “Write to us and we'll help” notifies an advisor with your site and your domain, without you having to write anything else.

## Forms and messages

Four section variants come with a contact form: the contact one, two heroes and a call to action. If you entered an email in the assistant, your site is born with one. What people write reaches you in two places:

- “Messages”, in the panel, gathers the messages from all your sites, with an unread count and a per-site filter if you have several. Each message shows who wrote, when and from which site, and has a “Reply” button.
- Your email: every submission is forwarded to you, with the visitor's email as “reply-to”, so you answer in one click.
- No CAPTCHA: visitors don't have to prove they're not a robot. RapiSites filters behind the scenes with a trap field, a per-IP limit and a signed token that catches submissions sent too fast. Spam is kept, because nothing is deleted, but it isn't forwarded to you, and doubtful messages carry the “Suspicious” label.
- Each plan forwards a number of messages by email per month. Past the cap, messages are still saved in the inbox: only the email notice stops.

## Two languages

Your site is born in one language and, from “Languages” in the site's menu, you can add English with “Add language”. The AI translates all the content in the background; automatic labels, like the form fields, come already translated. English lives under `/en/`, the site shows a language switcher and search engines get the right `hreflang` tags. You can fix any translated text in the editor and remove the language whenever you want: the translations aren't deleted. Today the available languages are Spanish and English; Free allows one language per site, Pro up to three and Business unlimited.

## SEO comes done

- A single main heading (`h1`) per page, placed by the system.
- `sitemap.xml` and `robots.txt` generated automatically.
- Structured data for your business, such as `LocalBusiness` in the contact section or `FAQPage` in the FAQ.
- Canonical links and, with two languages, `hreflang`.
- Social preview: if you didn't upload a sharing image, RapiSites generates one with your site's name.
- The pre-publish review watches titles, descriptions and alt text.

## Sites made of your own files

On Pro and Business you can publish a site you already built in HTML, CSS and JS. You drag the folder (or a single `.html`), RapiSites tells you how much it weighs before uploading anything, reviews it and shows you a preview of the draft before publishing. There's a report with what blocks (server code like `.php`, file types that aren't allowed, pages not saved as UTF-8) and what only warns (missing files, paths on your computer, no `<title>` or viewport). It detects the home page and build folders like `dist`, and by default the site only uses its own files, unless you allow it to connect to other sites.

These sites live at `yoursite.rapisites.app`, carry the “Own files” badge and have no editor: to change them you upload the site again with “Update files”, and only the files that changed take up space. They have history and “Restore”, custom domains, a download for every published file and options of their own: single-page application, connecting to other sites, “Let Google find it” and being shown only inside another page. The limits are 500 files and 20 MB per upload, and .zip files aren't accepted yet. The step-by-step guide is in the post “Build your website with AI and publish it on RapiSites”.

## An API for integrators

If you have your own system and want to create and publish sites on behalf of your clients, RapiSites has a public API at `api.rapisites.com/v1`, documented at rapisites.com/desarrolladores. [Wink](/project/wink-app), for example, uses it as an integrator.

- Requirements, all from Settings → API: a verified email, a Pro or Business plan, accepting the API terms and an abuse contact. The “Create key” button tells you which one you're missing.
- The key is shown only once, when you create it. You give it a name and a scope, and confirm with your password.
- With it you create a site by uploading its files, update it, get a preview of the draft to show before publishing, publish or unpublish, list its versions, roll back to a previous one and copy a site without uploading anything again.
- You can connect your own base domain with a single wildcard DNS record, so every site you create through the API gets its address under your domain without touching DNS again.
- The cap is 60 requests per minute per key, and retries are safe with the `Idempotency-Key` header.

## Plans

|  | Free | Pro | Business |
| --- | --- | --- | --- |
| Sites (and sites with the AI assistant) | 1 | 3 | 10 |
| Custom domain with automatic HTTPS | No: subdomain on rapisites.com | Yes | Yes |
| “Made with RapiSites” in the footer | Yes | No | No |
| Form messages forwarded per month | 20 | 500 | Unlimited |
| Storage | 100 MB | 2 GB | 10 GB |
| Languages per site | 1 | 3 | Unlimited |
| Upload a site you already have | No | Yes | Yes |
| Public API | No | Yes | Yes |
| Base domains for the API | — | 1 | 3 |
| Monthly price | Free | US$11.99 | US$39.99 |
| Yearly price | Free | US$119.90 | US$399.90 |

<p class="tbl-note">Prices in US dollars. Paying yearly costs the same as ten months: two months free.</p>

The Free plan has no cost and doesn't expire. To move to a paid plan, you pick the plan and the period, monthly or yearly, make a bank transfer with the reference code the panel gives you and upload the receipt; once it's verified, the plan becomes active and you get an email. You can pay in lempiras at the day's exchange rate. Downgrading doesn't involve a payment and takes effect when the period you already paid ends. If a plan expires unpaid, there's a grace period, then the account goes read-only with the site still online and, after about a month, the site stops being shown until you catch up. None of these steps deletes your content.

> The core idea hasn't changed: anyone should be able to publish their website in less than a day, and preferably in minutes. Everything else —the editor, the domain, the languages, your own files, the API— is there for after that first site is live.
