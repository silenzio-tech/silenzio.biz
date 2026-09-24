---
title: "Deploy Turbo: Smart Sync via FTP with Python and Hugo"
date: 2026-09-19T17:03:31+02:00

tags: ["hugo", "python", "ftp", "automation", "sysadmin"]
---
![Deploy Turbo](/images/grey-deploy-turbo.webp)
When managing a static site generated with Hugo — especially if hosted on an isolated node or distributed across multiple channels — the build and upload process can become tedious if done entirely by hand or left to heavy FTP clients.

To automate everything in a single command without depending on external tools, I wrote a simple script in Bash integrated with Python that compiles the site and takes care of an incremental upload based on file size control (`content length`).

### The Deploy Script

Create a file called `deploy.sh` in the root of your Hugo project, inserting this code. **Remember to replace the connection parameters** (`FTP_HOST`, `FTP_USER`, `FTP_PASS`) with those of your server before running it:

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

### How to set it up and use it

1. Open the `deploy.sh` file and modify the variables at the top of the Python script with your real data:
   * 
   * `FTP_USER`: Your username for FTP access.
   * `FTP_PASS`: Your FTP account password.
2. Make the script executable from your operating system's terminal:
   ```bash
   chmod +x deploy.sh
   ```
3. Run the command every time you want to publish the changes:
   ```bash
   ./deploy.sh
   ```

### Why this approach?

* **Zero heavy dependencies**: Leverages standard Python libraries (`os`, `ftplib`), so does not require installing complex packages or graphical FTP clients.
* **Smart Sync**: Controls the size of remote files versus local files (`ftp.size()`). If a file has not changed, it is skipped, minimizing network traffic and dramatically speeding up release.
* **Recursive structure**: Automatically navigate Hugo's directory tree (`public/`), creating missing folders on the remote server on the fly.