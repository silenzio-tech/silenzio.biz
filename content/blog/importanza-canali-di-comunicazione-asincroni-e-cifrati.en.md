---
title: "The Importance of Asynchronous and Encrypted Communication Channels"
date: 2026-09-15T09:30:00+02:00
draft: false
tags: ["pgp", "tor", "privacy", "briar", "security"]
categories: ["Cryptography"]
---
![cifratura](/images/grey-cifratura.webp)
Contemporary mass surveillance is largely based on the centralization of metadata and the analysis of traffic patterns in real time. Traditional communication channels — and even encrypted but centralized instant messaging platforms — inevitably reveal *who* talks to *whom*, *when*, and how *frequently*.

In this scenario, resilience is not achieved by relying on a single tool, but by combining complementary strategies for the asynchronous (email) and synchronous/p2p channels.

### 1. Email and asynchronous encryption (OpenPGP)

Email remains one of the longest-running and most stable federated and asynchronous protocols. The recipient does not have to be online at the time the message is sent, making the communication resistant to temporary network interruptions.

* **Content inviolability:** The use of OpenPGP keys (via GPG) guarantees that the message body is end-to-end encrypted on the sender’s device and decrypted exclusively by the recipient.
* **Authenticity and non-repudiation:** The digital signature via private key ensures the integrity of the text and the identity of the author, neutralizing *man-in-the-middle* attacks.
* **Structural limitation:** Email metadata (headers, sender, recipient, time and subject) remains visible to MTAs (Mail Transfer Agents) along the delivery route, requiring additional network-level safeguards to hide the source (e.g. sending via Tor exit nodes).

### 2. Peer-to-peer messaging on the Tor network (e.g. Briar)

For direct communication or short-term messaging, centralizing the infrastructure represents a Single Point of Failure.

* **Central Server-Free Architecture:** Tor-based P2P clients do not connect to proprietary servers. Messages pass directly from one node to another on the network via hidden services (`.onion`), eliminating the presence of intermediaries capable of storing or selling connection logs.
* **Metadata anonymization:** By encapsulating traffic within Tor circuits, the geographic origin, IP address, and topology of relationships between conversation nodes is hidden.
* **Offline resilience:** Architectures like Briar’s support the transit of messages even outside the internet, using localized meshes via Bluetooth or Wi-Fi for synchronization upon reconnection.

---

### Brief comparison of the models

| Properties | OpenPGP/GPG (Email) | P2P on Tor network (e.g. Briar) |
| :--- | :--- | :--- |
| **Delivery model** | Asynchronous (Store-and-Forward) | Synchronous / Direct P2P |
| **Content Protection** | Public key encryption | Native end-to-end encryption |
| **Metadata Protection** | Partial (requires anonymous transport networks) | High (obscured by Tor nodes) |
| **Infrastructure Dependency** | Federated SMTP/IMAP servers | None (client-to-client) |
| **Ideal use case** | Formal communications, deferred documents | Confidential high-stick conversations |

The integration of these two paradigms makes it possible to cover the entire spectrum of operational needs: encrypted email guarantees the persistence and asynchronicity necessary for complex documents and texts; P2P on the Tor network offers maximum confidentiality for the immediate exchange of information, minimizing the attack surface exposed to passive surveillance.
