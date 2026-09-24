---
title: "Trasloca Hugo dove vuoi tu"
date: 2026-09-17T19:25:00+02:00
draft: false
---
![Trasloco di Hugo](/images/grey-trasloco-hugo.webp)
Cambiare computer o passare a una nuova distribuzione Linux (come CachyOS) spesso fa temere procedure di migrazione complesse. Con Hugo, la realtà è radicalmente diversa: la portabilità è totale e priva di attriti.

### Perché spostare un sito Hugo è banale
* **Zero dipendenze esterne:** Non ci sono database da esportare, configurazioni di server web complesse da replicare o dipendenze di backend da rincorrere.
* **Tutto in una cartella:** Codice sorgente, temi, configurazioni (`hugo.toml`) e contenuti in formato Markdown risiedono nello stesso posto.
* **Indipendenza dall'ambiente:** Se il binario di Hugo gira, il sito gira esattamente allo stesso modo.

### La procedura di backup e ripristino in 3 mosse

* **1. Creazione dell'archivio (dal vecchio sistema):**
  Comprimi la cartella del blog direttamente dalla tua home:
  ```bash
  tar -czvf hugo-blog-backup.tar.gz il-mio-blog/
  ```

* **2. Estrazione (sul nuovo sistema):**
  Sposta l'archivio nella nuova home ed estrailo (puoi farlo via terminale o con il gestore grafico):
  ```bash
  tar -xzvf hugo-blog-backup.tar.gz
  ```

* **3. Verifica e test operativo:**
  Entra nella cartella e avvia il server di sviluppo integrato:
  ```bash
  cd il-mio-blog
  hugo server
  ```

Apri `http://localhost:1313` nel browser: il blog è perfettamente operativo, senza sorprese.
