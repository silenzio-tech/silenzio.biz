+++
title = "L'importanza dei canali di comunicazione asincroni e cifrati"
date = 2026-09-15T09:30:00+02:00
draft = false
tags = ["pgp", "tor", "privacy", "briar", "security"]
categories = ["Crittografia"]
summary = "Una riflessione sull'uso combinato di chiavi OpenPGP per le e-mail e client P2P su rete Tor per proteggere i contenuti e oscurare i metadati contro la sorveglianza di massa."
+++
![cifratura](/images/grey-cifratura.webp)
La sorveglianza di massa contemporanea si basa in larghissima parte sulla centralizzazione dei metadati e sull'analisi dei modelli di traffico in tempo reale. I canali di comunicazione tradizionali — e persino le piattaforme di messaggistica istantanea cifrate ma centralizzate — rivelano inevitabilmente *chi* parla con *chi*, *quando* e con quale *frequenza*. 

In questo scenario, la resilienza non si ottiene affidandosi a un unico strumento, ma combinando strategie complementari per il canale asincrono (e-mail) e per quello sincrono/p2p.

### 1. La posta elettronica e la cifratura asincrona (OpenPGP)

L'e-mail rimane uno dei protocolli federati e asincroni più longevi e stabili. Il destinatario non deve essere online nel momento in cui il messaggio viene inviato, rendendo la comunicazione resistente a interruzioni temporanee di rete.

* **Inviolabilità del contenuto:** L'impiego di chiavi OpenPGP (via GPG) garantisce che il corpo del messaggio sia cifrato end-to-end sul dispositivo del mittente e decifrato esclusivamente dal destinatario.
* **Autenticità e non ripudiabilità:** La firma digitale apposta tramite chiave privata assicura l'integrità del testo e l'identità dell'autore, neutralizzando attacchi di tipo *man-in-the-middle*.
* **Limitazione strutturale:** I metadati e-mail (intestazioni, mittente, destinatario, orario e oggetto) restano visibili agli MTA (Mail Transfer Agent) lungo la rotta di consegna, richiedendo garanzie aggiuntive a livello di rete per nascondere la sorgente (es. invio tramite nodi di uscita Tor).

### 2. Messaggistica peer-to-peer su rete Tor (es. Briar)

Per la comunicazione diretta o la messaggistica a breve termine, la centralizzazione dell'infrastruttura costituisce un singolo punto di vulnerabilità (*Single Point of Failure*).

* **Architettura priva di server centrali:** I client P2P basati su Tor non si collegano a server proprietari. I messaggi transitano direttamente da un nodo all'altro della rete tramite servizi nascosti (`.onion`), eliminando la presenza di intermediari in grado di memorizzare o vendere registri di connessione.
* **Anonimizzazione dei metadati:** Incapsulando il traffico all'interno dei circuiti Tor, viene nascosta l'origine geografica, l'indirizzo IP e la topologia delle relazioni tra i nodi della conversazione.
* **Resilienza offline:** Architetture come quella di Briar supportano il transito dei messaggi anche fuori da internet, sfruttando mesh localizzate via Bluetooth o Wi-Fi per la sincronizzazione al momento della riconnessione.

---

### Confronto sintetico dei modelli

| Proprietà | OpenPGP / GPG (E-mail) | P2P su rete Tor (es. Briar) |
| :--- | :--- | :--- |
| **Modello di consegna** | Asincrono (Store-and-Forward) | Sincrono / P2P diretto |
| **Protezione contenuto** | Cifratura a chiave pubblica | Cifratura end-to-end nativa |
| **Protezione metadati** | Parziale (richiede reti di trasporto anonime) | Elevata (oscurati dai nodi Tor) |
| **Dipendenza da infrastrutture** | Server SMTP/IMAP federati | Nessuna (client-to-client) |
| **Caso d'uso ideale** | Comunicazioni formali, documenti differiti | Conversazioni riservate ad alta aderenza |

L'integrazione di questi due paradigmi permette di coprire l'intero spettro delle esigenze operative: l'e-mail cifrata garantisce la persistenza e l'asincronicità necessaria per documenti e testi complessi; il P2P su rete Tor offre la massima riservatezza per lo scambio immediato di informazioni, minimizzando la superficie d'attacco esposta alla sorveglianza passiva.
