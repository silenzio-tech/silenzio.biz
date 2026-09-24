+++
title = "Monero Wallet Isolation in Qubes-Whonix"
date = 2026-09-23
draft = false
tags = ["monero", "whonix", "qubes", "privacy", "sicurezza"]
categories = ["guide"]
+++

![Monero Whonix](/images/grey-monero-whonix.webp)

This guide explains how to isolate the network part (`monerod`) from the wallet part (Monero Wallet) to obtain superior security.

* **Official source:** [Whonix Monero Wallet Isolation](https://www.whonix.org/wiki/Monero_Wallet_Isolation)

---

## Introduction

`monerod` is the Monero daemon, a background process that downloads and verifies the entire blockchain.

* **Advantage of this setup:** Should a vulnerability arise that allows malware to exploit `monerod`, all user funds will remain safe, as they are isolated within another virtual machine (VM) dedicated to the wallet.
* **Connection diagram:**
$$\text{Monero Wallet} \rightarrow \text{Qubes RPC} \rightarrow \text{monerod} \rightarrow \text{Tor} \rightarrow \text{Monero Network}$$

---

## Prerequisites and Required Knowledge

This setup is complex and intended for advanced users only. It is recommended to:
* Become familiar with standard Monero usage.
* Test the procedure beforehand with small sums or on the Monero testnet.
* Have a basic understanding of:
  1. Monero Wallet GUI / CLI.
  2. Operation of `monerod` and log interpretation.
  3. Using `systemd` for debugging.

---

## Setup

### 1. Configuration of Qubes dom0 (Qubes App Creation)

In `dom0`, create the following App Qubes:

* **Qube for the Wallet (`monero-wallet-ws`):**
  * **Type:** Application Qube based on Whonix-Workstation.
  * **Name:** `monero-wallet-ws`.
  * **Network connection:** None (`none`).
* **Qube for the Daemon (`monerod-ws`):**
  * **Type:** Application Qube based on Whonix-Workstation.
  * **Name:** `monerod-ws`.
  * **Network Connection:** Select the desired Whonix-Gateway ProxyVM (e.g. `sys-whonix`).
  * **Private Storage:** Set at least `200GiB` to hold the blockchain.

### 2. Configuration of Qrexec Policies

1. Open the *Qubes Policy Editor* from `dom0`.
2. Create a new configuration file (e.g. `20-user`).
3. Enter the following rule to authorize the network connection from the wallet to the daemon:
   ```text
   qubes.ConnectTCP +18081 monero-wallet-ws monerod-ws allow



4. Save and close.

---

## References

* Complete guide and advanced service configuration steps: [Whonix Official Documentation](https://www.whonix.org/wiki/Monero_Wallet_Isolation?utm_source=gemini)

