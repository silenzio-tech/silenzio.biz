+++
title = "Mettere a dieta l'ISP: DNS-over-TLS, nftables e routing isolato su rete Tor"
date = 2026-09-15T10:00:00+02:00
draft = false
tags = ["arch-linux", "dns-over-tls", "nftables", "quad9", "tor", "privacy", "bash"]
categories = ["Sysadmin"]
summary = "Guida completa alla messa in sicurezza delle query DNS su Arch Linux: cifratura DoT con systemd-resolved, filtraggio preventivo tramite nftables e switch dinamico verso il resolver locale Tor."
+++
![DNS over TLS](/images/grey-dns-over-tls.webp)
Ogni volta che digiti un indirizzo web o avvi un servizio in rete, la prima operazione invisibile effettuata dal sistema è la risoluzione DNS. Di default, la maggior parte dei sistemi operativi invia queste richieste in chiaro al resolver dell'Internet Service Provider (ISP) sulla porta `53/UDP`. Il risultato è un tracciamento sistematico: l'ISP può registrare, analizzare e conservare l'intero registro dei domini visitati, anche se il traffico applicativo successivo è protetto da cifratura HTTPS.

Per neutralizzare questa sorveglianza passiva a livello di trasporto, occorre implementare una strategia a tre livelli: **cifrare le query ordinarie** (DNS-over-TLS), **impedire perdite di dati in chiaro a livello di kernel** (`nftables`) e **instradare le query sensibili direttamente nella rete Tor**.

---

### 1. Cifratura base: DNS-over-TLS con `systemd-resolved`

Il primo passo per eliminare il tracciamento dell'ISP consiste nel cifrare le richieste di risoluzione ordinarie. L'uso di `systemd-resolved` in combinazione con un provider rispettoso della riservatezza (come Quad9) permette di veicolare il traffico DNS all'interno di un canale cifrato TLS sulla porta `853/TCP`.

Configura il file `/etc/systemd/resolved.conf`:

```ini
[Resolve]
DNS=9.9.9.9#dns.quad9.net 149.112.112.112#dns.quad9.net 2620:fe::fe#dns.quad9.net
FallbackDNS=1.1.1.1#cloudflare-dns.com
DNSOverTLS=yes
DNSSEC=yes
Cache=yes

```

#### Dettagli operativi della configurazione:

* **SNI e validazione TLS (`#dns.quad9.net`):** Il sistema non si limita a inviare pacchetti cifrati, ma verifica l'identità del server remoto controllandone il certificato X.509 prima di inviare dati.
* **DNSSEC:** Garantisce che le risposte ricevute non siano state manomesse lungo il percorso (prevenzione di attacchi di cache poisoning).

Dopo la modifica, applica le impostazioni e verifica l'attivazione del canale DoT:

```bash
sudo systemctl restart systemd-resolved
resolvectl status

```

---

### 2. Blindatura di rete: blocco stretto dei leak su porta 53 via `nftables`

La sola configurazione del resolver di sistema non garantisce la totale assenza di leak. Applicazioni malevole, script non controllati o binari con resolver integrati potrebbero tentare di bypassare `systemd-resolved` inviando socket diretti in chiaro sulla porta `53/UDP` o `53/TCP`.

Per evitare qualsiasi fuga di metadati verso l'ISP, si applica una politica restrittiva tramite `nftables` sulla catena di `output`:

```nftables
table inet filter {
    chain output {
        type filter hook output priority 0; policy accept;

        # Consenti il traffico DNS cifrato su porta 853 (DoT)
        tcp dport 853 accept

        # Consenti risoluzione locale verso il daemon Tor / resolver interni
        ip daddr 127.0.0.1 udp dport 5353 accept
        ip daddr 127.0.0.1 tcp dport 5353 accept

        # DROP drastico di qualsiasi query DNS in chiaro diretta all'esterno su porta 53
        udp dport 53 drop
        tcp dport 53 drop
    }
}

```

Grazie a questa struttura, l'infrastruttura di filtraggio del kernel delibera l'intercettazione e lo scarto (`drop`) di ogni pacchetto in chiaro direzionato verso l'esterno sulla porta 53.

---

### 3. Instradamento avanzato: switch dinamico verso il listener DNS locale di Tor

Nelle sessioni operative ad elevata riservatezza, inviare richieste DNS a resolver pubblici (seppur cifrati via TLS) espone comunque l'indirizzo IP del client alle tabelle dei resolver centralizzati. Per ottenere l'anonimizzato completo dei metadati di risoluzione, le query devono essere elaborate direttamente dai nodi della rete Tor.

#### A. Configurazione del daemon Tor (`/etc/tor/torrc`)

Abilita il listener DNS interno di Tor sulla porta di loopback locale:

```ini
DNSPort 127.0.0.1:5353
AutomapHostsOnResolve 1
AutomapHostsSuffixes .onion,.exit

```

#### B. Automatizzazione dello switch tramite alias di Shell (`~/.bashrc`)

Per commutare rapidamente l'ambiente di rete tra la modalità cifrata ordinaria (DoT Quad9) e la modalità isolata anonima (Tor DNS), definisci i seguenti alias nel tuo file di configurazione della shell:

```bash
# Attiva l'instradamento DNS esclusivo su rete Tor
alias tordns-on='sudo resolvectl dns wlan0 127.0.0.1:5353 && sudo resolvectl domain wlan0 "~." && echo "[+] DNS di sistema reindirizzato su Tor (127.0.0.1:5353)"'

# Ripristina il resolver di sistema standard cifrato (DoT Quad9)
alias tordns-off='sudo resolvectl revert wlan0 && echo "[+] DNS di sistema ripristinato su Quad9 (DoT)"'

```

*Nota: sostituisci `wlan0` con la tua interfaccia di rete attiva.*

---

### Architettura di protezione a confronto

| Parametro / Livello | DNS Standard (ISP) | DNS-over-TLS (Quad9) | Tor DNS Listener (Local) |
| --- | --- | --- | --- |
| **Porta di Trasporto** | `53/UDP` o `53/TCP` | `853/TCP` | `5353/UDP` (Loopback) |
| **Visibilità per l'ISP** | Totale (testo in chiaro) | Nessuna (traffico cifrato) | Nessuna (traffico interno alla rete Tor) |
| **Protezione IP Client** | Assente | Nessuna (l'IP invia le query al resolver) | Elevata (l'IP è nascosto dalla rete di nodi) |
| **Protezione Leak (`nftables`)** | Vulnerabile | Garantita (blocco porta 53) | Garantita (blocco porta 53 + isolamento loopback) |
| **Caso d'uso ideale** | Nessuno (da evitare) | Navigazione ordinaria, streaming, update | Ricerca riservata, analisi threat-intel, servizi `.onion` |

Mettere a dieta l'ISP significa azzerare i metadati generati dalla propria interfaccia di rete. L'unione di cifratura TLS, filtraggio nativo nel kernel e commutazione dinamica verso Tor trasforma il resolver di sistema in un'infrastruttura resiliente e priva di punti di perdita di dati.
