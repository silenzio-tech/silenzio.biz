+++
title = "Tradurre post Hugo con script leggeri: quando l'hardware non basta e la privacy scende a compromessi"
date = 2026-09-18
draft = false
summary = "Come automatizzare la traduzione dei post Hugo tramite Translate Shell per chi ha hardware limitato, analizzando i compromessi di privacy e il threat model."
+++
![Traduci online Hugo](/images/traduci-online.webp)
Quando si gestisce un blog statico generato con Hugo, automatizzare la traduzione dei post (ad esempio da italiano a inglese) velocizza enormemente il flusso di lavoro. Tuttavia, l'uso di modelli di intelligenza artificiale locali (come Ollama con `gemma2:2b`) richiede risorse hardware che non sempre sono disponibili su macchine datate o server leggeri.

In questi scenari di risorse limitate, è possibile ricorrere a strumenti basati su CLI e servizi di traduzione online, come **Translate Shell**. Questa scelta, però, introduce importanti considerazioni in termini di sicurezza e privacy.

---

### Il compromesso: Risorse vs Privacy

Affidarsi a un traduttore online tramite riga di comando significa spostare l'elaborazione fuori dal proprio perimetro locale:

* **Esposizione del testo:** A differenza di un LLM eseguito in locale, il testo del post viene inviato in chiaro a server di terze parti per essere tradotto.
* **Threat Modeling (Il modello di minaccia):** Questo metodo **non deve mai** essere utilizzato per documenti riservati, informazioni personali, opinioni critiche o contenuti che possano in alcun modo ricondurre all'identità reale dell'autore.
* **Uso consentito:** È una soluzione pratica accettabile **esclusivamente per contenuti pubblici, guide tecniche generali o post non sensibili**, dove l'esposizione del testo non comporta rischi per la sicurezza.

---

### Installazione delle dipendenze (`trans`)

Prima di utilizzare lo script di traduzione online, è necessario installare **Translate Shell** (`trans`) e l'interprete `gawk` sul proprio sistema.

Su **Arch Linux**, puoi installare il pacchetto tramite AUR utilizzando un helper (come `yay` o `paru`):

```bash
yay -S translate-shell
```

Su **Fedora**, puoi installarlo direttamente dai repository ufficiali tramite DNF:

```bash
sudo dnf install translate-shell
```

Su distribuzioni basate su Debian o Ubuntu, è disponibile nei repository ufficiali:

```bash
sudo apt install translate-shell
```

---

### Lo script di traduzione online (`traduci-online.sh`)

Di seguito trovi lo script completo che automatizza la traduzione riga per riga di un post Hugo, preservando la struttura del Front Matter TOML, i blocchi di codice Markdown e la formattazione dei elenchi.

Salva il codice in un file denominato `traduci-online.sh` e rendilo eseguibile con `chmod +x traduci-online.sh`.
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
