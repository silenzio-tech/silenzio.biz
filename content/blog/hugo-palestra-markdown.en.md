---
title: "Gym Markdown: Put your new Hugo site to the test"
date: 2026-09-13T09:28:50+02:00
draft: false
description: "Practical exercises in Markdown to get comfortable with Hugo's formatting and renderers."
tags:
- hugo
- markdown
- tutorials
- blog
categories:
- technology
---

![script](/images/grey-hugo-palestra.webp)
Here is a proposal for practical exercises in Markdown designed for an article on Hugo. They are structured progressively, from the basic text to the specifics often handled by Hugo's renderers (Goldmark).

---


Now that Hugo is installed and you have your site ready to go, it's time to write the first real piece of content. Markdown is the language you'll use 90% of the time: lightweight, portable, and designed to let you focus on ideas, not formatting.

Test your `.md` files by solving the 5 exercises below. Create a test post (e.g. `hugo new posts/exercise-markdown.md`) and try to replicate the results.

---

## Exercise 1: Basic formatting and titles

Create a small text that contains exactly this hierarchy and emphasis:

* A main title (H1) with the name of your business.
* A subheading (H2) called "Introduction".
* A paragraph in which **one word is bold**, *one italicized* and one strikethrough (use double tildes `~~text~~`).
* A subheading (H2) called "Conclusions" followed by a horizontal dividing line (`---`).

---

## Exercise 2: Lists and task lists (To-Do)

Hugo and Goldmark support interactive checklists (often converted into checkboxes by themes). Write a shopping list or steps to write a post, consisting of:

* Two items already completed (checked).
* Two items still to be done (unchecked).
* A sublist nested under one of the to-do items, with at least two sub-items.

---

## Exercise 3: Code blocks with highlighted syntax

In technical or author blogs it often happens that code is cited. Reports a block of Bash code and a block of Go or YAML code (widely used in Hugo configuration files such as `hugo.toml`).

* *Requirement:* Always specify the language after the three backticks (e.g. ```yaml) to enable Hugo highlighting.
* *Example to insert:* The command to create a new site and start the development server.

---

## Exercise 4: Quotes and Callouts (Extended Markdown)

Create a classic quote using the `>` symbol.

* Just below, try inserting a formatted note or warning (many Hugo themes use special blockquote syntax or shortcodes, but try the standard form first):
> **Please note:** Remember to set `draft: false` in the frontmatter when you are ready to publish, otherwise Hugo will hide the article during build.



---

## Exercise 5: Tables and links

Create a small three-column comparison table:

1. **Tool / Language**
2. **Function**
3. **Personal rating (1-10)**

Enter at least three lines (e.g. Hugo, Markdown, Git). Below the table, insert a properly formatted hyperlink pointing to the official Hugo documentation (`[https://gohugo.io](https://gohugo.io)`).

---

### Solution / Quick reference for checking

When you're done, the source of your Markdown file should look like this neat schematic:

```markdown
---
title: "Markdown Exercises"
date: 2026-09-13T09:24:39+02:00
draft: true
---

# My test

## Introduction
This is a paragraph with **bold**, *italics* and ~~strikethrough~~.

## Conclusions
---

- [x] Install Hugo
- [x] Create the site
- [ ] Write the first post
- [ ] Draft review
- [ ] Check links

```

*Terminal tip:* launch `hugo server -D` in your project directory and open `http://localhost:1313` to see in real time how the theme interprets your exercises.
