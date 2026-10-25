# Hafta 6 — Kod Örnekleri (FastAPI I: HTTP'yi Koda Dökmek)

Bu klasör kitaptaki İLK gerçek sunucudur: Etkinlik/Koltuk/Bilet için
bellekte (kalıcı olmayan) CRUD API'si. Ön yüz (`kod_ornekleri/hafta05/
istemci/`) bu hafta DOKUNULMAMIŞTIR ve bu sunucuya BAĞLI DEĞİLDİR
(bağlantı Hf.7'nin konusudur). Sunucu SÜREÇ kapandığında (`--reload`
dahil) tüm veri KAYBOLUR — kalıcılık Hf.8'in konusudur.

## Dosya / etiket tablosu

| Dosya | İçerik | Etiketler |
|---|---|---|
| `requirements.txt` | Çalışma zamanı bağımlılıkları | `calisma_zamani_bagimliliklari` |
| `requirements-dev.txt` | Geliştirme/test bağımlılıkları (`-r requirements.txt` + `pytest`/`httpx`) | `gelistirme_bagimliliklari` |
| `app/__init__.py` | Boş (paket işaretçisi) | — |
| `app/modeller.py` | `KamelModel` taban sınıfı; `EtkinlikOlustur`/`Etkinlik`; `KoltukDurumu`/`KoltukOlustur`/`Koltuk`/`KoltukGuncelle`; `BiletDurumu`/`BiletOlustur`/`Bilet` | `model_taban_sinifi`, `etkinlik_modelleri`, `koltuk_modelleri`, `bilet_modelleri` |
| `app/depo.py` | `Depo` sınıfı (üç `dict[int, ...]` + sayaçlar, CRUD metotları) + tekil `depo` nesnesi | `depo_sinifi`, `depo_ornegi` |
| `app/bagimliliklar.py` | `get_depo()` bağımlılık fonksiyonu | `get_depo_bagimliligi` |
| `app/rotalar/__init__.py` | Boş (paket işaretçisi) | — |
| `app/rotalar/etkinlikler.py` | Etkinlik CRUD rotaları | `etkinlikler_router`, `etkinlik_liste`, `etkinlik_detay`, `etkinlik_olustur`, `etkinlik_guncelle`, `etkinlik_sil` |
| `app/rotalar/koltuklar.py` | Koltuk CRUD rotaları | `koltuklar_router`, `koltuk_olustur`, `koltuk_liste`, `koltuk_detay`, `koltuk_durum_guncelle`, `koltuk_sil` |
| `app/rotalar/biletler.py` | Bilet CRUD rotaları + koltuk rezervasyonu iş kuralı | `biletler_router`, `bilet_olustur`, `bilet_liste`, `bilet_detay`, `bilet_iptal` |
| `app/main.py` | `FastAPI` nesnesi, kök rota, router bağlama | `uygulama_olustur`, `kok_rota`, `router_baglama` |
| `tests/conftest.py` | `client` fixture'ı (her testte temiz `Depo`) | `test_istemci_fixture` |
| `tests/test_etkinlikler.py` | Etkinlik rota testleri | `test_etkinlik_olustur_listele`, `test_etkinlik_mekan_filtre`, `test_etkinlik_bulunamadi_404`, `test_etkinlik_guncelle_sil`, `test_etkinlik_dogrulama_422` |
| `tests/test_biletler.py` | Bilet rota testleri | `test_bilet_basarili_rezervasyon`, `test_bilet_coklu_rezervasyon_409`, `test_bilet_olmayan_koltuk_404`, `test_bilet_iptal` |
| `istekler.sh` | Hf.1 biçiminde `curl` turu | `sunucu_calistirma_notu`, `etkinlik_olustur_curl`, `etkinlik_listele_curl`, `koltuk_olustur_curl`, `bilet_olustur_curl`, `bilet_carpisma_409_curl`, `etkinlik_sil_curl` |

Tüm etiket adları `brifler/hafta06-brif.md`'deki "Dosyalar ve etiketler"
tablosuyla BİREBİR aynıdır; hiçbir etiket iç içe değildir (44 kod
dosyası etiketi + 2 bağımlılık dosyası etiketi = 46, hepsi `# BEGIN x`/
`# END x` çiftiyle eşleşir).

## Kurulum

Bu hafta Python **3.12** (asgari) gerektirir. Makinede `python3` 3.11
olabilir; bu durumda `python3.12` (ör.
`/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12`)
kullanılarak sanal ortam kurulur:

```bash
cd kod_ornekleri/hafta06/sunucu
python3.12 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt -r requirements-dev.txt
```

## Çalıştırma

```bash
uvicorn app.main:app --reload
```

Sunucu `http://127.0.0.1:8000` adresinde dinlemeye başlar. Ayrı bir
terminalde `bash istekler.sh` çalıştırılarak Hf.1 biçiminde bir `curl`
turu yapılabilir. Tarayıcıda `http://127.0.0.1:8000/docs` (Swagger UI)
ve `http://127.0.0.1:8000/openapi.json` ile TÜM rotalar/şemalar
incelenebilir.

## Testler

```bash
python -m pytest -q
```

## Beklenen çıktılar (özet)

- `curl -i http://127.0.0.1:8000/` → `200 OK`, hoş geldin JSON'u.
- `curl -i http://127.0.0.1:8000/etkinlikler/abc` → `422 Unprocessable
  Entity` (yol EŞLEŞİYOR, yalnız parametrenin TİPİ uymuyor — `404`
  DEĞİL).
- `POST /etkinlikler` → `201 Created` (id atanmış tam nesne, camelCase
  alanlarla: `biletFiyati` vb.).
- Negatif `kapasite` ile `POST /etkinlikler` → `422`, `detail[0].loc ==
  ["body", "kapasite"]`.
- `POST /etkinlikler/{id}/koltuklar` → `201 Created`.
- `POST /biletler` (boş koltuğa) → `201 Created`, koltuk `dolu` olur.
- AYNI koltuğa İKİNCİ `POST /biletler` → `409 Conflict`, `detail`: "Bu
  koltuk zaten satılmış".
- `DELETE /biletler/{id}` → `204 No Content`, bilet `iptal` olur, ilgili
  koltuk yeniden `bos` olur.
- `DELETE /etkinlikler/{id}` → `204 No Content`; sonraki `GET` → `404`.
- `python -m pytest -q` → **9/9 test geçer** (5 etkinlik + 4 bilet).

## Doğrulama kanıtı (bu ortamda, 2026-09-07)

```
$ python3.12 -m venv .venv && source .venv/bin/activate
$ pip install -r requirements.txt -r requirements-dev.txt
... Successfully installed fastapi-0.141.1 ... pydantic-2.13.5 ...
    uvicorn-0.52.4 ... pytest-9.1.1 ... httpx-0.28.1 ...

$ python -m pytest -q
.........
9 passed, 2 warnings in 0.03s
```

(İki uyarı `starlette`/`httpx` kütüphanelerinin kendi iç
`DeprecationWarning`'leridir — `TestClient`'ın `httpx` ile kullanımını
gelecekte `httpx2`'ye taşımayı önerir; bu haftanın brifçe sabitlenen
sürümleriyle (httpx `~=0.28`) ilgilidir, bizim kodumuzdan KAYNAKLANMAZ
ve testleri ETKİLEMEZ.)

Sunucu arka planda başlatılıp gerçek `curl` istekleriyle doğrulanmıştır
(`uvicorn app.main:app --port 8010`):

```
== kok ==
HTTP 200
{"mesaj":"KTÜ Etkinlik ve Bilet Sistemi API'sine hoş geldiniz"}
== 422 yol param ==
HTTP 422
== etkinlik olustur (201) ==
HTTP 201
{"baslik":"Konser","tarih":"2026-11-14","mekan":"KTÜ Kültür Merkezi","kapasite":100,"biletFiyati":250.0,"id":1}
== etkinlik listele (200) ==
HTTP 200
[{"baslik":"Konser", ... "id":1}]
== 422 negatif kapasite ==
HTTP 422
{"detail":[{"type":"greater_than","loc":["body","kapasite"],"msg":"Input should be greater than 0","input":-3,"ctx":{"gt":0}}]}
== koltuk olustur (201) ==
HTTP 201
{"sira":1,"koltukNo":5,"id":1,"etkinlikId":1,"durum":"bos"}
== bilet olustur (201) ==
HTTP 201
{"koltukId":1,"kullaniciAdi":"Ayşe Yılmaz","id":1,"satinAlmaZamani":"2026-09-07T11:40:23.140544","durum":"olusturuldu"}
== bilet coklu (409) ==
HTTP 409
{"detail":"Bu koltuk zaten satılmış"}
== bilet iptal (204) ==
HTTP 204
== etkinlik sil (204) ==
HTTP 204
== etkinlik sonra 404 ==
HTTP 404
{"detail":"Etkinlik bulunamadı"}
== /docs ==
HTTP 200
== openapi.json Bilet şeması alanları ==
['koltukId', 'kullaniciAdi', 'id', 'satinAlmaZamani', 'durum']
```

`openapi.json`'daki `Bilet` şemasının alan adları (camelCase) Hf.3'ün
`interface Bilet { id, koltukId, kullaniciAdi, satinAlmaZamani, durum }`
tanımıyla BİREBİR örtüşür.

## Doğrulanan sürümler (bu ortamda, 2026-09-07)

| Paket | Brifte sabitlenen | Bu ortamda kurulan |
|---|---|---|
| Python | 3.12 (asgari) | `3.12.6` |
| fastapi | `~=0.141` | `0.141.1` |
| pydantic | `~=2.13` | `2.13.5` |
| uvicorn (`[standard]`) | `~=0.52` | `0.52.4` |
| pytest | `~=9.1` | `9.1.1` |
| httpx | `~=0.28` | `0.28.1` |

## Notlar

- `.venv/`, `__pycache__/`, `.pytest_cache/` commit'lenmez (bkz.
  `kod_ornekleri/.gitignore`).
- Cascade silme YOKTUR: bir `Etkinlik` silindiğinde bağlı `Koltuk`/
  `Bilet` kayıtları depoda DEĞİŞMEDEN kalır (bilinçli sınır, Hf.8'in
  konusu).
- `tests/test_biletler.py` içindeki `_etkinlik_ve_koltuk_olustur`
  yardımcı fonksiyonu ETİKETSİZDİR (ders notuna kesit olarak çekilmez);
  yalnızca testler arası tekrarı azaltan bir kurulum yardımcısıdır.
- `tests/conftest.py`'deki `client` fixture'ı, HER test için TEK bir
  `Depo()` nesnesi oluşturup `dependency_overrides`'ı bu SABİT nesneye
  bağlar (`lambda: test_depo`) — `lambda: Depo()` yazılsaydı FastAPI'nin
  HER istekte bağımlılığı yeniden çağırması nedeniyle her istek KENDİ
  TAZE deposunu görür, aynı test içindeki `POST`/`GET` çiftleri
  birbirinin verisini GÖRMEZDİ.
