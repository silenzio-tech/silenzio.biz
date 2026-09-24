---
title: "Palestra Markdown: Metti alla prova il tuo nuovo sito Hugo"
date: 2026-09-13T09:28:50+02:00
draft: false
description: "Esercizi pratici in Markdown per prendere confidenza con la formattazione e i renderer di Hugo."
tags:
  - hugo
  - markdown
  - tutorial
  - blog
categories:
  - tecnologia
---

![script](/images/grey-hugo-palestra.webp)
Ecco una proposta di esercizi pratici in Markdown pensati per un articolo su Hugo. Sono strutturati in modo progressivo, dal testo base alle specificità spesso gestite dai renderer di Hugo (Goldmark).

---


Ora che Hugo è installato e hai il tuo sito pronto a partire, è il momento di scrivere il primo vero contenuto. Il Markdown è il linguaggio che userai per il 90% del tempo: leggero, portabile e pensato per farti concentrare sulle idee e non sulla formattazione.

Metti alla prova i tuoi file `.md` risolvendo i 5 esercizi qui sotto. Crea un post di test (es. `hugo new posts/esercizio-markdown.md`) e prova a replicare i risultati.

---

## Esercizio 1: La formattazione base e i titoli

Crea un piccolo testo che contenga esattamente questagerarchia ed enfasi:

* Un titolo principale (H1) con il nome del tuo esercizio.
* Un sottotitolo (H2) chiamato "Introduzione".
* Un paragrafo in cui **una parola sia in grassetto**, *una in corsivo* e una barrata (usa i doppi tilde `~~testo~~`).
* Un sottotitolo (H2) chiamato "Conclusioni" seguito da una riga di separazione orizzontale (`---`).

---

## Esercizio 2: Liste e task list (To-Do)

Hugo e Goldmark supportano le liste di controllo interattive (spesso convertite in checkbox dai temi). Scrivi una lista della spesa o dei passaggi per scrivere un post, composta da:

* Due elementi già completati (spuntati).
* Due elementi ancora da fare (non spuntati).
* Una sottolista annidata sotto uno degli elementi da fare, con almeno due sotto-punti.

---

## Esercizio 3: Blocchi di codice con sintassi evidenziata

Nei blog tecnici o d'autore capita spesso di citare del codice. Riporta un blocco di codice Bash e un blocco di codice Go o YAML (molto usati nei file di configurazione di Hugo come `hugo.toml`).

* *Requisito:* Specifica sempre il linguaggio dopo i tre backticks (es. ```yaml) per attivare l'highlighting di Hugo.
* *Esempio da inserire:* Il comando per creare un nuovo sito e l'avvio del server di sviluppo.

---

## Esercizio 4: Citazioni e callout (Markdown esteso)

Crea una citazione classica usando il simbolo `>`.

* Subito sotto, prova a inserire una nota o un avviso formattato (molti temi Hugo usano la sintassi dei blockquote speciali o i shortcode, ma prova prima la forma standard):
> **Nota bene:** Ricordati di impostare `draft: false` nel frontmatter quando sei pronto a pubblicare, altrimenti Hugo nasconderà l'articolo in fase di build.



---

## Esercizio 5: Tabelle e link

Realizza una piccola tabella comparativa a tre colonne:

1. **Tool / Linguaggio**
2. **Funzione**
3. **Voto personale (1-10)**

Inserisci almeno tre righe (es. Hugo, Markdown, Git). Sotto la tabella, inserisci un link ipertestuale formattato correttamente che punti alla documentazione ufficiale di Hugo (`[https://gohugo.io](https://gohugo.io)`).

---

### Soluzione / Riferimento rapido per il controllo

Quando hai finito, il sorgente del tuo file Markdown dovrebbe assomigliare a questo schema pulito:

```markdown
---
title: "Esercizi Markdown"
date: 2026-09-13T09:24:39+02:00
draft: true
---

# Il mio test

## Introduzione
Questo è un paragrafo con **grassetto**, *corsivo* e ~~barrato~~.

## Conclusioni
---

- [x] Installare Hugo
- [x] Creare il sito
- [ ] Scrivere il primo post
  - [ ] Revisione bozza
  - [ ] Controllo link

```

*Consiglio da terminale:* lancia `hugo server -D` nella directory del tuo progetto e apri `http://localhost:1313` per vedere in tempo reale come il tema interpreta i tuoi esercizi.
