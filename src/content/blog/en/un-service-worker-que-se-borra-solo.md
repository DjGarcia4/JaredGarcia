---
title: "A service worker that deletes itself"
description: "For a screen to keep working offline, service workers had to be allowed on third-party sites. The problem is they survive everything. The emergency exit I built."
date: 2026-10-12
tags: [offline, security, rapisites]
projects: [rapisites]
kind: learning
keyword: "service worker"
---

[Wink](/project/wink-app) plans to build its own HTML apps (weather, daily menu, queue numbers), upload them to RapiSites through the API and show them on signage screens: a Raspberry Pi running Chromium, on all day, that paints each app inside an `<iframe>` in its player. When Wink mapped that case against what RapiSites allowed, its request ran into a rule: service workers were forbidden on uploaded sites. Without a service worker, a screen that loses internet goes blank.

## First: what a service worker is

A service worker is a JavaScript file a site hands to the browser so it stores it and runs it separately from the page. It doesn't draw anything or touch the HTML: it sits between the page and the network, like a middleman living inside the browser. Every time the page requests something (the HTML, an image, a script), the request goes through it first, and it decides what to answer: go to the internet, take it from its own cache, or build a response.

That position is what lets a site work without internet. If, while there's a connection, the service worker stores a copy of the app's files, then when the connection drops it can answer with that copy. To the page there's no difference: it asked for its HTML and got its HTML.

- Registration: the page tells the browser “this is my service worker” with `navigator.serviceWorker.register()`. It only works over HTTPS (or on `localhost`) and controls the pages from its folder down.
- Install (`install`): the moment to cache the files the app needs to start on its own: the HTML, CSS, JavaScript, fonts and icons.
- Activate (`activate`): the new service worker takes control, and it's the moment to delete caches from old versions.
- Intercept (`fetch`): from then on, every request from the page goes through it. That's where the strategy is decided: network first and cache if it fails, or cache first and network to refresh.

```js
// In the page (simplified)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

// sw.js (simplified): cache on install, answer without network
const CACHE = "app-v1";
const FILES = ["/", "/index.html", "/app.js", "/app.css"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  );
});
```

On a signage screen that's exactly what's needed. The player reloads the app every time it changes scenes, sometimes every few seconds. If the store has lost internet at that moment, an app without a service worker doesn't load and the screen goes black. With a service worker, the cache answers the reload and the screen keeps showing the menu or the queue as if nothing happened.

One detail matters for the rest of this post: the service worker doesn't die when the tab closes. It stays registered in the browser, with its cache, and wakes up again the next time someone opens the site. The browser checks for a new version of the script when the page registers it and, at most, every 24 hours. That persistence is what makes it useful offline, and also what makes it dangerous.

The ban had a good reason. A service worker lives in the visitor's browser and survives almost anything: if a site is taken down or blocked for abuse, its service worker can keep serving the saved page. On a phishing site, that means keeping a fake page alive after blocking it.

## Three rules that clashed

[Wink](/project/wink-app)'s request, from October 8, didn't only touch service workers. It touched three decisions I had made a week earlier, when I opened RapiSites to sites made of the client's own files:

- Service workers were forbidden: every request for the script got a `403`.
- The HTML of an embed-only site went out with `no-store`, and everything else with `max-age=60`. In [Wink](/project/wink-app)'s scenario, every scene change (every 10 to 60 seconds) would request everything from the server again.
- The network mode was all or nothing: either the site used only its own files, or it could call any host. And strong access control, a signed token that expires, wasn't built.

Reviewing the Cloudflare zone for `rapisites.app` also turned up a problem that didn't come from the request: the \*Browser Cache TTL\* was set to 4 hours and overrode the server's `max-age=60`, and some Cloudflare options were modifying the HTML of uploaded sites (like obfuscating emails or rewriting links to HTTPS). That was fixed in the zone, with no code: respect the origin's headers and leave the HTML alone.

## Allow them, with an emergency exit

The solution, written down as decision 035, was to allow them under three conditions. Only when the site asks with `offline: true`, an option that's frozen on publish, like the network mode. Only on sites that aren't public: those with `access_mode` `embed_only` (only served inside an iframe) or `key` (which also require a key). And never on the preview, because its address expires. On a public site, a service worker would live in any visitor's browser, which is exactly the phishing case.

And above all, an emergency exit: whenever the service worker script can't be served, the browser receives one that uninstalls itself. It deletes its caches, unregisters itself and reloads the pages it controlled, which this time go to the network and see what the server responds now.

```js
// The emergency service worker (simplified)
self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) await caches.delete(name)
    const pages = await self.clients.matchAll({ type: "window" })
    await self.registration.unregister()
    for (const page of pages) page.navigate(page.url)
  })())
})
```

The order matters: the controlled pages are fetched before unregistering, because afterwards there's no one left to ask. And `skipWaiting()` means the replacement doesn't wait for the tabs to close, which on a screen that's on all day would be never.

## Who gets what

The browser requests a service worker script with the `Service-Worker: script` header. A page can't fake it or remove it: the browser controls it. With that, the server decides:

| Situation | What the browser receives |
| --- | --- |
| Site live, with `offline: true`, in `embed_only` or `key`, and the script exists in the published version | The real script, with `private, no-cache` and `Service-Worker-Allowed: /` |
| Site without `offline` | The one that uninstalls itself |
| Public site or preview | The one that uninstalls itself |
| Site blocked, taken down, unpublished or unpaid | The one that uninstalls itself |
| The new version no longer ships that file, or it isn't a script | The one that uninstalls itself |

<p class="tbl-note">Only one case serves the client's script. All the others switch it off.</p>

```ts
// The decision on the server (simplified)
const allowsServiceWorker = (site) =>
  site.offline && !site.isPreview && ["embed_only", "key"].includes(site.accessMode)

if (request.headers["service-worker"] === "script") {
  if (site.state !== "live" || !allowsServiceWorker(site)) return killSwitch()
  const file = resolve(site, request.path)
  if (!file || !isJavaScript(file)) return killSwitch()
  return serve(file, { "cache-control": "private, no-cache", "service-worker-allowed": "/" })
}
```

`Service-Worker-Allowed: /` goes on both: without it, a service worker registered with scope `/` from a script inside a folder couldn't be replaced by the emergency one. And the emergency one goes out with `no-store`.

## Why a 403 didn't work

The original rule responded with an error. It looked like the safest option. But if the browser can't update the service worker, it keeps the previous one and everything it saved. A `403` doesn't switch anything off: it freezes what was there. A blocked site kept showing from the cache. To switch a service worker off, you have to send it another one that switches itself off.

This works because the browser requests the script again every time the page calls `register()`, and also at most every 24 hours, bypassing its own cache. So the switch arrives on its own, without anyone touching the screen.

I tested it in real Chromium: a service worker that was serving the page from the cache ended up with zero registrations and zero caches after receiving the emergency one. And a page registering it for the first time doesn't get into a reload loop: it isn't controlled by any service worker yet, so it doesn't reload.

There's a side effect I like: a site that used to register a service worker without asking for `offline` no longer sees a `register()` that fails. Registration works and the service worker uninstalls itself. No site is left with a live one.

## The cache that almost ruined it

The code review found a gap. Cloudflare caches by URL and ignores the `Service-Worker` header. Without a specific rule, the script could come out of the edge cache (up to a year, on the paths the site marks as immutable) and the server would never get to decide. A blocked site wouldn't find out, and a public site could install a real service worker if someone pre-warmed the cache with the same file.

The zone now has a Cache Rule that doesn't cache any service worker script request, created and verified on October 8:

```text
# Cloudflare → Caching → Cache Rules (rapisites.app zone)
Expression:  any(http.request.headers["service-worker"][*] == "script")
Action:      Bypass cache
```

The same review asked for the billing sweep to also purge the edge when it unpublishes an account's sites for non-payment, and when it reactivates them. Otherwise, an unpublished site could keep coming out of Cloudflare's cache.

## What came in the same package

The service worker was the most delicate piece, but decision 035 resolved the other two clashing rules as well.

- Per-instance access keys (`access_mode: "key"`): like `embed_only`, and on top of that the page is only served with a `?k=<key>` for that site. One key per screen, no expiry, revocable through the API. Only its SHA-256 is stored, and revoking takes effect in under a minute.
- Immutable paths (`immutable_paths`): explicit per-site patterns, like `assets/*`, frozen on publish and served with `max-age=31536000, immutable`. A page is never immutable.
- A Cloudflare purge per host whenever what that host serves changes (publish, roll back, unpublish, block, take down), in batches and without blocking the publish.
- An in-memory cache of small files (up to 256 KB) by their `sha256`: it's never invalidated, because the content is the name.
- A third network mode, `allowlist`: like self-contained, plus a list of up to 20 `https://` origins for data, images, fonts and media. Scripts and styles are still only the site's own.

Two of those pieces have a rejected option behind them. For access, I ruled out the signed token that expires: the address lives for months in the screen's layout, which has to boot without network, and an expired token would just leave screens black without anyone doing anything. The key isn't a strong secret (it stays on the screen, in [Wink](/project/wink-app)'s system and in logs); it's a second layer against a copied address. For caching, I ruled out guessing which files are immutable from a hash in the name: a wrong guess leaves a file in the browser for a year, and purging the edge doesn't fix it.

And one that didn't change: the HTML of embed sites is still `no-store`. I considered making it cacheable with `stale-if-error`, but Chromium doesn't implement it in its cache, so it wouldn't have given offline behavior. That's what the service worker is for.

## What's still open

There's one limit that has to be said out loud: a screen without network keeps showing what it saved even if the site has been blocked, until it gets network back. The switch can't reach it there. [Wink](/project/wink-app) accepted it.

All of this was merged into `main` on October 8 (PR #69), with four migrations and two new variables for purging. The Cloudflare zone changes and the Cache Rule are already in place; deploying the new image, according to the docs, is still pending. The deploy plan has its own rollback, and its consequence is written down too: if I go back to the previous image, a site with `offline` gets a `403` on the script again, and whatever a screen has already saved stays there until the next deploy. And [Wink](/project/wink-app)'s apps aren't on screens yet: they're waiting for Wink to finish its side.

## What I'd tell someone hosting other people's code

- Answering a service worker with an error doesn't uninstall it. It freezes it with everything it had.
- If you allow something that survives in the visitor's browser, first build how to switch it off, and make it apply on its own.
- The decision about which script the browser gets has to always reach the server. Check that no intermediate cache makes it for you.
- Don't guess what's immutable. Have it stated explicitly, because a mistake there lasts a year.
- Write down the limit you can't close and share it with whoever is going to use it.

> What I take away: before forbidding something dangerous, ask yourself whether the thing you're afraid of can be switched off. If it can, sometimes building the switch is enough.
