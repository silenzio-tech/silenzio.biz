---
title: "Deploy Turbo: Sincronizzazione intelligente via FTP con Python e Hugo"
date: 2026-09-19T17:03:31+02:00
draft: false
tags: ["hugo", "python", "ftp", "automazione", "sysadmin"]
---
![Deploy Turbo](/images/grey-deploy-turbo.webp)
Quando si gestisce un sito statico generato con Hugo — specialmente se ospitato su un nodo isolato o distribuito su più canali — il processo di build e caricamento può diventare noioso se fatto interamente a mano o affidato a client FTP pesanti.

Per automatizzare tutto in un unico comando senza dipendere da strumenti esterni, ho scritto un semplice script in Bash integrato con Python che compila il sito e si occupa di un upload incrementale basato sul controllo delle dimensioni dei file (`content length`).

### Lo Script di Deploy

Crea un file chiamato `deploy.sh` nella root del tuo progetto Hugo, inserendo questo codice. **Ricordati di sostituire i parametri di connessione** (`FTP_HOST`, `FTP_USER`, `FTP_PASS`) con quelli del tuo server prima di eseguirlo:

```bash
#!/bin/bash

# 1. Compila il sito in locale con Hugo
hugo

# 2. Upload intelligente basato sulle dimensioni dei file via Python
python3 - <<'EOF'
import os
import ftplib

FTP_HOST = "INSERISCI_IP_O_DOMINIO"
FTP_PORT = 21
FTP_USER = "INSERISCI_UTENTE"
FTP_PASS = "INSERISCI_PASSWORD"
LOCAL_DIR = "public"

def sync_ftp():
    print("Connessione al server FTP...")
    ftp = ftplib.FTP()
    ftp.connect(FTP_HOST, FTP_PORT, timeout=10)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.set_pasv(True)

    def upload_recursive(local_path):
        for item in os.listdir(local_path):
            local_item = os.path.join(local_path, item)
            
            if os.path.isdir(local_item):
                # Gestione delle cartelle (es. it, en, css, js)
                try:
                    ftp.cwd(item)
                except ftplib.error_perm:
                    try:
                        ftp.mkd(item)
                        ftp.cwd(item)
                    except ftplib.error_perm as e:
                        print(f"Impossibile creare la cartella {item}: {e}")
                        continue
                
                # Entra ricorsivamente
                upload_recursive(local_item)
                ftp.cwd("..")
            else:
                # Gestione dei file
                local_size = os.path.getsize(local_item)
                remote_size = None
                
                try:
                    remote_size = ftp.size(item)
                except ftplib.error_perm:
                    pass

                if remote_size != local_size:
                    print(f"Caricamento: {item} ({local_size} bytes)")
                    with open(local_item, "rb") as f:
                        ftp.storbinary(f"STOR {item}", f)
                else:
                    print(f"Saltato (uguale): {item}")

    # Entriamo nella directory locale e avviamo la sincronizzazione nella root remota corrente
    os.chdir(LOCAL_DIR)
    upload_recursive(".")
    ftp.quit()
    print("Deploy turbo completato.")

sync_ftp()
EOF
```

### Come configurarlo e utilizzarlo

1. Apri il file `deploy.sh` e modifica le variabili in cima allo script Python con i tuoi dati reali:
   * `FTP_HOST`: l'indirizzo IP o il dominio del tuo server FTP.
   * `FTP_USER`: il tuo nome utente per l'accesso FTP.
   * `FTP_PASS`: la password del tuo account FTP.
2. Rendi lo script eseguibile dal terminale del tuo sistema operativo:
   ```bash
   chmod +x deploy.sh
   ```
3. Esegui il comando ogni volta che vuoi pubblicare le modifiche:
   ```bash
   ./deploy.sh
   ```

### Perché questo approccio?

* **Zero dipendenze pesanti**: Sfrutta le librerie standard di Python (`os`, `ftplib`), quindi non richiede l'installazione di pacchetti complessi o client FTP grafici.
* **Smart Sync**: Controlla la dimensione dei file remoti rispetto a quelli locali (`ftp.size()`). Se un file non è cambiato, viene saltato, riducendo al minimo il traffico di rete e velocizzando drasticamente il rilascio.
* **Struttura ricorsiva**: Naviga automaticamente nell'albero delle directory di Hugo (`public/`), creando le cartelle mancanti sul server remoto al volo.
