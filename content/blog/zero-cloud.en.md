+++
title = 'Zero cloud, zero intermediaries: publish a Hugo site via ADB'
date = 2026-09-11T11:03:00+02:00
draft = false
tags = ["hugo", "android", "adb", "privacy"]
categories = ["tech"]
translationKey = "zero-cloud-adb"
+++
![script](/images/grey-script.webp)
In the modern web development landscape, complexity has become the standard: heavy control panels, relational databases, cloud build scripts, and dependencies that break with every update. But if the objective is maximum digital sovereignty, the path to take is exactly the opposite: to escape centralized infrastructures and bring every single byte back under one's physical control.

Using Arch Linux as your local workstation, Hugo for static file generation, and a USB cable for transfer, you can set up a publishing flow that never touches the internet.

### The local workflow

The process is based on a minimal Bash script (`pubblica.sh`) that performs three simple steps: cleanup of the previous build, compilation via Hugo and atomic transfer of files directly to the internal storage of an Android device used as a local server.

The script code is essential:

```bash
#!/bin/bash
set -e

echo "==> Hugo site compilation..."
hugo --cleanDestinationDir

echo "==> Android Server Cleanup..."
adb shell rm -rf /sdcard/htdocs/*

echo "==> Synchronizing new files via ADB..."
adb push public/. /sdcard/htdocs/

echo "==> Publishing completed successfully!"

```

### Why this choice?

* **Total isolation:** No SSH keys exposed on remote servers, no risk of brute force attacks on the admin port.
* **Surgical speed:** The ADB protocol allows you to transfer the entire website tree in fractions of a second directly to the device's memory.
* **No middlemen:** From Markdown file written locally to execution on the web server, there is no third-party cloud to act as intermediary.

---

Make the script executable and run it

Before you can use the script for the first time, you need to grant it execution permissions directly from the Arch Linux terminal:
Bash

chmod +x publish.sh

Once this is done, every time you want to publish the changes, simply launch the command from the main folder of your Hugo project:
Bash

./publish.sh

---

*Tomorrow, in a future article, we will see how to take the next step: configure a secure FTP server within KSWEB on Android and map a second dedicated Onion address, so as to be able to update and manage contents even remotely without giving up the principles of maximum privacy.*

```

```
