+++
title = "Isolamento del Wallet Monero in Qubes-Whonix"
date = 2026-09-23
draft = false
tags = ["monero", "whonix", "qubes", "privacy", "sicurezza"]
categories = ["guide"]
+++

![Monero Whonix](/images/grey-monero-whonix.webp)

Questa guida spiega come isolare la parte di rete (`monerod`) dalla parte del portafoglio (Monero Wallet) per ottenere una sicurezza superiore. 

* **Fonte ufficiale:** [Whonix Monero Wallet Isolation](https://www.whonix.org/wiki/Monero_Wallet_Isolation)

---

## Introduzione

`monerod` è il demone di Monero, un processo in background che verifica l'intera blockchain scaricandola e verificandola. 

* **Vantaggio di questa configurazione:** se dovesse verificarsi una vulnerabilità che consente a un malware di sfruttare `monerod`, tutti i fondi dell'utente rimarranno al sicuro, poiché isolati all'interno di un'altra macchina virtuale (VM) dedicata al wallet.
* **Schema di connessione:** 
  $$\text{Monero Wallet} \rightarrow \text{Qubes RPC} \rightarrow \text{monerod} \rightarrow \text{Tor} \rightarrow \text{Rete Monero}$$


---

## Prerequisiti e Conoscenze Richieste

Questa configurazione è complessa e destinata a utenti avanzati. Si consiglia di:
* Acquisire familiarità con l'uso standard di Monero.
* Testare preventivamente la procedura con piccole somme o sulla testnet di Monero.
* Avere una conoscenza di base di:
  1. Monero Wallet GUI / CLI.
  2. Funzionamento di `monerod` e interpretazione dei log.
  3. Utilizzo di `systemd` per il debug.

---

## Configurazione

### 1. Configurazione di Qubes dom0 (Creazione App Qubes)

In `dom0`, creare le seguenti App Qubes:

* **Qube per il Wallet (`monero-wallet-ws`):**
  * **Tipo:** Application Qube basata su Whonix-Workstation.
  * **Nome:** `monero-wallet-ws`.
  * **Connessione di rete:** Nessuna (`none`).
* **Qube per il Demone (`monerod-ws`):**
  * **Tipo:** Application Qube basata su Whonix-Workstation.
  * **Nome:** `monerod-ws`.
  * **Connessione di rete:** Selezionare il ProxyVM Whonix-Gateway desiderato (es. `sys-whonix`).
  * **Spazio di archiviazione privato:** Impostare almeno `200GiB` per contenere la blockchain.

### 2. Configurazione delle Policy Qrexec

1. Aprire il *Qubes Policy Editor* da `dom0`.
2. Creare un nuovo file di configurazione (es. `20-user`).
3. Inserire la seguente regola per autorizzare la connessione di rete dal wallet al demone:
   ```text
   qubes.ConnectTCP +18081 monero-wallet-ws monerod-ws allow


4. Salvare e chiudere.

---

## Riferimenti

* Guida completa e passaggi avanzati di configurazione dei servizi: [Documentazione Ufficiale Whonix](https://www.whonix.org/wiki/Monero_Wallet_Isolation?utm_source=gemini).

