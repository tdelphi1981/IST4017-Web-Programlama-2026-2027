# Hafta 1 — Kod Örnekleri

Bu klasör dersin ilk haftası için yalnızca **bash/curl betikleri**, **ham
HTTP metin dosyaları** ve tek bir **Python soket istemcisi** içerir.
`istemci/`/`sunucu/` klasörü bu hafta yoktur (Hf.3 ve Hf.6'da başlar).
Tüm betikler herkese açık, kararlı test servislerine (`https://example.com`,
`https://httpbin.org`) istek atar; internet bağlantısı yoksa betikler
çökmez, okunabilir bir `HATA: ...` mesajı basıp devam eder/çıkar.

## Dosyalar

| Dosya | Ne yapar | Nasıl çalıştırılır |
|---|---|---|
| `dns-port-kesif.sh` | `dig` (Windows'ta `nslookup`) ile `www.example.com` adresini IP'ye çözümler; ardından `curl -v` çıktısında bağlanılan `IP:port` satırını gösterir. | `bash dns-port-kesif.sh` |
| `statik-dinamik-istek.sh` | `https://example.com/` adresine (statik) iki kez, `https://httpbin.org/uuid` adresine (dinamik) iki kez istek atar; statik cevabın birebir aynı, dinamik cevabın farklı olduğunu karşılaştırıp raporlar. | `bash statik-dinamik-istek.sh` |
| `http-istek-anatomisi.sh` | `curl -v --http1.1` ile `httpbin.org/get` adresine tam bir `GET` isteğinin giden (`>`) ve gelen (`<`) başlıklarını gösterir; ardından JSON gövdeli bir `POST` isteği yapıp `httpbin.org/post`'un gövdeyi yansıttığı cevabı basar. | `bash http-istek-anatomisi.sh` |
| `dns-port-kesif.ps1` | `dns-port-kesif.sh`'in PowerShell sürümü; DNS çözümlemeyi `Resolve-DnsName` (yoksa .NET `Dns` sınıfı) ile yapar, port gözlemi için yine `curl.exe -v` kullanır. | `powershell -ExecutionPolicy Bypass -File .\dns-port-kesif.ps1` |
| `statik-dinamik-istek.ps1` | `statik-dinamik-istek.sh`'in PowerShell sürümü; istekleri `Invoke-WebRequest` ile atar, aynı karşılaştırmayı raporlar. | `powershell -ExecutionPolicy Bypass -File .\statik-dinamik-istek.ps1` |
| `http-istek-anatomisi.ps1` | `http-istek-anatomisi.sh`'in PowerShell sürümü; `GET` başlıkları için `curl.exe -v`, JSON gövdeli `POST` için `Invoke-RestMethod` kullanır. | `powershell -ExecutionPolicy Bypass -File .\http-istek-anatomisi.ps1` |
| `ornek-istek.http` | Elle yazılmış, ham bir HTTP `GET` isteği metni (istek satırı + `Host`/`User-Agent`/`Accept` başlıkları + boş satır). Çalıştırılmaz, yalnız okunur/alıntılanır. | — |
| `ornek-cevap.http` | Elle yazılmış, ham bir HTTP `200 OK` cevabı metni (durum satırı + `Content-Type`/`Content-Length` başlıkları + boş satır + kısa JSON gövde). Çalıştırılmaz, yalnız okunur/alıntılanır. | — |
| `soket-istemci.py` | `socket` modülüyle `example.com:80` adresine ham bir TCP bağlantısı açar, elle oluşturulmuş bir HTTP `GET` isteğini gönderir, sunucudan gelen ham cevabı (durum satırından gövdeye kadar) olduğu gibi ekrana basar. | `python3 soket-istemci.py` |

## Beklenen çıktılar (özet)

- **`dns-port-kesif.sh`**: `www.example.com` için çözümlenmiş bir IPv4
  adresi (`dig +short` çıktısı) ve `curl -v` çıktısında
  `Connected to www.example.com (IP) port 443` benzeri bir satır.
- **`statik-dinamik-istek.sh`**: "Statik cevap iki istekte de BIREBIR AYNI"
  ve "Dinamik cevap iki istekte FARKLI" mesajları — iki `httpbin.org/uuid`
  cevabı farklı UUID içerir.
- **`http-istek-anatomisi.sh`**: `> GET /get HTTP/1.1` ile başlayan giden
  başlıklar, `< HTTP/1.1 200 OK` ile başlayan gelen başlıklar; `POST`
  örneğinde `httpbin.org`'un gönderilen JSON'u `"json"` alanında aynen
  yansıttığı cevap.
- **`soket-istemci.py`**: `HTTP/1.1 200 OK` durum satırıyla başlayan,
  başlıkları ve ardından (chunked) HTML gövdesini içeren ham bir HTTP
  cevabı — `curl -v`'nin gösterdiğiyle aynı anatominin "elle" üretilmiş
  hâli.

## Notlar

- Ekstra paket kurulumu gerekmez; yalnız sistemde hazır gelen `curl`,
  `dig`/`nslookup` ve Python 3'ün standart `socket` modülü kullanılır.
- Betikler `set -e` KULLANMAZ; ağ hatası durumunda kontrollü bir `HATA:`
  mesajı basıp devam eder/çıkar, betiği aniden sonlandırmaz.
- Her bash betiğinin aynı adlı bir `.ps1` (PowerShell) sürümü vardır; aynı
  bölüm yapısını (`BEGIN`/`END` işaretleri) ve aynı `HATA:` davranışını
  korur. Windows PowerShell 5.1 ve PowerShell 7 (`pwsh`, macOS/Linux dahil)
  ile çalışır; `curl.exe` Windows 10 1803+ ile hazır gelir.
- `ornek-istek.http`/`ornek-cevap.http` dosyaları çalıştırılabilir kod
  değildir; ders notunda/lab föyünde `terminal`/`ciktikutusu` ortamıyla
  bütün olarak alıntılanmak üzere hazırlanmıştır.
