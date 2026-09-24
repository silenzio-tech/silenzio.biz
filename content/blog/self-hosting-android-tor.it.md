+++
date = '2026-09-10T16:30:00+02:00'
draft = false
title = 'Self-Hosting Minimalista su Android: Server Web Locale e Servizio Hidden Tor'
+++

![Hacker](/images/grey-hacker.webp)
Pubblicare contenuti sul Web senza dipendere da provider terzi, Big Tech o infrastrutture cloud proprietarie è il primo passo verso una reale autonomia digitale.

In questo articolo vediamo come trasformare un vecchio dispositivo Android in un server web statico a basso consumo, raggiungibile ovunque tramite rete Tor grazie a **KSWEB** e **Orbot**.

---

### Perché questo approccio?

* **Zero costi d'infrastruttura**: Nessun dominio da acquistare, nessun VPS mensile.
* **Impronta ecologica e consumi minimi**: Un hardware Android riduce al minimo l'assorbimento elettrico rispetto a un server desktop.
* **Privacy strutturale**: Nessun indirizzo IP pubblico esposto; il sito risiede interamente dietro la cifratura dei servizi nascosti (*Hidden Services*) della rete Tor.

---

### 1. Preparazione dell'ambiente: KSWEB

Per servire le pagine statiche generate da Hugo, utilizziamo **KSWEB**, una suite lightweight che include un server Lighttpd/Nginx ottimizzato per Android.

1. Installa KSWEB sul dispositivo.
2. Configura la directory principale del server (*Root Directory*) facendola puntare al percorso di memoria locale, ad esempio:
   `/sdcard/htdocs/`
3. Imposta la porta di ascolto HTTP su `8080`.
4. Avvia il server web in background.

A questo punto, le pagine presenti nella cartella `/sdcard/htdocs/` saranno visibili all'interno della rete locale digitando l'IP del telefono (es. `http://192.168.1.X:8080`).

---

### 2. Esposizione sulla rete Tor: Orbot

Per rendere la cartella web accessibile dall'esterno senza ricorrere al port forwarding del router o a IP pubblici, incanaliamo il traffico tramite **Orbot**.

1. Apri **Orbot** e accedi alla sezione **Onion Services** (Servizi Nascosti / Tor Services).
2. Crea un nuovo servizio nascosto con i seguenti parametri:
   * **Nome**: `blog` (o un identificativo a tua scelta)
   * **Porta Virtuale (External Port)**: `80`
   * **Porta Target (Internal Port)**: `8080` (la porta configurata su KSWEB)
3. Salva la configurazione e avvia Tor.

Orbot genererà automaticamente un indirizzo univoco con estensione `.onion` (es. `http://xyz...xyz.onion`).

---

### 3. Flusso di lavoro per la pubblicazione

L'infrastruttura così configurata consente un ciclo di pubblicazione rapido tramite riga di comando Linux:

1. Scrittura e compilazione locale del sito statico con Hugo.
2. Sincronizzazione automatizzata dei file compilati tramite `adb` dal PC al telefono:
   ```bash
   adb push public/* /sdcard/htdocs/
CONTINUA...
