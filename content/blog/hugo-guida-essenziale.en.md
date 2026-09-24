+++
title = 'Hugo: essential guide to static site generators'
date = 2026-09-11T09:14:00+02:00
draft = false
tags = ["hugo", "tutorial", "web"]
categories = ["tech"]
+++

![Hugo Tutorial](/images/grey-hugo-tutorial.webp)

Hugo is a static site generator written in Go. It takes text files in Markdown format, passes them through a theme and returns an entire website composed solely of HTML files, CSS and static assets, ready to be served at photon speed from any web server.

No databases, no server-side languages, zero maintenance. Let's see how it is installed and used in daily practice.

---

### Why switch to Hugo: the advantages compared to the dynamic web

Abandoning dynamic CMS in favor of a static generator like Hugo radically changes the rules of the game in several key aspects:

* **Extreme loading speed:** Since there are no database queries to execute at the request time nor server-side code to interpret, the server simply outputs pure HTML files. The result is loading times reduced to a few milliseconds.
* **Total security by design:** Without an SQL database to breach, without login interfaces (`/wp-admin`) exposed to brute-force attacks, and without third-party plugins, the attack surface is reduced to zero.
* **Zero maintenance and longevity:** A static site generated today will work identically in ten years, free from PHP breaks, plugin incompatibilities, or deprecated themes.
* **Simple, economical and eco-friendly hosting:** Static files can be hosted anywhere with minimal hardware resources—a lightweight web server like Nginx or even an old Android smartphone is enough.
* **Total control and portability:** Your content consists of local Markdown text files. No vendor lock-in; you have absolute ownership of every single byte.

---

### 1. Installation (All OS)

You can install Hugo on any operating system using official package managers or precompiled binaries. Make sure you install the **Extended** version, required for modern themes using SCSS/SASS.

* **Linux (Arch Linux):**
  ```bash
  pacman -S hugo

    Linux (Other systems / Debian / Ubuntu):
    Bash

    sudo apt install hugo

    macOS:
    Bash

    brew install hugo

    Windows (Winget):
    DOS

    winget install --id Hugo.Hugo.Extended

2. Basic structure of the project

Once installed, the typical structure of a Hugo project consists of a few key folders:

    content/: Where the Markdown files for your posts and pages live.

    layouts/ or themes/: The graphic structure and HTML templates.

    static/: Images, custom CSS files, favicons, and static assets.

    hugo.toml: The global site configuration file.

3. Creating a new post

To add a new article to the blog, work directly from the terminal and text editor:
Bash

hugo new content/blog/my-first-article.md

The generated file contains front matter with basic metadata:
Ini, TOML

+++
title = 'My first article'
date = 2026-09-11T09:14:00+02:00
draft = false
tags = ["hugo"]
categories = ["tech"]
+++

Write the text of your article here using standard **Markdown**...

Make sure the draft variable is set to false when you are ready to publish.
4. Real-time local preview

To launch Hugo's local development server and monitor changes in real time:
Bash

hugo server

Open your browser at http://localhost:1313.
5. Generating the final version (Build)

When the site is ready and you want to export the final static files for production, run:
Bash

hugo

This compiles the entire site inside the public/ folder, ready to be transferred to your web server via rsync or your preferred deployment method.
