+++
title = "Tradurre i post di Hugo in locale con Ollama e uno script Python"
date = 2026-09-16T17:30:00+02:00
draft = false
summary = "Come automatizzare la traduzione dei post del proprio blog statico Hugo sfruttando un modello IA in locale su SSD esterno tramite Ollama, senza dipendere da servizi cloud e ottimizzando le risorse hardware."
tags = ["arch-linux", "hugo", "ollama", "python", "privacy"]
categories = ["Sviluppo"]
+++

![Ollama](/images/grey-traduci-script.webp)

Gestire un blog bilingue con **Hugo** è ideale per la portabilità e le performance, ma la traduzione dei contenuti richiede spesso di affidarsi a servizi cloud di terze parti o a noiosi copia-incolla manuali. 

Con l'evoluzione dei modelli linguistici open source e la disponibilità di hardware locale, è possibile far girare un modello di linguaggio direttamente sul proprio portatile e automatizzare l'intero flusso di traduzione in modo completamente offline, preservando la privacy e azzerando i costi.

### Perché una soluzione locale?

Utilizzare un'istanza locale di **Ollama** offre vantaggi determinanti:
- **Privacy totale**: nessun dato del blog viene esposto o inviato a server esterni.
- **Assenza di costi**: zero API keys, token a pagamento o abbonamenti a servizi commerciali.
- **Controllo granulare**: gestione puntuale del Front Matter TOML e della formattazione Markdown.

### L'infrastruttura: SSD esterno e ottimizzazione hardware

Su macchine con risorse limitate o configurazioni ibride (come i portatili con grafica Optimus dove la GPU Nvidia è tenuta rigorosamente spenta per risparmiare energia e ridurre le temperature), l'esecuzione dei modelli linguistici avviene interamente su **CPU**. 

Per evitare di occupare spazio prezioso sul disco principale e garantire flessibilità:
1. Il motore e i pesi di Ollama sono stati allocati su un **SSD esterno USB montato in `/mnt/ollama`** e configurato con automount in `/etc/fstab` con i corretti permessi utente.
2. Abbandonato il pesante `llama3.1` (8B) — troppo lento e prolisso su sola CPU — la scelta ottimale è caduta su **`gemma2:2b`** (1.6 GB), un modello estremamente rapido, preciso e privo di comportamenti verbosi.

### Lo script di traduzione definitivo (`traduci.sh`)

Per evitare problemi legati ai blocchi `PEP 668` di `pip` su Arch Linux e non introdurre dipendenze esterne, lo script combina Bash e un blocco **Python nativo** che sfrutta esclusivamente le librerie standard (`urllib.request` e `json`).

Crea il file `traduci.sh` nella radice del tuo blog Hugo:

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

Rendilo eseguibile con:

```bash
chmod +x traduci.sh
```

### Utilizzo

Per tradurre un post in modo istantaneo, basta richiamare lo script passando il percorso del file senza estensione:

```bash
./traduci.sh content/blog/tradurre-post-hugo-con-ollama
```

In pochi secondi otterrai il file gemello `.en.md` perfettamente formattato, pronto per essere compilato e pubblicato sul tuo blog statico.