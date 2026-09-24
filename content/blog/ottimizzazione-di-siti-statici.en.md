---
title: "Optimizing Static Websites for Tor: A Technical Guide to Hugo for the Onion Network"
date: 2026-09-14
draft: false
tags: ["tor", "hugo", "privacy", "security", "darkweb"]
---
![Ottimizzazioni su Tor](/images/grey-ottimizzazione-hugo.webp)
**Minimalist Architecture: Optimizing Hugo for the Tor Network**

The Tor network imposes strict constraints in terms of latency and bandwidth. Adopting a static site generator like Hugo eliminates server processing times and minimizes data exchanged on onion circuits, guaranteeing maximum speed and reduced attack surface.

This article collects optimizations applied to a static site published as a hidden service. The objective is twofold: offer visitors a rapid browsing experience even on congested relays, and minimize information exposed to crawlers, traffic analyzers, and potential attackers.

**1. Configuration of the file**`hugo.toml`**

The primary objective in the configuration file is to generate an entirely autonomous output, free of external asset references or problematic absolute paths.

* **Relative Addressing:**
  **

```toml
  baseURL = "http://silenzio.onion/"
  relativeURLs = true
  canonifyURLs = false
  ```

The setting`relativeURLs = true`guarantees that all links to resources (CSS, images, internal pages) are generated as relative paths. This prevents domain leaks or loading problems if the address`.onion`change or if the site is visited via local proxy. Set also`canonifyURLs = false`to avoid Hugo rewriting absolute URL paths.

* **Hardening and Reduction of Fingerprinting:**

```toml
  disableHugoGeneratorInject = true
  ```

Disable automatic tag injection`<meta name="generator" content="Hugo X.Y.Z">`in the HTML header, avoiding the exact version of the software used and reducing the information available to crawlers.

* **Disabling Unused Taxonomies:**

```toml
  disableKinds = ["taxonomy", "term"]
  ```

If the site does not require categorization by tags or authors, disabling taxonomies reduces the number of HTML files generated, decreasing build times and the overall size of the distributed directory.

**2. Layout Architecture: HTML, CSS, and Assets**

On Tor Browser, each additional HTTP request involves a journey through three encrypted nodes, introducing evident latency. Each complete round-trip through the network causes tangible delays in page rendering.

* **Zero External Dependencies:**
  Never use resources hosted on external CDNs (such as Google Fonts, FontAwesome, JavaScript libraries, or remote icons). Any call to the outside breaks the isolation of the Hidden Service and can cause IP leaks on the client side. All fonts and icons must be integrated locally as lightweight SVG files or standard system fonts (`system-ui`,`sans-serif`,`serif`).

* **Inlining of CSS:**
  Anziché collegare un file`.css`exterior with a tag`<link rel="stylesheet">`Insert the essential styles directly within the tags`<style>`in the header`<head>`from the base template (`baseof.html`):

```html
  <style>
    {{ readFile "assets/css/main.css" | safeCSS }}
  </style>
  ```

In this way the page is rendered with a single HTTP request.

* **"No-JS" Architecture:**
  Design the layouts so they are perfectly readable and navigable without JavaScript. Many Tor users browse with Tor Browser set to the *Safer* or *Safest* security levels, which completely disable scripts. Avoid menu-based navigation based on JS; use pure CSS constructs (e.g.`:focus`/`:hover`o`:checked`) if strictly necessary. Pay attention to the *Safest* level, which disables part of the fonts, icons, and mathematical symbols: always use SVG inline for icons and accompany a textual label, so that the semantics don't get lost if the icon is not rendered.

**3. Optimization and Sanitization of Images**

Multimedia files represent the main bandwidth quota consumed during navigation. Reducing the visual footprint is indispensable to maintain high performance.

* **WebP Format and Aggressive Compression:**
  Convert all images to the WebP format, which guarantees a weight saving of between 25% and 35% compared to JPEG or PNG at equal perceived quality. Resize each image to the actual resolution of visual display before insertion into the project.

* **Removal of Metadata (EXIF Strip):**
  Before inserting any image into the folder`static/`o`assets/`sanitize the files by removing the EXIF metadata entirely (GPS coordinates, camera model, timestamp). Example of sanitization via command line with ImageMagick:

```bash
  magick convert input.png -strip -quality 80 output.webp
  ```

* **Payload Target:**
  Maintain the total weight of a single page (HTML + styles + images) under 100 KB. Such a footprint allows near instant rendering even on congested Tor relays.

**4. Build and Deploy Workflow**

To maintain a clean and automated workflow, it is advisable to manage the compilation and cleaning of assets via command line.

* **Production Build Command:**

```bash
  hugo --minify --gc
  ```

I flag`--minify`e`--gc`guarantee the compression of HTML and the removal of unused resources from the cache during the folder generation`public/`. For an even more aggressive compression, verify that in`hugo.toml`be present:

```toml
  [minify]
    minifyOutput = true

  [minify.tdewolff.html]
    keepWhitespace = false
    removeComments = true
  ```

* **Automation via Script:**
  Group the phases of sanitization, build, and deployment on the hosting device into a single Bash script from the terminal, minimizing the possibility of human error.

* **Build Security:**
  Hugo integrates sandbox security policies that limit the execution of external commands and remote HTTP fetches. For a Tor site, it is advisable to restrict them explicitly:

```toml
  [security]
    enableInlineShortcodes = false

  [security.exec]
    allow = []

  [security.http]
    urls = []
    methods = []
  ```

In this way, any template that tries to go beyond the limits causes a build failure with an explicit error. Keep in mind`go.sum`Version control: a mismatch of checksums during the build immediately halts the compilation, offering a simple defense against dependency poisoning.

**Final Considerations**

Optimizing a static website for the Tor network is not a one-time operation, but an ongoing set of consistent choices that span the entire publishing pipeline: from Hugo configuration to layout structure, from asset sanitization to build discipline. Every saved HTTP request, every kilobyte removed, every metadata removed contributes to a faster experience for the visitor and a reduced informational surface outward.

The onion network is not merely an alternative publishing channel: it's a space in which the lightness of code becomes itself a form of respect for those who traverse it. A well-optimized static site, free of superfluous dependencies and built around the real needs of its readers, is a small contribution to the sustainability of that space.