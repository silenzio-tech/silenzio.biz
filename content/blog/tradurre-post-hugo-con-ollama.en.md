+++
title = "Locally translate Hugo posts with Ollama and a Python script"
date = 2026-09-16T17:30:00+02:00
draft = false
summary = "How to automate the translation of static Hugo blog posts using an on-premise AI model on an external SSD via Ollama, without relying on cloud services and optimizing hardware resources."
tags = ["arch-linux", "hugo", "ollama", "python", "privacy"]
categories = ["Sviluppo"]
+++

![Ollama](/images/grey-traduci-script.webp)

Managing a bilingual blog with **Hugo** is ideal for portability and performance, but translating content often requires relying on third-party cloud services or tedious manual copy-pasting.

With the evolution of open-source language models and the availability of local hardware, it is possible to run a language model directly on your laptop and automate the entire translation workflow completely offline, preserving privacy and eliminating costs.

### Why a local solution?

Using a local instance of **Ollama** offers decisive advantages:
- **Total Privacy**: no blog data is exposed or sent to external servers.
- **No cost**: zero API keys, paid tokens, or commercial service subscriptions.
- **Granular Control**: precise management of the TOML Front Matter and Markdown formatting.

### External SSD infrastructure and hardware optimization

On machines with limited resources or hybrid configurations (such as laptops with Optimus graphics where the Nvidia GPU is strictly kept disabled to save energy and reduce temperatures), language model execution occurs entirely on the **CPU**.

To avoid occupying precious space on the main disk and ensure flexibility:
1. The Ollama engine and weights have been allocated to an **external USB SSD mounted at `/mnt/ollama`** and configured with automount in `/etc/fstab` with the correct user permissions.
2. Having abandoned the heavy `llama3.1` (8B) — too slow and verbose on a pure CPU setup — the optimal choice fell on **`gemma2:2b`** (1.6 GB), an extremely fast, precise model free of verbose behaviors.

### The definitive translation script (`traduci.sh`)

To avoid problems related to `PEP 668` blocks from `pip` on Arch Linux and to avoid introducing external dependencies, the script combines Bash with a native **Python** block that relies exclusively on standard libraries (`urllib.request` and `json`).

Create the `traduci.sh` file in the root of your Hugo blog:

````bash
#!/bin/bash

if [ -z "$1" ]; then
    echo "Uso: ./traduci.sh content/blog/nome-articolo"
    exit 1
fi

BASE_PATH="$1"
FILE_IT="${BASE_PATH}.it.md"
FILE_EN="${BASE_PATH}.en.md"

if [ ! -f "$FILE_IT" ]; then
    echo "Errore: Il file italiano $FILE_IT non esiste!"
    exit 1
fi

echo ">> Traduzione locale riga per riga con gemma2:2b in corso per $FILE_IT..."

python3 - "$FILE_IT" "$FILE_EN" << 'EOF'
import sys
import re
import json
import urllib.request

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
    
    prompt = f"""Translate the following Markdown text strictly from Italian to English. 
Rules:
- Output ONLY the translated text.
- Do not add conversational filler, notes, or explanations.
- Preserve all Markdown formatting, punctuation structure, and list numbering.

Text to translate:
{text}"""

    req_data = json.dumps({
        "model": "gemma2:2b",
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.1}
    }).encode('utf-8')

    api_host = "http://127.0.0.1"
    api_port = "11434"
    endpoint = f"{api_host}:{api_port}/api/generate"

    req = urllib.request.Request(
        endpoint,
        data=req_data,
        headers={'Content-Type': 'application/json'}
    )

    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            translated = result.get('response', '').strip()
            translated = re.sub(r'^(Here is the translation[:]*\s*)', '', translated, flags=re.IGNORECASE)
            return translated.strip()
    except Exception as e:
        print(f"\nErrore di connessione a Ollama: {e}", file=sys.stderr)
        return text

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
translated_body = re.sub(r'\n{3,}', '\n\n', translated_body)

# 4. Scrittura del file tradotto
with open(file_en, 'w', encoding='utf-8') as f:
    f.write(front_matter + translated_body)

EOF

echo ">> Fatto! Traduzione completata con successo: $FILE_EN"
````

Make it executable with:

```bash
chmod +x traduci.sh
```

### Usage

To translate a post instantly, simply call the script passing the file path without extension:

```bash
./traduci.sh content/blog/tradurre-post-hugo-con-ollama
```

In a few seconds, you will get the twin `.en.md` file perfectly formatted, ready to be compiled and published on your static blog.