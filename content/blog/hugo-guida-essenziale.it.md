+++
title = 'Hugo: guida essenziale al generatore di siti statici'
date = 2026-09-11T09:14:00+02:00
draft = false
tags = ["hugo", "tutorial", "web"]
categories = ["tech"]
+++

![Hugo Tutorial](/images/grey-hugo-tutorial.webp)

Hugo è un generatore di siti statici scritto in Go. Prende file di testo in formato Markdown, li passa attraverso un tema e restituisce un intero sito web composto unicamente da file HTML, CSS e risorse statiche, pronti per essere serviti a velocità fotonica da qualsiasi web server.

Niente database, niente linguaggi lato server, zero manutenzione. Vediamo come si installa e si usa nella pratica quotidiana.

---

### Perché passare a Hugo: i vantaggi rispetto al web dinamico

Abbandonare i CMS dinamici a favore di un generatore statico come Hugo cambia radicalmente le regole del gioco sotto diversi aspetti chiave:

* **Velocità di caricamento estrema:** Non essendoci query al database da eseguire al momento della richiesta né codice lato server da interpretare, il server si limita a restituire file HTML puri. Il risultato sono tempi di caricamento ridotti a pochi millisecondi.
* **Sicurezza totale per-design:** Senza un database SQL da bucare, senza interfacce di login (`/wp-admin`) esposte agli attacchi brute-force e senza plugin terzi, la superficie d'attacco si riduce a zero.
* **Zero manutenzione e longevità:** Un sito statico generato oggi funzionerà identico tra dieci anni, senza subire le classiche rotture dovute ad aggiornamenti PHP, incompatibilità tra plugin o temi deprecati.
* **Hosting semplice, economico ed ecologico:** I file statici possono essere ospitati ovunque con risorse hardware minime. Bastano un web server leggero come Nginx o persino un vecchio smartphone Android.
* **Controllo totale e portabilità:** I tuoi contenuti sono file di testo in formato Markdown salvati localmente. Nessun vincolo proprietario: hai la proprietà assoluta di ogni singolo byte.

---

### 1. Installazione (Tutti gli OS)

Puoi installare Hugo su qualsiasi sistema operativo utilizzando i package manager ufficiali o i binari precompilati. Assicurati di installare la versione **Extended**, necessaria per la gestione dei temi moderni che usano SCSS/SASS.
  
  ```
    Linux (Arch Linux)
    Bash
    pacman -S hugo

    Linux (Altri sistemi / Debian / Ubuntu):
    Bash
    sudo apt install hugo

    macOS:
    Bash
    brew install hugo

    Windows (Winget):
    DOS
    winget install --id Hugo.Hugo.Extended

2. Struttura di base del progetto

Una volta installato, la struttura tipica di un progetto Hugo si compone di poche cartelle chiave:

    content/: Dove risiedono i file Markdown dei tuoi articoli e delle pagine.

    layouts/ o themes/: La struttura grafica e i template HTML.

    static/: Immagini, file CSS personalizzati, favicon e risorse statiche.

    hugo.toml: Il file di configurazione globale del sito.

3. Creare un nuovo post

Per aggiungere un nuovo articolo al blog, lavora direttamente da terminale e file di testo:
Bash

hugo new content/blog/hugo-guida-essenziale.it.md

Il file generato conterrà un front matter con i metadati di base:
Ini, TOML

+++
title = 'Hugo: guida essenziale'
date = 2026-09-11T09:14:00+02:00
draft = false
tags = ["hugo", "tutorial", "web"]
categories = ["tech"]
+++

Qui scrivi il testo del tuo articolo utilizzando la normale sintassi **Markdown**...

Assicurati che la variabile draft sia impostata su false quando sei pronto per la pubblicazione.
4. Anteprima locale in tempo reale

Per avviare il server di sviluppo locale di Hugo e monitorare le modifiche in tempo reale:
Bash

hugo server

Apri il browser all'indirizzo http://localhost:1313.
5. Generare la versione finale (Build)

Quando il sito è pronto e vuoi esportare i file statici definitivi per la produzione, lancia:
Bash

hugo

Questo comando compilerà l'intero sito dentro la cartella public/, pronta per essere trasferita sul server.
