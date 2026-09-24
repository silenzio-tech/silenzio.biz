---
title: "Automazione e minimalism: uno script Bash per convertire le immagini"
date: 2026-09-13T10:45:00+02:00
draft: false
description: "Come ho creato un piccolo comando in Bash per ridimensionare, passare in bianco e nero e convertire in WebP le immagini del blog."
tags:
  - bash
  - linux
  - automazione
  - imagemagick
  - privacy
categories:
  - tecnologia
---
![script](/images/grey-What-is-Script-Nedir-08.webp)
Quando gestisci un blog statico con Hugo, uno dei passaggi più ripetitivi è la preparazione delle immagini. Tra ridimensionamenti, conversioni in formati moderni come WebP e regolazioni cromatiche, si finisce per perdere tempo prezioso nei menu dei software grafici.

La soluzione più pulita? Scrivere un piccolo script in Bash e trasformarlo in un comando di sistema.

## Lo script `greyimg`

Il cuore dell'operazione si affida a `ImageMagick` (richiamato con il comando `magick` sulle distribuzioni Arch Linux recenti). Lo script prende uno o più file in input, li ridimensiona a una larghezza standard di 800 pixel, li converte in scala di grigi, rimuove ogni traccia di metadati e genera un file `.webp` compatto.

Salva questo codice all'interno di `~/.local/bin/greyimg`:

```bash
#!/bin/bash

if [ "$#" -eq 0 ]; then
    echo "Uso: greyimg <immagine1> [immagine2 ...]"
    exit 1
fi

for img in "$@"; do
    if [ -f "$img" ]; then
        ext="${img##*.}"
        basename="$(basename "$img" ."$ext")"
        magick "$img" -strip -resize 800x -colorspace Gray -quality 60 "grey-${basename}.webp"
        echo "Generato: grey-${basename}.webp"
    else
        echo "File non trovato: $img"
    fi
done

```

### I passaggi per renderlo operativo

1. **Dai i permessi di esecuzione al file:**
```bash
chmod +x ~/.local/bin/greyimg

```


2. **Assicurati che la cartella sia nel tuo `$PATH**` (aggiungendola al tuo `~/.bashrc` o `~/.zshrc` se non l'hai già fatto):
```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

```


3. **Utilizzo:**
Ora puoi spostarti in qualsiasi cartella del terminale contenente le foto e lanciare:
```bash
greyimg nomefile.jpg

```



## Perché questa scelta?

Mantenere il controllo della pipeline dal terminale ti libera dai vincoli dei percorsi rigidi e dei software pesanti. L'aggiunta di `-strip` non serve solo a limare qualche kilobyte di peso: pulire i file da EXIF, coordinate e profili nascosti è un dettaglio fondamentale quando si pubblica in contesti orientati alla massima riservatezza, come i servizi nascosti in darknet, dove ogni informazione residua è un’impronta di troppo. Un rigo di codice, zero fronzoli, risultato immediato.

