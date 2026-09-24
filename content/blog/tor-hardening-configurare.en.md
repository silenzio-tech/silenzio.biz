---
title: "Tor Hardening: Configuring Lighttpd on Android to Serve a Hidden Service"
date: 2026-09-14
draft: false
tags: ["tor", "Lighttpd", "privacy", "security", "darkweb", "Tor Hardening"]
---
![Lighttpd](/images/grey-lighttpd-web-server.webp)

### Tor Hardening: Configuring Lighttpd on Android to Serve a Hidden Service

Configuring a local web server on an Android environment (via suites like KSWEB) to host a hidden service on the Tor network requires specific precautions to avoid tracking, prevent data leakage and optimize the use of the mobile device's hardware resources.

The structure of a **Lighttpd** configuration optimized to guarantee anonymity, stability and security is analyzed below.

---

### Applied Hardening Strategies

* **Interface Isolation (`server.bind = "127.0.0.1"`):** Forces the server to listen exclusively on the local loopback interface. This prevents direct access to the web server by other devices connected to the same Wi-Fi/LAN network, routing traffic solely through the Tor daemon.
* **Server Identity Masking (`server.tag = "nginx"`):** Overrides the `Server` HTTP header by replacing the native Lighttpd version string with a generic one for Nginx. This measure hinders profiling (fingerprinting) of the software stack by an external attacker.
* **Removal of tracking and proxy headers (`setenv.set-request-header`):** Clears potentially dangerous HTTP headers (`Forwarded`, `X-Forwarded-For`, `X-Real-IP`) that may convey the real IP address or network location details.
* **ETag Management and Caching (`etag.use` and `set-response-header`):** Disables ETag generation and overrides the ETag response header to an empty value (`"ETag" => ""`) to prevent user tracking based on browser cached resources.
* **Resource minimization and restrictive timeouts:** Limit the number of concurrent connections (`server.max-connections = 512`) and set aggressive timeouts on *keep-alive* and *idle* connections to mitigate denial of service (DoS) attacks and preserve Android device RAM and battery.
* **Deactivation of unnecessary modules:** Keeps active only the modules that are strictly essential for loading a static site (`mod_staticfile`, `mod_setenv`, `mod_indexfile`), excluding dynamic scripts (`mod_fastcgi`, `mod_cgi`) and access logging (`mod_accesslog`) to guarantee zero persistence of visitor data.

---

### Complete Configuration File (`lighttpd.conf`)

```toml
########
# KSWEB System Settings (Do Not Remove)
#begin_docroot
server.document-root = "/storage/emulated/0/htdocs"
#end_docroot

#begin_port
server.port = "8000"
#end_port

# [TOR-HARDENING] Isolation on loopback interface (listening only from localhost/Tor)
server.bind = "127.0.0.1"

#begin_hosts
#end_hosts
########

server.errorlog = "/data/user/0/ru.kslabs.ksweb/components/log/lighttpd/lighttpd.log"

# [TOR-HARDENING] Disable directory listing
dir-listing.activate = "disable"

# [TOR-HARDENING] Mask lighttpd version
server.tag = "nginx"

# [TOR-HARDENING] Disable ETag generation
etag.use = ()

# [TOR-HARDENING] Disable HTTP/2 cleartext (h2c)
server.feature-flags += ( "server.h2c" => "disable" )

index-file.names = ("index.html", "index.htm", "index.php")

# Loading modules: mod_setenv at the bottom to process response headers
server.modules = (
    "mod_indexfile",
    "mod_access",
# [TOR-HARDENING] No access log on hidden service
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

# [TOR-HARDENING] Restrictive timeouts: reduce idle connections and CPU/RAM load
server.max-keep-alive-requests = 10
server.max-keep-alive-idle = 5
server.max-read-idle = 30
server.max-write-idle = 30
server.max-connections = 512
server.kbytes-per-second = 8192
connection.kbytes-per-second = 8192
server.protocol-http11 = "enable"

# [TOR-HARDENING] Active removal of forwarding headers
setenv.set-request-header = (
    "Forwarded" => "",
    "X-Forwarded-For" => "",
    "X-Forwarded-Proto" => "",
    "X-Real-IP" => ""
)

# [TOR-HARDENING] Forced overwriting of ETag header with empty value
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

### Test and Verification of Response

To verify the effectiveness of the configurations via a test client (e.g. `curl` routed via SOCKS5 Tor proxy):

```bash
curl -Iv -x socks5h://127.0.0.1:9052 http://<your-v3-address>.onion/

```

**Expected outcome in header dump:**

* Presence of `HTTP/1.1 200 OK`.
* Presence of `Server: nginx` (disguised real version).
* Complete absence of the `ETag` header and references to the local IP or Android system.

