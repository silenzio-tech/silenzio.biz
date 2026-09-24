---
title: "Move Hugo wherever you want"
date: 2026-09-17T19:25:00+02:00
draft: false
---
![Trasloco di Hugo](/images/grey-trasloco-hugo.webp)
Changing computer or switching to a new Linux distribution (like CachyOS) often makes migration procedures seem complex. With Hugo, the reality is radically different: portability is total and free of friction.

### Why move a Hugo site is trivial
* **Zero external dependencies:** There are no databases to export, complex web server configurations to replicate, or backend dependencies to chase.
* **Everything in a folder:** Source code, themes, configurations (`hugo.toml`) and content in Markdown format reside in the same place.
* **Independence from the environment:** If Hugo's binary rotates, the website rotates exactly the same way.

### Backup and restoration procedure in 3 steps

* **1. Creation of the archive (from the old system):**
  Compress the blog folder directly from your home:

```bash
  tar -czvf hugo-blog-backup.tar.gz il-mio-blog/
  ```

* **2. Extraction (on the new system):**
  Move the archive to the new home and extract it (you can do it via terminal or with the graphical manager):

```bash
  tar -xzvf hugo-blog-backup.tar.gz
  ```

* **3. Verification and operational test:**
  Enter the folder and start the integrated development server:

```bash
  cd il-mio-blog
  hugo server
  ```

Open http://localhost:1313`in the browser: the blog is perfectly operational, without surprises.
