---
title: "Backups my own server can't read"
description: "The daily backup holds every client's data. Why it's encrypted to a public key, and why the key to read it doesn't live on the server."
date: 2026-10-12
tags: [infrastructure, security, rapisites]
projects: [rapisites]
kind: learning
keyword: "age"
---

RapiSites makes a daily backup of the database and stores it in a Cloudflare R2 bucket. That file holds every client's data: accounts, sites, every published version, the audit log. So it has to be encrypted before it leaves the server. The question is with what and, above all, where the key lives.

I decided it on September 8, the same day as the production cutover, as decision 025. In code it's one of the smallest decisions in the project: two shell scripts and a timer. The big part is where each key lives.

## The obvious option

The obvious thing is to encrypt with a password stored in the server's `.env`, using symmetric `gpg` or `openssl enc`. It works, but it has a problem: the key to decrypt lives on the same machine being backed up. If someone gets to the `.env`, they get to everything, including the bucket's 30 days of backups, because the token to read the bucket is in that same `.env`.

I thought about what each layer protects against, not about whether it's “encrypted”. The bucket's own encryption, for example, protects against a disk stolen from the provider. But that's not the real risk: the real risk is a leaked token, and that token lives on the server. With bucket-side encryption, whoever has the token reads the backups in plain text.

## Encrypting to a public key

I chose `age` encrypting to a public key. It's asymmetric encryption: what's encrypted with the public key only opens with the private one. The server only has the public key: it can create backups, but it can't read them. The private key lives only in the password manager and comes down to the server by hand, into a temporary file, only for a drill or a real restore.

```sh
# On my machine, once (simplified)
age-keygen -o backup.agekey
# Public key: age1…   → goes into the server's .env
# AGE-SECRET-KEY-1…   → goes only into the password manager, never the server or the repo
```

If someone gets into the server, they have the live database anyway; that doesn't change. But they can't download and decrypt the history. The difference looks small until you think about what data existed 29 days ago that isn't there today.

I chose `age` over GPG for simplicity: it's a single tool, with no keyrings, no expiry dates, no trust model. One binary and two commands. To upload the file I chose `rclone`, which speaks S3 to R2, is configured entirely through flags and doesn't leave a config file with secrets on disk. I ruled out `aws-cli` because it's heavier and its default configuration writes the credentials to a file.

## What the backup does, step by step

A systemd timer fires it every day at 07:10 UTC, around 2 in the morning in Honduras, outside peak hours. Any step that fails stops everything with an error code, systemd logs it and a separate service sends an alert.

- `pg_dump` in custom format from inside the Postgres container.
- It validates the dump with `pg_restore --list` before uploading anything. A truncated dump fails here.
- If the dump is smaller than 4 KB, it stops: that's suspicious.
- It encrypts it with `age` to the public key.
- It uploads it to the backup bucket and checks that the remote size matches the local one.
- It deletes anything older than 30 days from the bucket. The bucket also has its own lifecycle rule that does the same: belt and braces.
- If configured, it pings a heartbeat. That way, a backup that doesn't run also triggers an alert.

```sh
# The heart of the backup (simplified)
pg_dump -Fc --no-owner --no-privileges > "$DUMP"
pg_restore --list < "$DUMP" > /dev/null || die "corrupt dump, not uploading"
age --recipient "$AGE_PUBLIC_KEY" --output "$DUMP.age" "$DUMP"
rclone copyto "$DUMP.age" "r2:backups/$(basename "$DUMP").age"
[ "$(remote_size)" = "$(local_size)" ] || die "remote size doesn't match"
```

The backup bucket is separate from the application's, has versioning turned on (an accidental deletion, or a malicious one if the token leaks, can be recovered) and its token only has permissions on that bucket.

A practical detail: the `rclone` in the Ubuntu 24.04 repositories is a 2022 version that sends a checksum header R2 rejects with `501 NotImplemented` on the first attempt. The retry works, but it clutters the log on every run. The fix was to install `rclone` from its own site and also force `--s3-disable-checksum` in the scripts. `age` from the Ubuntu repositories is fine.

## What I ruled out

| Option | Why not |
| --- | --- |
| Symmetric GPG or `openssl enc` with a password in the `.env` | The key to decrypt lives on the same machine being backed up |
| Bucket-side encryption | It protects against a disk stolen from the provider, not against a leaked token, which is the real risk |
| `aws-cli` instead of `rclone` | Heavier, and it writes credentials to a file by default |
| A managed database with backups included (about US$15 more a month) | Still an option if maintaining it by hand hurts, but I'd still want my own backup, outside the database provider |

<p class="tbl-note">The alternatives in decision 025.</p>

## The cost: an irreplaceable key

The private key is the only secret in the system that can't be regenerated. If I lose a database password, I change it. If I lose an R2 token, I create another one. If I lose the `age` private key, the existing backups are unreadable forever. That's why it lives in the password manager with documented access.

Rotating it has a simple way out: there's no need to re-encrypt anything. It's enough to start encrypting to a new key and let the old backups expire on their own after 30 days; meanwhile, the old key is still the one that opens them.

And that changes something else that matters: the monthly restore drill stops being optional. The spec already said it, “an untested backup isn't a backup”, but with this model there's one more reason: the drill is the only moment the private key gets used and you check that it still opens what the server encrypts.

## The drill

It happens on the first Monday of each month. It restores the latest backup into a test database on the same server, without touching production. By default, the script never restores over the real database: for that it requires an explicit flag, `--force-prod`.

```sh
# Drill (simplified)
umask 077
vim ~/backup.agekey                   # paste the private key from the manager
export AGE_IDENTITY_FILE=~/backup.agekey
./ops/restore.sh latest               # → test database, never production
# downloads, decrypts, validates, recreates the test database, pg_restore,
# and prints counts and how long it took
rm ~/backup.agekey && unset AGE_IDENTITY_FILE
```

When it's done, the script prints counts of accounts, users, sites and versions, plus the date of the last publish, to compare them against production. And how long it took, which is the measured recovery time for that run. Then the test database is dropped, the key is deleted from the server and the result is written down in a table in the operations doc.

The first drill was that same September 8, during the production cutover: R2, decryption with `age`, `pg_restore` into the test database, counts identical to production. It took about 3 seconds, because the database was still very small (the dump was about 800 KB). That number is going to grow, and that's why it's measured every month instead of assumed.

The security audit on September 19 found a detail in the restore script: the target database name went straight into a `DROP DATABASE`. Only someone running the script by hand can use it, but closing it took one line: now the name has to pass a regular expression for a valid identifier.

## What it covers and what it doesn't

| Data | How | Retention |
| --- | --- | --- |
| Postgres (everything) | Daily dump encrypted with `age` | 30 days |
| The whole server (OS, Docker, `.env`) | Weekly snapshot from the provider | 4 weeks |
| The production `.env` | Manual copy in the password manager | — |
| TLS certificates | Not backed up: Caddy reissues them on its own | — |
| Images and uploaded-site files in R2 | No backup of their own today | — |

<p class="tbl-note">The daily dump is the one that matters for not losing clients' work.</p>

The maximum data loss is 24 hours, because the backup is daily. The weekly snapshot recovers the machine, but with up to a week of stale data: it's an infrastructure backup, not a data backup.

And there's a gap I have written down as pending: the files in R2 have no backup of their own. For images, the bucket is the durable store. But since October RapiSites accepts sites made of the client's own files, and on an uploaded site the files are the site. I need to decide how to back them up, and I haven't done it yet.

## What I'd tell someone setting up their backups

- Ask yourself where the key to read the backup lives. If it's the same machine, encryption doesn't protect you from the case that matters most.
- Asymmetric encryption solves that with a small tool: the server encrypts, it doesn't decrypt.
- Validate the dump before uploading it and check that what arrived weighs the same as what left.
- Alert when the backup doesn't run, too, not only when it fails.
- Make the restore script unable to overwrite production unless you explicitly ask it to.
- Schedule the drill and write down how long it takes. It's the only proof that the key and the process still work.

> What I take away: a backup you've never restored isn't a backup, it's a hope. And the key to read it can't live next to what it protects.
