---
title: "Automation and minimalism: a Bash script to convert images"
date: 2026-09-13T10:45:00+02:00
draft: false
description: "How I created a small command in Bash to resize, black and white and convert blog images to WebP."
tags:
- bash
- linux
- automation
- imagemagick
- privacy
categories:
- technology
---
![script](/images/grey-What-is-Script-Nedir-08.webp)
When you run a static blog with Hugo, one of the most repetitive steps is preparing images. Between resizing, conversions to modern formats such as WebP and color adjustments, you end up wasting precious time in graphics software menus.

The cleanest solution? Write a small script in Bash and turn it into a system command.

## The `greyimg` script

The heart of the operation relies on `ImageMagick` (called with the `magick` command on recent Arch Linux distributions). The script takes one or more input files, resizes them to a standard width of 800 pixels, converts them to grayscale, removes all traces of metadata, and generates a compact `.webp` file.

Save this code inside `~/.local/bin/greyimg`:

```bash
#!/bin/bash

if [ "$#" -eq 0 ]; then
echo "Usage: greyimg <image1> [image2 ...]"
exit 1
fi

for img in "$@"; do
if [ -f "$img" ]; then
ext="${img##*.}"
basename="$(basename "$img" ."$ext")"
magick "$img" -strip -resize 800x -colorspace Gray -quality 60 "grey-${basename}.webp"
echo "Generated: grey-${basename}.webp"
else
echo "File not found: $img"
fi
done

```

### The steps to make it operational

1. **Give execute permissions to the file:**
```bash
chmod +x ~/.local/bin/greyimg

```


2. **Make sure the folder is in your `$PATH**` (adding it to your `~/.bashrc` or `~/.zshrc` if you haven't already):
```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

```


3. **Usage:**
Now you can navigate to any terminal folder containing the photos and run:
```bash
greyimg filename.jpg

```



## Why this choice?

Maintaining control of the pipeline from the terminal frees you from the constraints of rigid paths and heavy software. The addition of `-strip` is not just used to shave off a few kilobytes of weight: cleaning files from EXIF, coordinates and hidden profiles is a fundamental detail when publishing in contexts oriented towards maximum confidentiality, such as hidden services on the darknet, where any residual information is one footprint too many. One line of code, zero frills, immediate result.

