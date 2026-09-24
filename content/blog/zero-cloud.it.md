+++
title = 'Zero cloud, zero intermediari: pubblicare un sito Hugo via ADB'
date = 2026-09-11T11:03:00+02:00
draft = false
tags = ["hugo", "android", "adb", "privacy"]
categories = ["tech"]
translationKey = "zero-cloud-adb"
+++
![script](/images/grey-script.webp)
Nel panorama dello sviluppo web moderno, la complessità è diventata lo standard: pannelli di controllo pesanti, database relazionali, script di build cloud e dipendenze che si rompono a ogni aggiornamento. Ma se l'obiettivo è la massima sovranità digitale, la strada da percorrere è esattamente opposta: sottrarsi alle infrastrutture centralizzate e riportare ogni singolo byte sotto il proprio controllo fisico.

Utilizzando Arch Linux come stazione di lavoro locale, Hugo per la generazione dei file statici e un cavo USB per il trasferimento, è possibile allestire un flusso di pubblicazione che non tocca mai internet.

### Il flusso di lavoro locale

Il processo si basa su uno script Bash minimale (`pubblica.sh`) che esegue tre semplici passaggi: pulizia della build precedente, compilazione tramite Hugo e trasferimento atomico dei file direttamente sullo storage interno di un dispositivo Android adibito a server locale.

Il codice dello script è essenziale:

```bash
#!/bin/bash
set -e

echo "==> Compilazione sito Hugo..."
hugo --cleanDestinationDir

echo "==> Pulizia server Android..."
adb shell rm -rf /sdcard/htdocs/*

echo "==> Sincronizzazione nuovi file via ADB..."
adb push public/. /sdcard/htdocs/

echo "==> Pubblicazione completata con successo!"

```

### Perché questa scelta?

* **Isolamento totale:** Nessuna chiave SSH esposta su server remoti, nessun rischio di attacchi di forza bruta sulla porta di amministrazione.
* **Velocità chirurgica:** Il protocollo ADB permette di trasferire l'intero albero del sito web in frazioni di secondo direttamente sulla memoria del dispositivo.
* **Nessun intermediario:** Dal file Markdown scritto in locale all'esecuzione sul web server, non esiste alcun cloud di terze parti a fare da tramite.

---

Rendere lo script eseguibile e lanciarlo

Prima di poter utilizzare lo script per la prima volta, è necessario concedergli i permessi di esecuzione direttamente dal terminale di Arch Linux:
Bash

chmod +x pubblica.sh

Una volta fatto questo, ogni volta che vorrai pubblicare le modifiche ti basterà lanciare il comando dalla cartella principale del tuo progetto Hugo:
Bash

./pubblica.sh

---

*Domani, in un prossimo articolo, vedremo come fare il passo successivo: configurare un server FTP sicuro all'interno di KSWEB su Android e mappare un secondo indirizzo Onion dedicato, così da poter aggiornare e gestire i contenuti anche da remoto senza rinunciare ai principi di massima privacy.*

```

```
