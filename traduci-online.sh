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

echo ">> Traduzione precisa riga per riga con Translate Shell in corso per $FILE_IT..."

python3 - "$FILE_IT" "$FILE_EN" << 'EOF'
import sys
import re
import subprocess

file_it = sys.argv[1]
file_en = sys.argv[2]

with open(file_it, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Separazione del Front Matter TOML (delimitato da '+++')
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

# 2. Traduce i campi 'title' e 'summary' nel Front Matter
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

# 3. Elaborazione riga per riga del corpo per evitare blocchi o troncamenti
lines = body.splitlines()
translated_body_lines = []
in_code_block = False

for line in lines:
    # Riconosce l'inizio e la fine dei blocchi di codice Markdown
    if line.strip().startswith('```'):
        in_code_block = not in_code_block
        translated_body_lines.append(line)
        continue
    
    # Se siamo dentro un blocco di codice o la riga è vuota/solo spazi, la lasciamo intatta
    if in_code_block or not line.strip():
        translated_body_lines.append(line)
        continue
    
    # Se è un'immagine markdown pura, la lasciamo inalterata
    if line.strip().startswith('![') and ']' in line and '(' in line:
        translated_body_lines.append(line)
        continue

    # Traduce la singola riga di testo (mantiene intestazioni ###, elenchi puntati -, ecc.)
    # Gestiamo eventuali prefissi di elenchi o intestazioni per non romperli
    # Esempio: "- Elemento" -> traduciamo solo "Elemento" mantenendo il marcatore
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

# 4. Scrittura del file finale inglese
with open(file_en, 'w', encoding='utf-8') as f:
    f.write(front_matter + translated_body)

EOF

echo ">> Fatto! Traduzione completata con successo: $FILE_EN"
