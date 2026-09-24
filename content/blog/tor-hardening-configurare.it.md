---
title: "Tor Hardening: Configurare Lighttpd su Android per servire un Hidden Service"
date: 2026-09-14
draft: false
tags: ["tor", "Lighttpd", "privacy", "security", "darkweb", "Tor Hardening"]
---
![Lighttpd](/images/grey-lighttpd-web-server.webp)
### Tor Hardening: Configurare Lighttpd su Android per Servire un Hidden Service

Configurare un server web locale su un ambiente Android (tramite suite come KSWEB) per ospitare un servizio nascosto sulla rete Tor richiede accorgimenti specifici per evitare il tracciamento, prevenire la fuga di dati e ottimizzare l'uso delle risorse hardware del dispositivo mobile.

Di seguito viene analizzata la struttura di una configurazione **Lighttpd** ottimizzata per garantire anonimato, stabilità e sicurezza.

---

### Strategie di Hardening Applicate

* **Isolamento dell'interfaccia (`server.bind = "127.0.0.1"`):** Forza il server ad ascoltare esclusivamente sull'interfaccia di loopback locale. Questo impedisce l'accesso diretto al server web da parte di altri dispositivi connessi alla stessa rete Wi-Fi/LAN, instradando il traffico unicamente attraverso il demone Tor.
* **Mascheramento dell'identità del server (`server.tag = "nginx"`):** Sovrascrive l'header HTTP `Server` sostituendo la stringa di versione nativa di Lighttpd con una generica per Nginx. Questa misura ostacola la profilazione (fingerprinting) dello stack software da parte di un attaccante esterno.
* **Rimozione degli header di tracciamento e proxy (`setenv.set-request-header`):** Cancella le intestazioni HTTP potenzialmente pericolose (`Forwarded`, `X-Forwarded-For`, `X-Real-IP`) che potrebbero veicolare l'indirizzo IP reale o dettagli del percorso di rete.
* **Gestione degli ETag e Caching (`etag.use` e `set-response-header`):** Disabilita la generazione degli ETag e sovrascrive il relativo header di risposta a valore vuoto (`"ETag" => ""`) per prevenire il tracciamento degli utenti basato sulle risorse memorizzate nella cache del browser.
* **Minimizzazione delle risorse e timeout restrittivi:** Limita il numero di connessioni simultanee (`server.max-connections = 512`) e imposta timeout aggressivi sulle connessioni *keep-alive* e *idle* per mitigare attacchi di tipo Denial of Service (DoS) e preservare la RAM e la batteria del dispositivo Android.
* **Disattivazione dei moduli non necessari:** Mantiene attivi solo i moduli strettamente indispensabili per il caricamento di un sito statico (`mod_staticfile`, `mod_setenv`, `mod_indexfile`), escludendo script dinamici (`mod_fastcgi`, `mod_cgi`) e logging di accesso (`mod_accesslog`) per garantire zero persistenza dei dati relativi ai visitatori.

---

### File di Configurazione Completo (`lighttpd.conf`)

```toml
########
# Impostazioni di sistema KSWEB (Non rimuovere)
#begin_docroot
server.document-root = "/storage/emulated/0/htdocs"
#end_docroot

#begin_port
server.port = "8000"
#end_port

# [TOR-HARDENING] Isolamento su interfaccia di loopback (ascolto solo da localhost / Tor)
server.bind = "127.0.0.1"

#begin_hosts
#end_hosts
########

server.errorlog = "/data/user/0/ru.kslabs.ksweb/components/log/lighttpd/lighttpd.log"

# [TOR-HARDENING] Disabilita il directory listing
dir-listing.activate = "disable"

# [TOR-HARDENING] Maschera la versione di lighttpd
server.tag = "nginx"

# [TOR-HARDENING] Disabilita la generazione degli ETag
etag.use = ()

# [TOR-HARDENING] Disabilita HTTP/2 cleartext (h2c)
server.feature-flags += ( "server.h2c" => "disable" )

index-file.names = ("index.html", "index.htm", "index.php")

# Caricamento moduli: mod_setenv in fondo per elaborare gli header di risposta
server.modules = (
    "mod_indexfile",
    "mod_access",
# [TOR-HARDENING] Nessun log di accesso su hidden service
#   "mod_accesslog",
    "mod_alias",
    "mod_redirect",
    "mod_rewrite",
    "mod_deflate",
    "mod_expire",
    "mod_dirlisting",
    "mod_staticfile",
    "mod_setenv"
)

# [TOR-HARDENING] Timeout restrittivi: riducono connessioni idle e carico CPU/RAM
server.max-keep-alive-requests = 10
server.max-keep-alive-idle = 5
server.max-read-idle = 30
server.max-write-idle = 30
server.max-connections = 512
server.kbytes-per-second = 8192
connection.kbytes-per-second = 8192
server.protocol-http11 = "enable"

# [TOR-HARDENING] Rimozione attiva di header di forwarding
setenv.set-request-header = (
    "Forwarded" => "",
    "X-Forwarded-For" => "",
    "X-Forwarded-Proto" => "",
    "X-Real-IP" => ""
)

# [TOR-HARDENING] Sovrascrittura forzata dell'header ETag a valore vuoto
setenv.set-response-header = (
    "ETag" => ""
)

auth.backend = "plain"

## MimeType handling
mimetype.use-xattr = "disable"

mimetype.assign = (
  ".appcache"     =>      "text/cache-manifest",   
  ".pdf"          =>      "application/pdf",
  ".sig"          =>      "application/pgp-signature",
  ".spl"          =>      "application/futuresplash",
  ".class"        =>      "application/octet-stream",
  ".ps"           =>      "application/postscript",
  ".torrent"      =>      "application/x-bittorrent",
  ".dvi"          =>      "application/x-dvi",
  ".gz"           =>      "application/x-gzip",
  ".pac"          =>      "application/x-ns-proxy-autoconfig",
  ".swf"          =>      "application/x-shockwave-flash",
  ".tar.gz"       =>      "application/x-tgz",
  ".tgz"          =>      "application/x-tgz",
  ".tar"          =>      "application/x-tar",
  ".zip"          =>      "application/zip",
  ".mp3"          =>      "audio/mpeg",
  ".m3u"          =>      "audio/x-mpegurl",
  ".wma"          =>      "audio/x-ms-wma",
  ".wax"          =>      "audio/x-ms-wax",
  ".ogg"          =>      "application/ogg",
  ".wav"          =>      "audio/x-wav",
  ".gif"          =>      "image/gif",
  ".jpg"          =>      "image/jpeg",
  ".jpeg"         =>      "image/jpeg",
  ".png"          =>      "image/png",
  ".webp"         =>      "image/webp",
  ".xbm"          =>      "image/x-xbitmap",
  ".xpm"          =>      "image/x-xpixmap",
  ".xwd"          =>      "image/x-xwindowdump",
  ".css"          =>      "text/css",
  ".html"         =>      "text/html",
  ".htm"          =>      "text/html",
  ".js"           =>      "text/javascript",
  ".asc"          =>      "text/plain",
  ".c"            =>      "text/plain",
  ".cpp"          =>      "text/plain",
  ".log"          =>      "text/plain",
  ".conf"         =>      "text/plain",
  ".text"         =>      "text/plain",
  ".txt"          =>      "text/plain",
  ".spec"         =>      "text/plain",
  ".dtd"          =>      "text/xml",
  ".xml"          =>      "text/xml",
  ".mpeg"         =>      "video/mpeg",
  ".mpg"          =>      "video/mpeg",
  ".mov"          =>      "video/quicktime",
  ".qt"           =>      "video/quicktime",
  ".avi"          =>      "video/x-msvideo",
  ".asf"          =>      "video/x-ms-asf",
  ".asx"          =>      "video/x-ms-asf",
  ".wmv"          =>      "video/x-ms-wmv",
  ".bz2"          =>      "application/x-bzip",
  ".tbz"          =>      "application/x-bzip-compressed-tar",
  ".tar.bz2"      =>      "application/x-bzip-compressed-tar",
  ".odt"          =>      "application/vnd.oasis.opendocument.text",
  ".ods"          =>      "application/vnd.oasis.opendocument.spreadsheet",
  ".odp"          =>      "application/vnd.oasis.opendocument.presentation",
  ".odg"          =>      "application/vnd.oasis.opendocument.graphics",
  ".odc"          =>      "application/vnd.oasis.opendocument.chart",
  ".odf"          =>      "application/vnd.oasis.opendocument.formula",
  ".odi"          =>      "application/vnd.oasis.opendocument.image",
  ".odm"          =>      "application/vnd.oasis.opendocument.text-master",
  ".ott"          =>      "application/vnd.oasis.opendocument.text-template",
  ".ots"          =>      "application/vnd.oasis.opendocument.spreadsheet-template",
  ".otp"          =>      "application/vnd.oasis.opendocument.presentation-template",
  ".otg"          =>      "application/vnd.oasis.opendocument.graphics-template",
  ".otc"          =>      "application/vnd.oasis.opendocument.chart-template",
  ".otf"          =>      "application/vnd.oasis.opendocument.formula-template",
  ".oti"          =>      "application/vnd.oasis.opendocument.image-template",
  ".oth"          =>      "application/vnd.oasis.opendocument.text-web",
  ".webm"         =>      "video/webm",
  ".weba"         =>      "audio/webm",
  ".svg"          =>      "image/svg+xml",
  ""              =>      "application/octet-stream"
)

# File upload limits
server.max-request-size = 1000000
server.upload-dirs = ( "/data/data/ru.kslabs.ksweb/tmp" )

```

---

### Test e Verifica della Risposta

Per verificare l'efficacia delle configurazioni tramite un client di test (es. `curl` instradato via proxy SOCKS5 Tor):

```bash
curl -Iv -x socks5h://127.0.0.1:9052 http://<vostro-indirizzo-v3>.onion/

```

**Esito atteso nel dump degli header:**

* Presenza di `HTTP/1.1 200 OK`.
* Presenza di `Server: nginx` (versione reale dissimulata).
* Assenza completa dell'header `ETag` e di riferimenti all'IP locale o al sistema Android.
