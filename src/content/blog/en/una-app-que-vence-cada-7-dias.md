---
title: "An app that expires every 7 days"
description: "Hace Cuánto lives on my iPhone signed with a free Apple account, which stops it from opening after 7 days. How the app knows when it expires, and how the Mac renews it on its own every night over Wi-Fi."
date: 2026-10-19
tags: [ios, automation, xcode, hacecuanto]
projects: [hacecuanto]
kind: learning
keyword: "7 days"
---

Hace Cuánto is a native app that only I use for now, installed from Xcode with a free Apple account. That account has a rule you can't negotiate: **the signature lasts 7 days**. On the eighth day, the app won't open. The data isn't lost, but you have to plug the iPhone into the Mac and install it again.

A habit that breaks because the app didn't open is exactly what can't happen in a habit app. So I solved the problem in two parts: the app knows when it expires, and the Mac renews it without me having to remember.

## The date is inside the app

When Xcode installs the app, it puts the profile it was signed with inside the bundle: `embedded.mobileprovision`. It's a signed file (CMS), but in the middle it carries a plain-text plist, and that plist has `ExpirationDate`. No API needed: you just look for the XML inside the bytes.

```swift
enum AppExpiration {
    static let date: Date? = {
        guard let url = Bundle.main.url(forResource: "embedded", withExtension: "mobileprovision"),
              let data = try? Data(contentsOf: url),
              let start = data.range(of: Data("<?xml".utf8)),
              let end = data.range(of: Data("</plist>".utf8)) else { return nil }
        let plistData = data.subdata(in: start.lowerBound..<end.upperBound)
        let plist = try? PropertyListSerialization.propertyList(from: plistData, format: nil) as? [String: Any]
        return plist?["ExpirationDate"] as? Date
    }()
}
```

With the date, the app does two things:

- **A notification the day before, at 7 p.m.**: “Hace Cuánto expires tomorrow. Connect your iPhone to the Mac and reinstall it. Your data won't be lost.”
- **A red strip on the home screen** when two days or fewer are left. Tapping it opens settings, where you can see the exact date.

If the app is installed some other way (for example, from the App Store someday), the file doesn't exist, `date` is `nil` and none of this shows up. There's nothing to remember to remove.

## The Mac renews it on its own

The warning helps, but ideally I wouldn't have to do anything. The Mac already has everything it needs to renew: Xcode generates a new profile when the old one isn't there, `xcodebuild` builds and `devicectl` installs on the iPhone, **even over Wi-Fi** if they're on the same network.

The `renovar.sh` script runs every night at 9:30 p.m. and does this:

1. **Is the iPhone there?** If it doesn't show up as connected or available, it exits without doing anything. It tries again tomorrow.
2. **Copy the backup.** The app saves a daily JSON backup inside its App Group; `devicectl` copies it to a folder on the Mac. The last 60 are kept.
3. **How many days are left?** It reads Xcode's profiles with `security cms -D`, finds the app's and pulls its `ExpirationDate` with `plutil`.
4. **If 3 days or fewer are left**, it deletes the old profiles so Xcode generates a new one, builds in Release and installs.

```bash
if [ "$FORCE" = 0 ] && [ "$days_left" -gt "$RENEW_WHEN_DAYS_LEFT" ]; then
    log "Todavía no hace falta renovar."
    exit 0
fi
```

Renewing with a 3-day margin, and not on the last day, leaves several nights to retry: if one night the iPhone was away from home or locked and the install failed, the next night tries again.

## The less obvious detail: the Documents folder

The project lives in `~/Documents`. Running the script by hand from there works; from `launchd`, not necessarily. macOS protects Documents, Desktop and Downloads (TCC), and a background task doesn't have permission to read them even if I'm the one who scheduled it.

The fix was not to ask for more permissions than needed: **a mirror copy of the project** outside Documents, in `~/Library/Application Support/HaceCuanto/src`. There are two entry scripts:

- `instalar-nocturno.sh` syncs the copy with `rsync`, writes the LaunchAgent's `.plist` and registers it with `launchctl bootstrap`. It runs once.
- `reinstalar.sh` syncs the copy and forces a reinstall right now. I use it when I change something in the app.

The nightly task only touches the mirror copy, so it never needs to go into Documents.

## What I learned

- **The information is often closer than it looks.** Before I thought about saving the install date, the profile already carried the exact expiration date.
- **A task that runs on its own has to fail well.** Each step writes to a log with date and time, and every failure ends in “it'll retry next time”, not in a half-done state.
- **Back up before touching anything.** The backup is copied in step 2, before deleting profiles or reinstalling. If something goes wrong, the data is already on the Mac.

The result is that the 7-day limitation stopped existing for me: the app renews itself while I sleep, and if one day it can't, it warns me in time.
