---
title: "Quando l'FTP incontra Tor: cronaca di un fallimento annunciato"
date: 2026-09-12T14:18:29+02:00
draft: false
author: "silenzio"
categories: ["Tech", "Sysadmin"]
tags: ["linux", "archlinux", "hugo", "tor", "ftp", "android", "networking"]
summary: "Cronaca tecnica di un tentativo fallito di automatizzare il deploy di un sito Hugo via FTP attraverso un indirizzo .onion su Android, e dei limiti strutturali del protocollo."
---

![FTP](/images/grey-ftp-server.webp)
Gestire un sito statico generato con Hugo su un server Android locale nascosto dietro un indirizzo `.onion` sembrava l'esercizio di sovranità digitale perfetto. Nessun cloud centralizzato, controllo totale dell'infrastruttura, massima resilienza. Eppure, la realtà dei protocolli di rete sa essere testarda.

Negli ultimi giorni ho tentato di automatizzare il deploy di questo blog verso il server FTP in esecuzione su Android (tramite KSWEB), passando rigorosamente attraverso il proxy SOCKS locale di Tor (`127.0.0.1:9050`). Il risultato è stato un muro continuo di errori `ECONNABORTED`, handshake falliti e timeout inesorabili. 

Il motivo tecnico è tanto semplice quanto frustrante: l'FTP (File Transfer Protocol), nato in un'era in cui la gestione dei tunnel cifrati e dei proxy non era un pensiero primario, richiede l'apertura dinamica di canali dati separati rispetto al canale di controllo. Quando provi a instradare questo flusso continuo di porte negoziate al volo attraverso il circuito di Tor, il proxy SOCKS perde il filo, satura la connessione e chiude tutto. 

### I tentativi sul campo

Abbiamo esplorato diverse strade, tutte metodicamente sbattute contro il medesimo limite strutturale:

1. **Tentativo via script Bash con `curl` (file singoli):** L'uso di `--socks5-hostname` aggirava la risoluzione DNS locale, ma il ciclo di upload sequenziale dei file generati da Hugo ha fatto collassare rapidamente il circuito Tor sotto il peso delle richieste multiple:
   ```bash
   curl --socks5-hostname 127.0.0.1:9050 -u "$FTP_USER:$FTP_PASS" \
        -T "$filepath" "ftp://$ONION_HOST:$PORT/$filepath" \
        --ftp-create-dirs --connect-timeout 30 --retry 3
   # Risultato: curl: (97) cannot complete SOCKS5 connection... (5)

    Tentativo via script Bash con archivio unico (tar.gz): Ridurre tutto a un unico file compresso per limitare le aperture di socket non è bastato a ingannare la rigidità del proxy SOCKS:
    Bash

    tar -czf site.tar.gz .
    curl --socks5-hostname 127.0.0.1:9050 -u "$FTP_USER:$FTP_PASS" \
         -T "site.tar.gz" "ftp://$ONION_HOST:$PORT/site.tar.gz"
    # Risultato: Stesso errore SOCKS5 97 in fase di streaming.

    Tentativo manuale con FileZilla: Forzando la modalità passiva, azzerando l'autenticazione lato server e limitando il client a una sola connessione simultanea per evitare flussi paralleli, la risposta del proxy è rimasta implacabile:
    Plaintext

    Errore: Richiesta proxy fallita. Risposta dal proxy: Errore generico server SOCKS
    Errore: Handshake proxy non riuscito: ECONNABORTED - Connessione interrotta

Arrivati a questo punto, l'accanimento terapeutico non ha senso: abbiamo ufficialmente lasciato la spugna sull'accoppiata FTP e Tor per questo tipo di flussi.
La parola ai lettori

Apro il tavolo a chi legge: voi come avete risolto il dilemma del deploy su server edge o mobili nascosti dietro reti di anonimato? Ha senso abbandonare l'FTP e migrare tutto verso un demone SFTP puro (che incanala controllo e dati in un unico flusso TCP), o è preferibile archiviare la sincronizzazione remota e affidarsi a metodi offline via cavo (come ADB)?

Lasciate la vostra esperienza nei commenti o via PGP.
