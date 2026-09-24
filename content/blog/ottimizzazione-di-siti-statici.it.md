---
title: "Ottimizzazione di Siti Statici per Tor: Guida Tecnica a Hugo per la Rete Onion"
date: 2026-09-14
draft: false
tags: ["tor", "hugo", "privacy", "security", "darkweb"]
---
![Ottimizzazioni su Tor](/images/grey-ottimizzazione-hugo.webp)
**Architettura Minimalista: Ottimizzare Hugo per la Rete Tor**

La rete Tor impone vincoli rigidi in termini di latenza e ampiezza di banda. L'adozione di un generatore di siti statici come Hugo elimina i tempi di elaborazione lato server e minimizza la quantità di dati scambiati sui circuiti onion, garantendo velocità massima e superficie di attacco ridotta.

Questo articolo raccoglie le ottimizzazioni applicate a un sito statico pubblicato come hidden service. L'obiettivo è duplice: offrire ai visitatori un'esperienza di navigazione rapida anche su relay congestionati, e ridurre al minimo le informazioni esposte a crawler, analizzatori di traffico e potenziali attaccanti.

**1. Configurazione del file `hugo.toml`**

L'obiettivo primario nel file di configurazione è generare un output completamente autonomo, privo di riferimenti ad asset esterni o percorsi assoluti problematici.

* **Indirizzamento Relativo:**
  ```toml
  baseURL = "http://silenzio.onion/"
  relativeURLs = true
  canonifyURLs = false
  ```
  L'impostazione `relativeURLs = true` garantisce che tutti i collegamenti a risorse (CSS, immagini, pagine interne) vengano generati come percorsi relativi. Ciò impedisce leak di dominio o problemi di caricamento se l'indirizzo `.onion` cambia o se il sito viene visitato tramite proxy locale. Imposta inoltre `canonifyURLs = false` per evitare che Hugo riscriva i percorsi in URL assoluti.

* **Hardening e Riduzione del Fingerprinting:**
  ```toml
  disableHugoGeneratorInject = true
  ```
  Disabilita l'iniezione automatica del tag `<meta name="generator" content="Hugo X.Y.Z">` nell'intestazione HTML, evitando di esporre la versione esatta del software utilizzata e riducendo le informazioni disponibili ai crawler.

* **Disattivazione delle Tassonomie Non Utilizzate:**
  ```toml
  disableKinds = ["taxonomy", "term"]
  ```
  Se il sito non richiede la categorizzazione per tag o autori, la disattivazione delle tassonomie riduce il numero di file HTML generati, diminuendo i tempi di build e la dimensione complessiva della directory distribuita.

**2. Architettura dei Layout: HTML, CSS e Asset**

Su Tor Browser, ogni singola richiesta HTTP aggiuntiva comporta un tragitto attraverso tre nodi crittografati, introducendo latenza evidente. Ogni round-trip completo attraverso la rete causa ritardi tangibili nel rendering della pagina.

* **Zero Dipendenze Esterne:**
  Non utilizzare mai risorse ospitate su CDN esterne (come Google Fonts, FontAwesome, librerie JavaScript o icone remote). Qualsiasi chiamata verso l'esterno rompe l'isolamento dell'Hidden Service e può causare leak IP lato client. Tutti i font e le icone devono essere integrati localmente come file SVG leggeri o font di sistema standard (`system-ui`, `sans-serif`, `serif`).

* **Inlining del CSS:**
  Anziché collegare un file `.css` esterno con un tag `<link rel="stylesheet">`, inserisci gli stili essenziali direttamente all'interno dei tag `<style>` nell'intestazione `<head>` del template base (`baseof.html`):
  ```html
  <style>
    {{ readFile "assets/css/main.css" | safeCSS }}
  </style>
  ```
  In questo modo la pagina viene resa con una sola richiesta HTTP.

* **Architettura "No-JS":**
  Progetta i layout affinché siano perfettamente leggibili e navigabili senza JavaScript. Molti utenti Tor navigano con Tor Browser impostato sui livelli di sicurezza *Safer* o *Safest*, che disabilitano completamente gli script. Evita menu a tendina basati su JS; utilizza costrutti CSS puri (es. `:focus`/`:hover` o `:checked`) se strettamente necessari. Attenzione anche al livello *Safest*, che disabilita parte dei font, delle icone e dei simboli matematici: usa sempre SVG inline per le icone e affianca un'etichetta testuale, così che la semantica non si perda se l'icona non viene renderizzata.

**3. Ottimizzazione e Sanificazione delle Immagini**

I file multimediali rappresentano la quota principale di banda consumata durante la navigazione. Ridurre l'impronta di ogni risorsa visiva è indispensabile per mantenere prestazioni elevate.

* **Formato WebP e Compressione Aggressiva:**
  Converti tutte le immagini nel formato WebP, che garantisce un risparmio di peso compreso tra il 25% e il 35% rispetto a JPEG o PNG a parità di qualità percepita. Ridimensiona ogni immagine alla risoluzione effettiva di visualizzazione prima dell'inserimento nel progetto.

* **Rimozione dei Metadati (EXIF Strip):**
  Prima di inserire qualsiasi immagine nella cartella `static/` o `assets/`, sanifica i file rimuovendo integralmente i metadati EXIF (coordinate GPS, modello fotocamera, timestamp). Esempio di sanificazione da riga di comando con ImageMagick:
  ```bash
  magick convert input.png -strip -quality 80 output.webp
  ```

* **Payload Target:**
  Mantieni il peso totale di una singola pagina (HTML + stili + immagini) sotto i 100 KB. Un footprint così ridotto permette il rendering quasi istantaneo anche su relay Tor congestionati.

**4. Workflow di Build e Deploy**

Per mantenere il workflow pulito e automatizzato, è opportuno gestire la compilazione e la pulizia degli asset tramite riga di comando.

* **Comando di Build di Produzione:**
  ```bash
  hugo --minify --gc
  ```
  I flag `--minify` e `--gc` garantiscono la compressione dell'HTML e la rimozione delle risorse non utilizzate dalla cache durante la generazione della cartella `public/`. Per una compressione ancora più aggressiva, verifica che in `hugo.toml` sia presente:
  ```toml
  [minify]
    minifyOutput = true

  [minify.tdewolff.html]
    keepWhitespace = false
    removeComments = true
  ```

* **Automazione via Script:**
  Raggruppa le fasi di sanificazione, build e deployment sul dispositivo di hosting in un unico script Bash da terminale, minimizzando la possibilità di errore umano.

* **Sicurezza del Build:**
  Hugo integra policy di sicurezza sandbox che limitano l'esecuzione di comandi esterni e il fetch HTTP remoto. Per un sito Tor conviene restringerle esplicitamente:
  ```toml
  [security]
    enableInlineShortcodes = false

  [security.exec]
    allow = []

  [security.http]
    urls = []
    methods = []
  ```
  In questo modo qualsiasi template che tenti di uscire dai limiti causa un fallimento del build con errore esplicito. Tieni inoltre `go.sum` sotto controllo di versione: una mancata corrispondenza dei checksum durante il build interrompe immediatamente la compilazione, offrendo una semplice difesa contro il dependency poisoning.

**Considerazioni Finali**

L'ottimizzazione di un sito statico per la rete Tor non è un'operazione una tantum, ma un insieme di scelte coerenti che attraversano l'intera pipeline di pubblicazione: dalla configurazione di Hugo alla struttura dei layout, dalla sanificazione degli asset alla disciplina del build. Ogni richiesta HTTP risparmiata, ogni kilobyte eliminato, ogni metadato rimosso contribuisce a un'esperienza più rapida per il visitatore e a una superficie informativa più ridotta verso l'esterno.

La rete onion non è soltanto un canale di pubblicazione alternativo: è uno spazio in cui la leggerezza del codice diventa essa stessa una forma di rispetto per chi lo attraversa. Un sito statico ben ottimizzato, privo di dipendenze superflue e costruito attorno ai bisogni reali dei suoi lettori, è un piccolo contributo alla sostenibilità di quello spazio.

