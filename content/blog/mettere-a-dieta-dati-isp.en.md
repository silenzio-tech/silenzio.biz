+++
title = "Putting your ISP on a diet: DNS-over-TLS, nftables, and isolated routing on the Tor network"
date = 2026-09-15T10:00:00+02:00
draft = false
tags = ["arch-linux", "dns-over-tls", "nftables", "quad9", "tor", "privacy", "bash"]
categories = ["Sysadmin"]
summary = "Complete guide to securing DNS queries on Arch Linux: DoT encryption with systemd-resolved, preventive filtering via nftables and dynamic switch to the local Tor resolver."
+++


![DNS over TLS](/images/grey-dns-over-tls.webp)
Every time you type a web address or start a network service, the first invisible operation performed by the system is DNS resolution. By default, most operating systems send these requests in clear text to the Internet Service Provider (ISP) resolver on the port`53/UDP`. The result is systematic tracking: the ISP can record, analyze and keep the entire log of visited domains, even if subsequent application traffic is protected by HTTPS encryption.

To neutralize this passive surveillance at the transport layer, a three-layer strategy must be implemented: **encrypt ordinary queries** (DNS-over-TLS), **prevent plaintext data leaks at the kernel level** (`nftables`) and **route sensitive queries directly into the Tor network**.

---

### 1. Basic encryption: DNS-over-TLS with`systemd-resolved`The first step to eliminating ISP tracking is to encrypt ordinary resolution requests. The use of`systemd-resolved`in combination with a privacy-friendly provider (such as Quad9) it allows DNS traffic to be conveyed within a TLS encrypted channel on the port`853/TCP`.

Configure the file`/etc/systemd/resolved.conf`:

```ini
[Resolve]
DNS=9.9.9.9#dns.quad9.net 149.112.112.112#dns.quad9.net 2620:fe::fe#dns.quad9.net
FallbackDNS=1.1.1.1#cloudflare-dns.com
DNSOverTLS=yes
DNSSEC=yes
Cache=yes

```

#### Configuration operational details:

* **SNI and TLS validation (`#dns.quad9.net`):** The system does not just send encrypted packets, but verifies the identity of the remote server by checking its X.509 certificate before sending data.
* **DNSSEC:** Ensures that received responses have not been tampered with along the way (preventing cache poisoning attacks).

After the change, apply the settings and check the activation of the DoT channel:

```bash
sudo systemctl restart systemd-resolved
resolvectl status

```

---

### 2. Network armoring: strict blocking of leaks on port 53 via`nftables`The configuration of the system resolver alone does not guarantee the total absence of leaks. Malicious applications, unchecked scripts, or binaries with built-in resolvers may attempt to bypass`systemd-resolved``53/UDP`or`53/TCP`.

To avoid any metadata leak to the ISP, a restrictive policy is applied via`nftables`on the chain of`output`:

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

Thanks to this structure, the kernel filtering infrastructure decides on interception and discarding (`drop`) of each clear packet directed outward on port 53.

---

### 3. Advanced routing: Dynamic switch to Tor's local DNS listener

In highly confidential operating sessions, sending DNS requests to public resolvers (albeit encrypted via TLS) still exposes the client's IP address to the centralized resolver tables. To achieve full anonymization of resolution metadata, queries must be processed directly by nodes in the Tor network.

#### A. Configuring the Tor daemon (`/etc/tor/torrc`)

Enable Tor's internal DNS listener on the local loopback port:

```ini
DNSPort 127.0.0.1:5353
AutomapHostsOnResolve 1
AutomapHostsSuffixes .onion,.exit

```

#### B. Automating the switch via shell aliases (`~/.bashrc`)

To quickly switch your network environment between ordinary encrypted mode (DoT Quad9) and isolated anonymous mode (Tor DNS), define the following aliases in your shell configuration file:

```bash
# Attiva l'instradamento DNS esclusivo su rete Tor
alias tordns-on='sudo resolvectl dns wlan0 127.0.0.1:5353 && sudo resolvectl domain wlan0 "~." && echo "[+] DNS di sistema reindirizzato su Tor (127.0.0.1:5353)"'

# Ripristina il resolver di sistema standard cifrato (DoT Quad9)
alias tordns-off='sudo resolvectl revert wlan0 && echo "[+] DNS di sistema ripristinato su Quad9 (DoT)"'

```

*Note: Replace`wlan0`with your network interface active.*

---

### Security architecture comparison

| Parameter / Level | Standard DNS (ISP) | DNS-over-TLS (Quad9) | Tor DNS Listener (Local) |
| --- | --- | --- | --- |
| **Transport Port** |`53/UDP`or`53/TCP`|`853/TCP`|`5353/UDP`(Loopback) |
| **Visibility to ISP** | Total (plain text) | None (encrypted traffic) | None (traffic within the Tor network) |
| **Client IP Protection** | Absent | None (IP sends queries to resolver) | High (IP is hidden by the node network) |
| **Leak Protection (`nftables`)** | Vulnerable | Guaranteed (door lock 53) | Guaranteed (door lock 53 + loopback isolation) |
| **Ideal use case** | None (to be avoided) | Ordinary browsing, streaming, updates | Confidential research, threat-intel analysis, services`.onion`|

Putting your ISP on a diet means eliminating the metadata generated by your network interface. The combination of TLS encryption, native filtering in the kernel, and dynamic switching to Tor transforms the system resolver into a resilient infrastructure with no data loss points.
