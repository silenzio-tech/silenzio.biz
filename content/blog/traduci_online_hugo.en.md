+++
title = "Translate post Hugo with light scripts: when hardware doesn't suffice and privacy compromises"
date = 2026-09-18
draft = false
summary = "How to automate Hugo post translation using Translate Shell for those with limited hardware, analyzing privacy compromises and threat model."
+++

![Traduci online Hugo](/images/traduci-online.webp)
When managing a static blog generated with Hugo, automating the translation of posts (for example, from Italian to English) significantly speeds up the workflow. However, using local AI models (like Ollama with `gemma2:2b`) requires hardware resources that are not always available on outdated machines or lightweight servers.

In these scenarios of limited resources, it is possible to resort to tools based on CLI and online translation services, such as **Translate Shell**. This choice, however, introduces important considerations in terms of security and privacy.

---

### The compromise: Resources vs Privacy

Trusting an online translator via command line means shifting the processing outside of one's local perimeter:

* **Text Exposure:** Unlike a local LLM, the text of the post is sent in clear to third-party servers for translation.
* **Threat Modeling (The Threat Model):** This method **must never** be used for confidential documents, personal information, critical opinions, or content that could in any way lead to the real identity of the author.
* **Allowed Use:** It is a practical solution acceptable **exclusively for public content, general technical guides, or non-sensitive posts**, where the exposure of the text does not pose security risks.

---

### Installation of dependencies (`trans`)

Before using the online translation script, it is necessary to install **Translate Shell** (`trans`) and the interpreter `gawk` on your system.

On **Arch Linux**, you can install the package via AUR using a helper (such as `yay` or `paru`):

```bash
yay -S translate-shell
```

On **Fedora**, you can install it directly from the official repositories via DNF:

```bash
sudo dnf install translate-shell
```

On Debian or Ubuntu-based distributions, it is available in the official repositories:

```bash
sudo apt install translate-shell
```

---

### The online translation script (`traduci-online.sh`)

Below you will find the complete script that automates the translation line by line of a Hugo post, preserving the structure of the TOML Front Matter, Markdown code blocks, and list formatting.

Save the code in a file named `traduci-online.sh` and make it executable with `chmod +x traduci-online.sh`.

```bash
#!/bin/bash

if [ -z "$1" ]; then
    echo "Uso: ./traduci-online.sh content/blog/nome-articolo"
    exit 1
fi

BASE_PATH="$1"
FILE_IT="${BASE_PATH}.it.md"
FILE_EN="${BASE_PATH}.en.md"

if [ ! -f "$FILE_IT" ]; then
    echo "Errore: Il file italiano $FILE_IT non esiste!"
    exit 1
fi

echo ">> Traduzione online riga per riga con Translate Shell in corso per $FILE_IT..."

python3 - "$FILE_IT" "$FILE_EN" << 'EOF'
import sys
import re
import subprocess

file_it = sys.argv[1]
file_en = sys.argv[2]

with open(file_it, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Separazione del Front Matter TOML
parts = content.split('+++', 2)
if len(parts) >= 3:
    front_matter_raw = parts[1]
    body = parts[2]
else:
    front_matter_raw = ""
    body = content

def translate_text(text):
    if not text.strip():
        return text
    proc = subprocess.Popen(
        ['trans', '-b', '-s', 'it', '-t', 'en'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    translated, _ = proc.communicate(input=text)
    return translated.strip()

# 2. Traduzione dei campi testuali nel Front Matter
new_front_matter = []
for line in front_matter_raw.strip().split('\n'):
    match = re.match(r'^(title\s*=\s*["\']?)(.*?)(["\']?\s*)$', line, re.IGNORECASE)
    match_sum = re.match(r'^(summary\s*=\s*["\']?)(.*?)(["\']?\s*)$', line, re.IGNORECASE)
    
    if match:
        prefix, val, suffix = match.groups()
        new_front_matter.append(f"{prefix}{translate_text(val)}{suffix}")
    elif match_sum:
        prefix, val, suffix = match_sum.groups()
        new_front_matter.append(f"{prefix}{translate_text(val)}{suffix}")
    else:
        new_front_matter.append(line)

front_matter = f"+++\n" + "\n".join(new_front_matter) + "\n+++\n" if front_matter_raw else ""

# 3. Elaborazione riga per riga del corpo
lines = body.splitlines()
translated_body_lines = []
in_code_block = False

for line in lines:
    if line.strip().startswith('```'):
        in_code_block = not in_code_block
        translated_body_lines.append(line)
        continue
    
    if in_code_block or not line.strip():
        translated_body_lines.append(line)
        continue
    
    if line.strip().startswith('![') and ']' in line and '(' in line:
        translated_body_lines.append(line)
        continue

    list_match = re.match(r'^(\s*[-*+]\s+|\s*\d+\.\s+)(.*)$', line)
    header_match = re.match(r'^(#{1,6}\s+)(.*)$', line)
    
    if list_match:
        prefix, text_to_trans = list_match.groups()
        translated_text = translate_text(text_to_trans)
        translated_body_lines.append(f"{prefix}{translated_text}")
    elif header_match:
        prefix, text_to_trans = header_match.groups()
        translated_text = translate_text(text_to_trans)
        translated_body_lines.append(f"{prefix}{translated_text}")
    else:
        translated_body_lines.append(translate_text(line))

translated_body = "\n".join(translated_body_lines)

# 4. Scrittura del file tradotto
with open(file_en, 'w', encoding='utf-8') as f:
    f.write(front_matter + translated_body)

EOF

echo ">> Fatto! Traduzione completata con successo: $FILE_EN"