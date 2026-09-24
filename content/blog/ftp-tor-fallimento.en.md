---
title: "When FTP meets Tor: chronicle of an announced failure"
date: 2026-09-12T14:18:29+02:00
draft: false
author: "silence"
categories: ["Tech", "Sysadmin"]
tags: ["linux", "archlinux", "hugo", "tor", "ftp", "android", "networking"]
summary: "Technical chronicle of a failed attempt to automate the deployment of a Hugo site via FTP via an .onion address on Android, and the structural limitations of the protocol."
---

![FTP](/images/grey-ftp-server.webp)
Running a static site generated with Hugo on a local Android server hidden behind a `.onion` address seemed like the perfect exercise in digital sovereignty. No centralized cloud, total control of the infrastructure, maximum resilience. Yet, the reality of network protocols can be stubborn.

Over the last few days I have attempted to automate the deployment of this blog to the FTP server running on Android (via KSWEB), strictly going through Tor's local SOCKS proxy (`127.0.0.1:9050`). The result was a continuous wall of `ECONNABORTED` errors, failed handshakes, and relentless timeouts.

The technical reason is as simple as it is frustrating: FTP (File Transfer Protocol), born in an era in which the management of encrypted tunnels and proxies was not a primary concern, requires the dynamic opening of data channels separate from the control channel. When you try to route this continuous stream of on-the-fly negotiated ports through the Tor loop, the SOCKS proxy loses the thread, saturates the connection, and shuts everything down.

### The attempts on the field

We explored different paths, all methodically slammed against the same structural limit:

1. **Trying Bash script with `curl` (single files):** Using `--socks5-hostname` bypassed local DNS resolution, but the sequential upload loop of Hugo-generated files quickly caused the Tor loop to collapse under the weight of multiple requests:
```bash
curl --socks5-hostname 127.0.0.1:9050 -u "$FTP_USER:$FTP_PASS" \
-T "$filepath" "ftp://$ONION_HOST:$PORT/$filepath" \
--ftp-create-dirs --connect-timeout 30 --retry 3
# Result: curl: (97) cannot complete SOCKS5 connection... (5)

Attempt via Bash script with single archive (tar.gz): Reducing everything to a single compressed file to limit socket openings was not enough to deceive the rigidity of the SOCKS proxy:
Bash

tar -czf site.tar.gz .
curl --socks5-hostname 127.0.0.1:9050 -u "$FTP_USER:$FTP_PASS" \
-T "site.tar.gz" "ftp://$ONION_HOST:$PORT/site.tar.gz"
# Result: Same SOCKS5 97 error when streaming.

Manual attempt with FileZilla: Forcing passive mode, resetting server-side authentication and limiting the client to only one simultaneous connection to avoid parallel flows, the proxy response remained relentless:
Plaintext

Error: Proxy request failed. Response from proxy: Generic SOCKS server error
Error: Proxy handshake failed: ECONNABORTED - Connection aborted

At this point, therapeutic persistence makes no sense: we have officially given up on the FTP and Tor combination for this type of flows.
Over to the readers

I open the table to the reader: how have you solved the dilemma of deploying on edge or mobile servers hidden behind anonymity networks? Does it make sense to ditch FTP and migrate everything to a pure SFTP daemon (which funnels control and data into a single TCP stream), or is it better to store remote sync and rely on wired offline methods (like ADB)?

Leave your experience in the comments or via PGP.
