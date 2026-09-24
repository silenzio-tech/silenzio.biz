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
